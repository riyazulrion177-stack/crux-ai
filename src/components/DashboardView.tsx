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
    <div className="space-y-6 pb-10 md:space-y-8 md:pb-12">
      <AnimatePresence>
        {floatingParticles.map((p) => (
          <motion.div
            key={`dash_p_${p.id}`}
            initial={{ opacity: 0.75, y: 0 }}
            animate={{ opacity: 0, y: -18 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="fixed z-50 pointer-events-none font-mono font-bold text-[11px] text-cyan-300 bg-slate-950/90 border border-cyan-500/30 px-2.5 py-0.5 rounded-full backdrop-blur-sm shadow-[0_0_10px_rgba(34,211,238,0.12)]"
            style={{ left: p.x - 30, top: p.y - 12 }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative rounded-[24px] bg-[linear-gradient(180deg,rgba(8,13,22,0.98),rgba(6,10,18,0.92))] backdrop-blur-xl border border-white/10 p-4 md:p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.28)] overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-900/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-cyan-900/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.15fr_0.9fr_0.95fr] gap-4 md:gap-6 items-stretch">
          <div className="space-y-3 rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-[0.22em]">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              RANK: <span className="font-bold text-white">{user.rank}</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-white tracking-[-0.04em]">
              {user.hunterName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span className="font-mono bg-violet-950/40 border border-violet-500/25 px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-violet-300">
                {user.classTitle}
              </span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-medium">{user.activeTitle}</span>
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
              “All real-life activities feed your system core. Zero placeholders, 100% live progression.”
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-5">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="transparent" />
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
                      <stop offset="0%" stopColor="#67e8f9" />
                      <stop offset="100%" stopColor="#a855f7" />
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

            <div className="text-center sm:text-left">
              <div className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> DISCIPLINE SCORE
              </div>
              <div className="text-3xl font-black text-white font-mono tracking-tight">
                {user.disciplineScore}%
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                Dailies: <strong className="text-cyan-300">{completedDailies}/{totalDailies}</strong>
              </div>
            </div>
          </div>

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
                  ? 'bg-slate-900/70 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(250,204,21,0.04))] border-amber-500/25 text-amber-300 hover:border-amber-400/45'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/12 text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-mono uppercase tracking-[0.24em] text-amber-400">DAILY REWARD</div>
                  <div className="text-sm font-semibold text-white">
                    {claimedReward ? 'Collected Today' : 'Claim +50 Coins & +10 XP'}
                  </div>
                </div>
              </div>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </button>

            <button
              onClick={onOpenCoach}
              className="w-full p-3.5 rounded-2xl bg-[linear-gradient(135deg,rgba(91,33,182,0.22),rgba(30,41,59,0.72))] border border-violet-500/25 text-violet-100 hover:border-violet-400/40 transition flex items-center justify-between text-xs font-mono shadow-[0_8px_24px_rgba(91,33,182,0.12)] group"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-violet-500/14 text-violet-300 border border-violet-500/25 group-hover:scale-110 transition">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white font-mono">CRUX AI MENTOR</div>
                  <div className="text-[10px] text-violet-300">Workout, Study & Life Coach</div>
                </div>
              </div>
              <span className="text-violet-300 font-bold group-hover:translate-x-1 transition">&rarr;</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.9fr] gap-6 md:gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-[0.12em] uppercase">
                Today&apos;s Missions <span className="text-cyan-400">({completedDailies}/{totalDailies})</span>
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('quests')}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono tracking-[0.2em] uppercase"
            >
              View All &rarr;
            </button>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-3.5 md:p-4 flex items-center gap-4 backdrop-blur-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-400 min-w-[72px]">
              Progress
            </div>
            <div className="flex-1 h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6)] transition-all duration-300"
                style={{ width: `${dailyProgressPercent}%` }}
              />
            </div>
            <div className="text-xs font-mono font-bold text-cyan-400">
              {dailyProgressPercent}%
            </div>
          </div>

          {dailyQuests.length === 0 ? (
            <div className="rounded-2xl bg-white/[0.03] border border-dashed border-white/12 p-8 md:p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Your mission board is clear.</h3>
              <p className="mt-2 text-sm text-zinc-400 max-w-md mx-auto">
                No daily quests are scheduled yet. Open the missions view to add your next live objective.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {dailyQuests.map((quest) => (
                <div
                  key={`dash_quest_${quest.id}`}
                  onClick={(e) => handleQuestCheck(e, quest)}
                  className={`p-4 rounded-2xl border transition-all duration-200 ease-out flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between cursor-pointer ${
                    recentGlowId === quest.id
                      ? 'bg-cyan-500/10 border-cyan-400/40'
                      : quest.isCompleted
                        ? 'bg-white/[0.02] border-white/5 text-zinc-500/80'
                        : 'bg-white/[0.03] border-white/10 hover:border-cyan-500/25 text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
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

                    <div className="min-w-0">
                      <div className={`font-semibold text-sm transition-colors duration-200 ease-out ${quest.isCompleted ? 'line-through text-zinc-500/80' : 'text-zinc-100'}`}>
                        {quest.title}
                      </div>
                      <div className="text-xs text-zinc-400/80 mt-0.5 truncate">
                        {quest.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono shrink-0">
                    <span className="text-cyan-400 font-bold bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                      +{quest.xpReward} XP
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                      +{quest.coinReward} Gold
                    </span>
                    <span className="text-violet-300 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20">
                      +{quest.statAmount} {quest.statReward}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl bg-[linear-gradient(180deg,rgba(46,16,70,0.42),rgba(15,10,28,0.9))] border border-violet-500/20 p-5 space-y-4 shadow-[0_12px_40px_rgba(0,0,0,0.24)] backdrop-blur-sm relative overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/50 border border-red-500/20 text-red-400 text-[9px] font-bold uppercase tracking-widest">
                <Skull className="w-3 h-3" /> Weekly Raid Boss
              </div>
              <span className="text-[11px] font-mono text-violet-200">Weakness: {boss.weaknessStat}</span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white tracking-tight">{boss.name}</h3>
              <p className="text-xs text-zinc-400 mt-0.5">{boss.title}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-mono text-zinc-300 mb-1.5">
                <span>Boss HP</span>
                <span className="font-bold text-red-400">{boss.currentHp} / {boss.maxHp} HP</span>
              </div>
              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-red-900/30">
                <div 
                  className="h-full bg-[linear-gradient(90deg,#fb7185,#8b5cf6,#ec4899)] transition-all duration-300"
                  style={{ width: `${bossHpPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => onNavigateTab('boss')}
              className="w-full py-2.5 rounded-xl bg-red-950/35 border border-red-500/25 hover:bg-red-900/45 text-red-200 font-bold text-[11px] tracking-[0.24em] uppercase transition"
            >
              Enter Boss Arena &rarr;
            </button>
          </div>

          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-4 md:p-5 space-y-3 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-300 flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" /> System Activity Log
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">{logs.length} Records</span>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-slate-950/30 p-5 text-center">
                  <p className="text-xs text-zinc-500 font-mono">
                    No activity recorded yet.
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-400">
                    Complete a mission to populate this feed.
                  </p>
                </div>
              ) : (
                logs.slice(0, 6).map((log) => (
                  <div key={`dash_log_${log.id}`} className="text-xs p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between gap-3">
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
