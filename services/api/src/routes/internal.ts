import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticateEdgeService } from '../middleware/auth';
import { broadcastAlertCreated, broadcastCameraHealth } from '../socket';
import { AlertType, AlertSeverity, AlertStatus, CameraStatus, AlertDTO } from '@drishyam/shared';

const router = Router();

router.use(authenticateEdgeService);

// POST /internal/events
router.post('/events', async (req: Request, res: Response) => {
  try {
    const { cameraId, alertType, severity, confidence, detectedAt, clipPath, thumbnailUrl, metadata } = req.body;

    if (!cameraId || !alertType || !severity || confidence === undefined) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'cameraId, alertType, severity, and confidence are required' } });
    }

    const camera = await prisma.camera.findUnique({
      where: { id: cameraId },
      include: { site: true },
    });

    if (!camera) {
      return res.status(404).json({ error: { code: 'CAMERA_NOT_FOUND', message: 'Camera not found' } });
    }

    const alert = await prisma.alert.create({
      data: {
        organizationId: camera.organizationId,
        siteId: camera.siteId,
        cameraId: camera.id,
        alertType: alertType as AlertType,
        severity: severity as AlertSeverity,
        confidence: parseFloat(confidence),
        status: AlertStatus.NEW,
        detectedAt: detectedAt ? new Date(detectedAt) : new Date(),
        clipPath: clipPath || null,
        thumbnailPath: thumbnailUrl || null,
        metadata: JSON.stringify(metadata || {}),
      },
      include: {
        site: { select: { name: true } },
        camera: { select: { name: true } },
      },
    });

    const alertDto: AlertDTO = {
      id: alert.id,
      organizationId: alert.organizationId,
      siteId: alert.siteId,
      siteName: alert.site.name,
      cameraId: alert.cameraId,
      cameraName: alert.camera.name,
      alertType: alert.alertType as AlertType,
      severity: alert.severity as AlertSeverity,
      confidence: alert.confidence,
      status: alert.status as AlertStatus,
      detectedAt: alert.detectedAt.toISOString(),
      clipUrl: alert.clipPath || undefined,
      thumbnailUrl: alert.thumbnailPath || undefined,
      metadata: JSON.parse(alert.metadata || '{}'),
      createdAt: alert.createdAt.toISOString(),
    };

    // Broadcast over WebSocket in real time
    broadcastAlertCreated(alertDto);

    return res.status(201).json({ data: alertDto });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// POST /internal/heartbeats
router.post('/heartbeats', async (req: Request, res: Response) => {
  try {
    const { cameraId, status = 'online' } = req.body;

    if (!cameraId) {
      return res.status(400).json({ error: { code: 'INVALID_INPUT', message: 'cameraId is required' } });
    }

    const camera = await prisma.camera.update({
      where: { id: cameraId },
      data: {
        status: status as CameraStatus,
        lastSeenAt: new Date(),
      },
    });

    broadcastCameraHealth(camera.organizationId, camera.id, status as CameraStatus);

    return res.json({ success: true, cameraId: camera.id, status: camera.status });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

// GET /internal/cameras/:id/config
router.get('/cameras/:id/config', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const camera = await prisma.camera.findUnique({
      where: { id },
    });

    if (!camera) {
      return res.status(404).json({ error: { code: 'CAMERA_NOT_FOUND', message: 'Camera not found' } });
    }

    return res.json({
      cameraId: camera.id,
      name: camera.name,
      rtspUrl: camera.rtspUrl,
      config: JSON.parse(camera.config || '{}'),
    });
  } catch (error: any) {
    return res.status(500).json({ error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

export default router;
