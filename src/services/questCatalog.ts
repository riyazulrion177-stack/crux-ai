import { Quest, Achievement, BossState } from '../types';
import bossBelphegorImg from '../assets/images/boss_belphegor_1785562150269.jpg';
import bossAamonImg from '../assets/images/boss_aamon_1785562171472.jpg';
import bossMammonImg from '../assets/images/boss_mammon_1785562184493.jpg';
import bossLuciferImg from '../assets/images/boss_lucifer_1785562195827.jpg';

export const INITIAL_QUEST_CATALOG: Quest[] = [
  // Daily Quests - Rebalanced for MMORPG discipline: Easy (2 XP / 1 Gold), Medium (4 XP / 2 Gold), Hard (7 XP / 3 Gold), Legendary (12 XP / 5 Gold)
  {
    id: 'd_workout',
    title: 'Physical Conditioning (45m Workout)',
    description: 'Engage in intense physical training or resistance workout.',
    category: 'daily',
    difficulty: 'hard',
    xpReward: 7,
    coinReward: 3,
    diamondReward: 1,
    statReward: 'Strength',
    statAmount: 2,
    isCompleted: false,
    iconName: 'Dumbbell'
  },
  {
    id: 'd_deepwork',
    title: 'Deep Work Protocol (90m Sprint)',
    description: 'Complete 90 minutes of distraction-free, hyper-focused work.',
    category: 'daily',
    difficulty: 'hard',
    xpReward: 7,
    coinReward: 3,
    diamondReward: 1,
    statReward: 'Focus',
    statAmount: 3,
    isCompleted: false,
    iconName: 'BrainCircuit'
  },
  {
    id: 'd_reading',
    title: 'Intellectual Upgrade (30m Reading)',
    description: 'Read high-value non-fiction, technical docs, or philosophy.',
    category: 'daily',
    difficulty: 'medium',
    xpReward: 4,
    coinReward: 2,
    diamondReward: 0,
    statReward: 'Knowledge',
    statAmount: 2,
    isCompleted: false,
    iconName: 'BookOpen'
  },
  {
    id: 'd_meditation',
    title: 'Mind Clarity & Meditation (15m)',
    description: 'Practice mindfulness, box breathing, or quiet reflection.',
    category: 'daily',
    difficulty: 'medium',
    xpReward: 4,
    coinReward: 2,
    diamondReward: 0,
    statReward: 'Mindset',
    statAmount: 2,
    isCompleted: false,
    iconName: 'Sparkles'
  },
  {
    id: 'd_water',
    title: 'Hydration Siege (3 Liters)',
    description: 'Maintain optimal cellular hydration throughout the day.',
    category: 'daily',
    difficulty: 'easy',
    xpReward: 2,
    coinReward: 1,
    diamondReward: 0,
    statReward: 'Health',
    statAmount: 1,
    isCompleted: false,
    iconName: 'Droplet'
  },
  {
    id: 'd_sleep',
    title: 'Circadian Sync (8 Hrs Sleep)',
    description: 'Go to bed before 11 PM and secure 8 hours of restorative sleep.',
    category: 'daily',
    difficulty: 'medium',
    xpReward: 4,
    coinReward: 2,
    diamondReward: 1,
    statReward: 'Health',
    statAmount: 2,
    isCompleted: false,
    iconName: 'Moon'
  },
  {
    id: 'd_spiritual',
    title: 'Spiritual Alignment & Prayer',
    description: 'Perform your daily prayers, gratitude journaling, or devotions.',
    category: 'daily',
    difficulty: 'medium',
    xpReward: 4,
    coinReward: 2,
    diamondReward: 1,
    statReward: 'Spiritual',
    statAmount: 3,
    isCompleted: false,
    iconName: 'Flame'
  },
  {
    id: 'd_coldshower',
    title: 'Cold Exposure (2m Cold Shower)',
    description: 'Overcome immediate friction and boost dopamine receptors.',
    category: 'daily',
    difficulty: 'medium',
    xpReward: 4,
    coinReward: 2,
    diamondReward: 1,
    statReward: 'Confidence',
    statAmount: 2,
    isCompleted: false,
    iconName: 'Zap'
  },

  // Weekly Quests
  {
    id: 'w_finance',
    title: 'Financial Audit & Budget Review',
    description: 'Review weekly expenses, savings rate, and investment strategy.',
    category: 'weekly',
    difficulty: 'hard',
    xpReward: 15,
    coinReward: 5,
    diamondReward: 2,
    statReward: 'Finance',
    statAmount: 5,
    isCompleted: false,
    iconName: 'Coins'
  },
  {
    id: 'w_networking',
    title: 'High-Value Communication',
    description: 'Initiate 3 meaningful professional or mentorship conversations.',
    category: 'weekly',
    difficulty: 'hard',
    xpReward: 15,
    coinReward: 5,
    diamondReward: 2,
    statReward: 'Communication',
    statAmount: 5,
    isCompleted: false,
    iconName: 'MessageSquare'
  },
  {
    id: 'w_creativity',
    title: 'Creative Output Build',
    description: 'Ship or publish 1 original piece of code, writing, or design.',
    category: 'weekly',
    difficulty: 'legendary',
    xpReward: 25,
    coinReward: 8,
    diamondReward: 3,
    statReward: 'Creativity',
    statAmount: 6,
    isCompleted: false,
    iconName: 'Palette'
  },

  // Monthly Quests
  {
    id: 'm_leadership',
    title: 'Lead a Major Initiative',
    description: 'Organize or lead a team project, event, or community campaign.',
    category: 'monthly',
    difficulty: 'legendary',
    xpReward: 40,
    coinReward: 15,
    diamondReward: 5,
    statReward: 'Leadership',
    statAmount: 10,
    isCompleted: false,
    iconName: 'Shield'
  },

  // Epic Quests
  {
    id: 'e_7day_streak',
    title: 'The Discipline Titan (7-Day Streak)',
    description: 'Maintain 100% daily mission execution for 7 consecutive days.',
    category: 'epic',
    difficulty: 'legendary',
    xpReward: 30,
    coinReward: 10,
    diamondReward: 5,
    statReward: 'Mindset',
    statAmount: 15,
    isCompleted: false,
    iconName: 'Trophy'
  }
];

