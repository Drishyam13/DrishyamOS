import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initSocketServer } from './socket';
import { initCronJobs } from './cron';

import authRoutes from './routes/auth';
import siteRoutes from './routes/sites';
import cameraRoutes from './routes/cameras';
import alertRoutes from './routes/alerts';
import memberRoutes from './routes/members';
import internalRoutes from './routes/internal';
import watchlistRoutes from './routes/watchlist';
import automationRoutes from './routes/automation';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Enable CORS & JSON parsing
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Serve static evidence clips directory
const storagePath = path.join(__dirname, '../public/storage');
app.use('/storage', express.static(storagePath));

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Drishyam API Backend', timestamp: new Date().toISOString() });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/sites', siteRoutes);
app.use('/api/v1/cameras', cameraRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/members', memberRoutes);
app.use('/api/v1/internal', internalRoutes);
app.use('/api/v1/watchlist', watchlistRoutes);
app.use('/api/v1/automation', automationRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Initialize Socket.IO Server
initSocketServer(server);

// Initialize Automated Production Cron Workers
initCronJobs();

server.listen(PORT, () => {
  console.log(`\n🚀 Drishyam API Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket server listening on ws://localhost:${PORT}`);
});
