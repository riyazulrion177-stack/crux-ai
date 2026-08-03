// ==========================================
// CRUX Life OS - Coin Economy Service
// Purely Cosmetic Virtual Economy (Strictly NO Pay-To-Win)
// ==========================================

import { CoinTransaction } from '../types/monetization';

const STORAGE_KEY_COIN_BALANCE = 'crux_coin_balance_v1';
const STORAGE_KEY_COIN_HISTORY = 'crux_coin_history_v1';

export class CoinEconomyService {
  private balanceCache: Map<string, number> = new Map();

  public getBalance(userId: string): number {
    const key = `${STORAGE_KEY_COIN_BALANCE}_${userId}`;
    if (this.balanceCache.has(key)) {
      return this.balanceCache.get(key)!;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        const val = parseInt(raw, 10);
        if (!isNaN(val)) {
          this.balanceCache.set(key, val);
          return val;
        }
      }
    } catch {
      // Ignore
    }

    // Initial starting cosmetic coin balance for new users
    const defaultBalance = 500;
    this.setBalance(userId, defaultBalance);
    return defaultBalance;
  }

  private setBalance(userId: string, balance: number): void {
    const key = `${STORAGE_KEY_COIN_BALANCE}_${userId}`;
    this.balanceCache.set(key, balance);
    try {
      localStorage.setItem(key, balance.toString());
    } catch {
      // Storage restriction
    }
  }

  public getHistory(userId: string): CoinTransaction[] {
    const key = `${STORAGE_KEY_COIN_HISTORY}_${userId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // Ignore
    }
    return [];
  }

  private addTransaction(userId: string, tx: Omit<CoinTransaction, 'id' | 'userId' | 'timestamp'>): void {
    const history = this.getHistory(userId);
    const newTx: CoinTransaction = {
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      timestamp: new Date().toISOString(),
    };

    history.unshift(newTx);
    const key = `${STORAGE_KEY_COIN_HISTORY}_${userId}`;
    try {
      localStorage.setItem(key, JSON.stringify(history.slice(0, 100)));
    } catch {
      // Storage quota
    }
  }

  public awardCoins(userId: string, amount: number, source: string, description: string): number {
    if (amount <= 0) return this.getBalance(userId);

    const current = this.getBalance(userId);
    const updated = current + amount;
    this.setBalance(userId, updated);

    this.addTransaction(userId, {
      amount,
      type: 'EARNED',
      source,
      description,
    });

    return updated;
  }

  public spendCoins(userId: string, amount: number, itemTitle: string): boolean {
    if (amount <= 0) return true;

    const current = this.getBalance(userId);
    if (current < amount) {
      return false; // Insufficient funds
    }

    const updated = current - amount;
    this.setBalance(userId, updated);

    this.addTransaction(userId, {
      amount: -amount,
      type: 'SPENT',
      source: 'COSMETIC_SHOP',
      description: `Purchased cosmetic item: ${itemTitle}`,
    });

    return true;
  }
}

export const coinEconomyService = new CoinEconomyService();
