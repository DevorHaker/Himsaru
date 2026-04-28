import express from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../models/prisma.js';

const router = express.Router();

router.get('/create-admin-xyz123', async (req, res) => {
  try {
    const email = 'admin@himsaru.in';
    const password = 'HimsaruAdmin2026!'; // Default password

    const existingAdmin = await prisma.user.findUnique({ where: { email } });
    if (existingAdmin) {
      return res.status(200).send('Admin already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'System',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });

    res.status(200).send('Admin user created successfully! You can now login at /admin.');
  } catch (error) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

export default router;
