var app = {

  currentRoom: 'lobby',
  username: location.search.slice(10),
  friends: {},
  lastMessageId: 0,

  // Loads initial messages on page
  init: function() {
    app.fetch('roomname', app.currentRoom);
  },

  // Send message to server
  send: function(message) {
    $.ajax({
      // This is the url you should use to communicate with the parse API server.
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'POST',
      data: JSON.stringify(message),
      contentType: 'application/json',

      // Logs confirmation message if send successful
      success: function(data) {
        console.log('chatterbox: Message sent');
      },

      // Logs error message if send fails
      error: function(data) {
        console.error('chatterbox: Failed to send message');
      }
    });
  },

  // Request new data from server
  fetch: function(filterBy, compareTo) {
    $.ajax({
      url: 'https://api.parse.com/1/classes/chatterbox',
      type: 'GET',
      data: {'order': '-createdAt'},
      contentType: 'application/json',
      
      // Populates rooms and clears/repopulates messages if fetch successful
      success: function(data) {
        app.popRooms(data.results);
        app.popMessages(data.results, filterBy, compareTo);
      },

      // Logs error if fetch fails
      error: function(data) {
        console.error('chatterbox: Failed to retrieve messages');
      }
    });
  },

  clearMessages: function() {
    $('#chats').html('');
  },

  // Adds message & prettified timestamp to chats
  addMessage: function(message) {
    var text = message.username + ": " + message.text;
    var timeElement = '<span data-livestamp=' + message.createdAt + '></span>';

  // Creates class for each message's user, for use in adding friends
    $('#chats').append($('<div class = "username"></div>').text(text).addClass(message.username));
    $('#chats').append(timeElement);
  },
  
  // Populates all new messages, based on the latest messageId
  popMessages: function(data, filterBy, compareTo) {
    var filtered = _.filter(data, function(el) {
      if (el[filterBy] && el[filterBy].length < 10) {
        return el[filterBy] === compareTo;
      }
    });
    if (filtered.length && filtered[0].objectId !== app.lastMessageId) {
      app.clearMessages();
      _.each(filtered, function(el) {
        app.addMessage(el);
      });
      app.lastMessageId = filtered[0].objectId;
    }
  },

  // Creates class and ID for each new room & appends to roomSelect dropdown
  addRoom: function(roomName) {
    $('#roomSelect').append('<li><a class="room" id=' + roomName + ' href=#>' + roomName + '</a></li>');
  },

  // Iterates through all data, sanitizes room inputs and runs function to append new rooms to list
  popRooms: function(data){
    var rooms = {};
    _.each(data, function(el) {
      if (el.roomname && el.roomname.length < 10) {
        var room = el.roomname.replace(/[<]/g, '').replace(/[>]/g, '').replace(/[#]/g, '').replace(/["]/g, '').replace(/[']/g, '').replace(/[\/]/g, '').replace(/[?]/g, '');
        rooms[room] = true;
      }
    });
    $('ul').html('');
    for (var key in rooms) {
      if (rooms[key]) {
        app.addRoom(key);
      }
    }
  },

  // Adds/removes clicked friend name from friends object
  addFriend: function(friend) {
    if (app.friends[friend]) {
      delete app.friends[friend];
    } else {
      app.friends[friend] = friend;
    }
  },

  // Unused helper function
  handleSubmit: function() {}
};

// Composes/sends messages, reloads room to show new message
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

// Accepts ENTER to submit room or message text
$(document).keypress(function(e) {
  if (e.which == 13) {
    if ($('#addroom').val()) {
      $('.addroom').click();
    } else {
      $('.submit').click();
    }
  }
});

// Adds user as friend when username clicked, highlights friend's posts
$(document).on('click', '.username', function() {
  var name = $(this).attr('class').split(' ').slice(1)[0];
  app.addFriend(name);
  $('div .' + name).toggleClass('friend');
  $('#friendlist').append('<div>' + name + '</div>');
});

// Sets selected room from dropdown to be currentRoom
// Fetches messages from newly selected room
$(document).on('click', '.room', function(e) {
  app.currentRoom = $(this).attr('id');
  $('.dropdown-toggle').text(app.currentRoom);
  app.fetch('roomname', app.currentRoom);
});

// Initializes first load of messages on document load
$(document).ready(function() {
  app.init();
});

// CREATE ROOM BUTTON - Sets user generated room to currentRoom
$(document).on('click', '.addroom', function() {
  var roomName = $('#addroom').val();
  app.currentRoom = roomName;
  app.clearMessages();
  $('#addroom').val('');
});

// REFRESH BUTTON - Loads new messages in current room
$(document).on('click', '#refresh', function() {
  app.fetch('roomname', app.currentRoom);
});
