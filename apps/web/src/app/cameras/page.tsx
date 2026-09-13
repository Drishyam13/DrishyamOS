'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { ZoneDrawer } from '../../components/ZoneDrawer';
import { fetchApi } from '../../lib/api';
import { CameraDTO, CameraStatus, PolygonZone } from '@drishyam/shared';
import { Camera, Plus, CheckCircle, AlertTriangle, RefreshCw, Pentagon } from 'lucide-react';

export default function CamerasPage() {
  const [cameras, setCameras] = useState<CameraDTO[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<CameraDTO | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [rtspUrl, setRtspUrl] = useState('rtsp://192.168.1.100:554/stream1');
  const [siteId, setSiteId] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [camsRes, sitesRes] = await Promise.all([fetchApi('/cameras'), fetchApi('/sites')]);
      setCameras(camsRes.data || []);
      setSites(sitesRes.data || []);
      if (sitesRes.data && sitesRes.data.length > 0) {
        setSiteId(sitesRes.data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetchApi('/cameras', {
        method: 'POST',
        body: JSON.stringify({ siteId, name, rtspUrl }),
      });
      setShowAddModal(false);
      setName('');
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveZones = async (zones: PolygonZone[]) => {
    if (!selectedCamera) return;
    try {
      await fetchApi(`/cameras/${selectedCamera.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ config: { zones } }),
      });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTestRtsp = async (id: string) => {
    try {
      setTestResult('Testing RTSP connection...');
      const res = await fetchApi(`/cameras/${id}/test`, { method: 'POST' });
      setTestResult(res.message);
    } catch (e: any) {
      setTestResult('Failed to connect: ' + e.message);
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
              <h1 className="text-xl font-bold text-white">Cameras & Zone Configuration</h1>
              <p className="text-xs text-slate-400">
                Manage IP RTSP cameras and configure polygonal detection zones
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add IP Camera
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Camera List */}
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registered Camera Nodes ({cameras.length})
              </h2>

              <div className="space-y-2">
                {cameras.map((cam) => {
                  const isSelected = selectedCamera?.id === cam.id;
                  return (
                    <div
                      key={cam.id}
                      onClick={() => setSelectedCamera(cam)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-dark-850 border-brand-500/50 shadow-glow'
                          : 'glass-panel hover:bg-dark-850/80 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold text-white">{cam.name}</h3>
                          <p className="text-xs text-slate-400">{cam.siteName}</p>
                          <p className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                            {cam.rtspUrl}
                          </p>
                        </div>
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            cam.status === CameraStatus.ONLINE ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zone Drawer Details */}
            <div className="lg:col-span-2 space-y-4">
              {selectedCamera ? (
                <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-white">
                        Detection Zones for {selectedCamera.name}
                      </h2>
                      <p className="text-xs text-slate-400">Draw detection zones directly on camera canvas</p>
                    </div>

                    <button
                      onClick={() => handleTestRtsp(selectedCamera.id)}
                      className="px-3 py-1.5 rounded-xl bg-dark-800 hover:bg-dark-700 border border-slate-700 text-xs font-semibold text-slate-200"
                    >
                      Test RTSP Connection
                    </button>
                  </div>

                  {testResult && (
                    <div className="p-3 rounded-xl bg-brand-500/10 border border-brand-500/30 text-xs text-brand-300 font-mono">
                      {testResult}
                    </div>
                  )}

                  <ZoneDrawer
                    existingZones={selectedCamera.config?.zones}
                    onSaveZones={handleSaveZones}
                  />
                </div>
              ) : (
                <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center text-slate-500 text-xs">
                  Select a camera from the list to configure detection zones.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Camera Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add New RTSP Camera</h3>

            <form onSubmit={handleAddCamera} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Target Facility / Site</label>
                <select
                  value={siteId}
                  onChange={(e) => setSiteId(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {sites.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Camera Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Gate 01 Main Camera"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">RTSP Stream URL</label>
                <input
                  type="text"
                  required
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                  placeholder="rtsp://192.168.1.100:554/stream1"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Save Camera
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
