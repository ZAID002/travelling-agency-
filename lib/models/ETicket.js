import mongoose from 'mongoose';

const PassengerSchema = new mongoose.Schema({
  title: String,
  givenName: String,
  surname: String,
  dob: String,
  nationality: String,
  passportNo: String,
  passportExpiry: String,
  pnr: String,
  status: String,
});

const SectorSchema = new mongoose.Schema({
  flightNo: String,
  from: String,
  to: String,
  depDate: String,
  depTime: String,
  arrDate: String,
  arrTime: String,
});

const ETicketSchema = new mongoose.Schema({
  voucherNo: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    default: 'Confirmed',
  },
  airline: {
    type: String,
    required: true,
  },
  passengers: [PassengerSchema],
  sectors: [SectorSchema],
  classCabin: String,
  baggageChecked: String,
  baggageHand: String,
  meals: String,
  seatNo: String,
  otherInfo: String,
}, { timestamps: true });

export default mongoose.models.ETicket || mongoose.model('ETicket', ETicketSchema);
