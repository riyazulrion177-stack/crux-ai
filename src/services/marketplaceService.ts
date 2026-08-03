// ==========================================
// CRUX Life OS - Marketplace Service
// User & Creator Template Marketplace Architecture
// ==========================================

import { MarketplaceItem, MarketplaceCategory } from '../types/monetization';
import { coinEconomyService } from './coinEconomyService';

const STORAGE_KEY_MARKETPLACE = 'crux_marketplace_v1';

export const CATALOG_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'mkt_study_deepwork_mastery',
    title: 'Deep Work Study Protocol',
    description: 'Structured Pomodoro & Feynman technique daily mission blueprint.',
    category: MarketplaceCategory.STUDY_PLANS,
    authorName: 'Alex Mercer (S-Rank)',
    rating: 4.9,
    salesCount: 1420,
    priceCoins: 250,
    tags: ['Study', 'Focus', 'College'],
    previewDetails: [
      '7x Daily Micro-Habits for memory retention',
      'Integrated Feynman technique review quests',
      'Targeted for 4-hour focus blocks',
    ],
  },
  {
    id: 'mkt_workout_hypertrophy_5day',
    title: '5-Day Hypertrophy Questline',
    description: 'RPG Workout routine with incremental overload progression tracking.',
    category: MarketplaceCategory.WORKOUT_PACKS,
    authorName: 'Iron Valkyrie',
    rating: 4.8,
    salesCount: 980,
    priceCoins: 300,
    tags: ['Fitness', 'Gym', 'Strength'],
    previewDetails: [
      'Upper / Lower / Push / Pull / Legs split',
      'Boss damage scaling tied to workout completion',
      'Rest day mobility recovery routines',
    ],
  },
  {
    id: 'mkt_habit_dopamine_detox',
    title: '21-Day Dopamine Reset',
    description: 'Break screen addiction and rebuild focus baseline.',
    category: MarketplaceCategory.HABIT_PACKS,
    authorName: 'System Architect',
    rating: 5.0,
    salesCount: 3100,
    priceCoins: 200,
    tags: ['Habits', 'Mental Health', 'Detox'],
    previewDetails: [
      'Morning sunlight exposure tracking',
      'No-phone first hour rules',
      'Evening wind-down rituals',
    ],
  },
  {
    id: 'mkt_focus_flow_state',
    title: 'Flow State Chamber Kit',
    description: 'Binaural soundscape routines and distraction shields.',
    category: MarketplaceCategory.FOCUS_PACKS,
    authorName: 'Zen Master AI',
    rating: 4.7,
    salesCount: 640,
    priceCoins: 150,
    tags: ['Flow State', 'Binaural', 'Meditation'],
    previewDetails: [
      '10-minute pre-work breathing prep',
      'Automated noise blocking timers',
      'Deep work session logger',
    ],
  },
];

export class MarketplaceService {
  private cache: Map<string, MarketplaceItem[]> = new Map();

  public getItems(userId: string): MarketplaceItem[] {
    const key = `${STORAGE_KEY_MARKETPLACE}_${userId}`;
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
      // Ignore
    }

    this.saveItems(userId, CATALOG_MARKETPLACE_ITEMS);
    return CATALOG_MARKETPLACE_ITEMS;
  }

  public saveItems(userId: string, items: MarketplaceItem[]): void {
    const key = `${STORAGE_KEY_MARKETPLACE}_${userId}`;
    this.cache.set(key, items);
    try {
      localStorage.setItem(key, JSON.stringify(items));
    } catch {
      // Storage quota
    }
  }

  public acquireItem(userId: string, itemId: string): { success: boolean; message: string } {
    const items = this.getItems(userId);
    const item = items.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, message: 'Item not found in marketplace.' };
    }

    if (item.isPurchased) {
      return { success: true, message: 'Item is already in your library.' };
    }

    const success = coinEconomyService.spendCoins(userId, item.priceCoins, item.title);
    if (!success) {
      return { success: false, message: 'Insufficient Cyber Coins.' };
    }

    item.isPurchased = true;
    item.salesCount += 1;
    this.saveItems(userId, items);

    return { success: true, message: `Successfully acquired "${item.title}"!` };
  }
}

export const marketplaceService = new MarketplaceService();
