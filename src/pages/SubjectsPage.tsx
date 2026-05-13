import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../lib/subjectApi'
import { Topbar } from '../components/Topbar'
import type { Subject, SubjectFormValues } from '../types'

const COLORS = ['#6366F1','#0EA5E9','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#14B8A6']

const emptyForm: SubjectFormValues = { name: '', code: '', color_hex: '#6366F1', instructor_name: '' }

export function SubjectsPage() {
  const { profile } = useAuth()
  const userId = profile?.user_id

  const [subjects, setSubjects]   = useState<Subject[]>([])
  const [loading,  setLoading]    = useState(false)
  const [modal,    setModal]      = useState<null | 'create' | Subject>(null)
  const [form,     setForm]       = useState<SubjectFormValues>(emptyForm)
  const [saving,   setSaving]     = useState(false)
  const [error,    setError]      = useState('')
  const [delTarget, setDelTarget] = useState<Subject | null>(null)

  async function load() {
    if (!userId) return
    setLoading(true)
    try { setSubjects(await fetchSubjects(userId)) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [userId])

  function openCreate() { setForm(emptyForm); setError(''); setModal('create') }
  function openEdit(s: Subject) {
    setForm({ name: s.name, code: s.code ?? '', color_hex: s.color_hex, instructor_name: s.instructor_name ?? '' })
    setError('')
    setModal(s)
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Subject name is required.'); return }
    if (!userId) return
    setSaving(true)
    try {
      if (modal === 'create') {
        await createSubject(userId, form)
      } else if (modal && typeof modal === 'object') {
        await updateSubject(modal.subject_id, form)
      }
      setModal(null)
      load()
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!delTarget) return
    try { await deleteSubject(delTarget.subject_id); setDelTarget(null); load() }
    catch (e: any) { alert(e.message) }
  }

  return (
    <div className="main">
      <Topbar title="Subjects" onNewClick={openCreate} showNewButton />
      <div className="content">
        <div style={{ marginBottom: 24 }}>
          <h1 className="login-title">My Subjects</h1>
          <p className="login-sub">Organize your tasks by subject or course.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : subjects.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <div className="empty-text">No subjects yet</div>
            <button className="btn-new" onClick={openCreate} style={{ margin: '0 auto' }}>
              <Plus size={12} /> Add subject
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {subjects.map(s => (
              <div key={s.subject_id} className="card" style={{ borderLeft: `4px solid ${s.color_hex}`, padding: 20, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{s.name}</div>
                    {s.code && <div style={{ fontSize: 11, color: s.color_hex, fontWeight: 600, marginTop: 2 }}>{s.code}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button className="row-btn" onClick={() => openEdit(s)} style={{ padding: '4px 8px' }}><Pencil size={12} /></button>
                    <button className="row-btn danger" onClick={() => setDelTarget(s)} style={{ padding: '4px 8px' }}><Trash2 size={12} /></button>
                  </div>
                </div>
                {s.instructor_name && (
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>👤 {s.instructor_name}</div>
                )}
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
                  Added {new Date(s.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modal !== null && (
        <div className="modal-overlay open">
          <div className="modal">
            <div className="modal-title">{modal === 'create' ? 'New subject' : 'Edit subject'}</div>
            <div className="form-field">
              <label>Subject name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Software Engineering" />
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>Code</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="e.g. CSPC321" />
              </div>
              <div className="form-field">
                <label>Instructor</label>
                <input value={form.instructor_name} onChange={e => setForm(f => ({ ...f, instructor_name: e.target.value }))} placeholder="Prof. Santos" />
              </div>
            </div>
            <div className="form-field">
              <label>Color</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, color_hex: c }))} style={{
                    width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${form.color_hex === c ? 'var(--text)' : 'transparent'}`, cursor: 'pointer'
                  }} />
                ))}
              </div>
            </div>
            {error && <p style={{ color: 'var(--high-text)', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn-save" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {delTarget && (
        <div className="modal-overlay open">
          <div className="modal" style={{ width: 320 }}>
            <div className="modal-title">Delete subject?</div>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
              "<strong>{delTarget.name}</strong>" will be removed. Tasks linked to it will remain but lose their subject.
            </p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setDelTarget(null)}>Cancel</button>
              <button className="btn-save" onClick={handleDelete} style={{ background: '#B91C1C' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
