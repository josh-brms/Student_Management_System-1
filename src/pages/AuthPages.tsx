import { useState, FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function isGmailEmail(email: string) {
  const normalized = normalizeEmail(email)
  const atIndex = normalized.lastIndexOf('@')
  if (atIndex < 0) return false
  const domain = normalized.slice(atIndex + 1)
  return domain === 'gmail.com'
}

// ─── Login (Student Only) ─────────────────────────────────────────────────────
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
    if (!isGmailEmail(email)) {
      setError('Email must be a Gmail account (@gmail.com)')
      return
    }
    setLoading(true)
    const { error } = await signIn(normalizeEmail(email), password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="login-logo">TaskMate · Divine Word College</div>
        <div className="login-title">Welcome back, Student</div>
        <div className="login-sub">Sign in to manage your academic tasks</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@school.edu" 
              required 
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
          {error && <p style={{fontSize: '12px', color: '#B91C1C', marginBottom: '12px'}}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          No account? <Link to="/register" style={{textDecoration: 'none', color: 'inherit'}}>Register here</Link>
        </div>
        <div style={{marginTop: 16, paddingTop: 16, borderTop: '0.5px solid var(--border)', textAlign: 'center', fontSize: 12}}>
          Are you an administrator? <Link to="/admin/login" style={{textDecoration: 'none', color: 'var(--ongoing-text)', fontWeight: 500}}>Sign in here</Link>
        </div>
      </div>
    </div>
  )
}

// ─── Admin Login ──────────────────────────────────────────────────────────────
export function AdminLoginPage() {
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
    const { error } = await signIn(normalizeEmail(email), password)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/users')
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="login-logo">TaskMate · Admin Panel</div>
        <div className="login-title">Administrator Login</div>
        <div className="login-sub">Sign in to manage users and tasks</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="admin@gmail.com" 
              required 
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="••••••••" 
              required 
            />
          </div>
          {error && <p style={{fontSize: '12px', color: '#B91C1C', marginBottom: '12px'}}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="login-footer">
          Student? <Link to="/login" style={{textDecoration: 'none', color: 'var(--ongoing-text)', fontWeight: 500}}>Sign in here</Link>
        </div>
      </div>
    </div>
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
    if (!isGmailEmail(email)) {
      setError('Email must be a Gmail account (@gmail.com)')
      return
    }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    const { error } = await signUp(normalizeEmail(email), password, name)
    setLoading(false)
    if (error) { setError(error); return }
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="login-card">
        <div className="login-logo">TaskMate · Create Account</div>
        <div className="login-title">Get started</div>
        <div className="login-sub">Create your student account</div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Full name</label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Juan dela Cruz" 
              required 
            />
          </div>
          <div className="field">
            <label>Email address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="you@gmail.com" 
              required 
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Min. 8 characters" 
              required 
            />
          </div>
          <div className="field">
            <label>Confirm password</label>
            <input 
              type="password" 
              value={confirm} 
              onChange={e => setConfirm(e.target.value)} 
              placeholder="Repeat password" 
              required 
            />
          </div>
          {error && <p style={{fontSize: '12px', color: '#B91C1C', marginBottom: '12px'}}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <div className="login-footer">
          Already have one? <Link to="/login" style={{textDecoration: 'none', color: 'inherit'}}>Sign in</Link>
        </div>
      </div>
    </div>
  )
}

