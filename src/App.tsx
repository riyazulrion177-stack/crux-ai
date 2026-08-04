import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Quest, BossState, ActivityLog, HunterClass, Routine, Weekday } from './types';
import { storageService } from './services/storageService';
import { audioService } from './services/audioService';
import { authService, AuthUser } from './services/authService';
import { Navbar } from './components/Navbar';
import { AuthScreen } from './components/AuthScreen';
import { CinematicRegistrationSequence } from './components/CinematicRegistrationSequence';
import { CinematicBootSequence } from './components/CinematicBootSequence';
import { MilestoneModal, MilestoneType } from './components/MilestoneModal';
import { DashboardView } from './components/DashboardView';
import { QuestsView } from './components/QuestsView';
import { BossRaidView } from './components/BossRaidView';
import { CharacterSheetView } from './components/CharacterSheetView';
import { StatsAnalyticsView } from './components/StatsAnalyticsView';
import { ShopEconomyView } from './components/ShopEconomyView';
import { LeaderboardView } from './components/LeaderboardView';
import { AICoachDrawer } from './components/AICoachDrawer';
import { SupabaseModal } from './components/SupabaseModal';
import { PromotionCeremonyModal } from './components/PromotionCeremonyModal';
import { RankType } from './types';

export default function App() {
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [pendingCinematicUser, setPendingCinematicUser] = useState<UserProfile | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [boss, setBoss] = useState<BossState | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  console.log("APP_RENDER", { authUser, user, pendingCinematicUser });

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
    console.log("handleLoadUserAccount() called", {
      "user id": activeAuth.id,
      "email": activeAuth.email,
      "event": eventName || "N/A"
    });

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
    console.log("App mounted.");

    const initAuth = async () => {
      console.log("initAuth() started.");
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
        console.error("initAuth error:", err);
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
      console.log("Auth event:", event, session);

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
    console.log('handleAuthSuccess() called', { authenticatedUser, isNew });
    setIsAuthTransitioning(true);

    const sessionUser = await authService.getSessionUser();
    const activeUser = sessionUser || authenticatedUser;
    if (!activeUser || !activeUser.id) {
      console.error('[AUTH_GUARD] Refusing authentication: No verified Supabase session found.');
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
    console.log('[DRAWER_OPEN] App.handleOpenCoach called');
    setIsCoachOpen(true);
  }, []);
  const handleCloseCoach = useCallback(() => {
    console.log('[DRAWER_CLOSE] App.handleCloseCoach called');
    setIsCoachOpen(false);
  }, []);
  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), []);
  const handleBootComplete = useCallback(() => setIsBooting(false), []);

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
    console.log("AUTH_SCREEN_RENDERED");
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
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
      initial={{ opacity: 0, scale: 0.97, filter: 'blur(12px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      className="h-full w-full bg-[#050505] text-[#e0e0e0] font-sans relative selection:bg-cyan-500/30 flex flex-col overflow-hidden"
    >
      {/* Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/15 blur-[140px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-900/10 blur-[160px] rounded-full pointer-events-none z-0" />

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
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4 pb-20 md:pb-6 relative z-10 overflow-y-auto min-h-0 scrollbar-thin">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={user}
            quests={quests}
            boss={boss || (authUser ? storageService.getBossState(authUser.id) : null)}
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
      <AICoachDrawer
        isOpen={isCoachOpen}
        onClose={handleCloseCoach}
        user={user}
        logs={logs}
        bossState={boss || undefined}
        onAddSuggestedQuest={handleAddCustomQuest}
      />

      {/* Settings / Supabase Modal */}
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
    </motion.div>
  );
}
