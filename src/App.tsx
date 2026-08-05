import React, { useState, useEffect, useCallback, useRef, lazy, Suspense, useMemo } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Quest, BossState, ActivityLog, HunterClass, Routine, Weekday } from './types';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { authService, AuthUser } from './services/authService';
import { Navbar } from './components/Navbar';
import { CinematicRegistrationSequence } from './components/CinematicRegistrationSequence';
import { CinematicBootSequence } from './components/CinematicBootSequence';
import { MilestoneModal, MilestoneType } from './components/MilestoneModal';
import { PromotionCeremonyModal } from './components/PromotionCeremonyModal';
import { RankType } from './types';

const AuthScreen = lazy(() => import('./components/AuthScreen').then((module) => ({ default: module.AuthScreen })));
const DashboardView = lazy(() => import('./components/DashboardView').then((module) => ({ default: module.DashboardView })));
const QuestsView = lazy(() => import('./components/QuestsView').then((module) => ({ default: module.QuestsView })));
const BossRaidView = lazy(() => import('./components/BossRaidView').then((module) => ({ default: module.BossRaidView })));
const CharacterSheetView = lazy(() => import('./components/CharacterSheetView').then((module) => ({ default: module.CharacterSheetView })));
const StatsAnalyticsView = lazy(() => import('./components/StatsAnalyticsView').then((module) => ({ default: module.StatsAnalyticsView })));
const ShopEconomyView = lazy(() => import('./components/ShopEconomyView').then((module) => ({ default: module.ShopEconomyView })));
const LeaderboardView = lazy(() => import('./components/LeaderboardView').then((module) => ({ default: module.LeaderboardView })));
const AICoachDrawer = lazy(() => import('./components/AICoachDrawer').then((module) => ({ default: module.AICoachDrawer })));
const SupabaseModal = lazy(() => import('./components/SupabaseModal').then((module) => ({ default: module.SupabaseModal })));

