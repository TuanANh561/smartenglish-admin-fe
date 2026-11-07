import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Save,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Volume2,
  Bot,
  User,
  Loader2,
  X,
  Languages,
  BookOpen,
  Image as ImageIcon,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCtrlSave } from '@/hooks/useCtrlSave'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTopbarStore } from '@/store/topbarStore'
import {
  getSpeakingScenarioById,
  createSpeakingScenario,
  updateSpeakingScenario,
  generateScenarioWithAi,
} from './speakingScenarioApi'
import { uploadCourseImage } from '@/features/courses/courseApi'

const CEFR_OPTIONS = [
  { value: 'A1', label: 'A1 - Mới bắt đầu' },
  { value: 'A2', label: 'A2 - Cơ bản' },
  { value: 'B1', label: 'B1 - Trung cấp' },
  { value: 'B2', label: 'B2 - Khá' },
  { value: 'C1', label: 'C1 - Cao cấp' },
  { value: 'C2', label: 'C2 - Thành thạo' },
]

const CATEGORY_OPTIONS = [
  { value: 'Giao tiếp', label: 'Giao tiếp hàng ngày' },
  { value: 'Công việc', label: 'Công việc & Văn phòng' },
  { value: 'Đời sống', label: 'Đời sống & Gia đình' },
  { value: 'Du lịch', label: 'Du lịch & Khám phá' },
  { value: 'Luyện thi', label: 'Luyện thi (IELTS / TOEIC)' },
]

const VOICE_OPTIONS = [
  { value: 'us_harper', label: 'US Harper (Nữ - Tự nhiên)' },
  { value: 'us_hannah', label: 'US Hannah (Nữ - Truyền cảm)' },
  { value: 'us_daniel', label: 'US Daniel (Nam - Ấm áp)' },
  { value: 'us_peter', label: 'US Peter (Nam - Năng động)' },
  { value: 'gb_amelia', label: 'GB Amelia (Nữ - Anh-Anh chuẩn)' },
  { value: 'gb_edward', label: 'GB Edward (Nam - Anh-Anh chuẩn)' },
]

const SPEED_OPTIONS = [
  { value: 'slow', label: 'Chậm (0.8x)' },
  { value: 'normal', label: 'Bình thường (1.0x)' },
  { value: 'fast', label: 'Nhanh (1.2x)' },
]

const MASCOT_AVATAR_URL = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
const SAMPLE_COVER_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80'

