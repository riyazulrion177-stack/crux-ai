// ==========================================
// CRUX Life OS - BattlePassScreen Component
// Seasonal Battle Pass Track & Claim UI
// ==========================================

import React, { useState } from 'react';
import { useBattlePass } from '../../hooks/useBattlePass';
import { Shield, Sparkles, Lock, CheckCircle2, Trophy, Gift, ArrowUpCircle } from 'lucide-react';
import { UpgradeModal } from './UpgradeModal';

interface Props {
  userId: string;
}

export const BattlePassScreen: React.FC<Props> = ({ userId }) => {
  const { season, claimReward, unlockPremiumPass, addXp } = useBattlePass(userId);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleClaim = (tierNumber: number, isPremium: boolean) => {
    const ok = claimReward(tierNumber, isPremium);
    if (ok) {
      setNotification(`Claimed Tier ${tierNumber} ${isPremium ? 'Premium' : 'Free'} Reward!`);
      setTimeout(() => setNotification(null), 2500);
    }
  };

  const handleUnlockPass = () => {
    unlockPremiumPass();
    setNotification('Unlocked Premium Battle Pass! (Architecture Mode)');
    setTimeout(() => setNotification(null), 2500);
  };

  const handleTestXp = () => {
    addXp(300);
    setNotification('+300 Battle Pass XP Granted!');
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Season Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/40 bg-purple-900/40 px-3 py-1 text-xs font-black text-purple-300 mb-2">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              {season.title}
            </div>
            <h2 className="text-2xl font-black text-white">System Battle Pass</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">{season.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTestXp}
              className="rounded-xl border border-purple-500/40 bg-purple-950/60 px-3 py-2 text-xs font-bold text-purple-300 hover:bg-purple-900/60 flex items-center gap-1.5"
            >
              <ArrowUpCircle className="h-4 w-4" />
              +300 XP Test
            </button>

            {!season.hasPremiumPass ? (
              <button
                onClick={handleUnlockPass}
                className="rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-2 text-xs font-black text-slate-950 shadow-lg hover:brightness-110 flex items-center gap-1.5"
              >
                <Sparkles className="h-4 w-4" />
                Unlock Premium Pass
              </button>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-4 py-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                PREMIUM PASS UNLOCKED
              </div>
            )}
          </div>
        </div>

        {/* Level & XP Progress Bar */}
        <div className="mt-6 border-t border-purple-500/20 pt-4">
          <div className="flex items-center justify-between text-xs font-bold mb-2">
            <span className="text-purple-300">Current Level: Tier {season.currentTier}</span>
            <span className="text-slate-400">{season.currentXp} total Battle XP</span>
          </div>

          <div className="h-3 w-full rounded-full bg-slate-950/80 p-0.5 border border-purple-500/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              style={{ width: `${Math.min(100, (season.currentXp / 4000) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {notification && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-center text-xs font-bold text-emerald-300">
          {notification}
        </div>
      )}

      {/* Battle Pass Track Tiers Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400" />
          Season Rewards Track
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {season.tiers.map((t) => {
            const isReached = season.currentTier >= t.tier;

            return (
              <div
                key={t.tier}
                className={`rounded-xl border p-4 transition-all ${
                  isReached
                    ? 'border-purple-500/40 bg-slate-900/80 shadow-md'
                    : 'border-slate-800/80 bg-slate-950/40 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-950 border border-purple-500/40 text-xs font-black text-purple-300">
                      {t.tier}
                    </span>
                    <span className="text-xs font-bold text-white">Tier {t.tier}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{t.xpRequired} XP required</span>
                </div>

                {/* Free vs Premium Rewards Row */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Free Reward */}
                  <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-2.5">
                    <span className="text-[10px] font-bold text-slate-400 block mb-1">FREE TRACK</span>
                    <p className="font-semibold text-slate-200 mb-2">{t.freeReward?.description}</p>

                    {t.isClaimedFree ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => handleClaim(t.tier, false)}
                        disabled={!isReached}
                        className={`w-full py-1 rounded text-[11px] font-bold ${
                          isReached
                            ? 'bg-purple-600 text-white hover:bg-purple-500'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isReached ? 'Claim Free' : 'Locked'}
                      </button>
                    )}
                  </div>

                  {/* Premium Reward */}
                  <div className="rounded-lg border border-amber-500/30 bg-amber-950/20 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-amber-300">PREMIUM TRACK</span>
                      {!season.hasPremiumPass && <Lock className="h-3 w-3 text-amber-400" />}
                    </div>
                    <p className="font-semibold text-amber-100 mb-2">{t.premiumReward?.description}</p>

                    {t.isClaimedPremium ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                        <CheckCircle2 className="h-3 w-3" /> Claimed
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (!season.hasPremiumPass) {
                            setIsUpgradeModalOpen(true);
                          } else {
                            handleClaim(t.tier, true);
                          }
                        }}
                        disabled={!isReached && season.hasPremiumPass}
                        className={`w-full py-1 rounded text-[11px] font-bold ${
                          season.hasPremiumPass && isReached
                            ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {!season.hasPremiumPass
                          ? 'Unlock Pass'
                          : isReached
                          ? 'Claim Premium'
                          : 'Locked'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isUpgradeModalOpen && (
        <UpgradeModal
          userId={userId}
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
        />
      )}
    </div>
  );
};
