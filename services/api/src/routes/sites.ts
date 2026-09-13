import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole } from '@drishyam/shared';

const router = Router();

router.use(authenticateToken);

// GET /sites
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;

    const sites = await prisma.site.findMany({
      where: { organizationId: orgId },
      include: {
        cameras: {
          select: { id: true, status: true },
        },
        alerts: {
          where: { status: 'new' },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = sites.map((s) => ({
      id: s.id,
      organizationId: s.organizationId,
      name: s.name,
      address: s.address,
      timezone: s.timezone,
      cameraCount: s.cameras.length,
      activeAlertCount: s.alerts.length,
      createdAt: s.createdAt.toISOString(),
    }));

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /sites
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, address, timezone } = req.body;

    if (!name) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Site name is required' } });
    }

    const site = await prisma.site.create({
      data: {
        organizationId: req.membership!.organizationId,
        name,
        address: address || null,
        timezone: timezone || 'Asia/Kolkata',
      },
    });

    return res.status(201).json({ data: site });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// PATCH /sites/:id
router.patch('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, address, timezone } = req.body;

    const site = await prisma.site.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(timezone && { timezone }),
      },
    });

    return res.json({ data: site });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
