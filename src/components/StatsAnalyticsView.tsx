import React from 'react';
import { UserProfile, ActivityLog } from '../types';
import { BarChart3, TrendingUp, Calendar, Zap, Shield, Flame } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface Props {
  user: UserProfile;
  logs: ActivityLog[];
}

export const StatsAnalyticsView: React.FC<Props> = React.memo(({ user, logs }) => {
  // Process logs into daily XP trend
  const last7DaysData = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - idx));
    const dateStr = date.toISOString().split('T')[0];

    const dayLogs = logs.filter(l => l.timestamp.startsWith(dateStr));
    const dayXp = dayLogs.reduce((acc, l) => acc + l.xpEarned, 0);

    return {
      day: date.toLocaleDateString([], { weekday: 'short' }),
      XP: dayXp,
      Missions: dayLogs.length
    };
  });

  // Heatmap generation (last 60 days)
  const heatmapDays = Array.from({ length: 60 }).map((_, idx) => {
    const d = new Date();
    d.setDate(d.getDate() - (59 - idx));
    const dStr = d.toISOString().split('T')[0];
    const count = logs.filter(l => l.timestamp.startsWith(dStr)).length;
    return { date: dStr, count };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-[#0d0f1a] border border-cyan-900/40 rounded-2xl p-6 shadow-xl">
        <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1">
          <BarChart3 className="w-4 h-4" /> SYSTEM PERFORMANCE ANALYTICS
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-wide">
          REAL-TIME DISCIPLINE MATRIX
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Historical growth trajectory, XP gains, and 365-day habit heatmaps calculated from your active database.
        </p>
      </div>

      {/* Recharts 7-Day XP Growth Chart */}
      <div className="rounded-2xl bg-[#0f111f] border border-slate-800 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <TrendingUp className="w-4 h-4 text-cyan-400" /> 7-DAY XP ACCUMULATION SPRINT
          </h2>
          <span className="text-xs font-mono text-cyan-400">Total Logs: {logs.length}</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0d0f1c', borderColor: '#00f0ff40', borderRadius: '12px', color: '#fff' }}
              />
              <Line 
                type="monotone" 
                dataKey="XP" 
                stroke="#00f0ff" 
                strokeWidth={3} 
                dot={{ fill: '#00f0ff', r: 5 }} 
                activeDot={{ r: 8, fill: '#8a2be2' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GitHub-style Activity Heatmap (60 Days Grid) */}
      <div className="rounded-2xl bg-[#0f111f] border border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
            <Calendar className="w-4 h-4 text-purple-400" /> DISCIPLINE HEATMAP (LAST 60 DAYS)
          </h2>
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span>LESS</span>
            <div className="w-3 h-3 bg-[#1e293b] rounded" />
            <div className="w-3 h-3 bg-cyan-900 rounded" />
            <div className="w-3 h-3 bg-cyan-600 rounded" />
            <div className="w-3 h-3 bg-cyan-400 rounded" />
            <span>MORE</span>
          </div>
        </div>

        <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-2 pt-2">
          {heatmapDays.map((item) => {
            let bg = 'bg-[#12162a] border-slate-800';
            if (item.count >= 1) bg = 'bg-cyan-950 border-cyan-800 text-cyan-400';
            if (item.count >= 3) bg = 'bg-cyan-700 border-cyan-500 text-white';
            if (item.count >= 5) bg = 'bg-cyan-400 border-white text-black shadow-[0_0_10px_#00f0ff]';

            return (
              <div
                key={`hm_${item.date}`}
                title={`${item.date}: ${item.count} missions executed`}
                className={`h-8 rounded-lg border flex items-center justify-center text-[10px] font-mono font-bold transition hover:scale-110 cursor-pointer ${bg}`}
              >
                {item.count > 0 ? item.count : ''}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});
