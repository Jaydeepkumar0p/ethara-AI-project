import { useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useScrollProgress from '../../hooks/useScrollProgress'
import useThemeStore from '../../store/themeStore'

// Detect low-end devices
const isLowEnd = () => {
  return (
    navigator.hardwareConcurrency <= 2 ||
    window.devicePixelRatio < 1.5 ||
    /Android.*4\.|iPhone OS [5-9]_/.test(navigator.userAgent)
  )
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

  const handleScroll = useCallback(
    (progress) => {
      if (!heroRef.current) return

      const p1 = Math.min(progress / 0.3, 1)
      const p2 = Math.min(Math.max((progress - 0.3) / 0.3, 0), 1)
      const p3 = Math.min(Math.max((progress - 0.6) / 0.4, 0), 1)

      if (cityRef.current) {
        cityRef.current.style.opacity = p2
      }

      if (textRef.current) {
        textRef.current.style.opacity = Math.max(1 - p2 * 2, 0)
      }

      if (ctaRef.current) {
        ctaRef.current.style.opacity = Math.min(p2 * 2, 1)
      }

      if (heroRef.current) {
        heroRef.current.style.transform = `scale(${1 - p3 * 0.02})`
      }
    },
    []
  )

  useScrollProgress(handleScroll)

  const particles = Array.from({ length: lowEnd.current ? 6 : 14 })

  const stars = isDark
    ? Array.from({ length: lowEnd.current ? 20 : 50 })
    : []

  const skyColors = isDark
    ? { c1: '#0a0a1a', c2: '#0d0d2b', c3: '#080814' }
    : { c1: '#7c3aed', c2: '#a855f7', c3: '#f97316' }

  return (
    <div ref={heroRef} className="relative min-h-[300vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1440 900">
          <defs>
            <linearGradient id="skyGrad" ref={skyRef}>
              <stop offset="0%" stopColor={skyColors.c1} />
              <stop offset="50%" stopColor={skyColors.c2} />
              <stop offset="100%" stopColor={skyColors.c3} />
            </linearGradient>
          </defs>

          <rect width="1440" height="900" fill="url(#skyGrad)" />

          {/* city */}
          <g ref={cityRef} opacity="0">
            <rect x="0" y="800" width="1440" height="100" fill="#111" />
          </g>

          {/* particles */}
          <g ref={particlesRef}>
            {particles.map((_, i) => (
              <circle key={i} cx="50" cy="50" r="2" fill="white" />
            ))}
          </g>
        </svg>

        {/* text */}
        <div
          ref={textRef}
          className="absolute inset-0 flex items-center justify-center text-white text-4xl"
        >
          Manage your team
        </div>

        {/* CTA */}
        <div
          ref={ctaRef}
          className="absolute bottom-20 w-full flex justify-center gap-4"
        >
          <button onClick={() => navigate('/register')}>Get Started</button>
        </div>
      </div>
    </div>
  )
}

export default HeroScene
