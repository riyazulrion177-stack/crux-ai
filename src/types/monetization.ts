// ==========================================
// CRUX Life OS - Monetization Architecture
// Types & Enums
// ==========================================

export enum UserPlan {
  FREE = 'FREE',
  PRO = 'PRO',
  ELITE = 'ELITE',
  LIFETIME = 'LIFETIME',
  FOUNDER = 'FOUNDER',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  TRIALING = 'TRIALING',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum FeatureKey {
  UNLIMITED_AI = 'UNLIMITED_AI',
  AI_MEMORY = 'AI_MEMORY',
  VOICE_COACH = 'VOICE_COACH',
  VISION_AI = 'VISION_AI',
  ADVANCED_ANALYTICS = 'ADVANCED_ANALYTICS',
  CUSTOM_THEMES = 'CUSTOM_THEMES',
  CLOUD_BACKUP = 'CLOUD_BACKUP',
  MULTI_DEVICE_SYNC = 'MULTI_DEVICE_SYNC',
  UNLIMITED_MISSIONS = 'UNLIMITED_MISSIONS',
  BATTLE_PASS = 'BATTLE_PASS',
  MARKETPLACE = 'MARKETPLACE',
  AI_PERSONALITIES = 'AI_PERSONALITIES',
  STUDY_SCANNER = 'STUDY_SCANNER',
  WORKOUT_VISION = 'WORKOUT_VISION',
  PREMIUM_REPORTS = 'PREMIUM_REPORTS',
}

export enum InventoryCategory {
  THEME = 'THEME',
  BADGE = 'BADGE',
  FRAME = 'FRAME',
  AURA = 'AURA',
  TITLE = 'TITLE',
  WEAPON_SKIN = 'WEAPON_SKIN',
  PET = 'PET',
  ANIMATION = 'ANIMATION',
  CONSUMABLE = 'CONSUMABLE',
}

export enum RewardType {
  COINS = 'COINS',
  XP = 'XP',
  ENERGY = 'ENERGY',
  RETRY_BOSS = 'RETRY_BOSS',
  TREASURE_CHEST = 'TREASURE_CHEST',
  AI_MESSAGES = 'AI_MESSAGES',
  PREMIUM_TRIAL_TICKET = 'PREMIUM_TRIAL_TICKET',
}

export enum MarketplaceCategory {
  TEMPLATES = 'TEMPLATES',
  STUDY_PLANS = 'STUDY_PLANS',
  WORKOUT_PACKS = 'WORKOUT_PACKS',
  HABIT_PACKS = 'HABIT_PACKS',
  FOCUS_PACKS = 'FOCUS_PACKS',
}

export enum PaymentProvider {
  STRIPE = 'STRIPE',
  PADDLE = 'PADDLE',
  GOOGLE_PLAY = 'GOOGLE_PLAY',
  APPLE_IAP = 'APPLE_IAP',
  MANUAL = 'MANUAL',
}

export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface UserSubscription {
  id: string;
  userId: string;
  plan: UserPlan;
  status: SubscriptionStatus;
  startDate: string; // ISO String
  endDate?: string; // ISO String
  renewalDate?: string; // ISO String
  trialEndDate?: string; // ISO String
  isLifetime: boolean;
  isFounder: boolean;
  isCancelled: boolean;
  cancelAtPeriodEnd: boolean;
  provider: PaymentProvider;
  providerSubscriptionId?: string;
}

export interface PricingTier {
  id: string;
  plan: UserPlan;
  name: string;
  tagline: string;
  priceMonthly: number; // in USD cents
  priceYearly: number; // in USD cents
  priceLifetime?: number; // in USD cents
  currency: string;
  features: FeatureKey[];
  badgeText?: string;
  isPopular?: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: InventoryCategory;
  rarity: ItemRarity;
  icon: string; // lucide icon name or emoji
  previewStyle?: Record<string, string>;
  isEquipped: boolean;
  isConsumable: boolean;
  quantity?: number;
  priceCoins: number;
  unlockedAt?: string;
}

export interface RewardItem {
  type: RewardType;
  amount: number;
  itemId?: string;
  description: string;
  icon?: string;
}

export interface BattlePassTier {
  tier: number;
  xpRequired: number;
  freeReward?: RewardItem;
  premiumReward?: RewardItem;
  isClaimedFree?: boolean;
  isClaimedPremium?: boolean;
}

export interface BattlePassSeason {
  id: string;
  seasonNumber: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  maxTier: number;
  currentTier: number;
  currentXp: number;
  hasPremiumPass: boolean;
  tiers: BattlePassTier[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: MarketplaceCategory;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  salesCount: number;
  priceCoins: number;
  priceUsd?: number;
  tags: string[];
  previewDetails: string[];
  contentData?: Record<string, unknown>;
  isPurchased?: boolean;
}

export interface FounderPack {
  id: string;
  title: string;
  description: string;
  badge: string;
  theme: string;
  customTitle: string;
  borderStyle: string;
  discountPercent: number;
  priceUsd: number;
  isUnlocked: boolean;
  perks: string[];
}

export interface CoinTransaction {
  id: string;
  userId: string;
  amount: number; // positive = gained, negative = spent
  type: 'EARNED' | 'PURCHASED' | 'SPENT' | 'REWARDED';
  source: string;
  description: string;
  timestamp: string;
}

export type AdRewardResult = 'NOT_IMPLEMENTED' | 'SUCCESS' | 'CANCELLED' | 'FAILED';

export interface RewardedAdResponse {
  status: AdRewardResult;
  message: string;
  reward?: RewardItem;
}
