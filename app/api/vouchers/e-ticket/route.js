import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ETicket from '@/lib/models/ETicket';
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
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { voucherNo: { $regex: search, $options: 'i' } },
          { airline: { $regex: search, $options: 'i' } },
          { 'passengers.givenName': { $regex: search, $options: 'i' } },
          { 'passengers.surname': { $regex: search, $options: 'i' } },
          { 'passengers.pnr': { $regex: search, $options: 'i' } },
        ]
      };
    }

    const tickets = await ETicket.find(query).sort({ createdAt: -1 });
    return NextResponse.json(tickets);
  } catch (error) {
    console.error('Fetch e-tickets error:', error);
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

    // Upsert behavior: if it exists, update it. If not, create it.
    const ticket = await ETicket.findOneAndUpdate(
      { voucherNo },
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(ticket);
  } catch (error) {
    console.error('Save e-ticket error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
