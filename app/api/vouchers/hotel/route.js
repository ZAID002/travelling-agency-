import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelVoucher from '@/lib/models/HotelVoucher';
import { verifyToken } from '@/lib/auth';

function getAuthUser(request) {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const isMaheen = url.searchParams.get('isMaheen') === 'true';
    
    let query = { isMaheen };
    if (search) {
      query.$or = [
        { voucherNo: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { 'stays.hotelName': { $regex: search, $options: 'i' } },
      ];
    }

    const vouchers = await HotelVoucher.find(query).sort({ createdAt: -1 });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Fetch hotel vouchers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();

    const { voucherNo } = body;
    if (!voucherNo) {
      return NextResponse.json({ error: 'Voucher number is required' }, { status: 400 });
    }

    const voucher = await HotelVoucher.findOneAndUpdate(
      { voucherNo },
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Save hotel voucher error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await HotelVoucher.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete hotel voucher error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
