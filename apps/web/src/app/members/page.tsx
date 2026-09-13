'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { fetchApi } from '../../lib/api';
import { UserRole } from '@drishyam/shared';
import { Users, UserPlus, ShieldCheck } from 'lucide-react';

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.OPERATOR);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await fetchApi('/members');
      setMembers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/members/invite', {
        method: 'POST',
        body: JSON.stringify({ email, fullName, role }),
      });
      setShowInviteModal(false);
      setEmail('');
      setFullName('');
      loadMembers();
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
              <h1 className="text-xl font-bold text-white">Team Members & Access Roles</h1>
              <p className="text-xs text-slate-400">Manage security operators and site managers</p>
            </div>

            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Invite Team Member
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-dark-900/90 border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-dark-850/60 transition-colors">
                    <td className="p-4 font-semibold text-slate-200">{m.fullName}</td>
                    <td className="p-4 text-slate-400">{m.email}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20">
                        {m.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-emerald-400 font-medium">Active</span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Invite Operator or Manager</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Verma"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@drishyam.ai"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={UserRole.OPERATOR}>Operator (Control Room)</option>
                  <option value={UserRole.SITE_MANAGER}>Site Manager</option>
                  <option value={UserRole.ORG_ADMIN}>Organization Admin</option>
                  <option value={UserRole.VIEWER}>Viewer (Read-only)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-semibold"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
