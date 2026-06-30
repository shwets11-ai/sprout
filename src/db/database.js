import { supabase } from '../lib/supabase'

// ─── Utility functions (no auth needed) ───────────────────────

/** Return today's date as YYYY-MM-DD */
export function getTodayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function getDateNDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// ─── Auth helper ──────────────────────────────────────────────

async function getUserId() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Not authenticated')
  return user.id
}

// ─── CRUD helpers ─────────────────────────────────────────────

/**
 * Add a new activity record.
 * @param {'meals'|'learning'|'sleep'|'play'} category
 * @param {Object} data - activity fields (date, time, etc.)
 * @returns {Promise<Object>} the inserted row
 */
export async function addActivity(category, data) {
  const userId = await getUserId()
  const { data: row, error } = await supabase
    .from(category)
    .insert({ user_id: userId, ...data })
    .select()
    .single()
  if (error) throw error
  return row
}

/**
 * Delete an activity record.
 * @param {'meals'|'learning'|'sleep'|'play'} category
 * @param {number} id
 */
export async function deleteActivity(category, id) {
  const userId = await getUserId()
  const { error } = await supabase
    .from(category)
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
  if (error) throw error
}

/**
 * Get all activities for a single date across all categories.
 * Returns a flat array sorted by time, each item with a `category` field.
 * @param {string} date - YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function getActivitiesByDate(date) {
  const userId = await getUserId()
  const tables = ['meals', 'learning', 'sleep', 'play']
  const results = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
      if (error) throw error
      return (data || []).map((row) => ({ ...row, category: table === 'meals' ? 'meal' : table }))
    })
  )
  return results.flat().sort((a, b) => (a.time || '').localeCompare(b.time || ''))
}

/**
 * Get all activities from the last N days.
 * @param {number} days - defaults to 7
 * @returns {Promise<Array>}
 */
export async function getRecentActivities(days = 7) {
  const userId = await getUserId()
  const since = getDateNDaysAgo(days)
  const tables = ['meals', 'learning', 'sleep', 'play']
  const results = await Promise.all(
    tables.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .gte('date', since)
        .lte('date', getTodayStr())
        .order('date', { ascending: true })
      if (error) throw error
      return (data || []).map((row) => ({ ...row, category: table === 'meals' ? 'meal' : table }))
    })
  )
  return results.flat().sort((a, b) => {
    const dc = (a.date || '').localeCompare(b.date || '')
    return dc !== 0 ? dc : (a.time || '').localeCompare(b.time || '')
  })
}

// ─── Schedule Insights ────────────────────────────────────────

/**
 * Analyzes the last 7 days of data and returns structured insights.
 * @returns {Promise<Object>}
 */
export async function getScheduleInsights() {
  const activities = await getRecentActivities(7)

  // Sleep analysis
  const sleepRecords = activities.filter((a) => a.category === 'sleep')
  let avgSleepDuration = 0
  if (sleepRecords.length > 0) {
    const totalMinutes = sleepRecords.reduce((sum, s) => {
      if (s.startTime && s.endTime) {
        const [sh, sm] = s.startTime.split(':').map(Number)
        const [eh, em] = s.endTime.split(':').map(Number)
        let startMin = sh * 60 + sm
        let endMin = eh * 60 + em
        if (endMin < startMin) endMin += 24 * 60
        return sum + (endMin - startMin)
      }
      return sum
    }, 0)
    avgSleepDuration = Math.round(totalMinutes / sleepRecords.length)
  }

  // Meal time analysis
  const mealRecords = activities.filter((a) => a.category === 'meal')
  const mealTimeCounts = {}
  mealRecords.forEach((m) => {
    if (m.time) {
      const hour = m.time.split(':')[0] + ':00'
      mealTimeCounts[hour] = (mealTimeCounts[hour] || 0) + 1
    }
  })
  const commonMealTimes = Object.entries(mealTimeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([time]) => time)

  // Learning analysis
  const learningRecords = activities.filter((a) => a.category === 'learning')
  const activityTypeCounts = {}
  learningRecords.forEach((l) => {
    if (l.activityType) {
      activityTypeCounts[l.activityType] = (activityTypeCounts[l.activityType] || 0) + 1
    }
  })
  const favoriteLearningActivities = Object.entries(activityTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type]) => type)

  // Play duration
  const playRecords = activities.filter((a) => a.category === 'play')
  let avgPlayDuration = 0
  if (playRecords.length > 0) {
    avgPlayDuration = Math.round(
      playRecords.reduce((sum, p) => sum + (p.duration || 0), 0) / playRecords.length
    )
  }

  // Nap time analysis
  const napRecords = sleepRecords.filter((s) => s.type === 'nap')
  const napTimeCounts = {}
  napRecords.forEach((n) => {
    if (n.startTime) {
      const hour = n.startTime.split(':')[0] + ':00'
      napTimeCounts[hour] = (napTimeCounts[hour] || 0) + 1
    }
  })
  const typicalNapTimes = Object.entries(napTimeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([time]) => time)

  return {
    avgSleepDuration,
    commonMealTimes,
    favoriteLearningActivities,
    avgPlayDuration,
    typicalNapTimes,
  }
}
