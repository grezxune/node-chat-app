const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);
var connectedCount = 0;
var usersTyping = new Array();
var usersConnected = new Array();

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('new user connected');
  connectedCount++;
  io.emit('connectedCountChanged', { connectedCount: connectedCount });

  // socket.emit('newMessage', {
  //   from: 'tomtrezb2003@gmail.com',
  //   text: 'hey man, what\'z up?',
  //   createdAt: new Date().getTime()
  // });

  socket.on('createMessage', (newMessage) => {
    console.log('createMessage', newMessage);

    var date = new Date();
    var options = {
        weekday: "long", year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit"
    };

    io.emit('newMessage', {
      from: newMessage.from,
      text: newMessage.text,
      createdAt: date.toLocaleDateString('en-us', options)
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    connectedCount--;
    io.emit('connectedCountChanged', { connectedCount: connectedCount });
    userStoppedTyping({from: socket.name});
    var index = usersConnected.indexOf(socket.name);
    usersConnected.splice(index, 1);
    io.emit('removeUser', {names: usersConnected});
  });

  socket.on('isTyping', (user) => {
    if(!usersTyping.includes(user.from)) {
      usersTyping.push(user.from);
      io.emit('isTyping', {names: usersTyping});
    }
  });

  socket.on('stoppedTyping', (user) => {
    userStoppedTyping(user);
  });

  socket.on('newUserConnected', (user) => {
    console.log('new user connected', user);
    socket.name = user.user;
    if(user.user && user.user.trim().length > 0) {
      usersConnected.push(user.user);
      io.emit('addUser', {names: usersConnected});
    }
  })
});

userStoppedTyping = (user) => {
    console.log('userStoppedTyping', user);
    if(usersTyping.includes(user.from)) {
      var index = usersTyping.indexOf(user.from);
      var newTest = usersTyping.splice(index, 1);
      io.emit('stoppedTyping', {names: usersTyping});
    }
};


server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
