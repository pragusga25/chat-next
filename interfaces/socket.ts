import { Socket as NetSocket } from 'net';
import { NextApiResponse } from 'next';
import type { Server as IOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

interface SocketServer extends HttpServer {
  io?: IOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export type MessageIO = Record<'username' | 'message' | 'id', string>;
export type MessageIOAI = Record<'username' | 'message' | 'id' | 'to', string>;

export interface NextApiResponseSocket extends NextApiResponse {
  socket: SocketWithIO;
}
