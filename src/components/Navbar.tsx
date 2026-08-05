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
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[linear-gradient(180deg,rgba(6,9,17,0.94),rgba(6,9,17,0.82))] backdrop-blur-xl text-white transition-all">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 border-b border-white/5 text-xs">
          <div className="flex items-center gap-3 sm:gap-5 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center shadow-[0_8px_20px_rgba(0,0,0,0.24)] group-hover:border-cyan-400/35 transition-all duration-200">
                <span className="font-black text-cyan-400 font-mono text-base sm:text-lg">C</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-black tracking-[-0.04em] text-white group-hover:text-cyan-300 transition leading-none">
                  CRUX
                </span>
                <span className="text-[7px] sm:text-[8px] uppercase tracking-[0.28em] text-cyan-400 font-bold opacity-80 mt-0.5">
                  LIFE IS THE GAME
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-white/10 hidden md:block" />

            <div className="hidden md:flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-1 text-xs shadow-[0_6px_18px_rgba(0,0,0,0.18)]">
              <span className="font-bold text-zinc-200 tracking-wide">{user.hunterName}</span>
              <span className="text-[9px] uppercase tracking-wider text-violet-300 font-bold bg-violet-950/40 px-2 py-0.5 rounded-full border border-violet-500/20">
                {user.classTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <div className="hidden sm:flex flex-col w-28 sm:w-36 md:w-40">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-[0.24em] mb-1">
                <span className="text-zinc-400">LVL {user.level}</span>
                <span className="text-cyan-400 font-mono">{user.xp} / {user.maxXp} XP</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6)] transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>

            <div className="sm:hidden font-mono text-[10px] font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-800 px-2 py-1 rounded-lg">
              L{user.level}
            </div>

            <div className="flex items-center gap-1 text-amber-400 font-mono font-bold rounded-lg border border-white/8 bg-white/[0.03] px-2 sm:px-3 py-1 sm:py-1.5 text-xs shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{user.streak}D</span>
            </div>

            <div className="flex items-center gap-1 text-yellow-500 font-mono font-bold rounded-lg border border-white/8 bg-white/[0.03] px-2 sm:px-3 py-1 sm:py-1.5 text-xs shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
              <Coins className="w-3.5 h-3.5 text-yellow-500" />
              <span>{user.coins}</span>
            </div>

            <div className="hidden min-[380px]:flex items-center gap-1 text-cyan-400 font-mono font-bold rounded-lg border border-white/8 bg-white/[0.03] px-2 sm:px-3 py-1 sm:py-1.5 text-xs shadow-[0_6px_16px_rgba(0,0,0,0.18)]">
              <Gem className="w-3.5 h-3.5 text-cyan-400" />
              <span>{user.diamonds}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenCoach}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[linear-gradient(135deg,rgba(91,33,182,0.18),rgba(17,24,39,0.82))] border border-white/10 text-violet-100 hover:text-white transition-all duration-200 hover:border-violet-400/35 cursor-pointer shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                title="Open CRUX AI Mentor"
              >
                <Bot className="w-4 h-4 text-violet-300" />
                <span className="font-mono text-xs font-bold">AI MENTOR</span>
              </button>

              <button
                onClick={onToggleSound}
                className="hidden sm:block p-1.5 sm:p-2 rounded-lg bg-white/[0.04] border border-white/8 text-zinc-300 hover:bg-white/[0.08] transition-all duration-200 hover:border-white/15 cursor-pointer"
                title="Toggle Web Audio SFX"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
              </button>

              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg bg-white/[0.04] border border-white/8 text-zinc-300 hover:bg-white/[0.08] transition-all duration-200 hover:border-white/15 cursor-pointer"
                title="System Settings & Supabase Sync"
              >
                <Settings className="w-4 h-4" />
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden md:block p-2 rounded-lg bg-red-950/20 border border-red-500/15 text-red-400 hover:bg-red-900/35 hover:text-red-200 transition-all duration-200 cursor-pointer"
                  title="Log Out of Account"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:block max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-2 py-2 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={`nav_${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.24em] transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/25'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-zinc-500'}`} />
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

