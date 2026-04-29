import prisma from '../models/prisma.js';
import { sendEmail } from '../utils/email.js';

export const submitApplication = async (req, res) => {
  try {
    const { fullName, phone, email, city, state, businessType, experience, message } = req.body;

    if (!fullName || !phone || !email || !city || !state || !businessType || !experience) {
      return res.status(400).json({ status: 'error', message: 'Please fill in all required fields.' });
    }

    const application = await prisma.distributorApplication.create({
      data: { fullName, phone, email, city, state, businessType, experience, message },
    });

    // Send notification email asynchronously
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || process.env.EMAIL_FROM;
    if (adminEmail) {
      const emailHtml = `
        <h2>New Distributor Application</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Location:</strong> ${city}, ${state}</p>
        <p><strong>Business Type:</strong> ${businessType}</p>
        <p><strong>Experience:</strong> ${experience}</p>
        ${message ? `<p><strong>Message:</strong></p><blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${message}</blockquote>` : ''}
        <p><br/><a href="${process.env.FRONTEND_URL || 'https://himsaru.vercel.app'}/admin">View in Admin Dashboard</a></p>
      `;
      sendEmail({
        to: adminEmail,
        subject: `[HIMSARU] New Distributor App from ${fullName}`,
        html: emailHtml,
      }).catch(err => console.error('[Email Notification Failed]:', err));
    }

    res.status(201).json({ status: 'success', message: 'Application submitted!', data: application });
  } catch (error) {
    console.error('[Distributor Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit application.' });
  }
};
