// ==========================================
// CRUX Life OS - usePremium Hook
// Quick Premium Verification & Feature Gate Helper
// ==========================================

import { useSubscription } from './useSubscription';
import { UserPlan, FeatureKey } from '../types/monetization';
import { featureGateService, FeatureAccessResult } from '../services/featureGateService';

export function usePremium(userId: string) {
  const { plan, subscription } = useSubscription(userId);

  const isPremium = plan !== UserPlan.FREE;

  const checkFeature = (feature: FeatureKey): FeatureAccessResult => {
    return featureGateService.checkFeatureAccess(plan, feature);
  };

  const hasFeature = (feature: FeatureKey): boolean => {
    return featureGateService.hasFeature(plan, feature);
  };

  return {
    isPremium,
    plan,
    subscription,
    checkFeature,
    hasFeature,
  };
}
