import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      const userRaw = localStorage.getItem('devtrack_user');
      if (userRaw) {
        try {
          const user = JSON.parse(userRaw);
          newSocket.emit('join:user', user._id);
        } catch (e) {}
      }
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const joinProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('join:project', projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && projectId) {
      socket.emit('leave:project', projectId);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
