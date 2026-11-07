import { useState, useEffect, useRef, useMemo } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Volume2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useCtrlSave } from '@/hooks/useCtrlSave'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import IpaInputField from '@/components/ui/IpaInputField'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useTopbarStore } from '@/store/topbarStore'
import { useAuthStore } from '@/store/authStore'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'
import { registerAudioStopHandler } from '@/lib/appAudioCoordinator'
import { speakWord, speakWithWebSpeech, stopAudio } from '@/lib/ipaHelper'
import { cleanDisplayMeaning } from './columns'
import { cn } from '@/lib/utils'
import { TopicSelect } from './components/TopicSelect'
import { QuestionCard } from './components/QuestionCard'

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const PARTS_OF_SPEECH = [
  { value: 'Noun', label: 'Danh từ (Noun)' },
  { value: 'Verb', label: 'Động từ (Verb)' },
  { value: 'Adjective', label: 'Tính từ (Adjective)' },
  { value: 'Adverb', label: 'Trạng từ (Adverb)' },
  { value: 'Pronoun', label: 'Đại từ (Pronoun)' },
  { value: 'Preposition', label: 'Giới từ (Preposition)' },
  { value: 'Conjunction', label: 'Liên từ (Conjunction)' },
  { value: 'Interjection', label: 'Thán từ (Interjection)' },
]

