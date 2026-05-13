import { supabase } from './supabase'

export interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  ongoingTasks: number
  overdueTasks: number
  completionRate: number
  averageTimeToComplete: number
  totalStudents: number
  tasksByPriority: { high: number; medium: number; low: number }
  tasksByType: { assignment: number; quiz: number; project: number }
  tasksByStatus: { pending: number; ongoing: number; done: number }
  studentPerformance: Array<{ name: string; totalTasks: number; completedTasks: number; completionRate: number }>
  overdueTasksList: Array<{ title: string; studentName: string; dueDate: string; daysOverdue: number }>
  recentActivity: Array<{ taskTitle: string; studentName: string; status: string; updatedAt: string }>
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  // Fetch all tasks joined with users (new schema)
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*, user:users(name, user_id)')
    .eq('is_deleted', false)

  if (tasksError) throw new Error(tasksError.message)

  // Fetch all student users (new schema — public.users, role = student)
  const { data: students, error: studentsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')
    .eq('is_active', true)

  if (studentsError) throw new Error(studentsError.message)

  const taskList    = (tasks    ?? []) as any[]
  const studentList = (students ?? []) as any[]

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalTasks     = taskList.length
  const completedTasks = taskList.filter(t => t.status === 'done').length
  const pendingTasks   = taskList.filter(t => t.status === 'pending').length
  const ongoingTasks   = taskList.filter(t => t.status === 'ongoing').length
  const overdueTasks   = taskList.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const d = new Date(t.due_date); d.setHours(0,0,0,0)
    return d < today
  }).length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const completedData = taskList.filter(t => t.status === 'done' && t.completed_at)
  const totalTime = completedData.reduce((sum, t) => {
    return sum + (new Date(t.completed_at).getTime() - new Date(t.created_at).getTime())
  }, 0)
  const averageTimeToComplete = completedData.length > 0
    ? Math.round(totalTime / completedData.length / (1000 * 60 * 60 * 24))
    : 0

  const tasksByPriority = {
    high:   taskList.filter(t => t.priority === 'high').length,
    medium: taskList.filter(t => t.priority === 'medium').length,
    low:    taskList.filter(t => t.priority === 'low').length,
  }

  const tasksByType = {
    assignment: taskList.filter(t => t.type === 'assignment').length,
    quiz:       taskList.filter(t => t.type === 'quiz').length,
    project:    taskList.filter(t => t.type === 'project').length,
  }

  const tasksByStatus = { pending: pendingTasks, ongoing: ongoingTasks, done: completedTasks }

  // Student performance — match by user_id (int in new schema)
  const studentPerformance = studentList.map(s => {
    const st = taskList.filter(t => t.user_id === s.user_id)
    const done = st.filter(t => t.status === 'done').length
    return {
      name: s.name,
      totalTasks: st.length,
      completedTasks: done,
      completionRate: st.length > 0 ? Math.round((done / st.length) * 100) : 0,
    }
  }).sort((a, b) => b.completionRate - a.completionRate)

  const overdueTasksList = taskList
    .filter(t => {
      if (!t.due_date || t.status === 'done') return false
      const d = new Date(t.due_date); d.setHours(0,0,0,0)
      return d < today
    })
    .map(t => {
      const d = new Date(t.due_date); d.setHours(0,0,0,0)
      return {
        title:       t.title,
        studentName: t.user?.name ?? 'Unknown',
        dueDate:     new Date(t.due_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysOverdue: Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)),
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 10)

  const recentActivity = taskList
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map(t => ({
      taskTitle:   t.title,
      studentName: t.user?.name ?? 'Unknown',
      status:      t.status,
      updatedAt:   new Date(t.updated_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }))

  return {
    totalTasks, completedTasks, pendingTasks, ongoingTasks, overdueTasks,
    completionRate: Math.round(completionRate), averageTimeToComplete,
    totalStudents: studentList.length,
    tasksByPriority, tasksByType, tasksByStatus,
    studentPerformance, overdueTasksList, recentActivity,
  }
}
