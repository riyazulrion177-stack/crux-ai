// ==========================================
// CRUX Life OS - LifetimeBanner Component
// Lifetime License Banner
// ==========================================

import React from 'react';
import { Star, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  onUpgradeClick: () => void;
  className?: string;
}

export const LifetimeBanner: React.FC<Props> = ({ onUpgradeClick, className = '' }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 shadow-xl ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-900 border border-purple-400/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Star className="h-6 w-6" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-black text-purple-300 uppercase tracking-wider mb-1">
              <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
              ONE-TIME PAYMENT • ZERO RECURRING FEES
            </div>
            <h3 className="text-lg font-black text-white">CRUX Lifetime Pass</h3>
            <p className="text-xs text-slate-300">
              Own all Elite AI tools, Vision AI, Voice Coach & future updates forever with 1-click lifetime pass.
            </p>
          </div>
        </div>

        <button
          onClick={onUpgradeClick}
          className="shrink-0 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:brightness-110 flex items-center gap-2"
        >
          Claim Lifetime License ($299)
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
