import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDb } from '../src/config/db.js';
import '../src/models/index.js';
import { User } from '../src/models/User.js';

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name = process.env.SEED_ADMIN_NAME || 'Admin';

if (!email || !password) {
  console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in api/.env');
  process.exit(1);
}

await connectDb();

const existing = await User.findOne({ email: email.trim().toLowerCase() });
if (existing) {
  if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    console.log('Updated existing user to admin:', existing.email);
  } else {
    console.log('Admin already exists:', existing.email);
  }
  process.exit(0);
}

const passwordHash = await bcrypt.hash(password, 10);
const admin = await User.create({
  name,
  email: email.trim().toLowerCase(),
  passwordHash,
  role: 'admin',
  interests: [],
});

console.log('Created admin:', admin.email);
process.exit(0);
