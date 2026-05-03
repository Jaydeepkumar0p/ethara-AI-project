import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useThemeStore from '../../store/themeStore'

const isLowEnd = () => {
  try {
    return navigator.hardwareConcurrency <= 2
  } catch { return false }
}

// Stable random values (generated once, not on every render)
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: 5 + (i * 8.3) % 90, y: 10 + (i * 7.1) % 65,
  size: 1 + (i % 3), delay: (i * 0.6) % 4, duration: 3 + (i % 4)
}))
const STARS = Array.from({ length: 45 }, (_, i) => ({
  id: i, x: (i * 2.3) % 100, y: (i * 1.7) % 58,
  size: 0.5 + (i % 3) * 0.5, delay: (i * 0.4) % 3
}))

const HeroScene = () => {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const low = isLowEnd()

  // Refs for DOM manipulation (no state = no re-renders during scroll)
  const grad0 = useRef(null)
  const grad1 = useRef(null)
  const grad2 = useRef(null)
  const cloud1Ref = useRef(null)
  const cloud2Ref = useRef(null)
  const cityRef = useRef(null)
  const heroTextRef = useRef(null)
  const ctaRef = useRef(null)
  const particlesRef = useRef(null)

  // Scroll animation via RAF
  useEffect(() => {
    let rafId = null
    let lastScroll = -1

    const animate = () => {
      const scrollTop = window.scrollY
      if (scrollTop === lastScroll) { rafId = requestAnimationFrame(animate); return }
      lastScroll = scrollTop

      const docH = document.documentElement.scrollHeight - window.innerHeight
      const prog = docH > 0 ? Math.min(scrollTop / docH, 1) : 0

      const p1 = Math.min(prog / 0.3, 1)
      const p2 = Math.min(Math.max((prog - 0.3) / 0.3, 0), 1)
      const p3 = Math.min(Math.max((prog - 0.6) / 0.4, 0), 1)

      // Sky gradient stops (direct DOM attr - no React re-render)
      if (grad0.current && grad1.current && grad2.current) {
        if (isDark) {
          grad0.current.setAttribute('stop-color', `hsl(240,50%,${5 + p1 * 12}%)`)
          grad1.current.setAttribute('stop-color', `hsl(250,60%,${8 + p1 * 14}%)`)
          grad2.current.setAttribute('stop-color', `hsl(280,40%,${4 + p1 * 10}%)`)
        } else {
          grad0.current.setAttribute('stop-color', `hsl(${250 + p1 * 30},70%,${45 + p1 * 25}%)`)
          grad1.current.setAttribute('stop-color', `hsl(${280 + p1 * 20},65%,${50 + p1 * 20}%)`)
          grad2.current.setAttribute('stop-color', `hsl(${25 - p1 * 15},85%,${55 + p1 * 20}%)`)
        }
      }

      // Clouds
      if (!low) {
        if (cloud1Ref.current) cloud1Ref.current.style.transform = `translateX(${p1 * -40}px)`
        if (cloud2Ref.current) cloud2Ref.current.style.transform = `translateX(${p1 * 30}px)`
      }

      // City fade in
      if (cityRef.current) {
        cityRef.current.style.opacity = p2
        cityRef.current.style.transform = `translateY(${(1 - p2) * 25}px)`
      }

      // Hero text
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = Math.max(1 - p2 * 2.5, 0)
        heroTextRef.current.style.transform = `translateY(${-p2 * 40}px)`
      }

      // CTA
      if (ctaRef.current) {
        const show = Math.min(Math.max((prog - 0.25) / 0.15, 0), 1)
        ctaRef.current.style.opacity = show
        ctaRef.current.style.transform = `translateY(${(1 - show) * 20}px)`
      }

      // Particles fade out
      if (particlesRef.current) {
        particlesRef.current.style.opacity = Math.max(1 - p3 * 3, 0)
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => { if (rafId) cancelAnimationFrame(rafId) }
  }, [isDark, low])

  const skyC = isDark
    ? { c0: '#050510', c1: '#0a0a20', c2: '#06060f' }
    : { c0: '#6d28d9', c1: '#9333ea', c2: '#ea580c' }

  return (
    // 200vh scroll area = enough for 3 phases without excessive blank space
    <div className="relative" style={{ height: '220vh' }}>
      {/* Sticky full-screen canvas */}
      <div className="sticky top-0 h-screen overflow-hidden" style={{ contain: 'paint layout' }}>

        {/* ── SVG Sky ── */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 w-full h-full"
          aria-hidden="true"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="tf-sky" x1="0" y1="0" x2="0" y2="1">
              <stop ref={grad0} offset="0%" stopColor={skyC.c0} />
              <stop ref={grad1} offset="50%" stopColor={skyC.c1} />
              <stop ref={grad2} offset="100%" stopColor={skyC.c2} />
            </linearGradient>
            <linearGradient id="tf-city" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isDark ? '#12123a' : '#1e1b4b'} />
              <stop offset="100%" stopColor={isDark ? '#050510' : '#0a0920'} />
            </linearGradient>
            <radialGradient id="tf-orb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={isDark ? 'rgba(196,181,253,0.35)' : 'rgba(253,230,138,0.5)'} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <radialGradient id="tf-horizon" cx="50%" cy="100%" r="55%">
              <stop offset="0%" stopColor={isDark ? 'rgba(99,102,241,0.18)' : 'rgba(234,88,12,0.28)'} />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
            <filter id="tf-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="tf-soft" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="10" result="blur" />
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Sky background */}
          <rect width="1440" height="900" fill="url(#tf-sky)" />
          <rect width="1440" height="900" fill="url(#tf-horizon)" />

          {/* Stars — dark mode only */}
          {isDark && !low && STARS.map(s => (
            <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.size}
              fill="white" opacity={0.5 + (s.id % 5) * 0.1}
              style={{ animation: `twinkle ${2 + s.delay}s ease-in-out infinite`, animationDelay: `${s.delay}s` }}
            />
          ))}

          {/* Moon / Sun orb */}
          <g filter="url(#tf-soft)">
            <circle cx="720" cy="185" r="90" fill="url(#tf-orb)" />
          </g>
          <circle cx="720" cy="185" r={isDark ? 36 : 46}
            fill={isDark ? '#c4b5fd' : '#fde68a'}
            opacity={isDark ? 0.88 : 0.92}
            filter="url(#tf-glow)"
          />
          {isDark && <>
            <circle cx="710" cy="180" r="5" fill="rgba(0,0,0,0.12)" />
            <circle cx="730" cy="195" r="3.5" fill="rgba(0,0,0,0.1)" />
            <circle cx="714" cy="200" r="4" fill="rgba(0,0,0,0.08)" />
          </>}

          {/* Clouds layer 1 */}
          <g ref={cloud1Ref} style={{ willChange: 'transform' }}>
            <g opacity={isDark ? 0.14 : 0.75}>
              <ellipse cx="280" cy="270" rx="110" ry="36" fill={isDark ? '#4f46e5' : 'white'} />
              <ellipse cx="248" cy="256" rx="66" ry="32" fill={isDark ? '#5b51e8' : 'white'} />
              <ellipse cx="320" cy="254" rx="78" ry="35" fill={isDark ? '#6366f1' : 'white'} />
              <ellipse cx="280" cy="242" rx="85" ry="37" fill={isDark ? '#6366f1' : 'white'} />
            </g>
            <g opacity={isDark ? 0.09 : 0.55}>
              <ellipse cx="950" cy="210" rx="92" ry="28" fill={isDark ? '#7c3aed' : 'white'} />
              <ellipse cx="920" cy="199" rx="58" ry="27" fill={isDark ? '#7c3aed' : 'white'} />
              <ellipse cx="980" cy="197" rx="68" ry="29" fill={isDark ? '#8b5cf6' : 'white'} />
              <ellipse cx="950" cy="187" rx="75" ry="31" fill={isDark ? '#8b5cf6' : 'white'} />
            </g>
          </g>

          {/* Clouds layer 2 */}
          <g ref={cloud2Ref} style={{ willChange: 'transform' }}>
            <g opacity={isDark ? 0.06 : 0.38}>
              <ellipse cx="1120" cy="330" rx="85" ry="24" fill={isDark ? '#312e81' : 'white'} />
              <ellipse cx="1095" cy="320" rx="52" ry="22" fill={isDark ? '#312e81' : 'white'} />
              <ellipse cx="1148" cy="318" rx="62" ry="24" fill={isDark ? '#3730a3' : 'white'} />
            </g>
            <g opacity={isDark ? 0.07 : 0.3}>
              <ellipse cx="140" cy="355" rx="75" ry="22" fill={isDark ? '#1e1b4b' : 'white'} />
              <ellipse cx="118" cy="345" rx="47" ry="20" fill={isDark ? '#1e1b4b' : 'white'} />
              <ellipse cx="168" cy="344" rx="57" ry="22" fill={isDark ? '#1e1b4b' : 'white'} />
            </g>
          </g>

          {/* Particles */}
          <g ref={particlesRef}>
            {PARTICLES.map(p => (
              <circle key={p.id} cx={`${p.x}%`} cy={`${p.y}%`} r={p.size}
                fill={isDark ? '#818cf8' : '#fbbf24'}
                opacity={0.35 + (p.id % 4) * 0.1}
                filter="url(#tf-glow)"
                style={{ animation: `float ${p.duration}s ease-in-out infinite`, animationDelay: `${p.delay}s` }}
              />
            ))}
          </g>

          {/* City silhouette — starts invisible, fades in on scroll */}
          <g ref={cityRef} style={{ opacity: 0, willChange: 'transform, opacity' }}>
            <rect x="0" y="810" width="1440" height="90" fill="url(#tf-city)" />

            {/* Far buildings */}
            <g fill={isDark ? '#1a1a3e' : '#1e1b4b'} opacity="0.55">
              {[
                [0,700,58,120],[55,718,40,102],[98,676,52,144],[148,728,36,92],
                [196,658,47,162],[238,698,32,122],[318,648,57,172],[372,698,42,122],
                [416,678,52,142],[595,638,67,182],[660,678,47,142],[700,648,62,172],
                [800,658,57,162],[900,628,72,192],[970,668,52,152],[1098,648,67,172],
                [1200,678,52,142],[1278,658,62,162],[1380,698,60,122]
              ].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
            </g>

            {/* Near buildings */}
            <g fill={isDark ? '#0c0c22' : '#0d0b1e'}>
              {[
                [0,748,82,152],[74,768,52,132],[118,738,72,162],[238,758,62,142],
                [358,728,92,172],[498,718,102,182],[648,708,82,192],
                [800,738,72,162],[918,698,92,202],[1078,728,82,172],
                [1198,718,92,182],[1318,738,122,162]
              ].map(([x, y, w, h], i) => <rect key={i} x={x} y={y} width={w} height={h} />)}
              {/* Tall skyscrapers */}
              <rect x="678" y="595" width="54" height="305" />
              <rect x="689" y="583" width="32" height="14" />
              <rect x="703" y="572" width="4" height="14" />
              <rect x="958" y="575" width="58" height="325" />
              <rect x="977" y="563" width="20" height="14" />
              <rect x="986" y="552" width="3" height="14" />
            </g>

            {/* Window lights */}
            <g fill={isDark ? '#fbbf24' : '#fef3c7'} opacity={isDark ? 0.65 : 0.85}>
              {Array.from({ length: 55 }, (_, i) => (
                <rect key={i}
                  x={40 + (i * 26) % 1360} y={630 + (i * 18) % 165}
                  width="3" height="4"
                  opacity={(i * 7 + 3) % 10 > 3 ? 1 : 0}
                />
              ))}
            </g>

            {/* Horizon glow */}
            <ellipse cx="720" cy="815" rx="420" ry="45"
              fill={isDark ? 'rgba(99,102,241,0.32)' : 'rgba(234,88,12,0.42)'}
              filter="url(#tf-soft)"
            />
          </g>
        </svg>

        {/* ── Hero Text ── */}
        <div
          ref={heroTextRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ willChange: 'transform, opacity' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8 border"
              style={{
                background: 'rgba(99,102,241,0.15)',
                borderColor: 'rgba(99,102,241,0.35)',
                color: '#a5b4fc',
                backdropFilter: 'blur(12px)'
              }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Team Task Manager · Now Live
            </div>

            <h1 className="font-display font-bold leading-none tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.8rem, 8vw, 6rem)', color: 'white', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>
              Manage your team.
              <br />
              <span style={{
                background: isDark
                  ? 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)'
                  : 'linear-gradient(135deg, #fde68a 0%, #fbbf24 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Effortlessly.
              </span>
            </h1>

            <p style={{ color: 'rgba(226,232,240,0.8)', fontSize: '1.15rem', lineHeight: 1.7, maxWidth: '32rem', margin: '0 auto' }}>
              Create projects, assign tasks, track progress — all in one beautiful workspace built for modern teams.
            </p>
          </motion.div>
        </div>

        {/* ── CTA Buttons ── */}
        <div
          ref={ctaRef}
          className="absolute inset-x-0 flex flex-col sm:flex-row items-center justify-center gap-4 px-6"
          style={{ bottom: '22%', opacity: 0, willChange: 'transform, opacity' }}
        >
          <motion.button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 rounded-xl font-bold text-white text-sm font-display tracking-wide"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              boxShadow: '0 8px 30px rgba(99,102,241,0.5)',
              backdropFilter: 'blur(8px)'
            }}
            whileHover={{ scale: 1.06, boxShadow: '0 12px 40px rgba(99,102,241,0.6)' }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free →
          </motion.button>

          <motion.button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 rounded-xl font-semibold text-sm"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.22)',
              color: 'white',
              backdropFilter: 'blur(10px)'
            }}
            whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.2)' }}
            whileTap={{ scale: 0.97 }}
          >
            Sign In
          </motion.button>
        </div>

        {/* ── Scroll hint ── */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          style={{ color: 'rgba(148,163,184,0.55)' }}
        >
          <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Scroll to explore</span>
          <div style={{ width: 20, height: 32, borderRadius: 10, border: '1.5px solid currentColor', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4px 0' }}>
            <div style={{ width: 3, height: 8, borderRadius: 2, background: 'currentColor', animation: 'float 1.4s ease-in-out infinite' }} />
          </div>
        </motion.div>

      </div>{/* end sticky */}
    </div>
  )
}

export default HeroScene
