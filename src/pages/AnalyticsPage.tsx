import { useEffect, useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { fetchAnalytics } from '../lib/analyticsApi'
import { Topbar } from '../components/Topbar'
import type { AnalyticsData } from '../lib/analyticsApi'

export function AnalyticsPage() {
  const { profile } = useAuth()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const analytics = await fetchAnalytics()
        setData(analytics)
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="main"><Topbar title="Analytics" /><div className="content"><div className="spinner"></div></div></div>
  if (!data) return <div className="main"><Topbar title="Analytics" /><div className="content"><p>Failed to load analytics</p></div></div>

  return (
    <div className="main">
      <Topbar title="Analytics" />
      <div className="content">
        <div style={{marginBottom: 28}}>
          <h1 className="login-title">System Analytics 📊</h1>
          <p className="login-sub">Real-time insights into task management and student performance</p>
        </div>

        {/* Key Metrics */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total Tasks</div>
            <div className="stat-val">{data.totalTasks}</div>
            <div className="stat-sub">across all students</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Completion Rate</div>
            <div className="stat-val" style={{color: 'var(--done-text)'}}>{data.completionRate}%</div>
            <div className="stat-sub">{data.completedTasks} completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Students</div>
            <div className="stat-val">{data.totalStudents}</div>
            <div className="stat-sub">active users</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Overdue Tasks</div>
            <div className="stat-val" style={{color: 'var(--high-text)'}}>{data.overdueTasks}</div>
            <div className="stat-sub">need attention</div>
          </div>
        </div>

        {/* Task Status Distribution */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, marginBottom: 28}}>
          {/* Status Chart */}
          <div className="card">
            <div style={{fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)'}}>Task Status Distribution</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Pending</span>
                  <span style={{fontWeight: 500}}>{data.tasksByStatus.pending}</span>
                </div>
                <div style={{height: 8, background: 'var(--pending-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--pending-text)', width: `${data.totalTasks > 0 ? (data.tasksByStatus.pending / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Ongoing</span>
                  <span style={{fontWeight: 500}}>{data.tasksByStatus.ongoing}</span>
                </div>
                <div style={{height: 8, background: 'var(--ongoing-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--ongoing-text)', width: `${data.totalTasks > 0 ? (data.tasksByStatus.ongoing / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Done</span>
                  <span style={{fontWeight: 500}}>{data.tasksByStatus.done}</span>
                </div>
                <div style={{height: 8, background: 'var(--done-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--done-text)', width: `${data.totalTasks > 0 ? (data.tasksByStatus.done / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="card">
            <div style={{fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)'}}>Priority Distribution</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>High</span>
                  <span style={{fontWeight: 500}}>{data.tasksByPriority.high}</span>
                </div>
                <div style={{height: 8, background: 'var(--high-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--high-text)', width: `${data.totalTasks > 0 ? (data.tasksByPriority.high / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Medium</span>
                  <span style={{fontWeight: 500}}>{data.tasksByPriority.medium}</span>
                </div>
                <div style={{height: 8, background: 'var(--med-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--med-text)', width: `${data.totalTasks > 0 ? (data.tasksByPriority.medium / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Low</span>
                  <span style={{fontWeight: 500}}>{data.tasksByPriority.low}</span>
                </div>
                <div style={{height: 8, background: 'var(--low-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--low-text)', width: `${data.totalTasks > 0 ? (data.tasksByPriority.low / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Type Distribution */}
          <div className="card">
            <div style={{fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)'}}>Task Type Distribution</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Assignment</span>
                  <span style={{fontWeight: 500}}>{data.tasksByType.assignment}</span>
                </div>
                <div style={{height: 8, background: 'var(--assignment-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--assignment-text)', width: `${data.totalTasks > 0 ? (data.tasksByType.assignment / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Quiz</span>
                  <span style={{fontWeight: 500}}>{data.tasksByType.quiz}</span>
                </div>
                <div style={{height: 8, background: 'var(--quiz-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--quiz-text)', width: `${data.totalTasks > 0 ? (data.tasksByType.quiz / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12}}>
                  <span>Project</span>
                  <span style={{fontWeight: 500}}>{data.tasksByType.project}</span>
                </div>
                <div style={{height: 8, background: 'var(--project-bg)', borderRadius: 4, overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'var(--project-text)', width: `${data.totalTasks > 0 ? (data.tasksByType.project / data.totalTasks) * 100 : 0}%`}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Student Performance */}
        <div className="card" style={{marginBottom: 28}}>
          <div style={{fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)'}}>Top Student Performance</div>
          <div style={{overflowX: 'auto'}}>
            <table className="task-table" style={{width: '100%'}}>
              <thead>
                <tr style={{borderBottom: '1px solid var(--border)'}}>
                  <th style={{textAlign: 'left', padding: '10px 0', fontSize: 12, fontWeight: 500, color: 'var(--muted)'}}>Student</th>
                  <th style={{textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: 500, color: 'var(--muted)'}}>Total Tasks</th>
                  <th style={{textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: 500, color: 'var(--muted)'}}>Completed</th>
                  <th style={{textAlign: 'center', padding: '10px 0', fontSize: 12, fontWeight: 500, color: 'var(--muted)'}}>Completion %</th>
                </tr>
              </thead>
              <tbody>
                {data.studentPerformance.map((student, idx) => (
                  <tr key={idx} style={{borderBottom: '0.5px solid var(--border)', padding: '12px 0'}}>
                    <td style={{padding: '12px 0', fontSize: 13}}>{student.name}</td>
                    <td style={{textAlign: 'center', padding: '12px 0', fontSize: 13}}>{student.totalTasks}</td>
                    <td style={{textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--done-text)', fontWeight: 500}}>{student.completedTasks}</td>
                    <td style={{textAlign: 'center', padding: '12px 0', fontSize: 13}}>
                      <div style={{display: 'inline-block', background: 'var(--done-bg)', color: 'var(--done-text)', padding: '4px 8px', borderRadius: 4, fontSize: 12}}>
                        {student.completionRate}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        {data.overdueTasksList.length > 0 && (
          <div className="card" style={{marginBottom: 28, borderLeft: '4px solid var(--high-text)', background: 'var(--high-bg)'}}>
            <div style={{fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--high-text)'}}>⚠️ Overdue Tasks Alert ({data.overdueTasksList.length})</div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
              {data.overdueTasksList.map((task, idx) => (
                <div key={idx} style={{padding: '10px', background: 'var(--surface)', borderRadius: 6, fontSize: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <div style={{fontSize: 13, fontWeight: 500, color: 'var(--text)'}}>{task.title}</div>
                    <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 4}}>📌 {task.studentName} • Due: {task.dueDate}</div>
                  </div>
                  <div style={{background: 'var(--high-text)', color: 'white', padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 500, minWidth: 80, textAlign: 'center'}}>
                    {task.daysOverdue}d overdue
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="card">
          <div style={{fontSize: 13, fontWeight: 500, marginBottom: 16, color: 'var(--text)'}}>Recent Activity</div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
            {data.recentActivity.map((activity, idx) => (
              <div key={idx} style={{padding: '12px', background: 'var(--bg)', borderRadius: 6, fontSize: 12, borderLeft: '3px solid var(--ongoing-text)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 13, fontWeight: 500, color: 'var(--text)'}}>{activity.taskTitle}</div>
                    <div style={{fontSize: 11, color: 'var(--muted)', marginTop: 4}}>by {activity.studentName}</div>
                  </div>
                  <div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
                    <span className={`badge badge-${activity.status}`} style={{height: 20, fontSize: 10}}>
                      {activity.status}
                    </span>
                    <span style={{fontSize: 11, color: 'var(--muted)', minWidth: 100, textAlign: 'right'}}>{activity.updatedAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
