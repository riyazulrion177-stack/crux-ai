// ==========================================
// CRUX Life OS - useSubscription Hook
// ==========================================

import { useState, useEffect, useCallback } from 'react';
import { UserSubscription, UserPlan, PaymentProvider } from '../types/monetization';
import { subscriptionService } from '../services/subscriptionService';
import { featureGateService } from '../services/featureGateService';

export function useSubscription(userId: string) {
  const [subscription, setSubscription] = useState<UserSubscription>(() =>
    subscriptionService.getSubscription(userId)
  );

  useEffect(() => {
    if (userId) {
      setSubscription(subscriptionService.getSubscription(userId));
    }
  }, [userId]);

  const upgradePlan = useCallback(
    (plan: UserPlan, provider: PaymentProvider = PaymentProvider.MANUAL) => {
      const updated = subscriptionService.upgradePlan(userId, plan, provider);
      setSubscription({ ...updated });
      return updated;
    },
    [userId]
  );

  const cancelSubscription = useCallback(() => {
    const updated = subscriptionService.cancelSubscription(userId);
    setSubscription({ ...updated });
    return updated;
  }, [userId]);

  const startTrial = useCallback(
    (days: number = 7) => {
      const updated = subscriptionService.startTrial(userId, days);
      setSubscription({ ...updated });
      return updated;
    },
    [userId]
  );

  const hasFeature = useCallback(
    (feature: Parameters<typeof featureGateService.hasFeature>[1]) =>
      featureGateService.hasFeature(subscription.plan, feature),
    [subscription.plan]
  );

  return {
    subscription,
    plan: subscription.plan,
    status: subscription.status,
    isPro: subscription.plan === UserPlan.PRO,
    isElite: subscription.plan === UserPlan.ELITE,
    isLifetime: subscription.isLifetime,
    isFounder: subscription.isFounder,
    upgradePlan,
    cancelSubscription,
    startTrial,
    hasFeature,
  };
}
