// ==========================================
// CRUX Life OS - PremiumFeatureCard Component
// Feature Showcase Highlight Card
// ==========================================

import React from 'react';
import { FeatureKey } from '../../types/monetization';
import { featureGateService } from '../../services/featureGateService';
import { useSubscription } from '../../hooks/useSubscription';
import { Sparkles, Lock, Check } from 'lucide-react';

interface Props {
  userId: string;
  feature: FeatureKey;
  title: string;
  description: string;
  icon?: React.ReactNode;
  onUpgradeClick?: () => void;
}

export const PremiumFeatureCard: React.FC<Props> = ({
  userId,
  feature,
  title,
  description,
  icon,
  onUpgradeClick,
}) => {
  const { plan } = useSubscription(userId);
  const isUnlocked = featureGateService.hasFeature(plan, feature);
  const requiredPlan = featureGateService.getRequiredPlan(feature);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all ${
        isUnlocked
          ? 'border-purple-500/40 bg-slate-900/80 shadow-md'
          : 'border-slate-800 bg-slate-950/60 opacity-90'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/30 bg-purple-950/60 text-purple-300">
          {icon || <Sparkles className="h-5 w-5" />}
        </div>

        {isUnlocked ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
            <Check className="h-3 w-3" /> Unlocked
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-950/60 px-2.5 py-0.5 text-[10px] font-bold text-amber-300">
            <Lock className="h-3 w-3" /> Requires {requiredPlan}
          </span>
        )}
      </div>

      <h4 className="text-base font-bold text-white mb-1">{title}</h4>
      <p className="text-xs text-slate-400 mb-4">{description}</p>

      {!isUnlocked && onUpgradeClick && (
        <button
          onClick={onUpgradeClick}
          className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-xs font-bold text-white shadow hover:brightness-110"
        >
          Upgrade to Access
        </button>
      )}
    </div>
  );
};
