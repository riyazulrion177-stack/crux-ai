import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile, Quest, BossState, ActivityLog } from '../types';
import { 
  Shield, 
  Flame, 
  Coins, 
  Gem, 
  CheckCircle2, 
  Circle, 
  Zap, 
  Skull, 
  Gift, 
  Swords, 
  TrendingUp, 
  Bot, 
  Sparkles,
  Award
} from 'lucide-react';
import { audioService } from '../services/audioService';

interface Props {
  user: UserProfile;
  quests: Quest[];
  boss: BossState;
  logs: ActivityLog[];
  onCompleteQuest: (questId: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenCoach: () => void;
  onClaimLoginReward: () => void;
}

export const DashboardView: React.FC<Props> = React.memo(({
  user,
  quests,
  boss,
  logs,
  onCompleteQuest,
  onNavigateTab,
  onOpenCoach,
  onClaimLoginReward,
}) => {
  const [claimedReward, setClaimedReward] = useState(false);
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [recentGlowId, setRecentGlowId] = useState<string | null>(null);

  const dailyQuests = quests.filter(q => q.category === 'daily');
  const completedDailies = dailyQuests.filter(q => q.isCompleted).length;
  const totalDailies = dailyQuests.length;
  const dailyProgressPercent = totalDailies > 0 ? Math.round((completedDailies / totalDailies) * 100) : 0;

  const handleQuestCheck = (e: React.MouseEvent, quest: Quest) => {
    if (quest.isCompleted) return;

    // Mobile haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(8); } catch (err) {}
    }

    // Trigger audio
    audioService.playQuestComplete();

    // 300ms subtle cyan glow trigger on completed card
    setRecentGlowId(quest.id);
    setTimeout(() => {
      setRecentGlowId(null);
    }, 300);

    // Subtle low-opacity upward floating +XP particle (under 250ms, easeOut)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const particle = {
      id: Date.now() + Math.random(),
      x: rect.left + rect.width / 2,
      y: rect.top,
      text: `+${quest.xpReward} XP`
    };
    setFloatingParticles(prev => [...prev, particle]);
    setTimeout(() => {
      setFloatingParticles(prev => prev.filter(p => p.id !== particle.id));
    }, 300);

    onCompleteQuest(quest.id);
  };

  const bossHpPercent = Math.max(0, Math.round((boss.currentHp / boss.maxHp) * 100));

