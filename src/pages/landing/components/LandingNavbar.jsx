import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, X, Download } from 'lucide-react'
import loxeraLogo from '../../../assets/LoxeraFront.png'

const NAV_LINKS = [
  { label: 'Tính năng', href: '#features' },
  { label: 'Cách hoạt động', href: '#how-it-works' },
  { label: 'Kết quả', href: '#proof' },
  { label: 'Bảng giá', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close mobile menu on route change / outside click
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
        background: scrolled
          ? 'rgba(10, 22, 40, 0.92)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}
      >
        {/* ── Logo ──────────────────────────────── */}
        <a
          href="/"
          id="landing-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            textDecoration: 'none',
            flexShrink: 0,
          }}
          aria-label="SmartEnglish — Trang chủ"
        >
          {/* Loxera Logo */}
          <img
            src={loxeraLogo}
            alt="Loxera English"
            style={{ height: 56, width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </a>

        {/* ── Desktop Nav ───────────────────────── */}
        <nav
          aria-label="Menu chính"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
          }}
          className="se-desktop-nav"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              id={`nav-${link.href.replace('#', '')}`}
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.85)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                position: 'relative',
                paddingBottom: 2,
                letterSpacing: '0.01em',
              }}
              onMouseEnter={(e) => (e.target.style.color = '#F59E0B')}
              onMouseLeave={(e) => (e.target.style.color = 'rgba(255,255,255,0.85)')}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ── Desktop CTA ───────────────────────── */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          className="se-desktop-cta"
        >
          <a
            href="/dang-nhap"
            id="nav-login"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'rgba(255,255,255,0.65)',
              textDecoration: 'none',
              padding: '0.5rem 0.75rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
          >
            Đăng nhập
          </a>
          <a
            href="#download"
            id="nav-cta-download"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              background: '#F59E0B',
              color: '#1B3A57',
              fontWeight: 700,
              fontSize: '0.875rem',
              padding: '0.5rem 1.125rem',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 2px 8px rgba(245,158,11,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#D97706'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F59E0B'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            data-cta="navbar-download"
          >
            <Download size={14} strokeWidth={2.5} />
            Tải App
          </a>
        </div>

        {/* ── Mobile Toggle ─────────────────────── */}
        <button
          id="nav-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={mobileOpen}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            color: '#1B3A57',
            cursor: 'pointer',
          }}
          className="se-mobile-toggle"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* ── Mobile Menu ───────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            style={{
              overflow: 'hidden',
              background: 'rgba(10, 22, 40, 0.97)',
              backdropFilter: 'blur(20px)',
              borderTop: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div style={{ padding: '1rem 1.5rem 1.5rem' }}>
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  style={{
                    display: 'block',
                    padding: '0.75rem 0',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.75)',
                    textDecoration: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#download"
                onClick={() => setMobileOpen(false)}
                id="nav-mobile-cta"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  background: '#F59E0B',
                  color: '#0A1628',
                  fontWeight: 700,
                  fontSize: '1rem',
                  padding: '0.875rem',
                  borderRadius: 10,
                  textDecoration: 'none',
                }}
                data-cta="navbar-mobile-download"
              >
                <Download size={16} />
                Tải App Miễn Phí
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Responsive CSS (inline scoped) ───── */}
      <style>{`
        @media (max-width: 900px) {
          .se-desktop-nav, .se-desktop-cta { display: none !important; }
          .se-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </motion.header>
  )
}
