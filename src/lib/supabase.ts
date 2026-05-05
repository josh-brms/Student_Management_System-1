import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─── Environment Variables ────────────────────────────────────────────────────
// Create a .env file at the project root with these two values.
// You'll find them in: Supabase Dashboard → Project Settings → API
//
//   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGci...
//
function cleanEnvValue(value: string | undefined) {
  return (value ?? '').trim().replace(/^['"]|['"]$/g, '')
}

function normalizeSupabaseUrl(value: string | undefined) {
  const cleaned = cleanEnvValue(value).replace(/\/+$/, '')
  if (!cleaned) return ''
  if (/^https?:\/\//i.test(cleaned)) return cleaned.replace(/^http:\/\//i, 'https://')
  if (/^[a-z0-9-]+\.supabase\.(co|in)(\/.*)?$/i.test(cleaned)) return `https://${cleaned}`
  return cleaned
}

function createMissingConfigClient(message: string) {
  const configError = { message }

  const queryBuilder = {
    select() {
      return this
    },
    insert() {
      return this
    },
    update() {
      return this
    },
    delete() {
      return this
    },
    eq() {
      return this
    },
    order() {
      return this
    },
    ilike() {
      return this
    },
    single() {
      return this
    },
    then(resolve: (value: { data: null; error: { message: string } }) => unknown) {
      return Promise.resolve(resolve({ data: null, error: configError }))
    },
  }

  return {
    auth: {
      async getSession() {
        return { data: { session: null }, error: configError }
      },
      onAuthStateChange() {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        }
      },
      async signInWithPassword() {
        return { data: null, error: configError }
      },
      async signUp() {
        return { data: null, error: configError }
      },
      async signOut() {
        return { error: configError }
      },
    },
    from() {
      return queryBuilder
    },
  } as unknown as SupabaseClient
}

const supabaseUrl = normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL)
const supabaseAnonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY)
const supabaseConfigError =
  !supabaseUrl || !supabaseAnonKey || !/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)(\/.*)?$/i.test(supabaseUrl)
    ? 'Supabase is not configured correctly. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your real Supabase project values in Vercel.'
    : ''

export const supabase = supabaseConfigError
  ? createMissingConfigClient(supabaseConfigError)
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

export const isSupabaseConfigured = !supabaseConfigError
