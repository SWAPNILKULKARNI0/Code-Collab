import { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';

function ChatBox({ socket, roomId, username }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('chat-message');
    };
  }, [socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      text: newMessage,
      sender: username,
      timestamp: new Date().toISOString(),
    };

    socket.emit('chat-message', roomId, messageData);
    setMessages((prev) => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-dark-800 rounded-lg">
      <div className="p-4 border-b border-dark-700">
        <h2 className="text-lg font-semibold text-white">Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex flex-col ${
              message.sender === username ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>{message.sender}</span>
              <span>·</span>
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
            </div>
            <div
              className={`mt-1 px-4 py-2 rounded-lg max-w-[80%] ${
                message.sender === username
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-700 text-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-dark-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-dark-700 text-white rounded-md px-4 py-2"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatBox;