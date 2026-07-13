import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/lib/models/Inquiry';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, phone, packageType, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Save directly to MongoDB Atlas database
    const inquiry = await Inquiry.create({
      name,
      email,
      phone,
      packageType,
      message
    });

    console.log('=== NEW PILGRIM INQUIRY RECEIVED & SAVED ===');
    console.log(`ID: ${inquiry._id}`);
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone || 'N/A'}`);
    console.log(`Package: ${packageType || 'General Enquiry'}`);
    console.log(`Message: ${message}`);
    console.log('============================================');

    // Here you can integrate Nodemailer/Resend to email it to yourself in production
    // e.g., await sendEmail({ name, email, phone, packageType, message });

    return NextResponse.json({ success: true, message: 'Your inquiry has been sent successfully!' });
  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
