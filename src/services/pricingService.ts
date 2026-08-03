// ==========================================
// CRUX Life OS - Pricing Service
// Defines Plans, Features, and Pricing Catalog
// ==========================================

import { UserPlan, FeatureKey, PricingTier, FounderPack } from '../types/monetization';

export const PRICING_TIERS: Record<UserPlan, PricingTier> = {
  [UserPlan.FREE]: {
    id: 'plan_free',
    plan: UserPlan.FREE,
    name: 'Free Scout',
    tagline: 'Core RPG mission tracking and daily habit system.',
    priceMonthly: 0,
    priceYearly: 0,
    currency: 'USD',
    features: [
      FeatureKey.UNLIMITED_MISSIONS,
      FeatureKey.BATTLE_PASS,
    ],
  },
  [UserPlan.PRO]: {
    id: 'plan_pro',
    plan: UserPlan.PRO,
    name: 'CRUX Pro',
    tagline: 'AI Coach guidance, custom cosmetic themes & cloud sync.',
    priceMonthly: 999, // $9.99/mo
    priceYearly: 7999, // $79.99/yr
    currency: 'USD',
    badgeText: 'MOST POPULAR',
    isPopular: true,
    features: [
      FeatureKey.UNLIMITED_MISSIONS,
      FeatureKey.BATTLE_PASS,
      FeatureKey.UNLIMITED_AI,
      FeatureKey.AI_MEMORY,
      FeatureKey.VOICE_COACH,
      FeatureKey.CUSTOM_THEMES,
      FeatureKey.CLOUD_BACKUP,
      FeatureKey.MULTI_DEVICE_SYNC,
      FeatureKey.AI_PERSONALITIES,
      FeatureKey.MARKETPLACE,
    ],
  },
  [UserPlan.ELITE]: {
    id: 'plan_elite',
    plan: UserPlan.ELITE,
    name: 'CRUX Elite',
    tagline: 'Full AI Suite including Vision AI, Advanced Analytics & Premium Reports.',
    priceMonthly: 1999, // $19.99/mo
    priceYearly: 15999, // $159.99/yr
    currency: 'USD',
    features: [
      FeatureKey.UNLIMITED_MISSIONS,
      FeatureKey.BATTLE_PASS,
      FeatureKey.UNLIMITED_AI,
      FeatureKey.AI_MEMORY,
      FeatureKey.VOICE_COACH,
      FeatureKey.VISION_AI,
      FeatureKey.ADVANCED_ANALYTICS,
      FeatureKey.CUSTOM_THEMES,
      FeatureKey.CLOUD_BACKUP,
      FeatureKey.MULTI_DEVICE_SYNC,
      FeatureKey.MARKETPLACE,
      FeatureKey.AI_PERSONALITIES,
      FeatureKey.STUDY_SCANNER,
      FeatureKey.WORKOUT_VISION,
      FeatureKey.PREMIUM_REPORTS,
    ],
  },
  [UserPlan.LIFETIME]: {
    id: 'plan_lifetime',
    plan: UserPlan.LIFETIME,
    name: 'CRUX Lifetime',
    tagline: 'Pay once, own all Elite features forever. Zero recurring fees.',
    priceMonthly: 0,
    priceYearly: 0,
    priceLifetime: 29900, // $299.00
    currency: 'USD',
    badgeText: 'BEST VALUE',
    features: [
      FeatureKey.UNLIMITED_MISSIONS,
      FeatureKey.BATTLE_PASS,
      FeatureKey.UNLIMITED_AI,
      FeatureKey.AI_MEMORY,
      FeatureKey.VOICE_COACH,
      FeatureKey.VISION_AI,
      FeatureKey.ADVANCED_ANALYTICS,
      FeatureKey.CUSTOM_THEMES,
      FeatureKey.CLOUD_BACKUP,
      FeatureKey.MULTI_DEVICE_SYNC,
      FeatureKey.MARKETPLACE,
      FeatureKey.AI_PERSONALITIES,
      FeatureKey.STUDY_SCANNER,
      FeatureKey.WORKOUT_VISION,
      FeatureKey.PREMIUM_REPORTS,
    ],
  },
  [UserPlan.FOUNDER]: {
    id: 'plan_founder',
    plan: UserPlan.FOUNDER,
    name: 'Founder Pack',
    tagline: 'Exclusive VIP status, lifetime updates, custom badge & golden profile border.',
    priceMonthly: 0,
    priceYearly: 0,
    priceLifetime: 49900, // $499.00
    currency: 'USD',
    badgeText: 'LIMITED EDITION',
    features: Object.values(FeatureKey),
  },
};

export const FOUNDER_PACK_DETAILS: FounderPack = {
  id: 'founder_pack_v1',
  title: 'CRUX Founder Edition',
  description: 'Immortalize your legacy as an early supporter of the CRUX Life OS.',
  badge: '👑 FOUNDER',
  theme: 'AURA_GOLD_CELESTIAL',
  customTitle: 'Arch-System Founder',
  borderStyle: 'border-amber-400/80 shadow-[0_0_20px_rgba(250,204,21,0.5)]',
  discountPercent: 50,
  priceUsd: 499,
  isUnlocked: false,
  perks: [
    'Lifetime access to all CRUX Elite AI tools & future updates',
    'Exclusive Founder Badge & Glowing Golden Profile Frame',
    'Dedicated Discord VIP channel access',
    'Custom AI Personality customization',
    'Direct feedback line to lead architecture team',
  ],
};

export class PricingService {
  public static getTiers(): PricingTier[] {
    return Object.values(PRICING_TIERS);
  }

  public static getTier(plan: UserPlan): PricingTier {
    return PRICING_TIERS[plan] || PRICING_TIERS[UserPlan.FREE];
  }

  public static getFounderPack(): FounderPack {
    return FOUNDER_PACK_DETAILS;
  }

  public static formatPrice(amountInCents: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: amountInCents % 100 === 0 ? 0 : 2,
    }).format(amountInCents / 100);
  }
}

export const pricingService = new PricingService();
