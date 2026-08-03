// ==========================================
// CRUX Life OS - Feature Gate Service
// Centralized Access Control for Premium Features
// ==========================================

import { UserPlan, FeatureKey } from '../types/monetization';
import { PRICING_TIERS } from './pricingService';

export interface FeatureAccessResult {
  allowed: boolean;
  requiredPlan: UserPlan;
  featureKey: FeatureKey;
  reason?: string;
}

export class FeatureGateService {
  /**
   * Evaluates if a given plan has access to a feature.
   */
  public hasFeature(plan: UserPlan, feature: FeatureKey): boolean {
    const tier = PRICING_TIERS[plan];
    if (!tier) return false;
    return tier.features.includes(feature);
  }

  /**
   * Returns details on feature permission along with required minimum plan.
   */
  public checkFeatureAccess(plan: UserPlan, feature: FeatureKey): FeatureAccessResult {
    const allowed = this.hasFeature(plan, feature);
    const requiredPlan = this.getRequiredPlan(feature);

    return {
      allowed,
      requiredPlan,
      featureKey: feature,
      reason: allowed
        ? 'Feature unlocked'
        : `Requires ${PRICING_TIERS[requiredPlan].name} or higher.`,
    };
  }

  /**
   * Determines the lowest tier required for a given feature.
   */
  public getRequiredPlan(feature: FeatureKey): UserPlan {
    const order: UserPlan[] = [
      UserPlan.FREE,
      UserPlan.PRO,
      UserPlan.ELITE,
      UserPlan.LIFETIME,
      UserPlan.FOUNDER,
    ];

    for (const plan of order) {
      if (PRICING_TIERS[plan]?.features.includes(feature)) {
        return plan;
      }
    }

    return UserPlan.ELITE;
  }

  /**
   * Returns list of all locked features for a user plan.
   */
  public getLockedFeatures(plan: UserPlan): FeatureKey[] {
    const allFeatures = Object.values(FeatureKey);
    return allFeatures.filter((feat) => !this.hasFeature(plan, feat));
  }
}

export const featureGateService = new FeatureGateService();
