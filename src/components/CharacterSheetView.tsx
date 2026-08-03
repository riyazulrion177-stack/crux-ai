import React from 'react';
import { UserProfile, Attributes } from '../types';
import { ALL_RANKS, getRankRequirement } from '../services/rankService';
import { 
  User, 
  Shield, 
  Crown, 
  Award, 
  Zap, 
  Flame, 
  Check, 
  Sparkles,
  TrendingUp,
  BrainCircuit,
  Dumbbell,
  BookOpen,
  Heart,
  Coins,
  MessageSquare,
  Compass,
  Palette,
  Smile
} from 'lucide-react';

interface Props {
  user: UserProfile;
  onSelectTitle: (title: string) => void;
}

const ATTRIBUTE_METADATA: Record<keyof Attributes, { label: string; icon: any; color: string; desc: string }> = {
  Strength: { label: 'Strength', icon: Dumbbell, color: 'text-red-400 bg-red-950/40 border-red-500/30', desc: 'Physical capacity, resistance training & raw power.' },
  Health: { label: 'Health', icon: Heart, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30', desc: 'Sleep quality, hydration, nutrition & cellular longevity.' },
  Knowledge: { label: 'Knowledge', icon: BookOpen, color: 'text-blue-400 bg-blue-950/40 border-blue-500/30', desc: 'Reading non-fiction, technical docs & conceptual wisdom.' },
  Focus: { label: 'Focus', icon: BrainCircuit, color: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/30', desc: 'Deep work endurance, flow state & distraction blockage.' },
  Leadership: { label: 'Leadership', icon: Shield, color: 'text-amber-400 bg-amber-950/40 border-amber-500/30', desc: 'Team direction, responsibility & initiative execution.' },
  Mindset: { label: 'Mindset', icon: Zap, color: 'text-purple-400 bg-purple-950/40 border-purple-500/30', desc: 'Meditation, emotional stoicism & mental grit.' },
  Finance: { label: 'Finance', icon: Coins, color: 'text-yellow-400 bg-yellow-950/40 border-yellow-500/30', desc: 'Budgeting, investing, net-worth compounding & frugal living.' },
  Communication: { label: 'Communication', icon: MessageSquare, color: 'text-teal-400 bg-teal-950/40 border-teal-500/30', desc: 'Articulate speaking, active listening & networking.' },
  Spiritual: { label: 'Spiritual', icon: Compass, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-500/30', desc: 'Daily prayer, gratitude journaling & cosmic purpose.' },
  Creativity: { label: 'Creativity', icon: Palette, color: 'text-pink-400 bg-pink-950/40 border-pink-500/30', desc: 'Code architecture, artistic design & creative output.' },
  Confidence: { label: 'Confidence', icon: Smile, color: 'text-orange-400 bg-orange-950/40 border-orange-500/30', desc: 'Public speaking, cold exposure & overcoming friction.' },
};

export const CharacterSheetView: React.FC<Props> = React.memo(({ user, onSelectTitle }) => {
  const attributes = user.attributes || {
    Strength: 0, Health: 0, Knowledge: 0, Focus: 0, Leadership: 0,
    Mindset: 0, Finance: 0, Communication: 0, Spiritual: 0, Creativity: 0, Confidence: 0
  };

  const totalAttributePoints = (Object.values(attributes) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Hunter Card Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0d0f1c] via-[#12162a] to-[#1a1228] border border-cyan-500/40 p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_25px_#00f0ff40]">
              <div className="w-full h-full bg-[#0d0f1a] rounded-[14px] flex items-center justify-center font-black text-2xl text-cyan-400 font-mono">
                {user.hunterName.charAt(0).toUpperCase()}
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono uppercase mb-1">
                <Crown className="w-3.5 h-3.5 text-amber-400" /> CLASS: {user.classTitle}
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-wide">
                {user.hunterName}
              </h1>
              <p className="text-xs text-purple-300 font-mono mt-0.5">
                Title: <span className="text-amber-300 font-semibold">{user.activeTitle}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="bg-[#12162a] border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase">HUNTER RANK</div>
              <div className="text-sm font-extrabold text-cyan-400 mt-0.5">{user.rank}</div>
            </div>
            <div className="bg-[#12162a] border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase">RANK POINTS (RP)</div>
              <div className="text-sm font-extrabold text-amber-400 mt-0.5">{user.rp || 0} RP</div>
            </div>
            <div className="bg-[#12162a] border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase">HUNTER LEVEL</div>
              <div className="text-sm font-extrabold text-purple-400 mt-0.5">LVL {user.level}</div>
            </div>
            <div className="bg-[#12162a] border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase">HIGHEST RANK</div>
              <div className="text-sm font-extrabold text-emerald-400 mt-0.5">{user.highestRank || user.rank}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Hunter Rank Progression & Multi-Factor Requirements */}
      <div className="rounded-2xl bg-[#0f111f] border border-slate-800 p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" /> HUNTER RANK PROGRESION & DISCIPLINE REQUIREMENTS
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Rank represents prestiges, discipline, and long-term mastery. Multiple factors determine promotion eligibility.
            </p>
          </div>

          <div className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono text-xs font-bold">
            CURRENT: {user.rank} ({user.rp || 0} RP)
          </div>
        </div>

        {/* Multi-Factor Checklist for Next Rank */}
        {(() => {
          const currentRankIdx = ALL_RANKS.findIndex(r => r.rank === user.rank);
          const nextReq = ALL_RANKS[currentRankIdx + 1];
          if (!nextReq) {
            return (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold text-center">
                <Crown className="w-5 h-5 mx-auto mb-1 text-amber-400" />
                MAXIMUM HUNTER RANK ACHIEVED ({user.rank}). YOU STAND AMONG THE LEGENDARY MONARCHS OF CRUX.
              </div>
            );
          }

          const currentReq = getRankRequirement(user.rank);
          const rpProgress = Math.min(100, Math.round(((user.rp || 0) / nextReq.minRp) * 100));

          const reqs = [
            { label: 'Rank Points (RP)', current: user.rp || 0, req: nextReq.minRp, unit: 'RP', met: (user.rp || 0) >= nextReq.minRp },
            { label: 'Hunter Level', current: user.level, req: nextReq.minLevel, unit: 'LVL', met: user.level >= nextReq.minLevel },
            { label: 'Discipline Score', current: user.disciplineScore, req: nextReq.minDisciplineScore, unit: '%', met: user.disciplineScore >= nextReq.minDisciplineScore },
            { label: 'Total Earned XP', current: user.totalXp || user.xp, req: nextReq.minTotalXp, unit: 'XP', met: (user.totalXp || user.xp) >= nextReq.minTotalXp },
            { label: 'Discipline Streak', current: user.streak, req: nextReq.minStreak, unit: 'Days', met: user.streak >= nextReq.minStreak },
            { label: 'Bosses Defeated', current: user.bossesDefeatedCount || 0, req: nextReq.minBossesDefeated, unit: 'Bosses', met: (user.bossesDefeatedCount || 0) >= nextReq.minBossesDefeated },
          ];

          return (
            <div className="space-y-4">
              {/* Target Header */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-300 font-bold">NEXT RANK: <span className="text-cyan-300">{nextReq.rank}</span></span>
                <span className="text-cyan-400 font-bold">{rpProgress}% PROMOTION ELIGIBILITY</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-black rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${rpProgress}%` }}
                />
              </div>

              {/* Requirements Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {reqs.map((r) => (
                  <div
                    key={`req_${r.label.replace(/\s+/g, '_')}`}
                    className={`p-3 rounded-xl border text-xs font-mono transition ${
                      r.met
                        ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-black/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span>{r.label}</span>
                      {r.met ? (
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800 uppercase">
                          MET
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-slate-800 uppercase">
                          NEEDED
                        </span>
                      )}
                    </div>
                    <div className="text-sm font-extrabold text-white">
                      {r.current} / {r.req} <span className="text-[10px] text-slate-400 font-normal">{r.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decay Warning */}
              {currentReq.decayPerDay > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>PRESTIGE RANK DECAY ACTIVE:</strong> Inactivity or skipping daily protocols costs <strong>{currentReq.decayPerDay} RP/day</strong>.
                  </span>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {/* Attributes Grid (11 RPG Stats) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-wide flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" /> CORE ATTRIBUTE SYSTEM (11 STATS)
          </h2>
          <span className="text-xs font-mono text-slate-400">Calculated purely from real activities</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(attributes) as (keyof Attributes)[]).map((attrKey) => {
            const meta = ATTRIBUTE_METADATA[attrKey];
            const val = attributes[attrKey] || 0;
            const Icon = meta.icon;

            return (
              <div key={`attr_${attrKey}`} className="p-4 rounded-2xl bg-[#0f111f] border border-slate-800/80 hover:border-cyan-900/60 transition space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white">{meta.label}</div>
                      <div className="text-[10px] text-slate-400 leading-tight">{meta.desc}</div>
                    </div>
                  </div>
                  <div className="font-mono font-extrabold text-base text-cyan-400">
                    {val} <span className="text-[10px] text-slate-500 font-normal">PTS</span>
                  </div>
                </div>

                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${Math.min(100, val * 5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Titles Selector */}
      <div className="rounded-2xl bg-[#0f111f] border border-slate-800 p-6 space-y-4">
        <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" /> EARNED TITLES COLLECTION
        </h3>

        <div className="flex flex-wrap gap-2">
          {Array.from(new Set(user.unlockedTitles || [])).map((title) => {
            const isSelected = user.activeTitle === title;
            return (
              <button
                key={`title_${title}`}
                onClick={() => onSelectTitle(title)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_#f59e0b20]'
                    : 'bg-[#12162a] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                <span>{title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
