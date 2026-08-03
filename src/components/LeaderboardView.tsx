import React, { useState } from 'react';
import { UserProfile, LeaderboardEntry } from '../types';
import { Trophy, Globe, Flag, Users, GraduationCap, Shield, Crown } from 'lucide-react';

interface Props {
  user: UserProfile;
}

const GLOBAL_SIMULATED_HUNTERS: Omit<LeaderboardEntry, 'rank'>[] = [
  { id: 'h1', hunterName: 'Sung Jin-Woo', classTitle: 'Shadow Monk', level: 84, xp: 92, rankTier: 'Immortal', streak: 120, isCurrentUser: false },
  { id: 'h2', hunterName: 'Kaelen Vance', classTitle: 'Cyber Scholar', level: 52, xp: 40, rankTier: 'Legend', streak: 65, isCurrentUser: false },
  { id: 'h3', hunterName: 'Aria Sterling', classTitle: 'Iron Executive', level: 41, xp: 80, rankTier: 'Mythic', streak: 48, isCurrentUser: false },
  { id: 'h4', hunterName: 'Damian Thorne', classTitle: 'Titan Athlete', level: 35, xp: 15, rankTier: 'Grandmaster', streak: 30, isCurrentUser: false },
  { id: 'h5', hunterName: 'Lyra Vance', classTitle: 'Creative Weaver', level: 28, xp: 60, rankTier: 'Master', streak: 21, isCurrentUser: false },
];

export const LeaderboardView: React.FC<Props> = React.memo(({ user }) => {
  const [selectedTab, setSelectedTab] = useState<'global' | 'country' | 'guild' | 'university'>('global');

  // Build combined list
  const currentUserEntry: Omit<LeaderboardEntry, 'rank'> = {
    id: `user_${user.id}`,
    hunterName: user.hunterName,
    classTitle: user.classTitle,
    level: user.level,
    xp: user.xp,
    rankTier: user.rank,
    streak: user.streak,
    isCurrentUser: true
  };

  const allEntries = [...GLOBAL_SIMULATED_HUNTERS, currentUserEntry]
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.xp - a.xp;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d0f1a] border border-cyan-900/40 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
            <Trophy className="w-4 h-4 text-amber-400" /> WORLD HUNTER RANKINGS
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            GLOBAL LEADERBOARD & STANDINGS
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time global hierarchy calculated from level progress and streak discipline.
          </p>
        </div>

        {/* User Standings Summary Badge */}
        <div className="bg-cyan-950/60 border border-cyan-500/40 p-4 rounded-xl font-mono text-xs">
          <div className="text-slate-400 uppercase">YOUR STANDING</div>
          <div className="text-lg font-extrabold text-cyan-300">
            RANK #{allEntries.find(e => e.isCurrentUser)?.rank || 'Unranked'}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="scrollable-chips pb-2 font-mono text-xs gap-2">
        <button
          onClick={(e) => {
            setSelectedTab('global');
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}
          className={`scrollable-chip-item px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            selectedTab === 'global' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-[#12162a] text-slate-400 border border-slate-800'
          }`}
        >
          <Globe className="w-4 h-4" /> Global Division
        </button>
        <button
          onClick={(e) => {
            setSelectedTab('country');
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}
          className={`scrollable-chip-item px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            selectedTab === 'country' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-[#12162a] text-slate-400 border border-slate-800'
          }`}
        >
          <Flag className="w-4 h-4" /> Country Division
        </button>
        <button
          onClick={(e) => {
            setSelectedTab('guild');
            (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }}
          className={`scrollable-chip-item px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
            selectedTab === 'guild' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'bg-[#12162a] text-slate-400 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" /> Guilds & Teams
        </button>
      </div>

      {/* Rankings Table */}
      <div className="rounded-2xl bg-[#0f111f] border border-slate-800 p-4 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase text-slate-400">
              <th className="py-3 px-4">Rank</th>
              <th className="py-3 px-4">Hunter</th>
              <th className="py-3 px-4">Class</th>
              <th className="py-3 px-4">Level</th>
              <th className="py-3 px-4">Tier</th>
              <th className="py-3 px-4">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs">
            {allEntries.map((entry) => (
              <tr 
                key={`lb_${entry.id}`}
                className={`transition ${
                  entry.isCurrentUser
                    ? 'bg-cyan-950/50 font-bold border-l-4 border-l-cyan-400'
                    : 'hover:bg-slate-900/50'
                }`}
              >
                <td className="py-3.5 px-4 font-mono">
                  {entry.rank === 1 && <span className="text-amber-400 font-extrabold flex items-center gap-1"><Crown className="w-4 h-4" /> #1</span>}
                  {entry.rank === 2 && <span className="text-slate-300 font-bold">#2</span>}
                  {entry.rank === 3 && <span className="text-amber-600 font-bold">#3</span>}
                  {entry.rank > 3 && <span className="text-slate-500">#{entry.rank}</span>}
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{entry.hunterName}</span>
                    {entry.isCurrentUser && (
                      <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                        YOU
                      </span>
                    )}
                  </div>
                </td>

                <td className="py-3.5 px-4 text-purple-300 font-mono">
                  {entry.classTitle}
                </td>

                <td className="py-3.5 px-4 font-mono font-extrabold text-cyan-400">
                  LVL {entry.level}
                </td>

                <td className="py-3.5 px-4 font-mono text-slate-300">
                  {entry.rankTier}
                </td>

                <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                  {entry.streak}D
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});
