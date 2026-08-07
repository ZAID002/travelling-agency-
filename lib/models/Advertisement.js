import mongoose from 'mongoose';

const AdvertisementSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    default: '',
  },
  imageUrl: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.models.Advertisement || mongoose.model('Advertisement', AdvertisementSchema);
