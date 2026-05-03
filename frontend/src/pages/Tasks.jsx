import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import useTaskStore from '../store/taskStore'
import useProjectStore from '../store/projectStore'
import { SkeletonList } from '../components/UI/Skeleton'
import { formatDistanceToNow, isPast, format } from 'date-fns'

const PRIORITY_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#f97316', critical: '#f87171' }
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' }
const STATUS_CLASSES = {
  todo: 'bg-slate-500/10 text-slate-400',
  'in-progress': 'bg-blue-500/10 text-blue-400',
  review: 'bg-purple-500/10 text-purple-400',
  done: 'bg-emerald-500/10 text-emerald-400'
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
}
const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } }
}

const TaskRow = ({ task, onUpdate, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done'

  return (
    <motion.div variants={itemVariants} layout>
      <div
        className="rounded-xl border bg-base-200 border-base-300 overflow-hidden hover:border-primary/30 transition-colors group"
        style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}` }}
      >
        <div
          className="flex items-center gap-3 p-4 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          {/* Status toggle */}
          <button
            onClick={e => {
              e.stopPropagation()
              const next = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : task.status === 'in-progress' ? 'review' : 'done'
              onUpdate(task._id, { status: next })
            }}
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-base-content/30 hover:border-primary'
            }`}
            title="Cycle status"
          >
            {task.status === 'done' && <span className="text-xs">✓</span>}
          </button>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-base-content/40' : ''}`}>
              {task.title}
            </p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-base-content/40">{task.project?.name}</span>
              {isOverdue && <span className="text-xs text-red-400">● Overdue</span>}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <select
              value={task.status}
              onChange={e => { e.stopPropagation(); onUpdate(task._id, { status: e.target.value }) }}
              onClick={e => e.stopPropagation()}
              className={`text-xs px-2 py-1 rounded-lg border-none focus:outline-none cursor-pointer ${STATUS_CLASSES[task.status]}`}
            >
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>

            {task.assignee && (
              <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center hidden sm:flex"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                title={task.assignee.name}>
                {task.assignee.name?.[0]}
              </div>
            )}

            {task.dueDate && (
              <span className={`text-xs hidden md:block ${isOverdue ? 'text-red-400' : 'text-base-content/40'}`}>
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            <div className="flex items-center gap-1">
              <span className="text-base-content/30 text-xs">{expanded ? '▲' : '▼'}</span>
              <button
                onClick={e => { e.stopPropagation(); onDelete(task._id) }}
                className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all text-xs"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0 border-t border-base-300">
                {task.description && (
                  <p className="text-sm text-base-content/60 my-3">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-3 text-xs text-base-content/50">
                  <span>Priority: <span className="font-medium capitalize" style={{ color: PRIORITY_COLORS[task.priority] }}>{task.priority}</span></span>
                  {task.assignee && <span>Assigned: <span className="font-medium text-base-content/70">{task.assignee.name}</span></span>}
                  {task.dueDate && <span>Due: <span className={`font-medium ${isOverdue ? 'text-red-400' : 'text-base-content/70'}`}>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span></span>}
                  <span>Created: {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                  {task.comments?.length > 0 && <span>💬 {task.comments.length} comment{task.comments.length > 1 ? 's' : ''}</span>}
                </div>
                {task.tags?.length > 0 && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const TasksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { tasks, loading, fetchTasks, updateTask, deleteTask } = useTaskStore()
  const { projects, fetchProjects } = useProjectStore()
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    project: searchParams.get('project') || '',
    assignee: searchParams.get('assignee') || '',
    overdue: searchParams.get('overdue') || '',
    search: ''
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  useEffect(() => {
    const params = {}
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.project) params.project = filters.project
    if (filters.assignee) params.assignee = filters.assignee
    if (filters.overdue) params.overdue = filters.overdue
    fetchTasks(params)
  }, [filters.status, filters.priority, filters.project, filters.assignee, filters.overdue])

  const filteredTasks = filters.search
    ? tasks.filter(t => t.title.toLowerCase().includes(filters.search.toLowerCase()))
    : tasks

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: p[key] === val ? '' : val }))

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) await deleteTask(id)
  }

  const stats = {
    total: filteredTasks.length,
    done: filteredTasks.filter(t => t.status === 'done').length,
    overdue: filteredTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'done').length
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pt-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl font-bold mb-1">All Tasks</h1>
        <div className="flex items-center gap-4 text-sm text-base-content/50">
          <span>{stats.total} tasks</span>
          <span className="text-emerald-400">{stats.done} done</span>
          {stats.overdue > 0 && <span className="text-red-400">{stats.overdue} overdue</span>}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
        className="flex flex-col gap-3 mb-6">
        <input
          type="search"
          placeholder="Search tasks..."
          className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
          value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
        />
        <div className="flex gap-2 flex-wrap">
          {/* Assignee */}
          <button
            onClick={() => setFilter('assignee', 'me')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
              filters.assignee === 'me' ? 'bg-primary/20 text-primary border-primary/30' : 'bg-base-200 border-base-300 hover:border-primary/30'
            }`}
          >
            👤 My Tasks
          </button>

          {/* Overdue */}
          <button
            onClick={() => setFilter('overdue', 'true')}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border ${
              filters.overdue === 'true' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-base-200 border-base-300 hover:border-red-500/30'
            }`}
          >
            ⚠️ Overdue
          </button>

          {/* Status filters */}
          {Object.entries(STATUS_LABELS).map(([v, l]) => (
            <button key={v}
              onClick={() => setFilter('status', v)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border capitalize ${
                filters.status === v ? `${STATUS_CLASSES[v]} border-current` : 'bg-base-200 border-base-300 hover:border-base-content/20'
              }`}
            >
              {l}
            </button>
          ))}

          {/* Priority */}
          {['low', 'medium', 'high', 'critical'].map(p => (
            <button key={p}
              onClick={() => setFilter('priority', p)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all border capitalize ${
                filters.priority === p
                  ? 'text-white border-transparent'
                  : 'bg-base-200 border-base-300 hover:border-base-content/20'
              }`}
              style={filters.priority === p ? { background: PRIORITY_COLORS[p] } : {}}
            >
              {p}
            </button>
          ))}

          {/* Project filter */}
          {projects.length > 0 && (
            <select
              value={filters.project}
              onChange={e => setFilters(p => ({ ...p, project: e.target.value }))}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium border transition-all bg-base-200 focus:outline-none cursor-pointer ${
                filters.project ? 'border-primary/30 text-primary bg-primary/10' : 'border-base-300'
              }`}
            >
              <option value="">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          )}

          {/* Clear */}
          {(filters.status || filters.priority || filters.project || filters.assignee || filters.overdue) && (
            <button
              onClick={() => setFilters({ status: '', priority: '', project: '', assignee: '', overdue: '', search: '' })}
              className="text-xs px-3 py-1.5 rounded-lg font-medium bg-base-300 text-base-content/60 hover:text-base-content transition-colors"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Task list */}
      {loading && tasks.length === 0 ? (
        <SkeletonList count={5} lines={2} />
      ) : filteredTasks.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 rounded-xl border border-dashed border-base-300">
          <div className="text-5xl mb-3">📭</div>
          <h3 className="font-display text-xl font-semibold mb-2">No tasks found</h3>
          <p className="text-base-content/40 text-sm">
            {filters.status || filters.priority || filters.assignee || filters.search
              ? 'Try clearing your filters'
              : 'Tasks from your projects will appear here'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {filteredTasks.map(task => (
            <TaskRow
              key={task._id}
              task={task}
              onUpdate={updateTask}
              onDelete={handleDelete}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

export default TasksPage
