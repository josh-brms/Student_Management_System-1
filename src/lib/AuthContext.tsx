import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Profile, User } from '../types'

interface AuthContextValue {
  supabaseUser: SupabaseUser | null
  session:      Session | null
  profile:      Profile | null       // row from public.users plus auth id
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

  async function fetchProfile(email: string, authId: string | null = null) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      if (!error && data) setProfile({ ...(data as User), id: authId ?? '' })
    } catch {
      // profile not ready yet
    }
  }

  async function refreshProfile() {
    if (supabaseUser?.email) await fetchProfile(supabaseUser.email)
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
        return { error: 'Incorrect password' }
      }
      return { error: message }
    } catch (error: any) {
      return { error: error?.message ?? 'Something went wrong.' }
    }
  }

  async function signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name } },
    })
    if (error) return { error: error.message }

    if (data.user) {
      const { error: insertErr } = await supabase.from('users').insert({
        name,
        email,
        password_hash: 'managed_by_supabase_auth',
        role: 'student',
      })
      if (insertErr) return { error: insertErr.message }
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
