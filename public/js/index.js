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
    var currentVal = $('#messages').val();
    $('#messages').val(currentVal + createMessageText(message));
  });

  createMessageText = function(message) {
    return "\n" + message.from + "\n" + message.text;
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
      $('#send').click();
      return true;
    }
  });
});
