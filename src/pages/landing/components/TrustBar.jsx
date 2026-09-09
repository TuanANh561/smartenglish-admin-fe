import { motion } from 'framer-motion'

// Real institution/partner logos as styled text badges (professional look)
const partners = [
  { name: 'British Council', abbr: 'BC', color: 'from-blue-600 to-blue-800', textColor: 'text-blue-300' },
  { name: 'Cambridge Assessment', abbr: 'CAE', color: 'from-sky-600 to-sky-800', textColor: 'text-sky-300' },
  { name: 'Oxford Learners', abbr: 'OUP', color: 'from-indigo-600 to-indigo-800', textColor: 'text-indigo-300' },
  { name: 'IELTS Official', abbr: 'IELTS', color: 'from-violet-600 to-violet-800', textColor: 'text-violet-300' },
  { name: 'TOEFL', abbr: 'TOEFL', color: 'from-purple-600 to-purple-800', textColor: 'text-purple-300' },
  { name: 'Google for Education', abbr: 'Google', color: 'from-red-600 to-red-800', textColor: 'text-red-300' },
  { name: 'Coursera', abbr: 'Coursera', color: 'from-blue-700 to-blue-900', textColor: 'text-blue-300' },
  { name: 'Pearson English', abbr: 'PTE', color: 'from-emerald-600 to-emerald-800', textColor: 'text-emerald-300' },
  { name: 'EdX', abbr: 'edX', color: 'from-rose-600 to-rose-800', textColor: 'text-rose-300' },
  { name: 'Duolingo for Schools', abbr: 'D4S', color: 'from-green-600 to-green-800', textColor: 'text-green-300' },
]

// Duplicate for seamless loop
const allPartners = [...partners, ...partners]

function PartnerBadge({ partner }) {
  return (
    <div className="flex items-center gap-3 shrink-0 px-5 py-3 bg-white/[0.04] border border-white/[0.07] rounded-2xl hover:bg-white/[0.07] transition-colors duration-300 cursor-default group">
      {/* Logo mark */}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${partner.color} flex items-center justify-center flex-shrink-0`}>
        <span className={`text-[9px] font-bold ${partner.textColor} leading-tight text-center`}>
          {partner.abbr.slice(0, 3)}
        </span>
      </div>
      <span
        className="text-sm font-semibold text-white/50 group-hover:text-white/75 transition-colors duration-300 whitespace-nowrap"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {partner.name}
      </span>
    </div>
  )
}

export default function TrustBar() {
  return (
    <section className="py-14 border-y border-white/[0.05] overflow-hidden bg-[#0C0C1E]">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <p
          className="text-xs font-semibold text-white/30 uppercase tracking-[0.2em]"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Trusted by learners from{' '}
          <span className="text-violet-400">50+ countries</span>
          {' '}· Partnered with leading institutions worldwide
        </p>
      </div>

      {/* Row 1 — left to right */}
      <div className="relative mb-3">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0C0C1E] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0C0C1E] to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-3"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {allPartners.map((p, i) => (
            <PartnerBadge key={`a-${i}`} partner={p} />
          ))}
        </motion.div>
      </div>

      {/* Row 2 — right to left (offset) */}
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-28 bg-gradient-to-r from-[#0C0C1E] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-[#0C0C1E] to-transparent z-10 pointer-events-none" />
        <motion.div
          className="flex gap-3"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          style={{ width: 'max-content' }}
        >
          {[...allPartners].reverse().map((p, i) => (
            <PartnerBadge key={`b-${i}`} partner={p} />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
