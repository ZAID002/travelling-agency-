import mongoose from 'mongoose';

const InvoiceItemSchema = new mongoose.Schema({
  qty: { type: Number, default: 1 },
  roomType: String,
  view: String,
  meal: String,
  checkIn: String,
  checkOut: String,
  nights: { type: Number, default: 0 },
  hcn: String, // Hotel Confirmation Number
  rate: { type: Number, default: 0 },
  total: { type: Number, default: 0 }
});

const BankDetailSchema = new mongoose.Schema({
  accountTitle: String,
  bankName: String,
  accountNo: String,
  branchName: String
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNo: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    default: 'Tentative'
  },
  title: {
    type: String,
    default: 'Hotel Booking Confirmation'
  },
  companyLogo: {
    type: String,
    default: 'flytoway'
  },
  clientName: String,
  guestName: String,
  hotelName: String,
  issueDate: String,
  dueDate: String,
  rateOfExchange: { type: Number, default: 77.50 },
  items: [InvoiceItemSchema],
  hotelDetails: String,
  checkInTime: { type: String, default: '18:00 KSA' },
  checkOutTime: { type: String, default: '12:00 KSA' },
  bankDetails: [BankDetailSchema],
  authorizedPerson: { type: String, default: 'SHUJA CH' },
  remarks: String,
  
  // Custom contact details (preloaded with defaults)
  officeAddress: { type: String, default: 'College Road, Lahore - Pakistan' },
  phone: { type: String, default: '+923082122760' },
  email: { type: String, default: 'info@flytoway.com' }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);
