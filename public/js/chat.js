function ViewModel() {
    var self = this;

    // *** Observable Arrays *** //
    self.usersCurrentlyTyping = ko.observableArray();
    self.connectedUsers = ko.observableArray();
    self.messages = ko.observableArray();
    // *** /Observable Arrays *** //

    // *** Observables *** //
    self.name = ko.observable();
    self.chatRoom = ko.observable();
    self.currentMessage = ko.observable('');
    self.canFetchLocation = ko.observable(!(!navigator.geolocation));
    self.numberOfMissedMessages = ko.observable(0);
    self.tabHasFocus = ko.observable();
    // *** /Observables *** //

    // *** Pure Computed Members *** //
    self.usersTypingMessage = ko.pureComputed(function() {
        var message = '';
        var multipleUsersCurrentlyTyping = self.usersCurrentlyTyping().length > 1;

        if(self.usersCurrentlyTyping().length > 0) {
            var names = self.usersCurrentlyTyping().map(user => user.name);
            message = names.join(', ') + (multipleUsersCurrentlyTyping ? ' have typed some shit' : ' has typed some shit');
        }

        return message;
    });

    self.connectedUsersHeader = ko.pureComputed(function () {
        return 'Connected Users (' + self.connectedUsers().length + ')';
    });

    self.missedMessagesString = ko.pureComputed(function() {
        return self.numberOfMissedMessages() > 0 ? `(${self.numberOfMissedMessages()})` : '';
    });

    self.pageTitle = ko.pureComputed(function() {
        return `Chat! | ${self.chatRoom()} ${self.missedMessagesString()}`;
    });
    // *** /Pure Computed Members *** //

    // *** Computed Members *** //
    self.sortConnectedUsers = ko.computed(function() {
        if(self.connectedUsers().length > 0) {
            var me = self.connectedUsers().filter(function(user) {
                return user.id === socket.id;
            })[0];
            var index = self.connectedUsers().indexOf(me);
            self.connectedUsers().splice(index, 1);
            var finalList = self.connectedUsers().sort(function(a, b) {
                return a.name > b.name;
            });
            finalList.unshift(me);
            self.connectedUsers(finalList);
        }
    });
    // *** /Computed Members *** //

    // *** Event Subscriptions *** //
    self.messages.subscribe(function() {
        if(self.tabHasFocus()) {
            self.numberOfMissedMessages(0);
        } else {
            var numberOfMissedMessages = self.numberOfMissedMessages() + 1;
            self.numberOfMissedMessages(numberOfMissedMessages);
        }
    });

    self.tabHasFocus.subscribe(function(newValue) {
        self.numberOfMissedMessages(0);
    });
    // *** /Event Subscriptions *** //

    // *** Functions Called From HTML *** //
    self.scrollToBottom = function() {
        // Selectors
        var messages = $('.message-container');
        var newMessage = messages.children('.message:last-child');
        // Heights
        var clientHeight = messages.prop('clientHeight');
        var scrollTop = messages.prop('scrollTop');
        var scrollHeight = messages.prop('scrollHeight');
        var newMessageHeight = newMessage.innerHeight();
        var lastMessageHeight = newMessage.prev().innerHeight();

        if(clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
            messages.scrollTop(messages.prop('scrollHeight'));
        }
    }
    // *** /Functions Called From HTML *** //
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
    if (viewModel.currentMessage().trim().length > 0) {
        socket.emit('startedTyping');
    } else {
        socket.emit('stoppedTyping');
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
    }).on('keyup', function(key) {
        if (key.keyCode === 13) {
            key.preventDefault();
        } else {
            isTyping();
        }
    });

    $(window).on("blur focus", function(e) {
        var prevType = $(this).data("prevType");
    
        if (prevType != e.type) {   //  reduce double fire issues
            switch (e.type) {
                case "blur":
                    viewModel.tabHasFocus(false);
                    break;
                case "focus":
                    viewModel.tabHasFocus(true);
                    break;
            }
        }
    
        $(this).data("prevType", e.type);
    });
});
