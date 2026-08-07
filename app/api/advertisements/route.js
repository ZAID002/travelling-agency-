import { NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import dbConnect from '@/lib/db';
import Advertisement from '@/lib/models/Advertisement';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET - fetch ads (public gets active only; admin can pass ?all=true to get all)
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    // If admin requests all ads, verify token
    if (showAll) {
      const cookieStore = await cookies();
      const token = cookieStore.get('token')?.value;
      const user = verifyToken(token);
      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const ads = await Advertisement.find({}).sort({ createdAt: -1 });
      return NextResponse.json(ads);
    }

    // Public: only active ads
    const ads = await Advertisement.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json(ads);
  } catch (error) {
    console.error('GET /api/advertisements error:', error);
    return NextResponse.json({ error: 'Failed to fetch advertisements' }, { status: 500 });
  }
}

// POST - upload a new ad image (admin only)
export async function POST(request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('image');
    const title = formData.get('title') || '';

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP, and GIF images are allowed' }, { status: 400 });
    }

    // Max size: 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image size must be less than 5MB' }, { status: 400 });
    }

    // Prepare upload directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'ads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`;
    const filepath = path.join(uploadsDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    const imageUrl = `/uploads/ads/${filename}`;

    // Save to DB
    await dbConnect();
    const ad = await Advertisement.create({ title, imageUrl, isActive: true });

    return NextResponse.json({ success: true, ad }, { status: 201 });
  } catch (error) {
    console.error('POST /api/advertisements error:', error);
    return NextResponse.json({ error: 'Failed to upload advertisement' }, { status: 500 });
  }
}

// DELETE - remove an ad (admin only)
export async function DELETE(request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    await dbConnect();
    const ad = await Advertisement.findById(id);
    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    // Delete image file from disk
    try {
      const imagePath = path.join(process.cwd(), 'public', ad.imageUrl);
      await unlink(imagePath);
    } catch (fileErr) {
      // File might already be gone, continue anyway
      console.warn('Could not delete image file:', fileErr.message);
    }

    await Advertisement.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/advertisements error:', error);
    return NextResponse.json({ error: 'Failed to delete advertisement' }, { status: 500 });
  }
}

// PATCH - toggle isActive (admin only)
export async function PATCH(request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, isActive } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'Ad ID is required' }, { status: 400 });
    }

    await dbConnect();
    const ad = await Advertisement.findByIdAndUpdate(id, { isActive }, { new: true });
    if (!ad) {
      return NextResponse.json({ error: 'Advertisement not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ad });
  } catch (error) {
    console.error('PATCH /api/advertisements error:', error);
    return NextResponse.json({ error: 'Failed to update advertisement' }, { status: 500 });
  }
}
