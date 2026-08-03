import { RankType, UserProfile } from '../types';

export interface RankRequirement {
  rank: RankType;
  tierGroup: 'Unranked' | 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master' | 'Grandmaster' | 'Heroic' | 'Legend' | 'Mythic' | 'Immortal';
  minRp: number;
  minLevel: number;
  minTotalXp: number;
  minDisciplineScore: number;
  minStreak: number;
  minBossesDefeated: number;
  badgeBg: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  rpMultiplier: number;
  decayPerDay: number;
}

export const ALL_RANKS: RankRequirement[] = [
  {
    rank: 'Unranked',
    tierGroup: 'Unranked',
    minRp: 0,
    minLevel: 1,
    minTotalXp: 0,
    minDisciplineScore: 0,
    minStreak: 0,
    minBossesDefeated: 0,
    badgeBg: 'bg-slate-900',
    badgeBorder: 'border-slate-700',
    textColor: 'text-slate-400',
    glowColor: 'rgba(148, 163, 184, 0.2)',
    rpMultiplier: 1.0,
    decayPerDay: 0,
  },
  {
    rank: 'Bronze III',
    tierGroup: 'Bronze',
    minRp: 50,
    minLevel: 1,
    minTotalXp: 40,
    minDisciplineScore: 0,
    minStreak: 0,
    minBossesDefeated: 0,
    badgeBg: 'bg-amber-950/80',
    badgeBorder: 'border-amber-700/60',
    textColor: 'text-amber-400',
    glowColor: 'rgba(217, 119, 6, 0.3)',
    rpMultiplier: 1.0,
    decayPerDay: 0,
  },
  {
    rank: 'Bronze II',
    tierGroup: 'Bronze',
    minRp: 150,
    minLevel: 2,
    minTotalXp: 150,
    minDisciplineScore: 10,
    minStreak: 0,
    minBossesDefeated: 0,
    badgeBg: 'bg-amber-950/90',
    badgeBorder: 'border-amber-600/70',
    textColor: 'text-amber-300',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    rpMultiplier: 1.0,
    decayPerDay: 0,
  },
  {
    rank: 'Bronze I',
    tierGroup: 'Bronze',
    minRp: 300,
    minLevel: 3,
    minTotalXp: 320,
    minDisciplineScore: 20,
    minStreak: 0,
    minBossesDefeated: 0,
    badgeBg: 'bg-amber-900/90',
    badgeBorder: 'border-amber-500/80',
    textColor: 'text-amber-200',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    rpMultiplier: 0.95,
    decayPerDay: 0,
  },
  {
    rank: 'Silver III',
    tierGroup: 'Silver',
    minRp: 500,
    minLevel: 5,
    minTotalXp: 600,
    minDisciplineScore: 30,
    minStreak: 1,
    minBossesDefeated: 0,
    badgeBg: 'bg-slate-800/90',
    badgeBorder: 'border-slate-400/60',
    textColor: 'text-slate-200',
    glowColor: 'rgba(203, 213, 225, 0.4)',
    rpMultiplier: 0.9,
    decayPerDay: 0,
  },
  {
    rank: 'Silver II',
    tierGroup: 'Silver',
    minRp: 750,
    minLevel: 7,
    minTotalXp: 1000,
    minDisciplineScore: 40,
    minStreak: 2,
    minBossesDefeated: 0,
    badgeBg: 'bg-slate-700/90',
    badgeBorder: 'border-slate-300/70',
    textColor: 'text-slate-100',
    glowColor: 'rgba(226, 232, 240, 0.5)',
    rpMultiplier: 0.88,
    decayPerDay: 0,
  },
  {
    rank: 'Silver I',
    tierGroup: 'Silver',
    minRp: 1050,
    minLevel: 9,
    minTotalXp: 1500,
    minDisciplineScore: 50,
    minStreak: 3,
    minBossesDefeated: 0,
    badgeBg: 'bg-slate-600/90',
    badgeBorder: 'border-slate-200/90',
    textColor: 'text-white',
    glowColor: 'rgba(248, 250, 252, 0.6)',
    rpMultiplier: 0.85,
    decayPerDay: 0,
  },
  {
    rank: 'Gold III',
    tierGroup: 'Gold',
    minRp: 1450,
    minLevel: 12,
    minTotalXp: 2200,
    minDisciplineScore: 60,
    minStreak: 4,
    minBossesDefeated: 1,
    badgeBg: 'bg-yellow-950/90',
    badgeBorder: 'border-yellow-500/70',
    textColor: 'text-yellow-300',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    rpMultiplier: 0.8,
    decayPerDay: 0,
  },
  {
    rank: 'Gold II',
    tierGroup: 'Gold',
    minRp: 1950,
    minLevel: 15,
    minTotalXp: 3000,
    minDisciplineScore: 65,
    minStreak: 5,
    minBossesDefeated: 2,
    badgeBg: 'bg-yellow-900/90',
    badgeBorder: 'border-yellow-400/80',
    textColor: 'text-yellow-200',
    glowColor: 'rgba(250, 204, 21, 0.6)',
    rpMultiplier: 0.78,
    decayPerDay: 0,
  },
  {
    rank: 'Gold I',
    tierGroup: 'Gold',
    minRp: 2550,
    minLevel: 18,
    minTotalXp: 4000,
    minDisciplineScore: 70,
    minStreak: 7,
    minBossesDefeated: 3,
    badgeBg: 'bg-amber-800/90',
    badgeBorder: 'border-amber-300',
    textColor: 'text-yellow-100',
    glowColor: 'rgba(253, 224, 71, 0.7)',
    rpMultiplier: 0.75,
    decayPerDay: 0,
  },
  {
    rank: 'Platinum III',
    tierGroup: 'Platinum',
    minRp: 3300,
    minLevel: 22,
    minTotalXp: 5500,
    minDisciplineScore: 75,
    minStreak: 9,
    minBossesDefeated: 4,
    badgeBg: 'bg-cyan-950/90',
    badgeBorder: 'border-cyan-500/70',
    textColor: 'text-cyan-300',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    rpMultiplier: 0.7,
    decayPerDay: 20,
  },
  {
    rank: 'Platinum II',
    tierGroup: 'Platinum',
    minRp: 4200,
    minLevel: 26,
    minTotalXp: 7200,
    minDisciplineScore: 80,
    minStreak: 11,
    minBossesDefeated: 5,
    badgeBg: 'bg-cyan-900/90',
    badgeBorder: 'border-cyan-400/80',
    textColor: 'text-cyan-200',
    glowColor: 'rgba(34, 211, 238, 0.6)',
    rpMultiplier: 0.65,
    decayPerDay: 25,
  },
  {
    rank: 'Platinum I',
    tierGroup: 'Platinum',
    minRp: 5200,
    minLevel: 30,
    minTotalXp: 9000,
    minDisciplineScore: 82,
    minStreak: 14,
    minBossesDefeated: 6,
    badgeBg: 'bg-teal-900/90',
    badgeBorder: 'border-teal-300',
    textColor: 'text-teal-200',
    glowColor: 'rgba(45, 212, 191, 0.7)',
    rpMultiplier: 0.6,
    decayPerDay: 30,
  },
  {
    rank: 'Diamond III',
    tierGroup: 'Diamond',
    minRp: 6500,
    minLevel: 35,
    minTotalXp: 11500,
    minDisciplineScore: 85,
    minStreak: 18,
    minBossesDefeated: 8,
    badgeBg: 'bg-indigo-950/90',
    badgeBorder: 'border-indigo-500/70',
    textColor: 'text-indigo-300',
    glowColor: 'rgba(99, 102, 241, 0.6)',
    rpMultiplier: 0.55,
    decayPerDay: 40,
  },
  {
    rank: 'Diamond II',
    tierGroup: 'Diamond',
    minRp: 8000,
    minLevel: 40,
    minTotalXp: 14500,
    minDisciplineScore: 88,
    minStreak: 21,
    minBossesDefeated: 10,
    badgeBg: 'bg-indigo-900/90',
    badgeBorder: 'border-indigo-400/80',
    textColor: 'text-indigo-200',
    glowColor: 'rgba(129, 140, 248, 0.7)',
    rpMultiplier: 0.5,
    decayPerDay: 50,
  },
  {
    rank: 'Diamond I',
    tierGroup: 'Diamond',
    minRp: 9800,
    minLevel: 45,
    minTotalXp: 18000,
    minDisciplineScore: 90,
    minStreak: 25,
    minBossesDefeated: 12,
    badgeBg: 'bg-blue-900/90',
    badgeBorder: 'border-blue-300',
    textColor: 'text-blue-100',
    glowColor: 'rgba(147, 197, 253, 0.8)',
    rpMultiplier: 0.45,
    decayPerDay: 60,
  },
  {
    rank: 'Master',
    tierGroup: 'Master',
    minRp: 12000,
    minLevel: 50,
    minTotalXp: 22000,
    minDisciplineScore: 92,
    minStreak: 30,
    minBossesDefeated: 15,
    badgeBg: 'bg-purple-950/95',
    badgeBorder: 'border-purple-500/90',
    textColor: 'text-purple-300',
    glowColor: 'rgba(168, 85, 247, 0.8)',
    rpMultiplier: 0.4,
    decayPerDay: 75,
  },
  {
    rank: 'Grandmaster',
    tierGroup: 'Grandmaster',
    minRp: 15000,
    minLevel: 60,
    minTotalXp: 30000,
    minDisciplineScore: 95,
    minStreak: 45,
    minBossesDefeated: 20,
    badgeBg: 'bg-rose-950/95',
    badgeBorder: 'border-rose-500',
    textColor: 'text-rose-300',
    glowColor: 'rgba(244, 63, 94, 0.9)',
    rpMultiplier: 0.35,
    decayPerDay: 100,
  },
  {
    rank: 'Heroic',
    tierGroup: 'Heroic',
    minRp: 19000,
    minLevel: 70,
    minTotalXp: 40000,
    minDisciplineScore: 96,
    minStreak: 60,
    minBossesDefeated: 25,
    badgeBg: 'bg-red-950/95',
    badgeBorder: 'border-red-400',
    textColor: 'text-red-300',
    glowColor: 'rgba(239, 68, 68, 0.9)',
    rpMultiplier: 0.28,
    decayPerDay: 120,
  },
  {
    rank: 'Legend',
    tierGroup: 'Legend',
    minRp: 24000,
    minLevel: 80,
    minTotalXp: 55000,
    minDisciplineScore: 97,
    minStreak: 75,
    minBossesDefeated: 30,
    badgeBg: 'bg-fuchsia-950/95',
    badgeBorder: 'border-fuchsia-400',
    textColor: 'text-fuchsia-200',
    glowColor: 'rgba(232, 121, 249, 1.0)',
    rpMultiplier: 0.22,
    decayPerDay: 150,
  },
  {
    rank: 'Mythic',
    tierGroup: 'Mythic',
    minRp: 30000,
    minLevel: 90,
    minTotalXp: 75000,
    minDisciplineScore: 98,
    minStreak: 90,
    minBossesDefeated: 40,
    badgeBg: 'bg-violet-950/95',
    badgeBorder: 'border-violet-300',
    textColor: 'text-violet-100',
    glowColor: 'rgba(196, 181, 253, 1.0)',
    rpMultiplier: 0.15,
    decayPerDay: 180,
  },
  {
    rank: 'Immortal',
    tierGroup: 'Immortal',
    minRp: 38000,
    minLevel: 100,
    minTotalXp: 100000,
    minDisciplineScore: 99,
    minStreak: 100,
    minBossesDefeated: 50,
    badgeBg: 'bg-gradient-to-r from-yellow-950 via-amber-900 to-yellow-950',
    badgeBorder: 'border-yellow-300',
    textColor: 'text-yellow-200',
    glowColor: 'rgba(253, 224, 71, 1.0)',
    rpMultiplier: 0.1,
    decayPerDay: 200,
  },
];

