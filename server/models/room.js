const {User} = require('./user.js');

class Room {
    constructor (name) {
        this.userList = [];
        this.usersTyping = [];
        this.name = name;
    }

    addUser(id, userName) {
        var added = false;

        if(!this.findUser(id) && !this.userNameExists(userName)) {
            this.userList.push(new User(id, userName));
            added = true;
        }

        return added;
    }

    removeUser(id) {
        var user = this.findUser(id);

        if (user) {
            var index = this.userList.indexOf(user);

            this.userList.splice(index, 1);
        }
    }

    userStartedTyping(id) {
        var userTyping = this.isUserTyping(id);

        if (!userTyping) {
            this.usersTyping.push(findUser(id));
        }
    }

    userStoppedTyping(id) {
        var userTyping = this.isUserTyping(id);

        if (userTyping) {
            var index = this.usersTyping.indexOf(userTyping);
            this.usersTyping.splice(index, 1);
        }
    }

    isUserTyping(id) {
        return this.usersTyping.filter((user) => user.id === id)[0];
    }

    findUser(id) {
        return this.userList.filter((user) => user.id === id)[0];
    }

    userNameExists(name) {
        return this.userList.filter((user) => user.name === name)[0];
    }
}

module.exports = {Room};