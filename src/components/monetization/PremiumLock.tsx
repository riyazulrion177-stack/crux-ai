// ==========================================
// CRUX Life OS - PremiumLock Component
// Content Protection Overlay with Blur & Upgrade CTA
// ==========================================

import React, { useState } from 'react';
import { FeatureKey, UserPlan } from '../../types/monetization';
import { featureGateService } from '../../services/featureGateService';
import { useSubscription } from '../../hooks/useSubscription';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface Props {
  userId: string;
  feature: FeatureKey;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  blurAmount?: string;
}

export const PremiumLock: React.FC<Props> = ({
  userId,
  feature,
  title,
  description,
  children,
  className = '',
  blurAmount = 'blur-sm',
}) => {
  const { plan } = useSubscription(userId);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const hasAccess = featureGateService.hasFeature(plan, feature);
  const requiredPlan = featureGateService.getRequiredPlan(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className={`relative overflow-hidden rounded-xl border border-purple-500/30 bg-slate-950/80 ${className}`}>
      {/* Blurred Feature Preview */}
      <div className={`pointer-events-none select-none opacity-40 filter ${blurAmount}`}>
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 p-6 text-center backdrop-blur-md">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/40 bg-purple-950/60 shadow-[0_0_20px_rgba(168,85,247,0.3)] text-purple-300">
          <Lock className="h-6 w-6" />
        </div>

        <h4 className="text-base font-bold text-white mb-1 flex items-center justify-center gap-1.5">
          <Sparkles className="h-4 w-4 text-purple-400" />
          {title || `Unlock ${feature.replace(/_/g, ' ')}`}
        </h4>

        <p className="max-w-xs text-xs text-slate-300 mb-4">
          {description || `This feature requires ${requiredPlan} tier access in CRUX Life OS.`}
        </p>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          Upgrade to {requiredPlan}
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Upgrade Paywall Modal */}
      {isUpgradeModalOpen && (
        <UpgradeModal
          userId={userId}
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          highlightFeature={feature}
        />
      )}
    </div>
  );
};
