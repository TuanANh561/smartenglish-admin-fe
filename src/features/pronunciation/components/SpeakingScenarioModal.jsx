import { useState, useEffect } from 'react'
import {
  X,
  Sparkles,
  Upload,
  Plus,
  Trash2,
  Volume2,
  Bot,
  User,
  HelpCircle,
  Loader2,
  Check,
  Tag,
  Languages,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { generateScenarioWithAi } from '../speakingScenarioApi'
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
  { value: 'us_harper', label: 'US Harper (Nữ - Khuyên dùng - Nhanh)' },
  { value: 'us_hannah', label: 'US Hannah (Nữ - Truyền cảm)' },
  { value: 'us_daniel', label: 'US Daniel (Nam - Ấm áp)' },
  { value: 'us_peter', label: 'US Peter (Nam - Năng động)' },
  { value: 'gb_amelia', label: 'GB Amelia (Nữ - Anh-Anh thanh lịch)' },
  { value: 'gb_edward', label: 'GB Edward (Nam - Anh-Anh chuẩn)' },
  { value: 'gb_charlotte', label: 'GB Charlotte (Nữ - Tự nhiên)' },
]

const SPEED_OPTIONS = [
  { value: 'slow', label: 'Chậm (Slow 0.8x)' },
  { value: 'normal', label: 'Bình thường (Normal 1.0x)' },
  { value: 'fast', label: 'Nhanh (Fast 1.2x)' },
]

