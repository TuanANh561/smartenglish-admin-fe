import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, Send, CheckCircle2, BookOpen, Mic2, TrendingUp } from 'lucide-react'

const miniStats = [
  { icon: BookOpen, val: '500+', label: 'Lesson topics' },
  { icon: Mic2, val: '12K+', label: 'Speaking exercises' },
  { icon: TrendingUp, val: '3 weeks', label: 'Avg. to see results' },
]

export default function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 lg:py-36 relative overflow-hidden" ref={ref}>

      {/* Animated gradient + grid background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse at 20% 50%, rgba(109,40,217,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.25) 0%, transparent 55%), #0F0F1A',
              'radial-gradient(ellipse at 70% 30%, rgba(139,92,246,0.40) 0%, transparent 55%), radial-gradient(ellipse at 20% 70%, rgba(79,70,229,0.20) 0%, transparent 55%), #0F0F1A',
              'radial-gradient(ellipse at 40% 60%, rgba(109,40,217,0.30) 0%, transparent 55%), radial-gradient(ellipse at 80% 30%, rgba(99,102,241,0.25) 0%, transparent 55%), #0F0F1A',
              'radial-gradient(ellipse at 20% 50%, rgba(109,40,217,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 50%, rgba(79,70,229,0.25) 0%, transparent 55%), #0F0F1A',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Horizontal scan lines */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)',
          }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Top mini stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          {miniStats.map(({ icon: Icon, val, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 bg-white/[0.06] border border-white/[0.09] rounded-2xl px-4 py-2.5 backdrop-blur-sm"
            >
              <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-500/25 flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white leading-tight">{val}</div>
                <div className="text-[10px] text-white/40">{label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 25 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-[1.1] tracking-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Your English Journey{' '}
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              Starts Today
            </span>
            {/* Underline */}
            <motion.span
              initial={{ scaleX: 0 }}
              animate={isInView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
              className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full origin-left"
            />
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Join 50,000+ learners who are already building real English skills.
          No excuses, no limits — just consistent progress, starting right now.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <motion.a
            href="/dang-nhap"
            className="relative inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-base font-bold text-white overflow-hidden group"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            />
            <span className="absolute -inset-1 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-r from-violet-500/30 to-indigo-500/30 blur-lg" />
            <span className="relative flex items-center gap-2">
              Start Learning for Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </motion.a>

          <motion.a
            href="#pricing"
            className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-2xl text-base font-semibold text-white/75 bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.09] hover:text-white hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            <Send className="w-4 h-4" />
            View Plans
          </motion.a>
        </motion.div>

        {/* Trust chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {[
            'Free plan available',
            'No credit card required',
            'Cancel anytime',
            '30-day money-back guarantee',
          ].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs text-white/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70 shrink-0" />
              {item}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
