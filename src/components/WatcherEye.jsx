import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

export function WatcherEye({ size = 32, track = true, blink = true, animate = true, glow = false }) {
  const containerRef = useRef(null)
  const [isBlinking, setIsBlinking] = useState(false)
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 300, damping: 25 })
  const y = useSpring(rawY, { stiffness: 300, damping: 25 })
  const MAX_OFFSET = 8

  useEffect(() => {
    if (!track) return
    const handleMove = (e) => {
      const el = containerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)
      const factor = Math.min(dist / 600, 1)
      const angle = Math.atan2(dy, dx)
      rawX.set(Math.cos(angle) * MAX_OFFSET * factor)
      rawY.set(Math.sin(angle) * MAX_OFFSET * factor * 0.7)
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [track, rawX, rawY])

  useEffect(() => {
    if (!blink) return
    let timeoutId
    const doBlink = () => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 140)
      if (Math.random() < 0.15) {
        setTimeout(() => { setIsBlinking(true); setTimeout(() => setIsBlinking(false), 140) }, 300)
      }
      timeoutId = setTimeout(doBlink, 3000 + Math.random() * 4000)
    }
    timeoutId = setTimeout(doBlink, 1500 + Math.random() * 2000)
    return () => clearTimeout(timeoutId)
  }, [blink])

  const pupilX = useTransform(x, (v) => 50 + v)
  const pupilY = useTransform(y, (v) => 50 + v)
  const irisX = useTransform(x, (v) => 50 + v * 0.6)
  const irisY = useTransform(y, (v) => 50 + v * 0.6)

  return (
    <motion.div
      ref={containerRef}
      initial={animate ? { scale: 0.6, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: size, height: size }}
      className="relative inline-flex items-center justify-center"
    >
      {glow && (
        <div className="absolute inset-0 rounded-full blur-2xl opacity-40 -z-10"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)' }} />
      )}
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="eyeOuter" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#818cf8" /><stop offset="1" stopColor="#6366f1" />
          </linearGradient>
          <radialGradient id="irisGrad" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="60%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>
          <clipPath id="eyeShape">
            <path d="M 8 50 Q 50 10 92 50 Q 50 90 8 50 Z" />
          </clipPath>
        </defs>
        <rect width="100" height="100" rx="24" fill="url(#eyeOuter)" />
        <path d="M 18 50 Q 50 22 82 50 Q 50 78 18 50 Z" fill="#fafafa" />
        <g clipPath="url(#eyeShape)">
          <motion.circle cx={irisX} cy={irisY} r="14" fill="url(#irisGrad)" />
          <motion.circle cx={pupilX} cy={pupilY} r="6" fill="#0a0a0b" />
          <motion.circle
            cx={useTransform(pupilX, (v) => v - 2)}
            cy={useTransform(pupilY, (v) => v - 2.5)}
            r="1.8" fill="#ffffff" opacity="0.95"
          />
        </g>
        <motion.path
          fill="#6366f1"
          animate={{ d: isBlinking ? 'M 18 50 Q 50 50 82 50 L 82 50 Q 50 50 18 50 Z' : 'M 18 50 Q 50 22 82 50 L 82 22 Q 50 22 18 22 Z' }}
          transition={{ duration: 0.07 }}
        />
        <motion.path
          fill="#6366f1"
          animate={{ d: isBlinking ? 'M 18 50 Q 50 50 82 50 L 82 78 Q 50 78 18 78 Z' : 'M 18 50 Q 50 78 82 50 L 82 78 Q 50 78 18 78 Z' }}
          transition={{ duration: 0.07 }}
        />
      </svg>
    </motion.div>
  )
}