export default function SpeakingScenarioModal({
  isOpen,
  onClose,
  initialData,
  onSave,
}) {
  const isEditing = Boolean(initialData?.id)

  // Main form state
  const [form, setForm] = useState({
    titleEn: '',
    titleVi: '',
    descriptionEn: '',
    descriptionVi: '',
    category: 'Giao tiếp',
    cefrLevel: 'A1',
    partnerName: 'Patricia',
    partnerRole: 'A new colleague at your company',
    partnerAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    openingLine: 'Hi there! I just started working here today. It is nice to meet you! What is your name?',
    suggestedKeywords: ['Nice to meet you', 'My name is', 'Welcome to the team'],
    userGuideText: 'Lắng nghe, sau đó nhấn vào micro để trả lời. Hãy thử dùng các từ gợi ý để cuộc hội thoại trôi chảy tự nhiên.',
    systemPrompt: 'You are Patricia, a friendly new colleague. Speak in clear English suitable for the level. Keep answers concise (2-3 sentences).',
    defaultVoice: 'us_harper',
    defaultSpeed: 'normal',
    allowAutoEnd: true,
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
    isPremium: false,
    isPublished: true,
  })

  // Keyword input tag helper
  const [keywordInput, setKeywordInput] = useState('')

  // AI Prompt generator box state
  const [isAiBoxOpen, setIsAiBoxOpen] = useState(false)
  const [aiTopicPrompt, setAiTopicPrompt] = useState('')
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        partnerAvatarUrl: initialData.partnerAvatarUrl || '/mascot-avatar.png',
        suggestedKeywords: Array.isArray(initialData.suggestedKeywords) ? initialData.suggestedKeywords : [],
      })
    } else {
      setForm({
        titleEn: '',
        titleVi: '',
        descriptionEn: '',
        descriptionVi: '',
        category: 'Giao tiếp',
        cefrLevel: 'A1',
        partnerName: 'Patricia',
        partnerRole: 'A new colleague at your company',
        partnerAvatarUrl: '/mascot-avatar.png',
        openingLine: 'Hi there! I just started working here today. It is nice to meet you! What is your name?',
        suggestedKeywords: ['Nice to meet you', 'My name is', 'Welcome'],
        userGuideText: 'Lắng nghe, sau đó nhấn vào micro để trả lời. Hãy thử dùng các từ gợi ý để cuộc hội thoại trôi chảy tự nhiên.',
        systemPrompt: 'You are Patricia, a friendly new colleague. Keep replies under 3 sentences.',
        defaultVoice: 'us_harper',
        defaultSpeed: 'normal',
        allowAutoEnd: true,
        imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
        isPremium: false,
        isPublished: true,
      })
    }
  }, [initialData, isOpen])

  if (!isOpen) return null

  // Add keyword
  const handleAddKeyword = () => {
    const val = keywordInput.trim()
    if (!val) return
    if (!form.suggestedKeywords.includes(val)) {
      setForm((prev) => ({
        ...prev,
        suggestedKeywords: [...prev.suggestedKeywords, val],
      }))
    }
    setKeywordInput('')
  }

  // Remove keyword
  const handleRemoveKeyword = (index) => {
    setForm((prev) => ({
      ...prev,
      suggestedKeywords: prev.suggestedKeywords.filter((_, i) => i !== index),
    }))
  }

  // Upload avatar
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingAvatar(true)
    try {
      const res = await uploadCourseImage(file, 'speaking/avatars')
      if (res?.url) {
        setForm((prev) => ({ ...prev, partnerAvatarUrl: res.url }))
        toast.success('Đã tải avatar lên thành công!')
      }
    } catch (err) {
      toast.error('Lỗi tải avatar: ' + err.message)
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Upload image to S3
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    try {
      const res = await uploadCourseImage(file, 'speaking/scenarios')
      if (res?.url) {
        setForm((prev) => ({ ...prev, imageUrl: res.url }))
        toast.success('Đã tải ảnh lên AWS S3 thành công!')
      }
    } catch (err) {
      toast.error('Lỗi tải ảnh lên AWS S3: ' + err.message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  // Generate scenario using Gemini AI
  const handleTriggerAiGenerate = async () => {
    if (!aiTopicPrompt.trim()) {
      toast.error('Vui lòng nhập chủ đề bạn muốn AI sinh kịch bản!')
      return
    }

    setIsGeneratingAi(true)
    try {
      const res = await generateScenarioWithAi(aiTopicPrompt, form.cefrLevel, form.category)
      const data = res?.data || res
      if (data) {
        setForm((prev) => ({
          ...prev,
          titleEn: data.titleEn || prev.titleEn,
          titleVi: data.titleVi || prev.titleVi,
          descriptionEn: data.descriptionEn || prev.descriptionEn,
          descriptionVi: data.descriptionVi || prev.descriptionVi,
          partnerName: data.partnerName || prev.partnerName,
          partnerRole: data.partnerRole || prev.partnerRole,
          openingLine: data.openingLine || prev.openingLine,
          suggestedKeywords: Array.isArray(data.suggestedKeywords) ? data.suggestedKeywords : prev.suggestedKeywords,
          userGuideText: data.userGuideText || prev.userGuideText,
          systemPrompt: data.systemPrompt || prev.systemPrompt,
          defaultVoice: data.defaultVoice || prev.defaultVoice,
          defaultSpeed: data.defaultSpeed || prev.defaultSpeed,
        }))
        toast.success('Trợ lý Gemini AI đã tự động điền toàn bộ kịch bản!')
        setIsAiBoxOpen(false)
      }
    } catch (err) {
      toast.error('Lỗi khi gọi Gemini AI: ' + err.message)
    } finally {
      setIsGeneratingAi(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.titleEn.trim()) {
      toast.error('Vui lòng nhập tiêu đề tiếng Anh!')
      return
    }
    if (!form.openingLine.trim()) {
      toast.error('Vui lòng nhập câu mở màn hội thoại của AI!')
      return
    }
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold border border-indigo-100">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isEditing ? 'Chỉnh sửa kịch bản Luyện nói AI' : 'Tạo mới kịch bản Luyện nói AI'}
              </h2>
              <p className="text-xs text-slate-500">
                Thiết lập tình huống, nhân vật đối tác, câu mở màn và từ vựng gợi ý
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick AI Generator trigger button */}
            <Button
              size="sm"
              variant="outline"
              icon={Sparkles}
              onClick={() => setIsAiBoxOpen(!isAiBoxOpen)}
              className="text-xs font-semibold text-purple-700 border-purple-200 bg-purple-50/50 hover:bg-purple-100"
            >
              Sinh bằng AI
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* AI Quick Generator Drawer/Box */}
        {isAiBoxOpen && (
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-b border-purple-100 p-4">
            <div className="flex items-center gap-2 text-purple-900 font-semibold text-xs mb-2">
              <Sparkles size={14} className="text-purple-600" />
              <span>Trợ lý Gemini AI sinh kịch bản hội thoại tự động:</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={aiTopicPrompt}
                onChange={(e) => setAiTopicPrompt(e.target.value)}
                placeholder="VD: Trả phòng khách sạn, Phỏng vấn xin việc, Mua đồ tại siêu thị..."
                className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 shadow-2xs"
                onKeyDown={(e) => e.key === 'Enter' && handleTriggerAiGenerate()}
              />
              <Button
                size="sm"
                variant="primary"
                onClick={handleTriggerAiGenerate}
                disabled={isGeneratingAi}
                className="bg-purple-600 hover:bg-purple-700 text-xs shrink-0"
              >
                {isGeneratingAi ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1" />
                    Đang sinh dữ liệu...
                  </>
                ) : (
                  'Tự động tạo'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề tiếng Anh <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.titleEn}
                  onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                  placeholder="VD: Greeting a new colleague"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề tiếng Việt
                </label>
                <Input
                  value={form.titleVi}
                  onChange={(e) => setForm({ ...form, titleVi: e.target.value })}
                  placeholder="VD: Chào hỏi đồng nghiệp mới"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trình độ CEFR <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={form.cefrLevel}
                  onChange={(e) => setForm({ ...form, cefrLevel: e.target.value })}
                  options={CEFR_OPTIONS}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chủ đề / Phân loại
                </label>
                <Select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  options={CATEGORY_OPTIONS}
                />
              </div>
            </div>

            {/* Scenario Banner Image */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Ảnh minh họa bối cảnh
              </label>
              {form.imageUrl ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden group max-w-md bg-slate-100">
                  <img src={form.imageUrl} alt="Scenario" className="w-full h-36 object-cover" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="cursor-pointer px-3 py-1.5 text-xs font-semibold text-white bg-white/25 hover:bg-white/35 backdrop-blur-xs rounded-xl flex items-center gap-1.5 transition-colors">
                      <Upload size={13} />
                      <span>Đổi ảnh</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, imageUrl: '' })}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600/90 hover:bg-rose-600 backdrop-blur-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      title="Bỏ ảnh này"
                    >
                      <X size={13} />
                      <span>Bỏ ảnh</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-dashed border-slate-300 transition-colors">
                    <Upload size={14} className="text-slate-400" />
                    <span>{isUploadingImage ? 'Đang tải...' : 'Tải ảnh từ máy / S3'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        imageUrl:
                          'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80',
                      })
                    }
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    Dùng ảnh mẫu gợi ý
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Scenario Context */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Bối cảnh tình huống</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bối cảnh chi tiết (Tiếng Anh)
              </label>
              <Textarea
                rows={3}
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                placeholder="VD: Patricia is your new colleague. Today is her first day at the company, and you want to say hello and get to know her."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bản dịch bối cảnh (Tiếng Việt - hiển thị khi người dùng nhấn nút "Dịch")
              </label>
              <Textarea
                rows={2}
                value={form.descriptionVi}
                onChange={(e) => setForm({ ...form, descriptionVi: e.target.value })}
                placeholder="VD: Patricia là đồng nghiệp mới của bạn. Hôm nay là ngày đầu tiên cô ấy đến công ty..."
              />
            </div>
          </div>

          {/* Section 3: AI Partner & Opening Line */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Nhân vật đối tác & Lượt chào mở màn</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên nhân vật đối tác <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.partnerName}
                  onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
                  placeholder="VD: Patricia"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chức danh / Vai trò đối tác
                </label>
                <Input
                  value={form.partnerRole}
                  onChange={(e) => setForm({ ...form, partnerRole: e.target.value })}
                  placeholder="VD: A new colleague at your company"
                />
              </div>
            </div>

            {/* Avatar Selector with Mascot default & Image preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Avatar nhân vật
              </label>
              <div className="flex items-center gap-4 p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
                <div className="relative group shrink-0">
                  <img
                    src={form.partnerAvatarUrl || '/mascot-avatar.png'}
                    alt="Partner Avatar"
                    onError={(e) => {
                      e.target.src = '/mascot-avatar.png'
                    }}
                    className="h-16 w-16 rounded-2xl object-cover border-2 border-white shadow-sm bg-white"
                  />
                  {form.partnerAvatarUrl && form.partnerAvatarUrl !== '/mascot-avatar.png' && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, partnerAvatarUrl: '/mascot-avatar.png' })}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 shadow-xs"
                      title="Bỏ ảnh này, đặt lại về linh vật mặc định"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, partnerAvatarUrl: '/mascot-avatar.png' })
                        toast.success('Đã chọn Avatar Linh vật mặc định!')
                      }}
                      className="px-3 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                    >
                      🦊 Dùng Linh vật Lexoria mặc định
                    </button>

                    <label className="flex items-center gap-1.5 cursor-pointer px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-2xs">
                      <Upload size={13} />
                      <span>{isUploadingAvatar ? 'Đang tải...' : 'Tải avatar khác'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploadingAvatar}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Mặc định sẽ gắn Avatar linh vật của app. Bạn cũng có thể tải ảnh khác hoặc bấm X để đặt lại về linh vật.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Câu chào mở màn của AI <span className="text-rose-500">*</span>
              </label>
              <Textarea
                rows={2}
                value={form.openingLine}
                onChange={(e) => setForm({ ...form, openingLine: e.target.value })}
                placeholder="VD: Hi there! I just started working here today. It is nice to meet you! What is your name?"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Đây là câu đầu tiên AI sẽ tự động đọc/nói ngay khi học viên bắt đầu vào phiên luyện tập.
              </p>
            </div>
          </div>

          {/* Section 4: Suggested Keywords & User Guide */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Gợi ý từ vựng & Hướng dẫn học viên</h3>

            {/* Keyword tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Các từ / Cụm từ gợi ý (Hiển thị các nút gợi ý trên màn hình chat thoại)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Nhập cụm từ (VD: Nice to meet you) rồi bấm Thêm"
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
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

              {/* Tags Container */}
              <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                {form.suggestedKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-2xs"
                  >
                    <span>{kw}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(i)}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {form.suggestedKeywords.length === 0 && (
                  <span className="text-xs text-slate-400 italic">Chưa có từ vựng gợi ý nào.</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hướng dẫn lượt học viên (Hiển thị tại màn hình Setup)
              </label>
              <Input
                value={form.userGuideText}
                onChange={(e) => setForm({ ...form, userGuideText: e.target.value })}
                placeholder="Lắng nghe, sau đó nhấn vào micro để trả lời..."
              />
            </div>

            {/* Publishing toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Xuất bản ngay cho học viên</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary">
              {isEditing ? 'Lưu thay đổi' : 'Tạo kịch bản'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
