import { useEffect, useState, useRef } from 'react'
import { X, Send, Trash2 } from 'lucide-react'
import { fetchComments, addComment, deleteComment } from '../lib/taskApi'
import { useAuth } from '../lib/AuthContext'
import type { Task, TaskComment } from '../types'

interface Props {
  task: Task
  onClose: () => void
}

export function CommentsPanel({ task, onClose }: Props) {
  const { profile } = useAuth()
  const userId = profile?.user_id
  const [comments, setComments] = useState<TaskComment[]>([])
  const [loading,  setLoading]  = useState(false)
  const [text,     setText]     = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function load() {
    setLoading(true)
    try { setComments((await fetchComments(task.task_id)) as TaskComment[]) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [task.task_id])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [comments])

  async function handleSend() {
    if (!text.trim() || !userId) return
    setSending(true)
    try {
      await addComment(task.task_id, userId, text.trim())
      setText('')
      load()
    } finally { setSending(false) }
  }

  async function handleDelete(c: TaskComment) {
    await deleteComment(c.comment_id)
    load()
  }

  function initials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end',
      background: 'rgba(0,0,0,0.3)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        width: 380, height: '100%', background: 'var(--surface)', display: 'flex', flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>Comments</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{task.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="var(--muted)" />
          </button>
        </div>

        {/* Comments list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {loading ? (
            <div style={{ textAlign: 'center', paddingTop: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : comments.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 40, color: 'var(--muted)', fontSize: 13 }}>
              No comments yet. Be the first!
            </div>
          ) : (
            comments.map(c => {
              const isOwn = c.user_id === userId
              return (
                <div key={c.comment_id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: isOwn ? 'var(--primary)' : 'var(--border)',
                    color: isOwn ? 'white' : 'var(--text)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0
                  }}>
                    {initials(c.user?.name ?? 'U')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{c.user?.name ?? 'Unknown'}</span>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{
                      background: isOwn ? 'var(--ongoing-bg)' : 'var(--bg)',
                      borderRadius: 8, padding: '8px 12px', fontSize: 13, color: 'var(--text)', lineHeight: 1.5,
                    }}>
                      {c.content}
                    </div>
                  </div>
                  {isOwn && (
                    <button onClick={() => handleDelete(c)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, marginTop: 20, opacity: 0.5 }}>
                      <Trash2 size={13} color="var(--high-text)" />
                    </button>
                  )}
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 20px', borderTop: '0.5px solid var(--border)', display: 'flex', gap: 10 }}>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
            placeholder="Write a comment… (Enter to send)"
            rows={2}
            style={{
              flex: 1, resize: 'none', padding: '8px 12px', fontSize: 13,
              border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg)', color: 'var(--text)', fontFamily: 'inherit',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            style={{
              width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)',
              border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', alignSelf: 'flex-end', opacity: !text.trim() || sending ? 0.4 : 1,
            }}
          >
            <Send size={14} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}
