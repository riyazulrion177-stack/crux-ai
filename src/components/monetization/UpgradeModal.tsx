// ==========================================
// CRUX Life OS - UpgradeModal Component
// Plan Comparison & Conversion Paywall Modal
// ==========================================

import React, { useState } from 'react';
import { UserPlan, FeatureKey } from '../../types/monetization';
import { PRICING_TIERS, PricingService } from '../../services/pricingService';
import { useSubscription } from '../../hooks/useSubscription';
import { purchaseService } from '../../services/purchaseService';
import { PremiumBadge } from './PremiumBadge';
import { X, Check, Sparkles, Zap, Crown, ShieldCheck } from 'lucide-react';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  highlightFeature?: FeatureKey;
}

export const UpgradeModal: React.FC<Props> = ({
  userId,
  isOpen,
  onClose,
  highlightFeature,
}) => {
  const { plan, upgradePlan } = useSubscription(userId);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [selectedPlan, setSelectedPlan] = useState<UserPlan>(UserPlan.PRO);
  const [notification, setNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = (targetPlan: UserPlan) => {
    // Architecture checkout intent
    const tier = PRICING_TIERS[targetPlan];
    const price = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly;

    purchaseService.prepareCheckoutSession(userId, targetPlan, price);

    // Apply architecture upgrade
    upgradePlan(targetPlan);
    setNotification(`Upgraded to ${tier.name}! (Architecture Mode)`);
    setTimeout(() => {
      setNotification(null);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-purple-500/30 bg-slate-900/95 p-6 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-950/50 px-3 py-1 text-xs font-semibold text-purple-300 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            CRUX LIFE OS ARCHITECTURE
          </div>
          <h2 className="text-2xl font-black text-white">Upgrade Your Hunter Operating System</h2>
          <p className="text-sm text-slate-300 mt-1">
            Unlock AI Vision, Advanced Analytics, Unlimited Missions & Custom Themes
          </p>

          {highlightFeature && (
            <div className="mt-3 inline-block rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs text-cyan-300">
              Required for: <strong className="text-white">{highlightFeature.replace(/_/g, ' ')}</strong>
            </div>
          )}

          {/* Billing Switcher */}
          <div className="mt-4 inline-flex items-center rounded-xl bg-slate-800/80 p-1 border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                billingCycle === 'monthly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-purple-600 text-white shadow' : 'text-slate-400'
              }`}
            >
              Yearly
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] text-emerald-300 border border-emerald-500/40">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {notification && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-center text-xs font-bold text-emerald-300">
            {notification}
          </div>
        )}

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[UserPlan.PRO, UserPlan.ELITE, UserPlan.LIFETIME].map((planKey) => {
            const tier = PRICING_TIERS[planKey];
            const isCurrent = plan === planKey;
            const isSelected = selectedPlan === planKey;

            const priceFormatted =
              planKey === UserPlan.LIFETIME
                ? PricingService.formatPrice(tier.priceLifetime || 29900)
                : billingCycle === 'yearly'
                ? `${PricingService.formatPrice(Math.round(tier.priceYearly / 12))}/mo`
                : `${PricingService.formatPrice(tier.priceMonthly)}/mo`;

            return (
              <div
                key={planKey}
                onClick={() => setSelectedPlan(planKey)}
                className={`relative flex flex-col justify-between rounded-xl border p-5 transition-all cursor-pointer ${
                  tier.isPopular
                    ? 'border-purple-400/80 bg-gradient-to-b from-purple-950/40 to-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                } ${isSelected ? 'ring-2 ring-purple-400' : ''}`}
              >
                {tier.badgeText && (
                  <div className="absolute -top-3 right-4 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-0.5 text-[10px] font-black text-white shadow">
                    {tier.badgeText}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{tier.name}</h3>
                    <PremiumBadge plan={planKey} size="sm" showText={false} />
                  </div>
                  <p className="text-xs text-slate-400 mb-3 min-h-[32px]">{tier.tagline}</p>

                  <div className="mb-4">
                    <span className="text-2xl font-black text-white">{priceFormatted}</span>
                    {planKey !== UserPlan.LIFETIME && (
                      <span className="text-xs text-slate-400">
                        {billingCycle === 'yearly' ? ' (billed annually)' : ''}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2 mb-6 text-xs text-slate-300">
                    {tier.features.slice(0, 6).map((feat) => (
                      <li key={feat} className="flex items-center gap-2">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{feat.replace(/_/g, ' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpgrade(planKey);
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow'
                  }`}
                >
                  {isCurrent ? 'Current Active Plan' : `Upgrade to ${tier.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Founder Pack Banner */}
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-slate-900 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-950/80 text-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.3)]">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">Founder Edition Upgrade</h4>
              <p className="text-xs text-slate-300">
                Exclusive VIP Badge, Golden Profile Border, Discord VIP Lounge & Lifetime access.
              </p>
            </div>
          </div>
          <button
            onClick={() => handleUpgrade(UserPlan.FOUNDER)}
            className="shrink-0 rounded-lg bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-4 py-2 text-xs font-black text-slate-950 shadow-lg hover:brightness-110"
          >
            Claim Founder Status ($499)
          </button>
        </div>

        {/* Security & No Payment Note */}
        <div className="mt-4 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
          Production-Ready Architecture. No real payment charged in development environment.
        </div>
      </div>
    </div>
  );
};
