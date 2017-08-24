function ViewModel() {
    var self = this;
    self.name = ko.observable('');
    self.chatRoom = ko.observable('');
    self.existingRooms = ko.observableArray([]);

    self.goToRoom = function() {
        if(self.name().trim().length > 0 &&
            self.chatRoom().trim().length > 0) {
                var params = $.param({
                    name: self.name().trim(),
                    room: self.chatRoom().trim()
                });

                window.location.href = '/chat.html?' + params
        } else {
            alert('Name and room are required');
        }
    }

    self.setChatRoom = function(room) {
        self.chatRoom(room.name);
    }
}

var viewModel = new ViewModel();
ko.applyBindings(viewModel, document.getElementById('master'));
var socket = io();

socket.on('connect', function () {

});

socket.on('updateExistingRooms', function(data) {
    var orderedRooms = data.existingRooms.sort(function(a, b) {
        if(a.userList.length === b.userList.length) {
            return a.name > b.name;
        } else {
            return a.userList.length < b.userList.length;
        }
    });
    viewModel.existingRooms(orderedRooms);
});

$(document).ready(function() {
    $(document).on('keydown', function (key) {
        if (key.keyCode === 13) {
            key.preventDefault();
            viewModel.goToRoom();
        }
    });

    $('#user-name-text').focus();
});