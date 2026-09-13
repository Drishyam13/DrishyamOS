import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { AlertStatus } from '@drishyam/shared';

const router = Router();

router.use(authenticateToken);

// GET /analytics/summary
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;

    const [totalAlerts, criticalAlerts, falsePositives, alerts] = await Promise.all([
      prisma.alert.count({ where: { organizationId: orgId } }),
      prisma.alert.count({ where: { organizationId: orgId, severity: 'critical' } }),
      prisma.alert.count({ where: { organizationId: orgId, status: AlertStatus.FALSE_POSITIVE } }),
      prisma.alert.findMany({
        where: { organizationId: orgId },
        select: { alertType: true, detectedAt: true },
      }),
    ]);

    const alertsByType: Record<string, number> = {
      weapon: 0,
      violence: 0,
      intrusion: 0,
      loitering: 0,
    };

    alerts.forEach((a) => {
      alertsByType[a.alertType] = (alertsByType[a.alertType] || 0) + 1;
    });

    const falsePositivePercentage = totalAlerts > 0 ? (falsePositives / totalAlerts) * 100 : 0;

    // Hourly distribution
    const hourlyMap: Record<number, number> = {};
    alerts.forEach((a) => {
      const hr = new Date(a.detectedAt).getHours();
      hourlyMap[hr] = (hourlyMap[hr] || 0) + 1;
    });

    const hourlyAlertDistribution = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      count: hourlyMap[i] || 0,
    }));

    return res.json({
      data: {
        totalAlerts,
        criticalAlerts,
        avgResponseTimeSeconds: 42,
        falsePositivePercentage: parseFloat(falsePositivePercentage.toFixed(1)),
        alertsByType,
        hourlyAlertDistribution,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
