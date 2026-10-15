import { BookOpen } from 'lucide-react'
import loxeraLogo from '../../../assets/LoxeraFront.png'

const FOOTER_LINKS = {
  product: {
    title: 'Sản phẩm',
    links: [
      { label: 'Tính năng', href: '#features' },
      { label: 'Bảng giá', href: '#pricing' },
      { label: 'Lộ trình học', href: '#how-it-works' },
      { label: 'Luyện IELTS', href: '#pricing' },
      { label: 'Luyện TOEIC', href: '#pricing' },
    ],
  },
  company: {
    title: 'Công ty',
    links: [
      { label: 'Giới thiệu', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Tuyển dụng', href: '#' },
      { label: 'Liên hệ', href: 'mailto:support@loxera.vn' },
    ],
  },
  support: {
    title: 'Hỗ trợ',
    links: [
      { label: 'Câu hỏi thường gặp', href: '#faq' },
      { label: 'Trung tâm trợ giúp', href: '#' },
      { label: 'Chính sách bảo mật', href: '#' },
      { label: 'Điều khoản sử dụng', href: '#' },
    ],
  },
}

const SOCIAL_LINKS = [
  {
    id: 'footer-facebook',
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    id: 'footer-youtube',
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    id: 'footer-tiktok',
    label: 'TikTok',
    href: '#',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.83a8.18 8.18 0 004.78 1.52V6.9a4.84 4.84 0 01-1.01-.21z" />
      </svg>
    ),
  },
]

export default function LandingFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      id="footer"
      style={{
        background: '#0F1F30',
        color: 'white',
        padding: '3.5rem 0 1.5rem',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Top row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
          className="se-footer-grid"
        >
          {/* Brand column */}
          <div>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <img
                src={loxeraLogo}
                alt="Loxera English"
                style={{ height: 44, width: 'auto', objectFit: 'contain' }}
              />
            </div>

            <p
              style={{
                fontSize: '0.875rem',
                color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7,
                maxWidth: 280,
                margin: '0 0 1.25rem',
              }}
            >
              Hệ thống học tiếng Anh thông minh với AI chấm điểm phát âm, lộ trình cá nhân hóa,
              giúp bạn tự tin giao tiếp tiếng Anh.
            </p>

            {/* Social links */}
            <div style={{ display: 'flex', gap: '0.625rem' }}>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.id}
                  id={s.id}
                  href={s.href}
                  aria-label={s.label}
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1B3A57'
                    e.currentTarget.style.color = '#F59E0B'
                    e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)'
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.values(FOOTER_LINKS).map((col) => (
            <div key={col.title}>
              <h4
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '1rem',
                  margin: '0 0 1rem',
                }}
              >
                {col.title}
              </h4>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                {col.links.map((link) => (
                  <li key={link.label} style={{ marginBottom: '0.625rem' }}>
                    <a
                      href={link.href}
                      style={{
                        fontSize: '0.875rem',
                        color: 'rgba(255,255,255,0.5)',
                        textDecoration: 'none',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#F59E0B')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: '1.5rem' }} />

        {/* Bottom row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            © {currentYear} SmartEnglish. Bảo lưu mọi quyền.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Cookie'].map((text) => (
              <a
                key={text}
                href="#"
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.35)',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
              >
                {text}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .se-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .se-footer-grid > div:first-child { grid-column: 1 / -1; }
        }
        @media (max-width: 480px) {
          .se-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  )
}
