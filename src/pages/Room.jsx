import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import CodeEditor from '../components/CodeEditor';
import ChatBox from '../components/ChatBox';
import { LogOut, Copy, Check } from 'lucide-react';

function Room() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setRoom(data);
      } catch (error) {
        toast.error('Failed to fetch room details');
        navigate('/');
      }
    };

    fetchRoom();
  }, [roomId, navigate]);

  useEffect(() => {
    if (!socket || !room) return;

    socket.emit('join-room', roomId, user.username);

    socket.on('user-joined', (username) => {
      toast.success(`${username} joined the room`);
    });

    socket.on('user-left', (username) => {
      toast.success(`${username} left the room`);
    });

    socket.on('code-update', (newCode) => {
      setCode(newCode);
    });

    return () => {
      socket.emit('leave-room', roomId, user.username);
      socket.off('user-joined');
      socket.off('user-left');
      socket.off('code-update');
    };
  }, [socket, room, roomId, user.username]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    socket?.emit('code-change', roomId, newCode);
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!room) return null;

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <nav className="bg-dark-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">{room.name}</h1>
            <span className="text-gray-400">·</span>
            <span className="text-gray-300 capitalize">{room.language}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Invite Code:</span>
              <code className="bg-dark-700 px-2 py-1 rounded text-gray-300">{roomId}</code>
              <button
                onClick={copyInviteCode}
                className="text-gray-300 hover:text-white"
                title="Copy invite code"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <LogOut size={20} />
              Leave Room
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 p-6 gap-6 grid grid-cols-[1fr,300px]">
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={room.language}
        />
        <ChatBox
          socket={socket}
          roomId={roomId}
          username={user.username}
        />
      </div>
    </div>
  );
}

export default Room;