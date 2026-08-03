import { QuestCategory, QuestDifficulty, Attributes } from '../types';

export interface AIMissionAnalysis {
  title: string;
  category: QuestCategory;
  difficulty: QuestDifficulty;
  estimatedMinutes: number;
  statReward: keyof Attributes;
  statAmount: number;
  xpReward: number;
  coinReward: number;
  diamondReward: number;
  bossDamage: number;
  missionRank: string;
  iconName: string;
}

export function analyzeMissionName(rawTitle: string): AIMissionAnalysis {
  const title = rawTitle.trim();
  const lower = title.toLowerCase();

  // 1. Detect Category & Primary Stat & Icon
  let category: QuestCategory = 'Custom';
  let statReward: keyof Attributes = 'Confidence';
  let iconName = 'Target';

  if (/workout|gym|push|pull|legs|run|cardio|squat|bench|lift|exercise|press|deadlift|swim|cycle|hiit|abs|crossfit|arm|chest|back/.test(lower)) {
    category = 'Fitness';
    statReward = 'Strength';
    iconName = 'Dumbbell';
  } else if (/read|book|atomic habits|habit|chapter|pages|study|learn|paper|course|lecture|research|exam|test|vocab|reading|phd/.test(lower)) {
    category = 'Study';
    statReward = 'Knowledge';
    iconName = 'BookOpen';
  } else if (/code|leetcode|react|python|dev|bug|build|api|project|work|deep work|write|email|refactor|design|typescript|javascript|git|software/.test(lower)) {
    category = 'Work';
    statReward = 'Focus';
    iconName = 'BrainCircuit';
  } else if (/quran|bible|pray|namaz|dhikr|church|duaa|spiritual|god|faith|torah|mosque|worship|verse/.test(lower)) {
    category = 'Religion';
    statReward = 'Spiritual';
    iconName = 'Flame';
  } else if (/water|sleep|eat|salad|vitamins|health|dental|floss|hydrate|fruit|veggies|protein|meal|fasting|walk/.test(lower)) {
    category = 'Health';
    statReward = 'Health';
    iconName = 'Droplet';
  } else if (/meditate|meditation|breathe|breath|journal|mindset|reflect|cold shower|ice bath|gratitude|peace/.test(lower)) {
    category = 'Meditation';
    statReward = 'Mindset';
    iconName = 'Sparkles';
  } else if (/budget|finance|save|crypto|invest|tax|money|expenses|accounting|stocks|trade/.test(lower)) {
    category = 'Finance';
    statReward = 'Finance';
    iconName = 'Coins';
  }

  // 2. Detect Time in Minutes (if typed, e.g., "45m", "1 hr", "2 hours", "15 mins")
  let estimatedMinutes = 30; // default
  const timeMatchMin = lower.match(/(\d+)\s*(m|min|mins|minute|minutes)/);
  const timeMatchHr = lower.match(/(\d+)\s*(h|hr|hrs|hour|hours)/);

  if (timeMatchMin) {
    estimatedMinutes = parseInt(timeMatchMin[1], 10);
  } else if (timeMatchHr) {
    estimatedMinutes = parseInt(timeMatchHr[1], 10) * 60;
  } else {
    // Quick action keyword heuristics
    if (/water|drink|vitamin|floss|bed|stretch|fruit|hydrate|pill/.test(lower)) {
      estimatedMinutes = 5;
    } else if (/journal|meditate|breathe|read|walk|pray|dhikr/.test(lower)) {
      estimatedMinutes = 20;
    } else if (/workout|gym|push|pull|legs|run|leetcode|study|code|deep work/.test(lower)) {
      estimatedMinutes = 45;
    } else if (/marathon|exam|project|course|full/.test(lower)) {
      estimatedMinutes = 90;
    }
  }

  // 3. Deduce Difficulty based on estimatedMinutes and Keywords
  let difficulty: QuestDifficulty = 'medium';
  if (estimatedMinutes <= 10) {
    difficulty = 'easy';
  } else if (estimatedMinutes <= 30) {
    difficulty = 'medium';
  } else if (estimatedMinutes <= 60) {
    difficulty = 'hard';
  } else if (estimatedMinutes <= 90) {
    difficulty = 'extreme';
  } else {
    difficulty = 'legendary';
  }

  // Hard overrides based on keywords
  if (/push workout|pull workout|leg day|leetcode|deep work 90m|marathon|exam|fast 24h/.test(lower)) {
    if (difficulty === 'easy' || difficulty === 'medium') difficulty = 'hard';
  }

  // 4. Calculate XP, Gold, Boss Damage, Stat Gain & Mission Rank
  let xpReward = 10;
  let coinReward = 5;
  let diamondReward = 0;
  let statAmount = 1;
  let bossDamage = 20;
  let missionRank = 'C-Rank';

  if (difficulty === 'easy') {
    xpReward = Math.max(2, Math.round(estimatedMinutes * 0.8));
    coinReward = Math.max(1, Math.round(xpReward * 0.5));
    statAmount = 1;
    bossDamage = Math.round(xpReward * 2);
    missionRank = 'E-Rank';
  } else if (difficulty === 'medium') {
    xpReward = Math.max(8, Math.round(estimatedMinutes * 0.4 + 4));
    coinReward = Math.max(4, Math.round(xpReward * 0.55));
    statAmount = 1;
    bossDamage = Math.round(xpReward * 2.5);
    missionRank = 'D-Rank';
  } else if (difficulty === 'hard') {
    xpReward = Math.max(14, Math.round(estimatedMinutes * 0.35 + 8));
    coinReward = Math.max(8, Math.round(xpReward * 0.6));
    statAmount = 2;
    bossDamage = Math.round(xpReward * 3);
    missionRank = 'A-Rank';
  } else if (difficulty === 'extreme') {
    xpReward = Math.max(28, Math.round(estimatedMinutes * 0.4 + 10));
    coinReward = Math.max(15, Math.round(xpReward * 0.65));
    diamondReward = 1;
    statAmount = 2;
    bossDamage = Math.round(xpReward * 3.5);
    missionRank = 'S-Rank';
  } else if (difficulty === 'legendary') {
    xpReward = Math.max(45, Math.round(estimatedMinutes * 0.45 + 15));
    coinReward = Math.max(25, Math.round(xpReward * 0.7));
    diamondReward = 2;
    statAmount = 3;
    bossDamage = Math.round(xpReward * 4);
    missionRank = 'SS-Rank';
  }

  return {
    title: title || 'Untitled Mission',
    category,
    difficulty,
    estimatedMinutes,
    statReward,
    statAmount,
    xpReward,
    coinReward,
    diamondReward,
    bossDamage,
    missionRank,
    iconName,
  };
}
