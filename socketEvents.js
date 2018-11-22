
const users = require('./routes/users');
const chat = require('./routes/chat');
const conversation = require('./models/conversation');
const message = require('./models/message');

exports = module.exports = function(io) {  
    // Set socket.io listeners.
    io.on('connection',  (socket) => {
      console.log( 'user has connected');
  
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
  
      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
    });
  }