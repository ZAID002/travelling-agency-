import mongoose from 'mongoose';

const StaySchema = new mongoose.Schema({
  city: String,
  hotelName: String,
  rating: String,
  roomType: String,
  customRoomType: String,
  roomView: String,
  customRoomView: String,
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
    default: 'Definite',
  },
  issueDate: String,
  clientName: String,
  guestName: String,
  stays: [StaySchema],
  
  // Additional Info
  checkInTime: { type: String, default: '16:00' },
  checkOutTime: { type: String, default: '14:00' },
  remarks: String,

  // Contact Details
  makkahContactName: String,
  makkahContactNo: String,
  madinahContactName: String,
  madinahContactNo: String,

  // Company Details
  companyName: { type: String, default: 'FLY TO WAY TRAVEL & TOURS' },
  officeAddress: { type: String, default: 'College Road, Lahore - Pakistan' },
  phone: { type: String, default: '+923082122760' },
  email: { type: String, default: 'info@flytoway.com' },
  authorizedPerson: { type: String, default: 'MURTUZA' },
  importantNotes: String,

  isMaheen: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default mongoose.models.HotelVoucher || mongoose.model('HotelVoucher', HotelVoucherSchema);
