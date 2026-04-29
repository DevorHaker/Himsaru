import bcrypt from 'bcryptjs';
import prisma from '../models/prisma.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    // Note: In production, role assignment via API should be restricted!
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CUSTOMER' 
      }
    });

    const token = generateToken(user.id, user.role);

    res.status(201).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    res.status(500).json({ status: 'error', message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ status: 'error', message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  res.status(200).json({
    status: 'success',
    data: req.user
  });
};

export const updateMe = async (req, res) => {
  try {
    const { firstName, lastName, phone, address, city, state, pincode } = req.body;
    
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        pincode
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        state: updatedUser.state,
        pincode: updatedUser.pincode,
        role: updatedUser.role
      }
    });
  } catch (error) {
    console.error('[Update Profile Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update profile' });
  }
};