export const BOSS_CATALOG: BossState[] = [
  {
    id: 'boss_belphegor',
    name: 'BELPHEGOR THE SLOTH DEMON',
    title: 'Lord of Procrastination & Dopamine Decay',
    description: 'Feeds on skipped workouts, uncompleted daily missions, and mindless scrolling. Strike him down with real discipline!',
    currentHp: 2500,
    maxHp: 2500,
    minLevel: 5,
    level: 1,
    rewardCoins: 80,
    rewardDiamonds: 10,
    rewardXp: 100,
    defeated: false,
    weaknessStat: 'Focus',
    avatarUrl: bossBelphegorImg,
    rage: 0,
    bossAttackPower: 35,
    defense: 25
  },
  {
    id: 'boss_aamon',
    name: 'AAMON THE SHADOW TYRANT',
    title: 'Sovereign of Excuses & Weak Will',
    description: 'A terrifying void knight that paralyzes hunters with self-doubt and mental fatigue. Unlocks at Level 10.',
    currentHp: 7500,
    maxHp: 7500,
    minLevel: 10,
    level: 2,
    rewardCoins: 200,
    rewardDiamonds: 25,
    rewardXp: 300,
    defeated: false,
    weaknessStat: 'Strength',
    avatarUrl: bossAamonImg,
    rage: 0,
    bossAttackPower: 65,
    defense: 50
  },
  {
    id: 'boss_mammon',
    name: 'MAMMON THE GREED COLOSSUS',
    title: 'Titan of Material Distraction & Impulse',
    description: 'A colossal lava entity forged from financial imprudence and short-term thrill. Unlocks at Level 20.',
    currentHp: 20000,
    maxHp: 20000,
    minLevel: 20,
    level: 3,
    rewardCoins: 500,
    rewardDiamonds: 60,
    rewardXp: 800,
    defeated: false,
    weaknessStat: 'Finance',
    avatarUrl: bossMammonImg,
    rage: 0,
    bossAttackPower: 120,
    defense: 90
  },
  {
    id: 'boss_leviathan',
    name: 'LEVIATHAN THE ENVY ABYSS',
    title: 'Emperor of Comparison & Toxic Stagnation',
    description: 'Emerges from the dark sea of envy to corrode Hunter confidence. Requires relentless mindset mastery. Unlocks at Level 35.',
    currentHp: 50000,
    maxHp: 50000,
    minLevel: 35,
    level: 4,
    rewardCoins: 1200,
    rewardDiamonds: 120,
    rewardXp: 2000,
    defeated: false,
    weaknessStat: 'Mindset',
    avatarUrl: bossAamonImg, // Fallback dark fantasy artwork
    rage: 0,
    bossAttackPower: 220,
    defense: 150
  },
  {
    id: 'boss_asmodeus',
    name: 'ASMODEUS THE CHAOS HARBINGER',
    title: 'Archdemon of Instant Gratification',
    description: 'Commands relentless temptations that dismantle long-term momentum. Unlocks at Level 50.',
    currentHp: 120000,
    maxHp: 120000,
    minLevel: 50,
    level: 5,
    rewardCoins: 3000,
    rewardDiamonds: 300,
    rewardXp: 5000,
    defeated: false,
    weaknessStat: 'Leadership',
    avatarUrl: bossBelphegorImg, // Fallback dark fantasy artwork
    rage: 0,
    bossAttackPower: 400,
    defense: 250
  },
  {
    id: 'boss_lucifer',
    name: 'LUCIFER THE SHADOW MONARCH',
    title: 'Absolute Supreme Sovereign of Darkness',
    description: 'The ultimate endgame raid boss in CRUX. Unlocked only for hunters reaching Level 100. Defeat him to ascend as Shadow Monarch!',
    currentHp: 500000,
    maxHp: 500000,
    minLevel: 100,
    level: 6,
    rewardCoins: 10000,
    rewardDiamonds: 1000,
    rewardXp: 20000,
    defeated: false,
    weaknessStat: 'Spiritual',
    avatarUrl: bossLuciferImg,
    rage: 0,
    bossAttackPower: 1000,
    defense: 500
  }
];

