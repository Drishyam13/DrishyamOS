import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'drishyam-jwt-secret-key-super-secure-change-in-prod';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'drishyam-refresh-secret-key-super-secure-change-in-prod';

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Email and password are required' } });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const defaultMembership = user.memberships[0];
    if (!defaultMembership) {
      return res.status(403).json({ error: { code: 'NO_ORGANIZATION', message: 'User is not assigned to any organization' } });
    }

    const accessToken = jwt.sign(
      {
        userId: user.id,
        organizationId: defaultMembership.organizationId,
        role: defaultMembership.role,
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: defaultMembership.role,
        organizationId: defaultMembership.organizationId,
        organizationName: defaultMembership.organization.name,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /auth/me
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        memberships: {
          include: { organization: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    const currentMembership = req.membership
      ? user.memberships.find((m) => m.organizationId === req.membership!.organizationId)
      : user.memberships[0];

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: currentMembership?.role,
        organizationId: currentMembership?.organizationId,
        organizationName: currentMembership?.organization.name,
        memberships: user.memberships.map((m) => ({
          organizationId: m.organizationId,
          organizationName: m.organization.name,
          role: m.role,
        })),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
