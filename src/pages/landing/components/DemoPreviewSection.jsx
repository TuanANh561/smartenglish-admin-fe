import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { Volume2, CheckCircle2, Mic, BookOpen, Star, ChevronRight } from 'lucide-react'

// Mock lesson UI inside browser frame
function AppMockup() {
  const [activeTab, setActiveTab] = useState('speaking')
  const tabs = ['speaking', 'vocabulary', 'grammar']

  return (
    <div className="w-full bg-[#13132A] rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
      {/* Browser chrome bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#1A1A30] border-b border-white/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <div className="flex-1 mx-3 bg-white/5 rounded-lg px-3 py-1 text-xs text-white/30">
          app.lexoria.io/lesson/speaking
        </div>
      </div>

      {/* App content */}
      <div className="p-5">
        {/* Top nav */}
        <div className="flex gap-1 mb-5 bg-white/5 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                activeTab === tab
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                  : 'text-white/40 hover:text-white/60'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Lesson card */}
        <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/8">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-xs font-medium text-violet-400 mb-1">Lesson 12 · Business English</div>
              <div className="text-sm font-bold text-white">Job Interview Vocabulary</div>
            </div>
            <div className="flex items-center gap-1 bg-amber-500/20 rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-xs text-amber-400 font-bold">+50 XP</span>
            </div>
          </div>

          {/* Sentence to practice */}
          <div className="bg-[#0F0F1A] rounded-xl p-3 mb-3 border border-violet-500/20">
            <p className="text-sm text-white/80 italic">
              "I am highly motivated and eager to contribute to your team's success."
            </p>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 bg-violet-600/20 border border-violet-500/30 rounded-lg px-3 py-1.5 text-xs text-violet-400 font-medium hover:bg-violet-600/30 transition-colors">
              <Volume2 className="w-3.5 h-3.5" />
              Listen
            </button>
            <button className="flex items-center gap-1.5 bg-rose-500/20 border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs text-rose-400 font-medium hover:bg-rose-500/30 transition-colors">
              <Mic className="w-3.5 h-3.5" />
              Record
            </button>
            <div className="ml-auto flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>96% accuracy</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Daily Progress</span>
            <span className="text-violet-400 font-medium">7/10 lessons</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-600 to-indigo-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '70%' }}
              transition={{ delay: 0.6, duration: 1.2, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Word list */}
        <div className="space-y-2">
          {['Proficient', 'Collaborative', 'Initiative'].map((word, i) => (
            <motion.div
              key={word}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.15 }}
              className="flex items-center justify-between bg-white/3 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-medium text-white/70">{word}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-white/20" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DemoPreviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])

  // Mouse tilt effect
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = (e.clientX - cx) / rect.width
    const dy = (e.clientY - cy) / rect.height
    setTilt({ x: dy * -8, y: dx * 8 })
  }
  const handleMouseLeave = () => setTilt({ x: 0, y: 0 })

  return (
    <section id="demo" className="py-24 lg:py-32 bg-[#0F0F1A] overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Live Demo
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Experience lessons that feel{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                natural & fun
              </span>
            </h2>
            <p
              className="text-base text-white/55 leading-relaxed mb-8"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Our interactive lesson platform adapts in real-time to your responses. The AI tutor
              picks up on your strengths and weaknesses, adjusting difficulty automatically.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Real-time pronunciation scoring',
                'Contextual vocabulary learning',
                'Instant grammar correction',
                'Adaptive difficulty levels',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/70">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="/dang-nhap"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 transition-all duration-300 shadow-lg shadow-amber-500/30"
            >
              Try It Free
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Right: Mockup */}
          <motion.div
            style={{ y }}
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              animate={{
                rotateX: tilt.x,
                rotateY: tilt.y,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ transformStyle: 'preserve-3d', perspective: 1000 }}
              className="relative"
            >
              {/* Glow behind mockup */}
              <div className="absolute -inset-4 bg-violet-600/20 rounded-3xl blur-3xl" />
              <div className="relative">
                <AppMockup />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