export const INITIAL_BOSS: BossState = BOSS_CATALOG[0];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_blood',
    title: 'First Blood',
    description: 'Complete your first real-life mission.',
    icon: 'Swords',
    category: 'habits',
    targetValue: 1,
    currentValue: 0,
    isUnlocked: false,
    rewardCoins: 15,
    rewardDiamonds: 2
  },
  {
    id: 'ach_level_5',
    title: 'Emerging Hunter',
    description: 'Reach Level 5 in CRUX.',
    icon: 'Crown',
    category: 'level',
    targetValue: 5,
    currentValue: 1,
    isUnlocked: false,
    rewardCoins: 40,
    rewardDiamonds: 5
  },
  {
    id: 'ach_streak_3',
    title: 'Iron Resolve',
    description: 'Maintain a 3-day discipline streak.',
    icon: 'Flame',
    category: 'streak',
    targetValue: 3,
    currentValue: 0,
    isUnlocked: false,
    rewardCoins: 25,
    rewardDiamonds: 3
  },
  {
    id: 'ach_boss_slayer',
    title: 'Demon Slayer',
    description: 'Defeat a weekly raid boss in CRUX.',
    icon: 'Skull',
    category: 'boss',
    targetValue: 1,
    currentValue: 0,
    isUnlocked: false,
    rewardCoins: 100,
    rewardDiamonds: 10
  }
];

