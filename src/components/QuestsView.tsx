import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Quest, 
  QuestCategory, 
  Attributes,
  Routine,
  Weekday
} from '../types';
import { analyzeMissionName, AIMissionAnalysis } from '../services/aiMissionAnalyzer';
import { audioService } from '../services/audioService';
import { 
  Swords, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Calendar, 
  X, 
  Target, 
  Edit3, 
  Copy, 
  Trash2, 
  Archive, 
  Clock, 
  Search, 
  RotateCcw, 
  Zap, 
  Dumbbell,
  BookOpen,
  Briefcase,
  Code,
  Heart,
  Activity,
  DollarSign,
  Flame,
  Droplet,
  Coins,
  Shield,
  Layers,
  Power,
  RefreshCw,
  Check,
  ChevronRight
} from 'lucide-react';

interface Props {
  quests: Quest[];
  routines?: Routine[];
  userLevel?: number;
  onToggleQuest: (questId: string) => void;
  onAddCustomQuestWithAI?: (title: string) => void;
  onAddRoutine?: (title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[]) => void;
  onUpdateRoutine?: (id: string, title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[]) => void;
  onDeleteRoutine?: (id: string) => void;
  onToggleRoutineEnabled?: (id: string) => void;
  onDuplicateRoutine?: (id: string) => void;
  onDeleteCustomQuest: (questId: string) => void;
  onDuplicateCustomQuest: (questId: string) => void;
  onArchiveCustomQuest: (questId: string, isArchived: boolean) => void;
  onManualResetToday?: () => void;
}

