const { Server } = require('socket.io');

let io = null;

const initSocket = (httpServer) => {
  const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:5173';

  io = new Server(httpServer, {
    cors: {
      origin: [allowedOrigin, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Join user specific room
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user:${userId}`);
      }
    });

    // Join project specific room
    socket.on('join:project', (projectId) => {
      if (projectId) {
        socket.join(`project:${projectId}`);
      }
    });

    // Leave project room
    socket.on('leave:project', (projectId) => {
      if (projectId) {
        socket.leave(`project:${projectId}`);
      }
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

const emitToProject = (projectId, event, data) => {
  if (io && projectId) {
    io.to(`project:${projectId}`).emit(event, data);
  }
};

const emitToUser = (userId, event, data) => {
  if (io && userId) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToProject,
  emitToUser,
};
