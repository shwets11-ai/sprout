import { useState } from 'react';
import { getActivitiesByDate, getTodayStr } from '../db/database';
import { analyzePatterns } from '../utils/analyzePatterns';
import { getRecentActivities } from '../db/database';

export default function ScheduleScreen({ onBack }) {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generateSchedule = async () => {
    setLoading(true);
    const activities = await getRecentActivities(7);
    const patterns = analyzePatterns(activities);
    setInsights(patterns);
    setGenerated(true);
    setLoading(false);
  };

  const getScheduleBlocks = () => {
    if (!insights) return [];
    const blocks = [];

    if (insights.averageWakeTime) {
      blocks.push({ time: insights.averageWakeTime, label: '🌅 Wake Up & Morning Routine', color: 'bg-yellow-100 border-yellow-300' });
    } else {
      blocks.push({ time: '07:00', label: '🌅 Wake Up & Morning Routine', color: 'bg-yellow-100 border-yellow-300' });
    }

    const breakfastTime = insights.commonMealTimes?.[0] || '08:00';
    blocks.push({ time: breakfastTime, label: `🍽️ Breakfast`, color: 'bg-orange-100 border-orange-300' });

    const learningTime = '09:30';
    blocks.push({ time: learningTime, label: `📚 Learning Time${insights.topLearningActivities?.[0] ? ' — ' + insights.topLearningActivities[0] : ''}`, color: 'bg-sky-100 border-sky-300' });

    blocks.push({ time: '10:30', label: '🎮 Play Time', color: 'bg-green-100 border-green-300' });

    const lunchTime = insights.commonMealTimes?.[1] || '12:00';
    blocks.push({ time: lunchTime, label: `🍽️ Lunch`, color: 'bg-orange-100 border-orange-300' });

    const napTime = insights.averageWakeTime ? '13:00' : '12:30';
    blocks.push({ time: napTime, label: `😴 Nap/Rest${insights.avgNapDuration > 0 ? ` (${Math.floor(insights.avgNapDuration / 60)}h ${insights.avgNapDuration % 60}m)` : ''}`, color: 'bg-purple-100 border-purple-300' });

    blocks.push({ time: '15:30', label: '🌤️ Afternoon Activity', color: 'bg-green-100 border-green-300' });

    const dinnerTime = insights.commonMealTimes?.[2] || '17:00';
    blocks.push({ time: dinnerTime, label: `🍽️ Dinner`, color: 'bg-orange-100 border-orange-300' });

    if (insights.averageBedtime) {
      blocks.push({ time: insights.averageBedtime, label: '🌙 Wind-down & Bedtime', color: 'bg-purple-100 border-purple-300' });
    } else {
      blocks.push({ time: '20:00', label: '🌙 Wind-down & Bedtime', color: 'bg-purple-100 border-purple-300' });
    }

    blocks.sort((a, b) => a.time.localeCompare(b.time));
    return blocks;
  };

  const scheduleBlocks = generated ? getScheduleBlocks() : [];

  return (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-600 text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">
          ←
        </button>
        <h1 className="text-xl font-bold text-gray-800">Your Sprout's Schedule</h1>
      </div>
      <p className="text-sm text-gray-400 mb-6">Based on the last 7 days</p>

      {!generated && !loading && (
        <div className="text-center py-10 card">
          <span className="text-5xl">📅</span>
          <p className="text-gray-400 mt-4 text-sm font-medium">Ready to see a personalized schedule?</p>
          <p className="text-gray-300 text-xs mt-1">We'll analyze your logs to build the perfect day.</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-10">
          <p className="text-gray-400">Analyzing your week...</p>
        </div>
      )}

      {generated && insights && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card bg-yellow-50 border-yellow-200 text-center">
              <p className="text-lg font-bold text-yellow-700">{insights.averageWakeTime || '—'}</p>
              <p className="text-xs text-yellow-500 mt-0.5">Avg Wake Time</p>
            </div>
            <div className="card bg-purple-50 border-purple-200 text-center">
              <p className="text-lg font-bold text-purple-700">{insights.averageBedtime || '—'}</p>
              <p className="text-xs text-purple-500 mt-0.5">Avg Bedtime</p>
            </div>
            <div className="card bg-sky-50 border-sky-200 text-center">
              <p className="text-lg font-bold text-sky-700">{insights.avgLearningMinutes > 0 ? `${insights.avgLearningMinutes}m` : '—'}</p>
              <p className="text-xs text-sky-500 mt-0.5">Avg Learning</p>
            </div>
            <div className="card bg-green-50 border-green-200 text-center">
              <p className="text-lg font-bold text-green-700">{insights.avgNapDuration > 0 ? `${Math.floor(insights.avgNapDuration / 60)}h${insights.avgNapDuration % 60}m` : '—'}</p>
              <p className="text-xs text-green-500 mt-0.5">Avg Nap</p>
            </div>
          </div>

          {/* Schedule Timeline */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Suggested Schedule</h2>
          <div className="space-y-2 mb-6">
            {scheduleBlocks.map((block, i) => (
              <div key={i} className={`${block.color} border-2 rounded-2xl px-4 py-3 flex items-center gap-3`}>
                <span className="text-sm font-bold text-gray-500 w-12">{block.time}</span>
                <span className="text-sm font-medium text-gray-700">{block.label}</span>
              </div>
            ))}
          </div>

          {/* Day Selector */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">This Week</h2>
          <div className="flex gap-2 mb-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <button
                key={day}
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500 hover:bg-sprout-green-100 hover:text-sprout-green-600 transition-all"
              >
                {day}
              </button>
            ))}
          </div>

          {/* Stats Section */}
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Weekly Averages</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Meal Times</h3>
              {insights.commonMealTimes.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {insights.commonMealTimes.map((t) => (
                    <span key={t} className="px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-lg">{t}</span>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-300">No data yet</p>}
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Learning</h3>
              {insights.topLearningActivities.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {insights.topLearningActivities.slice(0, 3).map((a) => (
                    <span key={a} className="px-2 py-0.5 bg-sky-50 text-sky-600 text-xs rounded-lg">{a}</span>
                  ))}
                </div>
              ) : <p className="text-xs text-gray-300">No data yet</p>}
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Nap Times</h3>
              {insights.mostCommonPlayTimes.length > 0 ? (
                <p className="text-xs text-gray-600">{insights.mostCommonPlayTimes.join(', ')}</p>
              ) : <p className="text-xs text-gray-300">No data yet</p>}
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-1">Naps/Day</h3>
              <p className="text-lg font-bold text-gray-700">{insights.napsPerDay || '—'}</p>
            </div>
          </div>
        </>
      )}

      {!loading && (
        <button onClick={generateSchedule} className="btn-primary w-full mt-6">
          ✨ Generate My Schedule
        </button>
      )}
    </div>
  );
}
