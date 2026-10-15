import { motion, useReducedMotion } from 'framer-motion'
import { Mic, BarChart2, Volume2 } from 'lucide-react'

// ── Mini pronunciation demo ──────────────────────────────────────────────
const SAMPLE_WORDS = [
  { word: 'Pronunciation', score: 92, color: '#22C55E' },
  { word: 'Comfortable', score: 74, color: '#F59E0B' },
  { word: 'Necessary', score: 86, color: '#22C55E' },
  { word: 'Particularly', score: 61, color: '#EF4444' },
  { word: 'Sophisticated', score: 88, color: '#22C55E' },
]

function ScoreBar({ label, score, color, delay }) {
  const shouldReduce = useReducedMotion()
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{label}</span>
        <span style={{ fontSize: '0.875rem', fontWeight: 700, color }}>{score}%</span>
      </div>
      <div style={{ background: '#E2EAF2', borderRadius: 999, height: 7, overflow: 'hidden' }}>
        <motion.div
          initial={shouldReduce ? {} : { width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ delay, duration: 1, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 999 }}
        />
      </div>
    </div>
  )
}

export default function DemoPreviewSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section style={{ background: '#FAFBFC', padding: '5rem 0' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}
          className="se-demo-grid"
        >
          {/* Left — copy */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <div
              style={{
                display: 'inline-block',
                width: '2.5rem',
                height: 3,
                background: '#F59E0B',
                borderRadius: 999,
                marginBottom: '1rem',
              }}
            />
            <h2
              style={{
                fontFamily: "'Merriweather', Georgia, serif",
                fontWeight: 900,
                fontSize: 'clamp(1.625rem, 3vw, 2.25rem)',
                color: '#1B3A57',
                margin: '0 0 1rem',
                lineHeight: 1.25,
              }}
            >
              See Exactly Where{' '}
              <span style={{ color: '#F59E0B' }}>You Go Wrong</span>
            </h2>
            <p
              style={{ fontSize: '1rem', color: '#64748B', lineHeight: 1.75, margin: '0 0 1.5rem' }}
            >
              AI của SmartEnglish chấm điểm từng từ, chỉ ra chính xác âm nào sai và hướng dẫn
              sửa. Không phải đoán mò — mà biết chính xác.
            </p>

            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {[
                { icon: Mic, text: 'Phân tích từng âm tiết một' },
                { icon: BarChart2, text: 'Điểm số rõ ràng: Phát âm, Ngữ điệu, Độ trôi chảy' },
                { icon: Volume2, text: 'So sánh với giọng đọc chuẩn bản ngữ' },
              ].map(({ icon: Icon, text }, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.875rem' }}>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: '#EEF4FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={16} color="#1B3A57" />
                  </div>
                  <span style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.5, paddingTop: 6 }}>
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — mock demo panel */}
          <motion.div
            initial={shouldReduce ? {} : { opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
          >
            <div
              style={{
                background: 'white',
                borderRadius: 18,
                padding: '1.75rem',
                border: '1px solid #E2EAF2',
                boxShadow: '0 8px 30px rgba(15,58,92,0.1)',
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Kết quả phân tích
                  </p>
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1B3A57' }}>
                    "I particularly enjoy learning English."
                  </p>
                </div>
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: '#EEF4FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mic size={20} color="#1B3A57" />
                </div>
              </div>

              {/* Word scores */}
              {SAMPLE_WORDS.map((w, i) => (
                <ScoreBar
                  key={w.word}
                  label={w.word}
                  score={w.score}
                  color={w.color}
                  delay={0.3 + i * 0.1}
                />
              ))}

              {/* AI tip */}
              <div
                style={{
                  marginTop: '1rem',
                  padding: '0.875rem',
                  background: '#FEF3C7',
                  borderRadius: 10,
                  border: '1px solid rgba(245,158,11,0.2)',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400E', lineHeight: 1.6 }}>
                  💡 <strong>Gợi ý AI:</strong> Từ "particularly" — âm /t/ đôi thường bị nuốt.
                  Thử phát âm từng âm tiết: par-tic-u-lar-ly.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .se-demo-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
        }
      `}</style>
    </section>
  )
}
