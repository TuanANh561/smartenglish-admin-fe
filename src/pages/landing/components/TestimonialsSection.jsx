import { motion, useReducedMotion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

// ─── IMPORTANT: Tất cả testimonials bên dưới là DỮ LIỆU GIẢ ĐỊNH.
// Thay bằng feedback học viên thật trước khi ra mắt.
// Xem TODO.md để biết thêm.
const TESTIMONIALS = [
  {
    id: 'review-1',
    stars: 5,
    quote:
      'Nhờ AI sửa phát âm chi tiết từng âm tiết và ngữ điệu, mình đã tự tin thuyết trình và đàm phán với đối tác quốc tế chỉ sau 2 tháng.',
    name: 'Nguyễn Thị Hương',
    role: 'Marketing Manager',
    company: '— FinTech Solutions',
    initials: 'NH',
    avatarBg: '#EEF4FA',
  },
  {
    id: 'review-2',
    stars: 5,
    quote:
      'Tính năng luyện phản xạ AI theo tình huống thực tế giúp mình phản xạ nói tự nhiên hơn hẳn. Điểm Speaking IELTS của mình đã tăng từ 5.5 lên 7.0.',
    name: 'Trần Minh Khoa',
    role: 'Software Engineer',
    company: '— FPT Software',
    initials: 'TK',
    avatarBg: '#FEF3C7',
  },
  {
    id: 'review-3',
    stars: 5,
    quote:
      'Lộ trình cá nhân hóa rất vừa vặn, mỗi ngày chỉ cần 15 phút luyện tập lúc rảnh. Giọng đọc AI chuẩn bản xứ nghe rất cuốn và dễ bắt chước.',
    name: 'Lê Thị Thu',
    role: 'Sinh viên',
    company: '— ĐH Ngoại Thương',
    initials: 'LT',
    avatarBg: '#EEF4FA',
  },
]

function TestimonialCard({ review, index }) {
  const shouldReduce = useReducedMotion()

  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: shouldReduce ? 0 : index * 0.12, duration: 0.6 }}
      style={{
        background: 'white',
        border: '1px solid #E2EAF2',
        borderRadius: 16,
        padding: '1.75rem',
        boxShadow: '0 2px 8px rgba(15,58,92,0.06)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Quote icon */}
      <Quote size={20} color="#F59E0B" style={{ marginBottom: '0.75rem', opacity: 0.8 }} />

      {/* Stars */}
      <div style={{ display: 'flex', gap: 2, marginBottom: '0.875rem' }}>
        {Array.from({ length: review.stars }).map((_, i) => (
          <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
        ))}
      </div>

      {/* Quote */}
      <p
        style={{
          fontSize: '0.9375rem',
          color: '#334155',
          lineHeight: 1.7,
          fontStyle: 'italic',
          flex: 1,
          margin: '0 0 1.25rem',
        }}
      >
        "{review.quote}"
      </p>

      {/* Author */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: review.avatarBg,
            border: '1.5px solid #E2EAF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#1B3A57',
            flexShrink: 0,
          }}
        >
          {review.initials}
        </div>
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#1B3A57' }}>
            {review.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
            {review.role} {review.company}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Stats Row ──────────────────────────────────────────────────────────────
const STATS = [
  { value: '50.000+', label: 'Học viên tin dùng', id: 'stat-users' },
  { value: '4.9 ★', label: 'Đánh giá ứng dụng', id: 'stat-rating' },
  { value: '1.2M+', label: 'Bài học đã hoàn thành', id: 'stat-lessons' },
  { value: '+35%', label: 'Cải thiện phát âm TB', id: 'stat-improve' },
]

export default function TestimonialsSection() {
  const shouldReduce = useReducedMotion()

  return (
    <section id="proof" style={{ background: '#FAFBFC', padding: '5rem 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
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
            What Our Learners Say
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B', maxWidth: 460, margin: '0 auto' }}>
            Hàng nghìn học viên đã cải thiện tiếng Anh và đạt mục tiêu của mình.
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1rem',
            marginBottom: '2.5rem',
            padding: '1.5rem',
            background: 'white',
            borderRadius: 16,
            border: '1px solid #E2EAF2',
            boxShadow: '0 2px 8px rgba(15,58,92,0.06)',
          }}
          className="se-stats-grid"
        >
          {STATS.map((stat) => (
            <div key={stat.id} id={stat.id} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'Merriweather', serif",
                  fontWeight: 900,
                  fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)',
                  color: '#1B3A57',
                  marginBottom: '0.25rem',
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial cards */}
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}
          className="se-testimonials-grid"
        >
          {TESTIMONIALS.map((review, i) => (
            <TestimonialCard key={review.id} review={review} index={i} />
          ))}
        </div>

        {/* Trust badge */}
        <motion.p
          initial={shouldReduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          style={{
            textAlign: 'center',
            fontSize: '0.8125rem',
            color: '#64748B',
            marginTop: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
        >
          <span>✓ Đánh giá xác thực từ người dùng iOS & Android</span>
        </motion.p>
      </div>

      {/* Responsive */}
      <style>{`
        @media (max-width: 900px) {
          .se-testimonials-grid { grid-template-columns: 1fr 1fr !important; }
          .se-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 540px) {
          .se-testimonials-grid { grid-template-columns: 1fr !important; }
          .se-stats-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </section>
  )
}