export default function App() {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingCinematicUser, setPendingCinematicUser] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [boss, setBoss] = useState<BossState | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);


  // Major Milestone Modal state
  const [milestone, setMilestone] = useState<{
    type: MilestoneType;
    title: string;
    subtitle: string;
    detailText?: string;
    rewardText?: string;
  } | null>(null);

  // Hunter Promotion Ceremony state
  const [promotion, setPromotion] = useState<{ prevRank: RankType; newRank: RankType } | null>(null);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCoachOpen, setIsCoachOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('crux_interface_sounds_enabled') === 'true';
  });
  const [isBooting, setIsBooting] = useState<boolean>(false);
  const [isAuthTransitioning, setIsAuthTransitioning] = useState<boolean>(false);

  // Sync soundEnabled with audioService and localStorage
  useEffect(() => {
    audioService.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  // Helper: Load account data isolated by userId
  const handleLoadUserAccount = useCallback(async (activeAuth: AuthUser, isNew: boolean, eventName?: string) => {
    setAuthUser(activeAuth);

    let profile = storageService.getUserProfile(activeAuth.id);

    if (isNew || !profile) {
      profile = storageService.createCharacter(activeAuth.hunterName, activeAuth.classTitle, activeAuth.id);
      setPendingCinematicUser(profile);
    } else {
      // Midnight Reset Check & Routine Sync
      const resetRes = storageService.checkAndRunMidnightReset(activeAuth.id);
      profile = resetRes.profile;
      setUser(profile);
    }

    const syncedGoals = await storageService.loadQuestsFromSupabase(activeAuth.id);
    setQuests(syncedGoals);
    setRoutines(storageService.getRoutines(activeAuth.id));
    setBoss(storageService.getBossState(activeAuth.id));
    setLogs(storageService.getActivityLogs(activeAuth.id));
  }, []);

  const handleLoadUserAccountRef = useRef(handleLoadUserAccount);
  useEffect(() => {
    handleLoadUserAccountRef.current = handleLoadUserAccount;
  }, [handleLoadUserAccount]);

  // Initialize session & Auth listener on mount
  useEffect(() => {
    let isMounted = true;
    let isInitCompleted = false;
    const initAuth = async () => {
      setAuthLoading(true);
      try {
        const active = await authService.getSessionUser();
        if (isMounted) {
          if (active) {
            await handleLoadUserAccountRef.current(active, false, "INIT_AUTH");
          } else {
            setAuthUser(null);
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setAuthUser(null);
          setUser(null);
        }
      } finally {
        isInitCompleted = true;
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    const { data } = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_OUT' || !session) {
        setAuthUser(null);
        setUser(null);
        return;
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        const verified = await authService.getSessionUser();
        if (!verified) {
          setAuthUser(null);
          setUser(null);
          return;
        }

        await handleLoadUserAccountRef.current(verified, false, event);
      }
    });

    return () => {
      isMounted = false;
      if (data?.subscription) {
        data.subscription.unsubscribe();
      }
    };
  }, []);

  const handleAuthSuccess = useCallback(async (authenticatedUser: AuthUser, isNew: boolean) => {
    setIsAuthTransitioning(true);

    const sessionUser = await authService.getSessionUser();
    const activeUser = sessionUser || authenticatedUser;
    if (!activeUser || !activeUser.id) {
      setAuthUser(null);
      setUser(null);
      setIsAuthTransitioning(false);
      return;
    }

    if (!isNew) {
      setIsBooting(true);
    }

    await handleLoadUserAccount(activeUser, isNew, 'AUTH_SUCCESS');
    setIsAuthTransitioning(false);
  }, [handleLoadUserAccount]);

  const handleLogout = useCallback(async () => {
    await authService.signOut();
    setAuthUser(null);
    setUser(null);
    setPendingCinematicUser(null);
    setQuests([]);
    setBoss(null);
    setLogs([]);
  }, []);

  const handleToggleQuest = useCallback((questId: string) => {
    if (!user || !authUser) return;
    try {
      // Toggle completion with full anti-cheat rollback support (<1ms)
      const result = storageService.toggleQuestCompletion(questId, authUser.id);
      setUser({ ...result.profile });
      setQuests(storageService.getQuests(authUser.id));
      setBoss(storageService.getBossState(authUser.id));
      setLogs(storageService.getActivityLogs(authUser.id));

      // MAJOR MILESTONE CHECK ONLY ON COMPLETION
      if (result.isCompleted) {
        if (result.leveledUp) {
          setMilestone({
            type: 'level_up',
            title: `LEVEL ${result.profile.level} ATTAINED!`,
            subtitle: `Congratulations ${result.profile.hunterName}, your power limits have expanded!`,
            detailText: `New Level: ${result.profile.level} | Max Energy Refilled | Attribute Power Increased`,
            rewardText: `+1 Level Attribute Point & Full Energy Refill`
          });
        } else if (result.newRank && result.prevRank && result.newRank !== result.prevRank) {
          setPromotion({ prevRank: result.prevRank, newRank: result.newRank });
        } else if (result.bossDefeatedNow) {
          setMilestone({
            type: 'boss_defeated',
            title: `WEEKLY RAID BOSS VANQUISHED!`,
            subtitle: `You delivered the decisive blow and defeated the Raid Boss!`,
            rewardText: `+500 Coins & +50 System Diamonds`
          });
        } else if (result.profile.streak === 30 || result.profile.streak === 100) {
          setMilestone({
            type: result.profile.streak === 100 ? 'streak_100' : 'streak_30',
            title: `${result.profile.streak}-DAY DISCIPLINE STREAK!`,
            subtitle: `Unshakable consistency achieved across ${result.profile.streak} consecutive days!`,
            rewardText: `Legendary Streak Title & +300 System Coins`
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [user, authUser]);

  const handleAddCustomQuestWithAI = useCallback((title: string) => {
    if (!authUser) return;
    storageService.addCustomQuestWithAI(title, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleAddRoutine = useCallback((title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[]) => {
    if (!authUser) return;
    storageService.addRoutine(title, days, authUser.id);
    setRoutines(storageService.getRoutines(authUser.id));
  }, [authUser]);

  const handleUpdateRoutine = useCallback((id: string, title: string, days: ('daily' | 'weekdays' | 'weekends' | Weekday)[]) => {
    if (!authUser) return;
    storageService.updateRoutine(id, title, days, authUser.id);
    setRoutines(storageService.getRoutines(authUser.id));
  }, [authUser]);

  const handleDeleteRoutine = useCallback((id: string) => {
    if (!authUser) return;
    storageService.deleteRoutine(id, authUser.id);
    setRoutines(storageService.getRoutines(authUser.id));
  }, [authUser]);

  const handleToggleRoutineEnabled = useCallback((id: string) => {
    if (!authUser) return;
    storageService.toggleRoutineEnabled(id, authUser.id);
    setRoutines(storageService.getRoutines(authUser.id));
  }, [authUser]);

  const handleDuplicateRoutine = useCallback((id: string) => {
    if (!authUser) return;
    storageService.duplicateRoutine(id, authUser.id);
    setRoutines(storageService.getRoutines(authUser.id));
  }, [authUser]);

  const handleManualResetToday = useCallback(() => {
    if (!authUser) return;
    const profile = storageService.getUserProfile(authUser.id);
    if (profile) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      profile.lastResetDate = yesterday;
      storageService.saveUserProfile(profile, authUser.id);
      const res = storageService.checkAndRunMidnightReset(authUser.id);
      setUser({ ...res.profile });
      setQuests(res.quests);
      setRoutines(storageService.getRoutines(authUser.id));
      setBoss(storageService.getBossState(authUser.id));
      setLogs(storageService.getActivityLogs(authUser.id));
    }
  }, [authUser]);

  const handleAddCustomQuest = useCallback((newQuestData: Partial<Quest>) => {
    if (!authUser) return;
    storageService.addCustomQuest(newQuestData, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleUpdateCustomQuest = useCallback((questId: string, updatedData: Partial<Quest>) => {
    if (!authUser) return;
    storageService.updateCustomQuest(questId, updatedData, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleEditCustomQuest = useCallback((questId: string, updatedData: Partial<Quest>) => {
    if (!authUser) return;
    storageService.updateCustomQuest(questId, updatedData, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleDeleteCustomQuest = useCallback((questId: string) => {
    if (!authUser) return;
    const confirmed = window.confirm('Delete this goal permanently? This action cannot be undone.');
    if (!confirmed) return;
    storageService.deleteCustomQuest(questId, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleDuplicateCustomQuest = useCallback((questId: string) => {
    if (!authUser) return;
    storageService.duplicateCustomQuest(questId, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleArchiveCustomQuest = useCallback((questId: string, isArchived: boolean) => {
    if (!authUser) return;
    storageService.archiveCustomQuest(questId, isArchived, authUser.id);
    setQuests(storageService.getQuests(authUser.id));
  }, [authUser]);

  const handleAttackBoss = useCallback((damage: number) => {
    if (!boss || boss.defeated || !user || !authUser) return;

    const newHp = Math.max(0, boss.currentHp - damage);
    const defeatedNow = newHp === 0;
    const updatedBoss = {
      ...boss,
      currentHp: newHp,
      defeated: defeatedNow
    };

    setBoss(updatedBoss);
    storageService.saveBossState(updatedBoss, authUser.id);

    if (defeatedNow) {
      const updatedUser = {
        ...user,
        coins: user.coins + boss.rewardCoins,
        diamonds: user.diamonds + boss.rewardDiamonds
      };
      setUser(updatedUser);
      storageService.saveUserProfile(updatedUser, authUser.id);

      setMilestone({
        type: 'boss_defeated',
        title: `WEEKLY RAID BOSS SLAIN!`,
        subtitle: `You completely decimated ${boss.name}!`,
        rewardText: `+${boss.rewardCoins} Coins & +${boss.rewardDiamonds} Diamonds`
      });
    }
  }, [boss, user, authUser]);

  const handleClaimLoginReward = useCallback(() => {
    if (!user || !authUser) return;
    audioService.playQuestComplete();

    const updatedUser = {
      ...user,
      coins: user.coins + 50,
      xp: user.xp + 10
    };
    setUser(updatedUser);
    storageService.saveUserProfile(updatedUser, authUser.id);
  }, [user, authUser]);

  const handleSpendCoins = useCallback((amount: number): boolean => {
    if (!user || !authUser || user.coins < amount) return false;
    const updatedUser = { ...user, coins: user.coins - amount };
    setUser(updatedUser);
    storageService.saveUserProfile(updatedUser, authUser.id);
    return true;
  }, [user, authUser]);

  const handleUnlockTitle = useCallback((title: string) => {
    if (!user || !authUser) return;
    if (!user.unlockedTitles.includes(title)) {
      const updatedUser = {
        ...user,
        unlockedTitles: [...user.unlockedTitles, title],
        activeTitle: title
      };
      setUser(updatedUser);
      storageService.saveUserProfile(updatedUser, authUser.id);
    }
  }, [user, authUser]);

  const handleSelectTitle = useCallback((title: string) => {
    if (!user || !authUser) return;
    const updatedUser = { ...user, activeTitle: title };
    setUser(updatedUser);
    storageService.saveUserProfile(updatedUser, authUser.id);
  }, [user, authUser]);

  const handleToggleSound = useCallback(() => {
    setSoundEnabled(prev => {
      const next = !prev;
      audioService.setSoundEnabled(next);
      return next;
    });
  }, []);

  const handleOpenCoach = useCallback(() => {
    setIsCoachOpen(true);
  }, []);
  const handleCloseCoach = useCallback(() => {
    setIsCoachOpen(false);
  }, []);
  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleBootComplete = useCallback(() => setIsBooting(false), []);

  const dashboardBoss = useMemo(() => {
    if (boss) return boss;
    return authUser ? storageService.getBossState(authUser.id) : null;
  }, [boss, authUser]);

  // Render loading screen during initial authentication check
  if (authLoading || isAuthTransitioning) {
    return (
      <div className="min-h-screen bg-[#03060c] text-white flex items-center justify-center p-4">
        <div className="text-center font-mono">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-cyan-400 tracking-widest uppercase">
            {isAuthTransitioning ? 'SECURING HUNTER SESSION...' : 'AUTHENTICATING HUNTER SESSION...'}
          </p>
        </div>
      </div>
    );
  }

  // If not authenticated, render Supabase Auth Screen
  if (!authUser) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#03060c] text-white flex items-center justify-center p-4"><div className="text-center font-mono"><div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-xs text-cyan-400 tracking-widest uppercase">LOADING AUTH SCREEN...</p></div></div>}>
        <AuthScreen onAuthSuccess={handleAuthSuccess} />
      </Suspense>
    );
  }

  // First-time account created cinematic registration experience
  if (pendingCinematicUser) {
    return (
      <CinematicRegistrationSequence
        userProfile={pendingCinematicUser}
        onEnterApp={() => {
          setUser(pendingCinematicUser);
          setPendingCinematicUser(null);
          setIsBooting(true);
        }}
      />
    );
  }

  // Cinematic system boot sequence
  if (isBooting) {
    return (
      <CinematicBootSequence
        hunterName={authUser?.hunterName || 'Hunter'}
        onBootComplete={handleBootComplete}
      />
    );
  }

  // Loading fallback
  if (!user) {
    return (
      <div className="h-full w-full bg-[#03060c] text-white flex items-center justify-center p-4">
        <div className="text-center font-mono">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-cyan-400 tracking-widest uppercase">INITIALIZING HUNTER PROFILE...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="relative h-full w-full overflow-hidden bg-[linear-gradient(180deg,#05070d_0%,#070b13_100%)] text-[#e9eef7] selection:bg-cyan-500/25 flex flex-col"
    >
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute left-[-12%] top-[-10%] h-[380px] w-[380px] rounded-full bg-violet-500/8 blur-[110px]" />
        <div className="absolute bottom-[-8%] right-[-10%] h-[340px] w-[340px] rounded-full bg-cyan-500/8 blur-[100px]" />
      </div>

      {/* Navigation HUD */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCoach={handleOpenCoach}
        onOpenSettings={handleOpenSettings}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onLogout={handleLogout}
      />

      {/* Main Content Workspace */}
      <main className="relative z-10 flex-1 min-h-0 w-full max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20 md:pb-6 overflow-y-auto scrollbar-thin">
        <Suspense fallback={<div className="h-full w-full flex items-center justify-center py-12 text-cyan-400 font-mono text-xs uppercase tracking-[0.3em]">Loading workspace...</div>}>
          {activeTab === 'dashboard' && (
            <DashboardView
              user={user}
              quests={quests}
              boss={dashboardBoss}
              logs={logs}
              onCompleteQuest={handleToggleQuest}
              onNavigateTab={setActiveTab}
              onOpenCoach={handleOpenCoach}
              onClaimLoginReward={handleClaimLoginReward}
            />
          )}

          {activeTab === 'quests' && (
            <QuestsView
              quests={quests}
              routines={routines}
              userLevel={user.level}
              onToggleQuest={handleToggleQuest}
              onAddCustomQuestWithAI={handleAddCustomQuestWithAI}
              onAddRoutine={handleAddRoutine}
              onUpdateRoutine={handleUpdateRoutine}
              onDeleteRoutine={handleDeleteRoutine}
              onToggleRoutineEnabled={handleToggleRoutineEnabled}
              onDuplicateRoutine={handleDuplicateRoutine}
              onEditCustomQuest={handleEditCustomQuest}
              onDeleteCustomQuest={handleDeleteCustomQuest}
              onDuplicateCustomQuest={handleDuplicateCustomQuest}
              onArchiveCustomQuest={handleArchiveCustomQuest}
              onManualResetToday={handleManualResetToday}
            />
          )}

          {activeTab === 'boss' && boss && (
            <BossRaidView
              boss={boss}
              user={user}
              onAttackBoss={handleAttackBoss}
              onNavigateQuests={() => setActiveTab('quests')}
            />
          )}

          {activeTab === 'character' && (
            <CharacterSheetView
              user={user}
              onSelectTitle={handleSelectTitle}
            />
          )}

          {activeTab === 'analytics' && (
            <StatsAnalyticsView
              user={user}
              logs={logs}
            />
          )}

          {activeTab === 'shop' && (
            <ShopEconomyView
              user={user}
              onSpendCoins={handleSpendCoins}
              onUnlockTitle={handleUnlockTitle}
            />
          )}

          {activeTab === 'leaderboard' && (
            <LeaderboardView
              user={user}
            />
          )}
        </Suspense>
      </main>

      {/* Major Milestone Modal (Only for Level Up, Rank Up, Boss Slay, 30/100 Day Streaks) */}
      {milestone && (
        <MilestoneModal
          type={milestone.type}
          title={milestone.title}
          subtitle={milestone.subtitle}
          detailText={milestone.detailText}
          rewardText={milestone.rewardText}
          onClose={() => setMilestone(null)}
        />
      )}

      {/* Hunter Promotion Ceremony Modal */}
      {promotion && user && (
        <PromotionCeremonyModal
          isOpen={!!promotion}
          prevRank={promotion.prevRank}
          newRank={promotion.newRank}
          user={user}
          onClose={() => setPromotion(null)}
        />
      )}

      {/* Gemini AI Mentor Drawer */}
      <Suspense fallback={null}>
        <AICoachDrawer
          isOpen={isCoachOpen}
          onClose={handleCloseCoach}
          user={user}
          logs={logs}
          bossState={boss || undefined}
          onAddSuggestedQuest={handleAddCustomQuest}
        />
      </Suspense>

      {/* Settings / Supabase Modal */}
      <Suspense fallback={null}>
        <SupabaseModal
          isOpen={isSettingsOpen}
          onClose={handleCloseSettings}
          userId={authUser?.id}
          onReloadState={() => {
            if (authUser) {
              setUser(storageService.getUserProfile(authUser.id));
              setQuests(storageService.getQuests(authUser.id));
              setBoss(storageService.getBossState(authUser.id));
              setLogs(storageService.getActivityLogs(authUser.id));
            }
          }}
        />
      </Suspense>
    </motion.div>
  );
}
