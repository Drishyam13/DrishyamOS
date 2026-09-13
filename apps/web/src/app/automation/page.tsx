'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '../../components/Navigation';
import { Header } from '../../components/Header';
import { fetchApi } from '../../lib/api';
import { AutomatedRuleDTO, AlertSeverity } from '@drishyam/shared';
import { Zap, Plus, Volume2, Lock, MessageSquare, AlertCircle, Play } from 'lucide-react';

export default function AutomationPage() {
  const [rules, setRules] = useState<AutomatedRuleDTO[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [triggerSeverity, setTriggerSeverity] = useState<AlertSeverity>(AlertSeverity.CRITICAL);
  const [actionType, setActionType] = useState<'trigger_siren' | 'lock_doors' | 'send_sms' | 'escalate'>('trigger_siren');
  const [triggerMessage, setTriggerMessage] = useState<string | null>(null);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      const res = await fetchApi('/automation/rules');
      setRules(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/automation/rules', {
        method: 'POST',
        body: JSON.stringify({ name, triggerSeverity, actionType }),
      });
      setShowAddModal(false);
      setName('');
      loadRules();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleTestTrigger = async (act: string) => {
    try {
      setTriggerMessage('Executing automated IoT response action...');
      const res = await fetchApi('/automation/trigger', {
        method: 'POST',
        body: JSON.stringify({ actionType: act }),
      });
      setTriggerMessage(res.message);
      setTimeout(() => setTriggerMessage(null), 4000);
    } catch (e: any) {
      setTriggerMessage('Action failed: ' + e.message);
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
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Automated IoT Threat Response & Rules Engine</span>
              </h1>
              <p className="text-xs text-slate-400">
                Configure real-time automated sirens, access control locks, and emergency escalations
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-glow transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Automation Rule
            </button>
          </div>

          {triggerMessage && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-xs animate-pulse flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>{triggerMessage}</span>
            </div>
          )}

          {/* Quick Actuator Test Suite */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Manual Emergency Response Actuators
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                onClick={() => handleTestTrigger('trigger_siren')}
                className="p-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-400 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Volume2 className="w-4 h-4" />
                Trigger Site PA Siren Alarm
              </button>
              <button
                onClick={() => handleTestTrigger('lock_doors')}
                className="p-3.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-400 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4" />
                Lock Magnetic Access Doors
              </button>
              <button
                onClick={() => handleTestTrigger('send_sms')}
                className="p-3.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-400 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Send SMS Emergency Alert
              </button>
              <button
                onClick={() => handleTestTrigger('escalate')}
                className="p-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-2 transition-all"
              >
                <AlertCircle className="w-4 h-4" />
                Dispatch Patrol Response Ticket
              </button>
            </div>
          </div>

          {/* Rules List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Active Automation Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2 flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-white">{rule.name}</h4>
                    <p className="text-xs text-slate-400">
                      Trigger on <span className="font-semibold text-slate-200">{rule.triggerSeverity}</span> severity threats
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 border border-brand-500/20">
                      Action: {rule.actionType}
                    </span>
                  </div>

                  <button
                    onClick={() => handleTestTrigger(rule.actionType)}
                    className="p-2.5 rounded-xl bg-dark-800 hover:bg-dark-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 text-brand-400" />
                    Test Rule
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-dark-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-white text-base">Create Automation Rule</h3>

            <form onSubmit={handleAddRule} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Auto Lock Main Lobby Doors"
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Trigger Severity Threshold</label>
                <select
                  value={triggerSeverity}
                  onChange={(e) => setTriggerSeverity(e.target.value as any)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value={AlertSeverity.CRITICAL}>Critical Threat</option>
                  <option value={AlertSeverity.HIGH}>High Threat</option>
                  <option value={AlertSeverity.MEDIUM}>Medium Threat</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Action to Execute</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="trigger_siren">Trigger Site PA Siren Alarm</option>
                  <option value="lock_doors">Lock Access Control Magnetic Doors</option>
                  <option value="send_sms">Send Emergency SMS Alert to Managers</option>
                  <option value="escalate">Dispatch Patrol Ticket</option>
                </select>
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
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
