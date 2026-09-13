'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { VideoPlayer } from '../../components/VideoPlayer';
import { fetchApi } from '../../lib/api';
import { AlertDTO, AlertSeverity, AlertStatus } from '@drishyam/shared';
import { Search, Sparkles, Filter, Calendar, Camera, Eye } from 'lucide-react';

export default function SmartSearchPage() {
  const [query, setQuery] = useState('');
  const [alerts, setAlerts] = useState<AlertDTO[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<AlertDTO | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/alerts?limit=50');
      let data: AlertDTO[] = res.data || [];

      if (query.trim()) {
        const q = query.toLowerCase();
        data = data.filter(
          (a) =>
            a.alertType.toLowerCase().includes(q) ||
            a.cameraName?.toLowerCase().includes(q) ||
            a.siteName?.toLowerCase().includes(q) ||
            a.severity.toLowerCase().includes(q) ||
            a.status.toLowerCase().includes(q)
        );
      }

      setAlerts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const presetQueries = [
    'Handgun / Weapon detected',
    'Intrusion near Perimeter Fence',
    'Critical violence alerts',
    'Loitering after 10 PM',
  ];

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 space-y-6 flex-1">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              <span>Natural Language & Smart Event Search</span>
            </h1>
            <p className="text-xs text-slate-400">
              Query security footage events using AI keywords and natural language descriptions
            </p>
          </div>

          {/* Search Box */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-5 h-5 text-brand-400 absolute left-4 top-3.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search events... (e.g. 'weapon detected', 'perimeter breach', 'critical')"
                className="w-full bg-dark-900 border border-slate-700/80 rounded-xl pl-12 pr-28 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-all"
              >
                Search
              </button>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Presets:
              </span>
              {presetQueries.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setQuery(p);
                    handleSearch();
                  }}
                  className="text-xs font-medium text-slate-300 bg-dark-850 hover:bg-dark-800 border border-slate-700 px-3 py-1 rounded-lg transition-all"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Results Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="p-4">Threat Type</th>
                  <th className="p-4">Camera & Site</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Confidence</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4 text-right">Review Clip</th>
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
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="p-2 rounded-xl bg-brand-600/20 hover:bg-brand-600/40 text-brand-400 border border-brand-500/30 transition-all inline-flex items-center gap-1.5 font-semibold text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Play Evidence Clip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {selectedAlert && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-800 p-6 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base">Historical Evidence Clip</h3>
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
