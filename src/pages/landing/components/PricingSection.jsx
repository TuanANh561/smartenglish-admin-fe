import { motion, useReducedMotion } from 'framer-motion'
import { Check, Zap, Download, Phone } from 'lucide-react'

const PLANS = [
  {
    id: 'plan-free',
    name: 'Miễn Phí',
    nameEN: 'Free',
    badge: null,
    price: '0đ',
    period: 'mãi mãi',
    desc: 'Bắt đầu học với những tính năng cơ bản',
    features: [
      '5 bài học miễn phí mỗi ngày',
      'Kiểm tra trình độ (1 lần)',
      'Phát âm AI cơ bản',
      'Theo dõi tiến trình đơn giản',
    ],
    cta: 'Tải App Miễn Phí',
    ctaId: 'plan-free-cta',
    ctaHref: '#download',
    highlight: false,
  },
  {
    id: 'plan-pro',
    name: 'Pro',
    nameEN: 'Pro',
    badge: 'Phổ biến nhất',
    price: '[GIÁ]',
    period: '/ tháng',
    desc: 'Học không giới hạn với AI cá nhân hóa',
    features: [
      'Học không giới hạn bài học',
      'AI Pronunciation Scoring đầy đủ',
      'Lộ trình cá nhân hoá 100%',
      'Luyện nói theo tình huống thực tế',
      'Phân tích tiến trình chi tiết',
      'Luyện thi IELTS / TOEIC',
      'Ôn tập thông minh (spaced repetition)',
    ],
    cta: 'Bắt Đầu Dùng Thử',
    ctaId: 'plan-pro-cta',
    ctaHref: '#download',
    highlight: true,
  },
  {
    id: 'plan-business',
    name: 'Doanh Nghiệp',
    nameEN: 'Business',
    badge: null,
    price: 'Liên hệ',
    period: '',
    desc: 'Đào tạo tiếng Anh cho đội nhóm',
    features: [
      'Tất cả tính năng Pro',
      'Quản lý nhóm học viên',
      'Dashboard quản trị viên',
      'Báo cáo tiến trình nhóm',
      'Business English chuyên biệt',
      'Hỗ trợ ưu tiên 24/7',
    ],
    cta: 'Liên Hệ Ngay',
    ctaId: 'plan-business-cta',
    ctaHref: '#footer',
    highlight: false,
  },
]

function PricingCard({ plan, index }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: shouldReduce ? 0 : index * 0.1, duration: 0.55 }}
      style={{
        position: 'relative',
        borderRadius: 18,
        padding: plan.highlight ? '2rem 1.75rem' : '1.75rem',
        border: plan.highlight ? 'none' : '1px solid #E2EAF2',
        background: plan.highlight ? '#1B3A57' : 'white',
        color: plan.highlight ? 'white' : '#334155',
        boxShadow: plan.highlight
          ? '0 16px 48px rgba(27,58,87,0.3), 0 4px 12px rgba(27,58,87,0.15)'
          : '0 2px 8px rgba(15,58,92,0.06)',
        transform: plan.highlight ? 'scale(1.04)' : 'scale(1)',
        zIndex: plan.highlight ? 1 : 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Badge */}
      {plan.badge && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#F59E0B',
            color: '#1B3A57',
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '0.3rem 1rem',
            borderRadius: 999,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
          }}
        >
          ⭐ {plan.badge}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {plan.highlight && <Zap size={16} color="#F59E0B" fill="#F59E0B" />}
          <span
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontWeight: 700,
              fontSize: '1.0625rem',
              color: plan.highlight ? 'white' : '#1B3A57',
            }}
          >
            {plan.name}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontFamily: "'Merriweather', serif",
              fontWeight: 900,
              fontSize: plan.price === 'Liên hệ' ? '1.5rem' : '2rem',
              color: plan.highlight ? '#F59E0B' : '#1B3A57',
            }}
          >
            {plan.price}
          </span>
          {plan.period && (
            <span style={{ fontSize: '0.875rem', color: plan.highlight ? 'rgba(255,255,255,0.65)' : '#64748B' }}>
              {plan.period}
            </span>
          )}
        </div>
        <p
          style={{
            fontSize: '0.875rem',
            color: plan.highlight ? 'rgba(255,255,255,0.7)' : '#64748B',
            margin: 0,
          }}
        >
          {plan.desc}
        </p>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: plan.highlight ? 'rgba(255,255,255,0.12)' : '#E2EAF2',
          margin: '0 0 1.25rem',
        }}
      />

      {/* Features */}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', flex: 1 }}>
        {plan.features.map((f, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              marginBottom: '0.625rem',
              fontSize: '0.875rem',
              color: plan.highlight ? 'rgba(255,255,255,0.9)' : '#334155',
            }}
          >
            <Check
              size={15}
              color={plan.highlight ? '#F59E0B' : '#1B3A57'}
              style={{ flexShrink: 0, marginTop: 2 }}
              strokeWidth={2.5}
            />
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={plan.ctaHref}
        id={plan.ctaId}
        data-cta={`pricing-${plan.id}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginTop: '1.5rem',
          padding: '0.875rem',
          borderRadius: 10,
          fontWeight: 700,
          fontSize: '0.9375rem',
          textDecoration: 'none',
          transition: 'all 0.2s',
          background: plan.highlight
            ? '#F59E0B'
            : 'transparent',
          color: plan.highlight ? '#1B3A57' : '#1B3A57',
          border: plan.highlight ? 'none' : '1.5px solid #1B3A57',
          boxShadow: plan.highlight ? '0 4px 14px rgba(245,158,11,0.4)' : 'none',
        }}
        onMouseEnter={(e) => {
          if (plan.highlight) {
            e.currentTarget.style.background = '#D97706'
          } else {
            e.currentTarget.style.background = '#1B3A57'
            e.currentTarget.style.color = 'white'
          }
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={(e) => {
          if (plan.highlight) {
            e.currentTarget.style.background = '#F59E0B'
          } else {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = '#1B3A57'
          }
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {plan.id === 'plan-free' ? <Download size={16} /> : plan.id === 'plan-business' ? <Phone size={16} /> : <Zap size={16} />}
        {plan.cta}
      </a>
    </motion.div>
  )
}

export default function PricingSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section id="pricing" style={{ background: '#F0F4F8', padding: '5rem 0' }}>
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
            }}
          >
            Simple, Transparent{' '}
            <span style={{ color: '#F59E0B' }}>Pricing</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: 440, margin: '0 auto' }}>
            Bắt đầu miễn phí, nâng cấp khi bạn sẵn sàng. Không phí ẩn, huỷ bất cứ lúc nào.
          </p>

          {/* Price guarantee */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginTop: '1rem',
              background: '#EEF4FA',
              border: '1px solid #D6E8F5',
              borderRadius: 8,
              padding: '0.4rem 0.875rem',
              fontSize: '0.8rem',
              color: '#1B3A57',
              fontWeight: 600,
            }}
          >
            🛡️ Cam kết hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng
          </div>
        </motion.div>

        {/* Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            alignItems: 'center',
          }}
          className="se-pricing-grid"
        >
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* Trust note */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: '#94A3B8',
            marginTop: '2rem',
          }}
        >
          🔒 Thanh toán bảo mật · Huỷ bất kỳ lúc nào · Không charge tự động khi dùng thử
        </motion.p>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .se-pricing-grid { grid-template-columns: 1fr !important; max-width: 400px; margin: 0 auto; }
        }
      `}</style>
    </section>
  )
}