const ALL_CATEGORIES: { id: QuestCategory; label: string; icon: any; color: string }[] = [
  { id: 'daily', label: 'Daily Protocol', icon: Swords, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' },
  { id: 'weekly', label: 'Weekly Sprint', icon: Calendar, color: 'text-purple-400 bg-purple-950/40 border-purple-800/40' },
  { id: 'Fitness', label: 'Fitness', icon: Dumbbell, color: 'text-red-400 bg-red-950/40 border-red-800/40' },
  { id: 'Study', label: 'Study', icon: BookOpen, color: 'text-blue-400 bg-blue-950/40 border-blue-800/40' },
  { id: 'Work', label: 'Work', icon: Briefcase, color: 'text-amber-400 bg-amber-950/40 border-amber-800/40' },
  { id: 'Coding', label: 'Coding', icon: Code, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800/40' },
  { id: 'Religion', label: 'Religion', icon: Sparkles, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40' },
  { id: 'Meditation', label: 'Meditation', icon: Heart, color: 'text-pink-400 bg-pink-950/40 border-pink-800/40' },
  { id: 'Health', label: 'Health', icon: Activity, color: 'text-teal-400 bg-teal-950/40 border-teal-800/40' },
  { id: 'Finance', label: 'Finance', icon: DollarSign, color: 'text-green-400 bg-green-950/40 border-green-800/40' },
  { id: 'Custom', label: 'Custom', icon: Target, color: 'text-violet-400 bg-violet-950/40 border-violet-800/40' },
];

const WEEKDAY_OPTIONS: { id: 'daily' | 'weekdays' | 'weekends' | Weekday; label: string; short: string }[] = [
  { id: 'daily', label: 'Everyday', short: 'DAILY' },
  { id: 'weekdays', label: 'Mon-Fri', short: 'WKDAYS' },
  { id: 'weekends', label: 'Sat-Sun', short: 'WKENDS' },
  { id: 'mon', label: 'Monday', short: 'MON' },
  { id: 'tue', label: 'Tuesday', short: 'TUE' },
  { id: 'wed', label: 'Wednesday', short: 'WED' },
  { id: 'thu', label: 'Thursday', short: 'THU' },
  { id: 'fri', label: 'Friday', short: 'FRI' },
  { id: 'sat', label: 'Saturday', short: 'SAT' },
  { id: 'sun', label: 'Sunday', short: 'SUN' },
];

const QUICK_EXAMPLES = [
  'Push Workout',
  'Read Atomic Habits',
  'LeetCode Practice',
  'Quran Study',
  'Morning Run',
  'Meditation',
  'Drink Water'
];

export const QuestsView: React.FC<Props> = React.memo(({
  quests,
  routines = [],
  userLevel = 1,
  onToggleQuest,
  onAddCustomQuestWithAI,
  onAddRoutine,
  onUpdateRoutine,
  onDeleteRoutine,
  onToggleRoutineEnabled,
  onDuplicateRoutine,
  onDeleteCustomQuest,
  onDuplicateCustomQuest,
  onArchiveCustomQuest,
  onManualResetToday
}) => {
  // Main view switcher: 'active_missions' | 'my_routines'
  const [activeTab, setActiveTab] = useState<'active_missions' | 'my_routines'>('active_missions');

  // Search & Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'history'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1-Input AI Mission Creator State
  const [aiInputTitle, setAiInputTitle] = useState<string>('');
  const [isSubmittingAi, setIsSubmittingAi] = useState<boolean>(false);
  const aiInputRef = useRef<HTMLInputElement | null>(null);

  // Live AI Analysis calculation
  const liveAnalysis: AIMissionAnalysis | null = useMemo(() => {
    if (!aiInputTitle.trim()) return null;
    return analyzeMissionName(aiInputTitle);
  }, [aiInputTitle]);

  // Routine Creator Modal State
  const [showRoutineModal, setShowRoutineModal] = useState<boolean>(false);
  const [editingRoutineId, setEditingRoutineId] = useState<string | null>(null);
  const [routineTitle, setRoutineTitle] = useState<string>('');
  const [selectedDays, setSelectedDays] = useState<('daily' | 'weekdays' | 'weekends' | Weekday)[]>(['daily']);

  // Floating particles feedback
  const [floatingParticles, setFloatingParticles] = useState<{ id: number; x: number; y: number; text: string; isUndo?: boolean }[]>([]);
  const [recentGlowId, setRecentGlowId] = useState<string | null>(null);

  // Handle single-input AI Mission Creation
  const handleCreateMissionWithAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInputTitle.trim()) return;

    setIsSubmittingAi(true);
    audioService.playQuestComplete();

    if (onAddCustomQuestWithAI) {
      onAddCustomQuestWithAI(aiInputTitle.trim());
    }

    setAiInputTitle('');
    setTimeout(() => setIsSubmittingAi(false), 200);
  };

  // Routine Modal Submit
  const handleRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routineTitle.trim() || selectedDays.length === 0) return;

    if (editingRoutineId && onUpdateRoutine) {
      onUpdateRoutine(editingRoutineId, routineTitle.trim(), selectedDays);
    } else if (onAddRoutine) {
      onAddRoutine(routineTitle.trim(), selectedDays);
    }

    setShowRoutineModal(false);
    setRoutineTitle('');
    setSelectedDays(['daily']);
    setEditingRoutineId(null);
  };

  const handleOpenEditRoutine = (routine: Routine) => {
    setEditingRoutineId(routine.id);
    setRoutineTitle(routine.title);
    setSelectedDays(routine.days);
    setShowRoutineModal(true);
  };

  const toggleDaySelection = (dayId: 'daily' | 'weekdays' | 'weekends' | Weekday) => {
    if (dayId === 'daily') {
      setSelectedDays(['daily']);
      return;
    }

    let updated: ('daily' | 'weekdays' | 'weekends' | Weekday)[] = selectedDays.filter(d => d !== 'daily');
    if (updated.includes(dayId)) {
      updated = updated.filter(d => d !== dayId);
    } else {
      updated.push(dayId);
    }

    if (updated.length === 0) updated = ['daily'];
    setSelectedDays(updated);
  };

  // Toggle Quest Completion (Instant Execution / Undo)
  const handleCheckClick = (e: React.MouseEvent, quest: Quest) => {
    e.stopPropagation();
    const isUndoing = quest.isCompleted;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(isUndoing ? 15 : 8); } catch (err) {}
    }

    if (isUndoing) {
      audioService.playPenalty();
    } else {
      audioService.playQuestComplete();
    }

    setRecentGlowId(quest.id);
    setTimeout(() => setRecentGlowId(null), 350);

    const clickX = e.clientX;
    const clickY = e.clientY;
    if (clickX && clickY) {
      const particle = {
        id: Date.now() + Math.random(),
        x: clickX,
        y: clickY - 20,
        text: isUndoing ? `UNDONE (-${quest.xpReward} XP)` : `+${quest.xpReward} XP`,
        isUndo: isUndoing,
      };
      setFloatingParticles(prev => [...prev, particle]);
      setTimeout(() => {
        setFloatingParticles(prev => prev.filter(p => p.id !== particle.id));
      }, 500);
    }

    onToggleQuest(quest.id);
  };

  // Filtered Quests calculation
  const filteredQuests = useMemo(() => {
    return quests.filter(q => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const titleMatch = q.title.toLowerCase().includes(query);
        const descMatch = (q.description || '').toLowerCase().includes(query);
        const catMatch = q.category.toLowerCase().includes(query);
        if (!titleMatch && !descMatch && !catMatch) return false;
      }

      if (selectedCategory !== 'all' && q.category !== selectedCategory) {
        return false;
      }

      if (statusFilter === 'active') {
        return !q.isArchived && !q.isCompleted;
      }
      if (statusFilter === 'completed') {
        return !q.isArchived && q.isCompleted;
      }
      if (statusFilter === 'history') {
        return q.isCompleted;
      }
      return !q.isArchived;
    });
  }, [quests, searchQuery, selectedCategory, statusFilter]);

  // Stats Counters
  const totalActive = quests.filter(q => !q.isArchived && !q.isCompleted).length;
  const completedTodayCount = quests.filter(q => q.isCompleted).length;

  return (
    <div className="space-y-6 pb-20 relative">
      {/* Floating XP / Undo Particles */}
      <AnimatePresence>
        {floatingParticles.map((p) => (
          <motion.div
            key={`p_${p.id}`}
            initial={{ opacity: 0.9, y: 0, scale: 0.9 }}
            animate={{ opacity: 0, y: -30, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={`fixed z-50 pointer-events-none font-mono font-bold text-xs px-3 py-1 rounded-full border shadow-lg backdrop-blur-md ${
              p.isUndo 
                ? 'text-red-300 bg-red-950/90 border-red-500/40 shadow-red-500/20' 
                : 'text-cyan-300 bg-cyan-950/90 border-cyan-500/40 shadow-cyan-500/20'
            }`}
            style={{ left: p.x - 40, top: p.y - 15 }}
          >
            {p.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* TOP AI MISSION CREATOR CARD (SINGLE INPUT ONLY) */}
      <div className="bg-[#0b0e1e] border border-cyan-500/40 rounded-2xl p-5 md:p-6 shadow-[0_0_30px_rgba(0,240,255,0.12)] relative overflow-hidden">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.3)]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2">
                CRUX AI MISSION ENGINE
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Just type what you want to achieve. CRUX automatically calculates difficulty, time & RPG rewards.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            {onManualResetToday && (
              <button
                onClick={onManualResetToday}
                title="Trigger 12:00 AM Midnight Reset Test"
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 font-mono text-[11px] flex items-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                Trigger Midnight Reset
              </button>
            )}
          </div>
        </div>

        {/* 1-INPUT FORM */}
        <form onSubmit={handleCreateMissionWithAI} className="space-y-3">
          <div className="relative">
            <input
              ref={aiInputRef}
              type="text"
              value={aiInputTitle}
              onChange={(e) => setAiInputTitle(e.target.value)}
              placeholder="Type mission (e.g. Push Workout, Read Atomic Habits, LeetCode Practice)..."
              className="w-full bg-[#12162d] border-2 border-cyan-500/50 focus:border-cyan-400 rounded-2xl py-4 pl-5 pr-36 text-white text-base font-sans placeholder-slate-500 outline-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] transition"
            />

            <button
              type="submit"
              disabled={!aiInputTitle.trim() || isSubmittingAi}
              className={`absolute right-2 top-2 bottom-2 px-5 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
                aiInputTitle.trim()
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-300" />
              CRUX THINK
            </button>
          </div>

          {/* Quick Fill Preset Pills */}
          {!aiInputTitle && (
            <div className="flex items-center gap-2 flex-wrap text-xs font-mono pt-1">
              <span className="text-slate-500 text-[11px]">Quick presets:</span>
              {QUICK_EXAMPLES.map((ex) => (
                <button
                  key={`ex_${ex}`}
                  type="button"
                  onClick={() => {
                    setAiInputTitle(ex);
                    aiInputRef.current?.focus();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-[#12162a] hover:bg-cyan-950/80 text-slate-400 hover:text-cyan-300 border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer text-[11px]"
                >
                  + {ex}
                </button>
              ))}
            </div>
          )}

          {/* LIVE SMART AI ANALYSIS PREVIEW */}
          <AnimatePresence>
            {liveAnalysis && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -5 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -5 }}
                className="bg-[#111630] border border-cyan-500/40 rounded-2xl p-4 font-mono text-xs space-y-3 shadow-xl overflow-hidden"
              >
                <div className="flex items-center justify-between text-slate-300 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-bold text-cyan-400">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    AI DEDUCTION: {liveAnalysis.title}
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-bold uppercase">
                    {liveAnalysis.missionRank}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-200">
                  <div className="bg-[#0a0d1d] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Category</span>
                    <span className="font-bold text-cyan-300 flex items-center gap-1 mt-0.5">
                      <Target className="w-3.5 h-3.5 text-cyan-400" /> {liveAnalysis.category}
                    </span>
                  </div>

                  <div className="bg-[#0a0d1d] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Difficulty</span>
                    <span className="font-bold text-amber-300 capitalize flex items-center gap-1 mt-0.5">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> {liveAnalysis.difficulty}
                    </span>
                  </div>

                  <div className="bg-[#0a0d1d] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Estimated Time</span>
                    <span className="font-bold text-indigo-300 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" /> {liveAnalysis.estimatedMinutes} mins
                    </span>
                  </div>

                  <div className="bg-[#0a0d1d] p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Stat Gain</span>
                    <span className="font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" /> +{liveAnalysis.statAmount} {liveAnalysis.statReward}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <div className="flex items-center gap-3">
                    <span className="text-cyan-400 font-bold bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800">
                      +{liveAnalysis.xpReward} XP
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-950/80 px-2.5 py-1 rounded border border-amber-800">
                      +{liveAnalysis.coinReward} Gold
                    </span>
                    <span className="text-purple-400 font-bold bg-purple-950/80 px-2.5 py-1 rounded border border-purple-800">
                      Boss Damage: {liveAnalysis.bossDamage}
                    </span>
                  </div>

                  <span className="text-slate-400 text-[10px] italic">
                    Press Enter or click CRUX THINK to register protocol
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* MAIN VIEW NAVIGATION TABS: TODAY'S MISSIONS vs MY ROUTINES */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('active_missions')}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'active_missions'
                ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/25'
                : 'bg-[#121629] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Swords className="w-4 h-4" /> TODAY'S MISSIONS ({totalActive})
          </button>

          <button
            onClick={() => setActiveTab('my_routines')}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'my_routines'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25'
                : 'bg-[#121629] text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" /> MY ROUTINES ({routines.length})
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="bg-[#12162a] border border-slate-800 px-3 py-1.5 rounded-xl font-bold text-emerald-400">
            {completedTodayCount} Completed Today
          </span>
        </div>
      </div>

      {/* TAB 1: ACTIVE TODAY'S MISSIONS */}
      {activeTab === 'active_missions' && (
        <div className="space-y-4">
          {/* Filter toolbar */}
          <div className="bg-[#0b0e1b] border border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Status filter buttons */}
              <div className="scrollable-chips w-full md:w-auto pb-1 md:pb-0 gap-2">
                {(['active', 'completed', 'all', 'history'] as const).map((st) => (
                  <button
                    key={`st_${st}`}
                    onClick={() => setStatusFilter(st)}
                    className={`scrollable-chip-item px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                        : 'bg-[#121629] text-slate-400 border border-slate-800 hover:text-white'
                    }`}
                  >
                    {st === 'history' ? '📜 Completed History' : st}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search mission title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#121629] border border-slate-800 text-slate-200 text-xs font-mono rounded-xl pl-9 pr-3 py-2 placeholder-slate-500 outline-none focus:border-cyan-500/50 transition"
                />
              </div>
            </div>

            {/* Category pills */}
            <div className="scrollable-chips pt-2 border-t border-slate-800/60 gap-2">
              <button
                onClick={(e) => {
                  setSelectedCategory('all');
                  (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`scrollable-chip-item px-3 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-[#121629] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                All
              </button>
              {ALL_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSel = selectedCategory === cat.id;
                return (
                  <button
                    key={`cat_${cat.id}`}
                    onClick={(e) => {
                      setSelectedCategory(cat.id);
                      (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                    }}
                    className={`scrollable-chip-item px-3 py-1 rounded-lg text-[11px] font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSel
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/60 shadow-md'
                        : 'bg-[#121629] text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MISSION CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredQuests.length === 0 ? (
                <div className="col-span-full bg-[#0b0e1b] border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs space-y-3">
                  <Target className="w-10 h-10 text-slate-600 mx-auto" />
                  <p>No active missions found for current filter.</p>
                  <p className="text-slate-400 text-[11px]">
                    Type a mission title above (e.g. "Push Workout") to generate one instantly!
                  </p>
                </div>
              ) : (
                filteredQuests.map((quest) => {
                  const catObj = ALL_CATEGORIES.find(c => c.id === quest.category) || ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
                  const CatIcon = catObj.icon;

                  return (
                    <motion.div
                      key={`quest_${quest.id}`}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                        recentGlowId === quest.id
                          ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(0,240,255,0.3)]'
                          : quest.isCompleted
                          ? 'bg-[#090b14]/80 border-cyan-950/40 text-slate-500 shadow-none opacity-85'
                          : 'bg-[#0d1020] border-slate-800/90 hover:border-cyan-500/40 text-white shadow-xl shadow-black/40'
                      }`}
                    >
                      <div>
                        {/* Card Header Row */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-start gap-3">
                            {/* Checkbox Button */}
                            <button
                              type="button"
                              onClick={(e) => handleCheckClick(e, quest)}
                              title={quest.isCompleted ? "Click to Undo Completion" : "Click to Complete Quest"}
                              className="mt-0.5 text-cyan-400 shrink-0 relative flex items-center justify-center focus:outline-none cursor-pointer group"
                            >
                              {quest.isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 text-cyan-400 fill-cyan-950/80 shadow-[0_0_10px_rgba(0,240,255,0.4)] group-hover:scale-110 transition" />
                              ) : (
                                <Circle className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition" />
                              )}
                            </button>

                            {/* Title */}
                            <div>
                              <span className={`font-bold text-base transition-colors ${quest.isCompleted ? 'line-through text-slate-500/80' : 'text-slate-100'}`}>
                                {quest.title}
                              </span>

                              {quest.description && (
                                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                                  {quest.description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Quick Action Toolbar */}
                          <div className="flex items-center gap-1 shrink-0 bg-[#12162a] p-1 rounded-xl border border-slate-800">
                            {quest.isCompleted ? (
                              <button
                                onClick={(e) => handleCheckClick(e, quest)}
                                title="Undo Completion"
                                className="px-2 py-1 text-[10px] font-mono font-bold text-red-300 bg-red-950/60 border border-red-800/40 rounded-lg hover:bg-red-900/60 transition cursor-pointer flex items-center gap-1"
                              >
                                <RotateCcw className="w-3 h-3" /> UNDO
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => onDuplicateCustomQuest(quest.id)}
                                  title="Duplicate Mission"
                                  className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onDeleteCustomQuest(quest.id)}
                                  title="Delete Mission"
                                  className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-mono">
                          <span className={`px-2 py-0.5 rounded-full border flex items-center gap-1 ${catObj.color}`}>
                            <CatIcon className="w-3 h-3" /> {catObj.label}
                          </span>

                          {quest.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full border uppercase ${
                              quest.difficulty === 'extreme' || quest.difficulty === 'legendary'
                                ? 'bg-red-950/80 text-red-300 border-red-800/50'
                                : quest.difficulty === 'hard'
                                ? 'bg-amber-950/80 text-amber-300 border-amber-800/50'
                                : quest.difficulty === 'medium'
                                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800/50'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}>
                              {quest.difficulty}
                            </span>
                          )}

                          {quest.estimatedMinutes && (
                            <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" /> {quest.estimatedMinutes}m
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Bottom Rewards Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono">
                        <span className="text-purple-400 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800/40 font-bold">
                          +{quest.statAmount} {quest.statReward}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                            +{quest.xpReward} XP
                          </span>
                          <span className="text-amber-400 font-bold bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/40">
                            +{quest.coinReward} Gold
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* TAB 2: MY ROUTINES (PERMANENT TEMPLATES) */}
      {activeTab === 'my_routines' && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-[#0e0c1f] border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5 z-10">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-purple-300 uppercase tracking-widest bg-purple-950/80 border border-purple-800/50 px-3 py-1 rounded-full">
                <Layers className="w-3.5 h-3.5 text-purple-400" /> PERMANENT ROUTINE MATRIX
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white tracking-wide">
                MY ROUTINES TEMPLATES
              </h2>
              <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
                Save routines once (e.g. "Monday Push Workout", "Daily Quran", "Friday Upper Body"). These never disappear. Every midnight at 12:00 AM, CRUX auto-spawns today's daily missions from active routines.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingRoutineId(null);
                setRoutineTitle('');
                setSelectedDays(['daily']);
                setShowRoutineModal(true);
              }}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:scale-105 active:scale-95 transition flex items-center gap-2 shrink-0 cursor-pointer z-10"
            >
              <Plus className="w-4 h-4" /> CREATE NEW ROUTINE
            </button>
          </div>

          {/* ROUTINES LIST GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routines.length === 0 ? (
              <div className="col-span-full bg-[#0b0e1b] border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs space-y-3">
                <Layers className="w-10 h-10 text-purple-500/50 mx-auto" />
                <p>No permanent routines saved yet.</p>
                <button
                  onClick={() => setShowRoutineModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/40 font-bold hover:bg-purple-600/30 transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Create Routine Template
                </button>
              </div>
            ) : (
              routines.map((routine) => {
                const ai = analyzeMissionName(routine.title);
                return (
                  <div
                    key={`routine_${routine.id}`}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      routine.enabled
                        ? 'bg-[#0f0d22] border-purple-500/40 text-white shadow-xl shadow-purple-950/20'
                        : 'bg-[#090b14] border-slate-800 text-slate-500 opacity-60'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-base text-white">
                              {routine.title}
                            </span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${
                              routine.enabled
                                ? 'bg-purple-950 text-purple-300 border-purple-800'
                                : 'bg-slate-900 text-slate-500 border-slate-800'
                            }`}>
                              {routine.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {routine.days.map((d) => (
                              <span
                                key={`rday_${routine.id}_${d}`}
                                className="text-[10px] font-mono uppercase bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-md font-bold"
                              >
                                {d.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Routine Controls */}
                        <div className="flex items-center gap-1 shrink-0 bg-[#12162a] p-1 rounded-xl border border-slate-800">
                          {onToggleRoutineEnabled && (
                            <button
                              onClick={() => onToggleRoutineEnabled(routine.id)}
                              title={routine.enabled ? "Disable Routine" : "Enable Routine"}
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                routine.enabled ? 'text-emerald-400 hover:bg-emerald-950/60' : 'text-slate-500 hover:bg-slate-800'
                              }`}
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditRoutine(routine)}
                            title="Edit Routine"
                            className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDuplicateRoutine && (
                            <button
                              onClick={() => onDuplicateRoutine(routine.id)}
                              title="Duplicate Routine"
                              className="p-1.5 text-slate-400 hover:text-indigo-300 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {onDeleteRoutine && (
                            <button
                              onClick={() => onDeleteRoutine(routine.id)}
                              title="Delete Routine"
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] font-mono">
                        <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 px-2 py-0.5 rounded-full">
                          {routine.category}
                        </span>
                        <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.5 rounded-full uppercase">
                          {routine.difficulty}
                        </span>
                        <span className="bg-slate-900 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-full">
                          {routine.estimatedMinutes}m
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-mono">
                      <span className="text-purple-400 font-bold">
                        +{routine.statAmount} {routine.statReward}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-cyan-400 font-bold">+{routine.xpReward} XP</span>
                        <span className="text-amber-400 font-bold">+{routine.coinReward} Gold</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* CREATE / EDIT ROUTINE MODAL */}
      <AnimatePresence>
        {showRoutineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0c0e20] border border-purple-500/50 rounded-2xl p-6 shadow-2xl text-white relative"
            >
              <button
                type="button"
                onClick={() => setShowRoutineModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-4">
                <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-400" />
                  {editingRoutineId ? 'EDIT ROUTINE TEMPLATE' : 'NEW ROUTINE TEMPLATE'}
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  CRUX AI will analyze title and automatically assign game mechanics.
                </p>
              </div>

              <form onSubmit={handleRoutineSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-300 uppercase font-bold mb-1.5">
                    Routine Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={routineTitle}
                    onChange={(e) => setRoutineTitle(e.target.value)}
                    placeholder="e.g. Monday Push Workout, Daily Quran, Friday Upper Body..."
                    className="w-full bg-[#12162a] border border-purple-500/40 rounded-xl py-3 px-3.5 text-white placeholder-slate-500 outline-none focus:border-purple-400 font-sans text-base transition"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 uppercase font-bold mb-1.5">
                    Repeat Schedule *
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {WEEKDAY_OPTIONS.map((w) => {
                      const isSel = selectedDays.includes(w.id);
                      return (
                        <button
                          key={`w_${w.id}`}
                          type="button"
                          onClick={() => toggleDaySelection(w.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                            isSel
                              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                              : 'bg-[#12162a] text-slate-400 border border-slate-800 hover:text-white'
                          }`}
                        >
                          {isSel && <Check className="w-3.5 h-3.5 text-white" />}
                          {w.short}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {routineTitle.trim() && (
                  <div className="p-3 bg-[#12162e] border border-purple-500/30 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-purple-300">Live AI Analysis preview:</div>
                    {(() => {
                      const ai = analyzeMissionName(routineTitle);
                      return (
                        <div className="text-[11px] text-slate-300 space-y-1">
                          <div>Category: <span className="text-cyan-300 font-bold">{ai.category}</span> | Difficulty: <span className="text-amber-300 font-bold">{ai.difficulty}</span> ({ai.estimatedMinutes}m)</div>
                          <div>Rewards: <span className="text-emerald-300 font-bold">+{ai.statAmount} {ai.statReward}</span> | <span className="text-cyan-300">+{ai.xpReward} XP</span> | <span className="text-amber-300">+{ai.coinReward} Gold</span></div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={!routineTitle.trim()}
                    className={`w-full py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                      routineTitle.trim()
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {editingRoutineId ? 'SAVE ROUTINE CHANGES' : 'CREATE ROUTINE TEMPLATE'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
});
