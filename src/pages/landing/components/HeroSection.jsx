import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useState, useEffect, useRef, useMemo } from 'react'
import { Play, ArrowRight, Star, BookOpen, Mic, Volume2, CheckCircle, TrendingUp, Globe } from 'lucide-react'

// ─── Animation Variants ───────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}
const slideUpVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const floatingVariants = {
  animate: {
    y: [0, -14, 0],
    transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
  },
}
const blobVariants = {
  animate1: {
    x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.95, 1],
    transition: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
  },
  animate2: {
    x: [0, -30, 50, 0], y: [0, 40, -10, 0], scale: [1, 0.9, 1.15, 1],
    transition: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
  },
  animate3: {
    x: [0, 20, -40, 0], y: [0, -20, 30, 0], scale: [1, 1.05, 0.9, 1],
    transition: { duration: 11, repeat: Infinity, ease: 'easeInOut' },
  },
}

// ─── Typewriter ────────────────────────────────────────────────────────
const WORDS = ['Faster Than You Think', 'With Expert Tutors', 'Anytime, Anywhere', 'Starting Today']

function TypewriterText() {
  const [wordIndex, setWordIndex] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = WORDS[wordIndex]
    let timeout
    if (!deleting && displayed.length < word.length) {
      timeout = setTimeout(() => setDisplayed(word.slice(0, displayed.length + 1)), 55)
    } else if (!deleting && displayed.length === word.length) {
      timeout = setTimeout(() => setDeleting(true), 2400)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 30)
    } else {
      setDeleting(false)
      setWordIndex((i) => (i + 1) % WORDS.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIndex])

  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-400">
      {displayed}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ duration: 0.9, repeat: Infinity }}
        className="text-violet-400 ml-0.5"
      >|</motion.span>
    </span>
  )
}

