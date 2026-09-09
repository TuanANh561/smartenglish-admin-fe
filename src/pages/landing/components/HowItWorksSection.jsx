import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { UserCheck, FlaskConical, GraduationCap, ChevronRight } from 'lucide-react'

const steps = [
  {
    icon: UserCheck,
    step: '01',
    title: 'Create Your Free Account',
    description:
      'Sign up in under 60 seconds. No credit card, no commitment. Just your email to get started on your English journey.',
    color: 'from-violet-600 to-purple-700',
    shadowColor: 'shadow-violet-500/30',
    glowColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    detail: 'Free forever plan available',
    detailDot: 'bg-violet-400',
  },
  {
    icon: FlaskConical,
    step: '02',
    title: 'Take Your Placement Test',
    description:
      'Our adaptive 5-minute test determines your exact level — from beginner to advanced. No guesswork, just precision.',
    color: 'from-indigo-600 to-blue-700',
    shadowColor: 'shadow-indigo-500/30',
    glowColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    detail: 'Accurate in 5 minutes',
    detailDot: 'bg-indigo-400',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Start Your Learning Path',
    description:
      'Your personalized roadmap activates instantly. Speak, listen, read, and write — all guided by structured lessons that actually work.',
    color: 'from-amber-500 to-orange-600',
    shadowColor: 'shadow-amber-500/30',
    glowColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    detail: 'Available 24/7 on any device',
    detailDot: 'bg-amber-400',
  },
]

// SVG animated connecting line
function ConnectingLine({ isInView }) {
  return (
    <div className="hidden lg:block absolute top-11 left-0 right-0 z-0 pointer-events-none">
      <div className="max-w-3xl mx-auto px-8">
        <svg width="100%" height="6" viewBox="0 0 600 6" fill="none" preserveAspectRatio="none">
          <motion.path
            d="M 0 3 Q 150 3 300 3 Q 450 3 600 3"
            stroke="url(#pathGrad)"
            strokeWidth="2"
            strokeDasharray="10 6"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 1.8, delay: 0.3, ease: 'easeInOut' }}
          />
          <defs>
            <linearGradient id="pathGrad" x1="0" y1="0" x2="600" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#4F46E5" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  )
}

const stepVariants = {
  hidden: { y: 50, opacity: 0 },
  visible: (i) => ({
    y: 0, opacity: 1,
    transition: { duration: 0.6, delay: 0.1 + i * 0.22, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function HowItWorksSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 lg:py-32 bg-[#090914] relative overflow-hidden" ref={ref}>
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-violet-950/40 rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">
              Getting Started
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            From zero to confident in{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              3 simple steps
            </span>
          </h2>
          <p
            className="text-base text-white/45 max-w-lg mx-auto"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            No complicated setup. No overwhelming choices. Just a clear, focused path
            to English fluency.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          <ConnectingLine isInView={isInView} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.step}
                  custom={i}
                  variants={stepVariants}
                  initial="hidden"
                  animate={isInView ? 'visible' : 'hidden'}
                  className="relative flex flex-col items-center text-center group"
                >
                  {/* Icon with layered glow */}
                  <div className="relative z-10 mb-7">
                    <div className={`absolute inset-0 ${step.glowColor} rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-150`} />
                    <motion.div
                      className={`relative w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl ${step.shadowColor} group-hover:scale-110 transition-transform duration-400`}
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.4 }}
                    >
                      <Icon className="w-9 h-9 text-white" strokeWidth={1.5} />
                    </motion.div>
                    {/* Step number badge */}
                    <div className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full bg-[#090914] border-2 border-violet-500/50 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-violet-400 leading-none">{step.step}</span>
                    </div>
                  </div>

                  <h3
                    className="text-lg font-bold text-white mb-3 px-2"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm text-white/50 leading-relaxed mb-5 max-w-xs px-2"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {step.description}
                  </p>
                  <div className={`inline-flex items-center gap-1.5 border ${step.borderColor} ${step.glowColor} rounded-full px-3.5 py-1.5`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${step.detailDot}`} />
                    <span className="text-[11px] font-medium text-white/50">{step.detail}</span>
                  </div>

                  {/* Mobile arrow */}
                  {i < steps.length - 1 && (
                    <motion.div
                      animate={{ y: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                      className="lg:hidden mt-8 text-white/20"
                    >
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="text-center mt-16"
        >
          <a
            href="/dang-nhap"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition-all duration-300 shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 hover:scale-[1.03]"
          >
            Begin Your Journey — Free Forever
            <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
