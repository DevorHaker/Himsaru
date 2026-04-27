import { verifyToken } from '../utils/jwt.js';
import prisma from '../models/prisma.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, no token provided' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ status: 'error', message: 'Not authorized, token failed or expired' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, firstName: true, lastName: true }
    });

    if (!user) {
      return res.status(401).json({ status: 'error', message: 'User associated with token no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(500).json({ status: 'error', message: 'Internal server error during authentication' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        status: 'error', 
        message: `Role (${req.user?.role || 'unknown'}) is not authorized to access this route` 
      });
    }
    next();
  };
};

export const requireAdmin = authorize('ADMIN');
export const requireDistributor = authorize('DISTRIBUTOR', 'ADMIN');
