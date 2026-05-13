import { useEffect, useState } from 'react'
import { Trash2, Send, X, Tag as TagIcon, Plus } from 'lucide-react'
import { Modal, FormField, Input, Select, Textarea, Button } from './ui'
import { fetchSubjects } from '../lib/subjectApi'
import { fetchComments, addComment, deleteComment } from '../lib/taskApi'
import { fetchTags, createTag, fetchTaskTags, addTagToTask, removeTagFromTask } from '../lib/tagApi'
import { useAuth } from '../lib/AuthContext'
import type { Task, TaskFormValues, Subject, TaskComment, Tag } from '../types'

interface Props {
  task?: Task | null
  onSave: (values: TaskFormValues) => Promise<void>
  onDelete?: (task: Task) => void
  onClose: () => void
}

const defaultForm: TaskFormValues = {
  title: '', description: '', type: 'assignment',
  priority: 'medium', status: 'pending', due_date: '', subject_id: null,
}

const TAG_COLORS = ['#6366F1','#0EA5E9','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6']

export function TaskModal({ task, onSave, onDelete, onClose }: Props) {
  const { profile } = useAuth()
  const [form, setForm] = useState<TaskFormValues>(
    task ? {
      title:       task.title,
      description: task.description ?? '',
      type:        task.type,
      priority:    task.priority,
      status:      task.status,
      due_date:    task.due_date ?? '',
      subject_id:  task.subject_id ?? null,
    } : defaultForm
  )
  const [subjects,  setSubjects]  = useState<Subject[]>([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'tags'>('details')

  // Comments
  const [comments,     setComments]     = useState<TaskComment[]>([])
  const [commentText,  setCommentText]  = useState('')
  const [sendingComment, setSendingComment] = useState(false)

  // Tags
  const [allTags,    setAllTags]    = useState<Tag[]>([])
  const [taskTags,   setTaskTags]   = useState<Tag[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#6366F1')
  const [showTagCreate, setShowTagCreate] = useState(false)

  useEffect(() => {
    if (profile?.user_id) {
      fetchSubjects(profile.user_id).then(setSubjects).catch(() => {})
      fetchTags(profile.user_id).then(setAllTags).catch(() => {})
    }
    if (task?.task_id) {
      fetchComments(task.task_id).then(setComments).catch(() => {})
      fetchTaskTags(task.task_id).then(setTaskTags).catch(() => {})
    }
  }, [profile, task?.task_id])

  function set<K extends keyof TaskFormValues>(k: K, v: TaskFormValues[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required.'); return }
    if (!form.due_date)     { setError('Due date is required.'); return }
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSendComment() {
    if (!commentText.trim() || !profile?.user_id || !task?.task_id) return
    setSendingComment(true)
    try {
      const c = await addComment(task.task_id, profile.user_id, commentText.trim())
      setComments(cs => [...cs, c as TaskComment])
      setCommentText('')
    } finally {
      setSendingComment(false)
    }
  }

  async function handleDeleteComment(commentId: number) {
    await deleteComment(commentId)
    setComments(cs => cs.filter(c => c.comment_id !== commentId))
  }

  async function handleToggleTag(tag: Tag) {
    if (!task?.task_id) return
    const has = taskTags.some(t => t.tag_id === tag.tag_id)
    if (has) {
      await removeTagFromTask(task.task_id, tag.tag_id)
      setTaskTags(ts => ts.filter(t => t.tag_id !== tag.tag_id))
    } else {
      await addTagToTask(task.task_id, tag.tag_id)
      setTaskTags(ts => [...ts, tag])
    }
  }

  async function handleCreateTag() {
    if (!newTagName.trim() || !profile?.user_id) return
    try {
      const tag = await createTag(profile.user_id, newTagName.trim(), newTagColor)
      setAllTags(ts => [...ts, tag])
      setNewTagName('')
      setShowTagCreate(false)
    } catch {}
  }

  const tabStyle = (t: string) => ({
    padding: '6px 14px',
    fontSize: 12,
    fontWeight: 500,
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    background: activeTab === t ? 'var(--accent)' : 'transparent',
    color: activeTab === t ? '#fff' : 'var(--muted)',
    transition: 'all 0.15s',
  } as React.CSSProperties)

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal" style={{ width: 520, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div className="modal-title" style={{ marginBottom: 0 }}>
          {task ? 'Edit task' : 'New task'}
        </div>

        {/* Tabs — only show for existing tasks */}
        {task && (
          <div style={{ display: 'flex', gap: 4, margin: '12px 0', borderBottom: '0.5px solid var(--border)', paddingBottom: 12 }}>
            <button style={tabStyle('details')} onClick={() => setActiveTab('details')}>Details</button>
            <button style={tabStyle('comments')} onClick={() => setActiveTab('comments')}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </button>
            <button style={tabStyle('tags')} onClick={() => setActiveTab('tags')}>
              Tags {taskTags.length > 0 && `(${taskTags.length})`}
            </button>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>

          {/* ── DETAILS TAB ── */}
          {activeTab === 'details' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-field">
                <label>Title *</label>
                <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Task title" />
              </div>

        <FormField label="Subject (optional)">
          <Select value={form.subject_id ?? ''} onChange={e => set('subject_id', e.target.value ? Number(e.target.value) : null)}>
            <option value="">— No subject —</option>
            {subjects.map(s => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.code ? `${s.code} · ` : ''}{s.name}
              </option>
            ))}
          </Select>
        </FormField>

              <div className="form-row">
                <div className="form-field">
                  <label>Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value as any)}>
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => set('priority', e.target.value as any)}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Due date *</label>
                  <input type="date" required value={form.due_date} onChange={e => set('due_date', e.target.value)} />
                </div>
                <div className="form-field">
                  <label>Status</label>
                  <select value={form.status} onChange={e => set('status', e.target.value as any)}>
                    <option value="pending">Pending</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Optional details..." />
              </div>

              {error && <p style={{ color: 'var(--high-text)', fontSize: 12 }}>{error}</p>}
            </div>
          )}

          {/* ── COMMENTS TAB ── */}
          {activeTab === 'comments' && (
            <div>
              {comments.length === 0 ? (
                <div className="empty-state" style={{ padding: '30px 0' }}>
                  <div className="empty-text">No comments yet</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                  {comments.map(c => (
                    <div key={c.comment_id} style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 14px', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)' }}>
                          {(c as any).user?.name ?? 'You'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                            {new Date(c.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {(c.user_id === profile?.user_id || profile?.role === 'admin') && (
                            <button onClick={() => handleDeleteComment(c.comment_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, lineHeight: 1 }}>
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                  placeholder="Add a comment…"
                  style={{ flex: 1 }}
                />
                <button
                  onClick={handleSendComment}
                  disabled={!commentText.trim() || sendingComment}
                  className="btn-save"
                  style={{ padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Send size={13} />
                </button>
              </div>
            </div>
          )}

          {/* ── TAGS TAB ── */}
          {activeTab === 'tags' && (
            <div>
              {/* Current task tags */}
              {taskTags.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied tags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {taskTags.map(t => (
                      <span key={t.tag_id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, background: t.color_hex + '22', color: t.color_hex, fontSize: 12, fontWeight: 600 }}>
                        {t.name}
                        <button onClick={() => handleToggleTag(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.color_hex, padding: 0, lineHeight: 1, display: 'flex' }}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All available tags */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All tags</div>
                {allTags.length === 0 ? (
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>No tags yet. Create one below.</p>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {allTags.map(t => {
                      const applied = taskTags.some(x => x.tag_id === t.tag_id)
                      return (
                        <button
                          key={t.tag_id}
                          onClick={() => handleToggleTag(t)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                            background: applied ? t.color_hex : t.color_hex + '22',
                            color: applied ? '#fff' : t.color_hex,
                            border: 'none', cursor: 'pointer', transition: 'all 0.15s'
                          }}
                        >
                          <TagIcon size={10} /> {t.name}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Create new tag */}
              {showTagCreate ? (
                <div style={{ background: 'var(--bg)', borderRadius: 8, padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>New tag</div>
                  <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Tag name" style={{ marginBottom: 8 }} />
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {TAG_COLORS.map(c => (
                      <button key={c} onClick={() => setNewTagColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: `3px solid ${newTagColor === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer' }} />
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-cancel" onClick={() => setShowTagCreate(false)}>Cancel</button>
                    <button className="btn-save" onClick={handleCreateTag} style={{ padding: '5px 14px' }}>Create</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowTagCreate(true)} className="row-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                  <Plus size={12} /> New tag
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ marginTop: 16, paddingTop: 12, borderTop: '0.5px solid var(--border)', flexShrink: 0 }}>
          <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
          {task && onDelete && (
            <button type="button" className="row-btn danger" onClick={() => onDelete(task)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Trash2 size={13} /> Delete
            </button>
          )}
          {activeTab === 'details' && (
            <button type="submit" className="btn-save" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving…' : task ? 'Save changes' : 'Save task'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
