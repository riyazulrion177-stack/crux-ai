import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RankType, UserProfile } from '../types';
import { getRankRequirement, ALL_RANKS } from '../services/rankService';
import { Trophy, Shield, Zap, Sparkles, Award, ArrowRight, CheckCircle2, Crown, Flame } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Props {
  isOpen: boolean;
  prevRank: RankType;
  newRank: RankType;
  user: UserProfile;
  onClose: () => void;
}

const RANK_THEMES: Record<string, { bgGradient: string; borderColor: string; textColor: string; glowColor: string; shadowColor: string }> = {
  'Bronze': { bgGradient: 'from-amber-950 via-amber-900/40 to-black', borderColor: 'border-amber-700/60', textColor: 'text-amber-400', glowColor: 'rgba(217, 119, 6, 0.4)', shadowColor: 'shadow-amber-900/50' },
  'Silver': { bgGradient: 'from-slate-900 via-slate-800/40 to-black', borderColor: 'border-slate-400/60', textColor: 'text-slate-200', glowColor: 'rgba(203, 213, 225, 0.4)', shadowColor: 'shadow-slate-700/50' },
  'Gold': { bgGradient: 'from-yellow-950 via-amber-900/40 to-black', borderColor: 'border-yellow-500/70', textColor: 'text-yellow-300', glowColor: 'rgba(234, 179, 8, 0.5)', shadowColor: 'shadow-yellow-600/50' },
  'Platinum': { bgGradient: 'from-cyan-950 via-teal-900/40 to-black', borderColor: 'border-cyan-400/70', textColor: 'text-cyan-300', glowColor: 'rgba(6, 182, 212, 0.5)', shadowColor: 'shadow-cyan-600/50' },
  'Diamond': { bgGradient: 'from-blue-950 via-indigo-900/40 to-black', borderColor: 'border-blue-400/70', textColor: 'text-blue-300', glowColor: 'rgba(59, 130, 246, 0.5)', shadowColor: 'shadow-blue-600/50' },
  'Master': { bgGradient: 'from-purple-950 via-violet-900/40 to-black', borderColor: 'border-purple-400/70', textColor: 'text-purple-300', glowColor: 'rgba(168, 85, 247, 0.5)', shadowColor: 'shadow-purple-600/50' },
  'Grandmaster': { bgGradient: 'from-red-950 via-rose-900/40 to-black', borderColor: 'border-red-500/70', textColor: 'text-red-400', glowColor: 'rgba(239, 68, 68, 0.5)', shadowColor: 'shadow-red-600/50' },
  'Heroic': { bgGradient: 'from-rose-950 via-pink-900/40 to-black', borderColor: 'border-pink-500/70', textColor: 'text-pink-300', glowColor: 'rgba(244, 63, 94, 0.5)', shadowColor: 'shadow-pink-600/50' },
  'Legend': { bgGradient: 'from-amber-900 via-yellow-800/50 to-black', borderColor: 'border-amber-300/80', textColor: 'text-amber-200', glowColor: 'rgba(251, 191, 36, 0.6)', shadowColor: 'shadow-amber-500/50' },
  'Mythic': { bgGradient: 'from-fuchsia-950 via-purple-900/50 to-black', borderColor: 'border-fuchsia-400/80', textColor: 'text-fuchsia-300', glowColor: 'rgba(217, 70, 239, 0.6)', shadowColor: 'shadow-fuchsia-600/50' },
  'Immortal': { bgGradient: 'from-emerald-950 via-teal-900/50 to-black', borderColor: 'border-emerald-400/80', textColor: 'text-emerald-300', glowColor: 'rgba(52, 211, 153, 0.6)', shadowColor: 'shadow-emerald-600/50' },
};

function getThemeForRank(rank: RankType) {
  for (const key of Object.keys(RANK_THEMES)) {
    if (rank.startsWith(key)) return RANK_THEMES[key];
  }
  return {
    bgGradient: 'from-cyan-950 via-zinc-900 to-black',
    borderColor: 'border-cyan-500/50',
    textColor: 'text-cyan-400',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    shadowColor: 'shadow-cyan-900/50'
  };
}

