const { Server } = require('socket.io');

let io;

module.exports = {
  init: (server) => {
    io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
      }
    });

    io.on('connection', (socket) => {
      console.log('New client connected:', socket.id);
      
      // Client emits this event right after connecting to join their local city room
      socket.on('join_city', (city) => {
        if (city) {
            const roomName = city.toLowerCase().replace(/\s+/g, '_');
            socket.join(roomName);
            console.log(`Socket ${socket.id} joined room: ${roomName}`);
        }
      });
      
      // For testing breaking news broadcasts
      socket.on('trigger_breaking_news', (data) => {
          if (data && data.city && data.headline) {
             const roomName = data.city.toLowerCase().replace(/\s+/g, '_');
             io.to(roomName).emit('breaking_news', { headline: data.headline });
          }
      });
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    return io;
  },
  getIo: () => {
    if (!io) {
      throw new Error('Socket.io not initialized');
    }
    return io;
  }
};