const EMPTY_QUESTION = { question: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' }

// ── Main Form Page ──────────────────────────────────────────────────────────
export default function VocabularyFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialWordFromUrl = searchParams.get('word') || ''
  const isEditing = Boolean(id)

  const [form, setForm] = useState({
    word: initialWordFromUrl,
    pronunciation: '',
    partOfSpeech: 'Noun',
    cefrLevel: 'B1',
    vietnameseMeaning: '',
    englishMeaning: '',
    topic: '',
    exampleEn: '',
    exampleVi: '',
    synonyms: '',
    antonyms: '',
    audioUrl: '',
  })

  const [questions, setQuestions] = useState([])
  const [openQuestionIdx, setOpenQuestionIdx] = useState(null)
  const [dbTopics, setDbTopics] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [isLookingUp, setIsLookingUp] = useState(false)
  const [isPlayingExample, setIsPlayingExample] = useState(false)

  // Tải danh sách chủ đề thực tế từ Backend CSDL
  useEffect(() => {
    api.get('/admin/words/topics')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDbTopics(data)
        }
      })
      .catch((err) => console.warn('Không thể tải topics từ backend:', err))
  }, [])

  // Tải dữ liệu từ vựng khi chỉnh sửa
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true)
      api.get(ENDPOINTS.words.detail, { path: { id } })
        .then((data) => {
          if (data) {
            setForm({
              word: data.word || '',
              pronunciation: data.pronunciation || data.ipaUs || data.ipaUk || '',
              partOfSpeech: data.partOfSpeech || 'Noun',
              cefrLevel: data.cefrLevel || 'B1',
              vietnameseMeaning: cleanDisplayMeaning(data.vietnameseMeaning, data.word) || '',
              englishMeaning: cleanDisplayMeaning(data.englishMeaning) || '',
              topic: data.topic || '',
              exampleEn: data.exampleEn || '',
              exampleVi: cleanDisplayMeaning(data.exampleVi) || '',
              synonyms: data.synonyms || '',
              antonyms: data.antonyms || '',
              audioUrl: data.audioUrl || data.audioUsUrl || data.audioUkUrl || '',
            })
            if (data.exercises && Array.isArray(data.exercises)) {
              setQuestions(data.exercises)
            }
          }
        })
        .catch((err) => {
          console.error(err)
          toast.error('Không thể tải thông tin từ vựng')
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [id, isEditing])

  // Tự động kích hoạt tra cứu nếu mở trang tạo từ vựng qua query param ?word=
  useEffect(() => {
    if (!isEditing && initialWordFromUrl.trim()) {
      handleAutoLookup(initialWordFromUrl.trim())
    }
  }, [initialWordFromUrl, isEditing])

  // Tắt âm thanh khi rời khỏi màn hình
  useEffect(() => {
    const unregister = registerAudioStopHandler(() => {
      setIsPlayingExample(false)
    })
    return () => {
      unregister()
      stopAudio()
    }
  }, [])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const playExampleAudio = () => {
    const example = (form.exampleEn || '').trim()
    if (!example) {
      toast.error('Chưa có câu ví dụ để phát âm')
      return
    }
    if (isPlayingExample) {
      stopAudio()
      setIsPlayingExample(false)
      return
    }
    setIsPlayingExample(true)
    speakWithWebSpeech(example, () => {
      setIsPlayingExample(false)
    })
  }

  const handleAutoLookup = async (overrideWord = null) => {
    const rawWord = (typeof overrideWord === 'string' ? overrideWord : form.word || '').trim()
    if (!rawWord) {
      toast.error('Vui lòng nhập từ vựng trước khi tra cứu')
      return
    }

    setIsLookingUp(true)
    const tId = toast.loading(`Đang tra cứu từ điển cho "${rawWord}"...`)
    try {
      const res = await api.get(ENDPOINTS.words.autoLookup, {
        params: { word: rawWord },
      })
      const data = res?.data || res
      if (data && data.word) {
        setForm((prev) => ({
          ...prev,
          word: data.word,
          pronunciation: data.pronunciation || prev.pronunciation,
          partOfSpeech: data.partOfSpeech || prev.partOfSpeech,
          cefrLevel: data.cefrLevel || prev.cefrLevel,
          vietnameseMeaning: cleanDisplayMeaning(data.vietnameseMeaning, data.word) || prev.vietnameseMeaning,
          englishMeaning: cleanDisplayMeaning(data.englishMeaning) || prev.englishMeaning,
          topic: data.topic || prev.topic,
          exampleEn: data.exampleEn || prev.exampleEn,
          exampleVi: cleanDisplayMeaning(data.exampleVi) || prev.exampleVi,
          audioUrl: data.audioUrl || prev.audioUrl,
        }))
        toast.success(`Đã tra cứu & điền dữ liệu cho "${data.word}"`, { id: tId })
      } else {
        toast.error('Không tìm thấy dữ liệu từ điển cho từ này', { id: tId })
      }
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Lỗi khi tra cứu từ điển', { id: tId })
    } finally {
      setIsLookingUp(false)
    }
  }

  const addQuestion = () => {
    if (questions.length >= 10) {
      toast.error('Tối đa 10 câu hỏi bài tập')
      return
    }
    const newIdx = questions.length
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION }])
    setOpenQuestionIdx(newIdx)
  }

  const handleSave = async (e) => {
    if (e) e.preventDefault()
    if (!form.word.trim()) {
      toast.error('Vui lòng nhập từ vựng')
      return
    }
    if (!form.vietnameseMeaning.trim()) {
      toast.error('Vui lòng nhập nghĩa tiếng Việt')
      return
    }

    setIsSaving(true)
    const validQuestions = questions.filter((q) => q.question.trim())
    const payload = {
      ...form,
      exercises: validQuestions,
    }

    try {
      if (isEditing) {
        await api.put(ENDPOINTS.words.update, { path: { id }, data: payload })
        toast.success(`Đã cập nhật từ "${form.word}"`)
      } else {
        await api.post(ENDPOINTS.words.create, { data: payload })
        toast.success(`Đã thêm từ mới "${form.word}"`)
      }
      navigate('/app/hoc-lieu/tu-vung')
    } catch (err) {
      console.error(err)
      toast.error(err?.message || 'Lỗi khi lưu từ vựng')
    } finally {
      setIsSaving(false)
    }
  }

  // Phím tắt Ctrl + S để lưu
  useCtrlSave(handleSave, !isSaving)

  const setCustomHeader = useTopbarStore((s) => s.setCustomHeader)
  const clearCustomHeader = useTopbarStore((s) => s.clearCustomHeader)

  useEffect(() => {
    setCustomHeader({
      backLink: '/app/hoc-lieu/tu-vung',
      backText: 'Quay lại Từ vựng',
      title: isEditing ? `Chỉnh sửa từ: "${form.word || 'Đang tải...'}"` : 'Thêm từ vựng mới',
      subtitle: `Kho từ vựng / ${isEditing ? 'Chỉnh sửa' : 'Thêm mới'}`,
      actions: (
        <div className="flex items-center gap-2">
          <Link
            to="/app/hoc-lieu/tu-vung"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Hủy bỏ
          </Link>
          <Button
            type="submit"
            form="vocab-form"
            loading={isSaving}
            size="sm"
            icon={Save}
            title="Lưu từ vựng (Ctrl + S)"
          >
            {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
          </Button>
        </div>
      ),
    })
    return () => clearCustomHeader()
  }, [form.word, isSaving, isEditing, setCustomHeader, clearCustomHeader])

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 pt-2">
      {isLoading ? (
        <LoadingSpinner text="Đang tải thông tin từ vựng..." className="py-32" />
      ) : (
        <form id="vocab-form" onSubmit={handleSave}>
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* ── CỘT TRÁI (LỚN HƠN): THÔNG TIN TỪ VỰNG & VÍ DỤ ── */}
              <div className="lg:col-span-7 rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                    1
                  </span>
                  Thông tin từ vựng
                </h3>
              </div>

              {/* Hàng 1: Từ vựng & Phiên âm IPA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-600">Từ vựng *</label>
                    <button
                      type="button"
                      onClick={() => handleAutoLookup()}
                      disabled={isLookingUp || !form.word.trim()}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 px-2 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="Tra cứu phiên âm, nghĩa và ví dụ từ từ điển"
                    >
                      {isLookingUp ? (
                        <>
                          <Loader2 size={12} className="animate-spin text-brand-600" />
                          <span>Đang tra cứu...</span>
                        </>
                      ) : (
                        <>
                          <BookOpen size={12} className="text-slate-500" />
                          <span>Tra từ điển</span>
                        </>
                      )}
                    </button>
                  </div>
                  <Input
                    value={form.word}
                    onChange={set('word')}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAutoLookup()
                      }
                    }}
                    placeholder="Nhập từ tiếng Anh..."
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <IpaInputField
                    value={form.pronunciation}
                    onChange={(newIpa) => setForm((prev) => ({ ...prev, pronunciation: newIpa }))}
                    sourceWord={form.word}
                    onWordCorrect={(corrected) => setForm((prev) => ({ ...prev, word: corrected }))}
                    placeholder="VD: /ˌser.ənˈdɪp.ɪ.ti/"
                  />
                </div>
              </div>

              {/* Hàng 2: Từ loại & Cấp độ CEFR */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ loại</label>
                  <Select value={form.partOfSpeech} onChange={set('partOfSpeech')}>
                    {PARTS_OF_SPEECH.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                  <Select value={form.cefrLevel} onChange={set('cefrLevel')}>
                    {CEFR_LEVELS.map((l) => (
                      <option key={l} value={l}>
                        Cấp độ {l}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {/* Hàng 3: Nghĩa tiếng Việt & Nghĩa tiếng Anh */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Việt *</label>
                  <Input
                    value={form.vietnameseMeaning}
                    onChange={set('vietnameseMeaning')}
                    placeholder="VD: Tối đa, chăm sóc, sự tình cờ may mắn..."
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">Nghĩa tiếng Anh</label>
                  <Input
                    value={form.englishMeaning}
                    onChange={set('englishMeaning')}
                    placeholder="Định nghĩa tiếng Anh ngắn gọn..."
                  />
                </div>
              </div>

              {/* Hàng 4: Chủ đề (Searchable Dropdown thay thế cho hàng gợi ý cũ) */}
              <div>
                <TopicSelect
                  value={form.topic}
                  onChange={(val) => setForm((prev) => ({ ...prev, topic: val }))}
                  dbTopics={dbTopics}
                />
              </div>

              {/* Phần phân tách Ví dụ & Từ liên quan */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Ví dụ & Từ liên quan
                </h4>

                {/* Hàng 5: Câu ví dụ & Dịch câu ví dụ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-600">Câu ví dụ</label>
                      {form.exampleEn.trim() && (
                        <button
                          type="button"
                          onClick={playExampleAudio}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold cursor-pointer transition-all',
                            isPlayingExample
                              ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-300 animate-pulse'
                              : 'text-slate-500 hover:text-brand-600 hover:bg-slate-50'
                          )}
                          title="Nghe phát âm câu ví dụ"
                        >
                          <Volume2 size={13} className={isPlayingExample ? 'text-brand-600' : 'text-slate-500'} />
                          <span>{isPlayingExample ? 'Đang phát...' : 'Nghe ví dụ'}</span>
                        </button>
                      )}
                    </div>
                    <Input
                      value={form.exampleEn}
                      onChange={set('exampleEn')}
                      placeholder="VD: Finding that job was pure serendipity."
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                      Dịch câu ví dụ
                    </label>
                    <Input
                      value={form.exampleVi}
                      onChange={set('exampleVi')}
                      placeholder="VD: Tìm được việc đó hoàn toàn là may mắn."
                    />
                  </div>
                </div>

                {/* Hàng 6: Từ đồng nghĩa & Từ trái nghĩa */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ đồng nghĩa</label>
                    <Input value={form.synonyms} onChange={set('synonyms')} placeholder="VD: luck, fortune" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Từ trái nghĩa</label>
                    <Input value={form.antonyms} onChange={set('antonyms')} placeholder="VD: misfortune, bad luck" />
                  </div>
                </div>
              </div>
              </div>

              {/* ── CỘT PHẢI: CÂU HỎI BÀI TẬP CỦNG CỐ ── */}
              <div className="lg:col-span-5 rounded-2xl border border-slate-200/90 bg-white shadow-2xs p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold">
                    2
                  </span>
                  Câu hỏi bài tập củng cố
                  <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                    {questions.length}/10
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-2xs"
                >
                  <Plus size={13} />
                  Thêm câu hỏi
                </button>
              </div>

              {questions.length === 0 ? (
                <div
                  onClick={addQuestion}
                  className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-10 text-center text-slate-400 hover:border-brand-300 hover:bg-brand-50/20 transition-colors cursor-pointer"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Plus size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi bài tập</p>
                    <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi trắc nghiệm củng cố từ vựng</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <QuestionCard
                      key={idx}
                      question={q}
                      index={idx}
                      isOpen={openQuestionIdx === idx}
                      onToggle={() => setOpenQuestionIdx(openQuestionIdx === idx ? null : idx)}
                      onChange={(updated) => setQuestions((prev) => prev.map((x, i) => (i === idx ? updated : x)))}
                      onRemove={() => {
                        setQuestions((prev) => prev.filter((_, i) => i !== idx))
                        setOpenQuestionIdx(null)
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">Lưu ý khi tạo câu hỏi củng cố:</p>
                <p className="text-slate-500 leading-relaxed">
                  Nhấp vào ô vuông để chọn đáp án đúng (được đánh dấu màu xanh). Các câu hỏi để trống nội dung sẽ tự động được bỏ qua khi lưu.
                </p>
              </div>
            </div>
          </div>
          </div>
        </form>
      )}
    </div>
  )
}
