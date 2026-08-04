import { Quest } from '../../types';
import { AppError, normalizeError } from '../core/error';
import { logger } from '../core/logger';
import { withRetry } from '../core/retry';
import { goalRepository } from '../repositories/GoalRepository';

class GoalService {
  private readonly pendingSyncs = new Map<string, Promise<void>>();

  async loadGoals(userId: string): Promise<Quest[]> {
    try {
      return await withRetry(() => goalRepository.loadByUser(userId), { retries: 2 });
    } catch (error) {
      const appError = normalizeError(error, 'Failed to load goals from Supabase.');
      logger.error('Goal service load failed.', { userId, error: appError.message });
      throw appError;
    }
  }

  async syncGoals(userId: string, quests: Quest[]): Promise<void> {
    const existing = this.pendingSyncs.get(userId);
    if (existing) {
      await existing;
      return;
    }

    const pending = withRetry(() => goalRepository.upsertMany(userId, quests), { retries: 2 })
      .catch((error) => {
        const appError = normalizeError(error, 'Failed to sync goals to Supabase.');
        logger.error('Goal service sync failed.', { userId, error: appError.message });
        throw appError;
      })
      .finally(() => {
        this.pendingSyncs.delete(userId);
      });

    this.pendingSyncs.set(userId, pending);
    await pending;
  }

  async deleteGoal(userId: string, questId: string): Promise<void> {
    try {
      await withRetry(() => goalRepository.deleteById(userId, questId), { retries: 2 });
    } catch (error) {
      const appError = normalizeError(error, 'Failed to delete goal from Supabase.');
      logger.error('Goal service delete failed.', { userId, questId, error: appError.message });
      throw appError;
    }
  }
}

export const goalService = new GoalService();
