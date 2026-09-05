import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Headphones,
  HelpCircle,
  Lightbulb,
  Plus,
  Save,
  Trash2,
  Volume2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import IpaInputField from '@/components/ui/IpaInputField'
import {
  PRONUNCIATION_CATEGORIES,
  pronunciationLessons,
} from '@/mocks/data/pronunciation'
import { useAuthStore } from '@/store/authStore'
import { speakWord, stopAudio } from '@/lib/ipaHelper'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CATEGORY_LIST = PRONUNCIATION_CATEGORIES.filter((c) => c !== 'Tất cả phân loại')

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
}

// ── Accordion Question Card ─────────────────────────────────────────────────
function QuestionCard({ question, index, isOpen, onToggle, onChange, onRemove }) {
  const hasContent = question.question.trim()

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isOpen
          ? 'border-brand-300 bg-white shadow-md'
          : 'border-slate-200 bg-slate-50/60 hover:border-slate-300'
      }`}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate ${
              hasContent ? 'text-slate-800 font-medium' : 'text-slate-400 italic'
            }`}
          >
            {hasContent ? question.question : `Câu hỏi ${index + 1} — chưa nhập nội dung`}
          </p>
          {!isOpen && question.options[question.correctIndex] && (
            <p className="text-xs text-emerald-600 mt-0.5">
              ✓ Đáp án: {question.options[question.correctIndex]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer"
            title="Xóa câu hỏi"
          >
            <Trash2 size={14} />
          </button>
          {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Câu hỏi nhận diện âm / phát âm
            </label>
            <Textarea
              rows={2}
              value={question.question}
              onChange={(e) => onChange({ ...question, question: e.target.value })}
              placeholder="VD: Choose the word whose underlined part is pronounced differently:"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Các đáp án <span className="text-emerald-600 font-normal">(click ô vuông = đáp án đúng)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {question.options.map((opt, optIdx) => (
                <div
                  key={optIdx}
                  className={`flex items-center gap-2 rounded-xl p-2.5 border transition-colors ${
                    question.correctIndex === optIdx
                      ? 'border-emerald-200 bg-emerald-50/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onChange({ ...question, correctIndex: optIdx })}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-all cursor-pointer ${
                      question.correctIndex === optIdx
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-slate-300 bg-white hover:border-emerald-400'
                    }`}
                  >
                    {question.correctIndex === optIdx && <Check size={11} strokeWidth={3} />}
                  </button>
                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {String.fromCharCode(65 + optIdx)}.
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const options = [...question.options]
                      options[optIdx] = e.target.value
                      onChange({ ...question, options })
                    }}
                    placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}...`}
                    className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-600">
              Giải thích phát âm <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </label>
            <Input
              value={question.explanation}
              onChange={(e) => onChange({ ...question, explanation: e.target.value })}
              placeholder="VD: Từ 'banana' có âm /ə/ ở vị trí âm tiết đầu và cuối..."
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Form Page ──────────────────────────────────────────────────────────
function PronunciationFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)

  const existingItem = isEditing
    ? pronunciationLessons.find((p) => p.id === id) || pronunciationLessons[0]
    : null

  const [form, setForm] = useState({
    title: existingItem?.title || '',
    ipaSymbol: existingItem?.ipaSymbol || '',
    category: existingItem?.category || 'Vowels',
    level: existingItem?.level || 'B1',
    status: existingItem?.status || 'published',
    aiMinScoreThreshold: existingItem?.aiMinScoreThreshold || 85,
    description: existingItem?.description || '',
    mouthShapeGuide: existingItem?.mouthShapeGuide || '',
    sampleWords: existingItem?.sampleWords || [
      { word: '', ipa: '', meaning: '' },
    ],
    sampleSentences: existingItem?.sampleSentences || [
      { text: '', ipa: '' },
    ],
  })

  const [questions, setQuestions] = useState([
    {
      question: 'Which word contains the sound /ə/?',
      options: ['About', 'Cat', 'Father', 'Music'],
      correctIndex: 0,
      explanation: 'Trong từ "About" (/əˈbaʊt/), âm đầu tiên là âm schwa /ə/.',
    },
    {
      question: 'Which word has a different vowel sound from the others?',
      options: ['Doctor', 'Banana', 'Teacher', 'Bicycle'],
      correctIndex: 3,
      explanation: 'Từ "Bicycle" có âm /aɪ/, không chứa âm schwa trong âm tiết chính.',
    },
  ])

  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [playingWordIdx, setPlayingWordIdx] = useState(null)

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleAddSampleWord = () => {
    setForm((prev) => ({
      ...prev,
      sampleWords: [...prev.sampleWords, { word: '', ipa: '', meaning: '' }],
    }))
  }

  const handleUpdateSampleWord = (idx, field, val) => {
    setForm((prev) => {
      const list = [...prev.sampleWords]
      list[idx] = { ...list[idx], [field]: val }
      return { ...prev, sampleWords: list }
    })
  }

  const handleRemoveSampleWord = (idx) => {
    setForm((prev) => ({
      ...prev,
      sampleWords: prev.sampleWords.filter((_, i) => i !== idx),
    }))
  }

  const handleAddSampleSentence = () => {
    setForm((prev) => ({
      ...prev,
      sampleSentences: [...prev.sampleSentences, { text: '', ipa: '' }],
    }))
  }

  const handleUpdateSampleSentence = (idx, field, val) => {
    setForm((prev) => {
      const list = [...prev.sampleSentences]
      list[idx] = { ...list[idx], [field]: val }
      return { ...prev, sampleSentences: list }
    })
  }

  const handleRemoveSampleSentence = (idx) => {
    setForm((prev) => ({
      ...prev,
      sampleSentences: prev.sampleSentences.filter((_, i) => i !== idx),
    }))
  }

  const handlePlaySampleAudio = (idx, word) => {
    setPlayingWordIdx(idx)
    speakWord(word || 'sample')
    toast.success(`Phát âm chuẩn: "${word || 'Từ mẫu'}"`)
    setTimeout(() => setPlayingWordIdx(null), 1800)
  }

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error('Tối đa 10 câu hỏi bài tập cho bài học này')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên bài học phát âm')
      return
    }

    setIsSaving(true)
    setTimeout(() => {
      toast.success(
        isEditing
          ? `Đã cập nhật bài học phát âm "${form.title}"`
          : `Đã thêm bài phát âm mới "${form.title}"`
      )
      setIsSaving(false)
      navigate('/hoc-lieu/phat-am')
    }, 600)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* ── Header bar ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100 shadow-xs">
        <div className="mx-auto max-w-6xl flex items-center gap-4 px-6 py-3.5">
          <Link
            to="/hoc-lieu/phat-am"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} />
            Quay lại Phát âm
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <div className="flex-1">
            <h1 className="text-base font-bold text-slate-900">
              {isEditing ? `Chỉnh sửa: "${existingItem?.title}"` : 'Thêm bài phát âm mới'}
            </h1>
            <p className="text-xs text-slate-500">
              Quản lý học liệu / Phát âm / {isEditing ? 'Chỉnh sửa' : 'Thêm mới'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/hoc-lieu/phat-am"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </Link>
            <button
              type="submit"
              form="pronunciation-form"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 disabled:opacity-60 px-4 py-2 text-sm font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Save size={15} />
              {isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài học'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body Form ── */}
      <form id="pronunciation-form" onSubmit={handleSave}>
        <div className="mx-auto max-w-6xl px-6 py-6 grid grid-cols-5 gap-6">
          {/* ── LEFT: Thông tin phát âm (3 cols) ── */}
          <div className="col-span-3 space-y-5">
            {/* Card 1: Thông tin cơ bản */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                  1
                </span>
                Thông tin bài học & Ký hiệu âm
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Tên bài học phát âm *
                  </label>
                  <Input
                    value={form.title}
                    onChange={set('title')}
                    placeholder="VD: Mastering the Schwa Sound /ə/..."
                    required
                  />
                </div>
                <div>
                  <IpaInputField
                    value={form.ipaSymbol}
                    onChange={(newVal) => setForm((prev) => ({ ...prev, ipaSymbol: newVal }))}
                    sourceWord={form.title}
                    label="Ký hiệu IPA"
                    placeholder="VD: /ə/, /iː/, /θ/..."
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Phân loại âm
                  </label>
                  <Select value={form.category} onChange={set('category')}>
                    {CATEGORY_LIST.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Cấp độ CEFR
                  </label>
                  <Select value={form.level} onChange={set('level')}>
                    {CEFR_LEVELS.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        Cấp độ {lvl}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Ngưỡng đạt AI (%)
                  </label>
                  <Input
                    type="number"
                    min={50}
                    max={100}
                    value={form.aiMinScoreThreshold}
                    onChange={set('aiMinScoreThreshold')}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Mô tả bài học phát âm
                </label>
                <Textarea
                  rows={2}
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Mô tả đặc điểm và vai trò của âm này trong giao tiếp tiếng Anh..."
                />
              </div>
            </div>

            {/* Card 2: Hướng dẫn khẩu hình miệng */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                  2
                </span>
                Hướng dẫn khẩu hình miệng & Kỹ thuật phát âm
              </h3>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Vị trí môi, răng, lưỡi, thanh quản và luồng hơi
                </label>
                <Textarea
                  rows={3}
                  value={form.mouthShapeGuide}
                  onChange={set('mouthShapeGuide')}
                  placeholder="VD: Thả lỏng toàn bộ cơ mặt, môi hơi mở tự nhiên, lưỡi nằm ở vị trí trung tâm trong khoang miệng, không rung dây thanh quản..."
                />
              </div>
            </div>

            {/* Card 3: Danh sách từ mẫu & Câu mẫu */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-600 text-xs font-bold">
                    3
                  </span>
                  Từ vựng mẫu luyện tập ({form.sampleWords.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddSampleWord}
                  className="flex items-center gap-1 rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 hover:bg-brand-100 transition-colors cursor-pointer"
                >
                  <Plus size={13} /> Thêm từ mẫu
                </button>
              </div>

              <div className="space-y-3">
                {form.sampleWords.map((sw, swIdx) => (
                  <div
                    key={swIdx}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 space-y-2 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">Từ mẫu {swIdx + 1}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handlePlaySampleAudio(swIdx, sw.word)}
                          className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold hover:underline"
                        >
                          <Volume2 size={13} /> Nghe thử
                        </button>
                        {form.sampleWords.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSampleWord(swIdx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Xóa từ mẫu"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-start">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ mẫu</label>
                        <Input
                          value={sw.word}
                          onChange={(e) => handleUpdateSampleWord(swIdx, 'word', e.target.value)}
                          placeholder="Từ (VD: About)"
                        />
                      </div>
                      <IpaInputField
                        value={sw.ipa}
                        onChange={(newVal) => handleUpdateSampleWord(swIdx, 'ipa', newVal)}
                        sourceWord={sw.word}
                        onWordCorrect={(corrected) => handleUpdateSampleWord(swIdx, 'word', corrected)}
                        label="Phiên âm IPA"
                        placeholder="VD: /əˈbaʊt/"
                      />
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Việt</label>
                        <Input
                          value={sw.meaning}
                          onChange={(e) => handleUpdateSampleWord(swIdx, 'meaning', e.target.value)}
                          placeholder="Nghĩa (VD: Về, khoảng)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sample sentences */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Câu luyện đọc mẫu ({form.sampleSentences.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddSampleSentence}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Thêm câu mẫu
                  </button>
                </div>

                <div className="space-y-3">
                  {form.sampleSentences.map((st, stIdx) => (
                    <div
                      key={stIdx}
                      className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 relative group shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500">Câu {stIdx + 1}</span>
                        {form.sampleSentences.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSampleSentence(stIdx)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Xóa câu mẫu"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <Input
                        value={st.text}
                        onChange={(e) => handleUpdateSampleSentence(stIdx, 'text', e.target.value)}
                        placeholder="Câu tiếng Anh (VD: A cup of tea and a banana for breakfast.)"
                      />
                      <Input
                        value={st.ipa}
                        onChange={(e) => handleUpdateSampleSentence(stIdx, 'ipa', e.target.value)}
                        placeholder="Phiên âm cả câu (VD: /ə kʌp əv tiː ənd ə bəˈnænə.../)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Bộ câu hỏi bài tập nhận diện âm (2 cols) ── */}
          <div className="col-span-2 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓
                    </span>
                    Bài tập trắc nghiệm phát âm
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {questions.length}/10 câu hỏi luyện tập
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addQuestion}
                  disabled={questions.length >= 10}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={13} /> Thêm câu
                </button>
              </div>

              {/* Accordion List */}
              <div className="space-y-2.5">
                {questions.map((q, idx) => (
                  <QuestionCard
                    key={idx}
                    question={q}
                    index={idx}
                    isOpen={openQuestionIdx === idx}
                    onToggle={() =>
                      setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)
                    }
                    onChange={(updated) => {
                      const next = [...questions]
                      next[idx] = updated
                      setQuestions(next)
                    }}
                    onRemove={() => {
                      setQuestions(questions.filter((_, i) => i !== idx))
                      if (openQuestionIdx === idx) setOpenQuestionIdx(null)
                    }}
                  />
                ))}

                {questions.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                    <HelpCircle size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-xs text-slate-400 font-medium">
                      Chưa có câu hỏi bài tập nào
                    </p>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="mt-2 text-xs font-bold text-brand-600 hover:underline cursor-pointer"
                    >
                      + Thêm câu hỏi đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Pronunciation Tip card */}
            <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-xs text-purple-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-purple-900">
                <Headphones size={14} className="text-purple-600" />
                Đánh giá AI Speech Recognition:
              </p>
              <ul className="list-disc list-inside space-y-1 text-purple-700">
                <li>Hệ thống Voice AI sẽ đối chiếu file thu âm của học viên với phiên âm IPA chuẩn.</li>
                <li>Ngưỡng điểm khuyến nghị là 80-85% để đảm bảo học viên phát âm dễ hiểu.</li>
                <li>Câu hỏi trắc nghiệm hỗ trợ học viên rèn luyện phản xạ tai nghe trước khi nói.</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PronunciationFormPage
