  var socket = io();
  socket.on('connect', function() {
    console.log('connected to server');

    // socket.emit('createMessage', {
    //   from: 'Tommy',
    //   text: 'Yo! Socket.IO test!'
    // });
  });

  socket.on('disconnect', function() {
    console.log('disconnected from server');
  });

  socket.on('newMessage', function(message) {
    console.log('new message', message);
    addMessage(message);
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  });

  socket.on('connectedCountChanged', function(connection) {
    var oldCount = $('#connectionCount').html();
    if(oldCount === "") {
      oldCount = 0;
    }

    addMessage("Connection count changed from " + oldCount + " to " + connection.connectedCount);
    $('#connectionCount').html(connection.connectedCount);
  });

  createMessageText = function(message) {
    return message.from + "\n" + message.text;
  }

  addMessage = function(message) {
    var currentVal = $('#messages').val();
    var newMessage = message.text ? createMessageText(message) : message;
    $('#messages').val(currentVal + newMessage + "\n");
  }

$(document).ready(function() {
  $('#send').on('click', function() {
    var from = $('#from').val();
    var message = $('#text').val();

    socket.emit('createMessage', {
      from: from,
      text: message
    });

    $('#text').val('');
    $('#text').focus();
  });

  $('#text').on('keydown', function(key) {
    if(key.keyCode === 13) {
      key.preventDefault();
      $('#send').click();
    }
  });
});
