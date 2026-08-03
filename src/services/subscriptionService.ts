// ==========================================
// CRUX Life OS - Subscription Service
// Manages Subscription State, Lifecycle & Upgrades
// ==========================================

import { UserPlan, SubscriptionStatus, UserSubscription, PaymentProvider } from '../types/monetization';

const STORAGE_KEY_SUBSCRIPTION = 'crux_user_subscription_v1';

export class SubscriptionService {
  private cache: Map<string, UserSubscription> = new Map();

  private getDefaultSubscription(userId: string): UserSubscription {
    return {
      id: `sub_${userId}_free`,
      userId,
      plan: UserPlan.FREE,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date().toISOString(),
      isLifetime: false,
      isFounder: false,
      isCancelled: false,
      cancelAtPeriodEnd: false,
      provider: PaymentProvider.MANUAL,
    };
  }

  public getSubscription(userId: string): UserSubscription {
    const key = `${STORAGE_KEY_SUBSCRIPTION}_${userId}`;
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
      // Ignore parse error
    }

    const defaultSub = this.getDefaultSubscription(userId);
    this.saveSubscription(defaultSub);
    return defaultSub;
  }

  public saveSubscription(subscription: UserSubscription): void {
    const key = `${STORAGE_KEY_SUBSCRIPTION}_${subscription.userId}`;
    this.cache.set(key, subscription);
    try {
      localStorage.setItem(key, JSON.stringify(subscription));
    } catch {
      // Storage quota or restriction
    }
  }

  public upgradePlan(
    userId: string,
    targetPlan: UserPlan,
    provider: PaymentProvider = PaymentProvider.MANUAL
  ): UserSubscription {
    const current = this.getSubscription(userId);
    const now = new Date();
    const nextMonth = new Date(now.valueOf() + 30 * 24 * 60 * 60 * 1000);

    const isLifetime = targetPlan === UserPlan.LIFETIME || targetPlan === UserPlan.FOUNDER;
    const isFounder = targetPlan === UserPlan.FOUNDER;

    const updated: UserSubscription = {
      ...current,
      plan: targetPlan,
      status: SubscriptionStatus.ACTIVE,
      startDate: now.toISOString(),
      endDate: isLifetime ? undefined : nextMonth.toISOString(),
      renewalDate: isLifetime ? undefined : nextMonth.toISOString(),
      isLifetime,
      isFounder,
      isCancelled: false,
      cancelAtPeriodEnd: false,
      provider,
    };

    this.saveSubscription(updated);
    return updated;
  }

  public cancelSubscription(userId: string): UserSubscription {
    const current = this.getSubscription(userId);
    if (current.plan === UserPlan.FREE || current.isLifetime) {
      return current;
    }

    const updated: UserSubscription = {
      ...current,
      cancelAtPeriodEnd: true,
      isCancelled: true,
      status: SubscriptionStatus.CANCELLED,
    };

    this.saveSubscription(updated);
    return updated;
  }

  public startTrial(userId: string, days: number = 7): UserSubscription {
    const current = this.getSubscription(userId);
    const now = new Date();
    const trialEnd = new Date(now.valueOf() + days * 24 * 60 * 60 * 1000);

    const updated: UserSubscription = {
      ...current,
      plan: UserPlan.PRO,
      status: SubscriptionStatus.TRIALING,
      trialEndDate: trialEnd.toISOString(),
    };

    this.saveSubscription(updated);
    return updated;
  }
}

export const subscriptionService = new SubscriptionService();
