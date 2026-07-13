import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ETicket from '@/lib/models/ETicket';
import HotelVoucher from '@/lib/models/HotelVoucher';

export async function POST(request) {
  try {
    await dbConnect();
    const { voucherNo, secondaryValue } = await request.json();

    if (!voucherNo || !secondaryValue) {
      return NextResponse.json(
        { error: 'Voucher Number and Passport/Surname are required.' },
        { status: 400 }
      );
    }

    const cleanVoucherNo = voucherNo.trim();
    const cleanSecondary = secondaryValue.trim().toUpperCase();

    // 1. Search in ETicket database
    const ticket = await ETicket.findOne({
      voucherNo: cleanVoucherNo,
      'passengers.passportNo': cleanSecondary
    });

    if (ticket) {
      return NextResponse.json({ type: 'ETicket', data: ticket });
    }

    // 2. Search in HotelVoucher database
    const hotel = await HotelVoucher.findOne({
      voucherNo: cleanVoucherNo,
      guestName: { $regex: cleanSecondary, $options: 'i' }
    });

    if (hotel) {
      return NextResponse.json({ type: 'HotelVoucher', data: hotel });
    }

    return NextResponse.json(
      { error: 'No matching booking record found. Please verify your entries.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Check booking API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
