// ==========================================
// CRUX Life OS - Battle Pass Service
// Seasonal Battle Pass Progression System
// ==========================================

import { BattlePassSeason, BattlePassTier, RewardType } from '../types/monetization';
import { rewardService } from './rewardService';

const STORAGE_KEY_BATTLE_PASS = 'crux_battle_pass_v1';

export const CURRENT_SEASON_DATA: BattlePassSeason = {
  id: 'season_1_cyber_genesis',
  seasonNumber: 1,
  title: 'Season I: Cyber Genesis',
  description: 'Unlock futuristic cosmetic themes, rare titles & bonus coins through mission progression.',
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days
  maxTier: 10,
  currentTier: 1,
  currentXp: 150,
  hasPremiumPass: false,
  tiers: [
    {
      tier: 1,
      xpRequired: 100,
      freeReward: { type: RewardType.COINS, amount: 100, description: '100 Cyber Coins' },
      premiumReward: { type: RewardType.COINS, amount: 300, description: '300 Cyber Coins' },
    },
    {
      tier: 2,
      xpRequired: 250,
      freeReward: { type: RewardType.XP, amount: 200, description: '200 Bonus XP' },
      premiumReward: { type: RewardType.TREASURE_CHEST, amount: 1, description: 'Rare Loot Chest' },
    },
    {
      tier: 3,
      xpRequired: 450,
      freeReward: { type: RewardType.ENERGY, amount: 25, description: '+25 Energy' },
      premiumReward: { type: RewardType.AI_MESSAGES, amount: 10, description: '10 AI Coach Credits' },
    },
    {
      tier: 4,
      xpRequired: 700,
      freeReward: { type: RewardType.COINS, amount: 150, description: '150 Cyber Coins' },
      premiumReward: { type: RewardType.RETRY_BOSS, amount: 1, description: '1 Boss Time Extension' },
    },
    {
      tier: 5,
      xpRequired: 1000,
      freeReward: { type: RewardType.XP, amount: 500, description: '500 Bonus XP' },
      premiumReward: { type: RewardType.PREMIUM_TRIAL_TICKET, amount: 1, description: '3-Day Pro Trial Ticket' },
    },
    {
      tier: 6,
      xpRequired: 1400,
      freeReward: { type: RewardType.COINS, amount: 200, description: '200 Cyber Coins' },
      premiumReward: { type: RewardType.COINS, amount: 600, description: '600 Cyber Coins' },
    },
    {
      tier: 7,
      xpRequired: 1900,
      freeReward: { type: RewardType.ENERGY, amount: 50, description: '+50 Energy' },
      premiumReward: { type: RewardType.TREASURE_CHEST, amount: 2, description: '2x Epic Loot Chests' },
    },
    {
      tier: 8,
      xpRequired: 2500,
      freeReward: { type: RewardType.COINS, amount: 250, description: '250 Cyber Coins' },
      premiumReward: { type: RewardType.AI_MESSAGES, amount: 25, description: '25 AI Coach Credits' },
    },
    {
      tier: 9,
      xpRequired: 3200,
      freeReward: { type: RewardType.XP, amount: 1000, description: '1,000 Bonus XP' },
      premiumReward: { type: RewardType.RETRY_BOSS, amount: 3, description: '3 Boss Time Extensions' },
    },
    {
      tier: 10,
      xpRequired: 4000,
      freeReward: { type: RewardType.COINS, amount: 500, description: '500 Cyber Coins' },
      premiumReward: { type: RewardType.COINS, amount: 2000, description: '2,000 Cyber Coins & Exclusive Cyber Crown' },
    },
  ],
};

export class BattlePassService {
  private cache: Map<string, BattlePassSeason> = new Map();

  public getSeason(userId: string): BattlePassSeason {
    const key = `${STORAGE_KEY_BATTLE_PASS}_${userId}`;
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }

    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.cache.set(key, parsed);
        return parsed;
      }
    } catch {
      // Ignore
    }

    this.saveSeason(userId, CURRENT_SEASON_DATA);
    return CURRENT_SEASON_DATA;
  }

  public saveSeason(userId: string, season: BattlePassSeason): void {
    const key = `${STORAGE_KEY_BATTLE_PASS}_${userId}`;
    this.cache.set(key, season);
    try {
      localStorage.setItem(key, JSON.stringify(season));
    } catch {
      // Storage quota
    }
  }

  public addXp(userId: string, xpAmount: number): BattlePassSeason {
    const season = this.getSeason(userId);
    season.currentXp += xpAmount;

    // Recalculate tier
    for (const t of season.tiers) {
      if (season.currentXp >= t.xpRequired && t.tier > season.currentTier) {
        season.currentTier = t.tier;
      }
    }

    this.saveSeason(userId, season);
    return season;
  }

  public claimReward(userId: string, tierNumber: number, isPremiumReward: boolean): boolean {
    const season = this.getSeason(userId);
    const tier = season.tiers.find((t) => t.tier === tierNumber);

    if (!tier || season.currentTier < tierNumber) {
      return false;
    }

    if (isPremiumReward) {
      if (!season.hasPremiumPass || tier.isClaimedPremium || !tier.premiumReward) {
        return false;
      }
      rewardService.grantReward(userId, tier.premiumReward, `BattlePass Tier ${tierNumber} Premium`);
      tier.isClaimedPremium = true;
    } else {
      if (tier.isClaimedFree || !tier.freeReward) {
        return false;
      }
      rewardService.grantReward(userId, tier.freeReward, `BattlePass Tier ${tierNumber} Free`);
      tier.isClaimedFree = true;
    }

    this.saveSeason(userId, season);
    return true;
  }

  public unlockPremiumPass(userId: string): BattlePassSeason {
    const season = this.getSeason(userId);
    season.hasPremiumPass = true;
    this.saveSeason(userId, season);
    return season;
  }
}

export const battlePassService = new BattlePassService();
