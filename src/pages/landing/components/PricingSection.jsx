import { motion, AnimatePresence, useInView } from 'framer-motion'
import { useState, useRef } from 'react'
import { Check, Star, Zap, Crown, ArrowRight } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    icon: '🌱',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for exploring. No credit card needed.',
    features: [
      '5 AI conversations / month',
      'Basic vocabulary lessons',
      'Progress tracking',
      'Mobile app access',
      'Community forum access',
    ],
    notIncluded: ['Unlimited conversations', 'Advanced pronunciation', 'Live tutoring sessions'],
    cta: 'Get Started Free',
    ctaHref: '/dang-nhap',
    popular: false,
    gradient: 'from-slate-800 to-slate-900',
    border: 'border-white/10',
    ctaStyle: 'bg-white/10 hover:bg-white/15 text-white border border-white/20',
  },
  {
    name: 'Pro',
    icon: '⚡',
    monthlyPrice: 12,
    yearlyPrice: 8,
    description: 'Everything you need to reach fluency fast.',
    features: [
      'Unlimited AI conversations',
      'Advanced pronunciation coach',
      'Personalized roadmap',
      'All skill levels & topics',
      'Progress analytics',
      'Priority support',
      'Offline mode',
    ],
    notIncluded: ['Live tutoring sessions'],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/dang-nhap',
    popular: true,
    gradient: 'from-violet-900/60 to-indigo-900/60',
    border: 'border-violet-500/40',
    ctaStyle: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/30',
  },
  {
    name: 'Premium',
    icon: '👑',
    monthlyPrice: 29,
    yearlyPrice: 19,
    description: 'For serious learners who want the very best.',
    features: [
      'Everything in Pro',
      '4x live human tutoring / month',
      'IELTS/TOEFL prep program',
      'Resume & cover letter review',
      'Business English modules',
      'Certificate of completion',
      'Dedicated account manager',
    ],
    notIncluded: [],
    cta: 'Start 7-Day Free Trial',
    ctaHref: '/dang-nhap',
    popular: false,
    gradient: 'from-amber-900/40 to-orange-900/30',
    border: 'border-amber-500/30',
    ctaStyle: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30',
  },
]

const cardVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: (i) => ({
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, delay: i * 0.15, ease: 'easeOut' },
  }),
}

export default function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-[#0F0F1A]" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Simple,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              transparent pricing
            </span>
          </h2>
          <p className="text-base text-white/50 max-w-xl mx-auto mb-10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Start free. Upgrade when you&apos;re ready. Cancel anytime. No hidden fees ever.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-1.5">
            <button
              onClick={() => setYearly(false)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                !yearly ? 'bg-white text-[#0F0F1A] shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                yearly ? 'bg-white text-[#0F0F1A] shadow-sm' : 'text-white/60 hover:text-white'
              }`}
            >
              Yearly
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                -33%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className={`relative flex flex-col rounded-3xl border ${plan.border} bg-gradient-to-b ${plan.gradient} backdrop-blur-sm p-7 ${plan.popular ? 'ring-2 ring-violet-500/50' : ''}`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-violet-500/40">
                    <Star className="w-3 h-3 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6 pt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{plan.icon}</span>
                  <h3
                    className="text-lg font-bold text-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {plan.name}
                  </h3>
                </div>
                <p className="text-xs text-white/50" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={yearly ? 'yearly' : 'monthly'}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-block"
                      >
                        ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  {(plan.monthlyPrice > 0) && (
                    <span className="text-white/40 text-sm mb-1.5">/month</span>
                  )}
                </div>
                {yearly && plan.monthlyPrice > 0 && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-emerald-400 mt-1"
                  >
                    Billed ${plan.yearlyPrice * 12}/year (save ${(plan.monthlyPrice - plan.yearlyPrice) * 12})
                  </motion.p>
                )}
                {plan.monthlyPrice === 0 && (
                  <p className="text-xs text-white/40 mt-1">Free forever</p>
                )}
              </div>

              {/* CTA */}
              <a
                href={plan.ctaHref}
                className={`flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl text-sm font-semibold transition-all duration-300 mb-7 ${plan.ctaStyle}`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>

              {/* Features */}
              <div className="space-y-3 flex-1">
                {plan.features.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <span className="text-sm text-white/65" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {feat}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Money back */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-white/35 mt-10"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          🔒 30-day money-back guarantee · No questions asked · Cancel anytime
        </motion.p>
      </div>
    </section>
  )
}
