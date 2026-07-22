import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Hotel from '@/lib/models/Hotel';

export async function GET(request) {
  try {
    await dbConnect();
    const hotels = await Hotel.find({}).sort({ name: 1 });
    return NextResponse.json(hotels);
  } catch (error) {
    console.error('Fetch hotels error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name, city = 'General' } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Hotel name is required' }, { status: 400 });
    }

    const cleanName = name.trim().toUpperCase();

    // Check if hotel already exists (case-insensitive)
    const existing = await Hotel.findOne({ name: { $regex: `^${cleanName}$`, $options: 'i' } });
    if (existing) {
      const allHotels = await Hotel.find({}).sort({ name: 1 });
      return NextResponse.json({ hotel: existing, hotels: allHotels });
    }

    const newHotel = await Hotel.create({
      name: cleanName,
      city: city || 'General'
    });

    const allHotels = await Hotel.find({}).sort({ name: 1 });
    return NextResponse.json({ hotel: newHotel, hotels: allHotels }, { status: 201 });
  } catch (error) {
    console.error('Save hotel error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await Hotel.findByIdAndDelete(id);
    const hotels = await Hotel.find({}).sort({ name: 1 });
    return NextResponse.json({ success: true, hotels });
  } catch (error) {
    console.error('Delete hotel error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
