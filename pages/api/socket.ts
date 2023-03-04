import { NextApiRequest } from 'next';
import { MessageIO, NextApiResponseSocket } from '@/interfaces';
import { Server } from 'socket.io';

const socketHandler = (req: NextApiRequest, res: NextApiResponseSocket) => {
  if (res.socket.server?.io) {
    console.log('socket.io is ready');
    res.end();
    return;
  }
  console.log('socket.io is not ready');
  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on('connection', (socket) => {
    socket.on('createdMessage', (msg: MessageIO) => {
      socket.broadcast.emit('newIncomingMessage', msg);
    });
  });

  res.end();
};

export default socketHandler;
