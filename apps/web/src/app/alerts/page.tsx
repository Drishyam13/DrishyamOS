'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchApi } from '../../lib/api';
import { AlertDTO, AlertStatus, AlertType, AlertSeverity } from '@drishyam/shared';
import { Filter, Check, XCircle, Clock, Eye } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertDTO | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, statusFilter]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      let query = '/alerts?limit=50';
      if (severityFilter !== 'all') query += `&severity=${severityFilter}`;
      if (statusFilter !== 'all') query += `&status=${statusFilter}`;

      const res = await fetchApi(query);
      setAlerts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 space-y-6 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">Security Alerts & Incidents</h1>
              <p className="text-xs text-slate-400">Complete AI-detected threat repository & audit history</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-dark-900 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value={AlertSeverity.CRITICAL}>Critical</option>
                <option value={AlertSeverity.HIGH}>High</option>
                <option value={AlertSeverity.MEDIUM}>Medium</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-dark-900 border border-slate-700/80 text-xs text-white rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value={AlertStatus.NEW}>New</option>
                <option value={AlertStatus.ACKNOWLEDGED}>Acknowledged</option>
                <option value={AlertStatus.RESOLVED}>Resolved</option>
                <option value={AlertStatus.FALSE_POSITIVE}>False Positive</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="p-4">Threat Class</th>
                  <th className="p-4">Camera & Site</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Detected At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-dark-850/60 transition-colors">
                    <td className="p-4">
                      <span className="font-bold uppercase text-white bg-dark-800 px-2.5 py-1 rounded border border-slate-700">
                        {alert.alertType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{alert.cameraName}</div>
                      <div className="text-[11px] text-slate-400">{alert.siteName}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                          alert.severity === AlertSeverity.CRITICAL
                            ? 'bg-red-600'
                            : alert.severity === AlertSeverity.HIGH
                            ? 'bg-orange-500'
                            : 'bg-amber-500'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-medium text-slate-300">
                      {(alert.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(alert.detectedAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="capitalize font-semibold text-slate-300">{alert.status}</span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 border border-brand-500/30 transition-all inline-flex items-center gap-1.5 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review Clip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* Review Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 p-6 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Alert Evidence Review</h3>
              <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="h-64">
              <VideoPlayer
                src={selectedAlert.clipUrl}
                bboxes={selectedAlert.metadata?.bboxes}
                cameraName={selectedAlert.cameraName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
