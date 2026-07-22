import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  city: {
    type: String,
    enum: ['Makkah', 'Madinah', 'General'],
    default: 'General',
  },
}, { timestamps: true });

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);
