// ==========================================
// CRUX Life OS - PremiumBadge Component
// Visual Badge for User Plan (Free, Pro, Elite, Founder, Lifetime)
// ==========================================

import React from 'react';
import { UserPlan } from '../../types/monetization';
import { Crown, Zap, ShieldAlert, Sparkles, Star } from 'lucide-react';

interface Props {
  plan: UserPlan;
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PremiumBadge: React.FC<Props> = ({
  plan,
  className = '',
  showText = true,
  size = 'md',
}) => {
  const getBadgeStyle = () => {
    switch (plan) {
      case UserPlan.FOUNDER:
        return {
          bg: 'bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border-amber-400/60 text-amber-300',
          icon: Crown,
          label: 'FOUNDER',
          glow: 'shadow-[0_0_12px_rgba(251,191,36,0.3)]',
        };
      case UserPlan.LIFETIME:
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/60 text-purple-300',
          icon: Star,
          label: 'LIFETIME',
          glow: 'shadow-[0_0_12px_rgba(168,85,247,0.3)]',
        };
      case UserPlan.ELITE:
        return {
          bg: 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border-cyan-400/60 text-cyan-300',
          icon: Sparkles,
          label: 'ELITE',
          glow: 'shadow-[0_0_10px_rgba(6,182,212,0.3)]',
        };
      case UserPlan.PRO:
        return {
          bg: 'bg-gradient-to-r from-indigo-500/20 to-violet-600/20 border-indigo-400/60 text-indigo-300',
          icon: Zap,
          label: 'PRO',
          glow: 'shadow-[0_0_8px_rgba(99,102,241,0.25)]',
        };
      default:
        return {
          bg: 'bg-slate-800/60 border-slate-700/60 text-slate-400',
          icon: ShieldAlert,
          label: 'FREE',
          glow: '',
        };
    }
  };

  const style = getBadgeStyle();
  const IconComponent = style.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-bold',
    lg: 'px-3 py-1.5 text-sm gap-2 font-black',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${style.bg} ${style.glow} ${sizeClasses} ${className}`}
    >
      <IconComponent className="w-3.5 h-3.5 shrink-0 animate-pulse" />
      {showText && <span>{style.label}</span>}
    </span>
  );
};
