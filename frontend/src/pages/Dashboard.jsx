import { useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useTaskStore from '../store/taskStore'
import useProjectStore from '../store/projectStore'
import { SkeletonDashboard } from '../components/UI/Skeleton'
import { format, formatDistanceToNow, isPast } from 'date-fns'

const RadialChart = lazy(() => import('../components/Dashboard/RadialChart'))

const StatCard = ({ label, value, icon, color, sub }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.01 }}
    className="rounded-xl p-5 border bg-base-200 border-base-300 card-hover cursor-default"
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${color}`}>{sub}</span>
    </div>
    <div className="font-display text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-base-content/50">{label}</div>
  </motion.div>
)

const priorityColors = { low: 'text-emerald-400', medium: 'text-amber-400', high: 'text-orange-400', critical: 'text-red-400' }
const statusColors = { todo: 'status-todo', 'in-progress': 'status-in-progress', review: 'status-review', done: 'status-done' }

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

const DashboardPage = () => {
  const { user } = useAuthStore()
  const { dashboardStats, tasks, fetchDashboardStats, fetchTasks, loading } = useTaskStore()
  const { projects, fetchProjects } = useProjectStore()

  useEffect(() => {
    fetchDashboardStats()
    fetchTasks({ assignee: 'me', limit: 8 })
    fetchProjects()
  }, [])

  if (loading && !dashboardStats) return <SkeletonDashboard />

  const stats = dashboardStats
  const myTasks = tasks.filter(t => t.status !== 'done').slice(0, 5)
  const overdueTasks = tasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done')
  const recentProjects = projects.slice(0, 4)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">
          {greeting}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-base-content/50">Here's what's happening with your projects today.</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="My Active Tasks"
          value={stats?.myTasks ?? '—'}
          icon="📋"
          color="bg-blue-500/10 text-blue-400"
          sub="assigned to you"
        />
        <StatCard
          label="Overdue"
          value={stats?.overdueTasks ?? '—'}
          icon="⚠️"
          color={stats?.overdueTasks > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}
          sub={stats?.overdueTasks > 0 ? 'needs attention' : 'all clear'}
        />
        <StatCard
          label="Done This Week"
          value={stats?.completedThisWeek ?? '—'}
          icon="✅"
          color="bg-emerald-500/10 text-emerald-400"
          sub="completed"
        />
        <StatCard
          label="Projects"
          value={stats?.projectCount ?? '—'}
          icon="🎯"
          color="bg-purple-500/10 text-purple-400"
          sub="active"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Task Status Chart */}
        <motion.div variants={itemVariants}
          className="lg:col-span-1 rounded-xl border p-6 bg-base-200 border-base-300">
          <h2 className="font-display font-semibold mb-4 flex items-center gap-2">
            <span>📊</span> Task Overview
          </h2>
          {stats?.tasksByStatus ? (
            <Suspense fallback={<div className="h-48 shimmer rounded-lg" />}>
              <RadialChart data={stats.tasksByStatus} total={stats.totalTasks} />
            </Suspense>
          ) : (
            <div className="h-48 flex items-center justify-center text-base-content/30 text-sm">
              No data yet
            </div>
          )}
        </motion.div>

        {/* My Tasks */}
        <motion.div variants={itemVariants}
          className="lg:col-span-2 rounded-xl border p-6 bg-base-200 border-base-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold flex items-center gap-2">
              <span>📌</span> My Tasks
            </h2>
            <Link to="/tasks?assignee=me" className="text-xs text-primary hover:underline">View all →</Link>
          </div>
          {myTasks.length === 0 ? (
            <div className="text-center py-10 text-base-content/30">
              <div className="text-4xl mb-2">🎉</div>
              <p>No pending tasks. You're all caught up!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myTasks.map(task => (
                <Link
                  key={task._id}
                  to={`/tasks/${task._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-300/50 transition-colors group"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    task.priority === 'critical' ? 'bg-red-400 animate-pulse' :
                    task.priority === 'high' ? 'bg-orange-400' :
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{task.title}</p>
                    <p className="text-xs text-base-content/40">{task.project?.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[task.status]}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                    {task.dueDate && (
                      <span className={`text-xs ${isPast(new Date(task.dueDate)) ? 'text-red-400' : 'text-base-content/40'}`}>
                        {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Projects */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold flex items-center gap-2">
            <span>🚀</span> Recent Projects
          </h2>
          <Link to="/projects" className="text-xs text-primary hover:underline">All projects →</Link>
        </div>
        {recentProjects.length === 0 ? (
          <div className="rounded-xl border p-10 text-center bg-base-200 border-base-300">
            <div className="text-4xl mb-3">📁</div>
            <p className="text-base-content/50 mb-4">No projects yet</p>
            <Link to="/projects" className="btn btn-primary btn-sm">Create First Project</Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map(project => {
              const done = project.taskCounts?.done || 0
              const total = Object.values(project.taskCounts || {}).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <Link key={project._id} to={`/projects/${project._id}`}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    className="rounded-xl border p-5 bg-base-200 border-base-300 card-hover h-full"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-3 h-3 rounded-full mt-0.5"
                        style={{ background: project.color || '#6366f1' }}
                      />
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                        project.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>{project.status}</span>
                    </div>
                    <h3 className="font-display font-semibold text-sm mb-1 truncate">{project.name}</h3>
                    <p className="text-xs text-base-content/40 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-base-content/40">
                        <span>{done}/{total} tasks</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-base-300 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: project.color || 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                          }}
                        />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* Overdue Alert */}
      {overdueTasks.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center gap-3"
        >
          <span className="text-xl">🚨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-400">
              {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-base-content/50">
              {overdueTasks[0]?.title}{overdueTasks.length > 1 ? ` and ${overdueTasks.length - 1} more` : ''}
            </p>
          </div>
          <Link to="/tasks?overdue=true" className="text-xs text-red-400 hover:underline font-medium">
            View all →
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}

export default DashboardPage
