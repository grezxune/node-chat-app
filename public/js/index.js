function ViewModel() {
    var self = this;
    self.name = ko.observable('');
    self.chatRoom = ko.observable('');
    self.currentRooms = ko.observableArray([]);

    self.goToRoom = function() {
        if(self.name().trim().length > 0 &&
            self.chatRoom().trim().length > 0) {
                socket.emit('join', {
                    'name': self.name(),
                    'room': self.chatRoom()
                }, (err) => {
                    if(err) {
                        alert(err);
                    } else {
                        window.location.href = '/chat.html?name=' + self.name() + '&room=' + self.chatRoom();
                        // Success! Move user to chat room!
                    }
               });
        } else {
            alert('Name and room are required');
        }
    }
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel, document.getElementById('master'));
var socket = io();

socket.on('connect', function () {

});