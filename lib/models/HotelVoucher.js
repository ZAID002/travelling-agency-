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
  qty: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const HotelVoucherSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'Tentative',
  },
  issueDate: String,
  clientName: String,
  guestName: String,
  stays: [StaySchema],
  makkahContact: String,
  madinahContact: String,
  importantNotes: String,
  rateOfExchange: { type: String, default: '77.50' },
  optionalDate: String,
  regards: { type: String, default: 'MURTUZA' },
  bank1Title: { type: String, default: 'Air One Hotels' },
  bank1Name: { type: String, default: 'Meezan Bank' },
  bank1Account: { type: String, default: '01970109213093' },
  bank1Branch: { type: String, default: 'Sharafabad Branch-Karachi' },
  bank2Title: { type: String, default: 'Air One Travels' },
  bank2Name: { type: String, default: 'Habib Bank Limited' },
  bank2Account: { type: String, default: '54497000100203' },
  bank2Branch: { type: String, default: 'Sharafabad Branch' },
  isMaheen: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.HotelVoucher || mongoose.model('HotelVoucher', HotelVoucherSchema);
