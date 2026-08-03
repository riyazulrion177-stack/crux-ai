// ==========================================
// CRUX Life OS - RewardAdModal Component
// Rewarded Ad Bridge Modal (Supports NOT_IMPLEMENTED architecture & Test Grants)
// ==========================================

import React, { useState } from 'react';
import { RewardItem, RewardType, RewardedAdResponse } from '../../types/monetization';
import { useRewardedAds } from '../../hooks/useRewardedAds';
import { X, PlayCircle, Gift, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (reward: RewardItem) => void;
}

export const RewardAdModal: React.FC<Props> = ({
  userId,
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const { showRewardAd, simulateAdWatch, availableRewards, isAdLoading } = useRewardedAds(userId);
  const [selectedReward, setSelectedReward] = useState<RewardItem>(availableRewards[0]);
  const [adResult, setAdResult] = useState<RewardedAdResponse | null>(null);

  if (!isOpen) return null;

  const handleWatchAd = async () => {
    const res = await showRewardAd(selectedReward);
    setAdResult(res);
  };

  const handleSimulateWatch = () => {
    const res = simulateAdWatch(selectedReward);
    setAdResult(res);
    if (res.status === 'SUCCESS' && onRewardClaimed) {
      onRewardClaimed(selectedReward);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Rewarded Ad Station</h3>
            <p className="text-xs text-slate-400">Watch short ad to receive bonus system rewards</p>
          </div>
        </div>

        {/* Reward Selector */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-slate-300 block mb-2">Select Reward Target:</label>
          <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
            {availableRewards.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedReward(item)}
                className={`flex items-center justify-between rounded-xl border p-2.5 text-xs cursor-pointer transition-all ${
                  selectedReward.type === item.type
                    ? 'border-amber-400/80 bg-amber-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                  <span className="font-semibold text-white">{item.description}</span>
                </div>
                <span className="text-[10px] text-slate-500">+{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Result Message Banner */}
        {adResult && (
          <div
            className={`mb-4 rounded-xl border p-3 text-xs flex items-center gap-2 ${
              adResult.status === 'SUCCESS'
                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                : 'border-amber-500/40 bg-amber-950/60 text-amber-300'
            }`}
          >
            {adResult.status === 'SUCCESS' ? (
              <CheckCircle className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <div>
              <span className="font-bold block">Status: {adResult.status}</span>
              <span className="text-[11px] opacity-90">{adResult.message}</span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-2">
          <button
            onClick={handleWatchAd}
            disabled={isAdLoading}
            className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 py-2.5 text-xs font-black text-slate-950 shadow hover:brightness-110 flex items-center justify-center gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            {isAdLoading ? 'Loading Ad Stream...' : 'Watch Ad (Returns NOT_IMPLEMENTED)'}
          </button>

          <button
            onClick={handleSimulateWatch}
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
          >
            Simulate Ad Completion & Claim Reward
          </button>
        </div>
      </div>
    </div>
  );
};
