import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Crown, Zap, Flame, Trophy, Check } from 'lucide-react';
import { audioService } from '../services/audioService';

export type MilestoneType =
  | 'level_up'
  | 'rank_promotion'
  | 'boss_defeated'
  | 'streak_30'
  | 'streak_100'
  | 'legendary_achievement';

interface MilestoneModalProps {
  type: MilestoneType;
  title: string;
  subtitle: string;
  detailText?: string;
  rewardText?: string;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  type,
  title,
  subtitle,
  detailText,
  rewardText,
  onClose
}) => {
  useEffect(() => {
    // Play appropriate AAA audio synth sound without confetti
    if (type === 'rank_promotion') {
      audioService.playCinematicImpact();
    } else if (type === 'level_up') {
      audioService.playLevelUp();
    } else {
      audioService.playHologramScan();
    }
  }, [type]);

  const getBadgeIcon = () => {
    switch (type) {
      case 'level_up':
        return <Zap className="w-10 h-10 text-cyan-400" />;
      case 'rank_promotion':
        return <Crown className="w-10 h-10 text-cyan-300" />;
      case 'boss_defeated':
        return <Shield className="w-10 h-10 text-cyan-400" />;
      case 'streak_30':
      case 'streak_100':
        return <Flame className="w-10 h-10 text-cyan-400" />;
      case 'legendary_achievement':
        return <Trophy className="w-10 h-10 text-purple-400" />;
      default:
        return <Zap className="w-10 h-10 text-cyan-400" />;
    }
  };

  const isRank = type === 'rank_promotion';
  const isLevel = type === 'level_up';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-hidden">
      {/* Ambient Dark Energy Backdrop & Radial Volumetric Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        {/* Expanding Subtle Energy Wave */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.4, 0.15], scale: [0.3, 1.2, 1.6] }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-[600px] h-[600px] rounded-full border border-cyan-500/30 shadow-[0_0_120px_rgba(0,240,255,0.25)] bg-cyan-950/10"
        />

        {/* Volumetric Center Bloom */}
        <div className="absolute w-[450px] h-[450px] bg-gradient-radial from-cyan-500/15 via-purple-900/10 to-transparent blur-3xl rounded-full" />

        {/* Minimal Rotating Glass Shard Facets */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[480px] h-[480px] border border-cyan-500/10 rounded-3xl pointer-events-none"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 55, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[360px] h-[360px] border border-blue-500/10 rounded-[40px] pointer-events-none"
        />
      </div>

      {/* Main Modal Card (Cinematic Container) */}
      <motion.div
        initial={{ opacity: 0, scale: isRank ? 0.94 : 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-[#050814] border border-cyan-500/30 rounded-2xl p-8 text-center text-white relative shadow-[0_0_80px_rgba(0,240,255,0.15)] overflow-hidden backdrop-blur-2xl"
      >
        {/* Top Minimal Cyan Neon Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#00f0ff]" />

        {/* Assembling Holographic Badge Shards */}
        <div className="relative inline-flex items-center justify-center mb-6">
          {/* Subtle Outer Energy Ring */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.15, 1], opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-20 h-20 rounded-2xl bg-[#080f24] border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.3)] relative z-10"
          >
            {getBadgeIcon()}
          </motion.div>

          {/* Floating Subtle Shards */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            transition={{ duration: 0.5 }}
            className="absolute -left-4 w-3 h-3 bg-cyan-400/40 rotate-45 rounded-sm"
          />
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 0.4 }}
            transition={{ duration: 0.5 }}
            className="absolute -right-4 w-3 h-3 bg-blue-400/40 rotate-45 rounded-sm"
          />
        </div>

        {/* Minimal Category Eyebrow */}
        <div className="text-[10px] font-mono uppercase tracking-[0.35em] text-cyan-400/90 font-bold mb-3">
          {isLevel ? 'SYSTEM UPGRADE COMPLETE' : isRank ? 'HUNTER RANK PROMOTED' : 'MILESTONE UNLOCKED'}
        </div>

        {/* Main Title */}
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2 leading-tight">
          {title}
        </h2>

        {/* Subtitle */}
        <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* Details Card */}
        {detailText && (
          <div className="p-3.5 rounded-xl bg-[#080d1f] border border-cyan-500/20 text-xs font-mono text-cyan-200/90 mb-4">
            {detailText}
          </div>
        )}

        {/* Reward Box */}
        {rewardText && (
          <div className="p-3.5 rounded-xl bg-[#071220] border border-cyan-400/30 text-xs font-mono text-cyan-300 mb-6 flex items-center justify-center gap-2">
            <Check className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-bold tracking-wide">{rewardText}</span>
          </div>
        )}

        {/* Minimal Dark Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/50 text-cyan-200 font-mono font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(0,240,255,0.2)] hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] transition-all duration-200"
        >
          ACKNOWLEDGE & CONTINUE
        </button>
      </motion.div>
    </div>
  );
};
