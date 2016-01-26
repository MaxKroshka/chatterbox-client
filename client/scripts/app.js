var currentRoom = 'lobby';
var username = location.search.slice(10);
var rooms = {};
var banned = ['<','>','%','&','$','/','\\'];
var friends = {};
var app = {

  init: function() {
    app.fetch('roomname',currentRoom);
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
      data: {
        order: "-createdAt",
        limit: 1000
      },
      contentType: 'application/json',
      success: function(data) {

//        Adding rooms
        _.each(data.results, function(el) {
          if(el.roomname && el.roomname.length < 10){
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

        // clearing the list and adding messages
        app.clearMessages();
        _.each(_.filter(data.results, function(el) {
          if(el[filterBy] && el[filterBy].length < 10){
          return el[filterBy] === compareTo;
        }
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
    var timeElement = '<span data-livestamp='+message.createdAt+'></span>';

    $('#chats').append($('<div class = "username"></div>').text(text).addClass(message.username));
    $('#chats').append('\n'+timeElement);
  },

  addRoom: function(roomName) {
    $('#roomSelect').append('<li><a class="room" id=' + roomName + ' href=#>' + roomName + '</a></li>');
  },

  addFriend: function(friend) {
    if(friends[friend]){
      delete friends[friend];
    } else{
    friends[friend] = friend;
    }
  },

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
  app.fetch('roomname', currentRoom);
  $('#message').val('');
});

$(document).keypress(function(e) {
    if(e.which == 13 ) {
       if( $('#addroom').val() ) {
        $('.addroom').click();
       }
       else{
        $('.submit').click();
       }
    }
});


// TODO: Add friend by clicking on username
$(document).on('click', '.username', function() {
  var name = $(this).attr('class').split(' ').slice(1)[0];
  app.addFriend(name);
  $('div .' + name).toggleClass('friend');
  $('#friendlist').append('<div>'+name+'</div>');
});

$(document).on('click', '.room', function(e) {
  currentRoom = $(this).attr('id');
  $('.dropdown-toggle').text(currentRoom);
  app.fetch('roomname', currentRoom);
});


$(document).ready(function() {
  app.init();
});

$(document).on('click', '.addroom', function() {
  var roomName = $('#addroom').val();
  currentRoom = roomName;
  app.clearMessages();
  $('#addroom').val('');
});

$(document).on('click', '#refresh', function(){
  app.fetch('roomname', currentRoom);
});


