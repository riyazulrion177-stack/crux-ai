export type RankType = 
  | "Unranked"
  | "Bronze III"
  | "Bronze II"
  | "Bronze I"
  | "Silver III"
  | "Silver II"
  | "Silver I"
  | "Gold III"
  | "Gold II"
  | "Gold I"
  | "Platinum III"
  | "Platinum II"
  | "Platinum I"
  | "Diamond III"
  | "Diamond II"
  | "Diamond I"
  | "Master"
  | "Grandmaster"
  | "Heroic"
  | "Legend"
  | "Mythic"
  | "Immortal";

export type HunterClass = 
  | "Shadow Monk"
  | "Titan Athlete"
  | "Cyber Scholar"
  | "Iron Executive"
  | "Creative Weaver";

export interface Attributes {
  Strength: number;
  Health: number;
  Knowledge: number;
  Focus: number;
  Leadership: number;
  Mindset: number;
  Finance: number;
  Communication: number;
  Spiritual: number;
  Creativity: number;
  Confidence: number;
}

export type LootType = 'title' | 'badge' | 'frame' | 'theme' | 'aura' | 'border' | 'coins' | 'diamonds' | 'xp_boost' | 'lootbox';

export interface LootItem {
  id: string;
  name: string;
  type: LootType;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  value: string | number;
  icon: string;
  description?: string;
  isEquipped?: boolean;
}

export interface UserProfile {
  id: string;
  hunterName: string;
  classTitle: HunterClass;
  level: number;       // Level (XP based)
  xp: number;          // Current level XP
  maxXp: number;       // 100 for level 1
  totalXp: number;     // Lifetime accumulated XP
  rp: number;          // Rank Points (Hunter Rank System)
  rank: RankType;      // Current Hunter Rank
  highestRank: RankType; // Highest Hunter Rank Ever Achieved
  bossesDefeatedCount: number;
  perfectDaysCount: number;
  daysActiveCount: number;
  missedMissionsCount: number;
  coins: number;       // Starts at 0
  diamonds: number;    // Starts at 0
  energy: number;      // Max 100
  maxEnergy: number;   // 100
  streak: number;      // Starts at 0
  lastActiveDate: string; // ISO String YYYY-MM-DD
  lastResetDate?: string; // ISO String YYYY-MM-DD
  disciplineScore: number; // 0 - 100 %
  attributes: Attributes;
  unlockedTitles: string[];
  activeTitle: string;
  unlockedBadges: string[];
  avatarFrame: string;
  activeTheme?: string;
  activeAura?: string;
  activeBorder?: string;
  inventory?: LootItem[];
  lootBoxesCount?: number;
  createdAt: string;
}

export type QuestCategory = 
  | 'daily' | 'weekly' | 'monthly' | 'epic' | 'boss' | 'seasonal'
  | 'Fitness' | 'Study' | 'Work' | 'Business' | 'Coding' | 'Reading' 
  | 'Religion' | 'Meditation' | 'Health' | 'Finance' | 'Relationship' | 'Custom';

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
export type QuestPriority = 'low' | 'medium' | 'high' | 'critical';
export type RepeatRule = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'none';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export interface Routine {
  id: string;
  title: string;
  days: ('daily' | 'weekdays' | 'weekends' | Weekday)[];
  enabled: boolean;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
  statReward: keyof Attributes;
  statAmount: number;
  xpReward: number;
  coinReward: number;
  diamondReward: number;
  createdAt: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: QuestCategory;
  xpReward: number;
  coinReward: number;
  diamondReward: number;
  statReward: keyof Attributes;
  statAmount: number;
  isCompleted: boolean;
  completedAt?: string;
  isCustom?: boolean;
  iconName: string;
  difficulty?: QuestDifficulty;
  estimatedMinutes?: number;
  priority?: QuestPriority;
  deadline?: string;
  repeatRule?: RepeatRule;
  reminderTime?: string;
  notes?: string;
  isArchived?: boolean;
  // Anti-cheat completion tracking for perfect undo rollback
  lastAppliedXp?: number;
  lastAppliedCoins?: number;
  lastAppliedDiamonds?: number;
  lastAppliedBossDamage?: number;
  lastAppliedStatReward?: keyof Attributes;
  lastAppliedStatAmount?: number;
  lastAppliedRp?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string; // ISO format
  questId?: string;
  questTitle: string;
  xpEarned: number;
  rpEarned?: number;
  coinsEarned: number;
  statGained?: keyof Attributes;
  statAmount?: number;
  type: 'quest' | 'boss_damage' | 'penalty' | 'loot_opened' | 'login_reward';
}

export interface BossState {
  id: string;
  name: string;
  title: string;
  description: string;
  currentHp: number;
  maxHp: number;
  minLevel: number;
  level: number;
  rewardCoins: number;
  rewardDiamonds: number;
  rewardXp: number;
  defeated: boolean;
  weaknessStat: keyof Attributes;
  avatarUrl: string;
  timeRemainingSeconds?: number;
  rage: number; // 0 - 100%
  bossAttackPower: number;
  defense: number;
  lastCounterAttack?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'level' | 'streak' | 'boss' | 'habits' | 'economy';
  targetValue: number;
  currentValue: number;
  isUnlocked: boolean;
  unlockedAt?: string;
  rewardCoins: number;
  rewardDiamonds: number;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  hunterName: string;
  classTitle: HunterClass;
  level: number;
  xp: number;
  rankTier: RankType;
  streak: number;
  isCurrentUser?: boolean;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'server_default';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  isConfigured: boolean;
}

export interface AIMessage {
  id: string;
  sender: 'mentor' | 'user';
  text: string;
  timestamp: string;
  followUps?: string[];
  isStreaming?: boolean;
}

