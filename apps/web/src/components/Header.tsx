'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Volume2, VolumeX, Radio, LogOut, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  socketConnected?: boolean;
  activeCriticalCount?: number;
  onToggleSound?: (enabled: boolean) => void;
  soundEnabled?: boolean;
}

export function Header({
  socketConnected = true,
  activeCriticalCount = 0,
  onToggleSound,
  soundEnabled = true,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 bg-dark-900/80 backdrop-blur-md border-b border-slate-800/60 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Organization Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-400">Org:</span>
          <span className="text-sm font-semibold text-slate-100 bg-dark-800 px-3 py-1 rounded-lg border border-slate-700/50">
            {user?.organizationName || 'Drishyam Global Operations'}
          </span>
        </div>

        {/* Socket Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-dark-850 border border-slate-800 text-xs">
          <Radio className={`w-3.5 h-3.5 ${socketConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className={socketConnected ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
            {socketConnected ? 'WebSocket Active' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Active Critical Alert Badge */}
        {activeCriticalCount > 0 && (
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{activeCriticalCount} CRITICAL ALERT{activeCriticalCount > 1 ? 'S' : ''}</span>
          </div>
        )}

        {/* Audio Sound Toggle */}
        <button
          onClick={() => onToggleSound?.(!soundEnabled)}
          className={`p-2 rounded-xl transition-all border ${
            soundEnabled
              ? 'bg-brand-600/20 text-brand-400 border-brand-500/30 hover:bg-brand-600/30'
              : 'bg-dark-800 text-slate-500 border-slate-700 hover:text-slate-300'
          }`}
          title={soundEnabled ? 'Alert Chime Sound ON' : 'Alert Sound Muted'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 bg-dark-800 hover:bg-dark-700 border border-slate-700/60 text-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <span className="text-xs font-medium text-slate-200">{user?.fullName || 'Operator'}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-dark-850 border border-slate-700/80 rounded-xl shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">{user?.fullName}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                  {user?.role || 'Operator'}
                </span>
              </div>
              <button
                onClick={logout}
                className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
