import type { NextPage } from 'next';
import Head from 'next/head';
import io, { Socket } from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { MessageIO, MessageIOAI } from '@/interfaces';

let socket: Socket;

const Home: NextPage = () => {
  const [username, setUsername] = useState('');
  const [showRoom, setShowRoom] = useState(false);
  const [messages, setMessages] = useState<MessageIO[]>([]);
  const [message, setMessage] = useState('');
  const [priv, setPriv] = useState(false);
  const chatBox = useRef<HTMLDivElement>(null);

  const initSocket = async () => {
    await fetch('/api/socket');
    socket = io();

    socket.on('newIncomingMessage', (msg: MessageIO) => {
      setMessages((prev) => [msg, ...prev]);
      console.log(msg);
    });

    socket.on('messageFromAI', (msg: MessageIOAI) => {
      if (msg.to !== username) return;

      setMessages((prev) => [msg, ...prev]);
      console.log(msg);
    });

    console.log('Connected');
  };

  useEffect(() => {
    showRoom && initSocket();
  }, [showRoom]);

  return (
    <div className="w-full h-full px-4 md:px-0">
      <Toaster position="top-center" reverseOrder={false} />
      <Head>
        <title>Taufik Pragusga - 2006595980</title>
        <meta name="description" content="Created by Taufik Pragusga" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!showRoom && (
        <main className="w-full h-screen flex flex-col justify-center">
          <h1 className="text-2xl text-center mb-8 font-bold">
            Welcome To Chat!
          </h1>
          <form
            className="w-fit mx-auto flex flex-col justify-center"
            onSubmit={(e) => {
              e.preventDefault();
              if (username.length <= 2) {
                return toast.error('username is too short');
              }

              setUsername((prev) => prev + '#' + new Date().getTime());
              setShowRoom(true);
            }}
          >
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => {
                let uname = e.target.value.replaceAll('#', '');
                uname.replaceAll(' ', '');
                setUsername(uname);
              }}
              autoFocus
              className="w-96 h-10 border border-black rounded-sm py-2 px-3"
            />
            <button
              type="submit"
              className="rounded text-lg font-bold bg-green-400 py-2 text-black mt-4"
            >
              Join Chat!
            </button>
          </form>
        </main>
      )}

      {showRoom && (
        <main className="h-screen w-full flex flex-col justify-end px-8">
          <div
            className="w-full h-3/4 overflow-y-scroll flex flex-col-reverse"
            ref={chatBox}
          >
            {messages.map(({ message, username: u, id }) => {
              const isMine = u === username;
              const uname = u.split('#')[0];
              return (
                <div
                  key={id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`py-2 px-5 min-w-[120px] my-3 rounded-xl ${
                      isMine ? 'bg-green-800' : 'bg-green-900'
                    } w-fit`}
                  >
                    <div className="text-sm font-bold text-gray-200">
                      <span>{uname}</span>
                    </div>
                    <div className="text-base font-semibold text-white">
                      <p>{message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            className="h-24 mt-5 w-full flex justify-between items-center py-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (message.length <= 0) return;

              const newMsg = {
                username,
                message,
                id: username + message + new Date().getTime(),
              };
              setMessages((prev) => [newMsg, ...prev]);
              setMessage('');
              chatBox.current?.scrollIntoView({
                behavior: 'smooth',
              });

              if (!priv) {
                socket.emit('createdMessage', newMsg);
              }
            }}
          >
            <input
              type="text"
              name="message"
              placeholder="Enter your message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              className="w-full h-full border border-black rounded-lg py-2 px-3"
              autoFocus
            />

            <button
              disabled={!message}
              type="submit"
              className="rounded-lg w-32 h-full ml-4 text-lg font-bold bg-green-400 py-2 px-3 text-black"
            >
              Send
            </button>
          </form>
          <button
            onClick={() => setPriv((prev) => !prev)}
            className={`rounded-lg w-full text-lg font-bold ${
              priv ? 'bg-yellow-400' : 'bg-blue-400'
            } py-2 px-3 text-black mb-3`}
          >
            {priv ? 'Private' : 'Public'}
          </button>
        </main>
      )}
    </div>
  );
};

export default Home;
