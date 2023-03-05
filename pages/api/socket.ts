import { NextApiRequest } from 'next';
import { MessageIO, NextApiResponseSocket } from '@/interfaces';
import { Server } from 'socket.io';
import { Configuration, OpenAIApi } from 'openai';
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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
    socket.on('createdMessage', async (msg: MessageIO) => {
      const text = msg.message;
      if (text.startsWith('/ai ')) {
        const prompt = text.replace('/ai ', '');
        const completion = await openai.createCompletion({
          model: 'text-davinci-003',
          prompt,
          temperature: 0.1,
          top_p: 1,
          frequency_penalty: 0,
          max_tokens: 1024,
        });

        const result = completion.data.choices[0].text;
        socket.emit('messageFromAI', {
          message: result,
          username: 'AI',
          to: msg.username,
          id: new Date().getTime().toString(),
        });
        return;
      }

      socket.broadcast.emit('newIncomingMessage', msg);
    });
  });

  res.end();
};

export default socketHandler;
