import express from 'express';
import jwt from 'jsonwebtoken';
import Room from '../models/Room.js';
import { nanoid } from 'nanoid';

const router = express.Router();
const JWT_SECRET = 'your-secret-key';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate' });
  }
};

router.post('/', auth, async (req, res) => {
  try {
    const { name, language } = req.body;
    const room = new Room({
      name,
      language,
      inviteCode: nanoid(10),
      owner: req.userId,
    });
    await room.save();
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.userId });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:inviteCode', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ inviteCode: req.params.inviteCode });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:roomId', auth, async (req, res) => {
  try {
    const room = await Room.findOne({ _id: req.params.roomId, owner: req.userId });
    if (!room) {
      return res.status(404).json({ message: 'Room not found or unauthorized' });
    }
    await room.deleteOne();
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;