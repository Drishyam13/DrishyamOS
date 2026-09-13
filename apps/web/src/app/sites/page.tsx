'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { fetchApi } from '../../lib/api';
import { MapPin, Camera, Bell, Plus } from 'lucide-react';

export default function SitesPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadSites();
  }, []);

  const loadSites = async () => {
    try {
      const res = await fetchApi('/sites');
      setSites(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/sites', {
        method: 'POST',
        body: JSON.stringify({ name, address }),
      });
      setShowAddModal(false);
      setName('');
      setAddress('');
      loadSites();
    } catch (e: any) {
      alert(e.message);
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
              <h1 className="text-xl font-bold text-white">Monitored Facilities & Sites</h1>
              <p className="text-xs text-slate-400">Multi-site organization physical locations</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Facility Site
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {sites.map((site) => (
              <div
                key={site.id}
                className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{site.name}</h3>
                    <p className="text-xs text-slate-400">{site.address || 'Location registered'}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    {site.cameraCount || 0} Cameras
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-semibold">
                    <Bell className="w-3.5 h-3.5" />
                    {site.activeAlertCount || 0} Alerts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add Facility Site</h3>
            <form onSubmit={handleAddSite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Site Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="North Facility Complex"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Address / City</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Mumbai, MH"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
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
                  Save Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
