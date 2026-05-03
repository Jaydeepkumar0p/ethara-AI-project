import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import useThemeStore from '../store/themeStore'

const HeroScene = lazy(() => import('../components/HeroScene/HeroScene'))

const features = [
  {
    icon: '🎯',
    title: 'Project Management',
    desc: 'Organize work into projects with deadlines, priorities, and color-coding.',
    color: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    icon: '📋',
    title: 'Kanban Boards',
    desc: 'Visualize your workflow with drag-friendly kanban boards per project.',
    color: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.25)',
  },
  {
    icon: '👥',
    title: 'Team Collaboration',
    desc: "Invite members, assign tasks, and track who's doing what in real-time.",
    color: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    icon: '📊',
    title: 'Progress Tracking',
    desc: 'Beautiful dashboards with task stats, overdue alerts, and completion rates.',
    color: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    icon: '📧',
    title: 'Email Notifications',
    desc: 'Auto-notifications when tasks are assigned or updated via Nodemailer.',
    color: 'rgba(236,72,153,0.12)',
    border: 'rgba(236,72,153,0.25)',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access',
    desc: 'Admins manage everything. Members contribute to their assigned projects.',
    color: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
  },
]

const stats = [
  { value: '10k+', label: 'Tasks completed' },
  { value: '500+', label: 'Teams onboarded' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '4.9★', label: 'User rating' },
]

const steps = [
  {
    step: '01',
    title: 'Create a project',
    desc: 'Set a name, pick a color, add a deadline — your command center is ready in seconds.',
    icon: '🗂️',
  },
  {
    step: '02',
    title: 'Invite your team',
    desc: "Share an invite link. Assign roles. Everyone's on the same page instantly.",
    icon: '🤝',
  },
  {
    step: '03',
    title: 'Ship together',
    desc: 'Move tasks through your kanban, track progress, and celebrate completions.',
    icon: '🚢',
  },
]

const techStack = [
  'React + Vite',
  'Node.js + Express',
  'MongoDB + Mongoose',
  'Zustand',
  'Framer Motion',
  'Tailwind + DaisyUI',
  'Nodemailer',
  'JWT Auth',
]

// Fade-up animation preset
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
})

