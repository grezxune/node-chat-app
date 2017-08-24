const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const moment = require('moment');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
const {isNullOrEmpty} = require('./utils/isNullOrEmpty.js');
const {generateMessage} = require('./utils/generateMessage');

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var {Rooms} = require('./models/rooms');
var currentChatRooms = new Rooms();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    socket.on('join', (newUser, callback) => {
        addUser(newUser, socket, callback);
    });

    socket.on('createMessage', (newMessage, callback) => {
        var room = currentChatRooms.getRoomUserIsIn(socket.id);
        var user = room.getUser(socket.id);
        io.to(room.name).emit('newMessage', generateMessage(user.name, newMessage.text));
    });

    socket.on('disconnect', () => {
        removeUser(socket);
    });

    socket.on('startedTyping', () => {
        var room = currentChatRooms.getRoomUserIsIn(socket.id);
        room.userStartedTyping(socket.id);
        io.to(room.name).emit('updateUsersTyping', room.usersTyping);
    });

    socket.on('stoppedTyping', () => {
        var room = currentChatRooms.getRoomUserIsIn(socket.id);
        room.userStoppedTyping(socket.id);
        io.to(room.name).emit('updateUsersTyping', room.usersTyping);
    });

    socket.on('createLocationMessage', (coords, callback) => {
        emitLocationMessage(socket, coords, callback);
    });

    updateExistingRooms();
});

updateExistingRooms = () => {
    io.emit('updateExistingRooms', { existingRooms: currentChatRooms.rooms });
}

removeUser = (socket) => {
    var room = currentChatRooms.getRoomUserIsIn(socket.id);
    if(room) {
        var user = room.getUser(socket.id);
        if(user) {
            socket.broadcast.to(room.name).emit('newMessage', generateMessage('Admin', `${user.name} has left us!`));

            currentChatRooms.leave(room.name, socket.id);
            if(currentChatRooms.getRoom(room.name)) {
                io.to(room.name).emit('updateUserList', { userList: room.userList });
            }
        }

        updateExistingRooms();
    }
}

addUser = (newUser, socket, callback) => {
    if(!isNullOrEmpty(newUser.name) && !isNullOrEmpty(newUser.room)) {
        if(!currentChatRooms.join(newUser.room, newUser.name, socket.id)) {
            callback(`There was an error with ${newUser.name} joining room ${newUser.room}`);
        } else {
            socket.join(newUser.room);
            socket.emit('newMessage', generateMessage('Admin', `Welcome to ${newUser.room}!`));
            socket.broadcast.to(newUser.room).emit('newMessage', generateMessage('Admin', `${newUser.name} has joined!`));
            io.to(newUser.room).emit('updateUserList', { userList: currentChatRooms.getRoom(newUser.room).userList });
            updateExistingRooms();
            callback();
        }
    } else {
        callback('User name and room are required');
    }
}

emitLocationMessage = (socket, coords, callback) => {
    io.emit('newLocationMessage', {
        from: currentChatRooms.getRoomUserIsIn(socket.id).getUser(socket.id).name,
        url: `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`,
        createdAt: moment().valueOf()
    });

    if(callback) {
        callback({
            'string': 'Sending location url'
        });
    }
};


server.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
