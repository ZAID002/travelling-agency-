import bcrypt from 'bcryptjs';
import dbConnect from './db';
import Admin from './models/Admin';

export async function seedAdmin() {
  try {
    await dbConnect();
    const count = await Admin.countDocuments();
    if (count === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || 'admin';
      const defaultPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await Admin.create({
        username: defaultUsername,
        password: hashedPassword,
      });
      console.log(`[SEED] Created default admin account: ${defaultUsername}`);
    }
  } catch (error) {
    console.error('[SEED] Error seeding admin account:', error);
  }
}
