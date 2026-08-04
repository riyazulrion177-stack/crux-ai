import { UserProfile, Quest, QuestDifficulty, QuestPriority, ActivityLog, BossState, Achievement, RankType, HunterClass, SupabaseConfig, LootItem, AIConfig, Routine, Weekday } from '../types';
import { BOSS_CATALOG, INITIAL_BOSS, INITIAL_ACHIEVEMENTS } from './questCatalog';
import { analyzeMissionName } from './aiMissionAnalyzer';
import { ALL_RANKS, getRankRequirement, evaluateHighestEligibleRank, calculateRpForMission } from './rankService';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { goalService } from '../backend/services/GoalService';
import { logger } from '../backend/core/logger';
import { normalizeError } from '../backend/core/error';

const STORAGE_KEY_USER = 'crux_user_profile_v1';
const STORAGE_KEY_QUESTS = 'crux_quests_v1';
const STORAGE_KEY_LOGS = 'crux_activity_logs_v1';
const STORAGE_KEY_BOSS = 'crux_boss_state_v1';
const STORAGE_KEY_ACHIEVEMENTS = 'crux_achievements_v1';
const STORAGE_KEY_SUPABASE = 'crux_supabase_config_v1';
const STORAGE_KEY_AI_CONFIG = 'crux_ai_config_v1';
const STORAGE_KEY_ROUTINES = 'crux_routines_v1';

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: 'rot_mon_push',
    title: 'Monday Push Workout',
    days: ['mon'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'hard',
    estimatedMinutes: 45,
    statReward: 'Strength',
    statAmount: 2,
    xpReward: 16,
    coinReward: 8,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_tue_pull',
    title: 'Tuesday Pull Workout',
    days: ['tue'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'hard',
    estimatedMinutes: 45,
    statReward: 'Strength',
    statAmount: 2,
    xpReward: 16,
    coinReward: 8,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_wed_legs',
    title: 'Wednesday Legs & Core',
    days: ['wed'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'hard',
    estimatedMinutes: 45,
    statReward: 'Strength',
    statAmount: 2,
    xpReward: 16,
    coinReward: 8,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_thu_cardio',
    title: 'Thursday Cardio & Agility',
    days: ['thu'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'medium',
    estimatedMinutes: 30,
    statReward: 'Health',
    statAmount: 2,
    xpReward: 12,
    coinReward: 6,
    diamondReward: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_fri_upper',
    title: 'Friday Upper Body Hypertrophy',
    days: ['fri'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'hard',
    estimatedMinutes: 45,
    statReward: 'Strength',
    statAmount: 2,
    xpReward: 16,
    coinReward: 8,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_sat_run',
    title: 'Saturday Endurance Run',
    days: ['sat'],
    enabled: true,
    category: 'Fitness',
    difficulty: 'hard',
    estimatedMinutes: 40,
    statReward: 'Health',
    statAmount: 2,
    xpReward: 15,
    coinReward: 7,
    diamondReward: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_sun_recovery',
    title: 'Sunday Active Recovery & Mobility',
    days: ['sun'],
    enabled: true,
    category: 'Health',
    difficulty: 'easy',
    estimatedMinutes: 20,
    statReward: 'Health',
    statAmount: 1,
    xpReward: 8,
    coinReward: 4,
    diamondReward: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_daily_quran',
    title: 'Daily Quran Study & Reflection',
    days: ['daily'],
    enabled: true,
    category: 'Religion',
    difficulty: 'medium',
    estimatedMinutes: 20,
    statReward: 'Spiritual',
    statAmount: 2,
    xpReward: 12,
    coinReward: 6,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_daily_reading',
    title: 'Daily Reading (20 Pages)',
    days: ['daily'],
    enabled: true,
    category: 'Study',
    difficulty: 'medium',
    estimatedMinutes: 30,
    statReward: 'Knowledge',
    statAmount: 2,
    xpReward: 12,
    coinReward: 6,
    diamondReward: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'rot_daily_coding',
    title: 'Daily Coding Practice & LeetCode',
    days: ['daily'],
    enabled: true,
    category: 'Work',
    difficulty: 'hard',
    estimatedMinutes: 45,
    statReward: 'Focus',
    statAmount: 2,
    xpReward: 18,
    coinReward: 9,
    diamondReward: 1,
    createdAt: new Date().toISOString()
  }
];

export function getMaxXpForLevel(level: number): number {
  if (level <= 1) return 120;
  if (level === 2) return 200;
  if (level === 3) return 320;
  if (level === 4) return 480;
  if (level === 5) return 700;
  if (level === 6) return 1000;
  if (level === 7) return 1400;
  if (level === 8) return 1900;
  if (level === 9) return 2500;
  if (level === 10) return 3200;

  const milestones = [
    { level: 1, xp: 120 },
    { level: 2, xp: 200 },
    { level: 3, xp: 320 },
    { level: 4, xp: 480 },
    { level: 5, xp: 700 },
    { level: 6, xp: 1000 },
    { level: 7, xp: 1400 },
    { level: 8, xp: 1900 },
    { level: 9, xp: 2500 },
    { level: 10, xp: 3200 },
    { level: 15, xp: 8000 },
    { level: 20, xp: 20000 },
    { level: 35, xp: 75000 },
    { level: 50, xp: 200000 },
    { level: 75, xp: 600000 },
    { level: 100, xp: 1500000 }
  ];

  for (let i = 0; i < milestones.length - 1; i++) {
    const m1 = milestones[i];
    const m2 = milestones[i + 1];
    if (level >= m1.level && level <= m2.level) {
      const progress = (level - m1.level) / (m2.level - m1.level);
      return Math.round(m1.xp + (m2.xp - m1.xp) * Math.pow(progress, 1.5));
    }
  }

  return Math.round(1500000 * Math.pow(level / 100, 2.2));
}

export function calculateAutoRewards(options: {
  difficulty?: QuestDifficulty;
  estimatedMinutes?: number;
  priority?: QuestPriority;
  userLevel?: number;
}): { xpReward: number; coinReward: number; diamondReward: number } {
  const diff = options.difficulty || 'medium';
  const mins = Math.max(5, options.estimatedMinutes || 30);
  const prio = options.priority || 'medium';

  let diffFactor = 1.0;
  if (diff === 'easy') diffFactor = 1.0;
  else if (diff === 'medium') diffFactor = 1.8;
  else if (diff === 'hard') diffFactor = 3.0;
  else if (diff === 'extreme') diffFactor = 4.5;
  else if (diff === 'legendary') diffFactor = 6.5;

  const timeFactor = Math.pow(mins / 15, 0.55);

  let prioFactor = 1.0;
  if (prio === 'low') prioFactor = 0.85;
  else if (prio === 'medium') prioFactor = 1.0;
  else if (prio === 'high') prioFactor = 1.25;
  else if (prio === 'critical') prioFactor = 1.5;

  const rawXp = Math.round(3.0 * diffFactor * timeFactor * prioFactor);
  const xpReward = Math.max(2, Math.min(100, rawXp));

  const rawGold = Math.round(xpReward * 0.55);
  const coinReward = Math.max(1, Math.min(50, rawGold));

  let diamondReward = 0;
  if ((diff === 'extreme' || diff === 'legendary') && mins >= 45) diamondReward = 1;
  if (diff === 'legendary' && mins >= 90) diamondReward = 2;

  return { xpReward, coinReward, diamondReward };
}

export function calculateRank(level: number, disciplineScore: number): RankType {
  const req = ALL_RANKS.find(r => level >= r.minLevel && disciplineScore >= r.minDisciplineScore) || ALL_RANKS[0];
  return req.rank;
}

export function generateRandomLoot(): LootItem {
  const rand = Math.random() * 100;
  let rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic' = 'common';
  if (rand < 2) rarity = 'mythic';
  else if (rand < 8) rarity = 'legendary';
  else if (rand < 22) rarity = 'epic';
  else if (rand < 55) rarity = 'rare';

  const lootPool: Partial<LootItem>[] = [
    { name: 'Shadow Monarch Frame', type: 'frame', value: 'frame_shadow', icon: 'Crown', description: 'Animated dark violet aura border frame.' },
    { name: 'Cyber Neon Frame', type: 'frame', value: 'frame_neon', icon: 'Zap', description: 'Electric cyan glowing cyberpunk border frame.' },
    { name: 'Obsidian Spikes Frame', type: 'frame', value: 'frame_obsidian', icon: 'Shield', description: 'Spiked obsidian dark fantasy border.' },
    { name: 'Gold Sovereign Theme', type: 'theme', value: 'theme_gold', icon: 'Coins', description: 'High-contrast gold UI accents.' },
    { name: 'Abyssal Void Theme', type: 'theme', value: 'theme_void', icon: 'Moon', description: 'Deep dark fantasy abyss theme.' },
    { name: 'The Unbroken', type: 'title', value: 'The Unbroken', icon: 'Trophy', description: 'Exclusive Hunter title earned through hardship.' },
    { name: 'Apex Predator', type: 'title', value: 'Apex Predator', icon: 'Swords', description: 'Legendary title for relentless execution.' },
    { name: 'Shadow Sovereign', type: 'title', value: 'Shadow Sovereign', icon: 'Crown', description: 'Mythic title awarded to supreme levelers.' },
    { name: 'Aura of Crimson Void', type: 'aura', value: 'aura_crimson', icon: 'Flame', description: 'Fiery crimson aura surrounding profile.' },
    { name: 'Aura of Cosmic Runes', type: 'aura', value: 'aura_cosmic', icon: 'Sparkles', description: 'Floating violet cosmic runes effect.' }
  ];

  const template = lootPool[Math.floor(Math.random() * lootPool.length)];
  return {
    id: 'loot_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    name: template.name!,
    type: template.type!,
    rarity,
    value: template.value!,
    icon: template.icon!,
    description: template.description || 'Rare collectible item from CRUX Life RPG.'
  };
}

class StorageService {
  private supabaseClient: SupabaseClient | null = supabase;
  private cache: Map<string, any> = new Map();

  private getItem(key: string): string | null {
    console.log(`[LOCAL_STORAGE_READ] ${key}`);
    return localStorage.getItem(key);
  }

  private setItem(key: string, value: string): void {
    console.log(`[LOCAL_STORAGE_WRITE] ${key}`);
    localStorage.setItem(key, value);
  }

  private removeItem(key: string): void {
    console.log(`[LOCAL_STORAGE_WRITE] remove ${key}`);
    localStorage.removeItem(key);
  }

  public getSupabaseConfig(): SupabaseConfig {
    const cacheKey = STORAGE_KEY_SUPABASE;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    const raw = this.getItem(STORAGE_KEY_SUPABASE);
    let config: SupabaseConfig = {
      url: (import.meta as any).env?.VITE_SUPABASE_URL || '',
      anonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '',
      isConnected: !!this.supabaseClient
    };
    if (raw) {
      try {
        config = JSON.parse(raw);
      } catch (e) {}
    }
    this.cache.set(cacheKey, config);
    return config;
  }

  public saveSupabaseConfig(url: string, anonKey: string): boolean {
    try {
      const config = url && anonKey
        ? { url, anonKey, isConnected: true }
        : { url: '', anonKey: '', isConnected: false };
      this.cache.set(STORAGE_KEY_SUPABASE, config);
      setTimeout(() => this.setItem(STORAGE_KEY_SUPABASE, JSON.stringify(config)), 0);
      return !!(url && anonKey);
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private getUserKey(baseKey: string, userId?: string): string {
    if (!userId) {
      throw new Error('User ID is strictly required for storage operations.');
    }
    return `${baseKey}_${userId}`;
  }

  // Check if character exists
  public getUserProfile(userId?: string): UserProfile | null {
    if (!userId) return null;
    const key = this.getUserKey(STORAGE_KEY_USER, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) return null;
    try {
      const parsed: UserProfile = JSON.parse(raw);
      // Auto-migrate RP and multi-factor fields
      parsed.rp = parsed.rp ?? 0;
      parsed.totalXp = parsed.totalXp ?? (parsed.xp || 0);
      parsed.bossesDefeatedCount = parsed.bossesDefeatedCount ?? 0;
      parsed.perfectDaysCount = parsed.perfectDaysCount ?? 0;
      parsed.daysActiveCount = parsed.daysActiveCount ?? 1;
      parsed.missedMissionsCount = parsed.missedMissionsCount ?? 0;

      const eligible = evaluateHighestEligibleRank(parsed);
      parsed.rank = eligible.rank;
      parsed.highestRank = parsed.highestRank ?? parsed.rank;

      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      return null;
    }
  }

  // Create brand new character strictly at Level 1, 0 XP, 25 Coins, 5 Diamonds
  public createCharacter(hunterName: string, classTitle: HunterClass, userId?: string): UserProfile {
    const newProfile: UserProfile = {
      id: userId || ('hunter_' + Date.now()),
      hunterName,
      classTitle,
      level: 1,
      xp: 0,
      maxXp: 120,
      totalXp: 0,
      rp: 0,
      rank: 'Unranked',
      highestRank: 'Unranked',
      bossesDefeatedCount: 0,
      perfectDaysCount: 0,
      daysActiveCount: 1,
      missedMissionsCount: 0,
      coins: 25,
      diamonds: 5,
      energy: 100,
      maxEnergy: 100,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      disciplineScore: 0,
      attributes: {
        Strength: 0,
        Health: 0,
        Knowledge: 0,
        Focus: 0,
        Leadership: 0,
        Mindset: 0,
        Finance: 0,
        Communication: 0,
        Spiritual: 0,
        Creativity: 0,
        Confidence: 0
      },
      unlockedTitles: ['The Awakened Hunter'],
      activeTitle: 'The Awakened Hunter',
      unlockedBadges: [],
      avatarFrame: 'default_cyan',
      inventory: [],
      lootBoxesCount: 1,
      createdAt: new Date().toISOString()
    };

    const userKey = this.getUserKey(STORAGE_KEY_USER, userId);
    const questsKey = this.getUserKey(STORAGE_KEY_QUESTS, userId);
    const logsKey = this.getUserKey(STORAGE_KEY_LOGS, userId);
    const bossKey = this.getUserKey(STORAGE_KEY_BOSS, userId);
    const achievementsKey = this.getUserKey(STORAGE_KEY_ACHIEVEMENTS, userId);

    const emptyGoals: Quest[] = [];

    this.cache.set(userKey, newProfile);
    this.cache.set(questsKey, emptyGoals);
    this.cache.set(logsKey, []);
    this.cache.set(bossKey, INITIAL_BOSS);
    this.cache.set(achievementsKey, INITIAL_ACHIEVEMENTS);

    setTimeout(() => {
      this.setItem(userKey, JSON.stringify(newProfile));
      this.setItem(questsKey, JSON.stringify(emptyGoals));
      this.setItem(logsKey, JSON.stringify([]));
      this.setItem(bossKey, JSON.stringify(INITIAL_BOSS));
      this.setItem(achievementsKey, JSON.stringify(INITIAL_ACHIEVEMENTS));
    }, 0);

    return newProfile;
  }

  public saveUserProfile(profile: UserProfile, userId?: string) {
    profile.maxXp = getMaxXpForLevel(profile.level);
    profile.totalXp = profile.totalXp ?? profile.xp;
    profile.rp = profile.rp ?? 0;
    const eligible = evaluateHighestEligibleRank(profile);
    profile.rank = eligible.rank;
    if (!profile.highestRank) profile.highestRank = profile.rank;

    const key = this.getUserKey(STORAGE_KEY_USER, userId || profile.id);
    this.cache.set(key, profile);
    setTimeout(() => this.setItem(key, JSON.stringify(profile)), 0);
  }

  public getQuests(userId?: string): Quest[] {
    if (!userId) return [];
    const key = this.getUserKey(STORAGE_KEY_QUESTS, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) {
      this.cache.set(key, []);
      setTimeout(() => this.setItem(key, JSON.stringify([])), 0);
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      this.cache.set(key, []);
      return [];
    }
  }

  public async loadQuestsFromSupabase(userId?: string): Promise<Quest[]> {
    if (!userId) {
      return this.getQuests(userId);
    }

    try {
      const goals = await goalService.loadGoals(userId);
      const key = this.getUserKey(STORAGE_KEY_QUESTS, userId);
      this.cache.set(key, goals);
      this.setItem(key, JSON.stringify(goals));
      return goals;
    } catch (error) {
      const normalized = normalizeError(error, 'Goal sync load skipped.');
      logger.warn('Supabase goal loading failed; falling back to local cache.', {
        userId,
        error: normalized.message,
      });
      return this.getQuests(userId);
    }
  }

  public saveQuests(quests: Quest[], userId?: string) {
    if (!userId) return;
    const key = this.getUserKey(STORAGE_KEY_QUESTS, userId);
    this.cache.set(key, quests);
    setTimeout(() => this.setItem(key, JSON.stringify(quests)), 0);
    void goalService.syncGoals(userId, quests);
  }

  public getActivityLogs(userId?: string): ActivityLog[] {
    if (!userId) return [];
    const key = this.getUserKey(STORAGE_KEY_LOGS, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      return [];
    }
  }

  public saveActivityLogs(logs: ActivityLog[], userId?: string) {
    if (!userId) return;
    const key = this.getUserKey(STORAGE_KEY_LOGS, userId);
    this.cache.set(key, logs);
    setTimeout(() => this.setItem(key, JSON.stringify(logs)), 0);
  }

  public getBossState(userId?: string): BossState {
    if (!userId) return INITIAL_BOSS;
    const key = this.getUserKey(STORAGE_KEY_BOSS, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) {
      this.cache.set(key, INITIAL_BOSS);
      setTimeout(() => this.setItem(key, JSON.stringify(INITIAL_BOSS)), 0);
      return INITIAL_BOSS;
    }
    try {
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      this.cache.set(key, INITIAL_BOSS);
      return INITIAL_BOSS;
    }
  }

  public saveBossState(boss: BossState, userId?: string) {
    if (!userId) return;
    const key = this.getUserKey(STORAGE_KEY_BOSS, userId);
    this.cache.set(key, boss);
    setTimeout(() => this.setItem(key, JSON.stringify(boss)), 0);
  }

  public getAchievements(userId?: string): Achievement[] {
    if (!userId) return INITIAL_ACHIEVEMENTS;
    const key = this.getUserKey(STORAGE_KEY_ACHIEVEMENTS, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) {
      this.cache.set(key, INITIAL_ACHIEVEMENTS);
      setTimeout(() => this.setItem(key, JSON.stringify(INITIAL_ACHIEVEMENTS)), 0);
      return INITIAL_ACHIEVEMENTS;
    }
    try {
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      this.cache.set(key, INITIAL_ACHIEVEMENTS);
      return INITIAL_ACHIEVEMENTS;
    }
  }

  public saveAchievements(achievements: Achievement[], userId?: string) {
    if (!userId) return;
    const key = this.getUserKey(STORAGE_KEY_ACHIEVEMENTS, userId);
    this.cache.set(key, achievements);
    setTimeout(() => this.setItem(key, JSON.stringify(achievements)), 0);
  }

  // Open Loot Box
  public openLootBox(userId?: string): { item: LootItem; profile: UserProfile } {
    const profile = this.getUserProfile(userId);
    if (!profile) throw new Error("No hunter profile found.");
    if ((profile.lootBoxesCount || 0) <= 0) throw new Error("No loot boxes remaining.");

    const item = generateRandomLoot();
    profile.lootBoxesCount = (profile.lootBoxesCount || 1) - 1;
    if (!profile.inventory) profile.inventory = [];
    profile.inventory.unshift(item);

    // Auto unlock title if relevant
    if (item.type === 'title' && !profile.unlockedTitles.includes(item.value as string)) {
      profile.unlockedTitles.push(item.value as string);
    }

    const logs = this.getActivityLogs(userId);
    logs.unshift({
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      questTitle: `Opened Loot Box: Received ${item.name} (${item.rarity.toUpperCase()})`,
      xpEarned: 0,
      coinsEarned: 0,
      type: 'loot_opened'
    });

    this.saveUserProfile(profile, userId);
    this.saveActivityLogs(logs, userId);

    return { item, profile };
  }

  // Select/Challenge a boss from catalog
  public selectBoss(bossId: string, userId?: string): BossState {
    const catalogBoss = BOSS_CATALOG.find(b => b.id === bossId);
    if (!catalogBoss) throw new Error("Boss not found.");
    this.saveBossState(catalogBoss, userId);
    return catalogBoss;
  }

  // Execute Quest Logic
  public completeQuest(questId: string, userId?: string): {
    profile: UserProfile;
    leveledUp: boolean;
    bossHitDamage: number;
    prevRank: RankType;
    newRank: RankType;
    bossDefeatedNow: boolean;
    bossCounterAttackDamage: number;
  } {
    const profile = this.getUserProfile(userId);
    const quests = this.getQuests(userId);
    const logs = this.getActivityLogs(userId);
    const boss = this.getBossState(userId);
    const achievements = this.getAchievements(userId);

    if (!profile) throw new Error("No hunter profile registered.");

    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex === -1) throw new Error("Quest not found.");

    const quest = quests[questIndex];
    if (quest.isCompleted) {
      return {
        profile,
        leveledUp: false,
        bossHitDamage: 0,
        prevRank: profile.rank,
        newRank: profile.rank,
        bossDefeatedNow: false,
        bossCounterAttackDamage: 0
      };
    }

    const prevRank = profile.rank;

    // Mark completed
    quest.isCompleted = true;
    quest.completedAt = new Date().toISOString();

    // Calculate XP & Exponential Level Up
    let newXp = profile.xp + quest.xpReward;
    let newLevel = profile.level;
    let leveledUp = false;
    let currentMaxXp = getMaxXpForLevel(newLevel);

    while (newXp >= currentMaxXp) {
      newXp -= currentMaxXp;
      newLevel += 1;
      leveledUp = true;
      currentMaxXp = getMaxXpForLevel(newLevel);
      // Award Loot Box on level up!
      profile.lootBoxesCount = (profile.lootBoxesCount || 0) + 1;
    }

    // Stat gain
    if (quest.statReward && quest.statAmount) {
      profile.attributes[quest.statReward] = (profile.attributes[quest.statReward] || 0) + quest.statAmount;
    }

    profile.xp = newXp;
    profile.level = newLevel;
    profile.maxXp = currentMaxXp;
    profile.totalXp = (profile.totalXp || 0) + quest.xpReward;
    profile.coins += quest.coinReward;
    profile.diamonds += quest.diamondReward;

    // RP Calculation
    const rpEarned = calculateRpForMission(quest.difficulty || 'medium', profile.rank);
    profile.rp = (profile.rp || 0) + rpEarned;
    quest.lastAppliedRp = rpEarned;

    // Daily streak check
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastActiveDate !== today) {
      profile.streak += 1;
      profile.lastActiveDate = today;
    }

    // Calculate Discipline Score (Percentage of completed daily quests)
    const dailyQuests = quests.filter(q => q.category === 'daily');
    const completedDailies = dailyQuests.filter(q => q.isCompleted).length;
    profile.disciplineScore = dailyQuests.length > 0 ? Math.round((completedDailies / dailyQuests.length) * 100) : 100;

    // Boss damage calculation based on player stats
    const strengthBonus = (profile.attributes?.Strength || 0) * 0.8;
    const focusBonus = (profile.attributes?.Focus || 0) * 0.8;
    const healthBonus = (profile.attributes?.Health || 0) * 0.5;
    const disciplineBonus = Math.round((profile.disciplineScore || 0) * 0.4);
    const streakBonus = Math.round((profile.streak || 0) * 1.5);
    const dailyBonus = (completedDailies || 0) * 3;

    let baseDamage = Math.max(8, Math.round(quest.xpReward * 1.5 + strengthBonus + focusBonus + healthBonus + disciplineBonus + streakBonus + dailyBonus));
    if (quest.statReward === boss.weaknessStat) {
      baseDamage = Math.round(baseDamage * 1.5); // Weakness bonus!
    }

    // Boss defense reduction based on Boss Rage!
    const defenseFactor = Math.max(0.2, 1 - (boss.defense || 0) / 400 - (boss.rage || 0) / 300);
    const bossDamage = Math.max(5, Math.round(baseDamage * defenseFactor));

    let bossDefeatedNow = false;
    let bossCounterAttackDamage = 0;

    if (!boss.defeated && profile.level >= (boss.minLevel || 1)) {
      boss.currentHp = Math.max(0, boss.currentHp - bossDamage);
      if (boss.currentHp === 0) {
        boss.defeated = true;
        bossDefeatedNow = true;
        profile.coins += boss.rewardCoins;
        profile.diamonds += boss.rewardDiamonds;
        profile.xp += boss.rewardXp;
        profile.totalXp = (profile.totalXp || 0) + boss.rewardXp;
        profile.bossesDefeatedCount = (profile.bossesDefeatedCount || 0) + 1;
        profile.lootBoxesCount = (profile.lootBoxesCount || 0) + 2; // 2 Loot Boxes for slaying Boss!
        // Bonus RP for slaying Boss
        const bossRp = calculateRpForMission('legendary', profile.rank) * 2;
        profile.rp = (profile.rp || 0) + bossRp;
      } else {
        // Boss counter attacks!
        bossCounterAttackDamage = Math.round((boss.bossAttackPower || 15) * (1 + (boss.rage || 0) / 100));
        profile.energy = Math.max(0, profile.energy - bossCounterAttackDamage);
        boss.lastCounterAttack = `${boss.name} counter-attacked! Dealt ${bossCounterAttackDamage} Energy damage to Hunter.`;
      }
    }

    // Save anti-cheat metadata for perfect undo rollback
    quest.lastAppliedXp = quest.xpReward;
    quest.lastAppliedCoins = quest.coinReward;
    quest.lastAppliedDiamonds = quest.diamondReward;
    quest.lastAppliedBossDamage = bossDamage;
    quest.lastAppliedStatReward = quest.statReward;
    quest.lastAppliedStatAmount = quest.statAmount;

    // Add activity log
    const newLog: ActivityLog = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      questId: quest.id,
      questTitle: quest.title,
      xpEarned: quest.xpReward,
      rpEarned: rpEarned,
      coinsEarned: quest.coinReward,
      statGained: quest.statReward,
      statAmount: quest.statAmount,
      type: 'quest'
    };
    logs.unshift(newLog);

    // Update Achievements
    const totalCompleted = logs.filter(l => l.type === 'quest').length;
    achievements.forEach(ach => {
      if (ach.id === 'ach_first_blood' && totalCompleted >= 1) ach.isUnlocked = true;
      if (ach.id === 'ach_level_5' && profile.level >= 5) ach.isUnlocked = true;
      if (ach.id === 'ach_streak_3' && profile.streak >= 3) ach.isUnlocked = true;
      if (ach.id === 'ach_boss_slayer' && boss.defeated) ach.isUnlocked = true;
    });

    const eligible = evaluateHighestEligibleRank(profile);
    const newRank = eligible.rank;
    profile.rank = newRank;

    const newRankIdx = ALL_RANKS.findIndex(r => r.rank === newRank);
    const highestRankIdx = ALL_RANKS.findIndex(r => r.rank === profile.highestRank);
    if (newRankIdx > highestRankIdx) {
      profile.highestRank = newRank;
    }

    this.saveUserProfile(profile, userId || profile.id);
    this.saveQuests(quests, userId);
    this.saveActivityLogs(logs, userId);
    this.saveBossState(boss, userId);
    this.saveAchievements(achievements, userId);

    return {
      profile,
      leveledUp,
      bossHitDamage: bossDamage,
      prevRank,
      newRank,
      bossDefeatedNow,
      bossCounterAttackDamage
    };
  }

  // Undo Quest Completion (Anti-Cheat Rollback)
  public undoQuestCompletion(questId: string, userId?: string): { profile: UserProfile } {
    const profile = this.getUserProfile(userId);
    const quests = this.getQuests(userId);
    const logs = this.getActivityLogs(userId);
    const boss = this.getBossState(userId);

    if (!profile) throw new Error("No hunter profile registered.");

    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex === -1) throw new Error("Quest not found.");

    const quest = quests[questIndex];
    if (!quest.isCompleted) return { profile };

    // Rollback XP
    const appliedXp = quest.lastAppliedXp ?? quest.xpReward;
    if (profile.xp >= appliedXp) {
      profile.xp -= appliedXp;
    } else {
      let remainingDeduct = appliedXp - profile.xp;
      profile.xp = 0;
      while (remainingDeduct > 0 && profile.level > 1) {
        profile.level -= 1;
        const prevMax = getMaxXpForLevel(profile.level);
        if (remainingDeduct <= prevMax) {
          profile.xp = prevMax - remainingDeduct;
          remainingDeduct = 0;
        } else {
          remainingDeduct -= prevMax;
        }
      }
      profile.maxXp = getMaxXpForLevel(profile.level);
    }

    // Rollback Coins & Diamonds
    const appliedCoins = quest.lastAppliedCoins ?? quest.coinReward;
    const appliedDiamonds = quest.lastAppliedDiamonds ?? quest.diamondReward;
    profile.coins = Math.max(0, profile.coins - appliedCoins);
    profile.diamonds = Math.max(0, profile.diamonds - appliedDiamonds);

    // Rollback Attributes
    const stat = quest.lastAppliedStatReward || quest.statReward;
    const statAmt = quest.lastAppliedStatAmount || quest.statAmount;
    if (stat && statAmt && profile.attributes[stat]) {
      profile.attributes[stat] = Math.max(0, profile.attributes[stat] - statAmt);
    }

    // Rollback Boss Damage & HP
    const bossDmg = quest.lastAppliedBossDamage || 0;
    if (boss && bossDmg > 0) {
      if (boss.defeated && boss.currentHp === 0) {
        boss.defeated = false; // Restore boss status
      }
      boss.currentHp = Math.min(boss.maxHp, boss.currentHp + bossDmg);
    }

    // Rollback Activity Log
    const logIndex = logs.findIndex(l => l.questId === quest.id && l.type === 'quest');
    if (logIndex !== -1) {
      logs.splice(logIndex, 1);
    }

    // Reset quest state
    quest.isCompleted = false;
    quest.completedAt = undefined;

    // Rollback RP & Total XP
    if (quest.lastAppliedRp) {
      profile.rp = Math.max(0, (profile.rp || 0) - quest.lastAppliedRp);
      quest.lastAppliedRp = undefined;
    }
    if (appliedXp) {
      profile.totalXp = Math.max(0, (profile.totalXp || 0) - appliedXp);
    }

    quest.lastAppliedXp = undefined;
    quest.lastAppliedCoins = undefined;
    quest.lastAppliedDiamonds = undefined;
    quest.lastAppliedBossDamage = undefined;

    // Recalculate discipline score & rank
    const dailyQuests = quests.filter(q => q.category === 'daily');
    const completedDailies = dailyQuests.filter(q => q.isCompleted).length;
    profile.disciplineScore = dailyQuests.length > 0 ? Math.round((completedDailies / dailyQuests.length) * 100) : 100;

    const eligible = evaluateHighestEligibleRank(profile);
    profile.rank = eligible.rank;

    this.saveUserProfile(profile, userId || profile.id);
    this.saveQuests(quests, userId);
    this.saveActivityLogs(logs, userId);
    this.saveBossState(boss, userId);

    return { profile };
  }

  // Toggle Quest Completion (Complete or Undo)
  public toggleQuestCompletion(questId: string, userId?: string): {
    isCompleted: boolean;
    profile: UserProfile;
    leveledUp?: boolean;
    bossHitDamage?: number;
    prevRank?: RankType;
    newRank?: RankType;
    bossDefeatedNow?: boolean;
    bossCounterAttackDamage?: number;
  } {
    const quests = this.getQuests(userId);
    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found.");

    if (quest.isCompleted) {
      const { profile } = this.undoQuestCompletion(questId, userId);
      return { isCompleted: false, profile };
    } else {
      const res = this.completeQuest(questId, userId);
      return { isCompleted: true, ...res };
    }
  }

  // Custom Quest CRUD
  public addCustomQuest(questData: Partial<Quest>, userId?: string): Quest {
    const quests = this.getQuests(userId);
    const profile = this.getUserProfile(userId);
    
    // Auto calculate rewards
    const rewards = calculateAutoRewards({
      difficulty: questData.difficulty || 'medium',
      estimatedMinutes: questData.estimatedMinutes || 30,
      priority: questData.priority || 'medium',
      userLevel: profile?.level || 1,
    });

    const newQuest: Quest = {
      id: 'quest_cust_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: questData.title || 'Untitled Mission',
      description: questData.description || '',
      category: questData.category || 'Custom',
      xpReward: rewards.xpReward,
      coinReward: rewards.coinReward,
      diamondReward: rewards.diamondReward,
      statReward: questData.statReward || 'Focus',
      statAmount: questData.statAmount || 2,
      isCompleted: false,
      isCustom: true,
      iconName: questData.iconName || 'Target',
      difficulty: questData.difficulty || 'medium',
      estimatedMinutes: questData.estimatedMinutes || 30,
      priority: questData.priority || 'medium',
      deadline: questData.deadline || '',
      progress: Math.max(0, Math.min(100, Number(questData.progress ?? 0))),
      repeatRule: questData.repeatRule || 'daily',
      reminderTime: questData.reminderTime || '',
      notes: questData.notes || '',
      isArchived: false,
    };

    quests.unshift(newQuest);
    this.saveQuests(quests, userId);
    return newQuest;
  }

  public updateCustomQuest(questId: string, questData: Partial<Quest>, userId?: string): Quest {
    const quests = this.getQuests(userId);
    const idx = quests.findIndex(q => q.id === questId);
    if (idx === -1) throw new Error("Quest not found.");

    const profile = this.getUserProfile(userId);
    const current = quests[idx];

    const rewards = calculateAutoRewards({
      difficulty: questData.difficulty || current.difficulty || 'medium',
      estimatedMinutes: questData.estimatedMinutes || current.estimatedMinutes || 30,
      priority: questData.priority || current.priority || 'medium',
      userLevel: profile?.level || 1,
    });

    const updated: Quest = {
      ...current,
      ...questData,
      xpReward: rewards.xpReward,
      coinReward: rewards.coinReward,
      diamondReward: rewards.diamondReward,
      progress: Math.max(0, Math.min(100, Number(questData.progress ?? current.progress ?? 0))),
    };

    quests[idx] = updated;
    this.saveQuests(quests, userId);
    return updated;
  }

  public deleteCustomQuest(questId: string, userId?: string): void {
    const quests = this.getQuests(userId);
    const filtered = quests.filter(q => q.id !== questId);
    this.saveQuests(filtered, userId);
    void goalService.deleteGoal(userId || '', questId);
  }

  public duplicateCustomQuest(questId: string, userId?: string): Quest {
    const quests = this.getQuests(userId);
    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found.");

    const copyData: Partial<Quest> = {
      ...quest,
      title: `${quest.title} (Copy)`,
      isCompleted: false,
      completedAt: undefined,
    };

    return this.addCustomQuest(copyData, userId);
  }

  public archiveCustomQuest(questId: string, isArchived: boolean, userId?: string): Quest {
    const quests = this.getQuests(userId);
    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found.");

    quest.isArchived = isArchived;
    if (isArchived) {
      quest.progress = Math.max(0, Math.min(100, Number(quest.progress ?? 0)));
    }
    this.saveQuests(quests, userId);
    return quest;
  }

  public restoreCustomQuest(questId: string, userId?: string): Quest {
    return this.archiveCustomQuest(questId, false, userId);
  }

  // Routines Storage Methods
  public getRoutines(userId?: string): Routine[] {
    if (!userId) return INITIAL_ROUTINES;
    const key = this.getUserKey(STORAGE_KEY_ROUTINES, userId);
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    const raw = this.getItem(key);
    if (!raw) {
      this.cache.set(key, INITIAL_ROUTINES);
      setTimeout(() => this.setItem(key, JSON.stringify(INITIAL_ROUTINES)), 0);
      return INITIAL_ROUTINES;
    }
    try {
      const parsed = JSON.parse(raw);
      this.cache.set(key, parsed);
      return parsed;
    } catch (e) {
      this.cache.set(key, INITIAL_ROUTINES);
      return INITIAL_ROUTINES;
    }
  }

  public saveRoutines(routines: Routine[], userId?: string): void {
    if (!userId) return;
    const key = this.getUserKey(STORAGE_KEY_ROUTINES, userId);
    this.cache.set(key, routines);
    setTimeout(() => this.setItem(key, JSON.stringify(routines)), 0);
  }

  public addRoutine(title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[], userId?: string): Routine {
    const routines = this.getRoutines(userId);
    const aiAnalysis = analyzeMissionName(title);

    const newRoutine: Routine = {
      id: 'rot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: aiAnalysis.title,
      days,
      enabled: true,
      category: aiAnalysis.category,
      difficulty: aiAnalysis.difficulty,
      estimatedMinutes: aiAnalysis.estimatedMinutes,
      statReward: aiAnalysis.statReward,
      statAmount: aiAnalysis.statAmount,
      xpReward: aiAnalysis.xpReward,
      coinReward: aiAnalysis.coinReward,
      diamondReward: aiAnalysis.diamondReward,
      createdAt: new Date().toISOString()
    };

    routines.unshift(newRoutine);
    this.saveRoutines(routines, userId);
    return newRoutine;
  }

  public updateRoutine(id: string, title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[], userId?: string): Routine {
    const routines = this.getRoutines(userId);
    const idx = routines.findIndex(r => r.id === id);
    if (idx === -1) throw new Error("Routine not found.");

    const aiAnalysis = analyzeMissionName(title);
    const updated: Routine = {
      ...routines[idx],
      title: aiAnalysis.title,
      days,
      category: aiAnalysis.category,
      difficulty: aiAnalysis.difficulty,
      estimatedMinutes: aiAnalysis.estimatedMinutes,
      statReward: aiAnalysis.statReward,
      statAmount: aiAnalysis.statAmount,
      xpReward: aiAnalysis.xpReward,
      coinReward: aiAnalysis.coinReward,
      diamondReward: aiAnalysis.diamondReward
    };

    routines[idx] = updated;
    this.saveRoutines(routines, userId);
    return updated;
  }

  public deleteRoutine(id: string, userId?: string): void {
    const routines = this.getRoutines(userId);
    const filtered = routines.filter(r => r.id !== id);
    this.saveRoutines(filtered, userId);
  }

  public toggleRoutineEnabled(id: string, userId?: string): Routine {
    const routines = this.getRoutines(userId);
    const routine = routines.find(r => r.id === id);
    if (!routine) throw new Error("Routine not found.");

    routine.enabled = !routine.enabled;
    this.saveRoutines(routines, userId);
    return routine;
  }

  public duplicateRoutine(id: string, userId?: string): Routine {
    const routines = this.getRoutines(userId);
    const routine = routines.find(r => r.id === id);
    if (!routine) throw new Error("Routine not found.");

    const newRoutine: Routine = {
      ...routine,
      id: 'rot_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: `${routine.title} (Copy)`,
      createdAt: new Date().toISOString()
    };

    routines.unshift(newRoutine);
    this.saveRoutines(routines, userId);
    return newRoutine;
  }

  // Pure AI Mission Creator (1-Input Instant Analysis)
  public addCustomQuestWithAI(title: string, userId?: string): Quest {
    const quests = this.getQuests(userId);
    const aiAnalysis = analyzeMissionName(title);

    const newQuest: Quest = {
      id: 'quest_ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: aiAnalysis.title,
      description: `AI Auto-Generated Protocol: ${aiAnalysis.category} (${aiAnalysis.estimatedMinutes}m)`,
      category: 'daily',
      xpReward: aiAnalysis.xpReward,
      coinReward: aiAnalysis.coinReward,
      diamondReward: aiAnalysis.diamondReward,
      statReward: aiAnalysis.statReward,
      statAmount: aiAnalysis.statAmount,
      isCompleted: false,
      isCustom: true,
      iconName: aiAnalysis.iconName,
      difficulty: aiAnalysis.difficulty,
      estimatedMinutes: aiAnalysis.estimatedMinutes,
      repeatRule: 'daily',
      isArchived: false,
    };

    quests.unshift(newQuest);
    this.saveQuests(quests, userId);
    return newQuest;
  }

  // Direct Boss Strike
  public strikeBossDirectly(userId?: string): { boss: BossState; damageDealt: number; counterDamage: number; defeatedNow: boolean } {
    const profile = this.getUserProfile(userId);
    const boss = this.getBossState(userId);
    if (!profile || !boss) throw new Error("Character or Boss not loaded.");

    if (profile.level < (boss.minLevel || 1)) {
      throw new Error(`LEVEL LOCKED: Requires Level ${boss.minLevel || 1} to challenge ${boss.name}.`);
    }

    if (boss.defeated) {
      return { boss, damageDealt: 0, counterDamage: 0, defeatedNow: false };
    }

    const strengthBonus = (profile.attributes?.Strength || 0) * 0.6;
    const focusBonus = (profile.attributes?.Focus || 0) * 0.6;
    const disciplineBonus = Math.round((profile.disciplineScore || 0) * 0.3);
    const streakBonus = Math.round((profile.streak || 0) * 1.2);

    let damageDealt = Math.max(5, Math.round(8 + strengthBonus + focusBonus + disciplineBonus + streakBonus));
    const defenseFactor = Math.max(0.15, 1 - (boss.defense || 0) / 400 - (boss.rage || 0) / 300);
    damageDealt = Math.max(2, Math.round(damageDealt * defenseFactor));

    boss.currentHp = Math.max(0, boss.currentHp - damageDealt);
    let defeatedNow = false;

    let counterDamage = 0;
    if (boss.currentHp === 0) {
      boss.defeated = true;
      defeatedNow = true;
      profile.coins += boss.rewardCoins;
      profile.diamonds += boss.rewardDiamonds;
      profile.xp += boss.rewardXp;
      profile.totalXp = (profile.totalXp || 0) + boss.rewardXp;
      profile.bossesDefeatedCount = (profile.bossesDefeatedCount || 0) + 1;
      profile.lootBoxesCount = (profile.lootBoxesCount || 0) + 2;

      const bossRp = calculateRpForMission('legendary', profile.rank) * 2;
      profile.rp = (profile.rp || 0) + bossRp;

      const eligible = evaluateHighestEligibleRank(profile);
      profile.rank = eligible.rank;
      const newRankIdx = ALL_RANKS.findIndex(r => r.rank === eligible.rank);
      const highestRankIdx = ALL_RANKS.findIndex(r => r.rank === profile.highestRank);
      if (newRankIdx > highestRankIdx) profile.highestRank = eligible.rank;
    } else {
      counterDamage = Math.round((boss.bossAttackPower || 15) * (1 + (boss.rage || 0) / 100));
      profile.energy = Math.max(0, profile.energy - counterDamage);
      boss.rage = Math.min(100, (boss.rage || 0) + 5);
      boss.lastCounterAttack = `${boss.name} released a rage pulse! Dealt ${counterDamage} Energy damage.`;
    }

    this.saveUserProfile(profile, userId);
    this.saveBossState(boss, userId);

    return { boss, damageDealt, counterDamage, defeatedNow };
  }

  // Midnight Daily Reset & Routine Synchronization Engine
  public checkAndRunMidnightReset(userId?: string): {
    resetOccurred: boolean;
    penaltiesApplied: boolean;
    summaryMessage: string;
    profile: UserProfile;
    quests: Quest[];
  } {
    const profile = this.getUserProfile(userId);
    if (!profile) throw new Error("No profile.");

    const today = new Date().toISOString().split('T')[0];
    const lastReset = profile.lastResetDate || profile.lastActiveDate;

    if (lastReset === today) {
      return {
        resetOccurred: false,
        penaltiesApplied: false,
        summaryMessage: '',
        profile,
        quests: this.getQuests(userId)
      };
    }

    // Midnight reset triggered!
    let quests = this.getQuests(userId);
    const boss = this.getBossState(userId);
    const logs = this.getActivityLogs(userId);
    const routines = this.getRoutines(userId);

    // 1. Check uncompleted daily quests from yesterday & apply punishments
    const uncompletedDailies = quests.filter(q => (q.category === 'daily' || q.repeatRule === 'daily') && !q.isCompleted);
    let penaltiesApplied = false;
    let penaltyMsg = '';

    profile.daysActiveCount = (profile.daysActiveCount || 0) + 1;

    if (uncompletedDailies.length > 0) {
      penaltiesApplied = true;
      profile.missedMissionsCount = (profile.missedMissionsCount || 0) + uncompletedDailies.length;
      const lostXp = Math.min(profile.xp, uncompletedDailies.length * 15);
      const lostCoins = Math.min(profile.coins, uncompletedDailies.length * 10);
      const lostEnergy = Math.min(profile.energy, uncompletedDailies.length * 12);

      profile.xp = Math.max(0, profile.xp - lostXp);
      profile.coins = Math.max(0, profile.coins - lostCoins);
      profile.energy = Math.max(0, profile.energy - lostEnergy);
      profile.streak = 0; // Streak breaks on missed daily protocol!
      profile.disciplineScore = Math.max(0, profile.disciplineScore - 25);

      if (!boss.defeated) {
        boss.currentHp = Math.min(boss.maxHp, boss.currentHp + Math.round(boss.maxHp * 0.15));
        boss.rage = Math.min(100, (boss.rage || 0) + 25); // Boss Rage increases!
      }

      penaltyMsg = `DAILY RESET: Skipped ${uncompletedDailies.length} daily missions yesterday. Lost ${lostXp} XP, ${lostCoins} Gold. Boss Rage increased!`;

      logs.unshift({
        id: 'log_reset_penalty_' + Date.now(),
        timestamp: new Date().toISOString(),
        questTitle: penaltyMsg,
        xpEarned: -lostXp,
        coinsEarned: -lostCoins,
        type: 'penalty'
      });
    } else {
      // Perfect Day Bonus!
      profile.perfectDaysCount = (profile.perfectDaysCount || 0) + 1;
      const perfectDayRp = calculateRpForMission('hard', profile.rank);
      profile.rp = (profile.rp || 0) + perfectDayRp;
    }

    // Rank Decay for Inactivity / Missed Days (Platinum and above)
    const activeReq = getRankRequirement(profile.rank);
    if (activeReq.decayPerDay > 0) {
      const decay = activeReq.decayPerDay;
      profile.rp = Math.max(3300, (profile.rp || 0) - decay); // Floor at Platinum III threshold (3300)
    }

    // 2. Clear yesterday's daily quests (completed & uncompleted disappear)
    const nonDailyQuests = quests.filter(q => q.category !== 'daily' && q.repeatRule !== 'daily');

    // 3. Auto-generate today's active missions from active routines
    const dayNames: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const currentDayName = dayNames[new Date().getDay()];
    const isWeekdayNum = new Date().getDay() >= 1 && new Date().getDay() <= 5;

    const todayRoutines = routines.filter(r => {
      if (!r.enabled) return false;
      return (
        r.days.includes('daily') ||
        r.days.includes(currentDayName) ||
        (isWeekdayNum && r.days.includes('weekdays')) ||
        (!isWeekdayNum && r.days.includes('weekends'))
      );
    });

    const newDailyQuests: Quest[] = todayRoutines.map(r => {
      const ai = analyzeMissionName(r.title);
      return {
        id: 'quest_rot_' + r.id + '_' + today,
        title: r.title,
        description: `Routine Protocol: ${r.category} (${r.estimatedMinutes}m)`,
        category: 'daily',
        xpReward: r.xpReward || ai.xpReward,
        coinReward: r.coinReward || ai.coinReward,
        diamondReward: r.diamondReward || ai.diamondReward,
        statReward: r.statReward || ai.statReward,
        statAmount: r.statAmount || ai.statAmount,
        isCompleted: false,
        isCustom: true,
        iconName: ai.iconName,
        difficulty: r.difficulty || ai.difficulty,
        estimatedMinutes: r.estimatedMinutes || ai.estimatedMinutes,
        repeatRule: 'daily',
        isArchived: false,
      };
    });

    // Merge non-daily quests + new daily quests generated for today
    quests = [...newDailyQuests, ...nonDailyQuests];

    profile.lastResetDate = today;
    profile.lastActiveDate = today;
    const eligible = evaluateHighestEligibleRank(profile);
    profile.rank = eligible.rank;

    this.saveUserProfile(profile, userId);
    this.saveQuests(quests, userId);
    this.saveBossState(boss, userId);
    this.saveActivityLogs(logs, userId);

    return {
      resetOccurred: true,
      penaltiesApplied,
      summaryMessage: penaltyMsg || `DAILY RESET: Today's missions generated from active routines (${newDailyQuests.length} protocols loaded).`,
      profile,
      quests
    };
  }

  // Legacy fallback alias
  public processDailyPenalties(userId?: string): { penaltiesApplied: boolean; message: string; profile: UserProfile } {
    const res = this.checkAndRunMidnightReset(userId);
    return {
      penaltiesApplied: res.penaltiesApplied,
      message: res.summaryMessage,
      profile: res.profile
    };
  }

  // Reset Quests for a New Day
  public resetDailyQuests(userId?: string): Quest[] {
    const quests = this.getQuests(userId);
    const updated = quests.map(q => {
      if (q.category === 'daily') {
        return { ...q, isCompleted: false };
      }
      return q;
    });
    this.saveQuests(updated, userId);
    return updated;
  }

  // AI Configuration Management
  public getAIConfig(): AIConfig {
    const raw = this.getItem(STORAGE_KEY_AI_CONFIG);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to parse AI config:', e);
      }
    }
    return {
      provider: 'server_default',
      apiKey: '',
      model: 'gemini-3.6-flash',
      isConfigured: false
    };
  }

  public saveAIConfig(config: AIConfig): void {
    this.setItem(STORAGE_KEY_AI_CONFIG, JSON.stringify(config));
  }

  public removeAIConfig(): void {
    this.removeItem(STORAGE_KEY_AI_CONFIG);
  }
}


export const storageService = new StorageService();
