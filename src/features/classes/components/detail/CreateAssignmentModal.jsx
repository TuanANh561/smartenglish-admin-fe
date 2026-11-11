import { useEffect, useRef, useState } from 'react'
import {
  BookOpen,
  ClipboardList,
  ExternalLink,
  FileText,
  FolderOpen,
  Loader2,
  Paperclip,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Select from '@/components/ui/Select'
import { api, http } from '@/lib/api'
import { getClassCourseIds } from '../../classCourseHelper'

const ASSIGNMENT_TYPES = [
  { value: 'HOMEWORK', label: 'Bài tập về nhà (Homework)' },
  { value: 'QUIZ', label: 'Bài trắc nghiệm / Đề thi (Quiz)' },
  { value: 'WRITING', label: 'Bài viết luận (Writing)' },
  { value: 'SPEAKING', label: 'Bài luyện nói (Speaking)' },
  { value: 'READING', label: 'Bài đọc hiểu (Reading)' },
  { value: 'LISTENING', label: 'Bài luyện nghe (Listening)' },
  { value: 'VOCAB_DECK', label: 'Bộ từ vựng (Vocabulary)' },
]

const EMPTY_FORM = {
  title: '',
  assignmentType: 'HOMEWORK',
  referenceId: '',
  referenceTitle: '',
  attachmentUrl: '',
  attachmentName: '',
  instructions: '',
  dueDate: '',
  passingScore: 5.0,
  isGraded: true,
}

export default function CreateAssignmentModal({ isOpen, onClose, cls, onCreateAssignment, preset }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [sourceMode, setSourceMode] = useState('system') // 'system' | 'upload'
  const [systemMaterials, setSystemMaterials] = useState([])
  const [loadingMaterials, setLoadingMaterials] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return
    let active = true

    const fetchMaterials = async () => {
      setLoadingMaterials(true)
      try {
        const courseIds = getClassCourseIds(cls?.id, cls?.courseId)
        // Mở từ tab Khóa học → chỉ lấy bài học của đúng khóa đó
        const primaryCourseId = preset?.courseId || courseIds[0] || cls?.courseId || 1

        const [lessonsRes, examsRes, readingsRes, listeningsRes] = await Promise.allSettled([
          api.get('/admin/lessons', { params: { courseId: primaryCourseId } }),
          api.get('/admin/exams', { params: { page: 0, size: 30 } }),
          api.get('/admin/reading-passages', { params: { page: 0, size: 30 } }),
          api.get('/admin/listening-lessons', { params: { page: 0, size: 30 } }),
        ])

        if (!active) return

        const items = []

        const extractList = (res) => {
          if (res.status !== 'fulfilled' || !res.value) return []
          const v = res.value
          if (Array.isArray(v)) return v
          if (Array.isArray(v?.content)) return v.content
          if (Array.isArray(v?.items)) return v.items
          if (Array.isArray(v?.data)) return v.data
          if (Array.isArray(v?.data?.content)) return v.data.content
          return []
        }

        extractList(lessonsRes).forEach((l) => {
          items.push({
            key: `LESSON_${l.id}`,
            id: l.id,
            title: l.titleVi || l.title || l.name || `Bài học #${l.id}`,
            category: 'Bài giảng khóa học',
            // Bài giảng khóa học luôn là HOMEWORK (mobile mở /lesson/:id).
            // READING/LISTENING dành riêng cho bài đọc/bài nghe độc lập, tránh mobile mở nhầm màn hình.
            suggestedType: 'HOMEWORK',
          })
        })

        extractList(examsRes).forEach((ex) => {
          items.push({
            key: `EXAM_${ex.id}`,
            id: ex.id,
            title: ex.title || ex.name || `Đề thi #${ex.id}`,
            category: 'Đề thi & Kiểm tra',
            suggestedType: 'QUIZ',
          })
        })

        extractList(readingsRes).forEach((r) => {
          items.push({
            key: `READING_${r.id}`,
            id: r.id,
            title: r.title || r.titleVi || `Bài đọc #${r.id}`,
            category: 'Bài đọc hiểu',
            suggestedType: 'READING',
          })
        })

        extractList(listeningsRes).forEach((ls) => {
          items.push({
            key: `LISTENING_${ls.id}`,
            id: ls.id,
            title: ls.title || ls.titleVi || `Bài nghe #${ls.id}`,
            category: 'Bài luyện nghe',
            suggestedType: 'LISTENING',
          })
        })

        setSystemMaterials(items)

        // Chọn sẵn bài học được bấm (hoặc bài đầu tiên của khóa) để giáo viên không phải chọn lại
        if (preset?.courseId) {
          const wanted = preset.lesson
            ? items.find((m) => m.key === `LESSON_${preset.lesson.id}`)
            : items.find((m) => m.key.startsWith('LESSON_'))
          if (wanted) {
            setFormData((prev) => ({
              ...prev,
              referenceId: wanted.id,
              referenceTitle: `[${wanted.category}] ${wanted.title}`,
              title: prev.title.trim() ? prev.title : wanted.title,
              assignmentType: wanted.suggestedType,
            }))
          }
        }
      } catch (err) {
        console.warn('Không thể tải danh sách học liệu hệ thống:', err)
      } finally {
        if (active) setLoadingMaterials(false)
      }
    }

    fetchMaterials()
    return () => {
      active = false
    }
  }, [isOpen, cls?.id, cls?.courseId, preset])

  if (!isOpen) return null

  // Đóng modal thì reset form, lần mở sau không dính dữ liệu bài vừa giao
  const handleClose = () => {
    setFormData(EMPTY_FORM)
    setErrors({})
    setSourceMode('system')
    onClose()
  }

  const handleSelectMaterial = (materialKey) => {
    if (!materialKey) {
      setFormData((prev) => ({ ...prev, referenceId: '', referenceTitle: '' }))
      return
    }
    const found = systemMaterials.find((m) => m.key === materialKey)
    if (!found) return

    setFormData((prev) => ({
      ...prev,
      referenceId: found.id,
      referenceTitle: `[${found.category}] ${found.title}`,
      title: prev.title.trim() ? prev.title : found.title,
      assignmentType: found.suggestedType || prev.assignmentType,
    }))
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    setUploadingFile(true)
    const toastId = toast.loading(`Đang tải lên học liệu "${file.name}"...`)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'assignments/materials')

      const res = await http.post('/admin/upload/file', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const fileUrl = res?.data?.url || res?.url
      if (!fileUrl) throw new Error('Không nhận được đường dẫn file từ máy chủ')

      setFormData((prev) => ({
        ...prev,
        attachmentUrl: fileUrl,
        attachmentName: file.name,
        title: prev.title.trim() ? prev.title : file.name.replace(/\.[^/.]+$/, ''),
      }))
      toast.success('Tải lên file học liệu thành công!', { id: toastId })
    } catch (err) {
      console.error('Upload file bài tập thất bại:', err)
      toast.error(err?.message || 'Không thể tải file lên máy chủ', { id: toastId })
    } finally {
      setUploadingFile(false)
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.title.trim()) {
      errs.title = 'Vui lòng nhập tiêu đề bài tập'
    }
    const passing = Number(formData.passingScore)
    if (formData.passingScore === '' || Number.isNaN(passing) || passing < 0 || passing > 10) {
      errs.passingScore = 'Điểm đạt phải từ 0 đến 10'
    }
    if (formData.dueDate && new Date(formData.dueDate) <= new Date()) {
      errs.dueDate = 'Hạn nộp phải ở thời điểm trong tương lai'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSubmitting(true)
    try {
      await onCreateAssignment({
        title: formData.title.trim(),
        assignmentType: formData.assignmentType,
        referenceId: formData.referenceId ? Number(formData.referenceId) : null,
        referenceTitle: formData.referenceTitle || null,
        attachmentUrl: formData.attachmentUrl || null,
        attachmentName: formData.attachmentName || null,
        instructions: formData.instructions?.trim() || null,
        // datetime-local là giờ địa phương → đổi sang ISO UTC, tránh lệch 7 tiếng
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        passingScore: Number(formData.passingScore),
        isGraded: formData.isGraded,
      })
      toast.success('Đã giao bài tập mới cho lớp học!')
      handleClose()
    } catch (err) {
      setErrors({ submit: err?.message || 'Không thể tạo bài tập' })
    } finally {
      setSubmitting(false)
    }
  }

  const materialOptions = [
    { value: '', label: loadingMaterials ? 'Đang tải kho học liệu...' : '-- Chọn bài từ kho học liệu hệ thống --' },
    ...systemMaterials.map((m) => ({
      value: m.key,
      label: `[${m.category}] ${m.title}`,
    })),
  ]

  const selectedMaterialKey =
    systemMaterials.find(
      (m) =>
        String(m.id) === String(formData.referenceId) &&
        formData.referenceTitle === `[${m.category}] ${m.title}`,
    )?.key || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-800">
            <ClipboardList size={18} className="text-brand-600" />
            <h3 className="font-bold text-base">Giao bài tập mới</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {cls?.courseTitle && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-brand-50/70 border border-brand-100 p-3 text-xs text-brand-700">
            <BookOpen size={15} className="shrink-0 text-brand-600" />
            <span>
              Áp dụng theo giáo trình: <strong>{cls.courseTitle}</strong>
            </span>
          </div>
        )}

        {errors.submit && (
          <div className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-200">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* NGUỒN HỌC LIỆU / TÀI LIỆU ĐÍNH KÈM */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-700">
                Học liệu & Tài liệu bài tập
              </span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setSourceMode('system')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    sourceMode === 'system'
                      ? 'bg-navy-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FolderOpen size={12} />
                  <span>Kho học liệu hệ thống</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSourceMode('upload')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    sourceMode === 'upload'
                      ? 'bg-navy-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload size={12} />
                  <span>Tải file lên</span>
                </button>
              </div>
            </div>

            {sourceMode === 'system' ? (
              <div className="space-y-2">
                <Select
                  value={selectedMaterialKey}
                  onChange={(e) => handleSelectMaterial(e.target.value)}
                  size="sm"
                  options={materialOptions}
                />
                {formData.referenceTitle && (
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-brand-200 bg-brand-50/60 px-3 py-1.5 text-xs text-brand-800">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <BookOpen size={13} className="shrink-0 text-brand-600" />
                      <span className="truncate font-medium">{formData.referenceTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, referenceId: '', referenceTitle: '' }))}
                      className="text-slate-400 hover:text-red-500 cursor-pointer shrink-0"
                      title="Bỏ chọn học liệu"
                    >
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.mp3,.wav,.zip"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!formData.attachmentUrl ? (
                  <button
                    type="button"
                    disabled={uploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-white py-4 px-3 text-xs text-slate-600 hover:border-brand-500 hover:bg-brand-50/20 transition-colors cursor-pointer"
                  >
                    {uploadingFile ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-brand-600" />
                        <span className="font-semibold text-brand-600">Đang tải file lên hệ thống...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={18} className="text-slate-400" />
                        <span className="font-semibold text-slate-700">
                          Bấm để chọn file học liệu từ máy tính
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Hỗ trợ PDF, Word (.docx), Audio (.mp3), Hình ảnh (Xem trực tiếp trên Web & Mobile)
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText size={15} className="text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 truncate">
                          {formData.attachmentName || 'Tài liệu đính kèm'}
                        </p>
                        <a
                          href={formData.attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-brand-600 hover:underline"
                        >
                          <span>Mở xem thử file</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-white transition-colors cursor-pointer"
                      >
                        Đổi file
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, attachmentUrl: '', attachmentName: '' }))
                        }
                        className="rounded-lg p-1 text-slate-400 hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                        title="Xóa file đính kèm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề bài tập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="VD: Viết đoạn văn IELTS Task 2 - Topic Environment"
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none ${
                errors.title
                  ? 'border-red-400 bg-red-50/30 focus:border-red-500'
                  : 'border-slate-200 focus:border-brand-500'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Loại bài tập
              </label>
              <Select
                value={formData.assignmentType}
                onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
                size="sm"
                options={ASSIGNMENT_TYPES}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Điểm sàn đạt (Thang 10)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={formData.passingScore}
                onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
              />
              {errors.passingScore && (
                <p className="mt-1 text-xs text-red-500">{errors.passingScore}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hạn chót nộp bài
            </label>
            <input
              type="datetime-local"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none"
            />
            {errors.dueDate && <p className="mt-1 text-xs text-red-500">{errors.dueDate}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hướng dẫn làm bài
            </label>
            <textarea
              rows={3}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Chi tiết yêu cầu, độ dài tối thiểu, cấu trúc bài nộp..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isGraded"
              checked={formData.isGraded}
              onChange={(e) => setFormData({ ...formData, isGraded: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="isGraded" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Tính điểm vào kết quả đánh giá học bạ
            </label>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || uploadingFile}
              className="flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-700 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} strokeWidth={2.25} className="animate-spin shrink-0" />}
              <span>Giao bài tập</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
