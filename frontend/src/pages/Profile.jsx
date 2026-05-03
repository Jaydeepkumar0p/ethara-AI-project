import { useState } from 'react'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import { format } from 'date-fns'

const ProfilePage = () => {
  const { user, updateProfile } = useAuthStore()
  const [form, setForm] = useState({ name: user?.name || '' })
  const [prefs, setPrefs] = useState(user?.notificationPreferences || {
    taskAssigned: true, taskUpdated: true, projectInvite: true
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await updateProfile({ name: form.name, notificationPreferences: prefs })
    setSaving(false)
  }

  const roleColor = user?.role === 'admin' ? 'text-purple-400 bg-purple-500/10' : 'text-blue-400 bg-blue-500/10'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 pt-24">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-3xl font-bold mb-8">Profile</h1>

        {/* Avatar section */}
        <div className="rounded-2xl border bg-base-200 border-base-300 p-6 mb-6">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{user?.name}</h2>
              <p className="text-base-content/50 text-sm">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColor}`}>
                  {user?.role === 'admin' ? '👑 ' : '👤 '}{user?.role}
                </span>
                {user?.createdAt && (
                  <span className="text-xs text-base-content/40">
                    Joined {format(new Date(user.createdAt), 'MMM yyyy')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-5">
          <div className="rounded-2xl border bg-base-200 border-base-300 p-6">
            <h3 className="font-display font-semibold mb-4">Account Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-base-content/70">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl bg-base-100 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  minLength={2} maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-base-content/70">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2.5 rounded-xl bg-base-300/50 border border-base-300 text-sm text-base-content/50 cursor-not-allowed"
                  value={user?.email}
                  disabled
                />
                <p className="text-xs text-base-content/30 mt-1">Email cannot be changed</p>
              </div>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="rounded-2xl border bg-base-200 border-base-300 p-6">
            <h3 className="font-display font-semibold mb-4">Notifications</h3>
            <div className="space-y-3">
              {[
                { key: 'taskAssigned', label: 'Task Assigned', desc: 'When a task is assigned to you' },
                { key: 'taskUpdated', label: 'Task Updated', desc: 'When your task status changes' },
                { key: 'projectInvite', label: 'Project Invite', desc: 'When added to a new project' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-base-content/40">{desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPrefs(p => ({ ...p, [key]: !p[key] }))}
                    className={`relative w-10 h-5 rounded-full transition-all duration-200 ${prefs[key] ? 'bg-primary' : 'bg-base-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${prefs[key] ? 'left-5' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl font-semibold text-white text-sm"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="loading loading-spinner loading-xs" /> Saving...
              </span>
            ) : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default ProfilePage
