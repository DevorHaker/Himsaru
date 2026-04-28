import prisma from '../models/prisma.js';

// GET /api/admin/stats
export const getStats = async (req, res) => {
  try {
    const [totalContacts, unreadContacts, totalApplications, pendingApplications, totalUsers] =
      await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
        prisma.distributorApplication.count(),
        prisma.distributorApplication.count({ where: { status: 'PENDING' } }),
        prisma.user.count(),
      ]);

    res.status(200).json({
      status: 'success',
      data: { totalContacts, unreadContacts, totalApplications, pendingApplications, totalUsers },
    });
  } catch (error) {
    console.error('[Admin Stats Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch stats' });
  }
};

// GET /api/admin/contacts
export const getContacts = async (req, res) => {
  try {
    const contacts = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ status: 'success', data: contacts });
  } catch (error) {
    console.error('[Admin Contacts Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch contact messages' });
  }
};

// PATCH /api/admin/contacts/:id/read
export const markContactRead = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await prisma.contactMessage.update({
      where: { id },
      data: { status: 'READ' },
    });
    res.status(200).json({ status: 'success', data: contact });
  } catch (error) {
    console.error('[Admin Contact Read Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update contact status' });
  }
};

// DELETE /api/admin/contacts/:id
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.contactMessage.delete({ where: { id } });
    res.status(200).json({ status: 'success', message: 'Contact message deleted' });
  } catch (error) {
    console.error('[Admin Delete Contact Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete contact message' });
  }
};

// GET /api/admin/distributors
export const getDistributors = async (req, res) => {
  try {
    const applications = await prisma.distributorApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ status: 'success', data: applications });
  } catch (error) {
    console.error('[Admin Distributors Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch distributor applications' });
  }
};

// PATCH /api/admin/distributors/:id/status
export const updateDistributorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // PENDING | APPROVED | REJECTED

    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ status: 'error', message: 'Invalid status value' });
    }

    const application = await prisma.distributorApplication.update({
      where: { id },
      data: { status },
    });
    res.status(200).json({ status: 'success', data: application });
  } catch (error) {
    console.error('[Admin Status Update Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update application status' });
  }
};

// GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    });
    res.status(200).json({ status: 'success', data: users });
  } catch (error) {
    console.error('[Admin Users Error]:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};
