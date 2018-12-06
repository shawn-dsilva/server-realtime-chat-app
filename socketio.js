const users = require('./routes/users');
const chat = require('./routes/chat');
const conversation = require('./models/conversation');
const message = require('./models/message');

exports = module.exports = function (io) {

// USER STATUS LOGS START

  io.sockets.on('connection', (socket) => {
    socket.on('userdata', (user) =>{
      socket.username = user.username;
      socket.name = user.name;
      socket._id = user._id;
      console.log('User ' + socket.username + ' ( ' + socket.name + ', id: ' + socket._id + ' ) ' + ' has CONNECTED');

      socket.on('disconnect', () => {
        console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has DISCONNECTED');
      });
    });

// USER STATUS LOGS END
    
//  CHATROOM Routines start

    socket.on('join', (data) => {
      socket.join(data.room);
      console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has JOINED ROOM  ' + data.room);
    });

    socket.on('leave', (data) => {
      socket.leave(data.room);
      console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has LEFT ROOM  ' + data.room);
    });

    socket.on('new message', (conversation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
    });

//  CHATROOM Routines end


// DIRECT MESSAGE Routines start

    socket.on('message', (message) => {
      message = JSON.parse(message);
      console.log('User ' + message.username + ' ( ' + message.name + ',  id: ' + message.user_id + ' ) ' + 'has sent a message: ' + message.message );
      io.emit('message', {
        type: 'new-message',
        conversation_id: message.conversation_id,
        user_id: message.user_id,
        username: message.username,
        name: message.name,
        text: message.message,
      });
    });
  });


// DIRECT MESSAGE Routines end
}