import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Plus, LogOut, UserPlus, Trash2 } from 'lucide-react';

function Home() {
  const [rooms, setRooms] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomLanguage, setNewRoomLanguage] = useState('javascript');
  const [inviteCode, setInviteCode] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setRooms(data);
    } catch (error) {
      toast.error('Failed to fetch rooms');
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ name: newRoomName, language: newRoomLanguage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setRooms([...rooms, data]);
      setShowCreateModal(false);
      setNewRoomName('');
      toast.success('Room created successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!res.ok) throw new Error('Failed to delete room');
      
      setRooms(rooms.filter(room => room._id !== roomId));
      toast.success('Room deleted successfully!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const joinRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${inviteCode}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setShowJoinModal(false);
      setInviteCode('');
      navigate(`/room/${inviteCode}`);
    } catch (error) {
      toast.error('Invalid invite code');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <nav className="bg-dark-800 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">CodeCollab</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user?.username}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-gray-300 hover:text-white"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold text-white">Your Rooms</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              <UserPlus size={20} />
              Join Room
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              <Plus size={20} />
              Create Room
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div
              key={room._id}
              className="bg-dark-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{room.name}</h3>
              <p className="text-gray-400 mb-4">Language: {room.language}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/room/${room.inviteCode}`)}
                    className="text-blue-500 hover:text-blue-400"
                  >
                    Join Room
                  </button>
                  <button
                    onClick={() => deleteRoom(room._id)}
                    className="text-red-500 hover:text-red-400"
                    title="Delete Room"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <p className="text-gray-500 text-sm">Invite Code: {room.inviteCode}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Create New Room</h2>
            <form onSubmit={createRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-dark-700 text-white rounded-md px-4 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Language
                </label>
                <select
                  value={newRoomLanguage}
                  onChange={(e) => setNewRoomLanguage(e.target.value)}
                  className="w-full bg-dark-700 text-white rounded-md px-4 py-2"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="html">HTML</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">Join Room</h2>
            <form onSubmit={joinRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Invite Code
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  placeholder="Enter room invite code"
                  className="w-full bg-dark-700 text-white rounded-md px-4 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="text-gray-400 hover:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;