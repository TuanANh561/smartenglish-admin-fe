import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Eye,
  CheckSquare,
  PenLine,
  Shuffle,
  ArrowUpDown,
  HelpCircle,
  Sparkles,
  Award,
  Layers,
  CheckCircle2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import {
  getAdminQuizzes,
  getAdminQuizById,
  createAdminQuiz,
  deleteAdminQuiz,
  addQuestionToQuiz,
  deleteQuestionFromQuiz,
  QUIZ_TYPES,
  QUESTION_TYPES,
} from '../quizServiceApi'

export default function PracticeQuizTab() {
  const [quizzes, setQuizzes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('ALL')
  const [searchTag, setSearchTag] = useState('')

  // View / Detail Drawer
  const [activeQuiz, setActiveQuiz] = useState(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  // Create Quiz Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    quizType: 'GRAMMAR_MINI',
    passingScore: 70,
    maxAttempts: 3,
    tags: 'grammar, mini-test',
    isTemplate: true,
  })
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false)

  // Add Question Modal
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false)
  const [questionForm, setQuestionForm] = useState({
    questionType: 'MULTIPLE_CHOICE',
    skillTag: 'grammar',
    grammarPoint: '',
    questionText: '',
    correctAnswer: 'A',
    explanationVi: '',
    options: [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ],
  })
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

  // Delete Confirm
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadQuizzes = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getAdminQuizzes({
        quizType: selectedType !== 'ALL' ? selectedType : undefined,
        tag: searchTag.trim() || undefined,
      })
      setQuizzes(data)
    } catch {
      toast.error('Không thể tải danh sách bài quiz từ learning-service')
    } finally {
      setIsLoading(false)
    }
  }, [selectedType, searchTag])

  useEffect(() => {
    loadQuizzes()
  }, [loadQuizzes])

  // View Quiz Detail
  const handleOpenDetail = async (quiz) => {
    setIsDetailLoading(true)
    setActiveQuiz(quiz)
    try {
      const detail = await getAdminQuizById(quiz.id)
      setActiveQuiz(detail)
    } catch {
      toast.error('Không thể lấy chi tiết bài quiz')
    } finally {
      setIsDetailLoading(false)
    }
  }

  // Create Quiz Submit
  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    setIsSubmittingQuiz(true)
    try {
      const tagList = createForm.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      await createAdminQuiz({
        quizType: createForm.quizType,
        passingScore: Number(createForm.passingScore) || 70,
        maxAttempts: Number(createForm.maxAttempts) || 3,
        tags: tagList,
        isTemplate: createForm.isTemplate,
        aiGenerated: false,
      })

      toast.success('Tạo bài kiểm tra mới thành công!')
      setIsCreateModalOpen(false)
      loadQuizzes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Tạo bài quiz thất bại')
    } finally {
      setIsSubmittingQuiz(false)
    }
  }

  // Add Question Submit
  const handleAddQuestion = async (e) => {
    e.preventDefault()
    if (!activeQuiz) return
    setIsSubmittingQuestion(true)
    try {
      const payload = {
        questionType: questionForm.questionType,
        skillTag: questionForm.skillTag,
        grammarPoint: questionForm.grammarPoint || questionForm.questionText,
        options: questionForm.options,
        correctAnswer: questionForm.correctAnswer,
        explanationVi: questionForm.explanationVi,
      }

      await addQuestionToQuiz(activeQuiz.id, payload)
      toast.success('Đã thêm câu hỏi vào Quiz thành công!')
      setIsAddQuestionOpen(false)
      setQuestionForm({
        questionType: 'MULTIPLE_CHOICE',
        skillTag: 'grammar',
        grammarPoint: '',
        questionText: '',
        correctAnswer: 'A',
        explanationVi: '',
        options: [
          { key: 'A', text: '' },
          { key: 'B', text: '' },
          { key: 'C', text: '' },
          { key: 'D', text: '' },
        ],
      })
      // Refresh detail
      const updated = await getAdminQuizById(activeQuiz.id)
      setActiveQuiz(updated)
      loadQuizzes()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Thêm câu hỏi thất bại')
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  // Delete Quiz
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await deleteAdminQuiz(deleteTarget.id)
      toast.success(`Đã xóa bài quiz #${deleteTarget.id}`)
      setDeleteTarget(null)
      if (activeQuiz?.id === deleteTarget.id) setActiveQuiz(null)
      loadQuizzes()
    } catch {
      toast.error('Xóa bài quiz thất bại')
    } finally {
      setIsDeleting(false)
    }
  }

  // Question Type Icon helper
  const getQuestionTypeBadge = (type) => {
    switch (type) {
      case 'MULTIPLE_CHOICE':
        return <Badge tone="brand"><CheckSquare size={12} className="mr-1" />Trắc nghiệm</Badge>
      case 'FILL_BLANK':
        return <Badge tone="warning"><PenLine size={12} className="mr-1" />Điền khuyết</Badge>
      case 'MATCHING':
        return <Badge tone="info"><Shuffle size={12} className="mr-1" />Ghép nối</Badge>
      case 'WORD_ORDER':
        return <Badge tone="purple"><ArrowUpDown size={12} className="mr-1" />Sắp xếp từ</Badge>
      default:
        return <Badge tone="neutral"><HelpCircle size={12} className="mr-1" />{type}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      {/* ─── QUIZ TABLE CARD (Toolbar ở đầu table chuẩn Tab 1) ─── */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Toolbar ở đầu table - Ô tìm kiếm không viền (borderless) chuẩn Tab 1 */}
        <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 py-4 border-b border-slate-100">
          {/* Ô tìm kiếm không viền (borderless) */}
          <div className="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-xs xl:max-w-sm">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              placeholder="Lọc theo tag (ví dụ: grammar, toeic)..."
              value={searchTag}
              onChange={(e) => setSearchTag(e.target.value)}
              className="w-full text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
            {searchTag && (
              <button
                type="button"
                onClick={() => setSearchTag('')}
                className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Cụm bộ lọc và nút thao tác */}
          <div className="flex items-center gap-2 shrink-0 flex-nowrap">
            {/* Lọc loại Quiz */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs focus:outline-none cursor-pointer"
            >
              {QUIZ_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Nút Làm mới */}
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              onClick={loadQuizzes}
              className={isLoading ? 'pointer-events-none opacity-60' : ''}
              title="Làm mới danh sách"
            />

            {/* Nút Tạo Quiz mới */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-navy-800 hover:bg-navy-900 px-4 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} />
              <span>Tạo Quiz Mới</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 w-[15%]">Mã Quiz</th>
                <th className="px-4 py-3 w-[20%]">Loại Quiz</th>
                <th className="px-4 py-3 w-[25%]">Nhãn phân loại (Tags)</th>
                <th className="px-3 py-3 text-center w-[12%]">Số câu hỏi</th>
                <th className="px-3 py-3 text-center w-[12%]">Điểm đạt</th>
                <th className="px-3 py-3 text-center w-[8%]">Số lần thi</th>
                <th className="px-4 py-3 text-right w-[8%]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <LoadingSpinner text="Đang tải danh sách bài tập & quiz..." />
                  </td>
                </tr>
              ) : quizzes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                      ⚡
                    </div>
                    <p className="text-sm font-medium text-slate-600">Chưa có bài quiz luyện tập nào</p>
                    <p className="text-xs text-slate-400">
                      Bấm nút &quot;Tạo Quiz Mới&quot; để thêm bài tập luyện tập vào hệ thống
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              quizzes.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => handleOpenDetail(q)}
                  className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                >
                  <td className="px-5 py-3.5 font-semibold text-slate-800">
                    <span className="text-brand-600">#{q.id}</span>
                    {q.isTemplate && (
                      <span className="ml-2 text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                        Template
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 font-medium text-xs">
                    {q.quizType || 'DYNAMIC'}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {q.tags && q.tags.length > 0 ? (
                        q.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">Không có tag</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center font-bold text-slate-800">
                    {(q.questions && q.questions.length > 0) ? q.questions.length : (q.questionCount || 0)} câu
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs text-slate-600 font-medium">
                    {q.passingScore ? `${q.passingScore}%` : '—'}
                  </td>
                  <td className="px-3 py-3.5 text-center text-xs text-slate-600">
                    {q.maxAttempts || 'Không giới hạn'}
                  </td>
                  <td className="px-4 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(q)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="Xem chi tiết & câu hỏi"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(q)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Xóa quiz"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* ─── QUIZ DETAIL & QUESTIONS DRAWER ─── */}
      <Drawer
        open={Boolean(activeQuiz)}
        onClose={() => setActiveQuiz(null)}
        title={`Chi tiết Bài Quiz #${activeQuiz?.id || ''}`}
        className="max-w-2xl"
      >
        {activeQuiz && (
          <div className="space-y-6 text-sm">
            {/* Meta info */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Badge tone="brand">{activeQuiz.quizType}</Badge>
                {activeQuiz.passingScore && (
                  <Badge tone="success">Điểm đạt: {activeQuiz.passingScore}%</Badge>
                )}
                {activeQuiz.maxAttempts && (
                  <Badge tone="neutral">Lượt thi: {activeQuiz.maxAttempts}</Badge>
                )}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddQuestionOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>Thêm câu hỏi</span>
              </Button>
            </div>

            {/* Questions List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Danh sách câu hỏi ({activeQuiz.questions?.length || 0})
                </h4>
              </div>

              {isDetailLoading ? (
                <div className="py-8 text-center">
                  <LoadingSpinner text="Đang tải danh sách câu hỏi..." />
                </div>
              ) : !activeQuiz.questions || activeQuiz.questions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <p className="text-xs text-slate-500">Quiz này chưa có câu hỏi nào.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddQuestionOpen(true)}
                    className="mt-3 text-xs"
                  >
                    + Thêm câu hỏi đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeQuiz.questions.map((q, idx) => (
                    <div
                      key={q.id || idx}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-700 text-xs font-bold">
                            {idx + 1}
                          </span>
                          {getQuestionTypeBadge(q.questionType)}
                          {q.skillTag && (
                            <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {q.skillTag}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            if (window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) {
                              try {
                                await deleteQuestionFromQuiz(activeQuiz.id, q.id)
                                toast.success('Đã xóa câu hỏi')
                                const updated = await getAdminQuizById(activeQuiz.id)
                                setActiveQuiz(updated)
                                loadQuizzes()
                              } catch {
                                toast.error('Xóa câu hỏi thất bại')
                              }
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Xóa câu hỏi"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <p className="text-xs font-semibold text-slate-800">
                        {q.grammarPoint || q.questionText || `Câu hỏi số ${idx + 1}`}
                      </p>

                      {/* Options preview */}
                      {q.options && Array.isArray(q.options) && (
                        <div className="grid grid-cols-2 gap-1.5 pt-1">
                          {q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`text-[11px] px-2.5 py-1.5 rounded-lg border flex items-center justify-between ${
                                opt.key === q.correctAnswer
                                  ? 'border-emerald-200 bg-emerald-50/60 text-emerald-800 font-semibold'
                                  : 'border-slate-100 bg-slate-50/60 text-slate-600'
                              }`}
                            >
                              <span>
                                {opt.key || String.fromCharCode(65 + optIdx)}. {opt.text || opt.label || JSON.stringify(opt)}
                              </span>
                              {opt.key === q.correctAnswer && (
                                <CheckCircle2 size={12} className="text-emerald-600 shrink-0 ml-1" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {q.explanationVi && (
                        <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg italic">
                          💡 {q.explanationVi}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* ─── CREATE QUIZ MODAL ─── */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo Bài Quiz Mới trong learning-service"
        className="max-w-md"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Loại Quiz *</label>
            <select
              value={createForm.quizType}
              onChange={(e) => setCreateForm({ ...createForm, quizType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="GRAMMAR_MINI">Mini Test Ngữ pháp (Grammar Mini)</option>
              <option value="VOCAB_PRACTICE">Luyện tập Từ vựng (Vocab Practice)</option>
              <option value="DYNAMIC">Quiz Tự động sinh (Dynamic AI)</option>
              <option value="PLACEMENT">Kiểm tra đầu vào (Placement)</option>
              <option value="MOCK_TOEIC">Mini Quiz TOEIC (Short Test)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Điểm đạt (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={createForm.passingScore}
                onChange={(e) => setCreateForm({ ...createForm, passingScore: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Số lượt thi tối đa</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={createForm.maxAttempts}
                onChange={(e) => setCreateForm({ ...createForm, maxAttempts: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Tags (cách nhau bởi dấu phẩy)</label>
            <Input
              type="text"
              placeholder="VD: grammar, tenses, b1"
              value={createForm.tags}
              onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmittingQuiz}>
              {isSubmittingQuiz ? 'Đang tạo...' : 'Tạo Quiz'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── ADD QUESTION MODAL ─── */}
      <Modal
        open={isAddQuestionOpen}
        onClose={() => setIsAddQuestionOpen(false)}
        title={`Thêm Câu Hỏi vào Quiz #${activeQuiz?.id || ''}`}
        className="max-w-lg"
      >
        <form onSubmit={handleAddQuestion} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Dạng câu hỏi *</label>
            <select
              value={questionForm.questionType}
              onChange={(e) => setQuestionForm({ ...questionForm, questionType: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="MULTIPLE_CHOICE">Trắc nghiệm 4 lựa chọn (A, B, C, D)</option>
              <option value="FILL_BLANK">Điền khuyết vào chỗ trống (Fill in the Blank)</option>
              <option value="MATCHING">Ghép nối từ với nghĩa tương ứng (Matching)</option>
              <option value="WORD_ORDER">Sắp xếp lại trật tự từ (Word Order)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Nội dung câu hỏi / Điểm ngữ pháp *</label>
            <Textarea
              rows={2}
              value={questionForm.questionText}
              onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
              placeholder="VD: Choose the correct verb form: She _______ to school yesterday."
              required
            />
          </div>

          {/* Options input */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-700">Các lựa chọn đáp án (A, B, C, D)</label>
            {questionForm.options.map((opt, optIdx) => (
              <div key={opt.key} className="flex items-center gap-2">
                <span className="w-5 text-center font-bold text-slate-600">{opt.key}:</span>
                <input
                  type="text"
                  placeholder={
                    questionForm.questionType === 'MATCHING'
                      ? 'VD: Resilient -> Kiên cường'
                      : `Đáp án ${opt.key}`
                  }
                  value={opt.text}
                  onChange={(e) => {
                    const newOpts = [...questionForm.options]
                    newOpts[optIdx].text = e.target.value
                    setQuestionForm({ ...questionForm, options: newOpts })
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-brand-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setQuestionForm({ ...questionForm, correctAnswer: opt.key })}
                  className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                    questionForm.correctAnswer === opt.key
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                  title="Chọn làm đáp án đúng"
                >
                  {questionForm.correctAnswer === opt.key ? '✓ Đúng' : 'Chọn đúng'}
                </button>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Giải thích đáp án (tiếng Việt)</label>
            <Textarea
              rows={2}
              value={questionForm.explanationVi}
              onChange={(e) => setQuestionForm({ ...questionForm, explanationVi: e.target.value })}
              placeholder="Giải thích chi tiết vì sao đáp án này là đúng..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddQuestionOpen(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmittingQuestion}>
              {isSubmittingQuestion ? 'Đang lưu...' : 'Lưu Câu Hỏi'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE CONFIRM DIALOG ─── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa bài Quiz"
        message={`Bạn có chắc muốn xóa bài Quiz #${deleteTarget?.id}? Thao tác này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
        confirmText="Xóa Quiz"
        confirmTone="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  )
}
