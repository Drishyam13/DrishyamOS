import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { UserRole, AlertType, AlertSeverity, AlertStatus, CameraStatus } from '@drishyam/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Drishyam Database...');

  // Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'drishyam-hq' },
    update: {},
    create: {
      name: 'Drishyam Global Operations',
      slug: 'drishyam-hq',
      retentionDays: 30,
      settings: JSON.stringify({ theme: 'dark', alertSounds: true }),
    },
  });

  // Password Hash
  const passwordHash = await bcrypt.hash('Drishyam123!', 10);

  // Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@drishyam.ai' },
    update: {},
    create: {
      email: 'admin@drishyam.ai',
      fullName: 'Aarav Sharma (Admin)',
      passwordHash,
      isActive: true,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: adminUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: adminUser.id,
      role: UserRole.ORG_ADMIN,
    },
  });

  // Operator User
  const operatorUser = await prisma.user.upsert({
    where: { email: 'operator@drishyam.ai' },
    update: {},
    create: {
      email: 'operator@drishyam.ai',
      fullName: 'Vikram Singh (Control Room Operator)',
      passwordHash,
      isActive: true,
    },
  });

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: operatorUser.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: operatorUser.id,
      role: UserRole.OPERATOR,
    },
  });

  // Create Sites
  const siteHq = await prisma.site.create({
    data: {
      organizationId: org.id,
      name: 'Main Headquarters (Mumbai)',
      address: 'BKC Financial Center, Mumbai, MH',
      timezone: 'Asia/Kolkata',
    },
  });

  const siteWarehouse = await prisma.site.create({
    data: {
      organizationId: org.id,
      name: 'Logistics Warehouse (Pune)',
      address: 'Chakan Industrial Zone, Pune, MH',
      timezone: 'Asia/Kolkata',
    },
  });

  // Create Cameras
  const defaultZones = [
    {
      id: 'z1',
      name: 'Restricted Walkway Zone A',
      type: AlertType.INTRUSION,
      points: [
        { x: 0.1, y: 0.2 },
        { x: 0.8, y: 0.2 },
        { x: 0.8, y: 0.9 },
        { x: 0.1, y: 0.9 },
      ],
      enabled: true,
    },
    {
      id: 'z2',
      name: 'Main Gate Loitering Zone',
      type: AlertType.LOITERING,
      points: [
        { x: 0.3, y: 0.4 },
        { x: 0.7, y: 0.4 },
        { x: 0.7, y: 0.8 },
        { x: 0.3, y: 0.8 },
      ],
      enabled: true,
      minDurationSeconds: 45,
    },
  ];

  const cameraConfigStr = JSON.stringify({
    fps: 15,
    enabledClasses: [AlertType.WEAPON, AlertType.VIOLENCE, AlertType.INTRUSION, AlertType.LOITERING],
    confidenceThresholds: {
      [AlertType.WEAPON]: 0.7,
      [AlertType.VIOLENCE]: 0.65,
      [AlertType.INTRUSION]: 0.75,
      [AlertType.LOITERING]: 0.7,
    },
    zones: defaultZones,
  });

  const cam1 = await prisma.camera.create({
    data: {
      organizationId: org.id,
      siteId: siteHq.id,
      name: 'HQ Main Lobby Entrance (Cam 01)',
      rtspUrl: 'rtsp://192.168.1.101:554/stream1',
      onvifHost: '192.168.1.101',
      status: CameraStatus.ONLINE,
      lastSeenAt: new Date(),
      config: cameraConfigStr,
    },
  });

  const cam2 = await prisma.camera.create({
    data: {
      organizationId: org.id,
      siteId: siteHq.id,
      name: 'Perimeter West Fence (Cam 02)',
      rtspUrl: 'rtsp://192.168.1.102:554/stream1',
      onvifHost: '192.168.1.102',
      status: CameraStatus.ONLINE,
      lastSeenAt: new Date(),
      config: cameraConfigStr,
    },
  });

  const cam3 = await prisma.camera.create({
    data: {
      organizationId: org.id,
      siteId: siteWarehouse.id,
      name: 'Warehouse Gate 4 Loading Dock (Cam 03)',
      rtspUrl: 'rtsp://192.168.2.201:554/stream1',
      onvifHost: '192.168.2.201',
      status: CameraStatus.ONLINE,
      lastSeenAt: new Date(),
      config: cameraConfigStr,
    },
  });

  // Sample Alerts
  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
  const sampleThumb = 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80';

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      siteId: siteHq.id,
      cameraId: cam1.id,
      alertType: AlertType.WEAPON,
      severity: AlertSeverity.CRITICAL,
      confidence: 0.94,
      status: AlertStatus.NEW,
      detectedAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
      clipPath: sampleVideoUrl,
      thumbnailPath: sampleThumb,
      metadata: JSON.stringify({
        bboxes: [
          { x: 120, y: 150, w: 90, h: 220, label: 'Handgun / Firearm', confidence: 0.94 },
          { x: 100, y: 80, w: 180, h: 400, label: 'Person', confidence: 0.98 },
        ],
        durationMs: 12500,
      }),
    },
  });

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      siteId: siteHq.id,
      cameraId: cam2.id,
      alertType: AlertType.INTRUSION,
      severity: AlertSeverity.HIGH,
      confidence: 0.88,
      status: AlertStatus.ACKNOWLEDGED,
      detectedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      clipPath: sampleVideoUrl,
      thumbnailPath: sampleThumb,
      metadata: JSON.stringify({
        bboxes: [{ x: 300, y: 200, w: 120, h: 310, label: 'Person Intruder', confidence: 0.88 }],
        zoneName: 'Perimeter West Fence Zone',
      }),
      acknowledgedBy: operatorUser.id,
      acknowledgedAt: new Date(Date.now() - 12 * 60 * 1000),
      actions: {
        create: {
          userId: operatorUser.id,
          action: 'acknowledge',
          note: 'Operator verified intruder near West fence. Security patrol dispatched.',
        },
      },
    },
  });

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      siteId: siteWarehouse.id,
      cameraId: cam3.id,
      alertType: AlertType.VIOLENCE,
      severity: AlertSeverity.CRITICAL,
      confidence: 0.91,
      status: AlertStatus.NEW,
      detectedAt: new Date(Date.now() - 35 * 60 * 1000), // 35 mins ago
      clipPath: sampleVideoUrl,
      thumbnailPath: sampleThumb,
      metadata: JSON.stringify({
        bboxes: [
          { x: 210, y: 180, w: 150, h: 320, label: 'Aggressive Motion / Physical Altercation', confidence: 0.91 },
        ],
      }),
    },
  });

  await prisma.alert.create({
    data: {
      organizationId: org.id,
      siteId: siteHq.id,
      cameraId: cam1.id,
      alertType: AlertType.LOITERING,
      severity: AlertSeverity.MEDIUM,
      confidence: 0.82,
      status: AlertStatus.RESOLVED,
      detectedAt: new Date(Date.now() - 90 * 60 * 1000), // 90 mins ago
      clipPath: sampleVideoUrl,
      thumbnailPath: sampleThumb,
      metadata: JSON.stringify({
        bboxes: [{ x: 150, y: 100, w: 100, h: 250, label: 'Person Loitering (120s+)', confidence: 0.82 }],
      }),
      acknowledgedBy: operatorUser.id,
      acknowledgedAt: new Date(Date.now() - 85 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 80 * 60 * 1000),
      actions: {
        createMany: {
          data: [
            { userId: operatorUser.id, action: 'acknowledge', note: 'Checking lobby loitering alert' },
            { userId: operatorUser.id, action: 'resolve', note: 'Subject identified as waiting visitor. Cleared.' },
          ],
        },
      },
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('🔑 Default Login Credentials:');
  console.log('   Admin: admin@drishyam.ai / Drishyam123!');
  console.log('   Operator: operator@drishyam.ai / Drishyam123!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
