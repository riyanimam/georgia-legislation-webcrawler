import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    // Generate random particles
    const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20,
      duration: Math.random() * 7 + 5,
      delay: Math.random() * 1,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {/* Gradient Orbs */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          animate={{
            x: [0, Math.random() * 100 - 50, 0],
            y: [0, Math.random() * 100 - 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${getRandomColor()} 0%, transparent 70%)`,
            filter: 'blur(40px)',
          }}
        />
      ))}

      {/* Floating Georgia Peaches */}
      <motion.img
        src={`${import.meta.env.BASE_URL}peach.svg`}
        alt=""
        animate={{
          y: [0, -30, 0],
          rotate: [0, 5, 0, -5, 0],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '15%',
          width: '80px',
          height: '80px',
        }}
      />

      <motion.img
        src={`${import.meta.env.BASE_URL}peach.svg`}
        alt=""
        animate={{
          y: [0, 40, 0],
          rotate: [0, -8, 0, 8, 0],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '10%',
          width: '100px',
          height: '100px',
        }}
      />

      {/* Floating Capitol */}
      <motion.img
        src={`${import.meta.env.BASE_URL}capitol-detailed.svg`}
        alt=""
        animate={{
          y: [0, -20, 0],
          opacity: [0.08, 0.15, 0.08],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '5%',
          width: '120px',
          height: '140px',
        }}
      />

      {/* Georgia State Outline */}
      <motion.img
        src={`${import.meta.env.BASE_URL}georgia-state.svg`}
        alt=""
        animate={{
          rotate: [0, 2, 0, -2, 0],
          scale: [1, 1.05, 1],
          opacity: [0.05, 0.12, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: '30%',
          right: '8%',
          width: '180px',
          height: '216px',
        }}
      />

      {/* Voting Icon */}
      <motion.img
        src={`${import.meta.env.BASE_URL}voting.svg`}
        alt=""
        animate={{
          y: [0, -25, 0],
          x: [0, 15, 0],
          rotate: [0, -3, 0, 3, 0],
          opacity: [0.12, 0.2, 0.12],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '20%',
          width: '90px',
          height: '90px',
        }}
      />

      {/* Shimmer Lines */}
      <motion.div
        animate={{
          x: [-1000, 2000],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          width: '600px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.4), transparent)',
          transform: 'rotate(45deg)',
        }}
      />

      <motion.div
        animate={{
          x: [2000, -1000],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
          delay: 1,
        }}
        style={{
          position: 'absolute',
          top: '60%',
          left: 0,
          width: '600px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(255, 140, 107, 0.3), transparent)',
          transform: 'rotate(-45deg)',
        }}
      />
    </div>
  )
}

function getRandomColor(): string {
  const colors = [
    'rgba(255, 107, 107, 0.3)',
    'rgba(238, 90, 36, 0.3)',
    'rgba(255, 165, 2, 0.3)',
    'rgba(255, 215, 0, 0.3)',
    'rgba(255, 140, 107, 0.25)',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
