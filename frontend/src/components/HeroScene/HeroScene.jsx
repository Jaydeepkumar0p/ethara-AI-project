import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useThemeStore from '../../store/themeStore'

const isLowEnd = () => {
  try {
    return navigator.hardwareConcurrency <= 2
  } catch {
    return false
  }
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: 5 + (i * 8.3) % 90,
  y: 10 + (i * 7.1) % 65,
  size: 1 + (i % 3),
  delay: (i * 0.6) % 4,
  duration: 3 + (i % 4)
}))

const STARS = Array.from({ length: 45 }, (_, i) => ({
  id: i,
  x: (i * 2.3) % 100,
  y: (i * 1.7) % 58,
  size: 0.5 + (i % 3) * 0.5,
  delay: (i * 0.4) % 3
}))

const HeroScene = () => {
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const low = isLowEnd()

  const grad0 = useRef(null)
  const grad1 = useRef(null)
  const grad2 = useRef(null)
  const cloud1Ref = useRef(null)
  const cloud2Ref = useRef(null)
  const cityRef = useRef(null)
  const heroTextRef = useRef(null)
  const ctaRef = useRef(null)
  const particlesRef = useRef(null)

  useEffect(() => {
    let rafId
    let lastScroll = -1

    const animate = () => {
      const scrollTop = window.scrollY
      if (scrollTop === lastScroll) {
        rafId = requestAnimationFrame(animate)
        return
      }
      lastScroll = scrollTop

      const docH = document.documentElement.scrollHeight - window.innerHeight
      const prog = docH > 0 ? Math.min(scrollTop / docH, 1) : 0

      // smoother phases
      const p1 = Math.min(prog / 0.4, 1)
      const p2 = Math.min(Math.max((prog - 0.25) / 0.4, 0), 1)
      const p3 = Math.min(Math.max((prog - 0.55) / 0.45, 0), 1)

      // SKY GRADIENT
      if (grad0.current && grad1.current && grad2.current) {
        grad0.current.setAttribute(
          'stop-color',
          isDark ? `hsl(240,50%,${5 + p1 * 12}%)` : `hsl(${250 + p1 * 30},70%,${45 + p1 * 25}%)`
        )

        grad1.current.setAttribute(
          'stop-color',
          isDark ? `hsl(250,60%,${8 + p1 * 14}%)` : `hsl(${280 + p1 * 20},65%,${50 + p1 * 20}%)`
        )

        grad2.current.setAttribute(
          'stop-color',
          isDark ? `hsl(280,40%,${4 + p1 * 10}%)` : `hsl(${25 - p1 * 15},85%,${55 + p1 * 20}%)`
        )
      }

      // CLOUDS
      if (!low) {
        if (cloud1Ref.current)
          cloud1Ref.current.style.transform = `translateX(${p1 * -40}px)`
        if (cloud2Ref.current)
          cloud2Ref.current.style.transform = `translateX(${p1 * 30}px)`
      }

      // CITY — FIXED (appears earlier, no blank gap)
      const cityReveal = Math.min(Math.max((prog - 0.15) / 0.5, 0), 1)
      if (cityRef.current) {
        cityRef.current.style.opacity = cityReveal
        cityRef.current.style.transform = `translateY(${(1 - cityReveal) * 15}px)`
      }

      // HERO TEXT — smoother fade
      if (heroTextRef.current) {
        heroTextRef.current.style.opacity = Math.max(1 - p2 * 1.4, 0)
        heroTextRef.current.style.transform = `translateY(${-p2 * 25}px)`
      }

      // CTA — overlaps hero fade (no dead zone)
      const showCTA = Math.min(Math.max((prog - 0.35) / 0.2, 0), 1)
      if (ctaRef.current) {
        ctaRef.current.style.opacity = showCTA
        ctaRef.current.style.transform = `translateY(${(1 - showCTA) * 20}px)`
      }

      // PARTICLES fade
      if (particlesRef.current) {
        particlesRef.current.style.opacity = Math.max(1 - p3 * 3, 0)
      }

      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [isDark, low])

  const skyC = isDark
    ? { c0: '#050510', c1: '#0a0a20', c2: '#06060f' }
    : { c0: '#6d28d9', c1: '#9333ea', c2: '#ea580c' }

  return (
    <div className="relative" style={{ height: '180vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* subtle depth overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none z-10" />

        {/* SVG BACKGROUND */}
        <svg viewBox="0 0 1440 900" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="sky">
              <stop ref={grad0} offset="0%" stopColor={skyC.c0} />
              <stop ref={grad1} offset="50%" stopColor={skyC.c1} />
              <stop ref={grad2} offset="100%" stopColor={skyC.c2} />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill="url(#sky)" />
        </svg>

        {/* HERO TEXT */}
        <div
          ref={heroTextRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
        >
          <h1 className="text-white font-bold text-5xl md:text-7xl">
            Manage your team
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">
              Effortlessly
            </span>
          </h1>

          <p className="mt-6 text-white/70 max-w-xl">
            Create tasks, manage projects, and track progress in one workspace.
          </p>
        </div>

        {/* CITY */}
        <div ref={cityRef} className="absolute bottom-0 w-full opacity-0">
          <div className="h-40 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="absolute bottom-24 w-full flex justify-center gap-4 opacity-0"
        >
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl"
          >
            Get Started
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white/10 text-white rounded-xl"
          >
            Sign In
          </button>
        </div>

      </div>
    </div>
  )
}

export default HeroScene
