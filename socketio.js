const users = require('./routes/users');
const chat = require('./routes/chat');
const conversation = require('./models/conversation');
const message = require('./models/message');

exports = module.exports = function (io) {
  // Set socket.io listeners.
  io.on('connection', (socket) => {
    socket.on('userdata', (user) =>{
      socket.username = user.username;
      socket.name = user.name;
      socket._id = user._id;
      console.log('User ' + socket.username + ' ( ' + socket.name + ', id: ' + socket._id + ' ) ' + ' has CONNECTED');

      socket.on('disconnect', () => {
        console.log('User ' + socket.username + ' ( ' + socket.name +  ', id: ' + socket._id + ' ) ' + ' has DISCONNECTED');
      });
    });

    


    // On conversation entry, join broadcast channel
    socket.on('enter conversation', (conversation) => {
      socket.join(conversation);
      console.log('joined ' + conversation);
    });

    socket.on('leave conversation', (conversation) => {
      socket.leave(conversation);
      console.log('left ' + conversation);
    })

    socket.on('new message', (conversation) => {
      io.sockets.in(conversation).emit('refresh messages', conversation);
    });

    socket.on('message', (message) => {
      message = JSON.parse(message);
      console.log('User ' + message.user.username + ' ( ' + message.user.name + ',  id: ' + message.user._id + ' ) ' + 'has sent a message: ' + message.message );
      io.emit('message', {
        type: 'new-message',
        text: message.message
      });
    });






  });
}