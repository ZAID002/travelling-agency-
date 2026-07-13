import mongoose from 'mongoose';

const StaySchema = new mongoose.Schema({
  city: String,
  hotelName: String,
  rating: String,
  roomType: String,
  roomView: String,
  mealPlan: String,
  checkIn: String,
  checkOut: String,
  totalNights: Number,
  hcn: String,
});

const HotelVoucherSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'Confirmed',
  },
  issueDate: String,
  clientName: String,
  guestName: String,
  stays: [StaySchema],
  makkahContact: String,
  madinahContact: String,
  importantNotes: String,
  isMaheen: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.HotelVoucher || mongoose.model('HotelVoucher', HotelVoucherSchema);
