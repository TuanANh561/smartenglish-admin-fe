import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { Mic, Map, MessageCircle, BarChart2, BookOpen, Smartphone } from 'lucide-react'

const FEATURES = [
  {
    id: 'feat-pronunciation',
    icon: Mic,
    color: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Instant AI Pronunciation Scoring',
    desc: 'Chấm điểm phát âm từng âm tiết tức thì, chỉ ra lỗi sai và hướng dẫn sửa chi tiết.',
  },
  {
    id: 'feat-path',
    icon: Map,
    color: '#1B3A57',
    iconBg: '#EEF4FA',
    title: 'Personalized Learning Path',
    desc: 'Lộ trình học được AI thiết kế riêng theo trình độ, mục tiêu và lịch trình của bạn.',
  },
  {
    id: 'feat-conversation',
    icon: MessageCircle,
    color: '#F59E0B',
    iconBg: '#FEF3C7',
    title: 'Real Conversation Practice',
    desc: 'Luyện nói theo tình huống thực tế: phỏng vấn, họp nhóm, thuyết trình, giao tiếp hàng ngày.',
  },
  {
    id: 'feat-analytics',
    icon: BarChart2,
    color: '#1B3A57',
    iconBg: '#EEF4FA',
    title: 'Detailed Progress Analytics',
    desc: 'Biểu đồ tiến trình trực quan theo tuần/tháng, so sánh điểm trước và sau, nhận diện điểm yếu.',
  },
  {
    id: 'feat-exercises',
    icon: BookOpen,
    color: '#F59E0B',
    iconBg: '#FEF3C7',
    title: '10,000+ Diverse Exercises',
    desc: 'Ngân hàng bài tập phong phú: IELTS, TOEIC, Business English, giao tiếp hàng ngày.',
  },
  {
    id: 'feat-anywhere',
    icon: Smartphone,
    color: '#1B3A57',
    iconBg: '#EEF4FA',
    title: 'Learn Anywhere, Anytime',
    desc: 'Ứng dụng di động tối ưu cho iOS và Android. Học offline, đồng bộ tiến trình tự động.',
  },
]

function FeatureCard({ feature, index }) {
  const shouldReduce = useReducedMotion()
  const Icon = feature.icon

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: shouldReduce ? 0 : (index % 3) * 0.1, duration: 0.55 }}
      style={{
        background: 'white',
        border: '1px solid #E2EAF2',
        borderRadius: 16,
        padding: '1.75rem',
        boxShadow: '0 2px 6px rgba(15,58,92,0.05)',
        transition: 'box-shadow 0.25s ease, transform 0.25s ease',
        cursor: 'default',
      }}
      whileHover={shouldReduce ? {} : { y: -4, boxShadow: '0 8px 24px rgba(15,58,92,0.12)' }}
    >
      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: feature.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={22} color={feature.color} strokeWidth={1.75} />
      </div>

      {/* Title */}
      <h3
        style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 700,
          fontSize: '1rem',
          color: '#1B3A57',
          margin: '0 0 0.5rem',
          lineHeight: 1.35,
        }}
      >
        {feature.title}
      </h3>

      {/* Description */}
      <p
        style={{
          fontSize: '0.875rem',
          color: '#64748B',
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        {feature.desc}
      </p>
    </motion.div>
  )
}

export default function FeaturesSection() {
  const ref = useRef(null)

  return (
    <section
      id="features"
      ref={ref}
      style={{ background: '#FAFBFC', padding: '5rem 0' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
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
                fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
                color: '#1B3A57',
                margin: '0 0 1rem',
                lineHeight: 1.2,
              }}
            >
              Everything You Need to{' '}
              <span style={{ color: '#F59E0B' }}>Speak Fluently</span>
            </h2>
            <p
              style={{
                fontSize: '1.0625rem',
                color: '#64748B',
                maxWidth: 540,
                margin: '0 auto',
                lineHeight: 1.7,
              }}
            >
              Tất cả công cụ bạn cần để nâng cao tiếng Anh — được AI cá nhân hóa
              cho chính xác mục tiêu của bạn.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}
          className="se-features-grid"
        >
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.id} feature={feature} index={i} />
          ))}
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .se-features-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .se-features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