const HomePage = () => {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div className="overflow-x-hidden">

      {/* ── Hero ── */}
      <Suspense
        fallback={
          <div
            className="h-screen flex items-center justify-center"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #0a0a1a, #0d0d2b, #080814)'
                : 'linear-gradient(135deg, #5b21b6, #7c3aed, #c2410c)',
            }}
          >
            <div className="text-center text-white">
              <div className="text-5xl mb-4">⚡</div>
              <div className="loading loading-dots loading-md" />
            </div>
          </div>
        }
      >
        <HeroScene />
      </Suspense>

      {/* ── Stats bar — sits flush under hero ── */}
      <section className="relative border-b border-base-300" style={{ background: 'var(--b2, hsl(var(--b2)))' }}>
        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(99,102,241,0.2)' }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp(i * 0.07)} className="text-center">
                <div
                  className="font-display font-bold mb-1"
                  style={{
                    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                    background: isDark
                      ? 'linear-gradient(135deg, #818cf8, #c084fc)'
                      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs text-base-content/40 tracking-widest uppercase">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)',
          }}
        />
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <motion.div {...fadeUp()} className="text-center mb-14 sm:mb-16">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border"
              style={{
                color: isDark ? '#818cf8' : '#6366f1',
                borderColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)',
                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
              }}
            >
              Features
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Everything your team needs
            </h2>
            <p className="text-base-content/50 text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
              A beautifully crafted workspace that scales from solo projects to enterprise teams.
            </p>
          </motion.div>

          {/* Feature cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...fadeUp(i * 0.07)}
                whileHover={{ y: -5, scale: 1.015 }}
                className="rounded-2xl border p-5 sm:p-6 cursor-default transition-all duration-200 group"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)',
                  borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
                  backdropFilter: 'blur(8px)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = f.border
                  e.currentTarget.style.background = isDark
                    ? f.color.replace('0.12', '0.08')
                    : f.color
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'
                  e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)'
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors duration-200"
                  style={{ background: f.color, fontSize: 20 }}
                >
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        className="py-20 sm:py-24 px-4 sm:px-6 border-y border-base-300"
        style={{ background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(99,102,241,0.02)' }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-14">
            <span
              className="inline-block text-xs font-semibold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border"
              style={{
                color: isDark ? '#818cf8' : '#6366f1',
                borderColor: isDark ? 'rgba(99,102,241,0.35)' : 'rgba(99,102,241,0.25)',
                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
              }}
            >
              How it works
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3">
              Up and running in minutes
            </h2>
            <p className="text-base-content/50">No setup friction. Just ship.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-10 relative">
            {/* Connector line — desktop only */}
            <div
              className="hidden md:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, transparent, rgba(99,102,241,0.3), rgba(99,102,241,0.3), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(99,102,241,0.2), rgba(99,102,241,0.2), transparent)',
              }}
            />
            {steps.map((item, i) => (
              <motion.div key={item.step} {...fadeUp(i * 0.12)} className="relative text-center md:text-left">
                {/* Step number circle */}
                <div className="flex items-center justify-center md:justify-start mb-5">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center font-display font-bold text-sm relative z-10"
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                        : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
                      border: isDark ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.3)',
                      color: isDark ? '#a5b4fc' : '#6366f1',
                    }}
                  >
                    {item.step}
                  </div>
                </div>
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-base-content/50 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech stack ── */}
      <section className="py-12 sm:py-14 border-b border-base-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs text-base-content/30 mb-5 tracking-widest uppercase">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {techStack.map(t => (
              <span
                key={t}
                className="px-3 py-1.5 rounded-full border font-mono text-xs transition-colors duration-150 cursor-default"
                style={{
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)',
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 text-center overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 60%, rgba(139,92,246,0.14) 0%, transparent 65%)'
              : 'radial-gradient(ellipse at 50% 60%, rgba(99,102,241,0.08) 0%, transparent 65%)',
          }}
        />
        {/* Decorative blobs */}
        <div
          className="absolute -top-24 -left-24 w-64 h-64 rounded-full pointer-events-none -z-10"
          style={{
            background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)',
            filter: 'blur(60px)',
          }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none -z-10"
          style={{
            background: isDark ? 'rgba(139,92,246,0.06)' : 'rgba(139,92,246,0.04)',
            filter: 'blur(60px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 text-3xl"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))'
                : 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.12))',
              border: isDark ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(99,102,241,0.25)',
            }}
          >
            🚀
          </div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Ready to ship faster?
          </h2>
          <p className="text-base-content/50 mb-10 text-base sm:text-lg leading-relaxed">
            Join thousands of teams on TaskFlow. Free forever for small teams, no credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link to="/register" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white text-sm sm:text-base font-display tracking-wide"
                style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  boxShadow: isDark
                    ? '0 8px 32px rgba(99,102,241,0.4)'
                    : '0 8px 32px rgba(99,102,241,0.3)',
                }}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(99,102,241,0.55)' }}
                whileTap={{ scale: 0.97 }}
              >
                Start for Free →
              </motion.button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <motion.button
                className="w-full sm:w-auto px-10 py-4 rounded-xl font-semibold text-sm border border-base-300 hover:border-primary/40 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Sign In
              </motion.button>
            </Link>
          </div>

          {/* Trust note */}
          <p className="mt-6 text-xs text-base-content/30">
            No credit card · Free for teams up to 5 · Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-base-300 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              ⚡
            </div>
            <span className="font-display font-bold text-sm">TaskFlow</span>
          </div>

          {/* Credit */}
          <p className="text-xs text-base-content/30 text-center">
            Built with ❤️ using MERN Stack · Full-Stack Assignment
          </p>

          {/* Links */}
          <div className="flex gap-5 text-xs text-base-content/35">
            {['Privacy', 'Terms', 'Contact'].map(l => (
              <span key={l} className="cursor-pointer hover:text-base-content/70 transition-colors">
                {l}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
