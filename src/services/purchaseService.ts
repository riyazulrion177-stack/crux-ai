// ==========================================
// CRUX Life OS - Purchase Service
// Prepared Checkout & Transaction Intent Pipeline
// ==========================================

import { UserPlan, PaymentProvider } from '../types/monetization';
import { subscriptionService } from './subscriptionService';

export interface CheckoutSessionIntent {
  sessionId: string;
  userId: string;
  plan: UserPlan;
  amountCents: number;
  currency: string;
  provider: PaymentProvider;
  status: 'PENDING_INTEGRATION' | 'READY_FOR_PROVIDER';
  createdAt: string;
}

export class PurchaseService {
  /**
   * Prepares a checkout session intent for future payment gateway connection.
   */
  public prepareCheckoutSession(
    userId: string,
    plan: UserPlan,
    amountCents: number,
    provider: PaymentProvider = PaymentProvider.STRIPE
  ): CheckoutSessionIntent {
    return {
      sessionId: `checkout_intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      plan,
      amountCents,
      currency: 'USD',
      provider,
      status: 'PENDING_INTEGRATION',
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Simulates developer/local architecture plan grant when testing architecture without real billing SDK.
   */
  public grantArchitecturePlan(userId: string, plan: UserPlan, provider: PaymentProvider = PaymentProvider.MANUAL) {
    return subscriptionService.upgradePlan(userId, plan, provider);
  }
}

export const purchaseService = new PurchaseService();
