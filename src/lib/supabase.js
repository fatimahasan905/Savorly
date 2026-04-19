import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// If env vars aren't set yet, we use localStorage as a fallback
// so the app still works during development
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export async function saveProfile(profile) {
  if (!supabase) { localStorage.setItem('savorly_profile', JSON.stringify(profile)); return; }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('profiles').upsert({ user_id: user.id, data: profile, updated_at: new Date().toISOString() })
}

export async function loadProfile() {
  if (!supabase) {
    const s = localStorage.getItem('savorly_profile')
    return s ? JSON.parse(s) : null
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('data').eq('user_id', user.id).single()
  return data?.data || null
}

// ─── INVENTORY ────────────────────────────────────────────────────────────────

export async function saveInventory(items) {
  if (!supabase) { localStorage.setItem('savorly_inventory', JSON.stringify(items)); return; }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('inventory').upsert({ user_id: user.id, items, updated_at: new Date().toISOString() })
}

export async function loadInventory() {
  if (!supabase) {
    const s = localStorage.getItem('savorly_inventory')
    return s ? JSON.parse(s) : null
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('inventory').select('items').eq('user_id', user.id).single()
  return data?.items || null
}

// ─── MEAL BANK ────────────────────────────────────────────────────────────────

export async function saveMealBank(recipes) {
  if (!supabase) { localStorage.setItem('savorly_mealbank', JSON.stringify(recipes)); return; }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('meal_bank').upsert({ user_id: user.id, recipes, updated_at: new Date().toISOString() })
}

export async function loadMealBank() {
  if (!supabase) {
    const s = localStorage.getItem('savorly_mealbank')
    return s ? JSON.parse(s) : null
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('meal_bank').select('recipes').eq('user_id', user.id).single()
  return data?.recipes || null
}

// ─── WEEKLY PLAN ─────────────────────────────────────────────────────────────

export async function saveWeeklyPlan(plan) {
  if (!supabase) { localStorage.setItem('savorly_weeklyplan', JSON.stringify(plan)); return; }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase.from('weekly_plans').upsert({ user_id: user.id, plan, updated_at: new Date().toISOString() })
}

export async function loadWeeklyPlan() {
  if (!supabase) {
    const s = localStorage.getItem('savorly_weeklyplan')
    return s ? JSON.parse(s) : null
  }
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('weekly_plans').select('plan').eq('user_id', user.id).single()
  return data?.plan || null
}

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────

export async function signUp(email, password) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signUp({ email, password })
}

export async function signIn(email, password) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signOut() {
  if (!supabase) return
  return supabase.auth.signOut()
}

export async function getUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
