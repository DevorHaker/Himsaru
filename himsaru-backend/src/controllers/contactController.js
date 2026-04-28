import prisma from '../models/prisma.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ status: 'error', message: 'Please fill in all required fields.' });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    res.status(201).json({ status: 'success', message: 'Message received!', data: contact });
  } catch (error) {
    console.error('[Contact Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message.' });
  }
};
