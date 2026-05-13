import { useState, FormEvent, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// ─── Animated background: floating particles on canvas ───────────────────────
function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    let W = 0, H = 0

    interface Particle {
      x: number; y: number
      vx: number; vy: number
      r: number; alpha: number
    }

    const particles: Particle[] = []
    const COUNT = 52

    function resize() {
      W = canvas!.width  = window.innerWidth
      H = canvas!.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.35 + 0.08,
      })
    }

    // Palette: blues and teals matching the app's --primary
    const colors = ['#1356A0', '#3b82f6', '#60a5fa', '#0ea5e9', '#2563eb']

    function draw() {
      ctx!.clearRect(0, 0, W, H)

      // Draw connecting lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx!.beginPath()
            ctx!.moveTo(particles[i].x, particles[i].y)
            ctx!.lineTo(particles[j].x, particles[j].y)
            ctx!.strokeStyle = `rgba(19, 86, 160, ${0.07 * (1 - dist / 110)})`
            ctx!.lineWidth = 0.7
            ctx!.stroke()
          }
        }
      }

      // Draw particles
      particles.forEach((p, idx) => {
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx!.fillStyle = colors[idx % colors.length]
        ctx!.globalAlpha = p.alpha
        ctx!.fill()
        ctx!.globalAlpha = 1

        p.x += p.vx
        p.y += p.vy
        if (p.x < -10) p.x = W + 10
        if (p.x > W + 10) p.x = -10
        if (p.y < -10) p.y = H + 10
        if (p.y > H + 10) p.y = -10
      })

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <>
      <canvas id="auth-canvas" ref={canvasRef} />
      <div className="auth-grid" />
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      {/* Floating ambient task pills */}
      <div className="auth-pill auth-pill-1">
        <span className="auth-pill-dot ongoing" />Quiz due tomorrow
      </div>
      <div className="auth-pill auth-pill-2">
        <span className="auth-pill-dot done" />3 tasks completed
      </div>
      <div className="auth-pill auth-pill-3">
        <span className="auth-pill-dot high" />Project deadline today
      </div>
      <div className="auth-pill auth-pill-4">
        <span className="auth-pill-dot pending" />2 pending assignments
      </div>
    </>
  )
}

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
      <AuthBackground />
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
      <AuthBackground />
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
      <AuthBackground />
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

