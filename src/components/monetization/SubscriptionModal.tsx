// ==========================================
// CRUX Life OS - SubscriptionModal Component
// Active Subscription Management & Invoice Portal
// ==========================================

import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { PremiumBadge } from './PremiumBadge';
import { PRICING_TIERS, PricingService } from '../../services/pricingService';
import { X, Shield, Calendar, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionModal: React.FC<Props> = ({ userId, isOpen, onClose }) => {
  const { subscription, cancelSubscription, startTrial } = useSubscription(userId);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTier = PRICING_TIERS[subscription.plan];

  const handleCancel = () => {
    cancelSubscription();
    setMessage('Subscription set to cancel at period end.');
  };

  const handleStartTrial = () => {
    startTrial(7);
    setMessage('7-Day Pro Trial activated!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950 border border-purple-500/40 text-purple-300">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Manage Subscription</h3>
            <p className="text-xs text-slate-400">CRUX Life OS Account & Billing Architecture</p>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {message}
          </div>
        )}

        {/* Current Plan Overview Card */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-xs text-slate-400 block">Active Plan</span>
              <span className="text-base font-black text-white">{currentTier.name}</span>
            </div>
            <PremiumBadge plan={subscription.plan} size="md" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>
                Renewal: {subscription.renewalDate ? new Date(subscription.renewalDate).toLocaleDateString() : 'N/A (Lifetime)'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
              <span>Status: <strong className="text-emerald-400">{subscription.status}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2">
          {!subscription.isLifetime && subscription.status === 'ACTIVE' && (
            <button
              onClick={handleCancel}
              className="w-full rounded-lg border border-red-500/30 bg-red-950/20 py-2 text-xs font-bold text-red-300 hover:bg-red-950/40 flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Cancel Subscription at Period End
            </button>
          )}

          {subscription.plan === 'FREE' && (
            <button
              onClick={handleStartTrial}
              className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 py-2 text-xs font-bold text-white shadow hover:brightness-110"
            >
              Activate 7-Day Pro Trial
            </button>
          )}
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-500">
          Payment Provider Bridge: {subscription.provider} (Architecture Ready)
        </div>
      </div>
    </div>
  );
};
