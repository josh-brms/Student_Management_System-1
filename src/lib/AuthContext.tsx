import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  function formatAuthError(error: unknown) {
    if (error instanceof Error && error.message) {
      return error.message
    }

    return 'Unable to reach Supabase. Check your Vercel environment variables and Supabase project URL.'
  }

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (!error && data) setProfile(data as Profile)
    } catch {
      setProfile(null)
    }
  }

  async function refreshProfile() {
    if (user) await fetchProfile(user.id)
  }

  useEffect(() => {
    // Restore session on mount
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user.id).finally(() => setLoading(false))
        else setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error: error?.message ?? null }
    } catch (error) {
      return { error: formatAuthError(error) }
    }
  }

  async function signUp(email: string, password: string, name: string) {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      return { error: error?.message ?? null }
    } catch (error) {
      return { error: formatAuthError(error) }
    }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
