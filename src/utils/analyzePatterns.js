/**
 * Analyzes a week's worth of activities and returns structured insights.
 * @param {Array} activities - Array of activity objects with a `category` field
 * @returns {Object} insights
 */
export function analyzePatterns(activities) {
  const sleepRecords = activities.filter((a) => a.category === 'sleep');
  const mealRecords = activities.filter((a) => a.category === 'meal');
  const learningRecords = activities.filter((a) => a.category === 'learning');
  const playRecords = activities.filter((a) => a.category === 'play');

  // ── Sleep Analysis ──────────────────────────────────────────
  let averageWakeTime = null;
  let averageBedtime = null;
  if (sleepRecords.length > 0) {
    const nightSleeps = sleepRecords.filter((s) => s.type === 'night');
    const naps = sleepRecords.filter((s) => s.type === 'nap');

    if (nightSleeps.length > 0) {
      const wakeMinutes = nightSleeps
        .map((s) => {
          const [h, m] = (s.endTime || '07:00').split(':').map(Number);
          return h * 60 + m;
        })
        .reduce((a, b) => a + b, 0);
      averageWakeTime = minutesToTime(Math.round(wakeMinutes / nightSleeps.length));

      const bedMinutes = nightSleeps
        .map((s) => {
          const [h, m] = (s.startTime || '20:00').split(':').map(Number);
          return h * 60 + m;
        })
        .reduce((a, b) => a + b, 0);
      averageBedtime = minutesToTime(Math.round(bedMinutes / nightSleeps.length));
    }
  }

  // ── Meal Times ──────────────────────────────────────────────
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

  // ── Learning Analysis ───────────────────────────────────────
  const activityTypeCounts = {};
  learningRecords.forEach((l) => {
    if (l.activityType) {
      activityTypeCounts[l.activityType] = (activityTypeCounts[l.activityType] || 0) + 1;
    }
  });
  const topLearningActivities = Object.entries(activityTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type]) => type);

  const avgLearningMinutes = learningRecords.length > 0
    ? Math.round(learningRecords.reduce((s, l) => s + (l.duration || 0), 0) / learningRecords.length)
    : 0;

  // ── Nap Analysis ────────────────────────────────────────────
  const naps = sleepRecords.filter((s) => s.type === 'nap');
  const avgNapDuration = naps.length > 0
    ? Math.round(naps.reduce((s, n) => {
        if (n.startTime && n.endTime) {
          const [sh, sm] = n.startTime.split(':').map(Number);
          const [eh, em] = n.endTime.split(':').map(Number);
          return s + ((eh * 60 + em) - (sh * 60 + sm));
        }
        return s;
      }, 0) / naps.length)
    : 0;

  // Count unique days with naps
  const uniqueNapDays = new Set(naps.map((n) => n.date)).size;
  const napsPerDay = uniqueNapDays > 0 ? (naps.length / uniqueNapDays) : 0;

  // ── Play Analysis ───────────────────────────────────────────
  const playTimeCounts = {};
  playRecords.forEach((p) => {
    if (p.time) {
      const hour = p.time.split(':')[0] + ':00';
      playTimeCounts[hour] = (playTimeCounts[hour] || 0) + 1;
    }
  });
  const mostCommonPlayTimes = Object.entries(playTimeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time]) => time);

  return {
    averageWakeTime,
    averageBedtime,
    commonMealTimes,
    topLearningActivities,
    avgLearningMinutes,
    avgNapDuration,
    napsPerDay: Math.round(napsPerDay * 10) / 10,
    mostCommonPlayTimes,
  };
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
