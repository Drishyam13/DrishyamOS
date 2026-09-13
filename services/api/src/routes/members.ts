import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '@drishyam/shared';

const router = Router();

router.use(authenticateToken);

// GET /members
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: orgId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, isActive: true, lastLoginAt: true },
        },
      },
    });

    const formatted = members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      email: m.user.email,
      fullName: m.user.fullName,
      role: m.role,
      siteIds: JSON.parse(m.siteIds || '[]'),
      isActive: m.user.isActive,
      lastLoginAt: m.user.lastLoginAt ? m.user.lastLoginAt.toISOString() : undefined,
      createdAt: m.createdAt.toISOString(),
    }));

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /members/invite
router.post('/invite', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, fullName, role, siteIds } = req.body;
    const orgId = req.membership!.organizationId;

    if (!email || !fullName || !role) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'email, fullName, and role are required' } });
    }

    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      const temporaryPassword = await bcrypt.hash('Drishyam123!', 10);
      user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          fullName,
          passwordHash: temporaryPassword,
        },
      });
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return res.status(409).json({ error: { code: 'ALREADY_MEMBER', message: 'User is already a member of this organization' } });
    }

    const member = await prisma.organizationMember.create({
      data: {
        organizationId: orgId,
        userId: user.id,
        role: role as UserRole,
        siteIds: JSON.stringify(siteIds || []),
      },
      include: { user: true },
    });

    return res.status(201).json({
      data: {
        id: member.id,
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        role: member.role,
        siteIds: JSON.parse(member.siteIds),
        createdAt: member.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
