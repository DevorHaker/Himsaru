import prisma from '../models/prisma.js';

export const submitApplication = async (req, res) => {
  try {
    const { fullName, phone, email, city, state, businessType, experience, message } = req.body;

    if (!fullName || !phone || !email || !city || !state || !businessType || !experience) {
      return res.status(400).json({ status: 'error', message: 'Please fill in all required fields.' });
    }

    const application = await prisma.distributorApplication.create({
      data: { fullName, phone, email, city, state, businessType, experience, message },
    });

    res.status(201).json({ status: 'success', message: 'Application submitted!', data: application });
  } catch (error) {
    console.error('[Distributor Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit application.' });
  }
};
