import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Nguyen Minh Anh',
    country: '🇻🇳 Vietnam',
    role: 'Software Engineer',
    avatar: '👩🏻',
    rating: 5,
    text: "Lexoria completely transformed how I approach English. I went from struggling to communicate in meetings to confidently presenting to international clients — all in just 3 months!",
    highlight: '3 months to confident',
    score: 'IELTS 7.5 achieved',
  },
  {
    name: 'Carlos Mendoza',
    country: '🇲🇽 Mexico',
    role: 'Marketing Manager',
    avatar: '👨🏽',
    rating: 5,
    text: "The AI speaking partner is incredible. It's like having a native English friend available 24/7. My pronunciation improved dramatically and my coworkers noticed immediately!",
    highlight: 'Dramatic pronunciation improvement',
    score: 'TOEFL 105 scored',
  },
  {
    name: 'Park Ji-Yeon',
    country: '🇰🇷 South Korea',
    role: 'Graduate Student',
    avatar: '👩🏻',
    rating: 5,
    text: "I was preparing for grad school in the US and was terrified of speaking English. Lexoria's conversation practice gave me the confidence I needed. Got into my dream program!",
    highlight: 'Dream program accepted',
    score: 'Duolingo 130+ achieved',
  },
  {
    name: 'Amara Diallo',
    country: '🇸🇳 Senegal',
    role: 'Entrepreneur',
    avatar: '🧑🏿',
    rating: 5,
    text: "Running an international business requires excellent English. Lexoria's business English modules are practical, real-world focused, and incredibly effective. My revenue grew 40%!",
    highlight: '40% business growth',
    score: '6 months of learning',
  },
  {
    name: 'Elena Petrova',
    country: '🇷🇺 Russia',
    role: 'Nurse',
    avatar: '👩🏼',
    rating: 5,
    text: "As a healthcare professional, precision in English is critical. Lexoria taught me medical vocabulary in context through real conversations. I passed my nursing board exam on the first try!",
    highlight: 'Passed boards first try',
    score: 'Medical English mastered',
  },
]

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0, transition: { duration: 0.3 } }),
}

export default function TestimonialsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = (delta) => {
    setDirection(delta)
    setCurrent((c) => (c + delta + testimonials.length) % testimonials.length)
  }

  // Auto-slide
  useEffect(() => {
    const id = setInterval(() => go(1), 5000)
    return () => clearInterval(id)
  }, [])

  const t = testimonials[current]

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-[#0A0A16] overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
              Success Stories
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Learners who{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
              transformed their English
            </span>
          </h2>
          <p className="text-base text-white/50 max-w-xl mx-auto" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Real stories from real learners. No paid actors, no fake reviews — just genuine results.
          </p>
        </motion.div>

        {/* Testimonial carousel */}
        <div className="max-w-3xl mx-auto relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="bg-white/5 border border-white/10 rounded-3xl p-8 lg:p-10 relative"
            >
              {/* Quote icon */}
              <div className="absolute top-8 right-8 text-violet-500/20">
                <Quote className="w-12 h-12 fill-current" />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Main quote */}
              <blockquote
                className="text-lg text-white/85 leading-relaxed mb-8 relative z-10"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                "{t.text}"
              </blockquote>

              {/* Achievement chips */}
              <div className="flex gap-2 mb-8 flex-wrap">
                <div className="inline-flex items-center gap-1.5 bg-violet-500/15 border border-violet-500/25 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-xs text-violet-300 font-medium">{t.highlight}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full px-3 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 font-medium">{t.score}</span>
                </div>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <motion.div
                  key={`avatar-${current}`}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 border-2 border-violet-500/30 flex items-center justify-center text-2xl shadow-lg"
                >
                  {t.avatar}
                </motion.div>
                <div>
                  <div className="font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    {t.name}
                  </div>
                  <div className="text-sm text-white/50">{t.role}</div>
                  <div className="text-sm text-white/40">{t.country}</div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => go(-1)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Previous"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === current ? 'w-8 bg-violet-500' : 'w-2 bg-white/20'
                  }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => go(1)}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
