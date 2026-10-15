import { motion, useReducedMotion } from 'framer-motion'
import { ClipboardList, Compass, TrendingUp } from 'lucide-react'

const STEPS = [
  {
    id: 'step-test',
    number: '01',
    icon: ClipboardList,
    title: 'Take a Level Test',
    titleVI: 'Kiểm tra trình độ',
    desc: 'Làm bài kiểm tra 5 phút để AI đánh giá chính xác trình độ hiện tại và xác định điểm yếu cần cải thiện.',
    accent: '#F59E0B',
    accentBg: '#FEF3C7',
  },
  {
    id: 'step-plan',
    number: '02',
    icon: Compass,
    title: 'Get Your Personal Plan',
    titleVI: 'Nhận lộ trình cá nhân',
    desc: 'AI tạo lộ trình học hoàn toàn riêng biệt: bài học, bài tập, thời lượng tối ưu theo mục tiêu IELTS/giao tiếp/công việc.',
    accent: '#1B3A57',
    accentBg: '#EEF4FA',
  },
  {
    id: 'step-practice',
    number: '03',
    icon: TrendingUp,
    title: 'Practice & Track Progress',
    titleVI: 'Luyện tập và theo dõi tiến độ',
    desc: 'Luyện nói mỗi ngày, nhận phản hồi AI tức thì và xem điểm cải thiện qua biểu đồ trực quan hàng tuần.',
    accent: '#F59E0B',
    accentBg: '#FEF3C7',
  },
]

function StepCard({ step, index }) {
  const shouldReduce = useReducedMotion()
  const Icon = step.icon

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: shouldReduce ? 0 : index * 0.15, duration: 0.6 }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Step number bubble */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: step.accent,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: `0 4px 14px ${step.accent}40`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontFamily: "'Merriweather', serif",
            fontWeight: 900,
            fontSize: '1.125rem',
            color: step.accent === '#1B3A57' ? 'white' : '#1B3A57',
          }}
        >
          {step.number}
        </span>
      </div>

      {/* Icon card */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '1.5rem',
          marginBottom: '1.25rem',
          width: '100%',
          border: '1px solid #E2EAF2',
          boxShadow: '0 2px 8px rgba(15,58,92,0.07)',
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 12,
            background: step.accentBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 0.875rem',
          }}
        >
          <Icon size={24} color={step.accent} strokeWidth={1.75} />
        </div>

        <h3
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 700,
            fontSize: '1.0625rem',
            color: '#1B3A57',
            margin: '0 0 0.25rem',
            lineHeight: 1.3,
          }}
        >
          {step.title}
        </h3>
        <p
          style={{
            fontSize: '0.8rem',
            color: step.accent,
            fontWeight: 600,
            margin: '0 0 0.75rem',
          }}
        >
          {step.titleVI}
        </p>
        <p
          style={{
            fontSize: '0.875rem',
            color: '#64748B',
            lineHeight: 1.65,
            margin: 0,
          }}
        >
          {step.desc}
        </p>
      </div>
    </motion.div>
  )
}

export default function HowItWorksSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="how-it-works"
      style={{ background: '#F0F4F8', padding: '5rem 0' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3.5rem' }}
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
            Start Speaking in{' '}
            <span style={{ color: '#F59E0B' }}>3 Simple Steps</span>
          </h2>
          <p
            style={{
              fontSize: '1rem',
              color: '#64748B',
              maxWidth: 480,
              margin: '0 auto',
              lineHeight: 1.7,
            }}
          >
            Chỉ cần 3 bước để bắt đầu hành trình học tiếng Anh có AI đồng hành.
          </p>
        </motion.div>

        {/* Steps */}
        <div
          style={{
            display: 'flex',
            gap: '2rem',
            alignItems: 'flex-start',
            position: 'relative',
          }}
          className="se-steps-row"
        >
          {STEPS.map((step, i) => (
            <div key={step.id} style={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 0 }}>
              <StepCard step={step} index={i} />
              {/* Connector */}
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  style={{
                    alignSelf: 'center',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingBottom: '4rem',
                    marginTop: '-2rem',
                  }}
                  className="se-step-connector"
                >
                  <svg width="48" height="16" viewBox="0 0 48 16" fill="none">
                    <path
                      d="M0 8 Q24 2 48 8"
                      stroke="#CBD5E1"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                      strokeLinecap="round"
                    />
                    <path d="M40 4 L48 8 L40 12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA under steps */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ textAlign: 'center', marginTop: '2.5rem' }}
        >
          <a
            href="#download"
            id="how-cta-download"
            data-cta="how-it-works-download"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#F59E0B',
              color: '#1B3A57',
              fontWeight: 700,
              fontSize: '1rem',
              padding: '0.875rem 2rem',
              borderRadius: 10,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D97706'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F59E0B'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Bắt đầu ngay — Tải App Miễn Phí
          </a>
          <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#94A3B8' }}>
            Không cần đăng ký tài khoản · Miễn phí trọn đời cho gói cơ bản
          </p>
        </motion.div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 768px) {
          .se-steps-row { flex-direction: column !important; }
          .se-step-connector { display: none !important; }
        }
      `}</style>
    </section>
  )
}
