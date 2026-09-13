'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@drishyam.ai');
  const [password, setPassword] = useState('Drishyam123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role: 'admin' | 'operator') => {
    if (role === 'admin') {
      setEmail('admin@drishyam.ai');
      setPassword('Drishyam123!');
    } else {
      setEmail('operator@drishyam.ai');
      setPassword('Drishyam123!');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-blue-400 mx-auto flex items-center justify-center shadow-glow mb-4">
            <Shield className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">DRISHYAM</h1>
          <p className="text-sm text-slate-400">Real-Time AI Video Surveillance Operations Center</p>
        </div>

        {/* Login Box */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@drishyam.ai"
                  className="w-full bg-dark-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Operations Center'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-2">
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Quick Demo Login Presets</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all text-left"
              >
                <div className="text-brand-400 text-[10px]">ROLE</div>
                <div>Org Admin</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('operator')}
                className="px-3 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all text-left"
              >
                <div className="text-emerald-400 text-[10px]">ROLE</div>
                <div>Control Operator</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
