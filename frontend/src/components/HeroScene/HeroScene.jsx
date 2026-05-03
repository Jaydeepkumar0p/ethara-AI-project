import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useThemeStore from '../../store/themeStore'

const isLowEnd = () => {
  try { return navigator.hardwareConcurrency <= 2 } catch { return false }
}

const PARTICLES = Array.from({ length: 10 }, (_, i) => ({
  id: i, x: 5 + (i * 9.1) % 90, y: 10 + (i * 7.3) % 60,
  size: 1 + (i % 3), delay: (i * 0.7) % 4, duration: 3 + (i % 4)
}))
const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i, x: (i * 2.3) % 100, y: (i * 1.7) % 58,
  size: 0.5 + (i % 3) * 0.5, delay: (i * 0.4) % 3
}))

const HeroScene = () => {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const low = isLowEnd()
  const cloud1Ref = useRef(null)
  const cloud2Ref = useRef(null)

  useEffect(() => {
    if (low) return
    let rafId = null
    let last = -1
    const tick = () => {
      const s = window.scrollY
      if (s !== last) {
        last = s
        const p = Math.min(s / window.innerHeight, 1)
        if (cloud1Ref.current) cloud1Ref.current.style.transform = `translateX(${p * -28}px) translateY(${p * -8}px)`
        if (cloud2Ref.current) cloud2Ref.current.style.transform = `translateX(${p * 22}px) translateY(${p * -6}px)`
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [low])

  const sky = isDark
    ? { c0: '#050510', c1: '#0d0d28', c2: '#06060f' }
    : { c0: '#5b21b6', c1: '#7c3aed', c2: '#c2410c' }

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: 560 }}>

      {/* ── Animated gradient keyframes ── */}
      <style>{`
        @keyframes scrollBob {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50%       { transform: translateY(5px); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50%       { opacity: 0.85; }
        }

        /* ── "Effortlessly." animated gradient — FIXED, theme-independent ── */
        @keyframes gradientShift {
          0%   { background-position: 0%   50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes shimmer {
          0%   { opacity: 0.85; }
          50%  { opacity: 1; }
          100% { opacity: 0.85; }
        }

        .hero-effortlessly {
          /* Purple → violet → pink → back — never changes with theme */
          background: linear-gradient(
            270deg,
            #818cf8,
            #c084fc,
            #f472b6,
            #e879f9,
            #a78bfa,
            #818cf8
          );
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation:
            gradientShift 4s ease infinite,
            shimmer       3s ease-in-out infinite;
          display: inline-block;
          /* Subtle text-shadow glow via drop-filter for modern browsers */
          filter: drop-shadow(0 0 28px rgba(192, 132, 252, 0.55));
          will-change: background-position, opacity;
        }

        /* Hover: speed up + brighten */
        .hero-effortlessly:hover {
          animation-duration: 1.5s, 1.2s;
          filter: drop-shadow(0 0 40px rgba(244, 114, 182, 0.75));
        }
      `}</style>

      {/* ── SVG Sky ── */}
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={sky.c0} />
            <stop offset="50%"  stopColor={sky.c1} />
            <stop offset="100%" stopColor={sky.c2} />
          </linearGradient>
          <linearGradient id="hs-city" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={isDark ? '#12123a' : '#1e1b4b'} />
            <stop offset="100%" stopColor={isDark ? '#050510' : '#0a0920'} />
          </linearGradient>
          <radialGradient id="hs-orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor={isDark ? 'rgba(196,181,253,0.4)' : 'rgba(253,230,138,0.55)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <radialGradient id="hs-horizon" cx="50%" cy="100%" r="55%">
            <stop offset="0%"   stopColor={isDark ? 'rgba(99,102,241,0.22)' : 'rgba(234,88,12,0.32)'} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <filter id="hs-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="hs-soft" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="10" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <rect width="1440" height="900" fill="url(#hs-sky)" />
        <rect width="1440" height="900" fill="url(#hs-horizon)" />

        {/* Stars */}
        {isDark && !low && STARS.map(s => (
          <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size}
            fill="white" opacity={0.4 + (s.id % 5) * 0.1}
            style={{ animation: `twinkle ${2 + s.delay}s ease-in-out infinite`, animationDelay: `${s.delay}s` }}
          />
        ))}

        {/* Orb */}
        <g filter="url(#hs-soft)"><circle cx="720" cy="200" r="100" fill="url(#hs-orb)" /></g>
        <circle cx="720" cy="200" r={isDark ? 38 : 50}
          fill={isDark ? '#c4b5fd' : '#fde68a'} opacity={isDark ? 0.9 : 0.95} filter="url(#hs-glow)" />
        {isDark && <>
          <circle cx="710" cy="195" r="5"   fill="rgba(0,0,0,0.12)" />
          <circle cx="731" cy="210" r="3.5" fill="rgba(0,0,0,0.1)" />
          <circle cx="714" cy="215" r="4"   fill="rgba(0,0,0,0.08)" />
        </>}

        {/* Clouds */}
        <g ref={cloud1Ref} style={{ willChange: 'transform' }}>
          <g opacity={isDark ? 0.15 : 0.8}>
            <ellipse cx="260" cy="290" rx="115" ry="38" fill={isDark ? '#4f46e5' : 'white'} />
            <ellipse cx="228" cy="274" rx="70"  ry="33" fill={isDark ? '#5b51e8' : 'white'} />
            <ellipse cx="304" cy="272" rx="80"  ry="36" fill={isDark ? '#6366f1' : 'white'} />
            <ellipse cx="262" cy="258" rx="88"  ry="38" fill={isDark ? '#6366f1' : 'white'} />
          </g>
          <g opacity={isDark ? 0.1 : 0.6}>
            <ellipse cx="960" cy="230" rx="96" ry="30" fill={isDark ? '#7c3aed' : 'white'} />
            <ellipse cx="928" cy="218" rx="62" ry="28" fill={isDark ? '#7c3aed' : 'white'} />
            <ellipse cx="994" cy="216" rx="72" ry="30" fill={isDark ? '#8b5cf6' : 'white'} />
            <ellipse cx="960" cy="204" rx="78" ry="32" fill={isDark ? '#8b5cf6' : 'white'} />
          </g>
        </g>
        <g ref={cloud2Ref} style={{ willChange: 'transform' }}>
          <g opacity={isDark ? 0.07 : 0.4}>
            <ellipse cx="1130" cy="350" rx="88" ry="26" fill={isDark ? '#312e81' : 'white'} />
            <ellipse cx="1104" cy="338" rx="55" ry="23" fill={isDark ? '#312e81' : 'white'} />
            <ellipse cx="1158" cy="336" rx="65" ry="25" fill={isDark ? '#3730a3' : 'white'} />
          </g>
          <g opacity={isDark ? 0.08 : 0.32}>
            <ellipse cx="130" cy="370" rx="78" ry="23" fill={isDark ? '#1e1b4b' : 'white'} />
            <ellipse cx="108" cy="358" rx="50" ry="21" fill={isDark ? '#1e1b4b' : 'white'} />
            <ellipse cx="160" cy="356" rx="60" ry="23" fill={isDark ? '#1e1b4b' : 'white'} />
          </g>
        </g>

        {/* Particles */}
        {!low && PARTICLES.map(p => (
          <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size}
            fill={isDark ? '#818cf8' : '#fbbf24'} opacity={0.3 + (p.id % 4) * 0.1}
            filter="url(#hs-glow)"
            style={{ animation: `float ${p.duration}s ease-in-out infinite`, animationDelay: `${p.delay}s` }}
          />
        ))}

        {/* City */}
        <rect x="0" y="820" width="1440" height="80" fill="url(#hs-city)" />
        <g fill={isDark ? '#1a1a3e' : '#1e1b4b'} opacity="0.5">
          {[[0,710,60,120],[58,726,42,104],[102,682,54,148],[154,734,38,96],
            [198,662,48,168],[244,702,34,128],[320,652,58,178],[376,702,44,128],
            [422,680,54,148],[598,640,68,190],[664,680,48,150],[706,650,64,178],
            [804,660,58,168],[904,630,74,198],[974,670,54,160],[1102,650,68,178],
            [1204,680,54,148],[1282,660,64,168],[1382,700,58,128]
          ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
        </g>
        <g fill={isDark ? '#0c0c22' : '#0d0b1e'}>
          {[[0,752,84,158],[76,772,54,138],[120,742,74,168],[240,762,64,148],
            [360,732,94,178],[500,722,104,188],[650,712,84,198],
            [804,742,74,168],[920,702,94,208],[1080,732,84,178],
            [1200,722,94,188],[1320,742,120,168]
          ].map(([x,y,w,h],i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
          <rect x="680" y="598" width="56" height="312" />
          <rect x="691" y="586" width="34" height="14" />
          <rect x="706" y="574" width="5"  height="14" />
          <rect x="960" y="578" width="60" height="332" />
          <rect x="979" y="566" width="22" height="14" />
          <rect x="989" y="554" width="4"  height="14" />
        </g>
        <g fill={isDark ? '#fbbf24' : '#fef3c7'} opacity={isDark ? 0.7 : 0.9}>
          {Array.from({ length: 55 }, (_, i) => (
            <rect key={i} x={40 + (i * 26) % 1360} y={634 + (i * 18) % 168}
              width="3" height="4" opacity={(i * 7 + 3) % 10 > 3 ? 1 : 0} />
          ))}
        </g>
        <ellipse cx="720" cy="820" rx="440" ry="50"
          fill={isDark ? 'rgba(99,102,241,0.3)' : 'rgba(234,88,12,0.4)'} filter="url(#hs-soft)" />
      </svg>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{
        height: '28%',
        background: `linear-gradient(to bottom, transparent, hsl(var(--b1, 0 0% 100%)))`,
        zIndex: 2
      }} />

      {/* ── Hero content ── */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ zIndex: 3, paddingBottom: '10vh' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-3xl"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border"
            style={{
              background: 'rgba(99,102,241,0.18)',
              borderColor: 'rgba(99,102,241,0.4)',
              color: '#a5b4fc',
              backdropFilter: 'blur(12px)'
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            Team Task Manager · Now Live
          </motion.div>

          {/* Heading */}
          <h1
            className="font-display font-bold tracking-tight mb-5"
            style={{
              fontSize: 'clamp(2.2rem, 6.5vw, 5.5rem)',
              lineHeight: 1.06,
              color: 'white',
              textShadow: '0 4px 40px rgba(0,0,0,0.5)'
            }}
          >
            Manage your team.
            <br />
            {/*
              ✅ FIXED: Single class-based animated gradient.
              No isDark check — identical in light AND dark mode.
              The .hero-effortlessly class in <style> handles the
              animated gradient-shift + shimmer + glow filter.
            */}
            <span className="hero-effortlessly">
              Effortlessly.
            </span>
          </h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            style={{
              color: 'rgba(226,232,240,0.75)',
              fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
              lineHeight: 1.7,
              maxWidth: '30rem',
              margin: '0 auto'
            }}
          >
            Create projects, assign tasks, track progress — all in one beautiful workspace built for modern teams.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8"
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-white text-sm font-display tracking-wide"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
                backdropFilter: 'blur(8px)',
              }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99,102,241,0.65)' }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started Free →
            </motion.button>
            <motion.button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                backdropFilter: 'blur(10px)',
              }}
              whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.18)' }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        style={{ bottom: '4%', zIndex: 4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3, duration: 0.8 }}
      >
        <span style={{ fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.45)' }}>
          Scroll
        </span>
        <div style={{
          width: 20, height: 32, borderRadius: 10,
          border: '1.5px solid rgba(148,163,184,0.3)',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', padding: '4px 0'
        }}>
          <div style={{
            width: 3, height: 8, borderRadius: 2,
            background: 'rgba(148,163,184,0.45)',
            animation: 'scrollBob 1.5s ease-in-out infinite'
          }} />
        </div>
      </motion.div>
    </section>
  )
}

export default HeroScene
