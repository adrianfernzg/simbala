'use client'

import { useEffect, useRef } from 'react'

interface BorderOrbProps {
  children: React.ReactNode
  className?: string
  speed?: number
}

const TRAIL = 14

function makeOrbStyle(bright: boolean): React.CSSProperties {
  return {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: bright
      ? 'radial-gradient(circle, #ffffff 0%, #ffe066 30%, #d4a017 65%, transparent 100%)'
      : 'radial-gradient(circle, #ffffff 0%, #ffe066 30%, #d4a017 65%, transparent 100%)',
    boxShadow:
      '0 0 8px 4px rgba(212,160,23,1), 0 0 22px 8px rgba(212,160,23,0.6), 0 0 50px 16px rgba(212,160,23,0.25)',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
  }
}

export function BorderOrb({ children, className = '', speed = 5 }: BorderOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const orb1Ref = useRef<HTMLDivElement>(null)
  const orb2Ref = useRef<HTMLDivElement>(null)
  const trail1Refs = useRef<(HTMLDivElement | null)[]>([])
  const trail2Refs = useRef<(HTMLDivElement | null)[]>([])
  const tRef = useRef(0)

  useEffect(() => {
    const container = containerRef.current
    const orb1 = orb1Ref.current
    const orb2 = orb2Ref.current
    if (!container || !orb1 || !orb2) return

    let raf: number
    const hist1: { x: number; y: number }[] = []
    const hist2: { x: number; y: number }[] = []

    function getPos(t: number, w: number, h: number) {
      const perimeter = 2 * (w + h)
      const n = ((t % perimeter) + perimeter) % perimeter
      if (n < w)           return { x: n,               y: 0             }
      if (n < w + h)       return { x: w,                y: n - w         }
      if (n < 2 * w + h)   return { x: w - (n - w - h),  y: h             }
      return                      { x: 0,                y: h - (n - 2 * w - h) }
    }

    function applyTrail(
      refs: (HTMLDivElement | null)[],
      hist: { x: number; y: number }[]
    ) {
      refs.forEach((el, i) => {
        if (!el) return
        const entry = hist[i + 1]
        if (!entry) { el.style.opacity = '0'; return }
        const progress = 1 - (i + 1) / (TRAIL + 1)
        const size = Math.max(3, 12 * (0.2 + progress * 0.8))
        el.style.left    = `${entry.x}px`
        el.style.top     = `${entry.y}px`
        el.style.opacity = String(progress * 0.85)
        el.style.width   = `${size}px`
        el.style.height  = `${size}px`
      })
    }

    function animate() {
      if (!container || !orb1 || !orb2) return
      const w = container.offsetWidth
      const h = container.offsetHeight
      const perimeter = 2 * (w + h)

      tRef.current = (tRef.current + speed) % perimeter

      const pos1 = getPos(tRef.current, w, h)
      const pos2 = getPos(tRef.current + perimeter / 2, w, h)

      orb1.style.left = `${pos1.x}px`
      orb1.style.top  = `${pos1.y}px`
      orb2.style.left = `${pos2.x}px`
      orb2.style.top  = `${pos2.y}px`

      hist1.unshift(pos1)
      hist2.unshift(pos2)
      if (hist1.length > TRAIL + 1) hist1.length = TRAIL + 1
      if (hist2.length > TRAIL + 1) hist2.length = TRAIL + 1

      applyTrail(trail1Refs.current, hist1)
      applyTrail(trail2Refs.current, hist2)

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [speed])

  const trailStyle: React.CSSProperties = {
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: 'radial-gradient(circle, #ffe066 0%, #d4a017 60%, transparent 100%)',
    boxShadow: '0 0 4px 2px rgba(212,160,23,0.5), 0 0 10px 3px rgba(212,160,23,0.25)',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    opacity: 0,
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trail 1 */}
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div key={`t1-${i}`} ref={(el) => { trail1Refs.current[i] = el }}
          className="pointer-events-none z-19" style={trailStyle} />
      ))}
      {/* Trail 2 */}
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div key={`t2-${i}`} ref={(el) => { trail2Refs.current[i] = el }}
          className="pointer-events-none z-19" style={trailStyle} />
      ))}

      {/* Orb 1 */}
      <div ref={orb1Ref} className="pointer-events-none z-20" style={makeOrbStyle(true)} />
      {/* Orb 2 */}
      <div ref={orb2Ref} className="pointer-events-none z-20" style={makeOrbStyle(false)} />

      {children}
    </div>
  )
}
