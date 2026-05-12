import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile, User } from '../types'

interface AuthContextValue {
  supabaseUser: SupabaseUser | null
  session:      Session | null
  profile:      Profile | null
  loading:      boolean
  signIn:       (email: string, password: string) => Promise<{ error: string | null }>
  signUp:       (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut:      () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)
  const [session,      setSession]      = useState<Session | null>(null)
  const [profile,      setProfile]      = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)

  async function fetchProfile(email: string, authId: string): Promise<Profile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (!error && data) {
        const p: Profile = { ...(data as User), id: authId }
        setProfile(p)
        return p
      }

      // Row doesn't exist yet — create it on the fly (handles OAuth / manual Auth signups)
      const name = email.split('@')[0]
      const { data: inserted, error: insertErr } = await supabase
        .from('users')
        .insert({ name, email, password_hash: 'managed_by_supabase_auth', role: 'student' })
        .select()
        .single()

      if (!insertErr && inserted) {
        const p: Profile = { ...(inserted as User), id: authId }
        setProfile(p)
        return p
      }
    } catch {
      // swallow
    }
    return null
  }

  async function refreshProfile() {
    if (supabaseUser?.email) await fetchProfile(supabaseUser.email, supabaseUser.id)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user?.email) {
        fetchProfile(session.user.email, session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setSupabaseUser(session?.user ?? null)
      if (session?.user?.email) fetchProfile(session.user.email, session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error) {
        await supabase.from('users').update({ last_login_at: new Date().toISOString() }).eq('email', email)
        return { error: null }
      }
      const message = error.message ?? 'Unable to sign in.'
      if (message.toLowerCase().includes('invalid login credentials')) {
        return { error: 'Incorrect email or password.' }
      }
      return { error: message }
    } catch (e: any) {
      return { error: e?.message ?? 'Something went wrong.' }
    }
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) return { error: error.message }

    if (data.user) {
      // Upsert so duplicate signups don't crash
      const { error: upsertErr } = await supabase
        .from('users')
        .upsert({ name, email, password_hash: 'managed_by_supabase_auth', role: 'student' },
                 { onConflict: 'email' })
      if (upsertErr) return { error: upsertErr.message }
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ supabaseUser, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
