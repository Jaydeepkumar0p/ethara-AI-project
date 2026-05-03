import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useProjectStore from '../store/projectStore'
import useAuthStore from '../store/authStore'
import { SkeletonList } from '../components/UI/Skeleton'
import { formatDistanceToNow } from 'date-fns'

const PROJECT_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } }
}

const CreateProjectModal = ({ onClose, onCreate }) => {
  const [form, setForm] = useState({
    name: '', description: '', priority: 'medium',
    deadline: '', color: PROJECT_COLORS[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await onCreate(form)
    setLoading(false)
    if (result) onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl border bg-base-100 border-base-300 p-6 shadow-2xl z-10"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">New Project</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-base-200 flex items-center justify-center text-base-content/50">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-base-content/70">Project Name *</label>
            <input
              className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              required maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-base-content/70">Description</label>
            <textarea
              className="w-full px-4 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="What's this project about?"
              rows={3}
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Priority</label>
              <select
                className="w-full px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Deadline</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all"
                value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-base-content/70">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: form.color === color ? `3px solid ${color}` : 'none',
                    outlineOffset: '2px'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-base-300 text-sm font-medium hover:bg-base-200 transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl font-semibold text-white text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {loading ? <span className="loading loading-spinner loading-xs" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

const ProjectCard = ({ project, onDelete, isOwner }) => {
  const done = project.taskCounts?.done || 0
  const total = Object.values(project.taskCounts || {}).reduce((a, b) => a + b, 0)
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const statusClasses = {
    active: 'bg-emerald-500/10 text-emerald-400',
    completed: 'bg-blue-500/10 text-blue-400',
    'on-hold': 'bg-amber-500/10 text-amber-400',
    archived: 'bg-base-300 text-base-content/40'
  }
  const priorityIcons = { low: '🟢', medium: '🟡', high: '🟠', critical: '🔴' }

  return (
    <motion.div variants={itemVariants}>
      <div className="rounded-xl border bg-base-200 border-base-300 overflow-hidden card-hover group">
        {/* Color strip */}
        <div className="h-1.5" style={{ background: project.color || '#6366f1' }} />

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{priorityIcons[project.priority]}</span>
                <h3 className="font-display font-semibold truncate">{project.name}</h3>
              </div>
              <p className="text-xs text-base-content/40 line-clamp-2">
                {project.description || 'No description'}
              </p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0 ${statusClasses[project.status]}`}>
              {project.status}
            </span>
          </div>

          {/* Members */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-1.5">
              {project.members?.slice(0, 4).map((m, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-base-200 flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: `hsl(${i * 60}, 60%, 50%)`, zIndex: 4 - i }}
                  title={m.user?.name}
                >
                  {m.user?.name?.[0]?.toUpperCase()}
                </div>
              ))}
              {project.members?.length > 4 && (
                <div className="w-6 h-6 rounded-full border-2 border-base-200 bg-base-300 flex items-center justify-center text-xs">
                  +{project.members.length - 4}
                </div>
              )}
            </div>
            <span className="text-xs text-base-content/40">
              {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Progress */}
          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs text-base-content/40">
              <span>{done}/{total} tasks done</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-base-300 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: project.color || '#6366f1' }}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-base-content/40">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
            <div className="flex gap-2">
              {isOwner && (
                <button
                  onClick={(e) => { e.preventDefault(); onDelete(project._id) }}
                  className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                >
                  Delete
                </button>
              )}
              <Link
                to={`/projects/${project._id}`}
                className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all"
                style={{ background: project.color || '#6366f1' }}
              >
                Open →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const ProjectsPage = () => {
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore()
  const { user } = useAuthStore()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => { fetchProjects() }, [])

  const filtered = projects.filter(p => {
    if (filter !== 'all' && p.status !== filter) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project and all its tasks?')) {
      await deleteProject(id)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Projects</h1>
          <p className="text-base-content/50 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <motion.button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.3)' }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>+</span> New Project
        </motion.button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="search"
          placeholder="Search projects..."
          className="px-4 py-2 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary transition-all flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-2">
          {['all', 'active', 'completed', 'on-hold'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all capitalize ${
                filter === s
                  ? 'bg-primary text-white'
                  : 'bg-base-200 border border-base-300 hover:border-primary/40'
              }`}
            >
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {loading && projects.length === 0 ? (
        <SkeletonList count={6} />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 rounded-xl border border-dashed border-base-300"
        >
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="font-display text-xl font-semibold mb-2">No projects found</h3>
          <p className="text-base-content/40 text-sm mb-6">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            Create Project
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(project => (
            <ProjectCard
              key={project._id}
              project={project}
              onDelete={handleDelete}
              isOwner={project.owner?._id === user?._id || user?.role === 'admin'}
            />
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateProjectModal
            onClose={() => setShowCreate(false)}
            onCreate={createProject}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProjectsPage
