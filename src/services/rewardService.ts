// ==========================================
// CRUX Life OS - Reward Service
// Dispatches Rewards (Coins, XP, Energy, Retries, AI Credits)
// ==========================================

import { RewardItem, RewardType } from '../types/monetization';
import { coinEconomyService } from './coinEconomyService';
import { storageService } from './storageService';

export class RewardService {
  /**
   * Applies a given reward to the user profile and storage system.
   */
  public grantReward(userId: string, reward: RewardItem, source: string): boolean {
    try {
      switch (reward.type) {
        case RewardType.COINS:
          coinEconomyService.awardCoins(userId, reward.amount, source, reward.description);
          break;

        case RewardType.XP: {
          const profile = storageService.getUserProfile(userId);
          if (profile) {
            profile.xp += reward.amount;
            storageService.saveUserProfile(profile, userId);
          }
          break;
        }

        case RewardType.ENERGY: {
          const profile = storageService.getUserProfile(userId);
          if (profile) {
            profile.energy = Math.min(profile.maxEnergy || 100, (profile.energy || 100) + reward.amount);
            storageService.saveUserProfile(profile, userId);
          }
          break;
        }

        case RewardType.RETRY_BOSS: {
          const boss = storageService.getBossState(userId);
          if (boss) {
            boss.timeRemainingSeconds = (boss.timeRemainingSeconds || 0) + reward.amount * 3600;
            storageService.saveBossState(boss, userId);
          }
          break;
        }

        case RewardType.AI_MESSAGES: {
          const profile = storageService.getUserProfile(userId);
          if (profile) {
            profile.xp = (profile.xp || 0) + reward.amount * 50;
            storageService.saveUserProfile(profile, userId);
          }
          break;
        }

        default:
          break;
      }
      return true;
    } catch (err) {
      console.error('Failed to grant reward:', err);
      return false;
    }
  }
}

export const rewardService = new RewardService();
