import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useThemeStore from '../store/themeStore'

const inputClass = "w-full px-4 py-3 rounded-xl bg-base-200 border border-base-300 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-base-content/30"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

export const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login, loading } = useAuthStore()
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await login(form.email, form.password)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.1) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 20% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)'
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>⚡</div>
            <span className="font-display text-2xl font-bold">TaskFlow</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-base-content/50 text-sm">Sign in to your workspace</p>
        </motion.div>

        <motion.div variants={itemVariants}
          className="rounded-2xl border p-8"
          style={{
            background: theme === 'dark' ? 'rgba(30,41,59,0.8)' : 'white',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)'
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Email</label>
              <input
                type="email"
                className={inputClass}
                placeholder="you@company.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-base-content/70">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
              </div>
              <input
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm font-display tracking-wide relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-xs" /> Signing in...
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>

          {/* Demo accounts */}
          <motion.div variants={itemVariants} className="mt-6 p-4 rounded-xl bg-base-200/60 border border-base-300">
            <p className="text-xs font-medium text-base-content/50 mb-2">Demo Accounts</p>
            <div className="flex gap-2">
              <button
                onClick={() => setForm({ email: 'admin@demo.com', password: 'demo123' })}
                className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
              >
                Admin Demo
              </button>
              <button
                onClick={() => setForm({ email: 'member@demo.com', password: 'demo123' })}
                className="flex-1 text-xs py-1.5 px-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors"
              >
                Member Demo
              </button>
            </div>
          </motion.div>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center mt-6 text-sm text-base-content/50">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one free →</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}

export const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' })
  const { register, loading } = useAuthStore()
  const navigate = useNavigate()
  const { theme } = useThemeStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await register(form.name, form.email, form.password, form.role)
    if (ok) navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-10"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.1) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(99,102,241,0.1) 0%, transparent 60%)'
            : 'radial-gradient(ellipse at 80% 30%, rgba(139,92,246,0.06) 0%, transparent 60%)'
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>⚡</div>
            <span className="font-display text-2xl font-bold">TaskFlow</span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-base-content/50 text-sm">Join thousands of productive teams</p>
        </motion.div>

        <motion.div variants={itemVariants}
          className="rounded-2xl border p-8"
          style={{
            background: theme === 'dark' ? 'rgba(30,41,59,0.8)' : 'white',
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            boxShadow: theme === 'dark' ? '0 25px 50px rgba(0,0,0,0.5)' : '0 25px 50px rgba(0,0,0,0.08)',
            backdropFilter: 'blur(20px)'
          }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Full Name</label>
              <input type="text" className={inputClass} placeholder="Jane Doe"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Email</label>
              <input type="email" className={inputClass} placeholder="jane@company.com"
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Password</label>
              <input type="password" className={inputClass} placeholder="Min. 6 characters"
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required minLength={6} />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium mb-1.5 text-base-content/70">Role</label>
              <div className="grid grid-cols-2 gap-3">
                {['member', 'admin'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-all capitalize ${
                      form.role === r
                        ? 'border-primary bg-primary/20 text-primary'
                        : 'border-base-300 bg-base-200 text-base-content/60 hover:border-base-content/20'
                    }`}
                  >
                    {r === 'admin' ? '👑 Admin' : '👤 Member'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-base-content/40 mt-1.5">
                {form.role === 'admin' ? 'Can manage all projects and users' : 'Can join and contribute to projects'}
              </p>
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white text-sm font-display tracking-wide"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              whileHover={{ scale: 1.01, boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="loading loading-spinner loading-xs" /> Creating account...
                </span>
              ) : 'Create Account →'}
            </motion.button>
          </form>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center mt-6 text-sm text-base-content/50">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in →</Link>
        </motion.p>
      </motion.div>
    </div>
  )
}
