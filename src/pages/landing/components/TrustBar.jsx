import { motion } from 'framer-motion'
import { ShieldCheck, Zap, Smartphone } from 'lucide-react'

const TRUST_ITEMS = [
  {
    id: 'trust-download',
    icon: <Smartphone size={20} color="#1B3A57" />,
    value: '50.000+',
    label: 'Lượt tải xuống',
    bg: '#EEF4FA',
  },
  {
    id: 'trust-rating',
    icon: <span style={{ fontSize: '1.1rem' }}>⭐</span>,
    value: '4.9 / 5.0',
    label: 'Đánh giá ứng dụng',
    bg: '#FEF3C7',
  },
  {
    id: 'trust-cert',
    icon: <ShieldCheck size={20} color="#1B3A57" />,
    value: 'Chuẩn CEFR',
    label: 'Khung năng lực Châu Âu',
    bg: '#EEF4FA',
  },
  {
    id: 'trust-ai',
    icon: <Zap size={20} color="#F59E0B" />,
    value: 'Real-time AI',
    label: 'Phản hồi phát âm tức thì',
    bg: '#FEF3C7',
  },
]

export default function TrustBar() {
  return (
    <section
      style={{
        background: '#1B3A57',
        padding: '1.25rem 0',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          flexWrap: 'wrap',
        }}
      >
        {TRUST_ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 1.5rem',
              borderRight: i < TRUST_ITEMS.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
            }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: item.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'white',
                  lineHeight: 1.2,
                }}
              >
                {item.value}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)' }}>
                {item.label}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile responsive */}
      <style>{`
        @media (max-width: 600px) {
          #trust-bar-inner { justify-content: flex-start !important; }
        }
      `}</style>
    </section>
  )
}
