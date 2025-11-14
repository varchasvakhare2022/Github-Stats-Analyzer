import React, { useEffect, useRef, useState, memo } from 'react'

const AnimatedBackground = memo(function AnimatedBackground({ isDarkMode }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    let particles = []
    let mouse = { x: 0, y: 0 }
    let rafId = null

    let mouseUpdateRaf = null
    const updateMouse = (e) => {
      if (!mouseUpdateRaf) {
        mouseUpdateRaf = requestAnimationFrame(() => {
          mouse.x = e.clientX
          mouse.y = e.clientY
          mouseUpdateRaf = null
        })
      }
    }
    window.addEventListener('mousemove', updateMouse, { passive: true })

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas, { passive: true })

    class Particle {
      constructor() {
        this.reset()
        this.baseSize = Math.random() * 2 + 1
        this.targetSize = this.baseSize
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1
        this.speedX = (Math.random() - 0.5) * 0.4
        this.speedY = (Math.random() - 0.5) * 0.4
        this.opacity = isDarkMode 
          ? Math.random() * 0.4 + 0.5
          : Math.random() * 0.5 + 0.5
        this.baseOpacity = this.opacity
        this.hue = isDarkMode 
          ? Math.random() * 60 + 180
          : Math.random() * 80 + 140
        this.pulseSpeed = Math.random() * 0.01 + 0.005
        this.pulsePhase = Math.random() * Math.PI * 2
        this.angle = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.015
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distSq = dx * dx + dy * dy
        const maxDistSq = 250 * 250

        if (distSq < maxDistSq) {
          const distance = Math.sqrt(distSq)
          const force = (250 - distance) / 250
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * force * 2.5
          this.y -= Math.sin(angle) * force * 2.5
          this.targetSize = this.baseSize * (1 + force * 0.65)
          this.opacity = Math.min(this.baseOpacity * (1 + force * 2.5), isDarkMode ? 1.0 : 0.9)
        } else {
          this.targetSize = this.baseSize
          this.opacity = this.baseOpacity
        }

        this.size += (this.targetSize - this.size) * 0.12

        this.pulsePhase += this.pulseSpeed
        this.angle += this.rotationSpeed
      }

      draw() {
        const glowRadius = this.size * 10
        
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, glowRadius
        )
        
        if (isDarkMode) {
          gradient.addColorStop(0, `hsla(${this.hue}, 90%, 75%, ${this.opacity * 1.1})`)
          gradient.addColorStop(0.5, `hsla(${this.hue}, 85%, 70%, ${this.opacity * 0.6})`)
          gradient.addColorStop(1, 'transparent')
        } else {
          gradient.addColorStop(0, `hsla(${this.hue}, 85%, 55%, ${this.opacity * 1.3})`)
          gradient.addColorStop(0.5, `hsla(${this.hue}, 80%, 50%, ${this.opacity * 1.0})`)
          gradient.addColorStop(1, 'transparent')
        }
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = isDarkMode 
          ? `hsla(${this.hue}, 90%, 80%, ${this.opacity * 1.8})`
          : `hsla(${this.hue}, 85%, 50%, ${this.opacity * 2.2})`
        
        ctx.beginPath()
        const spikes = 5
        const outerRadius = this.size
        const innerRadius = this.size * 0.5
        for (let i = 0; i < spikes * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (i * Math.PI) / spikes - Math.PI / 2
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      }
    }

    const initParticles = () => {
      particles = []
      const particleCount = isDarkMode ? 60 : 50
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    initParticles()

    const drawConnections = () => {
      const maxDist = 180
      const maxDistSq = maxDist * maxDist
      const connections = []
      
      const maxConnectionsPerParticle = 3
      
      for (let i = 0; i < particles.length; i++) {
        let connectionCount = 0
        for (let j = i + 1; j < particles.length && connectionCount < maxConnectionsPerParticle; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distSq = dx * dx + dy * dy

          if (distSq < maxDistSq) {
            const distance = Math.sqrt(distSq)
            const opacity = isDarkMode 
              ? (1 - distance / maxDist) * 0.5
              : (1 - distance / maxDist) * 0.8
            
            connections.push({
              x1: particles[i].x,
              y1: particles[i].y,
              x2: particles[j].x,
              y2: particles[j].y,
              hue1: particles[i].hue,
              hue2: particles[j].hue,
              opacity
            })
            connectionCount++
          }
        }
      }

      connections.forEach(conn => {
        const lineGradient = ctx.createLinearGradient(conn.x1, conn.y1, conn.x2, conn.y2)
        const midHue = (conn.hue1 + conn.hue2) / 2
        
        if (isDarkMode) {
          lineGradient.addColorStop(0, `hsla(${conn.hue1}, 85%, 70%, ${conn.opacity})`)
          lineGradient.addColorStop(0.5, `hsla(${midHue}, 90%, 75%, ${conn.opacity * 1.2})`)
          lineGradient.addColorStop(1, `hsla(${conn.hue2}, 85%, 70%, ${conn.opacity})`)
        } else {
          lineGradient.addColorStop(0, `hsla(${conn.hue1}, 80%, 50%, ${conn.opacity})`)
          lineGradient.addColorStop(0.5, `hsla(${midHue}, 85%, 55%, ${conn.opacity * 1.3})`)
          lineGradient.addColorStop(1, `hsla(${conn.hue2}, 80%, 50%, ${conn.opacity})`)
        }
        
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(conn.x1, conn.y1)
        ctx.lineTo(conn.x2, conn.y2)
        ctx.stroke()
      })
    }

    const animate = () => {
      rafId = requestAnimationFrame(animate)
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(particle => {
        particle.update()
      })

      drawConnections()

      particles.forEach(particle => {
        particle.draw()
      })
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', updateMouse)
      if (rafId) {
        cancelAnimationFrame(rafId)
      }
      if (mouseUpdateRaf) {
        cancelAnimationFrame(mouseUpdateRaf)
      }
    }
  }, [isDarkMode])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div
        className={`absolute inset-0 ${isDarkMode ? 'opacity-30' : 'opacity-70'}`}
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.15), transparent), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.15), transparent), radial-gradient(ellipse 50% 80% at 0% 50%, rgba(139, 92, 246, 0.1), transparent), radial-gradient(ellipse 50% 80% at 100% 50%, rgba(236, 72, 153, 0.1), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.4), transparent), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.4), transparent), radial-gradient(ellipse 50% 80% at 0% 50%, rgba(139, 92, 246, 0.35), transparent), radial-gradient(ellipse 50% 80% at 100% 50%, rgba(236, 72, 153, 0.35), transparent)',
          backgroundBlendMode: 'overlay',
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute -top-40 -left-40 w-[800px] h-[800px] rounded-full blur-[120px] ${
            isDarkMode
              ? 'bg-gradient-to-r from-emerald-500/40 via-cyan-500/30 to-blue-500/40'
              : 'bg-gradient-to-r from-emerald-400/70 via-cyan-400/65 to-blue-400/70'
          }`}
          style={{
            animation: 'luxuryBlob 30s ease-in-out infinite',
          }}
        />
        
        <div
          className={`absolute -top-40 -right-40 w-[900px] h-[900px] rounded-full blur-[140px] ${
            isDarkMode
              ? 'bg-gradient-to-r from-purple-500/35 via-pink-500/30 to-rose-500/35'
              : 'bg-gradient-to-r from-purple-400/65 via-pink-400/60 to-rose-400/65'
          }`}
          style={{
            animation: 'luxuryBlob 35s ease-in-out infinite',
            animationDelay: '-8s',
          }}
        />
        
        <div
          className={`absolute -bottom-40 -left-40 w-[850px] h-[850px] rounded-full blur-[130px] ${
            isDarkMode
              ? 'bg-gradient-to-r from-amber-500/30 via-orange-500/25 to-red-500/30'
              : 'bg-gradient-to-r from-amber-400/60 via-orange-400/55 to-red-400/60'
          }`}
          style={{
            animation: 'luxuryBlob 40s ease-in-out infinite',
            animationDelay: '-15s',
          }}
        />
        
        <div
          className={`absolute -bottom-40 -right-40 w-[750px] h-[750px] rounded-full blur-[110px] ${
            isDarkMode
              ? 'bg-gradient-to-r from-indigo-500/35 via-blue-500/30 to-cyan-500/35'
              : 'bg-gradient-to-r from-indigo-400/65 via-blue-400/60 to-cyan-400/65'
          }`}
          style={{
            animation: 'luxuryBlob 32s ease-in-out infinite',
            animationDelay: '-12s',
          }}
        />
        
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] ${
            isDarkMode
              ? 'bg-gradient-to-r from-violet-500/25 via-purple-500/20 to-fuchsia-500/25'
              : 'bg-gradient-to-r from-violet-400/55 via-purple-400/50 to-fuchsia-400/55'
          }`}
          style={{
            animation: 'luxuryBlob 45s ease-in-out infinite',
            animationDelay: '-22s',
          }}
        />
      </div>

      <div
        className={`absolute inset-0 ${
          isDarkMode ? 'opacity-[0.08]' : 'opacity-[0.25]'
        }`}
        style={{
          backgroundImage: `
            linear-gradient(${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.5)'} 1px, transparent 1px),
            linear-gradient(90deg, ${isDarkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.5)'} 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          animation: 'luxuryGrid 30s linear infinite',
          maskImage: 'radial-gradient(ellipse 80% 50% at center, black 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at center, black 40%, transparent 70%)',
        }}
      />

      <div
        className={`absolute inset-0 ${
          isDarkMode ? 'opacity-[0.06]' : 'opacity-[0.2]'
        }`}
        style={{
          background: `linear-gradient(
            135deg,
            transparent 0%,
            ${isDarkMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.4)'} 25%,
            ${isDarkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.4)'} 50%,
            ${isDarkMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.4)'} 75%,
            transparent 100%
          )`,
          backgroundSize: '300% 300%',
          animation: 'luxuryShimmer 20s ease-in-out infinite',
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ 
          mixBlendMode: isDarkMode ? 'screen' : 'normal',
          opacity: isDarkMode ? 1.0 : 1.0,
        }}
      />

      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[150px] ${
            isDarkMode ? 'bg-emerald-500/25' : 'bg-emerald-400/55'
          }`}
          style={{
            animation: 'luxuryFloat 25s ease-in-out infinite',
            boxShadow: isDarkMode
              ? '0 0 200px rgba(16, 185, 129, 0.4), 0 0 400px rgba(16, 185, 129, 0.2)'
              : '0 0 250px rgba(16, 185, 129, 0.7), 0 0 500px rgba(16, 185, 129, 0.5)',
          }}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-[420px] h-[420px] rounded-full blur-[160px] ${
            isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-400/50'
          }`}
          style={{
            animation: 'luxuryFloat 30s ease-in-out infinite',
            animationDelay: '-8s',
            boxShadow: isDarkMode
              ? '0 0 220px rgba(6, 182, 212, 0.4), 0 0 450px rgba(6, 182, 212, 0.2)'
              : '0 0 270px rgba(6, 182, 212, 0.7), 0 0 550px rgba(6, 182, 212, 0.5)',
          }}
        />
        <div
          className={`absolute top-1/2 right-1/3 w-80 h-80 rounded-full blur-[140px] ${
            isDarkMode ? 'bg-blue-500/20' : 'bg-blue-400/50'
          }`}
          style={{
            animation: 'luxuryFloat 28s ease-in-out infinite',
            animationDelay: '-14s',
            boxShadow: isDarkMode
              ? '0 0 200px rgba(59, 130, 246, 0.4), 0 0 400px rgba(59, 130, 246, 0.2)'
              : '0 0 250px rgba(59, 130, 246, 0.7), 0 0 500px rgba(59, 130, 246, 0.5)',
          }}
        />
        <div
          className={`absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full blur-[130px] ${
            isDarkMode ? 'bg-purple-500/18' : 'bg-purple-400/48'
          }`}
          style={{
            animation: 'luxuryFloat 22s ease-in-out infinite',
            animationDelay: '-10s',
            boxShadow: isDarkMode
              ? '0 0 180px rgba(168, 85, 247, 0.4), 0 0 380px rgba(168, 85, 247, 0.2)'
              : '0 0 230px rgba(168, 85, 247, 0.7), 0 0 480px rgba(168, 85, 247, 0.5)',
          }}
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 100% 60% at 50% 0%, transparent 0%, rgba(15, 23, 42, 0.4) 100%), radial-gradient(ellipse 100% 60% at 50% 100%, transparent 0%, rgba(15, 23, 42, 0.3) 100%)'
            : 'radial-gradient(ellipse 100% 60% at 50% 0%, transparent 0%, rgba(249, 250, 251, 0.6) 100%), radial-gradient(ellipse 100% 60% at 50% 100%, transparent 0%, rgba(249, 250, 251, 0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 30%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(59, 130, 246, 0.5) 30%, rgba(139, 92, 246, 0.4) 50%, transparent 70%)',
          filter: 'blur(100px)',
          opacity: mousePosition.x > 0 && mousePosition.y > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease, transform 0.1s ease',
        }}
      />
    </div>
  )
})

export default AnimatedBackground
