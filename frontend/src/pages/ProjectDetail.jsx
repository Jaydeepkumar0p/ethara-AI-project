import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useProjectStore from '../store/projectStore'
import useTaskStore from '../store/taskStore'
import useAuthStore from '../store/authStore'
import { formatDistanceToNow, isPast, format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../utils/api'

const STATUSES = ['todo', 'in-progress', 'review', 'done']
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', review: 'Review', done: 'Done' }
const STATUS_COLORS = {
  todo: { bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)', dot: '#94a3b8' },
  'in-progress': { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.2)', dot: '#60a5fa' },
  review: { bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', dot: '#c084fc' },
  done: { bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.2)', dot: '#34d399' }
}
const PRIORITY_COLORS = { low: '#34d399', medium: '#fbbf24', high: '#f97316', critical: '#f87171' }

const TaskCard = ({ task, onStatusChange, onDelete, projectMembers }) => {
  const [showDetail, setShowDetail] = useState(false)
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'done'

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -2 }}
        className="rounded-xl p-3.5 border cursor-pointer bg-base-100 border-base-300 group"
        style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}` }}
        onClick={() => setShowDetail(true)}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <p className="text-sm font-medium leading-snug line-clamp-2 flex-1">{task.title}</p>
          <button
            onClick={e => { e.stopPropagation(); onDelete(task._id) }}
            className="opacity-0 group-hover:opacity-100 text-base-content/30 hover:text-red-400 transition-all flex-shrink-0 w-5 h-5 flex items-center justify-center rounded"
          >
            ✕
          </button>
        </div>

        {task.description && (
          <p className="text-xs text-base-content/40 line-clamp-1 mb-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs px-1.5 py-0.5 rounded-md font-medium capitalize"
            style={{ background: `${PRIORITY_COLORS[task.priority]}20`, color: PRIORITY_COLORS[task.priority] }}>
            {task.priority}
          </span>
          {isOverdue && (
            <span className="text-xs px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-400">
              overdue
            </span>
          )}
          {task.dueDate && !isOverdue && (
            <span className="text-xs text-base-content/40">
              {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
            </span>
          )}
        </div>

        {task.assignee && (
          <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-base-300">
            <div className="w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {task.assignee.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-base-content/50 truncate">{task.assignee.name}</span>
            {task.comments?.length > 0 && (
              <span className="ml-auto text-xs text-base-content/40">💬 {task.comments.length}</span>
            )}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showDetail && (
          <TaskDetailModal
            task={task}
            onClose={() => setShowDetail(false)}
            onStatusChange={onStatusChange}
            projectMembers={projectMembers}
          />
        )}
      </AnimatePresence>
    </>
  )
}

const TaskDetailModal = ({ task, onClose, onStatusChange, projectMembers }) => {
  const { updateTask } = useTaskStore()
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')
  const [comments, setComments] = useState(task.comments || [])
  const [posting, setPosting] = useState(false)

  const handleComment = async () => {
    if (!comment.trim()) return
    setPosting(true)
    try {
      const { data } = await api.post(`/tasks/${task._id}/comments`, { text: comment })
      setComments(data.comments)
      setComment('')
    } catch { toast.error('Failed to post comment') }
    setPosting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg rounded-2xl border bg-base-100 border-base-300 overflow-hidden z-10 max-h-[85vh] flex flex-col"
        style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}
      >
        <div className="p-6 border-b border-base-300 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: PRIORITY_COLORS[task.priority] }} />
                <span className="text-xs capitalize text-base-content/50">{task.priority} priority</span>
              </div>
              <h2 className="font-display font-bold text-lg">{task.title}</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-base-200 flex items-center justify-center text-base-content/50 flex-shrink-0">✕</button>
          </div>

          {task.description && (
            <p className="text-sm text-base-content/60 mt-2">{task.description}</p>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Status */}
          <div>
            <label className="text-xs font-medium text-base-content/50 mb-2 block">STATUS</label>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map(s => (
                <button key={s}
                  onClick={() => { onStatusChange(task._id, s); onClose() }}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all capitalize border ${
                    task.status === s
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-base-300 hover:border-base-content/20'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="grid grid-cols-2 gap-3">
            {task.assignee && (
              <div>
                <label className="text-xs font-medium text-base-content/50 mb-1 block">ASSIGNEE</label>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {task.assignee.name?.[0]}
                  </div>
                  <span className="text-sm">{task.assignee.name}</span>
                </div>
              </div>
            )}
            {task.dueDate && (
              <div>
                <label className="text-xs font-medium text-base-content/50 mb-1 block">DUE DATE</label>
                <span className={`text-sm ${isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'text-red-400' : ''}`}>
                  {format(new Date(task.dueDate), 'MMM d, yyyy')}
                </span>
              </div>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className="text-xs font-medium text-base-content/50 mb-3 block">
              COMMENTS ({comments.length})
            </label>
            <div className="space-y-3 max-h-40 overflow-y-auto mb-3">
              {comments.length === 0 ? (
                <p className="text-xs text-base-content/30 text-center py-3">No comments yet</p>
              ) : comments.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {c.user?.name?.[0]}
                  </div>
                  <div className="flex-1 rounded-xl bg-base-200 px-3 py-2">
                    <p className="text-xs font-medium text-base-content/70">{c.user?.name}</p>
                    <p className="text-sm">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={posting || !comment.trim()}
                className="px-4 py-2 rounded-xl text-white text-sm font-medium disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              >
                {posting ? '...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const CreateTaskModal = ({ projectId, members, onClose, onCreate }) => {
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', assignee: '', dueDate: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const payload = { ...form, project: projectId }
    if (!payload.assignee) delete payload.assignee
    if (!payload.dueDate) delete payload.dueDate
    const result = await onCreate(payload)
    setLoading(false)
    if (result) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl border bg-base-100 border-base-300 p-6 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">New Task</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-base-200 flex items-center justify-center text-base-content/50">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Task title *"
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            required autoFocus
          />
          <textarea
            className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
            placeholder="Description (optional)"
            rows={2}
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <select className="px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
              value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
              <option value="low">🟢 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🟠 High</option>
              <option value="critical">🔴 Critical</option>
            </select>
            <select className="px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
              value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
              {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
              value={form.assignee} onChange={e => setForm(p => ({ ...p, assignee: e.target.value }))}>
              <option value="">Unassigned</option>
              {members?.map(m => (
                <option key={m.user._id} value={m.user._id}>{m.user.name}</option>
              ))}
            </select>
            <input type="date"
              className="px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
              value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-base-300 text-sm font-medium hover:bg-base-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Create Task'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const ProjectDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentProject, fetchProject } = useProjectStore()
  const { tasks, fetchTasks, createTask, updateTask, deleteTask } = useTaskStore()
  const { user } = useAuthStore()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [memberEmail, setMemberEmail] = useState('')
  const { addMember, removeMember } = useProjectStore()
  const [view, setView] = useState('kanban')
  const [activeColumn, setActiveColumn] = useState(null)

  useEffect(() => {
    fetchProject(id)
    fetchTasks({ project: id })
  }, [id])

  const project = currentProject

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus })
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) await deleteTask(taskId)
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    const result = await addMember(id, memberEmail)
    if (result) { setMemberEmail(''); setShowAddMember(false) }
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s)
    return acc
  }, {})

  if (!project) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-24 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-base-300 rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-64 bg-base-200 rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  const isOwnerOrAdmin = project.owner?._id === user?._id || user?.role === 'admin'
  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center gap-2 text-xs text-base-content/40 mb-3">
          <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-base-content/70">{project.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-4 h-10 rounded-full flex-shrink-0 mt-0.5"
              style={{ background: project.color || '#6366f1' }} />
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">{project.name}</h1>
              {project.description && (
                <p className="text-base-content/50 text-sm mt-1">{project.description}</p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                  project.status === 'completed' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-amber-500/10 text-amber-400'
                }`}>{project.status}</span>
                <span className="text-xs text-base-content/40">{totalTasks} tasks · {progressPct}% done</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <div className="flex border border-base-300 rounded-xl overflow-hidden">
              {['kanban', 'list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    view === v ? 'bg-primary text-white' : 'hover:bg-base-200'
                  }`}>
                  {v === 'kanban' ? '⊞ Board' : '☰ List'}
                </button>
              ))}
            </div>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setShowAddMember(true)}
                className="px-3 py-1.5 rounded-xl border border-base-300 text-xs font-medium hover:bg-base-200 transition-colors"
              >
                + Member
              </button>
            )}
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              + Task
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-base-300 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: project.color || '#6366f1' }}
            />
          </div>
          <span className="text-xs text-base-content/50 flex-shrink-0">{doneTasks}/{totalTasks}</span>
        </div>

        {/* Members */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex -space-x-1.5">
            {project.members?.slice(0, 6).map((m, i) => (
              <div key={i}
                className="w-7 h-7 rounded-full border-2 border-base-100 flex items-center justify-center text-xs font-bold text-white"
                style={{ background: `hsl(${i * 55 + 200}, 60%, 50%)`, zIndex: 6 - i }}
                title={m.user?.name}
              >
                {m.user?.name?.[0]}
              </div>
            ))}
          </div>
          <span className="text-xs text-base-content/40">{project.members?.length} members</span>
        </div>
      </motion.div>

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto">
          {STATUSES.map((status) => {
            const col = STATUS_COLORS[status]
            const colTasks = tasksByStatus[status] || []
            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: STATUSES.indexOf(status) * 0.08 }}
                className="rounded-xl border p-3 min-h-[400px] flex flex-col"
                style={{ background: col.bg, borderColor: col.border }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.dot }} />
                    <span className="text-sm font-semibold">{STATUS_LABELS[status]}</span>
                    <span className="w-5 h-5 rounded-full bg-base-300 text-xs flex items-center justify-center font-medium">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => { setShowCreateTask(true); setActiveColumn(status) }}
                    className="w-6 h-6 rounded-lg hover:bg-base-300/50 flex items-center justify-center text-base-content/50 hover:text-base-content transition-colors text-lg leading-none"
                  >
                    +
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <AnimatePresence>
                    {colTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDeleteTask}
                        projectMembers={project.members}
                      />
                    ))}
                  </AnimatePresence>
                  {colTasks.length === 0 && (
                    <div className="text-center py-8 text-base-content/20 text-xs">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center py-16 rounded-xl border border-dashed border-base-300 text-base-content/40">
              No tasks yet. Create the first one!
            </div>
          ) : tasks.map(task => (
            <div key={task._id}
              className="flex items-center gap-4 p-4 rounded-xl border bg-base-200 border-base-300 hover:border-primary/30 transition-colors group"
              style={{ borderLeft: `3px solid ${PRIORITY_COLORS[task.priority]}` }}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                {task.description && <p className="text-xs text-base-content/40 truncate">{task.description}</p>}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <select
                  value={task.status}
                  onChange={e => handleStatusChange(task._id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  className="text-xs px-2 py-1 rounded-lg bg-base-300 border-none focus:outline-none cursor-pointer"
                >
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
                {task.assignee && (
                  <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                    title={task.assignee.name}>
                    {task.assignee.name?.[0]}
                  </div>
                )}
                {task.dueDate && (
                  <span className={`text-xs ${isPast(new Date(task.dueDate)) && task.status !== 'done' ? 'text-red-400' : 'text-base-content/40'}`}>
                    {format(new Date(task.dueDate), 'MMM d')}
                  </span>
                )}
                <button onClick={() => handleDeleteTask(task._id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all text-xs">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {showAddMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMember(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm rounded-2xl border bg-base-100 border-base-300 p-6 z-10"
            >
              <h3 className="font-display font-bold text-lg mb-4">Add Team Member</h3>
              <form onSubmit={handleAddMember} className="space-y-3">
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
                  placeholder="member@company.com"
                  value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)}
                  required autoFocus
                />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setShowAddMember(false)}
                    className="flex-1 py-2.5 rounded-xl border border-base-300 text-sm hover:bg-base-200 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    Add Member
                  </button>
                </div>
              </form>

              {/* Current members */}
              <div className="mt-4 pt-4 border-t border-base-300">
                <p className="text-xs font-medium text-base-content/50 mb-2">CURRENT MEMBERS</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {project.members?.map((m, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full text-xs font-bold text-white flex items-center justify-center"
                          style={{ background: `hsl(${i * 55 + 200}, 60%, 50%)` }}>
                          {m.user?.name?.[0]}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{m.user?.name}</p>
                          <p className="text-xs text-base-content/40">{m.role}</p>
                        </div>
                      </div>
                      {isOwnerOrAdmin && m.user?._id !== project.owner?._id && (
                        <button onClick={() => removeMember(id, m.user._id)}
                          className="text-xs text-red-400 hover:underline">Remove</button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateTask && (
          <CreateTaskModal
            projectId={id}
            members={project.members}
            onClose={() => { setShowCreateTask(false); setActiveColumn(null) }}
            onCreate={createTask}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectDetailPage
