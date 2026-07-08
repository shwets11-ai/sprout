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

// ─── Family Management ────────────────────────────────────────

/**
 * Create a new family and add current user as the first member.
 * @param {string} name - family name
 * @returns {Promise<Object>} the created family
 */
export async function createFamily(name) {
  const userId = await getUserId()
  const { data: family, error: famError } = await supabase
    .from('families')
    .insert({ name })
    .select()
    .single()
  if (famError) throw famError

  const { error: memError } = await supabase
    .from('family_members')
    .insert({ family_id: family.id, user_id: userId })
  if (memError) throw memError

  return family
}

/**
 * Get all families the current user belongs to.
 * @returns {Promise<Array>}
 */
export async function getMyFamilies() {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('family_members')
    .select('family_id, families(*)')
    .eq('user_id', userId)
  if (error) throw error
  return (data || []).map((row) => row.families)
}

/**
 * Get all members of a family.
 * @param {number} familyId
 * @returns {Promise<Array>}
 */
export async function getFamilyMembers(familyId) {
  // Avoid joining to auth.users (very slow) — just return user_ids
  const { data, error } = await supabase
    .from('family_members')
    .select('user_id, created_at')
    .eq('family_id', familyId)
  if (error) throw error
  return data || []
}

// ─── Toddler Management ───────────────────────────────────────

/**
 * Create a toddler in a family.
 * @param {number} familyId
 * @param {string} name
 * @param {string} [birthDate] - YYYY-MM-DD
 * @returns {Promise<Object>}
 */
export async function createToddler(familyId, name, birthDate) {
  const { data, error } = await supabase
    .from('toddlers')
    .insert({ family_id: familyId, name, birth_date: birthDate || null })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Get all toddlers in a family.
 * @param {number} familyId
 * @returns {Promise<Array>}
 */
export async function getToddlers(familyId) {
  const { data, error } = await supabase
    .from('toddlers')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Get all toddlers from all families the user belongs to.
 * @returns {Promise<Array>}
 */
export async function getAllMyToddlers() {
  const userId = await getUserId()
  // Step 1: get family IDs the user belongs to
  const { data: memberships, error: memError } = await supabase
    .from('family_members')
    .select('family_id')
    .eq('user_id', userId)
  if (memError) throw memError

  const familyIds = (memberships || []).map((m) => m.family_id)
  if (familyIds.length === 0) return []

  // Step 2: get all toddlers in those families
  const { data, error } = await supabase
    .from('toddlers')
    .select('*')
    .in('family_id', familyIds)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

// ─── Invitation Management ────────────────────────────────────

/**
 * Invite someone to join a family.
 * @param {number} familyId
 * @param {string} email
 * @returns {Promise<Object>}
 */
export async function inviteMember(familyId, email) {
  const token = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36)
  const { data, error } = await supabase
    .from('invitations')
    .insert({ family_id: familyId, email, token })
    .select()
    .single()
  if (error) throw error
  return data
}

/**
 * Accept an invitation and join the family.
 * @param {string} token
 * @returns {Promise<Object>}
 */
export async function acceptInvite(token) {
  const userId = await getUserId()
  // Get the invitation
  const { data: invite, error: invError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .single()
  if (invError || !invite) throw new Error('Invalid or expired invitation')

  // Add user to family
  const { error: memError } = await supabase
    .from('family_members')
    .insert({ family_id: invite.family_id, user_id: userId })
  if (memError) throw memError

  // Mark invitation as accepted
  const { error: updError } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('id', invite.id)
  if (updError) throw updError

  return invite
}

/**
 * Get pending invitations for a family.
 * @param {number} familyId
 * @returns {Promise<Array>}
 */
export async function getPendingInvitations(familyId) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('family_id', familyId)
    .is('accepted_at', null)
  if (error) throw error
  return data || []
}

// ─── Activity CRUD (with optional toddlerId) ──────────────────

/**
 * Add a new activity record.
 * @param {'meals'|'learning'|'sleep'|'play'} category
 * @param {Object} data - activity fields
 * @param {number} [toddlerId] - optional toddler id
 * @returns {Promise<Object>}
 */
export async function addActivity(category, data, toddlerId) {
  const userId = await getUserId()
  const payload = { user_id: userId, ...data }
  if (toddlerId !== undefined) payload.toddler_id = toddlerId
  const { data: row, error } = await supabase
    .from(category)
    .insert(payload)
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
 * @param {string} date - YYYY-MM-DD
 * @param {number} [toddlerId] - optional filter by toddler
 * @returns {Promise<Array>}
 */
export async function getActivitiesByDate(date, toddlerId) {
  const userId = await getUserId()
  const tables = ['meals', 'learning', 'sleep', 'play']
  const results = await Promise.all(
    tables.map(async (table) => {
      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('time', { ascending: true, nullsFirst: false })
        .limit(30)
      if (toddlerId !== undefined) {
        query = query.eq('toddler_id', toddlerId)
      }
      const { data, error } = await query
      if (error) throw error
      return (data || []).map((row) => ({ ...row, category: table === 'meals' ? 'meal' : table }))
    })
  )
  return results.flat()
}

/**
 * Get all activities from the last N days.
 * @param {number} [days=7]
 * @param {number} [toddlerId] - optional filter by toddler
 * @returns {Promise<Array>}
 */
export async function getRecentActivities(days = 7, toddlerId) {
  const userId = await getUserId()
  const since = getDateNDaysAgo(days)
  const tables = ['meals', 'learning', 'sleep', 'play']
  const results = await Promise.all(
    tables.map(async (table) => {
      let query = supabase
        .from(table)
        .select('*')
        .eq('user_id', userId)
        .gte('date', since)
        .lte('date', getTodayStr())
        .order('date', { ascending: true })
        .order('time', { ascending: true })
        .limit(50)
      if (toddlerId !== undefined) {
        query = query.eq('toddler_id', toddlerId)
      }
      const { data, error } = await query
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
 * @param {number} [toddlerId] - optional filter by toddler
 * @returns {Promise<Object>}
 */
export async function getScheduleInsights(toddlerId) {
  const activities = await getRecentActivities(7, toddlerId)

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

  const playRecords = activities.filter((a) => a.category === 'play')
  let avgPlayDuration = 0
  if (playRecords.length > 0) {
    avgPlayDuration = Math.round(
      playRecords.reduce((sum, p) => sum + (p.duration || 0), 0) / playRecords.length
    )
  }

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
