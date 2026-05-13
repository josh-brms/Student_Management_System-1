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
  // Fetch all tasks with user info
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('*, user:users(name)')

  if (tasksError) throw new Error(tasksError.message)

  // Fetch all students
  const { data: students, error: studentsError } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'student')

  if (studentsError) throw new Error(studentsError.message)

  const taskList = (tasks ?? []) as any[]
  const studentList = (students ?? []) as any[]

  // Calculate basic metrics
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const totalTasks = taskList.length
  const completedTasks = taskList.filter(t => t.status === 'done').length
  const pendingTasks = taskList.filter(t => t.status === 'pending').length
  const ongoingTasks = taskList.filter(t => t.status === 'ongoing').length
  const overdueTasks = taskList.filter(t => {
    if (!t.due_date || t.status === 'done') return false
    const dueDate = new Date(t.due_date)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }).length

  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Calculate average time to complete (simplified - using created_at to updated_at)
  const completedTasksData = taskList.filter(t => t.status === 'done')
  const totalTime = completedTasksData.reduce((sum, t) => {
    const created = new Date(t.created_at).getTime()
    const updated = new Date(t.updated_at).getTime()
    return sum + (updated - created)
  }, 0)
  const averageTimeToComplete = completedTasksData.length > 0 ? Math.round(totalTime / completedTasksData.length / (1000 * 60 * 60 * 24)) : 0

  // Tasks by priority
  const tasksByPriority = {
    high: taskList.filter(t => t.priority === 'high').length,
    medium: taskList.filter(t => t.priority === 'medium').length,
    low: taskList.filter(t => t.priority === 'low').length,
  }

  // Tasks by type
  const tasksByType = {
    assignment: taskList.filter(t => t.type === 'assignment').length,
    quiz: taskList.filter(t => t.type === 'quiz').length,
    project: taskList.filter(t => t.type === 'project').length,
  }

  // Tasks by status
  const tasksByStatus = {
    pending: pendingTasks,
    ongoing: ongoingTasks,
    done: completedTasks,
  }

  // Student performance
  const studentPerformance = studentList.map(student => {
    const studentTasks = taskList.filter(t => t.user_id === student.user_id)
    const completedStudentTasks = studentTasks.filter(t => t.status === 'done').length
    const completionRate = studentTasks.length > 0 ? (completedStudentTasks / studentTasks.length) * 100 : 0
    return {
      name: student.name,
      totalTasks: studentTasks.length,
      completedTasks: completedStudentTasks,
      completionRate: Math.round(completionRate),
    }
  }).sort((a, b) => b.completionRate - a.completionRate)

  // Overdue tasks
  const overdueTasksList = taskList
    .filter(t => {
      if (!t.due_date || t.status === 'done') return false
      const dueDate = new Date(t.due_date)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate < today
    })
    .map(t => {
      const dueDate = new Date(t.due_date)
      dueDate.setHours(0, 0, 0, 0)
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
      return {
        title: t.title,
        studentName: t.user?.name ?? 'Unknown',
        dueDate: new Date(t.due_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
        daysOverdue,
      }
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 10)

  // Recent activity (last 10 updated tasks)
  const recentActivity = taskList
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10)
    .map(t => ({
      taskTitle: t.title,
      studentName: t.user?.name ?? 'Unknown',
      status: t.status,
      updatedAt: new Date(t.updated_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    }))

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    ongoingTasks,
    overdueTasks,
    completionRate: Math.round(completionRate),
    averageTimeToComplete,
    totalStudents: studentList.length,
    tasksByPriority,
    tasksByType,
    tasksByStatus,
    studentPerformance,
    overdueTasksList,
    recentActivity,
  }
}
