import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import {
  Mic2, Map, MessageSquare, BarChart3,
  Brain, Globe2, Headphones, Target,
} from 'lucide-react'

const features = [
  {
    icon: Mic2,
    title: 'Speaking Practice',
    description:
      'Record yourself and get instant pronunciation scoring. Compare with native speakers and track your improvements lesson by lesson.',
    gradient: 'from-violet-500/15 to-purple-500/8',
    border: 'border-violet-500/20 hover:border-violet-500/40',
    iconBg: 'from-violet-600 to-purple-700',
    glow: 'group-hover:shadow-violet-500/20',
    tag: 'Most Used',
    tagColor: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  },
  {
    icon: Map,
    title: 'Personalized Roadmap',
    description:
      'Take a 5-minute placement test and get a tailored study plan. Lessons adapt to your pace, goals, and schedule — no two paths are the same.',
    gradient: 'from-indigo-500/15 to-blue-500/8',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
    iconBg: 'from-indigo-600 to-blue-700',
    glow: 'group-hover:shadow-indigo-500/20',
    tag: 'New',
    tagColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  },
  {
    icon: MessageSquare,
    title: 'Real-life Conversations',
    description:
      'Practice job interviews, travel scenarios, business meetings, and casual chats. Build confidence for every real-world situation.',
    gradient: 'from-amber-500/15 to-orange-500/8',
    border: 'border-amber-500/20 hover:border-amber-500/40',
    iconBg: 'from-amber-500 to-orange-600',
    glow: 'group-hover:shadow-amber-500/20',
    tag: 'Popular',
    tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  },
  {
    icon: BarChart3,
    title: 'Progress Analytics',
    description:
      'Detailed dashboards track your speaking score, vocabulary growth, grammar accuracy, and weekly streaks in beautiful visual charts.',
    gradient: 'from-emerald-500/15 to-teal-500/8',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
    iconBg: 'from-emerald-600 to-teal-700',
    glow: 'group-hover:shadow-emerald-500/20',
    tag: null,
    tagColor: '',
  },
  {
    icon: Brain,
    title: 'Smart Vocabulary',
    description:
      'Spaced repetition algorithm ensures you remember every word long-term. Learn in context with example sentences, audio, and usage notes.',
    gradient: 'from-pink-500/15 to-rose-500/8',
    border: 'border-pink-500/20 hover:border-pink-500/40',
    iconBg: 'from-pink-600 to-rose-700',
    glow: 'group-hover:shadow-pink-500/20',
    tag: null,
    tagColor: '',
  },
  {
    icon: Headphones,
    title: 'Listening Skills',
    description:
      'Train your ear with authentic audio from native speakers across different accents — American, British, Australian, and more.',
    gradient: 'from-cyan-500/15 to-sky-500/8',
    border: 'border-cyan-500/20 hover:border-cyan-500/40',
    iconBg: 'from-cyan-600 to-sky-700',
    glow: 'group-hover:shadow-cyan-500/20',
    tag: null,
    tagColor: '',
  },
]

// ── Animation Variants ────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
}
const cardVariants = {
  hidden: { y: 50, opacity: 0, scale: 0.96 },
  visible: {
    y: 0, opacity: 1, scale: 1,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

function FeatureCard({ feature }) {
  const Icon = feature.icon
  return (
    <motion.div
      variants={cardVariants}
      className={`relative group flex flex-col p-6 rounded-3xl border bg-gradient-to-br ${feature.gradient} ${feature.border} backdrop-blur-sm transition-all duration-300 hover:scale-[1.025] cursor-default overflow-hidden`}
    >
      {/* Shine sweep on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent" />
      </div>

      {/* Glow shadow */}
      <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-2xl ${feature.glow}`} />

      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <motion.div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center shadow-lg flex-shrink-0`}
          whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={1.8} />
        </motion.div>
        {feature.tag && (
          <span className={`text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 ${feature.tagColor}`}>
            {feature.tag}
          </span>
        )}
      </div>

      <h3
        className="text-base font-bold text-white mb-2.5 leading-snug"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {feature.title}
      </h3>
      <p
        className="text-sm text-white/50 leading-relaxed flex-1"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {feature.description}
      </p>

      {/* Bottom arrow hint */}
      <div className="mt-5 flex items-center gap-1 text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors duration-300">
        <span>Learn more</span>
        <motion.span
          className="inline-block"
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >→</motion.span>
      </div>
    </motion.div>
  )
}

// ── Animated stat ticker ──────────────────────────────
function StatTicker() {
  const stats = [
    { label: 'Lesson completions today', value: '12,847', icon: Target },
    { label: 'Minutes of practice', value: '843K+', icon: Mic2 },
    { label: 'Words learned this week', value: '2.1M+', icon: Brain },
    { label: 'Countries represented', value: '127', icon: Globe2 },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
      {stats.map(({ label, value, icon: Icon }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3"
        >
          <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {value}
            </div>
            <div className="text-[10px] text-white/35 leading-tight">{label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="features" className="py-24 lg:py-32 bg-[#0F0F1A] relative overflow-hidden" ref={ref}>
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">
              Platform Features
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              master English
            </span>
          </h2>
          <p
            className="text-base text-white/45 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Lexoria combines proven language learning science with an engaging platform
            to help you achieve real fluency — not just passing a test.
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5"
        >
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </motion.div>

        {/* Stat ticker */}
        <StatTicker />
      </div>
    </section>
  )
}
