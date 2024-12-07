import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb+srv://kulkarniswapnil0000:Zzksbcfmrt9Qx0cW@codecollab.399pn.mongodb.net/?retryWrites=true&w=majority&appName=CodeCollab')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

const rooms = new Map();

io.on('connection', (socket) => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    if (!rooms.has(roomId)) {
      rooms.set(roomId, { users: new Set(), code: '' });
    }
    rooms.get(roomId).users.add(userId);
    
    socket.to(roomId).emit('user-joined', userId);
  });

  socket.on('code-change', (roomId, code) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).code = code;
      socket.to(roomId).emit('code-update', code);
    }
  });

  socket.on('chat-message', (roomId, message) => {
    socket.to(roomId).emit('chat-message', message);
  });

  socket.on('leave-room', (roomId, userId) => {
    if (rooms.has(roomId)) {
      rooms.get(roomId).users.delete(userId);
      if (rooms.get(roomId).users.size === 0) {
        rooms.delete(roomId);
      }
    }
    socket.to(roomId).emit('user-left', userId);
    socket.leave(roomId);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});