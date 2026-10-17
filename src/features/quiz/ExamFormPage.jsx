import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Image as ImageIcon,
  Layers,
  Plus,
  Radio,
  Save,
  Search,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useTwoLayerAudio } from '@/lib/useTwoLayerAudio'
import toast from 'react-hot-toast'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuthStore } from '@/store/authStore'
import {
  createExam,
  getExamById,
  updateExam,
} from './examApi'
import {
  CEFR_LEVELS,
  EXAM_CATEGORIES,
  PART_NAMES,
  SAMPLE_PART1_IMAGES,
  EMPTY_QUESTION,
} from './examConstants'
import QuestionCard from './components/QuestionCard'

export default function ExamFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isEditing = Boolean(id)
  const audioEngine = useTwoLayerAudio()

  const [isLoading, setIsLoading] = useState(isEditing)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TOEIC_FULL',
    cefrLevel: 'B2',
    durationMinutes: 120,
    passingScore: 550,
    xpReward: 150,
    status: 'published',
  })

  const [questions, setQuestions] = useState([])
  const [expandedMap, setExpandedMap] = useState({ 0: true })
  const [selectedPartFilter, setSelectedPartFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Load existing exam if editing
  useEffect(() => {
    if (!isEditing) return

    let isMounted = true
    setIsLoading(true)

    getExamById(id)
      .then((data) => {
        if (!isMounted || !data) return
        if (
          user &&
          user.role !== 'admin' &&
          ((data.authorEmail && data.authorEmail !== user.email) ||
           (data.createdBy && String(data.createdBy) !== String(user.id)))
        ) {
          toast.error('Bạn không có quyền chỉnh sửa bài thi của người khác!')
          navigate('/app/hoc-lieu/bai-kiem-tra')
          return
        }
        setForm({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'TOEIC_FULL',
          cefrLevel: data.cefrLevel || 'B2',
          durationMinutes: data.durationMinutes ?? 120,
          passingScore: data.passingScore ?? 550,
          xpReward: data.xpReward ?? 150,
          status: data.status || 'published',
        })

        if (Array.isArray(data.questions) && data.questions.length > 0) {
          const mapped = data.questions.map((q, idx) => {
            const rawOpts = Array.isArray(q.options) ? q.options : ['', '', '', '']
            const cleanOpts = rawOpts.map((opt) => {
              if (typeof opt === 'object' && opt !== null) return opt.text || ''
              return String(opt).replace(/^[A-D]\.\s*/, '')
            })
            while (cleanOpts.length < 4) cleanOpts.push('')

            let cIdx = 0
            if (q.correctAnswer) {
              const letterIdx = ['A', 'B', 'C', 'D'].indexOf(String(q.correctAnswer).trim().toUpperCase())
              if (letterIdx >= 0) cIdx = letterIdx
            }

            // Suy luận part mặc định nếu chưa có
            const inferredPart = q.part ? Number(q.part) : (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7)

            return {
              id: q.id || `q-${idx + 1}`,
              questionNumber: q.questionNumber || idx + 1,
              part: inferredPart,
              partName: q.partName || `Part ${inferredPart}`,
              partTitle: q.partTitle || '',
              questionText: q.questionText || q.question || '',
              options: cleanOpts.slice(0, 4),
              correctIndex: cIdx,
              explanation: q.explanation || q.explanationVi || '',
              point: q.point ?? 5,
              imageUrl: q.imageUrl || '',
              audioUrl: q.audioUrl || '',
              audioScript: q.audioScript || '',
              passageText: q.passageText || '',
              groupRangeText: q.groupRangeText || '',
              groupAudioBadge: q.groupAudioBadge || '',
            }
          })
          setQuestions(mapped)
          setExpandedMap({ 0: true })
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài thi:', err)
        toast.error('Không tìm thấy thông tin bài thi')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [id, isEditing])

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const toggleQuestion = (idx) => {
    setExpandedMap((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }))
  }

  const expandAll = () => {
    const nextMap = {}
    questions.forEach((_, i) => {
      nextMap[i] = true
    })
    setExpandedMap(nextMap)
  }

  const collapseAll = () => {
    setExpandedMap({})
  }

  const addQuestion = () => {
    if (questions.length >= 200) {
      toast.error('Tối đa 200 câu hỏi')
      return
    }
    const newIdx = questions.length
    const currentPart = selectedPartFilter !== 'ALL' ? Number(selectedPartFilter) : 5
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION, part: currentPart }])
    setExpandedMap((prev) => ({ ...prev, [newIdx]: true }))
  }

  const handleApplyAudioToGroup = (startIndex, count = 3) => {
    const sourceQ = questions[startIndex]
    if (!sourceQ) return
    const sNum = sourceQ.questionNumber || startIndex + 1
    const endNum = sNum + count - 1
    const defaultGroupText = `Questions ${sNum}-${endNum} refer to the following ${
      Number(sourceQ.part) === 4 ? 'talk' : 'conversation'
    }`

    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i >= startIndex && i < startIndex + count) {
          return {
            ...q,
            audioUrl: sourceQ.audioUrl || q.audioUrl,
            audioScript: sourceQ.audioScript || q.audioScript,
            groupAudioBadge: sourceQ.groupAudioBadge || q.groupAudioBadge,
            groupRangeText: sourceQ.groupRangeText || defaultGroupText,
          }
        }
        return q
      })
    )
    toast.success(`Đã áp dụng âm thanh & kịch bản cho nhóm ${count} câu (${sNum} - ${endNum})!`)
  }

  const handleApplyPassageToGroup = (startIndex, count = 4) => {
    const sourceQ = questions[startIndex]
    if (!sourceQ) return
    const sNum = sourceQ.questionNumber || startIndex + 1
    const endNum = sNum + count - 1
    const defaultGroupText = `Questions ${sNum}-${endNum} refer to the following text`

    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i >= startIndex && i < startIndex + count) {
          return {
            ...q,
            passageText: sourceQ.passageText || q.passageText,
            groupAudioBadge: sourceQ.groupAudioBadge || q.groupAudioBadge,
            groupRangeText: sourceQ.groupRangeText || defaultGroupText,
          }
        }
        return q
      })
    )
    toast.success(`Đã áp dụng đoạn văn đọc hiểu cho nhóm ${count} câu (${sNum} - ${endNum})!`)
  }

  // Pre-calculate group leadership and shared context
  const questionsWithGroupInfo = useMemo(() => {
    let currentAudioLeader = null
    let currentPassageLeader = null
    const result = []

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx]
      const partNum = Number(q.part) || 1
      const qNum = Number(q.questionNumber) || idx + 1
      const prevQ = idx > 0 ? questions[idx - 1] : null
      const prevPart = prevQ ? Number(prevQ.part) : null

      // Audio leader detection (Part 3 & 4)
      let isAudioLead = true
      if (partNum === 3 || partNum === 4) {
        if (
          partNum !== prevPart ||
          idx === 0 ||
          (q.groupRangeText && q.groupRangeText !== prevQ?.groupRangeText) ||
          (q.audioUrl && q.audioUrl !== prevQ?.audioUrl) ||
          (partNum === 3 && (qNum - 32) % 3 === 0) ||
          (partNum === 4 && (qNum - 71) % 3 === 0)
        ) {
          isAudioLead = true
          currentAudioLeader = q
        } else {
          isAudioLead = false
        }
      } else {
        isAudioLead = true
        currentAudioLeader = q
      }

      // Passage leader detection (Part 6 & 7)
      let isPassageLead = true
      if (partNum === 6 || partNum === 7) {
        if (
          partNum !== prevPart ||
          idx === 0 ||
          (q.groupRangeText && q.groupRangeText !== prevQ?.groupRangeText) ||
          (q.passageText && q.passageText !== prevQ?.passageText) ||
          (partNum === 6 && (qNum - 131) % 4 === 0)
        ) {
          isPassageLead = true
          currentPassageLeader = q
        } else {
          isPassageLead = false
        }
      } else {
        isPassageLead = true
        currentPassageLeader = q
      }

      result.push({
        ...q,
        originalIndex: idx,
        isAudioGroupLeader: isAudioLead,
        audioLeaderQuestion: currentAudioLeader,
        isPassageGroupLeader: isPassageLead,
        passageLeaderQuestion: currentPassageLeader,
      })
    }
    return result
  }, [questions])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tên đề thi')
      return
    }

    setIsSaving(true)
    try {
      const formattedQuestions = questionsWithGroupInfo
        .filter((q) => q.questionText?.trim() || q.imageUrl || q.passageText || q.passageLeaderQuestion?.passageText)
        .map((q, idx) => ({
          id: q.id || idx + 1,
          questionNumber: idx + 1,
          part: q.part ? Number(q.part) : (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7),
          partName: q.partName || `Part ${q.part || 1}`,
          partTitle: q.partTitle || '',
          questionText: (q.questionText || '').trim(),
          options: q.options.map((opt, i) => ({
            id: String.fromCharCode(65 + i),
            label: String.fromCharCode(65 + i),
            key: String.fromCharCode(65 + i),
            text: opt.trim(),
          })),
          correctAnswer: String.fromCharCode(65 + (q.correctIndex || 0)),
          explanation: q.explanation?.trim() || '',
          explanationVi: q.explanation?.trim() || '',
          point: q.point ? Number(q.point) : 5,
          imageUrl: q.imageUrl?.trim() || null,
          audioUrl: q.audioUrl?.trim() || q.audioLeaderQuestion?.audioUrl?.trim() || null,
          audioScript: q.audioScript?.trim() || q.audioLeaderQuestion?.audioScript?.trim() || null,
          passageText: q.passageText?.trim() || q.passageLeaderQuestion?.passageText?.trim() || null,
          groupRangeText: q.groupRangeText || q.audioLeaderQuestion?.groupRangeText || q.passageLeaderQuestion?.groupRangeText || null,
          groupAudioBadge: q.groupAudioBadge || q.audioLeaderQuestion?.groupAudioBadge || q.passageLeaderQuestion?.groupAudioBadge || null,
        }))

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || '',
        category: form.category || 'TOEIC_FULL',
        cefrLevel: form.cefrLevel || 'B2',
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 120,
        totalQuestions: formattedQuestions.length,
        passingScore: form.passingScore ? Number(form.passingScore) : 0,
        xpReward: form.xpReward ? Number(form.xpReward) : 150,
        questions: formattedQuestions,
        status: form.status || 'published',
        authorName: user?.displayName || user?.username || (user?.role === 'teacher' ? 'Giáo viên' : 'Quản trị viên Hệ thống'),
        authorEmail: user?.email || '',
        createdBy: user?.id,
      }

      if (isEditing) {
        await updateExam(id, payload)
        toast.success(`Đã cập nhật bài thi "${payload.title}"`)
      } else {
        await createExam(payload)
        toast.success(`Đã tạo bài thi "${payload.title}" thành công!`)
      }
      navigate('/app/hoc-lieu/bai-kiem-tra')
    } catch (err) {
      console.error(err)
      toast.error('Lưu bài thi thất bại: ' + (err.message || ''))
    } finally {
      setIsSaving(false)
    }
  }

  // Count questions by part
  const partCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 }
    questions.forEach((q, idx) => {
      const p = Number(q.part) || (idx < 6 ? 1 : idx < 31 ? 2 : idx < 70 ? 3 : idx < 100 ? 4 : idx < 130 ? 5 : idx < 146 ? 6 : 7)
      if (counts[p] !== undefined) counts[p]++
    })
    return counts
  }, [questions])

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner text="Đang tải dữ liệu bài thi..." />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/app/hoc-lieu/bai-kiem-tra"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {isEditing ? 'Chỉnh sửa bài thi TOEIC / Kiểm tra' : 'Tạo bài thi / Kiểm tra mới'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? `Cập nhật thông tin, hình ảnh Part 1, âm thanh và đoạn văn Part 6, 7 cho đề thi #${id}`
                : 'Thêm mới đề thi chuẩn hóa TOEIC 200 câu hoặc bài kiểm tra định kỳ'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/hoc-lieu/bai-kiem-tra"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Hủy bỏ
          </Link>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Đang lưu...' : isEditing ? 'Lưu thay đổi' : 'Tạo bài thi'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-6">
          {/* Card 1: Thông tin chung bài thi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700 text-xs font-bold">1</span>
              Thông tin cấu hình bài thi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Tên bài thi *</label>
                <Input
                  value={form.title}
                  onChange={set('title')}
                  placeholder="VD: TOEIC Test 1"
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thể loại bài thi</label>
                <Select value={form.category} onChange={set('category')}>
                  {EXAM_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Cấp độ CEFR</label>
                <Select value={form.cefrLevel} onChange={set('cefrLevel')}>
                  {CEFR_LEVELS.map((l) => (
                    <option key={l} value={l}>Cấp độ {l}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Thời gian làm bài (phút)</label>
                <Input
                  type="number"
                  min={1}
                  max={300}
                  value={form.durationMinutes}
                  onChange={set('durationMinutes')}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm đạt yêu cầu</label>
                <Input
                  type="number"
                  min={0}
                  value={form.passingScore}
                  onChange={set('passingScore')}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Điểm thưởng (XP)</label>
                <Input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.xpReward}
                  onChange={set('xpReward')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Mô tả bài thi</label>
                <Textarea
                  rows={2}
                  autoResize
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Mô tả tóm tắt nội dung, cấu trúc và đối tượng bài thi..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">Trạng thái đề thi</label>
                <Select value={form.status} onChange={set('status')}>
                  <option value="published">Đang hoạt động</option>
                  <option value="draft">Bản nháp</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Danh sách câu hỏi */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 text-xs font-bold">2</span>
                <h3 className="text-sm font-bold text-slate-800">
                  Danh sách câu hỏi bài thi
                </h3>
                <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  {questions.length} câu hỏi
                </span>
              </div>

              <div className="flex items-center gap-2">
                {questions.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={expandAll}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> Mở tất cả
                    </button>
                    <button
                      type="button"
                      onClick={collapseAll}
                      className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <EyeOff size={13} /> Thu gọn tất cả
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer shadow-xs"
                >
                  <Plus size={14} /> Thêm câu hỏi
                </button>
              </div>
            </div>

            {/* Part Counts & Filters */}
            {questions.length > 0 && (
              <div className="space-y-3 pt-1">
                {/* Search & Quick Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="relative w-full sm:w-80">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Tìm câu hỏi, số thứ tự, bài đọc..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
                    <span>
                      Đang hiển thị{' '}
                      <strong className="text-slate-800">
                        {
                          questions.filter((q, i) => {
                            if (selectedPartFilter !== 'ALL' && Number(q.part) !== Number(selectedPartFilter)) return false
                            if (searchQuery.trim()) {
                              const numStr = String(q.questionNumber || i + 1)
                              const query = searchQuery.toLowerCase().trim()
                              return (
                                numStr === query ||
                                numStr.includes(query) ||
                                (q.questionText || '').toLowerCase().includes(query) ||
                                (q.passageText || '').toLowerCase().includes(query)
                              )
                            }
                            return true
                          }).length
                        }
                      </strong>{' '}
                      / {questions.length} câu
                    </span>
                  </div>
                </div>

                {/* Part Filter Pills */}
                <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
                  <button
                    type="button"
                    onClick={() => setSelectedPartFilter('ALL')}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      selectedPartFilter === 'ALL'
                        ? 'bg-navy-800 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tất cả ({questions.length})
                  </button>
                  {[
                    { p: 1, label: 'Part 1: Ảnh', icon: ImageIcon },
                    { p: 2, label: 'Part 2: Hỏi-Đáp', icon: Headphones },
                    { p: 3, label: 'Part 3: Hội thoại', icon: Headphones },
                    { p: 4, label: 'Part 4: Bài nói', icon: Headphones },
                    { p: 5, label: 'Part 5: Điền câu', icon: FileText },
                    { p: 6, label: 'Part 6: Điền đoạn', icon: FileText },
                    { p: 7, label: 'Part 7: Đọc hiểu', icon: FileText },
                  ].map(({ p, label, icon: Icon }) => {
                    const count = partCounts[p] || 0
                    const isActive = selectedPartFilter === p
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedPartFilter(p)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-brand-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <Icon size={12} />
                        <span>{label}</span>
                        <span className={`text-[10px] px-1 rounded ${isActive ? 'bg-white/20' : 'bg-slate-200 text-slate-600'}`}>
                          {count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {questions.length === 0 ? (
              <div
                onClick={addQuestion}
                className="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-slate-200 py-12 text-center hover:border-brand-300 hover:bg-brand-50/30 transition-colors cursor-pointer"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <Plus size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Chưa có câu hỏi nào trong đề thi</p>
                  <p className="text-xs text-slate-400 mt-0.5">Nhấn để thêm câu hỏi trắc nghiệm A-B-C-D</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {questionsWithGroupInfo
                  .filter((q) => {
                    if (selectedPartFilter !== 'ALL' && Number(q.part) !== Number(selectedPartFilter)) return false
                    if (searchQuery.trim()) {
                      const numStr = String(q.questionNumber || q.originalIndex + 1)
                      const query = searchQuery.toLowerCase().trim()
                      return (
                        numStr === query ||
                        numStr.includes(query) ||
                        (q.questionText || '').toLowerCase().includes(query) ||
                        (q.passageText || '').toLowerCase().includes(query)
                      )
                    }
                    return true
                  })
                  .map((q, filteredIdx, filteredArr) => {
                    const idx = q.originalIndex
                    const prevQ = idx > 0 ? questions[idx - 1] : null
                    const partNum = Number(q.part) || 1
                    const qNum = Number(q.questionNumber) || idx + 1

                    // Detect cluster start for Listening (Part 3 & 4)
                    const isNewAudioGroup =
                      (partNum === 3 || partNum === 4) &&
                      (filteredIdx === 0 ||
                        (q.groupRangeText && q.groupRangeText !== filteredArr[filteredIdx - 1]?.groupRangeText) ||
                        (q.audioUrl && q.audioUrl !== filteredArr[filteredIdx - 1]?.audioUrl) ||
                        (partNum === 3 && (qNum - 32) % 3 === 0) ||
                        (partNum === 4 && (qNum - 71) % 3 === 0))

                    // Detect cluster start for Reading (Part 6 & 7)
                    const isNewPassageGroup =
                      (partNum === 6 || partNum === 7) &&
                      (filteredIdx === 0 ||
                        (q.groupRangeText && q.groupRangeText !== filteredArr[filteredIdx - 1]?.groupRangeText) ||
                        (q.passageText && q.passageText !== filteredArr[filteredIdx - 1]?.passageText) ||
                        (partNum === 6 && (qNum - 131) % 4 === 0))

                    return (
                      <div key={idx} className="space-y-2">
                        {isNewAudioGroup && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-900 font-semibold shadow-2xs mt-3 mb-1">
                            <div className="flex items-center gap-2">
                              <Headphones size={15} className="text-indigo-600 shrink-0" />
                              <span>
                                {q.groupRangeText ||
                                  `Nhóm bài nghe Part ${partNum} (Câu ${qNum} – ${qNum + 2})`}
                              </span>
                              {q.groupAudioBadge && (
                                <span className="text-[11px] font-normal text-indigo-600 bg-white/90 px-2 py-0.5 rounded-md border border-indigo-200">
                                  {q.groupAudioBadge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {(q.audioUrl || q.audioScript) && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const fallback = q.audioScript || 'Đoạn nghe nhóm ' + qNum
                                    audioEngine.play(`group-banner-${idx}`, { audioUrl: q.audioUrl, fallbackText: fallback })
                                  }}
                                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer border ${
                                    audioEngine.playingId === `group-banner-${idx}`
                                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-500'
                                      : 'bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200'
                                  }`}
                                >
                                  {audioEngine.playingId === `group-banner-${idx}` ? (
                                    <>
                                      <VolumeX size={13} />
                                      <span>Dừng</span>
                                    </>
                                  ) : (
                                    <>
                                      <Volume2 size={13} className="text-indigo-600" />
                                      <span>Nghe</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {isNewPassageGroup && (
                          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-semibold shadow-2xs mt-3 mb-1">
                            <div className="flex items-center gap-2">
                              <FileText size={15} className="text-amber-700 shrink-0" />
                              <span>
                                {q.groupRangeText ||
                                  `Nhóm bài đọc Part ${partNum} (Câu ${qNum} – ${
                                    qNum + (partNum === 6 ? 3 : 2)
                                  })`}
                              </span>
                              {q.groupAudioBadge && (
                                <span className="text-[11px] font-normal text-amber-700 bg-white/90 px-2 py-0.5 rounded-md border border-amber-200">
                                  {q.groupAudioBadge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-medium text-amber-600">
                              Chung 1 đoạn văn ({partNum === 6 ? '4 câu hỏi' : 'nhóm câu'})
                            </span>
                          </div>
                        )}

                        <QuestionCard
                          question={q}
                          index={idx}
                          isOpen={Boolean(expandedMap[idx])}
                          onToggle={() => toggleQuestion(idx)}
                          onChange={(updated) =>
                            setQuestions((prev) => prev.map((x, i) => (i === idx ? updated : x)))
                          }
                          onRemove={() => {
                            setQuestions((prev) => prev.filter((_, i) => i !== idx))
                            setExpandedMap((prev) => {
                              const copy = { ...prev }
                              delete copy[idx]
                              return copy
                            })
                          }}
                          audioEngine={audioEngine}
                          prevQuestion={prevQ}
                          onApplyAudioToGroup={handleApplyAudioToGroup}
                          onApplyPassageToGroup={handleApplyPassageToGroup}
                          isAudioGroupLeader={q.isAudioGroupLeader}
                          audioLeaderQuestion={q.audioLeaderQuestion}
                          isPassageGroupLeader={q.isPassageGroupLeader}
                          passageLeaderQuestion={q.passageLeaderQuestion}
                        />
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
