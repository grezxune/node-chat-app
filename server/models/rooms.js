const {Room} = require('./room.js');

class Rooms {
    constructor () {
        this.rooms = [];
    }

    join(name, userName, userId) {
        var room = this.getRoom(name);

        if (!room) {
            var room = new Room(name);
            this.rooms.push(room);
        }

        return room.addUser(userName, userId);
    }

    leave(name, userId) {
        var room = this.getRoom(name);

        if (room) {
            room.removeUser(userId);

            var index = this.rooms.indexOf(room);

            if (index > -1) {
                this.rooms.splice(index, 1);
            }
        }
    }

    getUserList(name) {
        var room = this.getRoom(name);
        var userList;

        if (room) {
            userList = room.userList;
        }

        return userList;
    }

    getRoomNameList() {
        return this.rooms.map((room) => room.name);
    }

    getRoom(name) {
        return this.rooms.filter((room) => room.name === name)[0];
    }
}

module.exports = {Rooms};