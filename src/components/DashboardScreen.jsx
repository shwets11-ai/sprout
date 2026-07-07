import { useState, useEffect, useCallback } from 'react';
import { getActivitiesByDate, deleteActivity, getTodayStr } from '../db/database';
import ActivityCard from './ActivityCard';

const quickAddButtons = [
  { category: 'meals', label: 'Meals', icon: '🍽️', color: 'bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200' },
  { category: 'learning', label: 'Learning', icon: '📚', color: 'bg-sky-100 border-sky-300 text-sky-700 hover:bg-sky-200' },
  { category: 'sleep', label: 'Sleep', icon: '😴', color: 'bg-purple-100 border-purple-300 text-purple-700 hover:bg-purple-200' },
  { category: 'play', label: 'Play', icon: '🎮', color: 'bg-green-100 border-green-300 text-green-700 hover:bg-green-200' },
];

function getTimeGroup(time) {
  if (!time) return 'other';
  const h = parseInt(time.split(':')[0], 10);
  if (h < 12) return '🌅 Morning';
  if (h < 14) return '☀️ Midday';
  if (h < 17) return '🌤️ Afternoon';
  return '🌙 Evening';
}

export default function DashboardScreen({ onLog, toddlerId, toddlerName }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = getTodayStr();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const loadActivities = useCallback(async () => {
    setLoading(true);
    const data = await getActivitiesByDate(today, toddlerId);
    setActivities(data);
    setLoading(false);
  }, [today]);

  useEffect(() => { loadActivities(); }, [loadActivities]);

  const handleDelete = async (category, id) => {
    await deleteActivity(category, id);
    loadActivities();
  };

  // Group by time of day
  const groups = {};
  activities.forEach((a) => {
    const group = getTimeGroup(a.time);
    if (!groups[group]) groups[group] = [];
    groups[group].push(a);
  });

  return (
    <div className="pb-24">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-800">Today's Timeline</h1>
        <p className="text-sm text-gray-400 mt-0.5">{todayFormatted}</p>
        <p className="text-sm text-gray-500 mt-1 font-medium">{toddlerName ? `How's ${toddlerName} today? 🌱` : "How's your little sprout today? 🌱"}</p>
      </div>

      {/* Quick-add buttons */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {quickAddButtons.map((btn) => (
          <button
            key={btn.category}
            onClick={() => onLog(btn.category)}
            className={`${btn.color} border-2 rounded-2xl py-3 flex flex-col items-center gap-1 transition-all active:scale-95 min-h-[64px]`}
          >
            <span className="text-xl">{btn.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wide">{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-400">Loading...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-10 card">
          <span className="text-5xl">🌱</span>
          <p className="text-gray-400 mt-4 text-sm font-medium">Nothing logged yet today!</p>
          <p className="text-gray-300 text-xs mt-1">Tap a button above to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([group, items]) => (
            <div key={group}>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{group}</h3>
              <div className="space-y-2">
                {items.map((activity) => (
                  <ActivityCard
                    key={`${activity.category}-${activity.id}`}
                    activity={activity}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