// ─── Floating Particles ────────────────────────────────────────────────
function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 8,
      delay: Math.random() * 4,
      opacity: Math.random() * 0.4 + 0.1,
    })), [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-400"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -60, 0],
            opacity: [p.opacity, p.opacity * 0.3, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ─── Lesson Card Illustration (replacing AI robot) ──────────────────────
function LessonCardIllustration() {
  const [activeScore, setActiveScore] = useState(82)
  const [recording, setRecording] = useState(false)

  // Simulate score changing
  useEffect(() => {
    const id = setInterval(() => {
      setActiveScore((s) => {
        const next = s + Math.floor(Math.random() * 5) - 1
        return Math.min(99, Math.max(70, next))
      })
    }, 2000)
    return () => clearInterval(id)
  }, [])

  // Simulate recording state
  useEffect(() => {
    const id = setInterval(() => setRecording((r) => !r), 3000)
    return () => clearInterval(id)
  }, [])

  const scoreColor = activeScore >= 90 ? 'text-emerald-400' : activeScore >= 75 ? 'text-amber-400' : 'text-rose-400'
  const scoreBar = activeScore >= 90 ? 'from-emerald-500 to-teal-500' : activeScore >= 75 ? 'from-amber-500 to-orange-500' : 'from-rose-500 to-pink-500'

  return (
    <motion.div
      variants={floatingVariants}
      animate="animate"
      className="relative w-full max-w-[420px] mx-auto select-none"
    >
      {/* Glow behind card */}
      <div className="absolute -inset-6 bg-violet-600/15 rounded-[3rem] blur-3xl" />
      <div className="absolute -inset-3 bg-indigo-500/10 rounded-[2.5rem] blur-2xl" />

      {/* Main lesson card */}
      <div className="relative bg-[#14142A]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl shadow-black/40">

        {/* Top color stripe */}
        <div className="h-1.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600" />

        {/* Course header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border border-violet-500/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white/90" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Speaking Lesson 14
              </div>
              <div className="text-[10px] text-white/40">Business English · Intermediate</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-semibold">Live</span>
          </div>
        </div>

        {/* Sentence to pronounce */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-[10px] text-white/35 font-medium uppercase tracking-wider mb-2">Repeat after the instructor</div>
          <div className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.07] rounded-2xl px-4 py-3">
            <p className="text-sm text-white/85 leading-relaxed italic" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              "I'd like to schedule a meeting to discuss the project timeline."
            </p>
          </div>
        </div>

        {/* Audio waveform (fake) */}
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 h-10">
            {Array.from({ length: 32 }, (_, i) => (
              <motion.div
                key={i}
                className={`flex-1 rounded-full ${recording ? 'bg-violet-500' : 'bg-white/15'}`}
                animate={recording ? {
                  scaleY: [0.3, Math.random() * 0.7 + 0.3, 0.3],
                } : { scaleY: 0.2 }}
                transition={{
                  duration: 0.5 + Math.random() * 0.5,
                  repeat: Infinity,
                  delay: i * 0.03,
                  ease: 'easeInOut',
                }}
                style={{ originY: 'center' }}
              />
            ))}
          </div>
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-2 px-5 pb-4">
          <button className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 hover:text-white/90 transition-colors">
            <Volume2 className="w-3.5 h-3.5" />
            Listen
          </button>
          <motion.button
            animate={recording ? {
              boxShadow: ['0 0 0 0 rgba(239,68,68,0)', '0 0 0 8px rgba(239,68,68,0.2)', '0 0 0 0 rgba(239,68,68,0)'],
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
              recording
                ? 'bg-rose-500 text-white border border-rose-400'
                : 'bg-white/[0.06] border border-white/10 text-white/60 hover:text-white/90'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {recording ? 'Recording...' : 'Speak'}
          </motion.button>

          {/* Pronunciation score */}
          <div className="ml-auto flex flex-col items-end">
            <div className={`text-lg font-bold ${scoreColor}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {activeScore}%
            </div>
            <div className="text-[9px] text-white/35">accuracy</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-4">
          <div className="flex justify-between text-[10px] text-white/30 mb-1.5">
            <span>Pronunciation Score</span>
            <span className={scoreColor}>{activeScore >= 90 ? 'Excellent!' : activeScore >= 75 ? 'Good job!' : 'Keep going!'}</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${scoreBar} rounded-full`}
              animate={{ width: `${activeScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Word chips */}
        <div className="px-5 pb-5">
          <div className="flex flex-wrap gap-1.5">
            {[
              { w: 'schedule', ok: true },
              { w: 'meeting', ok: true },
              { w: 'discuss', ok: recording },
              { w: 'timeline', ok: false },
            ].map(({ w, ok }) => (
              <div
                key={w}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all duration-500 ${
                  ok
                    ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                    : 'bg-white/[0.04] border-white/[0.08] text-white/35'
                }`}
              >
                {ok && <CheckCircle className="w-2.5 h-2.5" />}
                {w}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating stat cards */}
      <motion.div
        initial={{ opacity: 0, x: -20, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.4, duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="absolute -left-10 top-1/3 bg-[#1C1C35]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-indigo-500/20 flex items-center justify-center">
          <Globe className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white leading-tight">120+ Countries</div>
          <div className="text-[10px] text-white/40">Active learners</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.85 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 1.8, duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="absolute -right-10 bottom-1/3 bg-[#1C1C35]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 shadow-xl"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/20 flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-white leading-tight">+42% faster</div>
          <div className="text-[10px] text-white/40">vs. traditional class</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Hero Section ────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">

      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div variants={blobVariants} animate="animate1"
          className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-violet-700/20 blur-[120px]" />
        <motion.div variants={blobVariants} animate="animate2"
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <motion.div variants={blobVariants} animate="animate3"
          className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-fuchsia-600/10 blur-[100px]" />

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        {/* Floating particles */}
        <FloatingParticles />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* ── Left: Text ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Trust chips row */}
            <motion.div
              variants={slideUpVariants}
              className="flex flex-wrap items-center gap-2 justify-center lg:justify-start mb-8"
            >
              <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.10] rounded-full px-4 py-1.5 backdrop-blur-sm">
                <div className="flex -space-x-1">
                  {['🇬🇧', '🇺🇸', '🇦🇺'].map((f, i) => (
                    <span key={i} className="text-sm">{f}</span>
                  ))}
                </div>
                <span className="text-xs font-medium text-white/65">
                  Native-level fluency in weeks
                </span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-500/[0.08] border border-emerald-500/20 rounded-full px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-emerald-400">50,000+ active learners</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={slideUpVariants}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold leading-[1.08] mb-5 text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Speak English{' '}
              <span className="relative">
                <span className="relative z-10">Like a Native</span>
                {/* Underline accent */}
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
                  className="absolute -bottom-1 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full origin-left"
                />
              </span>
              {' —'}
              <span className="block mt-3 text-3xl sm:text-4xl lg:text-5xl xl:text-[52px]">
                <TypewriterText />
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={slideUpVariants}
              className="text-base sm:text-lg text-white/55 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Master English through real-life conversation practice, personalized
              learning paths, and instant pronunciation feedback — all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={slideUpVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <motion.a
                href="/dang-nhap"
                className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-white overflow-hidden group"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                {/* Animated gradient */}
                <motion.span
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600"
                  animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  style={{ backgroundSize: '200% 200%' }}
                />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-violet-500 to-indigo-500 transition-opacity duration-300" />
                {/* Glow ring */}
                <span className="absolute -inset-0.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-violet-500/40 to-indigo-500/40 blur-md" />
                <span className="relative flex items-center gap-2">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.a>

              <motion.a
                href="#demo"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold text-white/80 bg-white/[0.05] border border-white/[0.10] hover:bg-white/[0.09] hover:border-white/20 hover:text-white transition-all duration-300 group backdrop-blur-sm"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all duration-300">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
                Watch Demo
              </motion.a>
            </motion.div>

            {/* Rating strip */}
            <motion.div
              variants={slideUpVariants}
              className="mt-10 flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-3">
                {[
                  { bg: 'from-violet-500 to-purple-600', text: 'AN' },
                  { bg: 'from-indigo-500 to-blue-600', text: 'CM' },
                  { bg: 'from-fuchsia-500 to-pink-600', text: 'JY' },
                  { bg: 'from-amber-500 to-orange-600', text: 'AD' },
                  { bg: 'from-teal-500 to-emerald-600', text: 'EP' },
                ].map(({ bg, text }, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1 + i * 0.08, type: 'spring', bounce: 0.5 }}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${bg} border-2 border-[#0F0F1A] flex items-center justify-center text-[10px] font-bold text-white shadow-lg`}
                  >
                    {text}
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.5, type: 'spring' }}
                  className="w-9 h-9 rounded-full bg-white/10 border-2 border-[#0F0F1A] flex items-center justify-center text-[10px] font-bold text-white/60"
                >
                  50K+
                </motion.div>
              </div>
              <div className="text-sm text-white/55" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <div>Join <span className="text-white font-semibold">50,000+</span> satisfied learners</div>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                  <span className="text-amber-400 font-bold ml-1">4.9/5</span>
                  <span className="text-white/35 ml-1">(2,400+ reviews)</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* ── Right: Lesson Card ── */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative hidden lg:block"
          >
            <LessonCardIllustration />
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0F0F1A] to-transparent pointer-events-none" />
    </section>
  )
}
