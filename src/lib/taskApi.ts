import { supabase } from './supabase'
import type { Task, TaskFormValues, TaskFilter } from '../types'

// ─── Fetch tasks ──────────────────────────────────────────────────────────────
export async function fetchTasks(userId: number, isAdmin: boolean, filters: TaskFilter): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, subject:subjects(name, color_hex, code), user:users(name, email)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })

  if (!isAdmin) query = query.eq('user_id', userId)
  if (filters.status !== 'all')     query = query.eq('status', filters.status)
  if (filters.type !== 'all')       query = query.eq('type', filters.type)
  if (filters.subject_id !== 'all') query = query.eq('subject_id', filters.subject_id)
  if (filters.search)               query = query.ilike('title', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

// ─── Create task ──────────────────────────────────────────────────────────────
export async function createTask(userId: number, values: TaskFormValues): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id:     userId,
      subject_id:  values.subject_id ?? null,
      title:       values.title,
      description: values.description || null,
      type:        values.type,
      priority:    values.priority,
      status:      values.status,
      due_date:    values.due_date,
    })
    .select('*, subject:subjects(name, color_hex, code)')
    .single()

  if (error) throw new Error(error.message)

  // Write audit log
  await writeAuditLog(userId, (data as Task).task_id, 'CREATE', null, null, values.title)

  return data as Task
}

// ─── Update task ──────────────────────────────────────────────────────────────
export async function updateTask(taskId: number, userId: number, values: Partial<TaskFormValues>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...values,
      subject_id:  values.subject_id ?? null,
      description: values.description || null,
    })
    .eq('task_id', taskId)
    .select('*, subject:subjects(name, color_hex, code)')
    .single()

  if (error) throw new Error(error.message)

  // Write audit log for status changes
  if (values.status) {
    await writeAuditLog(userId, taskId, 'UPDATE', 'status', null, values.status)
  }

  return data as Task
}

// ─── Soft delete task ─────────────────────────────────────────────────────────
export async function deleteTask(taskId: number, userId: number): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .update({ is_deleted: true })
    .eq('task_id', taskId)

  if (error) throw new Error(error.message)
  await writeAuditLog(userId, taskId, 'DELETE', null, null, null)
}

// ─── Cycle task status ────────────────────────────────────────────────────────
export async function cycleTaskStatus(task: Task, userId: number): Promise<Task> {
  const cycle = { pending: 'ongoing', ongoing: 'done', done: 'pending' } as const
  const newStatus = cycle[task.status]
  const completed_at = newStatus === 'done' ? new Date().toISOString() : null
  return updateTask(task.task_id, userId, { status: newStatus, ...(completed_at ? { completed_at } : {}) } as any)
}

// ─── Task stats ───────────────────────────────────────────────────────────────
export async function fetchTaskStats(userId: number, isAdmin: boolean) {
  let query = supabase
    .from('tasks')
    .select('status, due_date')
    .eq('is_deleted', false)

  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const tasks = data ?? []
  const today = new Date().toISOString().slice(0, 10)
  return {
    total:   tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    done:    tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
  }
}

// ─── Comments ─────────────────────────────────────────────────────────────────
export async function fetchComments(taskId: number) {
  const { data, error } = await supabase
    .from('task_comments')
    .select('*, user:users(name)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addComment(taskId: number, userId: number, content: string) {
  const { data, error } = await supabase
    .from('task_comments')
    .insert({ task_id: taskId, user_id: userId, content })
    .select('*, user:users(name)')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteComment(commentId: number): Promise<void> {
  const { error } = await supabase.from('task_comments').delete().eq('comment_id', commentId)
  if (error) throw new Error(error.message)
}

// ─── Audit log writer ─────────────────────────────────────────────────────────
async function writeAuditLog(
  userId: number,
  taskId: number,
  action: string,
  field: string | null,
  oldVal: string | null,
  newVal: string | null
) {
  await supabase.from('audit_logs').insert({
    user_id:       userId,
    task_id:       taskId,
    action,
    field_changed: field,
    old_value:     oldVal,
    new_value:     newVal,
  })
}
