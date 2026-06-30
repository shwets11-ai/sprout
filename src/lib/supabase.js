import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

/**
 * Sign up a new user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data, error}>}
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { data, error }
}

/**
 * Sign in an existing user with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data, error}>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

/**
 * Sign out the current user.
 * @returns {Promise<{error}>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get the current session.
 * @returns {Promise<{data: {session}}>}
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data
}

/**
 * Listen to auth state changes.
 * @param {function} callback - called with (event, session)
 * @returns {object} subscription
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
