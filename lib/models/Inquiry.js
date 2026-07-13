import mongoose from 'mongoose';

const InquirySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
  },
  phone: String,
  packageType: String,
  message: {
    type: String,
    required: [true, 'Please provide a message'],
  },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model('Inquiry', InquirySchema);
