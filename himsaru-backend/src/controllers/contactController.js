import prisma from '../models/prisma.js';
import { sendEmail } from '../utils/email.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ status: 'error', message: 'Please fill in all required fields.' });
    }

    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message },
    });

    // Send notification email
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM;
    if (adminEmail) {
      const emailHtml = `
        <h2>New Contact Message Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${message}</blockquote>
        <p><a href="${process.env.FRONTEND_URL || 'https://himsaru.vercel.app'}/admin">View in Admin Dashboard</a></p>
      `;
      await sendEmail({
        to: adminEmail,
        subject: `[HIMSARU] New Contact Message: ${subject}`,
        html: emailHtml,
      });
    }

    res.status(201).json({ status: 'success', message: 'Message received!', data: contact });
  } catch (error) {
    console.error('[Contact Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to send message.' });
  }
};
