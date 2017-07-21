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

    io.emit('newMessage', {
      from: newMessage.from,
      text: newMessage.text,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
    connectedCount--;
    io.emit('connectedCountChanged', { connectedCount: connectedCount });
  });

  socket.on('isTyping', (user) => {
    if(!usersTyping.includes(user.from)) {
      usersTyping.push(user.from);
      io.emit('isTyping', {names: usersTyping});
    }
  });

  socket.on('stoppedTyping', (user) => {
    if(usersTyping.includes(user.from)) {
      var index = usersTyping.indexOf(user.from);
      var newTest = usersTyping.splice(index, 1);
      io.emit('stoppedTyping', {names: usersTyping});
    }
  });
});


server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
