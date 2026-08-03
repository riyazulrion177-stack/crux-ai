import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Database, Check, ShieldCheck, Download, Upload, Zap, Volume2, VolumeX, Sliders, Cpu, Key } from 'lucide-react';
import { storageService } from '../services/storageService';
import { aiService } from '../services/aiService';
import { ConnectAIModal } from './ConnectAIModal';
import { AIConfig } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onReloadState: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  userId?: string;
}

export const SupabaseModal: React.FC<Props> = React.memo(({
  isOpen,
  onClose,
  onReloadState,
  soundEnabled = false,
  onToggleSound,
  userId
}) => {
  const currentConfig = storageService.getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [statusMsg, setStatusMsg] = useState('');
  const [isConnectAiOpen, setIsConnectAiOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => aiService.getConfig());

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const success = storageService.saveSupabaseConfig(url.trim(), anonKey.trim());
    if (success) {
      setStatusMsg('✅ Supabase credentials configured successfully!');
    } else {
      setStatusMsg('⚠️ Connected to offline browser storage engine.');
    }
  };

  const maskKey = (k: string) => {
    if (!k) return 'Server Default';
    if (k.length <= 8) return '••••••••';
    return k.slice(0, 4) + '••••' + k.slice(-4);
  };

  const handleExportJson = () => {
    if (!userId) return;
    const data = {
      profile: storageService.getUserProfile(userId),
      quests: storageService.getQuests(userId),
      logs: storageService.getActivityLogs(userId),
      boss: storageService.getBossState(userId),
      achievements: storageService.getAchievements(userId)
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `crux_backup_${Date.now()}.json`;
    link.click();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-[#0d0f1c] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-extrabold text-white tracking-wide mb-1 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" /> SYSTEM SETTINGS
          </h2>
          <p className="text-xs text-slate-400 mb-5">
            Configure preferences, AI provider keys, and cloud synchronization engine.
          </p>

          {/* AI Provider & API Key Configuration Banner */}
          <div className="mb-6 p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-900/50 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
                <Cpu className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  CRUX AI MENTOR KEY
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/30">
                    {aiConfig.provider.toUpperCase()}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                  Key: <span className="text-purple-300 font-bold">{maskKey(aiConfig.apiKey)}</span> ({aiConfig.model})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsConnectAiOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition shadow-md"
            >
              CONFIGURE AI
            </button>
          </div>

          {/* Interface Sounds Toggle */}
          <div className="mb-6 p-4 rounded-xl bg-[#12162a] border border-cyan-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-zinc-100 flex items-center gap-2">
                  INTERFACE SOUNDS
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {soundEnabled ? 'ON' : 'OFF (Silent Default)'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Subtle glass UI taps and minimal haptics. Silent by default on startup.
                </p>
              </div>
            </div>

            {onToggleSound && (
              <button
                type="button"
                onClick={onToggleSound}
                className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all duration-200 shrink-0 ${
                  soundEnabled
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {soundEnabled ? 'ENABLED' : 'MUTED'}
              </button>
            )}
          </div>

          <div className="border-t border-slate-800/80 pt-5 mb-4">
            <h3 className="text-sm font-extrabold text-white tracking-wide mb-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" /> SUPABASE SYNC
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Connect your Supabase project credentials to enable multi-device synchronization.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 uppercase mb-1">Supabase Project URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full bg-[#12162a] border border-slate-700 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-sans text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 uppercase mb-1">Supabase Anon Key</label>
              <input
                type="password"
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5..."
                className="w-full bg-[#12162a] border border-slate-700 rounded-xl py-2.5 px-3.5 text-white placeholder-slate-600 outline-none focus:border-cyan-500 font-sans text-xs"
              />
            </div>

            {statusMsg && <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300">{statusMsg}</div>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-wider transition"
            >
              SAVE SUPABASE CREDENTIALS
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">STATE BACKUP:</span>
            <button
              onClick={handleExportJson}
              className="px-3.5 py-1.5 rounded-lg bg-[#12162a] border border-slate-700 hover:border-slate-500 text-slate-200 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> EXPORT JSON
            </button>
          </div>
        </motion.div>
      </div>

      <ConnectAIModal
        isOpen={isConnectAiOpen}
        onClose={() => setIsConnectAiOpen(false)}
        onConfigSaved={(cfg) => setAiConfig(cfg)}
      />
    </>
  );
});

