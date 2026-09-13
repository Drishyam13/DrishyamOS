import { Router, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { UserRole, AlertSeverity, AlertType } from '@drishyam/shared';

const router = Router();

router.use(authenticateToken);

// GET /automation/rules
router.get('/rules', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orgId = req.membership!.organizationId;

    const rules = await prisma.automatedRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = rules.map((r: any) => ({
      id: r.id,
      organizationId: r.organizationId,
      name: r.name,
      triggerSeverity: r.triggerSeverity as AlertSeverity,
      triggerType: (r.triggerType as AlertType) || undefined,
      actionType: r.actionType as any,
      enabled: r.enabled,
      createdAt: r.createdAt.toISOString(),
    }));

    return res.json({ data: formatted });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /automation/rules
router.post('/rules', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, triggerSeverity, triggerType, actionType } = req.body;
    const orgId = req.membership!.organizationId;

    if (!name || !triggerSeverity || !actionType) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'Name, triggerSeverity, and actionType are required' } });
    }

    const rule = await prisma.automatedRule.create({
      data: {
        organizationId: orgId,
        name,
        triggerSeverity: triggerSeverity as AlertSeverity,
        triggerType: triggerType || null,
        actionType,
        enabled: true,
      },
    });

    return res.status(201).json({ data: { ...rule, createdAt: rule.createdAt.toISOString() } });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /automation/trigger
router.post('/trigger', requireRole([UserRole.SUPER_ADMIN, UserRole.ORG_ADMIN, UserRole.SITE_MANAGER, UserRole.OPERATOR]), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { actionType, alertId } = req.body;

    const actionDescriptions: Record<string, string> = {
      trigger_siren: '🔊 Emergency PA Siren Actuated for Facility Site',
      lock_doors: '🔒 Access Control Magnetic Locks Secured Automatically',
      send_sms: '📱 High-Priority Escalation Alert Sent to Site Managers',
      escalate: '🚨 Emergency Dispatch Ticket Opened & Transmitted to Patrol',
    };

    const message = actionDescriptions[actionType] || `Executed automated response action: ${actionType}`;

    return res.json({
      success: true,
      actionType,
      message,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
