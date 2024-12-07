import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  inviteCode: {
    type: String,
    required: true,
    unique: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'html'],
    default: 'javascript',
  },
}, { timestamps: true });

export default mongoose.model('Room', roomSchema);