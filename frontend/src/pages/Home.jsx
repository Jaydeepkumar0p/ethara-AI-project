import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useThemeStore from '../store/themeStore'

const HeroScene = lazy(() => import('../components/HeroScene/HeroScene'))

const features = [
  { icon: '🎯', title: 'Project Management', desc: 'Organize work into projects with deadlines, priorities, and color-coding.' },
  { icon: '📋', title: 'Kanban Boards', desc: 'Visualize your workflow with drag-friendly kanban boards per project.' },
  { icon: '👥', title: 'Team Collaboration', desc: 'Invite members, assign tasks, and track who\'s doing what in real-time.' },
  { icon: '📊', title: 'Progress Tracking', desc: 'Beautiful dashboards with task stats, overdue alerts, and completion rates.' },
  { icon: '📧', title: 'Email Notifications', desc: 'Auto-notifications when tasks are assigned or updated via Nodemailer.' },
  { icon: '🔐', title: 'Role-Based Access', desc: 'Admins manage everything. Members contribute to their assigned projects.' },
]

const stats = [
  { value: '10k+', label: 'Tasks completed' },
  { value: '500+', label: 'Teams onboarded' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'User rating' },
]

const HomePage = () => {
  const { theme } = useThemeStore()

  return (
    <div className="overflow-x-hidden">
      {/* Cinematic Hero */}
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, #0a0a1a, #0d0d2b, #080814)'
              : 'linear-gradient(135deg, #7c3aed, #a855f7, #f97316)'
          }}
        >
          <div className="text-center text-white">
            <div className="text-5xl mb-4">⚡</div>
            <div className="loading loading-dots loading-md" />
          </div>
        </div>
      }>
        <HeroScene />
      </Suspense>

      {/* ── Stats Bar — bridges hero → features with no gap ── */}
      <section className="border-y border-base-300 bg-base-200/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="text-center"
              >
                <div className="font-display font-bold text-2xl md:text-3xl text-primary">{s.value}</div>
                <div className="text-xs text-base-content/40 mt-1 tracking-wide uppercase">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="relative py-24 px-4">
        <div className="absolute inset-0 -z-10"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.07) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 65%)'
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary/70 mb-3 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
              Features
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 mt-2">
              Everything your team needs
            </h2>
            <p className="text-base-content/50 text-lg max-w-xl mx-auto">
              A beautifully crafted workspace that scales from solo projects to enterprise teams.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-2xl border p-6 bg-base-200 border-base-300 cursor-default group transition-colors hover:border-primary/30 hover:bg-base-200"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl mb-4 group-hover:bg-primary/20 transition-colors">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 border-y border-base-300 bg-base-200/40">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">Up and running in minutes</h2>
            <p className="text-base-content/50">No setup friction. Just ship.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create a project', desc: 'Set a name, pick a color, add a deadline — your command center is ready.' },
              { step: '02', title: 'Invite your team', desc: 'Share an invite link. Assign roles. Everyone\'s on the same page instantly.' },
              { step: '03', title: 'Ship together', desc: 'Move tasks through your kanban, track progress, celebrate completions.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative"
              >
                <div className="font-display font-bold text-6xl text-primary/10 mb-3 leading-none select-none">{item.step}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack strip ── */}
      <section className="py-12 border-b border-base-300">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-base-content/30 mb-6 tracking-widest uppercase">Built with</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['React + Vite', 'Node.js + Express', 'MongoDB + Mongoose', 'Zustand', 'Framer Motion', 'Tailwind + DaisyUI', 'Nodemailer', 'JWT Auth'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full border border-base-300 bg-base-200 font-mono text-xs text-base-content/50">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-28 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 -z-10"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.12) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.06) 0%, transparent 70%)'
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <div className="inline-block text-5xl mb-6">🚀</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Ready to ship faster?
          </h2>
          <p className="text-base-content/50 mb-10 text-lg">
            Join your team on TaskFlow. Free forever for small teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                className="px-10 py-4 rounded-xl font-bold text-white text-base font-display"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.35)'
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99,102,241,0.5)' }}
                whileTap={{ scale: 0.97 }}
              >
                Start for Free →
              </motion.button>
            </Link>
            <Link to="/login">
              <motion.button
                className="px-10 py-4 rounded-xl font-semibold text-sm border border-base-300 hover:border-primary/40 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-base-300 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>⚡</div>
            <span className="font-display font-bold text-sm">TaskFlow</span>
          </div>
          <p className="text-xs text-base-content/30">
            Built with ❤️ using MERN Stack · Full-Stack Assignment
          </p>
          <div className="flex gap-4 text-xs text-base-content/30">
            <span className="cursor-pointer hover:text-base-content/60 transition-colors">Privacy</span>
            <span className="cursor-pointer hover:text-base-content/60 transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
