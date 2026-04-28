import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@himsaru.in';
  const password = 'HimsaruAdmin2026!'; // Default password

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', email);
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN', // Ensure this matches your Prisma enum
      },
    });

    console.log('🎉 Admin user created successfully!');
    console.log('-----------------------------------');
    console.log('Email:', admin.email);
    console.log('Password:', password);
    console.log('Role:', admin.role);
    console.log('-----------------------------------');
    console.log('⚠️ IMPORTANT: Please change this password after logging in.');
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
