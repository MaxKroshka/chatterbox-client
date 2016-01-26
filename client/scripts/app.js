var currentRoom = 'lobby';
var username = location.search.slice(10);
var rooms = {};

var app = {

  init: function() {
    app.fetch();
  },
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
  fetch: function() {
    app.clearMessages();
    var first = $.get('https://api.parse.com/1/classes/chatterbox');

    setTimeout(function() {
      var results = first.responseJSON.results;
      _.each(results,function(el){
        rooms[el.roomname] = el.roomname;
      });
      console.log(rooms);
      for(var key in rooms){
        app.addRoom(rooms[key]);
      }
      _.each(_.filter(results, function(el) {
        return el.roomname === currentRoom;
      }), function(el) {
        app.addMessage(el);
      });
    }, 1000);

  },
  clearMessages: function() {
    $('#chats').html('');
  },

  // Creates class for each message's user
  addMessage: function(message) {
    $('#chats').append('<div class = username>' +
      message.username + ": " + message.text + '</div');
  },
  addRoom: function(roomName) {
    $('#roomSelect').append('<li><a class="room, '+roomName+'"href=#>' + roomName + '</a></li>');
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

$(document).on('click', '.username', function() {
  console.log('click');
  app.addFriend();
});

$(document).ready(function() {

  app.init();
});
