'use client'

import { useEffect, useRef } from 'react'

const PIECES = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[0, 1, 0], [1, 1, 1]],
  [[0, 1, 1], [1, 1, 0]],
  [[1, 1, 0], [0, 1, 1]],
  [[1, 0], [1, 0], [1, 1]],
  [[0, 1], [0, 1], [1, 1]],
]

const COLORS = [
  'rgba(212, 160, 23, 0.45)',
  'rgba(212, 160, 23, 0.35)',
  'rgba(232, 192, 37, 0.40)',
  'rgba(160, 122, 16, 0.50)',
  'rgba(255, 200, 50, 0.30)',
]

const BLOCK = 32

type Piece = { x: number; y: number; shape: number[][]; color: string; speed: number }

export function TetrisBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf: number
    const pieces: Piece[] = []

    function resize() {
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    function spawn(startY?: number) {
      if (!canvas) return
      const shape = PIECES[Math.floor(Math.random() * PIECES.length)]
      const cols = Math.floor(canvas.width / BLOCK)
      pieces.push({
        x: Math.floor(Math.random() * Math.max(1, cols - 3)) * BLOCK,
        y: startY ?? -(shape.length * BLOCK),
        shape,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        speed: 1.0 + Math.random() * 1.4,
      })
    }

    // Pre-populate canvas on load
    for (let i = 0; i < 12; i++) {
      spawn(Math.random() * (canvas.height + 100))
    }

    let lastSpawn = 0

    function draw(t: number) {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (t - lastSpawn > 1200) {
        spawn()
        lastSpawn = t
      }

      for (let i = pieces.length - 1; i >= 0; i--) {
        const p = pieces[i]
        p.y += p.speed

        ctx.fillStyle = p.color
        ctx.strokeStyle = p.color.replace(/[\d.]+\)$/, '0.25)')
        ctx.lineWidth = 1

        for (let r = 0; r < p.shape.length; r++) {
          for (let c = 0; c < p.shape[r].length; c++) {
            if (p.shape[r][c]) {
              ctx.fillRect(p.x + c * BLOCK + 2, p.y + r * BLOCK + 2, BLOCK - 4, BLOCK - 4)
              ctx.strokeRect(p.x + c * BLOCK + 2, p.y + r * BLOCK + 2, BLOCK - 4, BLOCK - 4)
            }
          }
        }

        if (p.y > canvas.height + BLOCK * 5) pieces.splice(i, 1)
      }

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}
