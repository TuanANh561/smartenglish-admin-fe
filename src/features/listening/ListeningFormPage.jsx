import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Clock,
  HelpCircle,
  ImageIcon,
  Link2,
  Music,
  Plus,
  Save,
  Sparkles,
  Volume2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { LISTENING_ACCENTS, LISTENING_TOPICS } from '@/mocks/data/listening'
import { useAuthStore } from '@/store/authStore'
import { parseDuration, speakWord, stopAudio } from '@/lib/ipaHelper'
import ListeningQuestionCard from './components/ListeningQuestionCard'
import ListeningVoiceConfigCard from './components/ListeningVoiceConfigCard'
import {
  createListeningLesson,
  getListeningLessonById,
  updateListeningLesson,
} from './listeningLessonApi'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CATEGORY_OPTIONS = [
  { value: 'TOEIC_PART_1', label: 'Part 1: Mô tả tranh (Photographs)' },
  { value: 'TOEIC_PART_2', label: 'Part 2: Hỏi & Đáp (Question - Response)' },
  { value: 'TOEIC_PART_3', label: 'Part 3: Đoạn hội thoại (Conversations)' },
  { value: 'TOEIC_PART_4', label: 'Part 4: Bài nói ngắn (Short Talks)' },
  { value: 'CONVERSATION', label: 'Hội thoại giao tiếp đời sống' },
  { value: 'SHORT_TALK', label: 'Bài nói theo chủ đề' },
  { value: 'NEWS_PODCAST', label: 'Tin tức & Podcast quốc tế' },
  { value: 'DICTATION', label: 'Chép chính tả chuyên sâu' },
]

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
}

const TEMPLATES = {
  TOEIC_PART_1: {
    title: 'Discussion in the Conference Room',
    topic: 'Kinh doanh',
    level: 'A2',
    duration: '00:25',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    description: 'Quan sát tranh và lắng nghe 4 phương án miêu tả hành động của các đồng nghiệp trong phòng họp.',
    transcript: `Narrator: Look at the photograph marked number one in your test book.\n(A) A woman is typing on a laptop computer.\n(B) They are looking at some documents on the table.\n(C) A man is giving a presentation on a white screen.\n(D) All chairs around the table are empty.`,
    questions: [
      {
        question: 'Which statement best describes the picture?',
        options: [
          '(A) A woman is typing on a laptop computer.',
          '(B) They are looking at some documents on the table.',
          '(C) A man is giving a presentation on a white screen.',
          '(D) All chairs around the table are empty.',
        ],
        correctIndex: 1,
        explanation: 'Phương án (B) chính xác: Bức ảnh chụp mọi người đang tập trung xem xét các tài liệu trên bàn làm việc.',
      },
    ],
  },
  TOEIC_PART_2: {
    title: 'Project Submission Deadline',
    topic: 'Công nghệ',
    level: 'B1',
    duration: '00:20',
    imageUrl: '',
    description: 'Lắng nghe câu hỏi và chọn câu phản hồi logic và phù hợp nhất trong công việc.',
    transcript: `Question: When will the software update be released to clients?\n(A) In the main conference hall.\n(B) By the end of next Wednesday.\n(C) Yes, the developers fixed the bugs.`,
    questions: [
      {
        question: 'When will the software update be released to clients?',
        options: [
          '(A) In the main conference hall.',
          '(B) By the end of next Wednesday.',
          '(C) Yes, the developers fixed the bugs.',
        ],
        correctIndex: 1,
        explanation: "Câu hỏi bắt đầu bằng 'When' (Khi nào), câu trả lời (B) chỉ mốc thời gian 'By the end of next Wednesday' là đáp án đúng.",
      },
    ],
  },
  TOEIC_PART_3: {
    title: 'Client Presentation Prep',
    topic: 'Kinh doanh',
    level: 'B2',
    duration: '00:35',
    imageUrl: '',
    description: 'Alex và Sarah trao đổi chuẩn bị slide doanh thu và trả lời thắc mắc của khách hàng doanh nghiệp.',
    transcript: `Alex: Did you finalize the revenue forecast slides for this afternoon's meeting?\nSarah: Yes, I added the quarterly growth charts and highlighted our top three enterprise clients.\nAlex: Great, let's also prepare quick answers in case they ask about delivery timelines.\nSarah: Don't worry, our deployment schedule is already detailed in the appendix.`,
    questions: [
      {
        question: 'What did Sarah add to the presentation slides?',
        options: ['Quarterly growth charts', 'New pricing packages', 'Competitor analysis', 'Client contract copies'],
        correctIndex: 0,
        explanation: "Sarah xác nhận đã bổ sung biểu đồ tăng trưởng hàng quý: 'I added the quarterly growth charts'.",
      },
      {
        question: 'Where can the client find information about the delivery schedule?',
        options: ['In the introduction', 'In the appendix', 'On the company website', 'In the email attachment'],
        correctIndex: 1,
        explanation: "Sarah trả lời: 'our deployment schedule is already detailed in the appendix' (phần phụ lục).",
      },
    ],
  },
  TOEIC_PART_4: {
    title: 'Airport Gate Change Announcement',
    topic: 'Du lịch',
    level: 'B1',
    duration: '00:30',
    imageUrl: '',
    description: 'Thông báo phát thanh tại sân bay về việc thay đổi cửa khởi hành và ưu tiên hành khách lên máy bay.',
    transcript: `Narrator: Attention all passengers on flight BA two hundred to London Heathrow. Due to minor tarmac congestion, your departure gate has been moved from gate B twelve to gate C eight. Boarding will commence in approximately twenty minutes, beginning with passengers requiring special assistance and first-class travelers. Please have your boarding passes and identification ready. Thank you for your cooperation.`,
    questions: [
      {
        question: 'What is the announcement mainly about?',
        options: ['A flight cancellation', 'A gate change', 'A lost baggage claim', 'A ticket price discount'],
        correctIndex: 1,
        explanation: "Thông báo nói về việc đổi cửa lên máy bay: 'your departure gate has been moved from gate B twelve to gate C eight'.",
      },
      {
        question: 'Who will be allowed to board first?',
        options: ['Economy passengers with small bags', 'Frequent flyer members only', 'Passengers requiring assistance and first-class travelers', 'Flight crew members'],
        correctIndex: 2,
        explanation: "Thông báo nói: 'beginning with passengers requiring special assistance and first-class travelers'.",
      },
    ],
  },
}

function ListeningFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TOEIC_PART_1',
    topic: 'Kinh doanh',
    accent: 'US Accent',
    level: 'B1',
    duration: '00:30',
    audioUrl: '',
    imageUrl: '',
    transcript: '',
    status: 'published',
  })

  const [voiceConfig, setVoiceConfig] = useState({
    mode: 'single',
    speaker1Name: 'Narrator',
    speaker1Gender: 'female',
    speaker1Persona: 'female-warm',
    speaker1VoiceURI: '',
    speaker1Pitch: 1.0,
    speaker1Rate: 0.95,
  })

  const [questions, setQuestions] = useState([])
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0)

  // Load existing lesson on edit
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    setIsLoading(true)

    getListeningLessonById(id)
      .then((data) => {
        if (!isMounted || !data) return
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'CONVERSATION',
          topic: data.topic || 'Kinh doanh',
          accent: data.accent || 'US Accent',
          level: data.cefrLevel || data.level || 'B1',
          duration: data.duration || '01:00',
          audioUrl: data.audioUrl || '',
          imageUrl: data.imageUrl || '',
          transcript: data.transcript || '',
          status: data.status || 'published',
        })
        if (data.voiceConfig && typeof data.voiceConfig === 'object') {
          setVoiceConfig(data.voiceConfig)
        }
        if (Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions)
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài nghe:', err)
        toast.error('Không tìm thấy thông tin bài nghe')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditing])

  // Ngắt toàn bộ âm thanh khi người dùng rời khỏi trang
  useEffect(() => {
    return () => {
      stopAudio()
    }
  }, [])

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const wordCount = useMemo(() => {
    const text = `${form.transcript} ${form.description}`.trim()
    return text ? text.split(/\s+/).length : 0
  }, [form.transcript, form.description])

  const lineCount = useMemo(() => {
    return form.transcript ? form.transcript.split('\n').filter(Boolean).length : 0
  }, [form.transcript])

  // Chèn mẫu chuẩn TOEIC theo dạng bài đang chọn
  const handleInsertSample = (catKey = form.category) => {
    const tmpl = TEMPLATES[catKey] || TEMPLATES.TOEIC_PART_1
    setForm((prev) => ({
      ...prev,
      title: tmpl.title,
      description: tmpl.description,
      transcript: tmpl.transcript,
      imageUrl: tmpl.imageUrl || prev.imageUrl,
      duration: tmpl.duration,
      topic: tmpl.topic,
      level: tmpl.level,
      category: catKey,
    }))
    if (tmpl.questions) {
      setQuestions(tmpl.questions)
      setOpenQuestionIdx(0)
    }
    toast.success(`Đã nạp bài nghe mẫu chuẩn ${catKey}!`)
  }

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error('Mỗi bài nghe tối đa 10 câu hỏi trắc nghiệm')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  // Tự động phân tích transcript thành syncedTranscripts
  const buildSyncedTranscripts = () => {
    if (!form.transcript.trim()) return []
    const lines = form.transcript.split('\n').map((l) => l.trim()).filter(Boolean)
    let currentMs = 0
    return lines.map((line, idx) => {
      let speaker = `Đoạn ${idx + 1}`
      let text = line

      const optMatch = line.match(/^(\([A-D1-4]\)|[A-D]\.)\s*(.+)$/i)
      if (optMatch) {
        const rawOpt = optMatch[1].replace(/[().]/g, '').toUpperCase()
        speaker = `(${rawOpt})`
        text = optMatch[2].trim()
      } else {
        const match = line.match(/^([A-Za-z0-9\s]+):\s*(.+)$/)
        if (match) {
          speaker = match[1].trim()
          text = match[2].trim()
        }
      }

      const estDuration = Math.max(2500, text.split(' ').length * 350)
      const startMs = currentMs
      const endMs = startMs + estDuration
      currentMs = endMs + 500
      return {
        startMs,
        endMs,
        text,
        textVi: '',
        speaker,
      }
    })
  }

  const handleTestAudioUrl = () => {
    if (!form.audioUrl.trim()) {
      toast.error('Vui lòng nhập đường dẫn URL file audio để nghe thử')
      return
    }
    speakWord('Kiểm tra âm thanh', form.audioUrl.trim())
    toast.success('Đang phát thử file âm thanh...')
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài nghe')
      return
    }
    if (!form.transcript.trim() && !form.description.trim() && !form.audioUrl.trim()) {
      toast.error('Vui lòng nhập Bản chép lời (Transcript), Mô tả hoặc URL file âm thanh')
      return
    }

    setIsSaving(true)
    try {
      const durationSec = parseDuration(form.duration) || 60
      const syncedTranscripts = buildSyncedTranscripts()

      const payload = {
        title: form.title.trim(),
        titleEn: form.title.trim(),
        titleVi: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        topic: form.topic,
        accent: form.accent,
        cefrLevel: form.level,
        duration: form.duration,
        durationSec,
        audioUrl: form.audioUrl.trim(),
        imageUrl: form.imageUrl.trim(),
        transcript: form.transcript.trim(),
        syncedTranscripts,
        voiceConfig,
        questions,
        status: form.status || 'published',
      }

      const authorInfo = {
        authorName: user?.displayName || 'Admin',
        authorEmail: user?.email || 'admin@smartenglish.vn',
      }

      if (isEditing) {
        await updateListeningLesson(id, payload)
        toast.success(`Đã cập nhật bài nghe "${form.title}" thành công`)
      } else {
        await createListeningLesson(payload, authorInfo)
        toast.success(`Đã tạo bài nghe mới "${form.title}" thành công`)
      }

      navigate('/hoc-lieu/bai-nghe')
    } catch (err) {
      console.error('Lỗi khi lưu bài nghe:', err)
      toast.error(err.message || 'Không thể lưu bài nghe')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/60">
        <LoadingSpinner text="Đang tải thông tin bài nghe..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-20 border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3 px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link
              to="/hoc-lieu/bai-nghe"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <ArrowLeft size={15} /> Bài nghe
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-slate-900 truncate max-w-md">
                  {isEditing ? `Chỉnh sửa: "${form.title}"` : 'Tạo bài nghe mới'}
                </h1>
                <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {form.level ? `Cấp độ ${form.level}` : 'Draft'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Quản lý học liệu / Bài luyện nghe hiểu tiếng Anh
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/hoc-lieu/bai-nghe"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="listening-editor-form"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4.5 py-2 text-xs font-bold text-white transition-all shadow-xs cursor-pointer hover:shadow-sm"
            >
              <Save size={14} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Lưu bài nghe'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <form id="listening-editor-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-7xl px-6 py-6 space-y-6">

          {/* Nút nạp nhanh mẫu bài nghe chuẩn TOEIC */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-blue-600" />
                Mẫu đề thi chuẩn TOEIC (Khuyên dùng)
              </h4>
              <p className="text-[11px] text-blue-700">
                Bấm vào một trong các dạng bài dưới đây để tự động điền kịch bản âm thanh, hình ảnh và câu hỏi mẫu:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleInsertSample('TOEIC_PART_1')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
              >
                Part 1 (Tranh ảnh)
              </button>
              <button
                type="button"
                onClick={() => handleInsertSample('TOEIC_PART_2')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
              >
                Part 2 (Hỏi & Đáp)
              </button>
              <button
                type="button"
                onClick={() => handleInsertSample('TOEIC_PART_3')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
              >
                Part 3 (Hội thoại)
              </button>
              <button
                type="button"
                onClick={() => handleInsertSample('TOEIC_PART_4')}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-semibold hover:bg-blue-100 shadow-2xs transition-colors cursor-pointer"
              >
                Part 4 (Bài nói)
              </button>
            </div>
          </div>

          {/* TOP: Thông tin bài nghe, Nguồn âm thanh, Bản chép lời & Studio giọng đọc */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Thông tin bài nghe + Nguồn audio (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 1: Thông tin cơ bản */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 text-xs font-bold">
                      1
                    </span>
                    Thông tin bài học
                  </h3>
                </div>

                {/* Tiêu đề */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Tiêu đề bài nghe <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={setField('title')}
                    placeholder="VD: Discussion in the Conference Room"
                    required
                    className="font-medium"
                  />
                </div>

                {/* Dạng bài / Phân loại (Category) */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Dạng bài nghe / Phần thi TOEIC <span className="text-rose-500">*</span>
                  </label>
                  <Select value={form.category} onChange={setField('category')}>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* 4 Cột: Chủ đề, CEFR, Accent, Thời lượng */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Chủ đề
                    </label>
                    <Select value={form.topic} onChange={setField('topic')}>
                      {LISTENING_TOPICS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Cấp độ CEFR
                    </label>
                    <Select value={form.level} onChange={setField('level')}>
                      {CEFR_LEVELS.map((l) => (
                        <option key={l} value={l}>
                          Cấp độ {l}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Giọng đọc (Accent)
                    </label>
                    <Select value={form.accent} onChange={setField('accent')}>
                      {LISTENING_ACCENTS.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Thời lượng
                    </label>
                    <div className="relative flex items-center">
                      <Clock
                        size={14}
                        className="absolute left-3 text-slate-400 pointer-events-none"
                      />
                      <input
                        type="text"
                        value={form.duration}
                        onChange={setField('duration')}
                        placeholder="00:35"
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-8.5 pr-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Mô tả ngắn */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Mô tả ngắn
                  </label>
                  <Textarea
                    rows={2}
                    autoResize
                    value={form.description}
                    onChange={setField('description')}
                    placeholder="Tóm tắt ngắn gọn nội dung và ngữ cảnh bài nghe..."
                    className="text-xs leading-relaxed"
                  />
                </div>
              </div>

              {/* Card 2: Hình ảnh đề bài (Part 1 hoặc có bảng biểu Part 3, 4) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <ImageIcon size={14} />
                    </span>
                    Hình ảnh đề bài {form.category === 'TOEIC_PART_1' ? '(Bắt buộc cho Part 1)' : '(Tùy chọn)'}
                  </h3>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Link2 size={13} className="text-slate-400" /> Đường dẫn URL hình ảnh
                  </label>
                  <Input
                    value={form.imageUrl}
                    onChange={setField('imageUrl')}
                    placeholder="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4..."
                    className="text-xs"
                  />
                </div>

                {/* Preview Image */}
                {form.imageUrl ? (
                  <div className="mt-2 rounded-xl border border-slate-200 overflow-hidden bg-slate-900 max-h-52 flex items-center justify-center relative group">
                    <img
                      src={form.imageUrl}
                      alt="Preview"
                      className="max-h-52 w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] text-white backdrop-blur-xs">
                      Xem trước hình ảnh
                    </span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    {form.category === 'TOEIC_PART_1'
                      ? 'Dán URL ảnh để học viên quan sát tranh trước khi nghe 4 phương án A, B, C, D.'
                      : 'Có thể để trống nếu bài nghe không yêu cầu hình ảnh trực quan.'}
                  </p>
                )}
              </div>

              {/* Card 3: Nguồn file Audio */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                      <Music size={14} />
                    </span>
                    File âm thanh bài nghe (Tùy chọn)
                  </h3>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                    <Link2 size={13} className="text-slate-400" /> URL File âm thanh (.mp3, .m4a, .wav)
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={form.audioUrl}
                      onChange={setField('audioUrl')}
                      placeholder="https://cdn.smartenglish.com/audio/lesson.mp3"
                      className="text-xs flex-1"
                    />
                    {form.audioUrl && (
                      <button
                        type="button"
                        onClick={handleTestAudioUrl}
                        className="inline-flex items-center gap-1 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 px-3 py-2 text-xs font-bold transition-colors cursor-pointer border border-brand-200"
                        title="Nghe thử file âm thanh"
                      >
                        <Volume2 size={14} /> Thử
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Nếu có file âm thanh, hệ thống sẽ phát file thu âm chuẩn này. Nếu để trống, hệ thống sẽ tự động sử dụng Giọng đọc AI đọc theo kịch bản bên dưới.
                </p>
              </div>
            </div>

            {/* RIGHT: Bản chép lời kịch bản & Studio giọng đọc (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 4: Bản chép lời kịch bản (Transcript) */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">
                      2
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      Bản chép lời bài nghe (Audio Script)
                    </h3>
                  </div>

                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {lineCount} câu thoại · {wordCount} từ
                  </span>
                </div>

                <Textarea
                  rows={8}
                  autoResize
                  value={form.transcript}
                  onChange={setField('transcript')}
                  placeholder={`Alex: Did you finalize the revenue forecast slides for this afternoon's meeting?\nSarah: Yes, I added the quarterly growth charts and highlighted our top clients.`}
                  className="font-mono text-xs leading-relaxed bg-slate-50/40 focus:bg-white transition-colors"
                />
                <p className="text-[11px] text-slate-400">
                  Nhập toàn bộ nội dung mà người nghe sẽ nghe được (bao gồm cả câu dẫn nếu có và các lựa chọn đáp án).
                </p>
              </div>

              {/* Card 5: Cấu hình Giọng đọc AI */}
              <ListeningVoiceConfigCard
                transcript={form.transcript}
                description={form.description}
                title={form.title}
                voiceConfig={voiceConfig}
                onChange={setVoiceConfig}
              />
            </div>
          </div>

          {/* BOTTOM: Bộ câu hỏi trắc nghiệm nghe hiểu */}
          <div className="w-full space-y-5">
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                    <HelpCircle size={14} />
                  </span>
                  Câu hỏi luyện tập ({questions.length} câu)
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {questions.length}/10
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-2xs cursor-pointer hover:shadow-xs"
                >
                  <Plus size={14} /> Thêm câu hỏi
                </button>
              </div>

              {/* Danh sách câu hỏi */}
              {questions.length === 0 ? (
                <div
                  onClick={addQuestion}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 py-8 px-4 text-center hover:border-brand-300 hover:bg-brand-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                    <Plus size={18} />
                  </div>
                  <p className="text-xs font-semibold text-slate-600">
                    Bấm vào đây để thêm câu hỏi trắc nghiệm sau bài nghe
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <ListeningQuestionCard
                      key={idx}
                      question={q}
                      index={idx}
                      isOpen={openQuestionIdx === idx}
                      onToggle={() =>
                        setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)
                      }
                      onChange={(updated) =>
                        setQuestions((prev) =>
                          prev.map((item, i) => (i === idx ? updated : item))
                        )
                      }
                      onRemove={() => {
                        setQuestions((prev) => prev.filter((_, i) => i !== idx))
                        if (openQuestionIdx === idx) setOpenQuestionIdx(null)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

export default ListeningFormPage
