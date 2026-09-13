import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole, AlertStatus, AlertType, AlertSeverity, AlertDTO } from '@drishyam/shared';
import { broadcastAlertUpdated } from '../socket';

const router = Router();

router.use(authenticateToken);

// Format helper
function formatAlert(a: any): AlertDTO {
  return {
    id: a.id,
    organizationId: a.organizationId,
    siteId: a.siteId,
    siteName: a.site?.name,
    cameraId: a.cameraId,
    cameraName: a.camera?.name,
    alertType: a.alertType as AlertType,
    severity: a.severity as AlertSeverity,
    confidence: a.confidence,
    status: a.status as AlertStatus,
    detectedAt: a.detectedAt.toISOString(),
    clipUrl: a.clipPath || undefined,
    thumbnailUrl: a.thumbnailPath || undefined,
    metadata: JSON.parse(a.metadata || '{}'),
    acknowledgedBy: a.acknowledgedBy || undefined,
    acknowledgedByName: a.user?.fullName || undefined,
    acknowledgedAt: a.acknowledgedAt ? a.acknowledgedAt.toISOString() : undefined,
    resolvedAt: a.resolvedAt ? a.resolvedAt.toISOString() : undefined,
    actions: a.actions?.map((act: any) => ({
      id: act.id,
      alertId: act.alertId,
      userId: act.userId,
      userName: act.user?.fullName,
      userRole: act.user?.memberships?.[0]?.role,
      action: act.action,
      note: act.note,
      createdAt: act.createdAt.toISOString(),
    })),
    createdAt: a.createdAt.toISOString(),
  };
}

// GET /alerts
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;
    const { siteId, cameraId, alertType, severity, status, limit = '50', page = '1' } = req.query;

    const whereClause: any = { organizationId: orgId };

    if (siteId && typeof siteId === 'string') whereClause.siteId = siteId;
    if (cameraId && typeof cameraId === 'string') whereClause.cameraId = cameraId;
    if (alertType && typeof alertType === 'string') whereClause.alertType = alertType;
    if (severity && typeof severity === 'string') whereClause.severity = severity;
    if (status && typeof status === 'string') whereClause.status = status;

    const take = parseInt(limit as string, 10);
    const skip = (parseInt(page as string, 10) - 1) * take;

    const [alerts, total] = await Promise.all([
      prisma.alert.findMany({
        where: whereClause,
        include: {
          site: { select: { name: true } },
          camera: { select: { name: true } },
          user: { select: { fullName: true } },
          actions: {
            include: { user: { select: { fullName: true, memberships: { select: { role: true } } } } },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { detectedAt: 'desc' },
        take,
        skip,
      }),
      prisma.alert.count({ where: whereClause }),
    ]);

    return res.json({
      data: alerts.map(formatAlert),
      meta: {
        total,
        page: parseInt(page as string, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /alerts/:id
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const alert = await prisma.alert.findFirst({
      where: { id, organizationId: req.membership!.organizationId },
      include: {
        site: { select: { name: true } },
        camera: { select: { name: true } },
        user: { select: { fullName: true } },
        actions: {
          include: { user: { select: { fullName: true, memberships: { select: { role: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!alert) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    return res.json({ data: formatAlert(alert) });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /alerts/:id/acknowledge
router.post('/:id/acknowledge', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER, UserRole.OPERATOR]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user!.id;

    const alert = await prisma.alert.findFirst({
      where: { id, organizationId: req.membership!.organizationId },
    });

    if (!alert) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
        actions: {
          create: {
            userId,
            action: 'acknowledge',
            note: note || 'Alert acknowledged by operator',
          },
        },
      },
      include: {
        site: { select: { name: true } },
        camera: { select: { name: true } },
        user: { select: { fullName: true } },
        actions: {
          include: { user: { select: { fullName: true, memberships: { select: { role: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const formatted = formatAlert(updated);
    broadcastAlertUpdated(formatted);

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /alerts/:id/resolve
router.post('/:id/resolve', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER, UserRole.OPERATOR]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user!.id;

    const alert = await prisma.alert.findFirst({
      where: { id, organizationId: req.membership!.organizationId },
    });

    if (!alert) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        actions: {
          create: {
            userId,
            action: 'resolve',
            note: note || 'Incident resolved',
          },
        },
      },
      include: {
        site: { select: { name: true } },
        camera: { select: { name: true } },
        user: { select: { fullName: true } },
        actions: {
          include: { user: { select: { fullName: true, memberships: { select: { role: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const formatted = formatAlert(updated);
    broadcastAlertUpdated(formatted);

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /alerts/:id/false-positive
router.post('/:id/false-positive', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER, UserRole.OPERATOR]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user!.id;

    const alert = await prisma.alert.findFirst({
      where: { id, organizationId: req.membership!.organizationId },
    });

    if (!alert) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Alert not found' } });
    }

    const updated = await prisma.alert.update({
      where: { id },
      data: {
        status: AlertStatus.FALSE_POSITIVE,
        actions: {
          create: {
            userId,
            action: 'false_positive',
            note: note || 'Marked as false positive',
          },
        },
      },
      include: {
        site: { select: { name: true } },
        camera: { select: { name: true } },
        user: { select: { fullName: true } },
        actions: {
          include: { user: { select: { fullName: true, memberships: { select: { role: true } } } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const formatted = formatAlert(updated);
    broadcastAlertUpdated(formatted);

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
