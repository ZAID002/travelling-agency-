import mongoose from 'mongoose';

const MaheenFlightSchema = new mongoose.Schema({
  type: { type: String, enum: ['DEPARTURE', 'ARRIVAL'] },
  flightNo: String,
  sector: String,
  depDate: String,
  depTime: String,
  arrTime: String,
});

const MaheenStaySchema = new mongoose.Schema({
  city: String,
  hotelName: String,
  view: String,
  mealPlan: String,
  hcn: String,
  roomType: String,
  checkIn: String,
  checkOut: String,
  totalNights: Number,
});

const MutamerSchema = new mongoose.Schema({
  passportNo: String,
  name: String,
  gender: String,
  paxType: String, // Adult, Child, Infant
  bed: { type: String, default: 'Yes' },
  groupNo: String,
  visaNo: String,
  pnr: String,
});

const MaheenVoucherSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
  },
  issueDate: String,
  packageCode: String,
  paxNo: String,
  bedsNo: String,
  familyHead: String,
  ubNo: String,
  mNo: String,
  status: {
    type: String,
    default: 'Definite',
  },
  isMaheen: {
    type: Boolean,
    default: true,
  },
  
  // Flights Details
  flights: [MaheenFlightSchema],

  // Accommodation Grid
  stays: [MaheenStaySchema],

  // Transport Detail
  transportTravelDate: String,
  transportTransporter: String,
  transportType: String,
  transportDesc: String,

  // Mutamers
  mutamers: [MutamerSchema],

  // Instructions & Ground Contacts
  specialInstructions: String,
  makkahContactName: String,
  makkahContactNo: String,
  madinahContactName: String,
  madinahContactNo: String,

  // Company Details
  companyName: { type: String, default: 'FLY TO WAY TRAVEL & TOURS' },
  officeAddress: { type: String, default: 'College Road, Lahore - Pakistan' },
  phone: { type: String, default: '+923082122760' },
  email: { type: String, default: 'info@flytoway.com' },
  authorizedPerson: { type: String, default: 'SHUJA CH' },
  importantNotes: String,
}, { timestamps: true });

export default mongoose.models.MaheenVoucher || mongoose.model('MaheenVoucher', MaheenVoucherSchema);
