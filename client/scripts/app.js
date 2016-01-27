var app = {

  currentRoom: 'lobby',
  username: location.search.slice(10),
  friends: {},
  lastMessageId: 0,

  init: function() {
    app.fetch('roomname', app.currentRoom);
  },

  // TODO: Send message to server
  send: function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',
      success: function(data) {
        console.log('chatterbox: Message sent');
      },
      error: function(data) {
        // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  fetch: function(filterBy, compareTo) {

    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: {'order': '-createdAt'},
      contentType: 'application/json',
      success: function(data) {

        //Adding rooms
        app.popRooms(data.results);

        // clearing the list and adding messages
        var filtered = _.filter(data.results, function(el) {
          if (el[filterBy] && el[filterBy].length < 10) {
            return el[filterBy] === compareTo;
          }
        });
        if (filtered[0].objectId !== app.lastMessageId) {
          app.clearMessages();
          _.each(filtered, function(el) {
            app.addMessage(el);
          });
          app.lastMessageId = filtered[0].objectId;
        }
      },
      error: function(data) {
        console.error('chatterbox: Failed to retrieve messages');
      }
    });
  },

  clearMessages: function() {
    $('#chats').html('');
  },

  // Creates class for each message's user
  addMessage: function(message) {
    var text = message.username + ": " + message.text;
    var timeElement = '<span data-livestamp=' + message.createdAt + '></span>';

    $('#chats').append($('<div class = "username"></div>').text(text).addClass(message.username));
    $('#chats').append('\n' + timeElement);
  },
  popRooms: function(data){
    var rooms = {};
    _.each(data, function(el) {
      if (el.roomname && el.roomname.length < 10) {
        var room = el.roomname.replace(/[<]/g, '').replace(/[>]/g, '').replace(/[#]/g, '').replace(/["]/g, '').replace(/[']/g, '').replace(/[\/]/g, '').replace(/[?]/g, '');
        rooms[room] = room;
      }
    });
    $('ul').html('');
    for (var key in rooms) {
      if (!rooms[key]) {
        continue;
      }
      if ($('#' + key)) {
        app.addRoom(rooms[key]);
      }
    }
  },
  addRoom: function(roomName) {
    $('#roomSelect').append('<li><a class="room" id=' + roomName + ' href=#>' + roomName + '</a></li>');
  },

  addFriend: function(friend) {
    if (app.friends[friend]) {
      delete app.friends[friend];
    } else {
      app.friends[friend] = friend;
    }
  },

  handleSubmit: function() {}
};

$(document).on('click', '.submit', function() {
  var text = $('#message').val();
  var message = {
    'text': text,
    'username': app.username,
    'roomname': app.currentRoom
  };
  app.send(message);
  app.handleSubmit();
  app.fetch('roomname', app.currentRoom);
  $('#message').val('');
});

$(document).keypress(function(e) {
  if (e.which == 13) {
    if ($('#addroom').val()) {
      $('.addroom').click();
    } else {
      $('.submit').click();
    }
  }
});


// TODO: Add friend by clicking on username
$(document).on('click', '.username', function() {
  var name = $(this).attr('class').split(' ').slice(1)[0];
  app.addFriend(name);
  $('div .' + name).toggleClass('friend');
  $('#friendlist').append('<div>' + name + '</div>');
});

$(document).on('click', '.room', function(e) {
  app.currentRoom = $(this).attr('id');
  $('.dropdown-toggle').text(app.currentRoom);
  app.fetch('roomname', app.currentRoom);
});


$(document).ready(function() {
  app.init();
});

$(document).on('click', '.addroom', function() {
  var roomName = $('#addroom').val();
  app.currentRoom = roomName;
  app.clearMessages();
  $('#addroom').val('');
});

$(document).on('click', '#refresh', function() {
  app.fetch('roomname', app.currentRoom);
});
