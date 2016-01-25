// YOUR CODE HERE:
var message = {
  username: 'Mel Brooks',
  text: 'It\'s good to be the king',
  roomname: 'lobby'
};

var app = {

  init: function(){},
  send: function(){
     $.ajax({
       // This is the url you should use to communicate with the parse API server.
       url: 'https://api.parse.com/1/classes/chatterbox',
       type: 'POST',
       data: JSON.stringify(message),
       contentType: 'application/json',
       success: function (data) {
         console.log('chatterbox: Message sent');
       },
       error: function (data) {
         // See: https://developer.mozilla.org/en-US/docs/Web/API/console.error
         console.error('chatterbox: Failed to send message');
       }
     });
  },
  fetch: function(){
    $.get();
  },
  clearMessages: function(){
    $('#chats').html('');
  },
  addMessage: function(message){
    $('#chats').append('<div>'+message.username+": "+message.text+'</div');
  },
  addRoom: function(roomName){
    $('#roomSelect').append('<div>'+roomName+'</div>');
  },
  addFriend: function(friend){
  }
};

$(document).on('click', '#send', function(){
  var text = $('#message').val();
  var message = {
    'text': text,
    'username': 'Anonymous'
  };
  app.addMessage(message);
  $('#message').val('');
});
