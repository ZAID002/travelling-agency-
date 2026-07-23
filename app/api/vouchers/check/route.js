import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ETicket from '@/lib/models/ETicket';
import HotelVoucher from '@/lib/models/HotelVoucher';
import MaheenVoucher from '@/lib/models/MaheenVoucher';

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
    const cleanSecondary = secondaryValue.trim();

    // 1. Search in ETicket database (by voucherNo AND passportNo, surname, givenName, or PNR)
    const ticket = await ETicket.findOne({
      voucherNo: { $regex: `^${cleanVoucherNo.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' },
      $or: [
        { 'passengers.passportNo': { $regex: cleanSecondary, $options: 'i' } },
        { 'passengers.surname': { $regex: cleanSecondary, $options: 'i' } },
        { 'passengers.givenName': { $regex: cleanSecondary, $options: 'i' } },
        { 'passengers.pnr': { $regex: cleanSecondary, $options: 'i' } }
      ]
    });

    if (ticket) {
      return NextResponse.json({ type: 'ETicket', data: ticket });
    }

    // Fallback search ETicket by voucherNo alone if secondary matches any passenger
    const ticketByNo = await ETicket.findOne({
      voucherNo: { $regex: `^${cleanVoucherNo.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' }
    });

    if (ticketByNo) {
      const isPassengerMatch = ticketByNo.passengers.some(p => {
        const secUpper = cleanSecondary.toUpperCase();
        return (
          (p.passportNo && p.passportNo.toUpperCase().includes(secUpper)) ||
          (p.surname && p.surname.toUpperCase().includes(secUpper)) ||
          (p.givenName && p.givenName.toUpperCase().includes(secUpper)) ||
          (p.pnr && p.pnr.toUpperCase().includes(secUpper))
        );
      });
      if (isPassengerMatch) {
        return NextResponse.json({ type: 'ETicket', data: ticketByNo });
      }
    }

    // 2. Search in HotelVoucher database
    const hotel = await HotelVoucher.findOne({
      voucherNo: { $regex: `^${cleanVoucherNo.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' },
      $or: [
        { guestName: { $regex: cleanSecondary, $options: 'i' } },
        { clientName: { $regex: cleanSecondary, $options: 'i' } },
        { hcn: { $regex: cleanSecondary, $options: 'i' } }
      ]
    });

    if (hotel) {
      return NextResponse.json({ type: 'HotelVoucher', data: hotel });
    }

    // 3. Search in MaheenVoucher database
    const maheen = await MaheenVoucher.findOne({
      voucherNo: { $regex: `^${cleanVoucherNo.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`, $options: 'i' },
      $or: [
        { familyHead: { $regex: cleanSecondary, $options: 'i' } },
        { 'mutamers.passportNo': { $regex: cleanSecondary, $options: 'i' } },
        { 'mutamers.name': { $regex: cleanSecondary, $options: 'i' } }
      ]
    });

    if (maheen) {
      return NextResponse.json({ type: 'MaheenVoucher', data: maheen });
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

