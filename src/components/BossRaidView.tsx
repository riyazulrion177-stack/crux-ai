import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BossState, UserProfile } from '../types';
import { BOSS_CATALOG } from '../services/questCatalog';
import { storageService } from '../services/storageService';
import { Skull, Zap, Shield, Flame, Swords, Trophy, Sparkles, Lock, AlertTriangle, RefreshCw } from 'lucide-react';
import { audioService } from '../services/audioService';

interface Props {
  boss: BossState;
  user: UserProfile;
  onAttackBoss: (damage: number) => void;
  onNavigateQuests: () => void;
}

export const BossRaidView: React.FC<Props> = React.memo(({ boss: initialBoss, user, onAttackBoss, onNavigateQuests }) => {
  const [selectedBossId, setSelectedBossId] = useState<string>(initialBoss.id);
  const currentBoss = storageService.getBossState(user.id);
  const activeBoss = BOSS_CATALOG.find(b => b.id === selectedBossId) || currentBoss;

  const [combatLogs, setCombatLogs] = useState<string[]>([
    `RAID INITIALIZED: ${activeBoss.name} has entered the arena.`,
    `TARGET WEAKNESS: Complete missions aligned with ${activeBoss.weaknessStat} for Critical Strike!`
  ]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [floatingDamage, setFloatingDamage] = useState<number | null>(null);

  const isLevelLocked = user.level < activeBoss.minLevel;
  const hpPercent = Math.max(0, Math.round((activeBoss.currentHp / activeBoss.maxHp) * 100));
  const ragePercent = Math.min(100, activeBoss.rage || 0);

  const handleSelectBoss = (bossId: string) => {
    setSelectedBossId(bossId);
    storageService.selectBoss(bossId, user.id);
    const chosen = BOSS_CATALOG.find(b => b.id === bossId);
    if (chosen) {
      setCombatLogs([
        `RAID SWITCHED: Target set to ${chosen.name}.`,
        `REQUIREMENT: Level ${chosen.minLevel} | WEAKNESS: ${chosen.weaknessStat}`
      ]);
    }
  };

  const handleStrike = () => {
    if (isLevelLocked || activeBoss.defeated || isAttacking) return;
    setIsAttacking(true);
    audioService.playBossHit();

    try {
      const res = storageService.strikeBossDirectly(user.id);
      setFloatingDamage(res.damageDealt);

      const hitMessage = `STRIKE: Dealt ${res.damageDealt} damage to ${activeBoss.name}!`;
      let counterMessage = res.counterDamage > 0 ? `BOSS COUNTER: Dealt ${res.counterDamage} Energy damage!` : '';

      setCombatLogs(prev => [counterMessage ? counterMessage : hitMessage, prev[0] || '']);

      if (res.defeatedNow) {
        audioService.playLevelUp();
        setCombatLogs(prev => [`VICTORY! ${activeBoss.name} HAS BEEN SLAIN! +2 LOOT BOXES RECEIVED!`, ...prev]);
      }
    } catch (e: any) {
      setCombatLogs(prev => [`SYSTEM WARNING: ${e.message}`, ...prev]);
    }

    setTimeout(() => {
      setIsAttacking(false);
      setFloatingDamage(null);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Boss Catalog Carousel Selector */}
      <div className="scrollable-chips pb-2 gap-2">
        {BOSS_CATALOG.map((b) => {
          const locked = user.level < b.minLevel;
          const isSelected = b.id === activeBoss.id;
          return (
            <button
              key={`boss_${b.id}`}
              onClick={(e) => {
                handleSelectBoss(b.id);
                (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
              }}
              className={`scrollable-chip-item px-4 py-2.5 rounded-2xl font-mono text-xs font-bold transition flex items-center gap-2 border cursor-pointer ${
                isSelected
                  ? 'bg-purple-900/60 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : locked
                  ? 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-400'
                  : 'bg-[#12162a] border-slate-800 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {locked ? <Lock className="w-3.5 h-3.5 text-slate-500" /> : <Skull className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400' : 'text-slate-400'}`} />}
              <span>{b.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-400">LVL {b.minLevel}</span>
            </button>
          );
        })}
      </div>

      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#1f0b18] via-[#120a22] to-[#0a1026] border border-red-500/40 p-6 md:p-8 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-red-400 text-xs font-mono uppercase tracking-widest">
              <Skull className="w-4 h-4 animate-pulse" /> ENDGAME RAID ARENA
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-wider flex items-center gap-3">
              {activeBoss.name}
              {isLevelLocked && <span className="text-xs font-mono px-2 py-1 bg-red-950 text-red-400 border border-red-800 rounded">LOCKED</span>}
            </h1>
            <p className="text-sm text-purple-300 font-medium">
              {activeBoss.title}
            </p>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              {activeBoss.description}
            </p>
          </div>

          <div className="text-center bg-black/50 border border-purple-500/30 p-4 rounded-2xl min-w-[220px]">
            <div className="text-xs font-mono text-purple-300 uppercase tracking-wider mb-1">RAID BOUNTY</div>
            <div className="text-lg font-bold text-amber-400 font-mono">+{activeBoss.rewardCoins} Gold</div>
            <div className="text-sm font-bold text-cyan-400 font-mono">+{activeBoss.rewardDiamonds} Diamonds</div>
            <div className="text-xs text-emerald-400 font-mono font-semibold mt-1">+2 LOOT BOX DROPS</div>
          </div>
        </div>
      </div>

      {/* Main Boss Card & Combat Control */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Boss Stage Visual */}
        <div className="lg:col-span-2 rounded-3xl bg-[#0f111f] border border-purple-900/50 p-6 shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[440px]">
          {isLevelLocked ? (
            <div className="my-auto flex flex-col items-center justify-center space-y-4 text-center p-8 bg-black/60 rounded-3xl border border-red-900/40">
              <div className="p-4 rounded-full bg-red-950 text-red-400 border border-red-500/50">
                <Lock className="w-12 h-12 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-mono font-bold text-white">LEVEL LOCKED</h3>
                <p className="text-xs font-mono text-slate-400">
                  Requires Hunter Level <strong className="text-red-400">{activeBoss.minLevel}</strong> to challenge this Sovereign.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Boss Visual Avatar */}
              <div className="relative my-4 flex items-center justify-center">
                {floatingDamage !== null && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -60, scale: 1.5 }}
                    className="absolute z-30 font-black font-mono text-3xl text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] pointer-events-none"
                  >
                    -{floatingDamage} CRIT!
                  </motion.div>
                )}

                <motion.div
                  animate={isAttacking ? { x: [-12, 12, -12, 0], scale: [1, 0.92, 1.08, 1] } : { y: [-8, 8, -8] }}
                  transition={isAttacking ? { duration: 0.3 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-red-500/60 shadow-[0_0_60px_rgba(239,68,68,0.4)] bg-black/60">
                    <img 
                      src={activeBoss.avatarUrl} 
                      alt="Boss" 
                      className="w-full h-full object-cover filter contrast-125 brightness-90"
                    />
                  </div>
                  {activeBoss.defeated && (
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-sm rounded-full flex flex-col items-center justify-center text-emerald-400 font-mono font-extrabold text-xl tracking-widest">
                      <Trophy className="w-12 h-12 mb-1 animate-bounce" />
                      SLAIN
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Boss Health Bar & Rage Gauge */}
              <div className="w-full space-y-3">
                {/* Boss Health Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1.5 font-bold text-red-400">
                      <Flame className="w-4 h-4 fill-red-400" /> BOSS HEALTH
                    </span>
                    <span className="font-extrabold text-sm font-mono text-white">
                      {activeBoss.currentHp} / {activeBoss.maxHp} HP ({hpPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden border border-red-900/60 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_15px_#ef4444]"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                </div>

                {/* Boss Rage Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1 font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" /> BOSS RAGE (COUNTERS ENHANCED)
                    </span>
                    <span className="font-bold text-amber-400">{ragePercent}%</span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-amber-900/40 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-300"
                      style={{ width: `${ragePercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                  <span>WEAKNESS: <strong className="text-purple-300">{activeBoss.weaknessStat}</strong></span>
                  <span>DISCIPLINE BONUS: <strong className="text-amber-400">{user.disciplineScore}%</strong></span>
                </div>
              </div>

              {/* Attack CTA Button */}
              <div className="w-full mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleStrike}
                  disabled={activeBoss.defeated || isLevelLocked}
                  className={`py-4 rounded-xl font-mono font-extrabold text-sm uppercase tracking-widest shadow-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                    activeBoss.defeated || isLevelLocked
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-gradient-to-r from-red-600 via-purple-600 to-indigo-600 text-white hover:scale-[1.02] active:scale-[0.98] shadow-red-600/30'
                  }`}
                >
                  <Swords className="w-5 h-5" /> STRIKE BOSS DIRECTLY
                </button>

                <button
                  onClick={onNavigateQuests}
                  className="py-4 rounded-xl bg-[#12162a] border border-slate-700 text-slate-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider transition"
                >
                  COMPLETE MISSIONS FOR 1.5X CRIT &rarr;
                </button>
              </div>
            </>
          )}
        </div>

        {/* Combat Log */}
        <div className="rounded-3xl bg-[#0f111f] border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> ARENA TELEMETRY
              </h3>
              <span className="text-[10px] font-mono text-emerald-400">LIVE</span>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin text-xs font-mono">
              {combatLogs.map((log, idx) => (
                <div key={`combat_log_${idx}`} className="p-2.5 rounded-xl bg-[#14182f] border border-slate-800/80 text-slate-300 leading-relaxed">
                  <span className="text-cyan-400 font-bold mr-1">&gt;</span> {log}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-purple-950/40 border border-purple-800/40 text-[11px] text-purple-200 leading-relaxed">
            <strong>System Overseer Note:</strong> Sloth demons cannot be defeated through simple fake clicks. Complete real-life workouts, deep work sprints, and early wake-ups for massive critical strikes.
          </div>
        </div>
      </div>
    </div>
  );
});