export default function SpeakingScenarioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)
  const [editTitle, setEditTitle] = useState('')

  // AI Prompt generation state
  const [aiTopicPrompt, setAiTopicPrompt] = useState('')
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Keyword input tag
  const [keywordInput, setKeywordInput] = useState('')

  // Form State
  const [form, setForm] = useState({
    titleEn: '',
    titleVi: '',
    descriptionEn: '',
    descriptionVi: '',
    category: 'Giao tiếp',
    cefrLevel: 'A1',
    partnerName: 'Patricia',
    partnerRole: 'A new colleague at your company',
    partnerAvatarUrl: MASCOT_AVATAR_URL,
    openingLine: 'Hi there! I just started working here today. It is nice to meet you! What is your name?',
    suggestedKeywords: ['Nice to meet you', 'My name is', 'Welcome to the team'],
    userGuideText: 'Lắng nghe nhân viên hoặc bạn trò chuyện, sau đó nhấn vào micro để trả lời.',
    systemPrompt: 'You are Patricia, a friendly new colleague. Speak in clear English suitable for the level. Keep answers concise (2-3 sentences).',
    defaultVoice: 'us_harper',
    defaultSpeed: 'normal',
    allowAutoEnd: true,
    imageUrl: SAMPLE_COVER_IMAGE,
    isPremium: false,
    isPublished: true,
  })

  // Load chi tiết kịch bản khi sửa
  useEffect(() => {
    if (!isEditing) return
    setIsLoading(true)
    getSpeakingScenarioById(id)
      .then((res) => {
        const data = res?.data || res
        if (!data) return
        setEditTitle(data.titleEn || data.titleVi || '')
        setForm({
          titleEn: data.titleEn || '',
          titleVi: data.titleVi || '',
          descriptionEn: data.descriptionEn || '',
          descriptionVi: data.descriptionVi || '',
          category: data.category || 'Giao tiếp',
          cefrLevel: data.cefrLevel || 'A1',
          partnerName: data.partnerName || 'Patricia',
          partnerRole: data.partnerRole || '',
          partnerAvatarUrl: data.partnerAvatarUrl || MASCOT_AVATAR_URL,
          openingLine: data.openingLine || '',
          suggestedKeywords: Array.isArray(data.suggestedKeywords) ? data.suggestedKeywords : [],
          userGuideText: data.userGuideText || '',
          systemPrompt: data.systemPrompt || '',
          defaultVoice: data.defaultVoice || 'us_harper',
          defaultSpeed: data.defaultSpeed || 'normal',
          allowAutoEnd: data.allowAutoEnd ?? true,
          imageUrl: data.imageUrl || SAMPLE_COVER_IMAGE,
          isPremium: Boolean(data.isPremium),
          isPublished: Boolean(data.isPublished ?? true),
        })
      })
      .catch((err) => {
        toast.error('Không thể tải thông tin kịch bản: ' + err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [id, isEditing])

  const setField = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Handle Save
  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!form.titleEn.trim()) {
      toast.error('Vui lòng nhập tiêu đề tiếng Anh cho kịch bản')
      return
    }
    if (!form.openingLine.trim()) {
      toast.error('Vui lòng nhập câu chào mở màn của AI')
      return
    }

    setIsSaving(true)
    try {
      if (isEditing) {
        await updateSpeakingScenario(id, form)
        toast.success(`Đã cập nhật kịch bản "${form.titleEn}"`)
      } else {
        await createSpeakingScenario(form)
        toast.success(`Đã tạo kịch bản mới "${form.titleEn}"`)
      }
      navigate('/app/hoc-lieu/phat-am')
    } catch (err) {
      toast.error('Lỗi khi lưu kịch bản: ' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Phím tắt Ctrl + S
  useCtrlSave(handleSave, !isSaving)

  // Topbar đồng bộ
  const setCustomHeader = useTopbarStore((s) => s.setCustomHeader)
  const clearCustomHeader = useTopbarStore((s) => s.clearCustomHeader)

  useEffect(() => {
    setCustomHeader({
      backLink: '/app/hoc-lieu/phat-am',
      backText: 'Quay lại kịch bản',
      title: isEditing ? `Chỉnh sửa: "${editTitle || form.titleEn}"` : 'Tạo kịch bản Luyện nói AI mới',
      subtitle: `Quản lý học liệu / Kịch bản Luyện nói / ${isEditing ? 'Chỉnh sửa' : 'Thêm mới'}`,
      actions: (
        <div className="flex items-center gap-2">
          <Link
            to="/app/hoc-lieu/phat-am"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Hủy bỏ
          </Link>
          <Button
            type="submit"
            form="scenario-form"
            loading={isSaving}
            size="sm"
            icon={Save}
            title="Lưu kịch bản (Ctrl + S)"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
          </Button>
        </div>
      ),
    })
    return () => clearCustomHeader()
  }, [setCustomHeader, clearCustomHeader, isEditing, editTitle, form.titleEn, isSaving])

  // Trợ lý AI Gemini sinh kịch bản tự động
  const handleAiGenerate = async () => {
    const prompt = aiTopicPrompt.trim()
    if (!prompt) {
      toast.error('Vui lòng nhập chủ đề tình huống cần AI sinh')
      return
    }

    setIsAiGenerating(true)
    try {
      const res = await generateScenarioWithAi(prompt, form.cefrLevel, form.category)
      const data = res?.data || res
      if (!data) throw new Error('Không nhận được dữ liệu phản hồi từ AI')

      setForm((prev) => ({
        ...prev,
        titleEn: data.titleEn || prev.titleEn,
        titleVi: data.titleVi || prev.titleVi,
        descriptionEn: data.descriptionEn || prev.descriptionEn,
        descriptionVi: data.descriptionVi || prev.descriptionVi,
        partnerName: data.partnerName || prev.partnerName,
        partnerRole: data.partnerRole || prev.partnerRole,
        openingLine: data.openingLine || prev.openingLine,
        systemPrompt: data.systemPrompt || prev.systemPrompt,
        suggestedKeywords: Array.isArray(data.suggestedKeywords) && data.suggestedKeywords.length > 0
          ? data.suggestedKeywords
          : prev.suggestedKeywords,
        userGuideText: data.userGuideText || prev.userGuideText,
        imageUrl: data.imageUrl || prev.imageUrl,
      }))
      toast.success('Trợ lý AI đã tự động tạo nội dung kịch bản!')
      setAiTopicPrompt('')
    } catch (err) {
      toast.error('Lỗi khi sinh kịch bản bằng AI: ' + err.message)
    } finally {
      setIsAiGenerating(false)
    }
  }

  // Keywords management
  const handleAddKeyword = () => {
    const kw = keywordInput.trim()
    if (!kw) return
    if (form.suggestedKeywords.includes(kw)) {
      toast.error('Từ khóa gợi ý này đã tồn tại')
      return
    }
    setForm((prev) => ({
      ...prev,
      suggestedKeywords: [...prev.suggestedKeywords, kw],
    }))
    setKeywordInput('')
  }

  const handleRemoveKeyword = (index) => {
    setForm((prev) => ({
      ...prev,
      suggestedKeywords: prev.suggestedKeywords.filter((_, i) => i !== index),
    }))
  }

  // Upload image cover
  const handleUploadCover = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const toastId = toast.loading('Đang tải ảnh bìa...')
    try {
      const res = await uploadCourseImage(file)
      const url = res?.url || res?.data?.url || res
      if (url) {
        setForm((prev) => ({ ...prev, imageUrl: url }))
        toast.success('Đã tải ảnh bìa thành công!', { id: toastId })
      }
    } catch (err) {
      toast.error('Lỗi khi tải ảnh: ' + err.message, { id: toastId })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu kịch bản..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-2">
      <form id="scenario-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-[1440px] px-6 py-4 space-y-6">

          {/* ── BỐ CỤC 2 CỘT CHUẨN: BÊN TRÁI 7 COLS (NỘI DUNG), BÊN PHẢI 5 COLS (CẤU HÌNH & AI) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* CỘT TRÁI: NỘI DUNG TÌNH HUỐNG & ĐÀM THOẠI (7 COLS)          */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-7 space-y-5">

              {/* CARD 1: Thông tin & Bối cảnh kịch bản */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    1
                  </span>
                  Thông tin & Bối cảnh kịch bản
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Tiêu đề tiếng Anh *
                    </label>
                    <Input
                      value={form.titleEn}
                      onChange={setField('titleEn')}
                      placeholder="VD: Hotel Check-in Procedure"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Tiêu đề tiếng Việt
                    </label>
                    <Input
                      value={form.titleVi}
                      onChange={setField('titleVi')}
                      placeholder="VD: Thủ tục nhận phòng khách sạn"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Bối cảnh tình huống (Tiếng Anh) *
                  </label>
                  <Textarea
                    rows={3}
                    value={form.descriptionEn}
                    onChange={setField('descriptionEn')}
                    placeholder="Describe the setting and the situation (e.g. You have just arrived at the Grand Hotel after a long flight...)"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Bản dịch bối cảnh (Tiếng Việt)
                  </label>
                  <Textarea
                    rows={2}
                    value={form.descriptionVi}
                    onChange={setField('descriptionVi')}
                    placeholder="Mô tả hoàn cảnh bằng tiếng Việt để học viên nắm ngữ cảnh..."
                  />
                </div>
              </div>

              {/* CARD 2: Lượt mở màn của AI & Persona Prompt */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    2
                  </span>
                  Câu chào mở đầu & Prompt chỉ dẫn AI
                </h3>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Câu chào mở màn của AI *
                  </label>
                  <Input
                    value={form.openingLine}
                    onChange={setField('openingLine')}
                    placeholder="VD: Hello! Welcome to Grand Hotel. How can I help you today?"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    System Prompt chỉ dẫn AI Persona
                  </label>
                  <Textarea
                    rows={4}
                    value={form.systemPrompt}
                    onChange={setField('systemPrompt')}
                    placeholder="You are David, a hotel receptionist. Be polite, ask clear follow-up questions, speak in simple B1 English and keep responses under 2-3 sentences."
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Chỉ dẫn tính cách, ngữ cảnh và giới hạn độ dài lượt nói cho mô hình AI Gemini khi đóng vai.
                  </p>
                </div>
              </div>

              {/* CARD 3: Gợi ý từ vựng & Hướng dẫn học viên */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    3
                  </span>
                  Gợi ý từ vựng & Hướng dẫn luyện tập
                </h3>

                {/* Input thêm gợi ý */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Từ vựng / Cụm từ gợi ý ban đầu
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="Nhập cụm từ (VD: I have a reservation) rồi nhấn Thêm"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none bg-slate-50/50"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddKeyword()
                        }
                      }}
                    />
                    <Button size="sm" type="button" variant="secondary" icon={Plus} onClick={handleAddKeyword}>
                      Thêm
                    </Button>
                  </div>

                  {/* Pills Container */}
                  <div className="mt-2.5 flex flex-wrap gap-2 min-h-[38px] p-2.5 bg-slate-50 rounded-xl border border-slate-200/70">
                    {form.suggestedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        <span>{kw}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveKeyword(i)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                    {form.suggestedKeywords.length === 0 && (
                      <span className="text-xs text-slate-400 italic">Chưa có từ khóa gợi ý nào.</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Hướng dẫn học viên
                  </label>
                  <Input
                    value={form.userGuideText}
                    onChange={setField('userGuideText')}
                    placeholder="Lắng nghe, sau đó nhấn vào micro để trả lời..."
                  />
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* CỘT PHẢI: TRỢ LÝ AI, NHÂN VẬT & CẤU HÌNH (5 COLS)            */}
            {/* ══════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-5 space-y-5">

              {/* CARD 1: Trợ lý AI Gemini sinh tự động */}
              <div className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50/70 via-blue-50/40 to-white shadow-xs p-5 space-y-3">
                <div className="flex items-center gap-2 text-brand-900 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={15} className="text-brand-600" />
                  <span>Trợ lý Gemini AI sinh kịch bản tự động</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nhập chủ đề tình huống bạn muốn (VD: <em>"Airport Security Check"</em>, <em>"Doctor Consultation"</em>), AI sẽ tự động điền toàn bộ kịch bản.
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={aiTopicPrompt}
                    onChange={(e) => setAiTopicPrompt(e.target.value)}
                    placeholder="Nhập chủ đề tình huống..."
                    className="w-full rounded-xl border border-brand-200 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAiGenerate()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    icon={Sparkles}
                    loading={isAiGenerating}
                    onClick={handleAiGenerate}
                  >
                    {isAiGenerating ? 'AI đang thiết kế kịch bản...' : 'Sinh kịch bản bằng AI ngay'}
                  </Button>
                </div>
              </div>

              {/* CARD 2: Nhân vật AI đối tác */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    4
                  </span>
                  Nhân vật đàm thoại AI
                </h3>

                {/* Avatar preview & actions */}
                <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-100 bg-slate-50/60">
                  <img
                    src={form.partnerAvatarUrl || MASCOT_AVATAR_URL}
                    alt={form.partnerName}
                    className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                    onError={(e) => { e.target.src = MASCOT_AVATAR_URL }}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, partnerAvatarUrl: MASCOT_AVATAR_URL }))}
                        className="rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        🦊 Dùng Linh vật
                      </button>
                      <label className="rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer">
                        <span>Đổi ảnh khác</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadCover}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Tên nhân vật *
                    </label>
                    <Input
                      value={form.partnerName}
                      onChange={setField('partnerName')}
                      placeholder="VD: Patricia"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Vai trò / Chức vụ
                    </label>
                    <Input
                      value={form.partnerRole}
                      onChange={setField('partnerRole')}
                      placeholder="VD: Hotel Receptionist"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Giọng đọc phát âm
                    </label>
                    <Select
                      value={form.defaultVoice}
                      onChange={setField('defaultVoice')}
                      options={VOICE_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Tốc độ nói
                    </label>
                    <Select
                      value={form.defaultSpeed}
                      onChange={setField('defaultSpeed')}
                      options={SPEED_OPTIONS}
                    />
                  </div>
                </div>
              </div>

              {/* CARD 3: Phân loại, Trình độ & Ảnh bìa */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    5
                  </span>
                  Phân loại & Xuất bản
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Trình độ CEFR
                    </label>
                    <Select
                      value={form.cefrLevel}
                      onChange={setField('cefrLevel')}
                      options={CEFR_OPTIONS}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Chủ đề kịch bản
                    </label>
                    <Select
                      value={form.category}
                      onChange={setField('category')}
                      options={CATEGORY_OPTIONS}
                    />
                  </div>
                </div>

                {/* Ảnh bìa */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-600">
                      Ảnh bìa kịch bản
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, imageUrl: SAMPLE_COVER_IMAGE }))}
                      className="text-[11px] text-brand-600 hover:underline cursor-pointer"
                    >
                      Dùng ảnh mẫu
                    </button>
                  </div>
                  <div className="relative aspect-16/9 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={form.imageUrl || SAMPLE_COVER_IMAGE}
                      alt="Cover"
                      className="h-full w-full object-cover"
                      onError={(e) => { e.target.src = SAMPLE_COVER_IMAGE }}
                    />
                    <label className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 cursor-pointer">
                      <Upload size={14} />
                      <span>Tải ảnh bìa mới</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadCover}
                      />
                    </label>
                  </div>
                </div>

                {/* Tùy chọn xuất bản */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={setField('isPublished')}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                    />
                    <span>Xuất bản ngay cho học viên</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.isPremium}
                      onChange={setField('isPremium')}
                      className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 h-4 w-4"
                    />
                    <span>Yêu cầu gói Premium</span>
                  </label>
                </div>
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  )
}

