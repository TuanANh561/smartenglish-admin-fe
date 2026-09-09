import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Users, Star, Globe, ThumbsUp, Award, Zap } from 'lucide-react'

const stats = [
  {
    value: 50000,
    suffix: '+',
    label: 'Active Learners',
    sublabel: 'from 120 countries',
    icon: Users,
    color: 'text-violet-400',
    iconBg: 'from-violet-600/30 to-purple-600/20',
    border: 'border-violet-500/20',
    barColor: 'from-violet-600 to-purple-500',
    barPct: 92,
  },
  {
    value: 4.9,
    suffix: '/5',
    label: 'Average Rating',
    sublabel: '2,400+ verified reviews',
    icon: Star,
    color: 'text-amber-400',
    iconBg: 'from-amber-500/30 to-orange-500/20',
    border: 'border-amber-500/20',
    barColor: 'from-amber-500 to-orange-400',
    barPct: 98,
    decimals: 1,
  },
  {
    value: 120,
    suffix: '+',
    label: 'Countries',
    sublabel: 'global community',
    icon: Globe,
    color: 'text-emerald-400',
    iconBg: 'from-emerald-600/30 to-teal-600/20',
    border: 'border-emerald-500/20',
    barColor: 'from-emerald-500 to-teal-400',
    barPct: 78,
  },
  {
    value: 98,
    suffix: '%',
    label: 'Satisfaction Rate',
    sublabel: 'would recommend us',
    icon: ThumbsUp,
    color: 'text-rose-400',
    iconBg: 'from-rose-600/30 to-pink-600/20',
    border: 'border-rose-500/20',
    barColor: 'from-rose-500 to-pink-400',
    barPct: 98,
  },
]

const achievements = [
  { icon: Award, label: '#1 English App 2025', sub: 'ProductHunt Golden Kitty' },
  { icon: Zap, label: '3M+ lessons completed', sub: 'This month alone' },
  { icon: Star, label: 'Editor\'s Choice', sub: 'AppStore & Google Play' },
]

function CountUp({ target, suffix, decimals = 0, active }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const duration = 1800
    const step = 14
    const increment = target / (duration / step)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(parseFloat(start.toFixed(decimals)))
    }, step)
    return () => clearInterval(timer)
  }, [active, target, decimals])

  return <>{decimals > 0 ? count.toFixed(decimals) : count.toLocaleString()}{suffix}</>
}

export default function StatsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section className="py-24 bg-[#090914] relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[400px] bg-violet-900/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[300px] bg-indigo-900/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Numbers that{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
              speak for themselves
            </span>
          </h2>
          <p className="text-sm text-white/40" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Real metrics from our live platform
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative group bg-white/[0.03] border ${stat.border} rounded-3xl p-6 hover:bg-white/[0.05] transition-all duration-300 overflow-hidden`}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-400 bg-gradient-to-br from-white/[0.03] to-transparent" />

                {/* Icon */}
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${stat.iconBg} border ${stat.border} flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} strokeWidth={1.8} />
                </div>

                {/* Value */}
                <div
                  className={`text-4xl font-bold ${stat.color} mb-1`}
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  <CountUp target={stat.value} suffix={stat.suffix} decimals={stat.decimals} active={isInView} />
                </div>
                <div className="text-sm font-semibold text-white/80 mb-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {stat.label}
                </div>
                <div className="text-xs text-white/35 mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {stat.sublabel}
                </div>

                {/* Progress bar */}
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${stat.barColor} rounded-full`}
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${stat.barPct}%` } : {}}
                    transition={{ duration: 1.4, delay: 0.4 + i * 0.1, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Achievement chips */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {achievements.map(({ icon: Icon, label, sub }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3"
            >
              <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">{label}</div>
                <div className="text-[10px] text-white/40">{sub}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
