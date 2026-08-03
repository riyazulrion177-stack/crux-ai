// ==========================================
// CRUX Life OS - Rewarded Ad Service
// Ad Provider Abstraction Pipeline
// ==========================================

import { RewardedAdResponse, RewardItem, RewardType } from '../types/monetization';
import { rewardService } from './rewardService';

export class AdService {
  private availableRewards: RewardItem[] = [
    { type: RewardType.COINS, amount: 250, description: '250 Cyber Coins' },
    { type: RewardType.XP, amount: 300, description: '300 Bonus XP' },
    { type: RewardType.ENERGY, amount: 50, description: '50 Energy Refill' },
    { type: RewardType.RETRY_BOSS, amount: 1, description: '+1 Hour Boss Time Extension' },
    { type: RewardType.TREASURE_CHEST, amount: 1, description: '1 Rare Loot Chest' },
    { type: RewardType.AI_MESSAGES, amount: 5, description: '5 AI Coach Messages' },
    { type: RewardType.PREMIUM_TRIAL_TICKET, amount: 1, description: '24-Hour Pro Trial Ticket' },
  ];

  public getAvailableRewards(): RewardItem[] {
    return this.availableRewards;
  }

  /**
   * Primary SDK integration entry point.
   * Returns NOT_IMPLEMENTED as specified in system specifications,
   * while maintaining the architectural callback interface for future AdMob/Unity Ads SDKs.
   */
  public async showRewardAd(_userId: string, _reward: RewardItem): Promise<RewardedAdResponse> {
    // Architecture declaration: returns NOT_IMPLEMENTED as specified.
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'NOT_IMPLEMENTED',
          message: 'AdMob/Ad SDK is not currently connected. Architecture ready for SDK hook.',
        });
      }, 500);
    });
  }

  /**
   * Architecture testing method for granting ad rewards during local simulation.
   */
  public simulateAdWatch(userId: string, reward: RewardItem): RewardedAdResponse {
    const success = rewardService.grantReward(userId, reward, 'REWARDED_AD_WATCH');
    if (success) {
      return {
        status: 'SUCCESS',
        message: `Successfully claimed ${reward.description}!`,
        reward,
      };
    }
    return {
      status: 'FAILED',
      message: 'Failed to apply reward.',
    };
  }
}

export const adService = new AdService();
