import { useRef, useEffect } from 'react'

const useScrollProgress = (callback) => {
  const rafRef = useRef(null)
  const lastProgressRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return
      
      rafRef.current = requestAnimationFrame(() => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
        
        if (Math.abs(progress - lastProgressRef.current) > 0.001) {
          lastProgressRef.current = progress
          callback(progress)
        }
        
        rafRef.current = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [callback])

  return lastProgressRef
}

export default useScrollProgress
