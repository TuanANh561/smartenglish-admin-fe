import { motion } from 'framer-motion'
import { Zap, Mail, ArrowRight } from 'lucide-react'

// Custom SVG social icons (brand icons not in lucide-react)
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
)
const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)
const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)


const footerLinks = {
  Product: ['Features', 'Pricing', 'Demo', 'Changelog', 'Roadmap'],
  Learn: ['Courses', 'Speaking Practice', 'Vocabulary', 'Grammar', 'Pronunciation'],
  Company: ['About Us', 'Blog', 'Careers', 'Press Kit', 'Contact'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Refund Policy'],
}

const socials = [
  { icon: TwitterIcon, label: 'Twitter', href: '#', color: 'hover:text-sky-400' },
  { icon: InstagramIcon, label: 'Instagram', href: '#', color: 'hover:text-pink-400' },
  { icon: YoutubeIcon, label: 'YouTube', href: '#', color: 'hover:text-red-400' },
  { icon: LinkedinIcon, label: 'LinkedIn', href: '#', color: 'hover:text-blue-400' },
  { icon: GithubIcon, label: 'GitHub', href: '#', color: 'hover:text-white' },
]

const bounceVariants = {
  rest: { y: 0 },
  hover: { y: -4, transition: { type: 'spring', stiffness: 400, damping: 10 } },
}

export default function LandingFooter() {
  return (
    <footer className="bg-[#070710] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Top section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
              </div>
              <span
                className="text-xl font-bold text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Lexoria
              </span>
            </div>
            <p
              className="text-sm text-white/45 leading-relaxed mb-6 max-w-xs"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              AI-powered English learning for the next generation. Speak confidently. Learn faster.
              Grow further.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-3">
                Weekly English Tips
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-white/30 shrink-0" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    className="bg-transparent text-xs text-white/70 placeholder-white/30 outline-none flex-1"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-3 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4 text-white" />
                </motion.button>
              </div>
            </div>

            {/* Socials */}
            <div className="flex gap-2">
              {socials.map(({ icon: Icon, label, href, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  variants={bounceVariants}
                  initial="rest"
                  whileHover="hover"
                  className={`w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 ${color} transition-colors duration-200`}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-xs font-bold text-white/70 uppercase tracking-widest mb-5"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/40 hover:text-white/80 transition-colors duration-200"
                      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs text-white/30"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            © {new Date().getFullYear()} Lexoria. All rights reserved. Made with ❤️ for English learners worldwide.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/30" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
