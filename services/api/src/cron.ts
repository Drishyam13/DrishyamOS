import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { prisma } from './prisma';
import { broadcastCameraHealth } from './socket';
import { CameraStatus } from '@drishyam/shared';

export function initCronJobs() {
  console.log('⏱️  Initializing Automated Production Cron Jobs...');

  // 1. Camera Health Monitor (Runs every 30 seconds)
  cron.schedule('*/30 * * * * *', async () => {
    try {
      const timeoutThreshold = new Date(Date.now() - 60 * 1000); // 60 seconds ago

      const staleCameras = await prisma.camera.findMany({
        where: {
          status: CameraStatus.ONLINE,
          lastSeenAt: { lt: timeoutThreshold },
        },
      });

      for (const cam of staleCameras) {
        await prisma.camera.update({
          where: { id: cam.id },
          data: { status: CameraStatus.OFFLINE },
        });

        broadcastCameraHealth(cam.organizationId, cam.id, CameraStatus.OFFLINE);
        console.log(`⚠️ [Cron] Camera ${cam.name} (${cam.id}) marked OFFLINE due to missing heartbeat`);
      }
    } catch (error) {
      console.error('❌ [Cron Error] Camera health check failed:', error);
    }
  });

  // 2. Evidence Clip Retention Cleanup (Runs daily at 02:00 AM)
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🧹 [Cron] Running Evidence Clip Retention Cleanup...');
      const orgs = await prisma.organization.findMany();

      for (const org of orgs) {
        const retentionDays = org.retentionDays || 30;
        const purgeThreshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

        const expiredAlerts = await prisma.alert.findMany({
          where: {
            organizationId: org.id,
            detectedAt: { lt: purgeThreshold },
            clipPath: { not: null },
          },
        });

        for (const alert of expiredAlerts) {
          if (alert.clipPath && alert.clipPath.startsWith('/storage/')) {
            const localFilePath = path.join(__dirname, '../public', alert.clipPath);
            if (fs.existsSync(localFilePath)) {
              fs.unlinkSync(localFilePath);
              console.log(`🗑️ [Cron] Purged expired video file: ${localFilePath}`);
            }
          }

          // Clear path in DB
          await prisma.alert.update({
            where: { id: alert.id },
            data: { clipPath: null, thumbnailPath: null },
          });
        }
      }
      console.log('✅ [Cron] Retention cleanup finished.');
    } catch (error) {
      console.error('❌ [Cron Error] Retention cleanup failed:', error);
    }
  });

  // 3. Hourly System Diagnostic Ping (Runs every hour)
  cron.schedule('0 * * * *', async () => {
    try {
      const activeAlertsCount = await prisma.alert.count({ where: { status: 'new' } });
      const onlineCameraCount = await prisma.camera.count({ where: { status: 'online' } });
      console.log(`📊 [Cron Diagnostic] Online Cameras: ${onlineCameraCount} | Active New Alerts: ${activeAlertsCount}`);
    } catch (error) {
      console.error('❌ [Cron Diagnostic Error]:', error);
    }
  });
}
