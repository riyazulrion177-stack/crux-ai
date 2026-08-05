import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { audioService } from '../services/audioService';
import { 
  LayoutDashboard, 
  Swords, 
  Skull, 
  User, 
  Bot, 
  Grid, 
  X, 
  BarChart3, 
  ShoppingBag, 
  Trophy, 
  Settings, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Sparkles, 
  Shield, 
  Flame, 
  ChevronRight,
  Lock,
  Zap
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoach: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout?: () => void;
  user: UserProfile;
}

export const MobileBottomNav: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenCoach,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  onLogout,
  user
}) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch (e) {}
    }
    audioService.playSoftClick();
  };

  const handleNavClick = (tabId: string) => {
    triggerHaptic();
    setActiveTab(tabId);
    if (isMoreOpen) setIsMoreOpen(false);
  };

  const handleOpenAi = () => {
    triggerHaptic();
    onOpenCoach();
    if (isMoreOpen) setIsMoreOpen(false);
  };

  const handleToggleMore = () => {
    triggerHaptic();
    setIsMoreOpen(prev => !prev);
  };

  const primaryNavItems = [
    { id: 'dashboard', label: 'Center', icon: LayoutDashboard, isAi: false },
    { id: 'quests', label: 'Missions', icon: Swords, isAi: false },
    { id: 'boss', label: 'Boss Raid', icon: Skull, isAi: false },
    { id: 'ai', label: 'AI Mentor', icon: Bot, isAi: true },
    { id: 'character', label: 'Hunter', icon: User, isAi: false },
  ];

  const moreDrawerItems = [
    { 
      id: 'analytics', 
      label: 'Analytics & Stats', 
      desc: 'XP curves, discipline & history logs', 
      icon: BarChart3, 
      color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/50' 
    },
    { 
      id: 'shop', 
      label: 'Armory & Shop', 
      desc: 'Potions, titles & loot boxes', 
      icon: ShoppingBag, 
      color: 'text-amber-400 bg-amber-950/40 border-amber-800/50' 
    },
    { 
      id: 'leaderboard', 
      label: 'Rankings', 
      desc: 'Global competitive hunter leaderboard', 
      icon: Trophy, 
      color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/50' 
    },
  ];

  const futureFeatures = [
    { title: 'Guild Dungeons & Raids', badge: 'SEASON 2', icon: Shield },
    { title: 'Shadow Extraction Rituals', badge: 'LVL 50', icon: Zap },
    { title: 'Hunter vs Hunter Arena', badge: 'COMING SOON', icon: Flame },
  ];

  return (
    <>
      {/* FLOATING BOTTOM NAV BAR (MOBILE ONLY: <768px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden p-2 sm:p-3 pointer-events-none">
        <div className="max-w-md mx-auto bg-[linear-gradient(180deg,rgba(8,11,20,0.96),rgba(9,10,18,0.86))] backdrop-blur-2xl border border-white/10 rounded-2xl p-1.5 shadow-[0_14px_40px_rgba(0,0,0,0.45)] flex items-center justify-around pointer-events-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-70" />

          {/* Primary Nav Buttons */}
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id && !isMoreOpen;

            if (item.isAi) {
              return (
                <button
                  key={`nav_ai_${item.id}`}
                  onClick={handleOpenAi}
                  className="relative group flex flex-col items-center justify-center p-1.5 rounded-xl transition-all touch-active cursor-pointer"
                >
                  <div className="relative">
                    <motion.div
                      whileTap={{ scale: 0.94 }}
                      className="w-10 h-10 rounded-xl bg-[linear-gradient(135deg,rgba(91,33,182,0.42),rgba(17,24,39,0.88))] border border-white/10 flex items-center justify-center text-purple-200 shadow-[0_10px_24px_rgba(0,0,0,0.28)]"
                    >
                      <Bot className="w-5 h-5 text-purple-300 animate-pulse" />
                    </motion.div>
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-wider text-purple-300 mt-1 uppercase">
                    AI
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`mobile_nav_${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 touch-active cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110 text-cyan-400' : 'text-zinc-400'}`} />
                <span className={`text-[9px] font-mono font-bold tracking-wider mt-1 uppercase ${isActive ? 'text-cyan-300' : 'text-zinc-400'}`}>
                  {item.label}
                </span>

                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    layoutId="mobile_nav_active_dot"
                    className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]"
                  />
                )}
              </button>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={handleToggleMore}
            className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-200 touch-active cursor-pointer ${
              isMoreOpen
                ? 'text-purple-300 bg-purple-500/20 border border-purple-500/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : ['analytics', 'shop', 'leaderboard'].includes(activeTab)
                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/40'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
            }`}
          >
            <Grid className={`w-5 h-5 transition-transform duration-200 ${isMoreOpen ? 'rotate-90 text-purple-400' : ''}`} />
            <span className={`text-[9px] font-mono font-bold tracking-wider mt-1 uppercase ${isMoreOpen ? 'text-purple-300' : 'text-zinc-400'}`}>
              More
            </span>
          </button>
        </div>
      </div>

      {/* MORE DRAWER OVERLAY & BOTTOM SHEET */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleToggleMore}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full bg-[linear-gradient(180deg,rgba(9,12,22,0.98),rgba(7,9,15,0.98))] border-t border-white/10 rounded-t-3xl p-5 shadow-[0_-12px_40px_rgba(0,0,0,0.44)] max-h-[88vh] overflow-y-auto text-white"
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-700/80 rounded-full mx-auto mb-4" />

              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400 flex items-center justify-center text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-wider uppercase text-white font-mono">
                      SYSTEM MATRIX
                    </h3>
                    <p className="text-[10px] font-mono text-cyan-400 uppercase">
                      Expanded Operations & Settings
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleToggleMore}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hunter Mini Profile Banner */}
              <div 
                onClick={() => handleNavClick('character')}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-black border border-white/10 mb-5 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-black font-mono text-lg shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                    {user.hunterName ? user.hunterName.charAt(0).toUpperCase() : 'H'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-white">{user.hunterName}</span>
                      <span className="text-[9px] font-mono font-bold uppercase bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800">
                        {user.rank}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400 flex items-center gap-3 mt-0.5">
                      <span>LVL {user.level}</span>
                      <span>•</span>
                      <span className="text-amber-400">{user.rp || 0} RP</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-zinc-500" />
              </div>

              {/* Secondary Navigation Options */}
              <div className="space-y-2.5 mb-6">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1 mb-1">
                  MAIN SYSTEM MODULES
                </div>

                {moreDrawerItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={`drawer_${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'bg-black/40 border-white/10 hover:border-white/20 text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${item.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-white font-mono">{item.label}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{item.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500" />
                    </button>
                  );
                })}
              </div>

              {/* System Settings & Utilities Grid */}
              <div className="space-y-2.5 mb-6">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1 mb-1">
                  SETTINGS & UTILITIES
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onOpenSettings();
                      setIsMoreOpen(false);
                    }}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left flex items-center gap-3 transition cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white font-mono">Settings</div>
                      <div className="text-[10px] text-zinc-400 font-mono">Cloud & Device</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      triggerHaptic();
                      onToggleSound();
                    }}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-cyan-500/40 text-left flex items-center gap-3 transition cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                      {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white font-mono">SFX Audio</div>
                      <div className={`text-[10px] font-mono ${soundEnabled ? 'text-cyan-400' : 'text-zinc-500'}`}>
                        {soundEnabled ? 'ENABLED' : 'MUTED'}
                      </div>
                    </div>
                  </button>
                </div>

                {onLogout && (
                  <button
                    onClick={() => {
                      triggerHaptic();
                      onLogout();
                    }}
                    className="w-full p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/40 flex items-center justify-center gap-2 font-mono text-xs font-bold transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>LOG OUT OF HUNTER ACCOUNT</span>
                  </button>
                )}
              </div>

              {/* Future Operations (Season 2) */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-400 px-1 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-cyan-400" /> FUTURE HUNTER PROTOCOLS
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {futureFeatures.map((feat) => {
                    const Icon = feat.icon;
                    return (
                      <div
                        key={`future_${feat.title}`}
                        className="p-3 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-purple-400/70" />
                          <span>{feat.title}</span>
                        </div>
                        <span className="text-[9px] font-bold bg-purple-950/60 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60">
                          {feat.badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
