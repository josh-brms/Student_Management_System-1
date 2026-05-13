import { supabase } from './supabase'
import type { User, UserFormValues } from '../types'

export async function fetchAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as User[]
}

// Used by ProfileEditModal — keep alias so no change needed there
export async function updateProfile(userId: number, values: Partial<Pick<User, 'name' | 'role' | 'is_active'>>): Promise<User> {
  return updateUser(userId, values)
}

export async function updateUser(userId: number, values: Partial<Pick<User, 'name' | 'role' | 'is_active'>>): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .update(values)
    .eq('user_id', userId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as User
}

export async function toggleUserActive(userId: number, is_active: boolean): Promise<void> {
  const { error } = await supabase.from('users').update({ is_active }).eq('user_id', userId)
  if (error) throw new Error(error.message)
}

export async function adminCreateUser(values: UserFormValues): Promise<{ error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email: values.email, password: values.password,
    options: { data: { name: values.name } },
  })
  if (error) return { error: error.message }
  if (data.user) {
    const { error: insertErr } = await supabase
      .from('users')
      .upsert({ name: values.name, email: values.email, password_hash: 'managed_by_supabase_auth', role: values.role },
               { onConflict: 'email' })
    if (insertErr) return { error: insertErr.message }
  }
  return { error: null }
}

export async function fetchAuditLogs(userId?: number) {
  let query = supabase
    .from('audit_logs')
    .select('*, user:users(name)')
    .order('changed_at', { ascending: false })
    .limit(50)
  if (userId) query = query.eq('user_id', userId)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}