export function getRankRequirement(rankName: RankType): RankRequirement {
  return (
    ALL_RANKS.find((r) => r.rank === rankName) || ALL_RANKS[0]
  );
}

export function getNextRankRequirement(currentRankName: RankType): RankRequirement | null {
  const currentIndex = ALL_RANKS.findIndex((r) => r.rank === currentRankName);
  if (currentIndex === -1 || currentIndex >= ALL_RANKS.length - 1) {
    return null; // Max rank reached
  }
  return ALL_RANKS[currentIndex + 1];
}

export function evaluateHighestEligibleRank(profile: UserProfile): RankRequirement {
  let eligible = ALL_RANKS[0];

  const totalXp = profile.totalXp ?? profile.xp;
  const rp = profile.rp ?? 0;
  const level = profile.level ?? 1;
  const disc = profile.disciplineScore ?? 0;
  const streak = profile.streak ?? 0;
  const bosses = profile.bossesDefeatedCount ?? 0;

  for (const req of ALL_RANKS) {
    if (
      rp >= req.minRp &&
      level >= req.minLevel &&
      totalXp >= req.minTotalXp &&
      disc >= req.minDisciplineScore &&
      streak >= req.minStreak &&
      bosses >= req.minBossesDefeated
    ) {
      eligible = req;
    } else {
      break;
    }
  }

  return eligible;
}

export function calculateRpForMission(difficulty: string, rank: RankType): number {
  let base = 10;
  if (difficulty === 'easy') base = 5;
  if (difficulty === 'medium') base = 10;
  if (difficulty === 'hard') base = 18;
  if (difficulty === 'extreme') base = 30;
  if (difficulty === 'legendary') base = 50;

  const req = getRankRequirement(rank);
  return Math.max(1, Math.round(base * req.rpMultiplier));
}
