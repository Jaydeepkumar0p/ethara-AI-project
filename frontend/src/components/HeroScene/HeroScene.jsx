import { useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useScrollProgress from '../../hooks/useScrollProgress'
import useThemeStore from '../../store/themeStore'

// Detect low-end devices
const isLowEnd = () => {
  return navigator.hardwareConcurrency <= 2 || 
    window.devicePixelRatio < 1.5 || 
    /Android.*4\.|iPhone OS [5-9]_/.test(navigator.userAgent)
}

const HeroScene = () => {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const heroRef = useRef(null)
  const skyRef = useRef(null)
  const cloud1Ref = useRef(null)
  const cloud2Ref = useRef(null)
  const cityRef = useRef(null)
  const textRef = useRef(null)
  const ctaRef = useRef(null)
  const particlesRef = useRef(null)
  const starsRef = useRef(null)
  const lowEnd = useRef(isLowEnd())

  // Scroll-driven animation
  const handleScroll = useCallback((progress) => {
    if (!heroRef.current) return

    const p1 = Math.min(progress / 0.3, 1)        // 0-30%
    const p2 = Math.min(Math.max((progress - 0.3) / 0.3, 0), 1) // 30-60%
    const p3 = Math.min(Math.max((progress - 0.6) / 0.4, 0), 1) // 60-100%

    // Sky color shift
    if (skyRef.current) {
      if (isDark) {
        const stops = skyRef.current.querySelectorAll('stop')
        const darkness = 1 - p1 * 0.5
        if (stops[0]) stops[0].setAttribute('stop-color', `hsl(240, 50%, ${5 + p1 * 10}%)`)
        if (stops[1]) stops[1].setAttribute('stop-color', `hsl(250, 60%, ${8 + p1 * 12}%)`)
        if (stops[2]) stops[2].setAttribute('stop-color', `hsl(280, 40%, ${4 + p1 * 8}%)`)
      } else {
        const stops = skyRef.current.querySelectorAll('stop')
        if (stops[0]) stops[0].setAttribute('stop-color', `hsl(${230 + p1 * 20}, 80%, ${60 + p1 * 20}%)`)
        if (stops[1]) stops[1].setAttribute('stop-color', `hsl(${290 + p1 * 20}, 60%, ${65 + p1 * 20}%)`)
        if (stops[2]) stops[2].setAttribute('stop-color', `hsl(${20 - p1 * 20}, 90%, ${70 + p1 * 20}%)`)
      }
    }

    // Cloud movement
    if (cloud1Ref.current && !lowEnd.current) {
      cloud1Ref.current.style.transform = `translateX(${p1 * -30}px)`
    }
    if (cloud2Ref.current && !lowEnd.current) {
      cloud2Ref.current.style.transform = `translateX(${p1 * 20}px)`
    }

    // City silhouette fade in at phase 2
    if (cityRef.current) {
      cityRef.current.style.opacity = p2
      cityRef.current.style.transform = `translateY(${(1 - p2) * 20}px)`
    }

    // Text fade
    if (textRef.current) {
      textRef.current.style.opacity = Math.max(1 - p2 * 2, 0)
      textRef.current.style.transform = `translateY(${-p2 * 30}px) scale(${1 - p2 * 0.05})`
    }

    // CTA buttons appear
    if (ctaRef.current) {
      ctaRef.current.style.opacity = Math.min(p2 * 2, 1)
      ctaRef.current.style.transform = `translateY(${(1 - Math.min(p2 * 2, 1)) * 20}px)`
    }

    // Hero compress into navbar in phase 3
    if (heroRef.current) {
      const scale = 1 - p3 * 0.02
      heroRef.current.style.transform = `scale(${scale})`
    }

    // Particles fade
    if (particlesRef.current) {
      particlesRef.current.style.opacity = 1 - p3 * 2
    }
  }, [isDark])

  useScrollProgress(handleScroll)

  // Floating particles using CSS animation (performance-safe)
  const particles = Array.from({ length: lowEnd.current ? 6 : 14 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 70,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4
  }))

  // Stars for dark mode
  const stars = isDark ? Array.from({ length: lowEnd.current ? 20 : 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    size: 0.5 + Math.random() * 1.5,
    delay: Math.random() * 3
  })) : []

  const skyColors = isDark
    ? { c1: '#0a0a1a', c2: '#0d0d2b', c3: '#080814' }
    : { c1: '#7c3aed', c2: '#a855f7', c3: '#f97316' }

  return (
    <div
      ref={heroRef}
      className="relative min-h-[300vh] will-change-transform"
      style={{ transformOrigin: 'top center' }}
    >
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden contain-paint">
        {/* SVG Sky Scene */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%" ref={skyRef}>
              <stop offset="0%" stopColor={skyColors.c1} />
              <stop offset="50%" stopColor={skyColors.c2} />
              <stop offset="100%" stopColor={skyColors.c3} />
            </linearGradient>
            <linearGradient id="cityGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDark ? '#1a1a3e' : '#1e1b4b'} />
              <stop offset="100%" stopColor={isDark ? '#0a0a1a' : '#0f0f2a'} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? 'rgba(200,180,255,0.3)' : 'rgba(255,200,100,0.4)'} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="horizonGlow" cx="50%" cy="100%" r="60%">
              <stop offset="0%" stopColor={isDark ? 'rgba(99,102,241,0.15)' : 'rgba(249,115,22,0.25)'} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Background sky */}
          <rect width="1440" height="900" fill="url(#skyGrad)" />
          <rect width="1440" height="900" fill="url(#horizonGlow)" />

          {/* Stars (dark mode) */}
          {isDark && (
            <g ref={starsRef}>
              {stars.map(star => (
                <circle
                  key={star.id}
                  cx={`${star.x}%`}
                  cy={`${star.y}%`}
                  r={star.size}
                  fill="white"
                  opacity={0.6 + Math.random() * 0.4}
                  style={{
                    animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
                    animationDelay: `${star.delay}s`
                  }}
                />
              ))}
            </g>
          )}

          {/* Moon/Sun orb */}
          <g filter="url(#softGlow)">
            <circle
              cx="720"
              cy="200"
              r="80"
              fill="url(#moonGlow)"
            />
            <circle
              cx="720"
              cy="200"
              r="isDark ? 35 : 45"
              r={isDark ? '35' : '45'}
              fill={isDark ? '#c4b5fd' : '#fde68a'}
              opacity={isDark ? 0.85 : 0.9}
              filter="url(#glow)"
            />
            {/* Moon craters (dark mode) */}
            {isDark && <>
              <circle cx="710" cy="195" r="5" fill="rgba(0,0,0,0.15)" />
              <circle cx="728" cy="208" r="3" fill="rgba(0,0,0,0.1)" />
              <circle cx="715" cy="215" r="4" fill="rgba(0,0,0,0.12)" />
            </>}
          </g>

          {/* Cloud Layer 1 */}
          <g ref={cloud1Ref} style={{ transition: 'none', willChange: 'transform' }}>
            {/* Large fluffy cloud */}
            <g opacity={isDark ? 0.15 : 0.7} filter={isDark ? undefined : 'url(#softGlow)'}>
              <ellipse cx="300" cy="280" rx="120" ry="40" fill={isDark ? '#4f46e5' : 'white'} />
              <ellipse cx="260" cy="265" rx="70" ry="35" fill={isDark ? '#4f46e5' : 'white'} />
              <ellipse cx="340" cy="262" rx="80" ry="38" fill={isDark ? '#6366f1' : 'white'} />
              <ellipse cx="300" cy="250" rx="90" ry="40" fill={isDark ? '#6366f1' : 'white'} />
            </g>
            <g opacity={isDark ? 0.1 : 0.55} filter={isDark ? undefined : 'url(#softGlow)'}>
              <ellipse cx="900" cy="220" rx="100" ry="32" fill={isDark ? '#7c3aed' : 'white'} />
              <ellipse cx="870" cy="208" rx="60" ry="30" fill={isDark ? '#7c3aed' : 'white'} />
              <ellipse cx="930" cy="205" rx="70" ry="32" fill={isDark ? '#8b5cf6' : 'white'} />
              <ellipse cx="900" cy="195" rx="78" ry="34" fill={isDark ? '#8b5cf6' : 'white'} />
            </g>
          </g>

          {/* Cloud Layer 2 */}
          <g ref={cloud2Ref} style={{ transition: 'none', willChange: 'transform' }}>
            <g opacity={isDark ? 0.07 : 0.4}>
              <ellipse cx="1100" cy="340" rx="90" ry="28" fill={isDark ? '#312e81' : 'white'} />
              <ellipse cx="1075" cy="328" rx="55" ry="25" fill={isDark ? '#312e81' : 'white'} />
              <ellipse cx="1125" cy="326" rx="65" ry="28" fill={isDark ? '#3730a3' : 'white'} />
            </g>
            <g opacity={isDark ? 0.08 : 0.35}>
              <ellipse cx="150" cy="360" rx="80" ry="25" fill={isDark ? '#1e1b4b' : 'white'} />
              <ellipse cx="130" cy="350" rx="50" ry="22" fill={isDark ? '#1e1b4b' : 'white'} />
              <ellipse cx="175" cy="348" rx="60" ry="24" fill={isDark ? '#1e1b4b' : 'white'} />
            </g>
          </g>

          {/* Glowing particles */}
          <g ref={particlesRef}>
            {particles.map(p => (
              <circle
                key={p.id}
                cx={`${p.x}%`}
                cy={`${p.y}%`}
                r={p.size}
                fill={isDark ? '#818cf8' : '#f59e0b'}
                opacity={0.4 + Math.random() * 0.4}
                filter="url(#glow)"
                style={{
                  animation: `float ${p.duration}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`
                }}
              />
            ))}
          </g>

          {/* City silhouette */}
          <g
            ref={cityRef}
            opacity="0"
            style={{ willChange: 'transform, opacity', transition: 'none' }}
          >
            {/* Ground */}
            <rect x="0" y="820" width="1440" height="80" fill="url(#cityGrad)" />

            {/* Buildings - far layer */}
            <g opacity="0.5" fill={isDark ? '#1a1a3e' : '#1e1b4b'}>
              <rect x="0" y="700" width="60" height="120" />
              <rect x="55" y="720" width="40" height="100" />
              <rect x="100" y="680" width="50" height="140" />
              <rect x="145" y="730" width="35" height="90" />
              <rect x="200" y="660" width="45" height="160" />
              <rect x="240" y="700" width="30" height="120" />
              <rect x="320" y="650" width="55" height="170" />
              <rect x="370" y="700" width="40" height="120" />
              <rect x="420" y="680" width="50" height="140" />
              <rect x="600" y="640" width="65" height="180" />
              <rect x="660" y="680" width="45" height="140" />
              <rect x="700" y="650" width="60" height="170" />
              <rect x="800" y="660" width="55" height="160" />
              <rect x="900" y="630" width="70" height="190" />
              <rect x="970" y="670" width="50" height="150" />
              <rect x="1100" y="650" width="65" height="170" />
              <rect x="1200" y="680" width="50" height="140" />
              <rect x="1280" y="660" width="60" height="160" />
              <rect x="1380" y="700" width="60" height="120" />
            </g>

            {/* Buildings - close layer */}
            <g fill={isDark ? '#0f0f26' : '#0d0b1e'}>
              <rect x="0" y="750" width="80" height="150" />
              <rect x="75" y="770" width="50" height="130" />
              <rect x="120" y="740" width="70" height="160" />
              <rect x="240" y="760" width="60" height="140" />
              <rect x="360" y="730" width="90" height="170" />
              <rect x="500" y="720" width="100" height="180" />
              <rect x="650" y="710" width="80" height="190" />
              {/* Skyscraper */}
              <rect x="680" y="600" width="50" height="300" />
              <rect x="690" y="590" width="30" height="15" /> {/* antenna */}
              <rect x="703" y="580" width="4" height="15" /> {/* antenna tip */}
              <rect x="800" y="740" width="70" height="160" />
              <rect x="920" y="700" width="90" height="200" />
              {/* Tall skyscraper */}
              <rect x="960" y="580" width="55" height="320" />
              <rect x="978" y="570" width="19" height="15" />
              <rect x="986" y="560" width="3" height="14" />
              <rect x="1080" y="730" width="80" height="170" />
              <rect x="1200" y="720" width="90" height="180" />
              <rect x="1320" y="740" width="120" height="160" />
            </g>

            {/* Window lights */}
            <g fill={isDark ? '#fbbf24' : '#fde68a'} opacity={isDark ? 0.6 : 0.8}>
              {Array.from({ length: 50 }, (_, i) => (
                <rect
                  key={i}
                  x={50 + (i * 28) % 1340}
                  y={630 + (i * 19) % 160}
                  width="3"
                  height="4"
                  opacity={Math.random() > 0.4 ? 1 : 0}
                />
              ))}
            </g>

            {/* Horizon glow */}
            <ellipse
              cx="720"
              cy="820"
              rx="400"
              ry="40"
              fill={isDark ? 'rgba(99,102,241,0.3)' : 'rgba(249,115,22,0.4)'}
              filter="url(#softGlow)"
            />
          </g>
        </svg>

        {/* Hero Text Content */}
        <div
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
          style={{ willChange: 'transform, opacity', transition: 'none' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6 border"
              style={{
                background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.2)',
                borderColor: isDark ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.4)',
                color: isDark ? '#a5b4fc' : 'white',
                backdropFilter: 'blur(10px)'
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Team Task Manager · v2.0
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-none tracking-tight"
              style={{ color: isDark ? 'white' : 'white', textShadow: '0 2px 40px rgba(0,0,0,0.3)' }}>
              Manage your team.
              <br />
              <span
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)'
                    : 'linear-gradient(135deg, #fde68a, #fbbf24, #f59e0b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                Effortlessly.
              </span>
            </h1>

            <p className="text-lg md:text-xl max-w-lg mx-auto font-body"
              style={{ color: isDark ? 'rgba(203,213,225,0.8)' : 'rgba(255,255,255,0.9)' }}>
              Create projects, assign tasks, track progress — all in one beautiful workspace.
            </p>
          </motion.div>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="absolute inset-x-0 flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
          style={{
            bottom: '25%',
            opacity: 0,
            willChange: 'transform, opacity',
            transition: 'none'
          }}
        >
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 rounded-xl font-semibold text-white font-display text-sm tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(99,102,241,0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free →
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide"
            style={{
              background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.25)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.05, background: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In
          </motion.button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          style={{ color: isDark ? 'rgba(148,163,184,0.6)' : 'rgba(255,255,255,0.6)' }}
        >
          <span className="text-xs font-body tracking-widest uppercase">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-current flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-current animate-bounce" />
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default HeroScene
