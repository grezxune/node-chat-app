  var socket = io();
  var usersCurrentlyTyping = new Array();
  var from = "";
  var connectedUsers = new Array();

  socket.on('connect', function() {
    console.log('connected to server');
    while(!from || from.trim() === "") {
       from = prompt("What is your name?");
    }

    $('#from').html(from);
    $('#text').focus();

    socket.emit('newUserConnected', {user: from});
  });

  socket.on('disconnect', function() {
    console.log('disconnected from server');
  });

  socket.on('newMessage', function(message) {
    console.log('new message', message);
    addMessage(message);
  });

  socket.on('connectedCountChanged', function(connection) {
    var oldCount = $('#connectionCount').html();
    if(oldCount === "") {
      oldCount = 0;
    }

    addMessage("Connection count changed from " + oldCount + " to " + connection.connectedCount);
    $('#connectionCount').html(connection.connectedCount);
  });

  socket.on('isTyping', function(usersTyping) {
    usersCurrentlyTyping = usersTyping.names;
    var haveMultipleTyped = usersCurrentlyTyping.length > 1;
    var message = usersCurrentlyTyping.join(', ') + (haveMultipleTyped ? ' have typed some shit' : ' has typed some shit');
    $('#usersTyping').html(message);
  });

  socket.on('stoppedTyping', function(usersTyping) {
    usersCurrentlyTyping = usersTyping.names;
    var numberOfTypers = usersCurrentlyTyping.length;
    var message = "";

    if(numberOfTypers > 0) {
      var haveMultipleTyped = usersCurrentlyTyping.length > 1;
      message = usersCurrentlyTyping.join(', ') + (haveMultipleTyped ? ' have typed some shit' : ' has typed some shit');
    }

    $('#usersTyping').html(message);
  });

  socket.on('addUser', function(users) {
    connectedUsers = users.names;
    var usersHtml = "";

    $.each(connectedUsers, function(index, value) {
      usersHtml += "<span class=\"user-name\">" + value + "</span><br/>";
    });

    $('.connected-users').html(usersHtml);
  });

  socket.on('removeUser', function(users) {
    connectedUsers = users.names;
    var usersHtml = "";

    $.each(connectedUsers, function(index, value) {
      usersHtml += "<span class=\"user-name\">" + value + "</span><br/>";
    });

    $('.connected-users').html(usersHtml);
  });

  createMessageText = function(message) {
    return message.from + ":\n" + message.text;
  }

  addMessage = function(message) {
    var currentVal = $('#messages').val();
    var newMessage = message.text ? createMessageText(message) : message;
    $('#messages').val(currentVal + newMessage + "\n");
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
  }

  isTyping = function() {
    var message = $('#text').val();

    if(from.trim().length > 0) {
      if(message.trim().length > 0) {
        socket.emit('isTyping', {
            from: from,
        });
      } else {
        socket.emit('stoppedTyping', {
          from: from
        });
      }
    }
  }

$(document).ready(function() {
  $('#send').on('click', function() {
    var message = $('#text').val();

    if(from.trim().length > 0 && message.trim().length > 0) {
      socket.emit('createMessage', {
        from: from,
        text: message
      });

      $('#text').val('');
      $('#text').focus();
      isTyping();
    }
  });

  $('#text').on('keydown', function(key) {
    if(key.keyCode === 13) {
      key.preventDefault();
      $('#send').click();
    }
  }).on('keyup', function(key) {
    if(key.keyCode === 13) {
      key.preventDefault();
    } else {
      isTyping();
    }
  });
});
