// ==========================================
// CRUX Life OS - useRewardedAds Hook
// Rewarded Ads Hook Strategy
// ==========================================

import { useState, useCallback } from 'react';
import { RewardItem, RewardedAdResponse } from '../types/monetization';
import { adService } from '../services/adService';

export function useRewardedAds(userId: string) {
  const [isAdLoading, setIsAdLoading] = useState<boolean>(false);
  const [lastAdResult, setLastAdResult] = useState<RewardedAdResponse | null>(null);

  const availableRewards = adService.getAvailableRewards();

  const showRewardAd = useCallback(
    async (reward: RewardItem): Promise<RewardedAdResponse> => {
      setIsAdLoading(true);
      try {
        const res = await adService.showRewardAd(userId, reward);
        setLastAdResult(res);
        setIsAdLoading(false);
        return res;
      } catch (err) {
        const res: RewardedAdResponse = {
          status: 'FAILED',
          message: err instanceof Error ? err.message : 'Ad execution failed',
        };
        setLastAdResult(res);
        setIsAdLoading(false);
        return res;
      }
    },
    [userId]
  );

  const simulateAdWatch = useCallback(
    (reward: RewardItem): RewardedAdResponse => {
      const res = adService.simulateAdWatch(userId, reward);
      setLastAdResult(res);
      return res;
    },
    [userId]
  );

  return {
    isAdLoading,
    lastAdResult,
    availableRewards,
    showRewardAd,
    simulateAdWatch,
  };
}
