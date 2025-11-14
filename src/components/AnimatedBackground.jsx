import React, { useEffect, useRef, useState } from 'react'

export default function AnimatedBackground({ isDarkMode }) {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const containerRef = useRef(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let particles = []
    let mouse = { x: 0, y: 0 }

    // Update mouse position
    const updateMouse = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    window.addEventListener('mousemove', updateMouse)

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Enhanced Particle class with luxury effects
    class Particle {
      constructor() {
        this.reset()
        this.baseSize = Math.random() * 2 + 1 // Smaller particles (1-3px)
        this.targetSize = this.baseSize
      }

      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2 + 1 // Smaller base size (1-3px)
        this.speedX = (Math.random() - 0.5) * 0.5
        this.speedY = (Math.random() - 0.5) * 0.5
        this.opacity = isDarkMode 
          ? Math.random() * 0.5 + 0.4 // Much higher opacity for dark mode
          : Math.random() * 0.6 + 0.5 // Much higher base opacity for light mode
        this.baseOpacity = this.opacity
        this.hue = isDarkMode 
          ? Math.random() * 60 + 180 // Cyan to blue range for dark mode
          : Math.random() * 80 + 140 // Teal to cyan range for light mode
        this.pulseSpeed = Math.random() * 0.015 + 0.008
        this.pulsePhase = Math.random() * Math.PI * 2
        this.angle = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.02
      }

      update() {
        // Smooth movement
        this.x += this.speedX
        this.y += this.speedY

        // Wrap around edges
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        // Mouse interaction - particles react to mouse (more pronounced)
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 250 // Increased interaction distance

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance
          const angle = Math.atan2(dy, dx)
          this.x -= Math.cos(angle) * force * 3 // Stronger push
          this.y -= Math.sin(angle) * force * 3
          this.targetSize = this.baseSize * (1 + force * 0.65) // 60-70% increase on hover
          this.opacity = Math.min(this.baseOpacity * (1 + force * 3), isDarkMode ? 1.0 : 0.9) // Much brighter on hover
        } else {
          this.targetSize = this.baseSize
          this.opacity = this.baseOpacity
        }

        // Smooth size transition
        this.size += (this.targetSize - this.size) * 0.1

        // Pulse animation
        this.pulsePhase += this.pulseSpeed
        this.angle += this.rotationSpeed
      }

      draw() {
        ctx.save()
        
        // Luxury glow effect with multiple layers (much stronger)
        const glowRadius = this.size * 12 // Larger glow radius
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, glowRadius
        )
        
        if (isDarkMode) {
          gradient.addColorStop(0, `hsla(${this.hue}, 90%, 75%, ${this.opacity * 1.2})`)
          gradient.addColorStop(0.3, `hsla(${this.hue}, 85%, 70%, ${this.opacity * 0.8})`)
          gradient.addColorStop(0.6, `hsla(${this.hue}, 80%, 65%, ${this.opacity * 0.5})`)
          gradient.addColorStop(1, `hsla(${this.hue}, 75%, 60%, 0)`)
        } else {
          gradient.addColorStop(0, `hsla(${this.hue}, 85%, 55%, ${this.opacity * 1.5})`)
          gradient.addColorStop(0.3, `hsla(${this.hue}, 80%, 50%, ${this.opacity * 1.2})`)
          gradient.addColorStop(0.6, `hsla(${this.hue}, 75%, 45%, ${this.opacity * 0.8})`)
          gradient.addColorStop(1, `hsla(${this.hue}, 70%, 40%, 0)`)
        }
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2)
        ctx.fill()
        
        // Core particle with rotation (much brighter)
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)
        ctx.globalAlpha = this.opacity
        ctx.fillStyle = isDarkMode 
          ? `hsla(${this.hue}, 90%, 80%, ${this.opacity * 2.0})`
          : `hsla(${this.hue}, 85%, 50%, ${this.opacity * 2.5})`
        
        // Draw star shape for luxury effect
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

    // Initialize particles (more particles for better visibility)
    const initParticles = () => {
      particles = []
      const particleCount = isDarkMode ? 120 : 100 // More particles
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle())
      }
    }

    initParticles()

    // Enhanced connections with gradient and glow
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 220) { // Increased connection distance
            const opacity = isDarkMode 
              ? (1 - distance / 220) * 0.7 // Much higher opacity
              : (1 - distance / 220) * 1.0 // Full opacity for light mode
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // Luxury gradient line with glow (much stronger)
            const lineGradient = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            )
            
            const hue1 = particles[i].hue
            const hue2 = particles[j].hue
            
            if (isDarkMode) {
              lineGradient.addColorStop(0, `hsla(${hue1}, 85%, 70%, ${opacity})`)
              lineGradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2}, 90%, 75%, ${opacity * 1.3})`)
              lineGradient.addColorStop(1, `hsla(${hue2}, 85%, 70%, ${opacity})`)
            } else {
              lineGradient.addColorStop(0, `hsla(${hue1}, 80%, 50%, ${opacity})`)
              lineGradient.addColorStop(0.5, `hsla(${(hue1 + hue2) / 2}, 85%, 55%, ${opacity * 1.5})`)
              lineGradient.addColorStop(1, `hsla(${hue2}, 80%, 50%, ${opacity})`)
            }
            
            ctx.strokeStyle = lineGradient
            ctx.lineWidth = 2.5 // Thicker lines
            ctx.lineCap = 'round'
            ctx.shadowBlur = 15 // Stronger shadow
            ctx.shadowColor = isDarkMode 
              ? `hsla(${(hue1 + hue2) / 2}, 90%, 75%, ${opacity * 0.8})`
              : `hsla(${(hue1 + hue2) / 2}, 85%, 55%, ${opacity * 0.8})`
            ctx.stroke()
            ctx.shadowBlur = 0
          }
        }
      }
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      drawConnections()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', updateMouse)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isDarkMode])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Luxury gradient mesh background */}
      <div
        className={`absolute inset-0 ${isDarkMode ? 'opacity-30' : 'opacity-70'}`}
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.15), transparent), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.15), transparent), radial-gradient(ellipse 50% 80% at 0% 50%, rgba(139, 92, 246, 0.1), transparent), radial-gradient(ellipse 50% 80% at 100% 50%, rgba(236, 72, 153, 0.1), transparent)'
            : 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16, 185, 129, 0.4), transparent), radial-gradient(ellipse 80% 50% at 50% 100%, rgba(59, 130, 246, 0.4), transparent), radial-gradient(ellipse 50% 80% at 0% 50%, rgba(139, 92, 246, 0.35), transparent), radial-gradient(ellipse 50% 80% at 100% 50%, rgba(236, 72, 153, 0.35), transparent)',
          backgroundBlendMode: 'overlay',
        }}
      />

      {/* Animated gradient blobs with luxury morphing */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary blob - Top Left */}
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
        
        {/* Secondary blob - Top Right */}
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
        
        {/* Tertiary blob - Bottom Left */}
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
        
        {/* Quaternary blob - Bottom Right */}
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
        
        {/* Center blob - Luxury accent */}
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

      {/* Luxury animated grid pattern */}
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

      {/* Luxury shimmer overlay */}
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

      {/* Interactive particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ 
          mixBlendMode: isDarkMode ? 'screen' : 'normal',
          opacity: isDarkMode ? 1.0 : 1.0, // Full opacity for both modes
        }}
      />

      {/* Luxury floating orbs with enhanced glow */}
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

      {/* Luxury radial gradient overlay for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: isDarkMode
            ? 'radial-gradient(ellipse 100% 60% at 50% 0%, transparent 0%, rgba(15, 23, 42, 0.4) 100%), radial-gradient(ellipse 100% 60% at 50% 100%, transparent 0%, rgba(15, 23, 42, 0.3) 100%)'
            : 'radial-gradient(ellipse 100% 60% at 50% 0%, transparent 0%, rgba(249, 250, 251, 0.6) 100%), radial-gradient(ellipse 100% 60% at 50% 100%, transparent 0%, rgba(249, 250, 251, 0.5) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Interactive mouse glow effect (much more pronounced) */}
      <div
        className="absolute pointer-events-none transition-opacity duration-300"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: 'translate(-50%, -50%)',
          width: '800px', // Larger glow
          height: '800px',
          borderRadius: '50%',
          background: isDarkMode
            ? 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(59, 130, 246, 0.3) 30%, rgba(139, 92, 246, 0.2) 50%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.6) 0%, rgba(59, 130, 246, 0.5) 30%, rgba(139, 92, 246, 0.4) 50%, transparent 70%)',
          filter: 'blur(100px)', // Stronger blur for more visible effect
          opacity: mousePosition.x > 0 && mousePosition.y > 0 ? 1 : 0,
          transition: 'opacity 0.2s ease, transform 0.1s ease',
        }}
      />
    </div>
  )
}
