import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { fetchTasks } from '../lib/taskApi'
import { Topbar } from '../components/Topbar'
import type { Task } from '../types'

export function CalendarPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  const today = new Date()
  // normalize to start of day for accurate comparisons
  const todayStart = new Date(today)
  todayStart.setHours(0, 0, 0, 0)
  const currentYear = todayStart.getFullYear()
  const currentMonth = todayStart.getMonth()

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchTasks(user.id, false, { status: 'all', type: 'all', search: '' })
      setTasks(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [user])

  // Get task due dates for this month
  const taskDates = new Set(
    tasks
      .filter(t => {
        const dueDate = t.due_date ? new Date(t.due_date) : null
        return dueDate && dueDate.getFullYear() === currentYear && dueDate.getMonth() === currentMonth
      })
      .map(t => t.due_date ? new Date(t.due_date).getDate() : 0)
      .filter(d => d > 0)
  )

  // Get overdue task dates (before today)
  const overdueDates = new Set(
    tasks
      .filter(t => {
        const dueDate = t.due_date ? new Date(t.due_date) : null
        return dueDate && dueDate < todayStart && dueDate.getFullYear() === currentYear && dueDate.getMonth() === currentMonth
      })
      .map(t => t.due_date ? new Date(t.due_date).getDate() : 0)
      .filter(d => d > 0)
  )

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Month name
  const monthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  const dayLabels = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  // Generate calendar grid
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div className="main">
      <Topbar title="Calendar" />
      <div className="content">
        <div className="card" style={{padding: 28}}>
          <div style={{fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 20}}>
            {monthName}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center'}}>
            {dayLabels.map(day => (
              <div key={day} style={{fontSize: 11, color: 'var(--muted)', padding: 4, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                {day}
              </div>
            ))}
          </div>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, textAlign: 'center', marginTop: 4}}>
            {calendarDays.map((day, idx) => {
              const hasTask = day && taskDates.has(day)
              const isOverdue = day && overdueDates.has(day)
              const isToday = day === todayStart.getDate()
              
              return (
                <div
                  key={idx}
                  style={{
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    fontSize: 13,
                    fontWeight: isToday ? 700 : isOverdue || hasTask ? 500 : 400,
                    color: isOverdue ? 'var(--overdue-text)' : day ? 'var(--text)' : 'transparent',
                    background: isOverdue
                      ? 'var(--overdue-bg)'
                      : hasTask 
                      ? 'var(--ongoing-bg)' 
                      : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'all 0.12s'
                  }}
                >
                  {day}
                </div>
              )
            })}
          </div>

          {/* Task list for selected date - optional, can be added */}
          <div style={{marginTop: 28, paddingTop: 20, borderTop: '0.5px solid var(--border)'}}>
            <div style={{fontSize: 13, fontWeight: 500, color: 'var(--text)', marginBottom: 12}}>
              Tasks this month
            </div>
            {tasks.filter(t => {
              const dueDate = t.due_date ? new Date(t.due_date) : null
              return dueDate && dueDate.getFullYear() === currentYear && dueDate.getMonth() === currentMonth
            }).length === 0 ? (
              <div style={{fontSize: 12, color: 'var(--muted)'}}>No tasks scheduled for {monthName.toLowerCase()}</div>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: 8}}>
                {tasks
                  .filter(t => {
                    const dueDate = t.due_date ? new Date(t.due_date) : null
                    return dueDate && dueDate.getFullYear() === currentYear && dueDate.getMonth() === currentMonth
                  })
                  .sort((a, b) => {
                    const aDate = a.due_date ? new Date(a.due_date).getTime() : 0
                    const bDate = b.due_date ? new Date(b.due_date).getTime() : 0
                    return aDate - bDate
                  })
                  .map(task => {
                    const dueDate = task.due_date ? new Date(task.due_date) : new Date()
                    const dueFmt = dueDate.toLocaleDateString('en-PH', {month: 'short', day: 'numeric'})
                    return (
                      <div key={task.id} style={{display: 'flex', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--border)'}}>
                        <div style={{
                          width: 28,
                          height: 28,
                          borderRadius: 4,
                          background: `var(--${task.type}-bg)`,
                          color: `var(--${task.type}-text)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontWeight: 500
                        }}>
                          {dueDate.getDate()}
                        </div>
                        <div style={{flex: 1, minWidth: 0}}>
                          <div style={{fontSize: 13, fontWeight: 500, color: 'var(--text)'}}>{task.title}</div>
                          <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 2}}>{dueFmt}</div>
                        </div>
                        <span className={`badge badge-${task.status}`} style={{height: 22}}>
                          {task.status}
                        </span>
                      </div>
                    )
                  })
                }
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