  return (
    <div className="space-y-8 pb-12">
      {/* Floating XP Particle Feedback */}
      <AnimatePresence>
        {floatingParticles.map((p) => (
          <motion.div
            key={`dash_p_${p.id}`}
            initial={{ opacity: 0.75, y: 0 }}
            animate={{ opacity: 0, y: -20 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="fixed z-50 pointer-events-none font-mono font-bold text-[11px] text-cyan-300 bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-[0_0_8px_rgba(0,240,255,0.2)]"
            style={{ left: p.x - 30, top: p.y - 12 }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Main Hunter Overview Card */}
      <div className="relative rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Hunter Title & Rank Badge */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-[0.2em]">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              RANK: <span className="font-bold text-white">{user.rank}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
              {user.hunterName}
            </h1>

            <div className="flex items-center gap-2 text-xs text-purple-300">
              <span className="font-mono bg-purple-950/40 border border-purple-500/30 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                {user.classTitle}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-medium">{user.activeTitle}</span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm italic">
              "All real-life activities feed your system core. Zero placeholders, 100% live progression."
            </p>
          </div>

          {/* Level & Discipline Ring */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-sm">
            {/* Level Hex */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="48" 
                    cy="48" 
                    r="40" 
                    stroke="url(#levelGlow)" 
                    strokeWidth="8" 
                    strokeDasharray={251}
                    strokeDashoffset={251 - (251 * Math.min(100, Math.round((user.xp / user.maxXp) * 100))) / 100}
                    strokeLinecap="round"
                    fill="transparent" 
                    className="transition-all duration-500"
                  />
                  <defs>
                    <linearGradient id="levelGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f0ff" />
                      <stop offset="100%" stopColor="#8a2be2" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-cyan-400">LEVEL</span>
                  <span className="text-2xl font-black text-white font-mono">{user.level}</span>
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-400 mt-2">
                {user.xp} / {user.maxXp} XP
              </div>
            </div>

            <div className="hidden sm:block w-px h-16 bg-white/10" />

            {/* Discipline Score */}
            <div className="text-center sm:text-left">
              <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> DISCIPLINE SCORE
              </div>
              <div className="text-3xl font-black text-white font-mono italic">
                {user.disciplineScore}%
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Dailies: <strong className="text-cyan-300">{completedDailies}/{totalDailies}</strong>
              </div>
            </div>
          </div>

          {/* Daily Reward & Quick AI Action */}
          <div className="space-y-3">
            <button
              onClick={() => {
                if (!claimedReward) {
                  onClaimLoginReward();
                  setClaimedReward(true);
                }
              }}
              disabled={claimedReward}
              className={`w-full p-4 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                claimedReward 
                  ? 'bg-slate-900/60 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/40 text-amber-300 hover:border-amber-400 shadow-lg shadow-amber-500/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-400">DAILY REWARD</div>
                  <div className="text-sm font-bold text-white">
                    {claimedReward ? 'Collected Today' : 'Claim +50 Coins & +10 XP'}
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400 animate-spin-slow" />
            </button>

            <button
              onClick={onOpenCoach}
              className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-900/70 via-indigo-900/60 to-purple-950/70 border border-purple-500/50 text-purple-200 hover:text-white hover:border-purple-400 transition flex items-center justify-between text-xs font-mono shadow-lg shadow-purple-900/20 group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-purple-600/30 text-purple-400 border border-purple-500/40 group-hover:scale-110 transition">
                  <Bot className="w-4 h-4 text-purple-300 animate-pulse" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-mono">CRUX AI MENTOR</div>
                  <div className="text-[10px] text-purple-300">Workout, Study & Life Coach</div>
                </div>
              </div>
              <span className="text-purple-400 font-bold group-hover:translate-x-1 transition">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Missions & Boss Raid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Missions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wider">
                TODAY'S MISSIONS ({completedDailies}/{totalDailies})
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('quests')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono tracking-wider"
            >
              VIEW ALL QUESTS &rarr;
            </button>
          </div>

          {/* Daily Mission Progress Bar */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex items-center gap-4 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 min-w-[80px]">
              PROGRESS
            </div>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {dailyProgressPercent}%
            </div>
          </div>

          {/* Mission Cards List */}
          <div className="space-y-2.5">
            {dailyQuests.map((quest) => (
              <div
                key={`dash_quest_${quest.id}`}
                onClick={(e) => handleQuestCheck(e, quest)}
                className={`p-4 rounded-xl border transition-all duration-200 ease-out flex items-center justify-between cursor-pointer ${
                  recentGlowId === quest.id
                    ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_12px_rgba(0,240,255,0.25)]'
                    : quest.isCompleted
                    ? 'bg-white/2 border-white/5 text-zinc-500/80'
                    : 'bg-white/5 border-white/10 hover:border-cyan-500/30 text-white backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button 
                    type="button" 
                    className="text-cyan-400 focus:outline-none shrink-0"
                  >
                    {quest.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400/90 fill-emerald-950/80 transition-opacity duration-200 ease-out" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-500 hover:text-cyan-400 transition-colors duration-200 ease-out" />
                    )}
                  </button>

                  <div>
                    <div className={`font-bold text-sm transition-colors duration-200 ease-out ${quest.isCompleted ? 'line-through text-zinc-500/80' : 'text-zinc-100'}`}>
                      {quest.title}
                    </div>
                    <div className="text-xs text-zinc-400/80 mt-0.5">
                      {quest.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono shrink-0">
                  <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                    +{quest.xpReward} XP
                  </span>
                  <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 hidden sm:inline">
                    +{quest.coinReward} Gold
                  </span>
                  <span className="text-purple-300 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 hidden md:inline">
                    +{quest.statAmount} {quest.statReward}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Weekly Boss Raid Preview & Recent Logs */}
        <div className="space-y-6">
          {/* Boss Card */}
          <div className="rounded-xl bg-purple-950/20 border border-purple-500/30 p-5 space-y-4 shadow-xl backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase tracking-widest">
                <Skull className="w-3 h-3" /> WEEKLY RAID BOSS
              </div>
              <span className="text-xs font-mono text-purple-300">WEAKNESS: {boss.weaknessStat}</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white tracking-wide">{boss.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{boss.title}</p>
            </div>

            {/* Boss Health Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1">
                <span>BOSS HP</span>
                <span className="font-bold text-red-400">{boss.currentHp} / {boss.maxHp} HP</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-red-900/40">
                <div 
                  className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-pink-500 transition-all duration-300"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('boss')}
              className="w-full py-2.5 rounded-lg bg-red-950/40 border border-red-500/40 hover:bg-red-900/50 text-red-200 font-bold text-xs tracking-widest uppercase transition"
            >
              ENTER BOSS ARENA &rarr;
            </button>
          </div>

          {/* Activity Log Feed */}
          <div className="rounded-xl bg-white/5 border border-white/10 p-5 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" /> SYSTEM ACTIVITY LOG
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">{logs.length} RECORDS</span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-xs text-zinc-500 font-mono text-center py-4">
                  No activity recorded yet. Complete a mission to populate system memory.
                </p>
              ) : (
                logs.slice(0, 6).map((log) => (
                  <div key={`dash_log_${log.id}`} className="text-xs p-2.5 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-zinc-200 font-medium">{log.questTitle}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[11px]">
                      <div className="text-cyan-400 font-bold">+{log.xpEarned} XP</div>
                      <div className="text-amber-400">+{log.coinsEarned} Gold</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
