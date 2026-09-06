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

import PronunciationQuestionCard from './components/PronunciationQuestionCard'
import SampleWordsSection from './components/SampleWordsSection'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CATEGORY_LIST = PRONUNCIATION_CATEGORIES.filter((c) => c !== 'Tất cả phân loại')

const EMPTY_QUESTION = {
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  explanation: '',
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
        <div className="mx-auto max-w-6xl px-6 py-6 space-y-6">

          {/* ── TOP: Lý thuyết phát âm (Card 1 & 2 bên trái, Card 3 bên phải) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: Card 1 & Card 2 (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
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
                    autoResize
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
                    autoResize
                    value={form.mouthShapeGuide}
                    onChange={set('mouthShapeGuide')}
                    placeholder="VD: Thả lỏng toàn bộ cơ mặt, môi hơi mở tự nhiên, lưỡi nằm ở vị trí trung tâm trong khoang miệng, không rung dây thanh quản..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Card 3 & Tip card (6 cols) */}
            <div className="lg:col-span-6 space-y-5">
              {/* Card 3: Danh sách từ mẫu & Câu mẫu */}
              <SampleWordsSection
                sampleWords={form.sampleWords}
                sampleSentences={form.sampleSentences}
                onAddWord={handleAddSampleWord}
                onUpdateWord={handleUpdateSampleWord}
                onRemoveWord={handleRemoveSampleWord}
                onAddSentence={handleAddSampleSentence}
                onUpdateSentence={handleUpdateSampleSentence}
                onRemoveSentence={handleRemoveSampleSentence}
                onPlayAudio={handlePlaySampleAudio}
              />

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

          {/* ── BOTTOM: Bộ câu hỏi bài tập nhận diện âm (FULL ROW) ── */}
          <div className="w-full space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">
                      ✓
                    </span>
                    Bài tập trắc nghiệm phát âm củng cố
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
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <PronunciationQuestionCard
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
          </div>

        </div>
      </form>
    </div>
  )
}

export default PronunciationFormPage
