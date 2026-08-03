import React from 'react';
import { UserProfile } from '../types';
import { MobileBottomNav } from './MobileBottomNav';
import { 
  Flame, 
  Coins, 
  Gem, 
  Bot, 
  Volume2, 
  VolumeX, 
  Settings, 
  LayoutDashboard, 
  Swords, 
  Skull, 
  User, 
  BarChart3, 
  ShoppingBag, 
  Trophy,
  LogOut
} from 'lucide-react';

interface Props {
  user: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCoach: () => void;
  onOpenSettings: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<Props> = React.memo(({
  user,
  activeTab,
  setActiveTab,
  onOpenCoach,
  onOpenSettings,
  soundEnabled,
  onToggleSound,
  onLogout
}) => {
  const xpPercent = Math.min(100, Math.round((user.xp / user.maxXp) * 100));

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'quests', label: 'Missions', icon: Swords },
    { id: 'boss', label: 'Boss Raid', icon: Skull },
    { id: 'character', label: 'Character', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'shop', label: 'Armory', icon: ShoppingBag },
    { id: 'leaderboard', label: 'Rankings', icon: Trophy },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-xl border-b border-white/10 text-white transition-all">
        {/* Top HUD Stats Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-white/5 text-xs">
          {/* Logo & Hunter Info */}
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.15)] group-hover:border-cyan-400 transition">
                <span className="font-black text-cyan-400 font-mono text-base sm:text-lg">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-tighter text-white group-hover:text-cyan-300 transition leading-none">
                  CRUX
                </span>
                <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.25em] text-cyan-400 font-bold opacity-80 mt-0.5">
                  LIFE IS THE GAME
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            {/* Hunter Tag */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3.5 py-1 text-xs">
              <span className="font-bold text-zinc-200 tracking-wide">{user.hunterName}</span>
              <span className="text-[9px] uppercase tracking-wider text-purple-400 font-bold bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-500/20">
                {user.classTitle}
              </span>
            </div>
          </div>

          {/* HUD Currencies & Progress */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            {/* Level & XP (Desktop & Tablet) */}
            <div className="hidden sm:flex flex-col w-28 sm:w-36 md:w-40">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                <span className="text-zinc-400">LVL {user.level}</span>
                <span className="text-cyan-400 font-mono">{user.xp} / {user.maxXp} XP</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            {/* Mobile Compact Level Badge */}
            <div className="sm:hidden font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/50 border border-cyan-800 px-2 py-1 rounded-lg">
              L{user.level}
            </div>

            {/* Streak */}
            <div className="flex items-center gap-1 text-amber-400 font-mono font-bold bg-amber-950/30 border border-amber-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs">
              <Flame className="w-3.5 h-3.5 fill-amber-400 animate-pulse" />
              <span>{user.streak}D</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold bg-white/5 border border-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>{user.coins}</span>
            </div>

            {/* Diamonds */}
            <div className="hidden min-[380px]:flex items-center gap-1 text-cyan-400 font-mono font-bold bg-cyan-500/5 border border-cyan-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs">
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user.diamonds}</span>
            </div>

            {/* Controls (Desktop Full / Mobile Compact) */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenCoach}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-indigo-900/60 border border-purple-500/50 text-purple-200 hover:text-white transition shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-105 active:scale-95 cursor-pointer"
                title="Open CRUX AI Mentor"
              >
                <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="font-mono text-xs font-bold">AI MENTOR</span>
              </button>

              <button
                onClick={onToggleSound}
                className="hidden sm:block p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                title="Toggle Web Audio SFX"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>

              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 transition cursor-pointer"
                title="System Settings & Supabase Sync"
              >
                <Settings className="w-4 h-4" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden md:block p-2 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 hover:bg-red-900/50 hover:text-red-200 transition cursor-pointer"
                  title="Log Out of Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Desktop Navigation Tabs (Hidden on Mobile) */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-2 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`nav_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Mobile Floating Bottom Navigation Bar (< 768px) */}
      <MobileBottomNav
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCoach={onOpenCoach}
        onOpenSettings={onOpenSettings}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onLogout={onLogout}
      />
    </>
  );
});

