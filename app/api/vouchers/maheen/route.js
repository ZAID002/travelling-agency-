import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MaheenVoucher from '@/lib/models/MaheenVoucher';
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
    const nextNumber = url.searchParams.get('nextNumber') === 'true';

    if (nextNumber) {
      const hotelVouchers = await HotelVoucher.find({ voucherNo: /^FTW-/i }, 'voucherNo');
      const maheenVouchers = await MaheenVoucher.find({ voucherNo: /^FTW-/i }, 'voucherNo');
      
      let maxNum = 8000;
      const checkVoucher = (v) => {
        if (!v || !v.voucherNo) return;
        const match = v.voucherNo.match(/^FTW-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      };

      hotelVouchers.forEach(checkVoucher);
      maheenVouchers.forEach(checkVoucher);

      const nextVoucherNo = `FTW-${maxNum + 1}`;
      return NextResponse.json({ nextVoucherNo });
    }
    
    let query = {};
    if (search) {
      query.$or = [
        { voucherNo: { $regex: search, $options: 'i' } },
        { familyHead: { $regex: search, $options: 'i' } },
        { packageCode: { $regex: search, $options: 'i' } },
        { 'mutamers.name': { $regex: search, $options: 'i' } },
        { 'mutamers.passportNo': { $regex: search, $options: 'i' } },
      ];
    }

    const vouchers = await MaheenVoucher.find(query).sort({ createdAt: -1 });
    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Fetch Maheen vouchers error:', error);
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

    const voucher = await MaheenVoucher.findOneAndUpdate(
      { voucherNo },
      body,
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Save Maheen voucher error:', error);
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

    await MaheenVoucher.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Maheen voucher error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
