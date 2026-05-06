import { ReactNode, ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

export function Badge({ value }: { value: string }) {
  // render a generic badge class; CSS maps specific variants
  const cls = `badge badge-${value}`
  return <span className={cls}>{value}</span>
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'secondary', size = 'md', children, className = '', ...props }: ButtonProps) {
  let base = ''
  if (variant === 'primary') base = 'btn-primary'
  else if (variant === 'secondary') base = 'btn-outline'
  else if (variant === 'danger') base = 'row-btn danger'
  else base = 'btn-outline'

  return (
    <button className={`${base} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={className} {...props} />
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={className} {...props}>{children}</select>
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={className} {...props} />
}

export function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}

export function Modal({ title, sub, width, onClose, children }: { title?: string; sub?: string; width?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={width ? { width } : undefined}>
        {title && <div className="modal-title">{title}</div>}
        {sub && <div className="modal-sub">{sub}</div>}
        {children}
      </div>
    </div>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`card ${className}`}>
      {children}
    </div>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return <div className={`spinner ${className}`} />
}

export function EmptyState({ icon, message, action }: { icon: ReactNode; message: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-text">{message}</p>
      {action && <div>{action}</div>}
    </div>
  )
}

export function Topbar({ title, actions }: { title: string; actions?: ReactNode }) {
  return (
    <div className="topbar">
      <div className="topbar-title">{title}</div>
      {actions && <div className="topbar-actions">{actions}</div>}
    </div>
  )
}
