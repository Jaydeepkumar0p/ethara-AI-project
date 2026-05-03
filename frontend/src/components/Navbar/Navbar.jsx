import { useRef, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../../store/authStore'
import useThemeStore from '../../store/themeStore'

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const Navbar = () => {
  const { user, logout } = useAuthStore()
  const { theme, toggle } = useThemeStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const rafRef = useRef(null)

  const isHomePage = location.pathname === '/'

  useEffect(() => {
    if (!isHomePage) { setScrolled(true); return }

    const handleScroll = () => {
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50)
        rafRef.current = null
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isHomePage])

  const navLinks = user ? [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/projects', label: 'Projects' },
    { to: '/tasks', label: 'Tasks' },
  ] : []

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? theme === 'dark'
            ? 'rgba(15,23,42,0.85)'
            : 'rgba(255,255,255,0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` : 'none',
        boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.1)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              ⚡
            </div>
            <span className="font-display font-bold text-lg"
              style={{ color: (!scrolled && isHomePage) ? 'white' : 'inherit' }}>
              Jaydeep-Taskflow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary/20 text-primary'
                    : (!scrolled && isHomePage)
                      ? 'text-white/80 hover:text-white hover:bg-white/10'
                      : 'text-base-content/70 hover:text-base-content hover:bg-base-200'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg transition-all duration-200 hover:bg-base-200/50"
              style={{ color: (!scrolled && isHomePage) ? 'rgba(255,255,255,0.8)' : 'inherit' }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-base-200/50"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden sm:block"
                    style={{ color: (!scrolled && isHomePage) ? 'white' : 'inherit' }}>
                    {user.name?.split(' ')[0]}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-60">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden border"
                      style={{
                        background: theme === 'dark' ? '#1e293b' : 'white',
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                      }}
                      onMouseLeave={() => setMenuOpen(false)}
                    >
                      <div className="p-3 border-b" style={{ borderColor: 'inherit' }}>
                        <p className="text-sm font-semibold truncate">{user.name}</p>
                        <p className="text-xs opacity-50 truncate">{user.email}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                          user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                        }`}>{user.role}</span>
                      </div>
                      <div className="p-1">
                        <Link to="/profile"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-base-200"
                          onClick={() => setMenuOpen(false)}>
                          <span>👤</span> Profile
                        </Link>
                        <Link to="/dashboard"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-base-200"
                          onClick={() => setMenuOpen(false)}>
                          <span>📊</span> Dashboard
                        </Link>
                        <button
                          onClick={() => { logout(); setMenuOpen(false); navigate('/') }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <span>🚪</span> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ color: (!scrolled && isHomePage) ? 'rgba(255,255,255,0.8)' : 'inherit' }}>
                  Sign In
                </Link>
                <Link to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                  }}>
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4 overflow-hidden"
            >
              <div className="flex flex-col gap-1 pt-2">
                {navLinks.map(link => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.to) ? 'bg-primary/20 text-primary' : 'hover:bg-base-200'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}

export default Navbar
