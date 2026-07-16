import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/lib/models/Invoice';
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
      query.$or = [
        { invoiceNo: { $regex: search, $options: 'i' } },
        { clientName: { $regex: search, $options: 'i' } },
        { guestName: { $regex: search, $options: 'i' } },
        { hotelName: { $regex: search, $options: 'i' } },
      ];
    }

    const invoices = await Invoice.find(query).sort({ createdAt: -1 });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Fetch invoices error:', error);
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

    const { invoiceNo } = body;
    if (!invoiceNo) {
      return NextResponse.json({ error: 'Invoice number is required' }, { status: 400 });
    }

    const invoice = await Invoice.findOneAndUpdate(
      { invoiceNo },
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Save invoice error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
