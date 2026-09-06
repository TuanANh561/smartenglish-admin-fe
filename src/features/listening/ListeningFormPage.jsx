import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Headphones,
  Info,
  Link2,
  Plus,
  Radio,
  Save,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { LISTENING_ACCENTS, LISTENING_TOPICS, listeningLessons } from '@/mocks/data/listening'
import { useAuthStore } from '@/store/authStore'
import ListeningQuestionCard from './components/ListeningQuestionCard'
import ListeningVoiceConfigCard from './components/ListeningVoiceConfigCard'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
}

const SAMPLE_DIALOGUE = `Alex: Did you finalize the revenue forecast slides for this afternoon's meeting?
Sarah: Yes, I added the quarterly growth charts and highlighted our top three enterprise clients.
Alex: Great, let's also prepare quick answers in case they ask about delivery timelines.
Sarah: Don't worry, our deployment schedule is already detailed in the appendix.`

function ListeningFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)
  const existingItem = isEditing
    ? listeningLessons.find((l) => l.id === id) || listeningLessons[0]
    : null

  const [form, setForm] = useState({
    title: existingItem?.title || '',
    description: existingItem?.description || '',
    topic: existingItem?.topic || LISTENING_TOPICS[0] || 'Kinh doanh',
    accent: existingItem?.accent || 'US Accent',
    level: existingItem?.level?.substring(0, 2) || 'B1',
    duration: existingItem?.duration || '00:35',
    audioUrl: existingItem?.audioUrl || '',
    transcript: existingItem?.transcript || '',
  })

  const [hasExternalAudio, setHasExternalAudio] = useState(Boolean(existingItem?.audioUrl))

  const [voiceConfig, setVoiceConfig] = useState(
    existingItem?.voiceConfig || {
      mode: 'dialogue',
      speaker1Name: 'Alex',
      speaker1Gender: 'male',
      speaker1Persona: 'male-standard',
      speaker1VoiceURI: '',
      speaker1Pitch: 0.96,
      speaker1Rate: 0.96,
      speaker2Name: 'Sarah',
      speaker2Gender: 'female',
      speaker2Persona: 'female-warm',
      speaker2VoiceURI: '',
      speaker2Pitch: 1.12,
      speaker2Rate: 0.93,
    }
  )

  const [questions, setQuestions] = useState(
    existingItem?.questions?.length > 0 ? existingItem.questions : []
  )
  const [openQuestionIdx, setOpenQuestionIdx] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const wordCount = useMemo(() => {
    const text = `${form.transcript} ${form.description}`.trim()
    return text ? text.split(/\s+/).length : 0
  }, [form.transcript, form.description])

  const lineCount = useMemo(() => {
    return form.transcript ? form.transcript.split('\n').filter(Boolean).length : 0
  }, [form.transcript])

  const handleInsertSample = () => {
    setForm((prev) => ({
      ...prev,
      title: prev.title || 'Client Presentation Prep',
      description:
        prev.description ||
        'Alex and Sarah review quarterly revenue slides and prepare responses for key enterprise clients before the meeting.',
      transcript: SAMPLE_DIALOGUE,
      duration: '00:35',
      topic: 'Kinh doanh',
      level: 'B2',
    }))
    setVoiceConfig((prev) => ({
      ...prev,
      mode: 'dialogue',
      speaker1Name: 'Alex',
      speaker2Name: 'Sarah',
    }))
    toast.success('Đã nạp kịch bản đối thoại mẫu thành công!')
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

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề bài nghe')
      return
    }
    if (!form.transcript.trim() && !form.description.trim()) {
      toast.error('Vui lòng nhập Bản chép lời (Transcript) hoặc Mô tả bài nghe')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      toast.success(
        isEditing
          ? `Đã cập nhật bài nghe "${form.title}"`
          : `Đã tạo bài nghe mới "${form.title}"`
      )
      setIsSaving(false)
      navigate('/hoc-lieu/bai-nghe')
    }, 600)
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
                  {isEditing ? `Chỉnh sửa: "${existingItem?.title}"` : 'Tạo bài nghe Audio mới'}
                </h1>
                <span className="rounded-full bg-brand-50 border border-brand-200 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {form.level ? `Cấp độ ${form.level}` : 'Studio Draft'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Học liệu / Bài nghe
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
        <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT: Nội dung bài nghe & Studio giọng đọc (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
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

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Tiêu đề bài nghe <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.title}
                  onChange={setField('title')}
                  placeholder="VD: Client Presentation Prep"
                  required
                  className="font-medium"
                />
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
                  value={form.description}
                  onChange={setField('description')}
                  placeholder="Tóm tắt ngắn gọn nội dung bài nghe..."
                  className="text-xs leading-relaxed"
                />
              </div>
            </div>

            {/* Card 2: Bản chép lời kịch bản (Transcript) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    Bản chép lời (Transcript)
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {!form.transcript.trim() && (
                    <button
                      type="button"
                      onClick={handleInsertSample}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200 bg-purple-50/70 px-2.5 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} />
                      Chèn mẫu kịch bản
                    </button>
                  )}
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {lineCount} lượt thoại · {wordCount} từ
                  </span>
                </div>
              </div>

              <Textarea
                rows={8}
                value={form.transcript}
                onChange={setField('transcript')}
                placeholder={`Alex: Did you finalize the revenue forecast slides for this afternoon's meeting?\nSarah: Yes, I added the quarterly growth charts and highlighted our top clients.`}
                className="font-mono text-xs leading-relaxed bg-slate-50/40 focus:bg-white transition-colors"
              />
            </div>

            {/* Card 3: Studio Giọng đọc & Nghe thử */}
            <ListeningVoiceConfigCard
              transcript={form.transcript}
              description={form.description}
              title={form.title}
              voiceConfig={voiceConfig}
              onChange={setVoiceConfig}
            />
          </div>

          {/* RIGHT: Nguồn Audio ngoài + Bộ câu hỏi trắc nghiệm (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 4: Nguồn file Audio thực tế (Tùy chọn) */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">
                    3
                  </span>
                  Nguồn âm thanh
                </h3>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1.5 flex items-center gap-1.5">
                  <Link2 size={13} className="text-slate-400" /> URL File âm thanh MP3 (Tùy chọn)
                </label>
                <Input
                  value={form.audioUrl}
                  onChange={setField('audioUrl')}
                  placeholder="https://example.com/audio/lesson.mp3"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Card 5: Bộ câu hỏi nghe hiểu */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                    4
                  </span>
                  Câu hỏi trắc nghiệm
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {questions.length}/10
                  </span>
                </h3>

                <button
                  type="button"
                  onClick={addQuestion}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-bold text-white transition-all shadow-2xs cursor-pointer hover:shadow-xs"
                >
                  <Plus size={14} /> Thêm câu
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
                    Bấm vào đây để thêm câu hỏi trắc nghiệm
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
