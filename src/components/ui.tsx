import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

// ─── Badge ────────────────────────────────────────────────────────────────────
const badgeStyles: Record<string, string> = {
  // Types
  assignment: 'bg-blue-50 text-blue-700 ring-blue-700/20',
  quiz:       'bg-amber-50 text-amber-700 ring-amber-600/20',
  project:    'bg-violet-50 text-violet-700 ring-violet-700/20',
  // Priority
  low:        'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  medium:     'bg-amber-50 text-amber-700 ring-amber-600/20',
  high:       'bg-red-50 text-red-700 ring-red-600/20',
  // Status
  pending:    'bg-gray-100 text-gray-600 ring-gray-500/20',
  ongoing:    'bg-blue-50 text-blue-700 ring-blue-700/20',
  done:       'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  // Role
  admin:      'bg-violet-50 text-violet-700 ring-violet-700/20',
  student:    'bg-sky-50 text-sky-700 ring-sky-700/20',
}

export function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[value] ?? 'bg-gray-100 text-gray-600'}`}>
      {value}
    </span>
  )
}

// ─── Button ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

const btnVariants = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary: 'bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-blue-500',
  danger:    'bg-white text-red-600 ring-1 ring-inset ring-red-300 hover:bg-red-50 focus-visible:ring-red-500',
  ghost:     'text-gray-500 hover:text-gray-800 hover:bg-gray-100 focus-visible:ring-blue-500',
}

const btnSizes = {
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3.5 py-2 text-sm',
}

export function Button({ variant = 'secondary', size = 'md', children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      {...props}
    />
  )
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

// ─── Textarea ─────────────────────────────────────────────────────────────────
export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      className={`block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none ${className}`}
      {...props}
    />
  )
}

// ─── FormField ────────────────────────────────────────────────────────────────
export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">{title}</h2>
        {children}
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl ring-1 ring-black/5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} />
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, message, action }: { icon: ReactNode; message: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      <div className="mb-3 text-gray-300">{icon}</div>
      <p className="text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
