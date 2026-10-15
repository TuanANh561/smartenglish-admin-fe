import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

const FAQ_ITEMS = [
  {
    id: 'faq-1',
    q: 'SmartEnglish phù hợp với trình độ nào?',
    a: 'SmartEnglish phù hợp với mọi trình độ từ người mới bắt đầu (A1) đến người đã có nền tảng muốn nâng cao (C1). Sau bài kiểm tra trình độ, AI sẽ tự động điều chỉnh nội dung và độ khó phù hợp với bạn.',
  },
  {
    id: 'faq-2',
    q: 'AI chấm điểm phát âm hoạt động như thế nào?',
    a: 'Công nghệ AI của SmartEnglish phân tích từng âm tiết trong câu nói của bạn, so sánh với chuẩn phát âm bản ngữ và chỉ ra chính xác âm nào sai, cần sửa như thế nào. Phản hồi được hiển thị ngay lập tức — không cần giáo viên.',
  },
  {
    id: 'faq-3',
    q: 'Tôi mất bao lâu để thấy kết quả?',
    a: 'Phần lớn học viên nhận thấy sự cải thiện đáng kể sau 4–8 tuần luyện tập đều đặn 15–20 phút mỗi ngày. Kết quả phụ thuộc vào trình độ ban đầu và mức độ kiên trì. Biểu đồ tiến trình trong app giúp bạn theo dõi từng bước cải thiện.',
  },
  {
    id: 'faq-4',
    q: 'Gói miễn phí có những gì? Khi nào cần nâng cấp?',
    a: 'Gói miễn phí cho phép học 5 bài/ngày, kiểm tra trình độ 1 lần và sử dụng AI phát âm cơ bản — đủ để bạn trải nghiệm và đánh giá sản phẩm. Khi bạn muốn học không giới hạn, có lộ trình cá nhân hoá đầy đủ và luyện thi IELTS/TOEIC, hãy nâng cấp lên Pro.',
  },
  {
    id: 'faq-5',
    q: 'SmartEnglish có hỗ trợ luyện IELTS / TOEIC không?',
    a: 'Có. Gói Pro có mô-đun luyện thi IELTS và TOEIC chuyên biệt bao gồm: luyện 4 kỹ năng (Nghe, Nói, Đọc, Viết), đề thi mô phỏng, và AI phân tích điểm yếu theo từng skill. Đặc biệt, phần Speaking được chấm điểm tự động theo tiêu chí IELTS.',
  },
  {
    id: 'faq-6',
    q: 'Tôi có thể huỷ đăng ký bất cứ lúc nào không?',
    a: 'Hoàn toàn có thể. Bạn có thể huỷ đăng ký bất kỳ lúc nào từ trong ứng dụng mà không mất phí phạt. Sau khi huỷ, bạn vẫn giữ được quyền truy cập Pro đến hết chu kỳ thanh toán đã trả.',
  },
]

function FAQItem({ item, isOpen, onToggle }) {
  const shouldReduce = useReducedMotion()

  return (
    <div
      style={{
        borderBottom: '1px solid #E2EAF2',
      }}
    >
      <button
        id={item.id}
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          gap: '1rem',
        }}
      >
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontWeight: 600,
            fontSize: '1rem',
            color: isOpen ? '#1B3A57' : '#334155',
            lineHeight: 1.4,
          }}
        >
          {item.q}
        </span>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: isOpen ? '#1B3A57' : '#F0F4F8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.2s',
          }}
        >
          {isOpen ? (
            <Minus size={14} color="white" strokeWidth={2.5} />
          ) : (
            <Plus size={14} color="#64748B" strokeWidth={2.5} />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={shouldReduce ? {} : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduce ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <p
              style={{
                fontSize: '0.9375rem',
                color: '#64748B',
                lineHeight: 1.75,
                margin: '0 0 1.25rem',
                paddingRight: '2.5rem',
              }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0)
  const shouldReduce = useReducedMotion()

  return (
    <section id="faq" style={{ background: '#FAFBFC', padding: '5rem 0' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 1.5rem' }}>
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
            Frequently Asked{' '}
            <span style={{ color: '#F59E0B' }}>Questions</span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#64748B' }}>
            Câu hỏi thường gặp về SmartEnglish.
          </p>
        </motion.div>

        {/* FAQ list */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'white',
            borderRadius: 16,
            padding: '0 1.75rem',
            border: '1px solid #E2EAF2',
            boxShadow: '0 2px 10px rgba(15,58,92,0.07)',
          }}
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={item.id}
              item={item}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Still have questions? */}
        <motion.div
          initial={shouldReduce ? {} : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          style={{
            textAlign: 'center',
            marginTop: '2rem',
            padding: '1.25rem',
            background: '#EEF4FA',
            borderRadius: 12,
            border: '1px solid #D6E8F5',
          }}
        >
          <p style={{ margin: '0 0 0.5rem', color: '#334155', fontWeight: 500, fontSize: '0.9375rem' }}>
            Vẫn còn thắc mắc?
          </p>
          <a
            href="mailto:support@loxera.vn"
            id="faq-contact-link"
            style={{
              color: '#1B3A57',
              fontWeight: 700,
              fontSize: '0.9rem',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
            }}
          >
            Liên hệ đội ngũ hỗ trợ →
          </a>
        </motion.div>
      </div>
    </section>
  )
}