export const PromotionCeremonyModal: React.FC<Props> = ({
  isOpen,
  prevRank,
  newRank,
  user,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      audioService.playLevelUp();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try { navigator.vibrate([100, 50, 150, 50, 200]); } catch (e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const req = getRankRequirement(newRank);
  const theme = getThemeForRank(newRank);

  const nextRankIdx = ALL_RANKS.findIndex(r => r.rank === newRank) + 1;
  const nextReq = ALL_RANKS[nextRankIdx];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-xl">
        {/* Animated Background Rays */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3], rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className={`w-[600px] h-[600px] rounded-full bg-gradient-to-r ${theme.bgGradient} blur-3xl opacity-40`}
          />
        </div>

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          className={`relative w-full max-w-lg rounded-3xl bg-gradient-to-b ${theme.bgGradient} border ${theme.borderColor} p-6 sm:p-8 shadow-2xl ${theme.shadowColor} backdrop-blur-2xl text-center overflow-hidden`}
        >
          {/* Top Ceremony Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/20 text-xs font-mono font-bold tracking-[0.2em] text-cyan-300 uppercase mb-6 shadow-inner">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            HUNTER PROMOTION CEREMONY
          </div>

          {/* Rank Transition Visual */}
          <div className="flex items-center justify-center gap-4 my-4">
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-900/80 border border-zinc-700/60 flex items-center justify-center text-zinc-400 shadow-lg">
                <Shield className="w-7 h-7" />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 mt-2">{prevRank}</span>
            </div>

            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-cyan-400"
            >
              <ArrowRight className="w-6 h-6" />
            </motion.div>

            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: [0.8, 1.1, 1], rotate: 0 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="flex flex-col items-center"
            >
              <div
                className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${theme.bgGradient} border-2 ${theme.borderColor} flex items-center justify-center ${theme.textColor} shadow-[0_0_30px_${theme.glowColor}]`}
              >
                <Trophy className="w-10 h-10 animate-bounce" />
              </div>
              <span className={`text-sm font-black tracking-wide mt-2 ${theme.textColor}`}>
                {newRank}
              </span>
            </motion.div>
          </div>

          {/* Title Text */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase mt-4">
            PROMOTED TO <span className={theme.textColor}>{newRank}</span>
          </h2>
          <p className="text-xs text-zinc-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Your discipline, consistency, and combat mastery have elevated your Hunter clearance rating.
          </p>

          {/* Multiplier Perks Unlocked */}
          <div className="grid grid-cols-2 gap-3 my-6 text-left">
            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> REWARD MULTIPLIER
              </div>
              <div className="text-lg font-black text-white font-mono">
                {req.rpMultiplier}x <span className="text-xs text-cyan-400 font-normal">RP Gain</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> MINIMUM DISCIPLINE
              </div>
              <div className="text-lg font-black text-white font-mono">
                {req.minDisciplineScore}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5 mb-1">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> DAILY RANK DECAY
              </div>
              <div className="text-lg font-black text-white font-mono">
                {req.decayPerDay > 0 ? `-${req.decayPerDay} RP/day` : 'NO DECAY'}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 backdrop-blur-md">
              <div className="text-[10px] font-mono uppercase text-zinc-400 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> TOTAL RP
              </div>
              <div className="text-lg font-black text-white font-mono">
                {user.rp || 0} RP
              </div>
            </div>
          </div>

          {/* Next Target Rank Preview */}
          {nextReq && (
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-left mb-6">
              <div className="flex items-center justify-between text-xs font-mono font-bold uppercase text-zinc-300 mb-2">
                <span>NEXT RANK TARGET: <span className="text-cyan-300">{nextReq.rank}</span></span>
                <span>{nextReq.minRp} RP NEEDED</span>
              </div>
              <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round(((user.rp || 0) / nextReq.minRp) * 100))}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white font-mono font-bold text-sm uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2`}
          >
            <Crown className="w-4 h-4 text-amber-300" />
            ACCEPT RANK & CONTINUE
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
