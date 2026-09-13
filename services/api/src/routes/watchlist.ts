import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole, WatchlistCategory } from '@drishyam/shared';

const router = Router();

router.use(authenticateToken);

// GET /watchlist
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;

    const items = await prisma.faceWatchlist.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = items.map((i: any) => ({
      id: i.id,
      organizationId: i.organizationId,
      name: i.name,
      category: i.category as WatchlistCategory,
      notes: i.notes || undefined,
      imageUrl: i.imageUrl || undefined,
      isActive: i.isActive,
      createdAt: i.createdAt.toISOString(),
    }));

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /watchlist
router.post('/', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, category, notes, imageUrl } = req.body;
    const orgId = req.membership!.organizationId;

    if (!name || !category) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Name and category are required' } });
    }

    const item = await prisma.faceWatchlist.create({
      data: {
        organizationId: orgId,
        name,
        category: category as WatchlistCategory,
        notes: notes || null,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      },
    });

    return res.status(201).json({
      data: {
        ...item,
        createdAt: item.createdAt.toISOString(),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// DELETE /watchlist/:id
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.faceWatchlist.delete({
      where: { id },
    });
    return res.json({ success: true });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
