// ==========================================
// CRUX Life OS - useCoins Hook
// Cosmetic Coin Economy State & Controls
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { CoinTransaction } from '../types/monetization';
import { coinEconomyService } from '../services/coinEconomyService';

export function useCoins(userId: string) {
  const [balance, setBalance] = useState<number>(() => coinEconomyService.getBalance(userId));
  const [history, setHistory] = useState<CoinTransaction[]>(() =>
    coinEconomyService.getHistory(userId)
  );

  const refreshCoins = useCallback(() => {
    setBalance(coinEconomyService.getBalance(userId));
    setHistory(coinEconomyService.getHistory(userId));
  }, [userId]);

  useEffect(() => {
    if (userId) {
      refreshCoins();
    }
  }, [userId, refreshCoins]);

  const awardCoins = useCallback(
    (amount: number, source: string, description: string) => {
      const newBalance = coinEconomyService.awardCoins(userId, amount, source, description);
      setBalance(newBalance);
      setHistory(coinEconomyService.getHistory(userId));
      return newBalance;
    },
    [userId]
  );

  const spendCoins = useCallback(
    (amount: number, itemTitle: string) => {
      const success = coinEconomyService.spendCoins(userId, amount, itemTitle);
      if (success) {
        refreshCoins();
      }
      return success;
    },
    [userId, refreshCoins]
  );

  return {
    balance,
    history,
    awardCoins,
    spendCoins,
    refreshCoins,
  };
}
