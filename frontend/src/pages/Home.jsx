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

const HomePage = () => {
  const { theme } = useThemeStore()

  return (
    <div className="overflow-x-hidden">
      {/* Cinematic Hero - Remove negative margin if HeroScene has its own spacing */}
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

      {/* Features Section - Reduced padding from py-24 to py-12 */}
      <section className="relative py-12 px-4"> {/* Changed from py-24 to py-12 */}
        <div className="absolute inset-0 -z-10"
          style={{
            background: theme === 'dark'
              ? 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.04) 0%, transparent 70%)'
          }}
        />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12" // Reduced from mb-16 to mb-12
          >
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
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
                className="rounded-2xl border p-6 bg-base-200 border-base-300 cursor-default"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack strip - Reduced padding */}
      <section className="py-6 border-y border-base-300"> {/* Changed from py-12 to py-6 */}
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-center text-xs text-base-content/30 mb-4 tracking-widest uppercase">Built with</p> {/* Reduced from mb-6 to mb-4 */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-base-content/50">
            {['React + Vite', 'Node.js + Express', 'MongoDB + Mongoose', 'Zustand', 'Framer Motion', 'Tailwind + DaisyUI', 'Nodemailer', 'JWT Auth'].map(t => (
              <span key={t} className="px-3 py-1.5 rounded-full border border-base-300 bg-base-200 font-mono text-xs">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Reduced padding */}
      <section className="py-16 px-4 text-center"> {/* Changed from py-24 to py-16 */}
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
          <p className="text-base-content/50 mb-8 text-lg">
            Join your team on TaskFlow. Free forever for small teams.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <motion.button
                className="px-10 py-4 rounded-xl font-bold text-white text-base font-display"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
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

      {/* Footer - Reduced padding */}
      <footer className="border-t border-base-300 py-6 px-4"> {/* Changed from py-8 to py-6 */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>⚡</div>
            <span className="font-display font-bold text-sm">TaskFlow</span>
          </div>
          <p className="text-xs text-base-content/30">
            Built with ❤️ using MERN Stack · Full-Stack Assignment
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
