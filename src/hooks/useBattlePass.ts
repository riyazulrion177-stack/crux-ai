// ==========================================
// CRUX Life OS - useBattlePass Hook
// Seasonal Battle Pass Progression State
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { BattlePassSeason } from '../types/monetization';
import { battlePassService } from '../services/battlePassService';

export function useBattlePass(userId: string) {
  const [season, setSeason] = useState<BattlePassSeason>(() =>
    battlePassService.getSeason(userId)
  );

  useEffect(() => {
    if (userId) {
      setSeason(battlePassService.getSeason(userId));
    }
  }, [userId]);

  const addXp = useCallback(
    (amount: number) => {
      const updated = battlePassService.addXp(userId, amount);
      setSeason({ ...updated });
    },
    [userId]
  );

  const claimReward = useCallback(
    (tierNumber: number, isPremiumReward: boolean) => {
      const success = battlePassService.claimReward(userId, tierNumber, isPremiumReward);
      if (success) {
        setSeason({ ...battlePassService.getSeason(userId) });
      }
      return success;
    },
    [userId]
  );

  const unlockPremiumPass = useCallback(() => {
    const updated = battlePassService.unlockPremiumPass(userId);
    setSeason({ ...updated });
    return updated;
  }, [userId]);

  return {
    season,
    currentTier: season.currentTier,
    currentXp: season.currentXp,
    hasPremiumPass: season.hasPremiumPass,
    addXp,
    claimReward,
    unlockPremiumPass,
  };
}
