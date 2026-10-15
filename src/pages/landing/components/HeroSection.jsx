import { motion, useReducedMotion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import AuroraBackground from './AuroraBackground'
import loxeraLogo from '../../../assets/LoxeraFront.png'

// ─────────────────────────────────────────────────────────────────────────────
// Hook: animated counter
function useCounter(target, duration = 1.8, delay = 0.9) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    let start = null
    const timer = setTimeout(() => {
      const step = (ts) => {
        if (!start) start = ts
        const progress = Math.min((ts - start) / (duration * 1000), 1)
        const ease = 1 - Math.pow(1 - progress, 3) // cubic ease-out
        setVal(Math.round(ease * target))
        if (progress < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [target, duration, delay])
  return val
}

// ─────────────────────────────────────────────────────────────────────────────
// Orbiting particle dots around phone
function OrbitRing({ radius, count, color, duration, phase = 0 }) {
  const shouldReduce = useReducedMotion()
  if (shouldReduce) return null
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2 + phase
        const delay = (i / count) * duration
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 6px ${color}`,
              marginLeft: -3,
              marginTop: -3,
            }}
            animate={{
              x: [
                Math.cos(angle) * radius,
                Math.cos(angle + Math.PI * 2) * radius,
              ],
              y: [
                Math.sin(angle) * radius,
                Math.sin(angle + Math.PI * 2) * radius,
              ],
              opacity: [0.3, 1, 0.3],
              scale: [0.7, 1.2, 0.7],
            }}
            transition={{
              duration,
              delay: delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated waveform
function LiveWaveform({ active }) {
  const shouldReduce = useReducedMotion()
  const bars = [3, 7, 14, 9, 20, 12, 18, 8, 22, 10, 16, 6, 14, 11, 5]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 24 }}>
      {bars.map((h, i) => (
        <motion.div
          key={i}
          style={{ width: 3, background: '#F59E0B', borderRadius: 2, originY: 1 }}
          animate={
            shouldReduce
              ? { height: h }
              : {
                  height: active
                    ? [`${h}px`, `${Math.min(h * 2.2, 24)}px`, `${h * 0.4}px`, `${h}px`]
                    : [`${h * 0.3}px`, `${h * 0.5}px`, `${h * 0.3}px`],
                }
          }
          transition={{
            duration: active ? 0.5 + i * 0.03 : 1.2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
            delay: i * 0.04,
          }}
        />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Score ring with animated stroke + pulsing glow
function AnimatedScoreRing({ score = 87, size = 118, stroke = 11 }) {
  const shouldReduce = useReducedMotion()
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const countedScore = useCounter(score, 1.8, 0.9)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Outer pulsing glow */}
      <motion.div
        animate={shouldReduce ? {} : { scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        {/* Progress */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#scoreGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={shouldReduce ? {} : { strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)', textAlign: 'center',
      }}>
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.0, duration: 0.5, ease: 'backOut' }}
        >
          <div style={{
            fontFamily: "'Merriweather', serif", fontWeight: 900,
            fontSize: size * 0.24, color: 'white', lineHeight: 1,
            textShadow: '0 0 20px rgba(245,158,11,0.5)',
          }}>
            {countedScore}
          </div>
          <div style={{ fontSize: size * 0.1, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
            / 100
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Animated metric bar row
function MetricBar({ label, value, color, delay }) {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      style={{ marginBottom: '0.45rem' }}
    >
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: '0.6rem', color: 'rgba(255,255,255,0.7)', marginBottom: 3, fontWeight: 500,
      }}>
        <span>{label}</span>
        <motion.span
          style={{ color, fontWeight: 700 }}
          initial={shouldReduce ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.5 }}
        >
          {value}%
        </motion.span>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 999 }}
          initial={shouldReduce ? {} : { width: 0, opacity: 0 }}
          animate={{ width: `${value}%`, opacity: 1 }}
          transition={{ duration: 1.1, delay: delay + 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Floating achievement card
function FloatCard({ children, style, delay, direction = 'left' }) {
  const shouldReduce = useReducedMotion()
  return (
    <motion.div
      initial={shouldReduce ? {} : {
        opacity: 0,
        x: direction === 'left' ? -24 : 24,
        y: 8,
      }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        background: 'rgba(14, 24, 45, 0.75)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: '0.5rem 0.75rem',
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
        ...style,
      }}
    >
      {children}
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Full 3D-perspective phone with parallax on mouse
function CinematicPhone({ reduced }) {
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [8, -8]), { stiffness: 80, damping: 20 })
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [-6, 6]), { stiffness: 80, damping: 20 })

  const [isListening, setIsListening] = useState(false)
  const [cycle, setCycle] = useState(0)

  // Auto-cycle animation states
  useEffect(() => {
    if (reduced) return
    const t = setInterval(() => {
      setIsListening(v => !v)
      setCycle(c => c + 1)
    }, 3500)
    return () => clearInterval(t)
  }, [reduced])

  const handleMouseMove = (e) => {
    if (reduced) return
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const METRICS = [
    { label: 'Phát âm', value: 87, color: '#F59E0B' },
    { label: 'Ngữ điệu', value: 73, color: '#29A8E8' },
    { label: 'Trôi chảy', value: 91, color: '#4ADE80' },
    { label: 'Ngữ pháp', value: 78, color: '#A78BFA' },
  ]

  // Cycling achievement cards
  const ACHIEVEMENTS = [
    { icon: '🔥', text: '7 ngày liên tiếp!', color: '#F97316' },
    { icon: '🎯', text: 'Độ chính xác 91%', color: '#22C55E' },
    { icon: '⚡', text: 'Cải thiện nhanh nhất', color: '#F59E0B' },
  ]
  const currentAch = ACHIEVEMENTS[cycle % ACHIEVEMENTS.length]

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0) }}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 340,
        height: 560,
        perspective: 1200,
      }}
    >
      {/* Orbit rings */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <OrbitRing radius={160} count={5} color="rgba(245,158,11,0.7)" duration={9} phase={0} />
        <OrbitRing radius={190} count={4} color="rgba(41,168,232,0.5)" duration={13} phase={1.5} />
        <OrbitRing radius={135} count={3} color="rgba(74,222,128,0.6)" duration={7} phase={0.8} />
      </div>

      {/* 3D phone with mouse parallax */}
      <motion.div
        style={{
          rotateY: reduced ? 0 : rotateY,
          rotateX: reduced ? 0 : rotateX,
          transformStyle: 'preserve-3d',
        }}
        initial={reduced ? {} : { opacity: 0, scale: 0.85, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Float animation */}
        <motion.div
          animate={reduced ? {} : { y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'relative' }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', top: '5%', left: '5%',
            width: '90%', height: '90%',
            background: 'radial-gradient(ellipse, rgba(245,158,11,0.2) 0%, transparent 65%)',
            filter: 'blur(24px)',
            pointerEvents: 'none',
          }} />

          {/* Phone shell */}
          <div style={{
            background: 'linear-gradient(160deg, #1c2e44, #0d1724)',
            borderRadius: 40,
            padding: '10px 7px',
            width: 248,
            boxShadow: `
              0 0 0 1px rgba(255,255,255,0.09),
              0 40px 90px rgba(0,0,0,0.65),
              0 12px 36px rgba(245,158,11,0.12),
              inset 0 1px 0 rgba(255,255,255,0.07)
            `,
          }}>
            {/* Notch */}
            <div style={{
              width: 80, height: 22, background: '#0d1724',
              borderRadius: '0 0 14px 14px', margin: '0 auto 6px',
            }} />

            {/* Screen */}
            <div style={{
              background: 'linear-gradient(180deg, #0E1D2E 0%, #0A1520 100%)',
              borderRadius: 30, overflow: 'hidden', padding: '0.875rem',
            }}>
              {/* App top bar */}
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '0.625rem',
              }}>
                <img src={loxeraLogo} alt="Loxera" style={{ height: 26, objectFit: 'contain' }} />
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    background: 'rgba(245,158,11,0.15)',
                    border: '1px solid rgba(245,158,11,0.35)',
                    borderRadius: 20, padding: '2px 8px',
                    fontSize: '0.52rem', fontWeight: 700, color: '#F59E0B',
                    display: 'flex', alignItems: 'center', gap: 3,
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    style={{ width: 5, height: 5, borderRadius: '50%', background: '#F59E0B' }}
                  />
                  AI LIVE
                </motion.div>
              </div>

              {/* Score section */}
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', marginBottom: '0.625rem',
              }}>
                <p style={{
                  margin: '0 0 0.375rem', fontSize: '0.6rem',
                  color: 'rgba(255,255,255,0.45)', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  Điểm phát âm
                </p>
                <AnimatedScoreRing score={87} size={110} stroke={10} />
              </div>

              {/* Metric bars */}
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 12, padding: '0.625rem',
                border: '1px solid rgba(255,255,255,0.05)',
                marginBottom: '0.5rem',
              }}>
                {METRICS.map((m, i) => (
                  <MetricBar key={m.label} label={m.label} value={m.value}
                    color={m.color} delay={1.1 + i * 0.1} />
                ))}
              </div>

              {/* Microphone / waveform strip */}
              <motion.div
                animate={isListening ? {
                  background: ['rgba(245,158,11,0.08)', 'rgba(245,158,11,0.18)', 'rgba(245,158,11,0.08)']
                } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{
                  border: `1px solid ${isListening ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  borderRadius: 10, padding: '0.5rem 0.625rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  transition: 'border-color 0.5s',
                }}
              >
                {/* Mic button */}
                <motion.div
                  animate={isListening
                    ? { scale: [1, 1.2, 1], background: ['rgba(245,158,11,0.25)', 'rgba(245,158,11,0.5)', 'rgba(245,158,11,0.25)'] }
                    : { scale: 1 }
                  }
                  transition={{ duration: 0.8, repeat: isListening ? Infinity : 0 }}
                  style={{
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(245,158,11,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="#F59E0B" strokeWidth="2" fill="none"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="#F59E0B" strokeWidth="2"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="#F59E0B" strokeWidth="2"/>
                  </svg>
                </motion.div>

                <LiveWaveform active={isListening} />

                <motion.span
                  animate={{ opacity: isListening ? [1, 0.4, 1] : 0.4 }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{ fontSize: '0.5rem', color: '#F59E0B', whiteSpace: 'nowrap', fontWeight: 600 }}
                >
                  {isListening ? 'Đang phân tích...' : 'Nhấn để nói'}
                </motion.span>
              </motion.div>
            </div>
          </div>

          {/* ── Floating cards ─────────────────────────── */}

          {/* Progress card — top left */}
          <FloatCard delay={1.4} direction="left" style={{ top: '8%', left: -52 }}>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>
              Tuần này
            </div>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#4ADE80', display: 'flex', alignItems: 'center', gap: 4 }}>
              <motion.span
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ duration: 1.5, delay: 2, repeat: Infinity }}
              >📈</motion.span>
              +23% tiến bộ
            </div>
          </FloatCard>

          {/* Achievement card — cycling bottom right */}
          <div style={{ position: 'absolute', bottom: '24%', right: -50 }}>
            <motion.div
              key={cycle}
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: 'backOut' }}
              style={{
                background: 'rgba(14,24,45,0.75)',
                backdropFilter: 'blur(14px)',
                border: `1px solid ${currentAch.color}40`,
                borderRadius: 12,
                padding: '0.45rem 0.75rem',
                whiteSpace: 'nowrap',
                boxShadow: `0 6px 20px ${currentAch.color}20`,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: currentAch.color, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span>{currentAch.icon}</span> {currentAch.text}
              </div>
            </motion.div>
          </div>

          {/* Streak card — bottom left */}
          <FloatCard delay={2.0} direction="left" style={{ bottom: '8%', left: -44 }}>
            <div style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Chuỗi học</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F97316', display: 'flex', alignItems: 'center', gap: 4 }}>
              🔥 7 ngày liên tiếp
            </div>
          </FloatCard>
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// App Store buttons
function AppStoreBtn({ type, reduced }) {
  const apple = type === 'apple'
  return (
    <motion.a
      href="#download"
      id={`hero-${apple ? 'appstore' : 'googleplay'}`}
      whileHover={reduced ? {} : { scale: 1.04, y: -2 }}
      whileTap={reduced ? {} : { scale: 0.97 }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.625rem',
        padding: '0.75rem 1.25rem',
        background: apple ? 'white' : 'transparent',
        border: apple ? 'none' : '1.5px solid rgba(255,255,255,0.25)',
        borderRadius: 12,
        color: apple ? '#0F1F35' : 'white',
        textDecoration: 'none',
        boxShadow: apple ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {apple ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#0F1F35">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M3.18 23.76c.31.17.66.24 1.01.18l11.49-6.63-2.46-2.47-10.04 8.92zM.43 1.27C.16 1.57 0 2.02 0 2.59v18.82c0 .57.16 1.02.43 1.32l.07.07 10.54-10.54v-.25L.5 1.2l-.07.07zM20.64 10.17l-3.01-1.73-2.74 2.74 2.74 2.74 3.04-1.75c.87-.5.87-1.32-.03-2zM4.19.18L15.68 6.81l-2.46 2.46L3.18.35C3.49.08 3.89.01 4.19.18z"/>
        </svg>
      )}
      <div>
        <div style={{ fontSize: '0.58rem', opacity: 0.65, lineHeight: 1 }}>
          {apple ? 'Download on the' : 'GET IT ON'}
        </div>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2 }}>
          {apple ? 'App Store' : 'Google Play'}
        </div>
      </div>
    </motion.a>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HERO EXPORT
export default function HeroSection() {
  const shouldReduce = useReducedMotion()

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: shouldReduce ? 0 : 0.1, delayChildren: 0.2 },
    },
  }
  const itemVariants = {
    hidden: { y: shouldReduce ? 0 : 28, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
  }

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: '#0A1628',
      }}
    >
      {/* GPU Aurora canvas */}
      <AuroraBackground reduced={shouldReduce} />

      {/* Noise texture for depth */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
        backgroundSize: '200px',
        opacity: 0.4,
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto', padding: '6rem 2rem 4rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
        alignItems: 'center',
      }} className="se-hero-grid">

        {/* ── LEFT: Copy ─────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ maxWidth: 520 }}
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              background: 'rgba(245,158,11,0.12)',
              border: '1px solid rgba(245,158,11,0.25)',
              color: '#F59E0B',
              fontSize: '0.78rem', fontWeight: 700,
              padding: '0.35rem 0.875rem',
              borderRadius: 999, marginBottom: '1.25rem',
            }}>
              🦊 Loxera English — AI Pronunciation Coach
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1 variants={itemVariants} style={{
            fontFamily: "'Merriweather', Georgia, serif",
            fontWeight: 900,
            fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
            color: 'white',
            lineHeight: 1.15,
            margin: '0 0 1.25rem',
            letterSpacing: '-0.015em',
          }}>
            Speak English{' '}
            <span style={{
              color: '#F59E0B',
              textShadow: '0 0 30px rgba(245,158,11,0.4)',
            }}>
              with Confidence
            </span>
          </motion.h1>

          {/* Body */}
          <motion.p variants={itemVariants} style={{
            fontSize: '1.0625rem',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.75,
            margin: '0 0 2rem',
          }}>
            Gia sư AI chấm điểm phát âm tức thì, xây dựng lộ trình học cá nhân
            và luyện nói theo tình huống thực tế — giúp bạn tự tin giao tiếp.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants}
            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            <AppStoreBtn type="apple" reduced={shouldReduce} />
            <AppStoreBtn type="android" reduced={shouldReduce} />
          </motion.div>

          {/* Trust signals */}
          <motion.div variants={itemVariants}
            style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { icon: '⭐', text: '[Rating] · App Store', color: '#F59E0B' },
              { icon: '👥', text: '[Số học viên] đang học', color: 'rgba(255,255,255,0.7)' },
              { icon: '🤖', text: 'Real-time AI scoring', color: 'rgba(255,255,255,0.7)' },
            ].map((b, i) => (
              <span key={i} style={{
                fontSize: '0.8rem', color: b.color,
                display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                {b.icon} {b.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── RIGHT: Animated Phone ─────────────── */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <CinematicPhone reduced={shouldReduce} />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 2.8 }}
        style={{
          position: 'absolute', bottom: '1.75rem', left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          color: 'rgba(255,255,255,0.25)',
        }}
        aria-hidden="true"
      >
        <span style={{ fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Cuộn xuống
        </span>
        <motion.div
          animate={shouldReduce ? {} : { y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.div>
      </motion.div>

      <style>{`
        @media (max-width: 800px) {
          .se-hero-grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .se-hero-grid > div:last-child { margin-top: 2rem; }
        }
      `}</style>
    </section>
  )
}
