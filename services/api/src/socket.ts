import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { AlertDTO, CameraStatus } from '@drishyam/shared';

const JWT_SECRET = process.env.JWT_SECRET || 'drishyam-jwt-secret-key-super-secure-change-in-prod';

let io: SocketIOServer | null = null;

export function initSocketServer(server: HttpServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token as string, JWT_SECRET) as { userId: string; organizationId?: string };
      socket.data.userId = decoded.userId;
      socket.data.organizationId = decoded.organizationId;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const orgId = socket.data.organizationId;
    if (orgId) {
      socket.join(`org:${orgId}`);
    }

    socket.on('subscribe:site', (siteId: string) => {
      socket.join(`site:${siteId}`);
    });

    socket.on('unsubscribe:site', (siteId: string) => {
      socket.leave(`site:${siteId}`);
    });

    socket.on('disconnect', () => {
      // Disconnected
    });
  });

  return io;
}

export function broadcastAlertCreated(alert: AlertDTO) {
  if (!io) return;
  io.to(`org:${alert.organizationId}`).emit('alert.created', { alert });
  if (alert.siteId) {
    io.to(`site:${alert.siteId}`).emit('alert.created', { alert });
  }
}

export function broadcastAlertUpdated(alert: AlertDTO) {
  if (!io) return;
  io.to(`org:${alert.organizationId}`).emit('alert.updated', { alert });
  if (alert.siteId) {
    io.to(`site:${alert.siteId}`).emit('alert.updated', { alert });
  }
}

export function broadcastCameraHealth(organizationId: string, cameraId: string, status: CameraStatus) {
  if (!io) return;
  io.to(`org:${organizationId}`).emit('camera.health', { cameraId, status, lastSeenAt: new Date().toISOString() });
}
