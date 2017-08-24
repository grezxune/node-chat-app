function ViewModel() {
    var self = this;
    self.usersCurrentlyTyping = ko.observableArray();
    self.name = ko.observable();
    self.chatRoom = ko.observable();
    self.connectedUsers = ko.observableArray();
    self.messages = ko.observableArray();
    self.currentMessage = ko.observable('');

    self.usersTypingMessage = ko.computed(function() {
        var message = '';
        var multipleUsersCurrentlyTyping = self.usersCurrentlyTyping().length > 1;

        if(self.usersCurrentlyTyping().length > 0) {
            var names = self.usersCurrentlyTyping().map(user => user.name);
            message = names.join(', ') + (multipleUsersCurrentlyTyping ? ' have typed some shit' : ' has typed some shit');
        }

        return message;
    });

    self.pageTitle = ko.computed(function() {
        return `Chat! | ${self.chatRoom()}`;
    });

    self.connectedUsersHeader = ko.computed(function () {
        return 'Connected Users (' + self.connectedUsers().length + ')';
    });
}

function Message(from, text, createdAt) {
    var self = this;
    self.from = ko.observable(from);
    self.text = ko.observable(text);
    self.createdAt = ko.observable(createdAt);
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel, document.getElementById('master'));
ko.applyBindings(viewModel, document.getElementById('title'));

var socket = io();

socket.on('connect', function () {
    console.log('connected to server');

    var params = $.deparam(window.location.search);
    socket.emit('join', params, function(err) {
        if(err) {
            alert(err);
            window.location.href = '/';
        } else {
            viewModel.name(params.name);
            viewModel.chatRoom(params.room);
        }
    });

    $('#text').focus();
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newMessage', function (message) {
    console.log('new message', message);
    viewModel.messages.push(new Message(message.from, message.text, moment(message.createdAt).format('h:mm a')));
});

socket.on('newLocationMessage', function (message) {
    console.log('new location message', message);
    viewModel.messages.push(new Message(message.from, message.url, moment(message.createdAt).format('h:mm a')));
});

socket.on('updateUserList', function (data) {
    viewModel.connectedUsers(data.userList);
});

socket.on('updateUsersTyping', function (usersTyping) {
    viewModel.usersCurrentlyTyping(usersTyping);
});

function isTyping() {
    if (viewModel.name().trim().length > 0) {
        if (viewModel.currentMessage().trim().length > 0) {
            socket.emit('startedTyping', {
                from: viewModel.name(),
            });
        } else {
            socket.emit('stoppedTyping', {
                from: viewModel.name()
            });
        }
    }
}

function sendMessage() {
    if (viewModel.name().trim().length > 0 && viewModel.currentMessage().trim().length > 0) {
        socket.emit('createMessage', {
            text: viewModel.currentMessage()
        });

        viewModel.currentMessage('');
        isTyping();
        $('#text').focus();
    }
}

function sendLocation() {
    if(!navigator.geolocation) {
        alert('Geolocation is not available');
    } else {
        navigator.geolocation.getCurrentPosition(function(position) {
            socket.emit('createLocationMessage', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            }, function(data) {
                console.log('Acknowledgement!', data.string);
            });
        }, function() {
            alert('Unable to fetch location');
        });
    }
}

$(document).ready(function () {
    $('#text').on('keydown', function (key) {
        if (key.keyCode === 13) {
            key.preventDefault();
            sendMessage();
        } else {
            isTyping();
        }
    });
});
