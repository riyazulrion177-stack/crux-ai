import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import { Quest } from '../../types';
import { AppError } from '../core/error';
import { logger } from '../core/logger';
import { withRetry } from '../core/retry';

export interface GoalRepository {
  loadByUser(userId: string): Promise<Quest[]>;
  upsertMany(userId: string, quests: Quest[]): Promise<void>;
  deleteById(userId: string, questId: string): Promise<void>;
}

const mapGoalRecord = (goal: Record<string, unknown>): Quest => ({
  id: String(goal.id ?? ''),
  title: String(goal.title ?? 'Untitled Goal'),
  description: String(goal.description ?? ''),
  category: (goal.category as Quest['category']) ?? 'Custom',
  xpReward: Number(goal.xp_reward ?? goal.xpReward ?? 0),
  coinReward: Number(goal.coin_reward ?? goal.coinReward ?? 0),
  diamondReward: Number(goal.diamond_reward ?? goal.diamondReward ?? 0),
  statReward: (goal.stat_reward as Quest['statReward']) ?? (goal.statReward as Quest['statReward']) ?? 'Focus',
  statAmount: Number(goal.stat_amount ?? goal.statAmount ?? 0),
  isCompleted: Boolean(goal.is_completed ?? goal.isCompleted ?? false),
  completedAt: (goal.completed_at ?? goal.completedAt) ? String(goal.completed_at ?? goal.completedAt ?? '') : undefined,
  isCustom: Boolean(goal.is_custom ?? goal.isCustom ?? true),
  iconName: String(goal.icon_name ?? goal.iconName ?? 'Target'),
  difficulty: (goal.difficulty as Quest['difficulty']) || 'medium',
  estimatedMinutes: Number(goal.estimated_minutes ?? goal.estimatedMinutes ?? 30),
  priority: (goal.priority as Quest['priority']) || 'medium',
  deadline: String(goal.deadline ?? ''),
  progress: Number(goal.progress ?? 0),
  repeatRule: (goal.repeat_rule as Quest['repeatRule']) ?? (goal.repeatRule as Quest['repeatRule']) ?? 'daily',
  reminderTime: String(goal.reminder_time ?? goal.reminderTime ?? ''),
  notes: String(goal.notes ?? ''),
  isArchived: Boolean(goal.is_archived ?? goal.isArchived ?? false),
});

class SupabaseGoalRepository implements GoalRepository {
  constructor(private readonly client: SupabaseClient | null = supabase) {}

  async loadByUser(userId: string): Promise<Quest[]> {
    if (!this.client) {
      return [];
    }

    try {
      const { data, error } = await withRetry(async () => this.client!.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: false }));
      if (error) {
        throw new AppError('GOAL_FETCH_FAILED', error.message, { cause: error });
      }

      return (data || []).map((goal) => mapGoalRecord(goal as Record<string, unknown>));
    } catch (error) {
      logger.warn('Goal repository fetch failed.', { userId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async upsertMany(userId: string, quests: Quest[]): Promise<void> {
    if (!this.client || quests.length === 0) {
      return;
    }

    try {
      const payload = quests.map((quest) => ({
        id: quest.id,
        user_id: userId,
        title: quest.title,
        description: quest.description || '',
        category: quest.category,
        xp_reward: quest.xpReward,
        coin_reward: quest.coinReward,
        diamond_reward: quest.diamondReward,
        stat_reward: quest.statReward,
        stat_amount: quest.statAmount,
        is_completed: quest.isCompleted,
        completed_at: quest.completedAt || null,
        is_custom: quest.isCustom ?? true,
        icon_name: quest.iconName,
        difficulty: quest.difficulty || 'medium',
        estimated_minutes: quest.estimatedMinutes || 30,
        priority: quest.priority || 'medium',
        deadline: quest.deadline || null,
        progress: Math.max(0, Math.min(100, Number(quest.progress ?? 0))),
        repeat_rule: quest.repeatRule || 'daily',
        reminder_time: quest.reminderTime || null,
        notes: quest.notes || '',
        is_archived: Boolean(quest.isArchived),
        created_at: new Date().toISOString(),
      }));

      const { error } = await withRetry(async () => this.client!.from('goals').upsert(payload, { onConflict: 'id' }));
      if (error) {
        throw new AppError('GOAL_SYNC_FAILED', error.message, { cause: error });
      }

      logger.info('Goal repository sync succeeded.', { userId, count: payload.length });
    } catch (error) {
      logger.warn('Goal repository sync failed.', { userId, count: quests.length, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  async deleteById(userId: string, questId: string): Promise<void> {
    if (!this.client) {
      return;
    }

    try {
      const { error } = await withRetry(async () => this.client!.from('goals').delete().eq('id', questId).eq('user_id', userId));
      if (error) {
        throw new AppError('GOAL_DELETE_FAILED', error.message, { cause: error });
      }
    } catch (error) {
      logger.warn('Goal repository delete failed.', { userId, questId, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }
}

export const goalRepository: GoalRepository = new SupabaseGoalRepository();
