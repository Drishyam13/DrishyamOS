'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  LayoutDashboard,
  Video,
  BellRing,
  Camera,
  MapPin,
  Users,
  Settings,
  Activity,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/live', label: 'Live Camera Grid', icon: Video },
  { href: '/alerts', label: 'Alert Manager', icon: BellRing },
  { href: '/cameras', label: 'Cameras & Zones', icon: Camera },
  { href: '/sites', label: 'Facilities & Sites', icon: MapPin },
  { href: '/members', label: 'Team Members', icon: Users },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-dark-900 border-r border-slate-800/60 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-30">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center shadow-glow">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide">DRISHYAM</h1>
            <p className="text-xs text-brand-400 font-medium">Real-time AI Surveillance</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-dark-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Edge System Status Badge */}
      <div className="p-4 m-3 rounded-2xl glass-panel border border-slate-800/80">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">AI Inference Engine</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div className="flex justify-between">
            <span>Edge Gateway:</span>
            <span className="text-emerald-400 font-mono">ONLINE</span>
          </div>
          <div className="flex justify-between">
            <span>Detection FPS:</span>
            <span className="text-slate-200 font-mono">15.0 FPS</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
