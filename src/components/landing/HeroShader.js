'use client'

import { useEffect, useRef } from 'react'

const HeroShader = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let w, h
    let particles = []
    let tier

    const getTier = () => {
      const w = window.innerWidth
      if (w < 768) return 'mobile'
      if (w < 1024) return 'tablet'
      return 'desktop'
    }

    const resize = () => {
      w = canvas.parentElement.clientWidth
      h = canvas.parentElement.clientHeight
      canvas.width = w
      canvas.height = h
    }

    const init = () => {
      resize()
      tier = getTier()
      const isMobile = tier === 'mobile'
      const isTablet = tier === 'tablet'
      const count = isMobile ? 25 : isTablet ? 45 : 100
      particles = []
      const maxSize = isMobile ? 2 : isTablet ? 2.5 : 4
      const baseSize = isMobile ? 0.5 : isTablet ? 1 : 2
      const speed = isMobile ? 0.15 : isTablet ? 0.25 : 0.4
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * speed,
          vy: (Math.random() - 0.5) * speed,
          size: baseSize + Math.random() * maxSize,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }

    let resizeTimer
    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resize()
        const newTier = getTier()
        if (newTier !== tier) init()
      }, 200)
    }

    const mouse = { x: -9999, y: -9999 }
    const target = { x: -9999, y: -9999 }

    const handleMouse = (e) => {
      const rect = canvas.getBoundingClientRect()
      target.x = e.clientX - rect.left
      target.y = e.clientY - rect.top
    }

    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('resize', handleResize)

    let time = 0

    const getColor = () => {
      const isDark = document.documentElement.classList.contains('dark')
      return isDark ? [0, 220, 140] : [0, 105, 72]
    }

    const animate = () => {
      animationId = requestAnimationFrame(animate)
      time += 0.016

      mouse.x += (target.x - mouse.x) * 0.08
      mouse.y += (target.y - mouse.y) * 0.08

      ctx.clearRect(0, 0, w, h)

      const [r, g, b] = getColor()

      const isDark = document.documentElement.classList.contains('dark')

      for (const p of particles) {
        const drift = Math.sin(time * 0.5 + p.phase) * 0.3
        const drift2 = Math.cos(time * 0.4 + p.phase * 1.3) * 0.3

        p.x += p.vx + drift
        p.y += p.vy + drift2

        const dx = p.x - mouse.x
        const dy = p.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 1) {
          const force = (100 - dist) / 100 * 1.5
          p.x += (dx / dist) * force
          p.y += (dy / dist) * force
        }

        if (p.x < 0) p.x += w
        if (p.x > w) p.x -= w
        if (p.y < 0) p.y += h
        if (p.y > h) p.y -= h

        const alpha = isDark
          ? 0.6 + Math.sin(time * 0.3 + p.phase) * 0.2
          : 0.3 + Math.sin(time * 0.3 + p.phase) * 0.15
        const glowRadius = isDark ? p.size * 4 : p.size * 2.5
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius)
        gradient.addColorStop(0, `rgba(${r},${g},${b},${alpha})`)
        gradient.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    init()
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('mousemove', handleMouse)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
}

export default HeroShader
