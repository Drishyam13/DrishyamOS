'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { fetchApi } from '../../lib/api';
import { FaceWatchlistDTO, WatchlistCategory } from '@drishyam/shared';
import { UserCheck, Plus, Trash2, ShieldAlert, Star, Lock } from 'lucide-react';

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<FaceWatchlistDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<WatchlistCategory>(WatchlistCategory.BLACKLIST);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = async () => {
    try {
      const res = await fetchApi('/watchlist');
      setWatchlist(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/watchlist', {
        method: 'POST',
        body: JSON.stringify({ name, category, notes }),
      });
      setShowAddModal(false);
      setName('');
      setNotes('');
      loadWatchlist();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/watchlist/${id}`, { method: 'DELETE' });
      loadWatchlist();
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
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-brand-400" />
                <span>Facial Recognition & Watchlist Manager</span>
              </h1>
              <p className="text-xs text-slate-400">
                Manage blacklisted individuals, VIP visitors, and restricted site access profiles
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Add to Watchlist
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {watchlist.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3 relative group"
              >
                <div className="w-full h-40 rounded-xl overflow-hidden bg-dark-900">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-white">{item.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold text-white ${
                        item.category === WatchlistCategory.BLACKLIST
                          ? 'bg-red-600'
                          : item.category === WatchlistCategory.VIP
                          ? 'bg-emerald-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{item.notes || 'No notes attached'}</p>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="absolute top-2 right-2 bg-dark-900/80 hover:bg-red-500 text-slate-300 hover:text-white p-1.5 rounded-lg backdrop-blur-md transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Add Watchlist Profile</h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={WatchlistCategory.BLACKLIST}>Blacklist (High Risk)</option>
                  <option value={WatchlistCategory.VIP}>VIP Visitor</option>
                  <option value={WatchlistCategory.RESTRICTED}>Restricted Personnel</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes / Remarks</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Specify security notes or access restrictions..."
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white h-20"
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
                  Add Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
