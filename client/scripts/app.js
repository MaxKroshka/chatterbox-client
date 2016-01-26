var currentRoom = 'lobby';
var username = location.search.slice(10);
var rooms = {};
var banned = ['<','>','%','&','$','/','\\'];
var app = {

  init: function() {
    app.fetch();
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

  fetch: function(message) {

    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: {
        order: "-createdAt",
        limit: 1000
      },
      contentType: 'application/json',
      success: function(data) {

//        Adding rooms
        _.each(data.results, function(el) {
          if(el.roomname){
          var room = el.roomname.replace(/[<]/, '').replace(/[>]/, '');
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

        // clearing the list and adding messages
        app.clearMessages();
        _.each(_.filter(data.results, function(el) {
          var room = el.roomname.replace(/[<]/, '').replace(/[>]/, '');
          return room === currentRoom;
        }), function(el) {
          app.addMessage(el);
        });
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
    $('#chats').append($('<div class = "username"></div>').text(text));
  },

  addRoom: function(roomName) {
    $('#roomSelect').append('<li><a class="room" id="' + roomName + '" href=#>' + roomName + '</a></li>');
  },

  addFriend: function(friend) {},

  handleSubmit: function() {}
};

$(document).on('click', '.submit', function() {
  var text = $('#message').val();
  var message = {
    'text': text,
    'username': username,
    'roomname': currentRoom
  };
  app.send(message);
  app.handleSubmit();
  $('#message').val('');
});

// TODO: Add friend by clicking on username
$(document).on('click', '.username', function() {
  console.log('click');
  app.addFriend();
});

$(document).on('click', '.room', function(e) {
  currentRoom = $(this).attr('id');
  $('.dropdown-toggle').text(currentRoom);
  app.fetch();
});


$(document).ready(function() {
  app.init();
});
