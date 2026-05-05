import { supabase } from './supabase'
import type { Profile, UserFormValues } from '../types'

// ─── Fetch all profiles (admin only) ─────────────────────────────────────────
export async function fetchAllProfiles(): Promise<Profile[]> {
  // We join with auth.users email via a Supabase function or use admin API.
  // Here we use a simple profiles select + the auth admin API pattern.
  // If you want emails, use the Supabase Admin API from a server function.
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Profile[]
}

// ─── Update profile ───────────────────────────────────────────────────────────
export async function updateProfile(userId: string, values: Partial<Pick<Profile, 'name' | 'role'>>): Promise<Profile> {
  const updateData: Record<string, unknown> = {}
  if (values.name !== undefined) updateData.name = values.name
  if (values.role !== undefined) updateData.role = values.role

  const { data, error } = await ((supabase
    .from('profiles') as any)
    .update(updateData)
    .eq('id', userId)
    .select()
    .single() as any)

  if (error) throw new Error(error.message)
  return data as Profile
}

// ─── Admin: invite / create user ─────────────────────────────────────────────
// NOTE: Supabase signUp from the client creates a new auth user.
// For production admin-created users, use Supabase Edge Functions with the
// Service Role key (never expose service role on the client).
// This helper creates a user via standard signUp (sends confirmation email).
export async function adminCreateUser(values: UserFormValues): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { name: values.name, role: values.role },
    },
  })
  return { error: error?.message ?? null }
}

// ─── Toggle user active state (stored as role manipulation or a custom field) ─
// Since Supabase Auth doesn't expose ban/deactivate on anon key,
// we track this in a custom `active` column you can add to profiles.
// Add: alter table public.profiles add column active boolean not null default true;
export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const updateData: Record<string, unknown> = { active }

  const { error } = await ((supabase
    .from('profiles') as any)
    .update(updateData)
    .eq('id', userId) as any)

  if (error) throw new Error(error.message)
}
