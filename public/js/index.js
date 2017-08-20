function ViewModel() {
    var self = this;
    self.usersCurrentlyTyping = ko.observableArray();
    self.name = ko.observable();
    self.connectedUsers = ko.observableArray();
    self.messages = ko.observableArray();
    self.currentMessage = ko.observable('');

    self.usersTypingMessage = ko.computed(function() {
        var message = '';
        var multipleUsersCurrentlyTyping = self.usersCurrentlyTyping().length > 1;

        if(self.usersCurrentlyTyping().length > 0) {
            message = self.usersCurrentlyTyping().join(', ') + (multipleUsersCurrentlyTyping ? ' have typed some shit' : ' has typed some shit');
        }

        return message;
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

var socket = io();

socket.on('connect', function () {
    console.log('connected to server');
    while (!viewModel.name() || viewModel.name().trim() === "") {
        viewModel.name(prompt("What is your name?"));
    }

    $('#text').focus();
    socket.emit('newUserConnected', { user: viewModel.name() });
});

socket.on('disconnect', function () {
    console.log('disconnected from server');
});

socket.on('newMessage', function (message) {
    console.log('new message', message);
    viewModel.messages.push(new Message(message.from, message.text, message.createdAt));
});

socket.on('connectedCountChanged', function (connection) {
    var oldCount = $('#connectionCount').html();
    if (oldCount === "") {
        oldCount = 0;
    }

    // addMessage("Connection count changed from " + oldCount + " to " + connection.connectedCount);
    // $('#connectionCount').html(connection.connectedCount);
});

socket.on('isTyping', function (usersTyping) {
    viewModel.usersCurrentlyTyping(usersTyping.names);
});

socket.on('stoppedTyping', function (usersTyping) {
    viewModel.usersCurrentlyTyping(usersTyping.names);
});

socket.on('addUser', function (users) {
    viewModel.connectedUsers(users.names);
});

socket.on('removeUser', function (users) {
    viewModel.connectedUsers(users.names);
});

isTyping = function () {
    if (viewModel.name().trim().length > 0) {
        if (viewModel.currentMessage().trim().length > 0) {
            socket.emit('isTyping', {
                from: viewModel.name(),
            });
        } else {
            socket.emit('stoppedTyping', {
                from: viewModel.name()
            });
        }
    }
}

$(document).ready(function () {
    $('#send').on('click', function () {
        if (viewModel.name().trim().length > 0 && viewModel.currentMessage().trim().length > 0) {
            socket.emit('createMessage', {
                from: viewModel.name(),
                text: viewModel.currentMessage()
            });

            viewModel.currentMessage('');
            $('#text').focus();
            isTyping();
        }
    });

    $('#text').on('keydown', function (key) {
        if (key.keyCode === 13) {
            key.preventDefault();
            $('#send').click();
        }
    }).on('keyup', function (key) {
        if (key.keyCode === 13) {
            key.preventDefault();
        } else {
            isTyping();
        }
    });
});
