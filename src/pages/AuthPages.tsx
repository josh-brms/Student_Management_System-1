import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Button, Input, FormField } from '../components/ui'

// ─── Login ────────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your STMS account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Email">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@cspc.edu.ph" required />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        </FormField>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Create one</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── Register ─────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await signUp(email, password, name)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/dashboard')
  }

  return (
    <AuthLayout title="Create account" subtitle="Join STMS to manage your academic tasks">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Full name">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Juan dela Cruz" required />
        </FormField>
        <FormField label="Email">
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@cspc.edu.ph" required />
        </FormField>
        <FormField label="Password">
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" required />
        </FormField>
        <FormField label="Confirm password">
          <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" required />
        </FormField>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <Button type="submit" variant="primary" className="w-full justify-center" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-center text-xs text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── Shared layout ────────────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm ring-1 ring-black/5 p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600">
              <GraduationCap size={18} className="text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-800">STMS</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  )
}
