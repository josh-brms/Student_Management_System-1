import { supabase } from './supabase'
import type { Task, TaskFormValues, TaskFilter } from '../types'

// ─── Fetch tasks (student sees own, admin sees all) ───────────────────────────
export async function fetchTasks(userId: string, isAdmin: boolean, filters: TaskFilter): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, profile:profiles(name)')
    .order('created_at', { ascending: false })

  if (!isAdmin) query = query.eq('user_id', userId)
  if (filters.status !== 'all') query = query.eq('status', filters.status)
  if (filters.type !== 'all') query = query.eq('type', filters.type)
  if (filters.search) query = query.ilike('title', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as Task[]
}

// ─── Create task ──────────────────────────────────────────────────────────────
export async function createTask(userId: string, values: TaskFormValues): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: values.title,
      description: values.description || null,
      type: values.type,
      priority: values.priority,
      status: values.status,
      due_date: values.due_date || null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Task
}

// ─── Update task ──────────────────────────────────────────────────────────────
export async function updateTask(taskId: string, values: Partial<TaskFormValues>): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({
      ...values,
      description: values.description || null,
      due_date: values.due_date || null,
    })
    .eq('id', taskId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data as Task
}

// ─── Delete task ──────────────────────────────────────────────────────────────
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId)
  if (error) throw new Error(error.message)
}

// ─── Cycle task status ────────────────────────────────────────────────────────
export async function cycleTaskStatus(task: Task): Promise<Task> {
  const cycle = { pending: 'ongoing', ongoing: 'done', done: 'pending' } as const
  return updateTask(task.id, { status: cycle[task.status] })
}

// ─── Task stats for dashboard ─────────────────────────────────────────────────
export async function fetchTaskStats(userId: string, isAdmin: boolean) {
  let query = supabase.from('tasks').select('status, type, due_date')
  if (!isAdmin) query = query.eq('user_id', userId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const tasks = data ?? []
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    ongoing: tasks.filter(t => t.status === 'ongoing').length,
    done: tasks.filter(t => t.status === 'done').length,
    overdue: tasks.filter(t => t.due_date && t.due_date < today && t.status !== 'done').length,
  }
}
