import Dexie from 'dexie';

const db = new Dexie('SproutDB');
db.version(1).stores({
  meals: '++id, date, createdAt',
  learning: '++id, date, createdAt',
  sleep: '++id, date, createdAt',
  play: '++id, date, createdAt',
});

// ─── Generic helpers ──────────────────────────────────────────

export const addActivity = async (category, data) => {
  return await db[category].add({ ...data, createdAt: new Date().toISOString() });
};

export const deleteActivity = async (category, id) => {
  await db[category].delete(id);
};

// ─── Query helpers ────────────────────────────────────────────

function getDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Return today's date as YYYY-MM-DD */
export function getTodayStr() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/** Fetch all categories for a single date, merge with category label, sort by time. */
export const getActivitiesByDate = async (date) => {
  const [meals, learning, sleep, play] = await Promise.all([
    db.meals.where('date').equals(date).toArray(),
    db.learning.where('date').equals(date).toArray(),
    db.sleep.where('date').equals(date).toArray(),
    db.play.where('date').equals(date).toArray(),
  ]);
  return [
    ...meals.map((a) => ({ ...a, category: 'meal' })),
    ...learning.map((a) => ({ ...a, category: 'learning' })),
    ...sleep.map((a) => ({ ...a, category: 'sleep' })),
    ...play.map((a) => ({ ...a, category: 'play' })),
  ].sort((a, b) => (a.time || '').localeCompare(b.time || ''));
};

/** Fetch all activities from the last N days, merged and sorted by date then time. */
export const getRecentActivities = async (days = 7) => {
  const since = getDateNDaysAgo(days);
  const [meals, learning, sleep, play] = await Promise.all([
    db.meals.where('date').aboveOrEqual(since).toArray(),
    db.learning.where('date').aboveOrEqual(since).toArray(),
    db.sleep.where('date').aboveOrEqual(since).toArray(),
    db.play.where('date').aboveOrEqual(since).toArray(),
  ]);
  return [
    ...meals.map((a) => ({ ...a, category: 'meal' })),
    ...learning.map((a) => ({ ...a, category: 'learning' })),
    ...sleep.map((a) => ({ ...a, category: 'sleep' })),
    ...play.map((a) => ({ ...a, category: 'play' })),
  ].sort((a, b) => {
    const dateCmp = (a.date || '').localeCompare(b.date || '');
    if (dateCmp !== 0) return dateCmp;
    return (a.time || '').localeCompare(b.time || '');
  });
};

// ─── Schedule Insights ────────────────────────────────────────

/**
 * Analyzes the last 7 days of data and returns structured insights.
 */
export const getScheduleInsights = async () => {
  const activities = await getRecentActivities(7);

  // Sleep analysis
  const sleepRecords = activities.filter((a) => a.category === 'sleep');
  let avgSleepDuration = 0;
  if (sleepRecords.length > 0) {
    const totalMinutes = sleepRecords.reduce((sum, s) => {
      if (s.startTime && s.endTime) {
        const [sh, sm] = s.startTime.split(':').map(Number);
        const [eh, em] = s.endTime.split(':').map(Number);
        let startMin = sh * 60 + sm;
        let endMin = eh * 60 + em;
        if (endMin < startMin) endMin += 24 * 60; // spans midnight
        return sum + (endMin - startMin);
      }
      return sum;
    }, 0);
    avgSleepDuration = Math.round(totalMinutes / sleepRecords.length);
  }

  // Meal time analysis
  const mealRecords = activities.filter((a) => a.category === 'meal');
  const mealTimeCounts = {};
  mealRecords.forEach((m) => {
    if (m.time) {
      const hour = m.time.split(':')[0] + ':00';
      mealTimeCounts[hour] = (mealTimeCounts[hour] || 0) + 1;
    }
  });
  const commonMealTimes = Object.entries(mealTimeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([time]) => time);

  // Learning analysis
  const learningRecords = activities.filter((a) => a.category === 'learning');
  const activityTypeCounts = {};
  learningRecords.forEach((l) => {
    if (l.activityType) {
      activityTypeCounts[l.activityType] = (activityTypeCounts[l.activityType] || 0) + 1;
    }
  });
  const favoriteLearningActivities = Object.entries(activityTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type]) => type);

  // Play duration analysis
  const playRecords = activities.filter((a) => a.category === 'play');
  let avgPlayDuration = 0;
  if (playRecords.length > 0) {
    avgPlayDuration = Math.round(
      playRecords.reduce((sum, p) => sum + (p.duration || 0), 0) / playRecords.length
    );
  }

  // Nap time analysis
  const napRecords = sleepRecords.filter((s) => s.type === 'nap');
  const napTimeCounts = {};
  napRecords.forEach((n) => {
    if (n.startTime) {
      const hour = n.startTime.split(':')[0] + ':00';
      napTimeCounts[hour] = (napTimeCounts[hour] || 0) + 1;
    }
  });
  const typicalNapTimes = Object.entries(napTimeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time]) => time);

  return {
    avgSleepDuration,
    commonMealTimes,
    favoriteLearningActivities,
    avgPlayDuration,
    typicalNapTimes,
  };
};

export default db;
