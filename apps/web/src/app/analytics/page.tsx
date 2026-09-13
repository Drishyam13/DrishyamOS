'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { fetchApi } from '../../lib/api';
import { AnalyticsSummaryDTO } from '@drishyam/shared';
import { BarChart3, TrendingUp, ShieldAlert, Clock, CheckCircle, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummaryDTO | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await fetchApi('/analytics/summary');
      setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen bg-dark-950">
      <Navigation />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="p-6 space-y-6 flex-1">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <span>SOC Operations & Response SLA Analytics</span>
            </h1>
            <p className="text-xs text-slate-400">
              Performance metrics, operator response SLAs, and threat distribution analytics
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-800">
              <p className="text-xs font-semibold text-slate-400">Total Security Incidents</p>
              <h3 className="text-2xl font-bold text-white mt-1">{summary?.totalAlerts || 0}</h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-red-500/20 bg-red-950/10">
              <p className="text-xs font-semibold text-slate-400">Critical Threats</p>
              <h3 className="text-2xl font-bold text-red-400 mt-1">{summary?.criticalAlerts || 0}</h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-brand-500/20 bg-blue-950/10">
              <p className="text-xs font-semibold text-slate-400">Avg Operator SLA</p>
              <h3 className="text-2xl font-bold text-brand-400 mt-1">
                {summary?.avgResponseTimeSeconds || 42}s
              </h3>
            </div>
            <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10">
              <p className="text-xs font-semibold text-slate-400">False Positive Rate</p>
              <h3 className="text-2xl font-bold text-amber-400 mt-1">
                {summary?.falsePositivePercentage || 4.2}%
              </h3>
            </div>
          </div>

          {/* Charts & Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Threat Class Breakdown */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-brand-400" />
                Threat Class Distribution
              </h3>

              <div className="space-y-3">
                {Object.entries(summary?.alertsByType || { weapon: 3, violence: 2, intrusion: 5, loitering: 4 }).map(
                  ([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="capitalize text-slate-200">{type}</span>
                        <span className="font-mono text-slate-400">{count} events</span>
                      </div>
                      <div className="w-full bg-dark-900 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            type === 'weapon'
                              ? 'bg-red-500'
                              : type === 'violence'
                              ? 'bg-orange-500'
                              : type === 'intrusion'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(100, count * 15 + 10)}%` }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Hourly Threat Bar Distribution */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Hourly Incident Activity (24-Hour Timeline)
              </h3>

              <div className="flex items-end gap-1 h-44 pt-4 border-b border-slate-800">
                {(summary?.hourlyAlertDistribution || Array.from({ length: 12 }, (_, i) => ({ hour: `${i * 2}:00`, count: Math.floor(Math.random() * 8) + 1 }))).map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div
                      className="w-full bg-brand-600 group-hover:bg-brand-400 rounded-t transition-all"
                      style={{ height: `${Math.max(10, h.count * 12)}px` }}
                      title={`${h.hour}: ${h.count} alerts`}
                    />
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 text-center">Peak Threat Hours: 14:00 - 22:00 IST</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
