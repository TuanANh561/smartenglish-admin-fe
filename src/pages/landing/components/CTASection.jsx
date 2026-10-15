import { motion, useReducedMotion } from 'framer-motion'
import { Download, ArrowRight } from 'lucide-react'

function AppBadge({ type }) {
  const isApple = type === 'apple'

  return (
    <a
      href="#download"
      id={`cta-${isApple ? 'appstore' : 'googleplay'}`}
      data-cta={`final-cta-${type}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.875rem 1.5rem',
        borderRadius: 12,
        background: 'white',
        border: '1px solid rgba(255,255,255,0.3)',
        textDecoration: 'none',
        transition: 'all 0.2s',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
      }}
      aria-label={isApple ? 'Tải SmartEnglish trên App Store' : 'Tải SmartEnglish trên Google Play'}
    >
      {isApple ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1B3A57">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#1B3A57">
          <path d="M3.18 23.76c.31.17.66.24 1.01.18l11.49-6.63-2.46-2.47-10.04 8.92zM.43 1.27C.16 1.57 0 2.02 0 2.59v18.82c0 .57.16 1.02.43 1.32l.07.07 10.54-10.54v-.25L.5 1.2l-.07.07zM20.64 10.17l-3.01-1.73-2.74 2.74 2.74 2.74 3.04-1.75c.87-.5.87-1.32-.03-2zM4.19.18L15.68 6.81l-2.46 2.46L3.18.35C3.49.08 3.89.01 4.19.18z" />
        </svg>
      )}
      <div>
        <div style={{ fontSize: '0.6rem', color: '#64748B', lineHeight: 1 }}>
          {isApple ? 'Download on the' : 'GET IT ON'}
        </div>
        <div
          style={{
            fontSize: '0.9375rem',
            fontWeight: 700,
            color: '#1B3A57',
            lineHeight: 1.2,
          }}
        >
          {isApple ? 'App Store' : 'Google Play'}
        </div>
      </div>
    </a>
  )
}

export default function CTASection() {
  const shouldReduce = useReducedMotion()

  return (
    <section
      id="download"
      style={{
        background: 'linear-gradient(135deg, #0F3A5C 0%, #1B3A57 50%, #17456B 100%)',
        padding: '5rem 0',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: -100,
          right: -100,
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'rgba(245,158,11,0.08)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(29,143,225,0.08)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem', textAlign: 'center', position: 'relative' }}>
        {/* Badge */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(245,158,11,0.15)',
              color: '#F59E0B',
              fontSize: '0.8rem',
              fontWeight: 700,
              padding: '0.35rem 0.875rem',
              borderRadius: 999,
              marginBottom: '1.5rem',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            <Download size={12} />
            Tải App Miễn Phí Ngay Hôm Nay
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.6 }}
          style={{
            fontFamily: "'Merriweather', Georgia, serif",
            fontWeight: 900,
            fontSize: 'clamp(1.875rem, 4vw, 3rem)',
            color: 'white',
            margin: '0 0 1.25rem',
            lineHeight: 1.2,
          }}
        >
          Start Your English Journey{' '}
          <span style={{ color: '#F59E0B' }}>Today</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          style={{
            fontSize: '1.0625rem',
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.7,
            margin: '0 0 2.5rem',
            maxWidth: 540,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Tham gia cùng hàng nghìn học viên đang cải thiện tiếng Anh mỗi ngày.
          Tải app, làm bài test trình độ và bắt đầu lộ trình của bạn — miễn phí.
        </motion.p>

        {/* App buttons */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginBottom: '1.75rem',
          }}
        >
          <AppBadge type="apple" />
          <AppBadge type="android" />
        </motion.div>

        {/* Trust note */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.5)',
            margin: 0,
          }}
        >
          🔒 Miễn phí cho gói cơ bản · Không cần thẻ tín dụng · Huỷ bất kỳ lúc nào
        </motion.p>

        {/* Secondary link */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          style={{ marginTop: '1.25rem' }}
        >
          <a
            href="/dang-nhap"
            id="cta-web-login"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
          >
            Hoặc truy cập phiên bản web
            <ArrowRight size={13} />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
