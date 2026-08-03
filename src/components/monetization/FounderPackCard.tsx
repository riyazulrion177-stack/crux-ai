// ==========================================
// CRUX Life OS - FounderPackCard Component
// Exclusive Founder Pack Card
// ==========================================

import React from 'react';
import { FOUNDER_PACK_DETAILS } from '../../services/pricingService';
import { Crown, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  onClaimClick: () => void;
  className?: string;
}

export const FounderPackCard: React.FC<Props> = ({ onClaimClick, className = '' }) => {
  const pack = FOUNDER_PACK_DETAILS;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-950/60 via-slate-900 to-amber-950/40 p-6 shadow-2xl ${className}`}
    >
      <div className="absolute top-3 right-3 rounded-full border border-amber-400/60 bg-amber-950/80 px-3 py-1 text-[10px] font-black text-amber-300 shadow">
        LIMITED FOUNDER EDITION
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/60 bg-amber-950/80 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.4)]">
          <Crown className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-xl font-black text-amber-200">{pack.title}</h3>
          <p className="text-xs text-slate-300">{pack.description}</p>
        </div>
      </div>

      <div className="space-y-2 mb-6 text-xs text-slate-200">
        {pack.perks.map((perk, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
            <span>{perk}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-amber-500/30 pt-4">
        <div>
          <span className="text-[10px] text-amber-300/80 block uppercase">One-time Investment</span>
          <span className="text-2xl font-black text-white">${pack.priceUsd} USD</span>
        </div>

        <button
          onClick={onClaimClick}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 px-5 py-2.5 text-xs font-black text-slate-950 shadow-lg hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" />
          Become Founder
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
