'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchApi } from '../../lib/api';
import { AlertDTO, CameraDTO, AlertStatus, AlertType, AlertSeverity } from '@drishyam/shared';
import { io, Socket } from 'socket.io-client';
import {
  ShieldAlert,
  Camera,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  XCircle,
  Clock,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [cameras, setCameras] = useState<CameraDTO[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertDTO | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [actionNote, setActionNote] = useState('');

  useEffect(() => {
    loadDashboardData();

    // Connect WebSocket
    let wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
    if (!wsUrl.startsWith('http://') && !wsUrl.startsWith('https://')) {
      wsUrl = `https://${wsUrl}`;
    }
    const token = localStorage.getItem('drishyam_token');

    const socket: Socket = io(wsUrl, {
      auth: { token },
      query: { token },
    });

    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('disconnect', () => {
      setSocketConnected(false);
    });

    socket.on('alert.created', (data: { alert: AlertDTO }) => {
      setAlerts((prev) => [data.alert, ...prev]);

      // Play sound alert chime if enabled
      if (soundEnabled && typeof window !== 'undefined') {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
          gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.4);
        } catch (e) {
          // Audio blocked or unsupported
        }
      }
    });

    socket.on('alert.updated', (data: { alert: AlertDTO }) => {
      setAlerts((prev) => prev.map((a) => (a.id === data.alert.id ? data.alert : a)));
      if (selectedAlert && selectedAlert.id === data.alert.id) {
        setSelectedAlert(data.alert);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [alertsRes, camerasRes] = await Promise.all([
        fetchApi('/alerts?limit=20'),
        fetchApi('/cameras'),
      ]);
      setAlerts(alertsRes.data || []);
      setCameras(camerasRes.data || []);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetchApi(`/alerts/${id}/acknowledge`, {
        method: 'POST',
        body: JSON.stringify({ note: actionNote || 'Acknowledged by operator' }),
      });
      setSelectedAlert(res.data);
      setActionNote('');
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await fetchApi(`/alerts/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ note: actionNote || 'Incident resolved by operator' }),
      });
      setSelectedAlert(res.data);
      setActionNote('');
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFalsePositive = async (id: string) => {
    try {
      const res = await fetchApi(`/alerts/${id}/false-positive`, {
        method: 'POST',
        body: JSON.stringify({ note: actionNote || 'Marked as false positive' }),
      });
      setSelectedAlert(res.data);
      setActionNote('');
      loadDashboardData();
    } catch (e) {
      console.error(e);
    }
  };

  const activeCriticalAlerts = alerts.filter(
    (a) => a.severity === AlertSeverity.CRITICAL && a.status === AlertStatus.NEW
  );

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          socketConnected={socketConnected}
          activeCriticalCount={activeCriticalAlerts.length}
          soundEnabled={soundEnabled}
          onToggleSound={setSoundEnabled}
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-red-500/20 bg-gradient-to-br from-dark-900 via-dark-900 to-red-950/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Critical Active Threats</p>
                  <h3 className="text-2xl font-bold text-red-400 mt-1">
                    {activeCriticalAlerts.length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-dark-900 via-dark-900 to-emerald-950/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Online IP Cameras</p>
                  <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                    {cameras.length} / {cameras.length}
                  </h3>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Camera className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-gradient-to-br from-dark-900 via-dark-900 to-blue-950/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Response Latency</p>
                  <h3 className="text-2xl font-bold text-brand-400 mt-1">&lt; 1.8s</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/30">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-dark-900 via-dark-900 to-amber-950/20">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-400">False Positive Rate</p>
                  <h3 className="text-2xl font-bold text-amber-400 mt-1">4.2%</h3>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Main SOC Layout: Live Grid + Real-Time Alerts Ticker */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Live Camera Feeds */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-brand-400" />
                  <span>Live RTSP Surveillance Feeds</span>
                </h2>
                <span className="text-xs text-slate-400">Multi-Camera Grid (2x2)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cameras.slice(0, 4).map((cam) => {
                  const activeAlertForCam = alerts.find(
                    (a) => a.cameraId === cam.id && a.status === AlertStatus.NEW
                  );
                  return (
                    <div key={cam.id} className="h-56">
                      <VideoPlayer
                        cameraName={cam.name}
                        status={cam.status}
                        src={activeAlertForCam?.clipUrl}
                        bboxes={activeAlertForCam?.metadata?.bboxes}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 1 Col: Real-Time Streaming Alert Feed */}
            <div className="space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Real-Time Alert Feed</span>
                </h2>
                <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-full border border-brand-500/20">
                  LIVE STREAM
                </span>
              </div>

              <div className="glass-panel p-3 rounded-2xl border border-slate-800 space-y-2 flex-1 max-h-[500px] overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No security alerts recorded yet.
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isCritical = alert.severity === AlertSeverity.CRITICAL;
                    return (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          alert.status === AlertStatus.NEW
                            ? isCritical
                              ? 'bg-red-950/30 border-red-500/40 hover:border-red-400 shadow-alert'
                              : 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                            : 'bg-dark-850 border-slate-800 hover:border-slate-700 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                                alert.severity === AlertSeverity.CRITICAL
                                  ? 'bg-red-600'
                                  : alert.severity === AlertSeverity.HIGH
                                  ? 'bg-orange-500'
                                  : 'bg-amber-500'
                              }`}
                            >
                              {alert.alertType}
                            </span>
                            <span className="text-xs font-semibold text-slate-200">
                              {alert.cameraName}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {new Date(alert.detectedAt).toLocaleTimeString()}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Conf: {(alert.confidence * 100).toFixed(0)}%</span>
                          <span className="capitalize font-medium text-slate-300">
                            Status: {alert.status}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Alert Action & Evidence Clip Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-slate-800 p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase text-white bg-red-600">
                    {selectedAlert.alertType}
                  </span>
                  <h3 className="text-lg font-bold text-white">{selectedAlert.cameraName}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Location: {selectedAlert.siteName} • Detected at{' '}
                  {new Date(selectedAlert.detectedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Video Clip Player */}
            <div className="h-72">
              <VideoPlayer
                src={selectedAlert.clipUrl}
                bboxes={selectedAlert.metadata?.bboxes}
                cameraName={selectedAlert.cameraName}
              />
            </div>

            {/* Action Note Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Operator Note:</label>
              <input
                type="text"
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Enter investigation / verification remarks..."
                className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Operator Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleFalsePositive(selectedAlert.id)}
                className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-slate-400" />
                Mark False Positive
              </button>
              <button
                onClick={() => handleAcknowledge(selectedAlert.id)}
                disabled={selectedAlert.status !== AlertStatus.NEW}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Clock className="w-4 h-4" />
                Acknowledge Alert
              </button>
              <button
                onClick={() => handleResolve(selectedAlert.id)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Resolve Incident
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
