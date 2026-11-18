import { useRef, useState } from 'react'
import { Check, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import { EXAM_CATEGORIES, createExam, validateExam } from '../examApi'
import { downloadExcelTemplate, readExamFile } from '../examImport'

// Chỉ giữ đề mẫu đã soát đúng cấu trúc; đề lỗi (Test 2, 4, 7) đã gỡ khỏi danh sách.
const PRESET_LIST = [
  { id: 'ets-2024-06', title: 'TOEIC Test 6', fileName: 'toeic_ets_2024_test_06.json', questionsCount: 200, duration: 120 },
  { id: 'ets-2024-05', title: 'TOEIC Test 5', fileName: 'toeic_ets_2024_test_05.json', questionsCount: 200, duration: 120 },
  { id: 'ets-2024-03', title: 'TOEIC Test 3', fileName: 'toeic_ets_2024_test_03.json', questionsCount: 200, duration: 120 },
  { id: 'ets-mini-01', title: 'TOEIC Mini Test 1', fileName: 'toeic_mini_test_01.json', questionsCount: 50, duration: 45 },
]

const ISSUE_PREVIEW = 6

function IssueList({ title, tone, items }) {
  const [expanded, setExpanded] = useState(false)
  if (!items?.length) return null
  const shown = expanded ? items : items.slice(0, ISSUE_PREVIEW)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Badge tone={tone}>{items.length}</Badge>
        <span className="text-sm font-medium text-navy-700">{title}</span>
      </div>
      <ul className="space-y-1 pl-1 text-sm text-ink">
        {shown.map((issue, i) => (
          <li key={`${issue.code}-${i}`} className="leading-snug">{issue.message}</li>
        ))}
      </ul>
      {items.length > ISSUE_PREVIEW && (
        <button type="button" onClick={() => setExpanded((v) => !v)} className="text-sm text-brand-500 hover:underline cursor-pointer">
          {expanded ? 'Thu gọn' : `Xem thêm ${items.length - ISSUE_PREVIEW} mục`}
        </button>
      )}
    </div>
  )
}

function ValidationPanel({ validation, validating, validateError }) {
  if (validating) {
    return (
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Loader2 size={18} strokeWidth={1.75} className="animate-spin text-brand-500" />
        Đang kiểm tra đề...
      </div>
    )
  }
  if (validateError) {
    return (
      <p className="rounded-lg bg-[#FEF3C7] px-3 py-2 text-sm text-[#A16207]">
        Chưa kiểm tra được với máy chủ ({validateError}). Chỉ có thể lưu bản nháp.
      </p>
    )
  }
  if (!validation) return null

  const parts = Object.entries(validation.partCounts || {})
  const answers = Object.entries(validation.answerCounts || {})
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
        <Badge tone={validation.valid ? 'success' : 'danger'}>
          {validation.valid ? 'Đủ điều kiện xuất bản' : 'Còn lỗi, chỉ lưu được bản nháp'}
        </Badge>
        <span>{validation.totalQuestions} câu</span>
        {parts.length > 0 && <span className="text-ink-muted">{parts.map(([p, n]) => `P${p}: ${n}`).join(' · ')}</span>}
      </div>
      {answers.length > 0 && (
        <p className="text-sm text-ink-muted">Phân bố đáp án đúng: {answers.map(([k, n]) => `${k} ${n}`).join(' · ')}</p>
      )}
      <IssueList title="Lỗi cần sửa" tone="danger" items={validation.errors} />
      <IssueList title="Cảnh báo" tone="warning" items={validation.warnings} />
      {validation.duplicates?.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-sm font-medium text-navy-700">Trùng với đề đã có</span>
          <ul className="space-y-1 pl-1 text-sm text-ink">
            {validation.duplicates.map((d) => (
              <li key={d.id}>#{d.id} {d.title} ({d.status === 'published' ? 'đã xuất bản' : 'bản nháp'}): {d.sharedQuestions} câu giống nhau</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ExamImportModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('preset')
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  const [fileName, setFileName] = useState('')
  const [exam, setExam] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [validation, setValidation] = useState(null)
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState(null)
  const [submitting, setSubmitting] = useState(null)
  const requestRef = useRef(0)

  const reset = () => {
    requestRef.current += 1
    setValidating(false)
    setExam(null)
    setLoadError(null)
    setValidation(null)
    setValidateError(null)
  }

  // Chỉ nhận kết quả của lần chọn gần nhất (bấm đề khác khi lần trước chưa xong)
  const runValidation = async (data) => {
    const requestId = ++requestRef.current
    setExam(data)
    setValidation(null)
    setValidateError(null)
    setValidating(true)
    try {
      const result = await validateExam(data)
      if (requestId === requestRef.current) setValidation(result)
    } catch (err) {
      if (requestId === requestRef.current) setValidateError(err?.message || 'lỗi không xác định')
    } finally {
      if (requestId === requestRef.current) setValidating(false)
    }
  }

  const handleSelectPreset = async (preset) => {
    setSelectedPresetId(preset.id)
    reset()
    try {
      const response = await fetch(`/samples/${preset.fileName}`)
      if (!response.ok) throw new Error('Không tải được đề mẫu.')
      const data = await response.json()
      await runValidation({ ...data, title: preset.title })
    } catch (err) {
      setLoadError(err.message)
    }
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFileName(file.name)
    reset()
    try {
      await runValidation(await readExamFile(file))
    } catch (err) {
      setLoadError(err.message || 'Không đọc được file.')
    }
  }

  const handleSave = async (status) => {
    if (!exam || submitting) return
    setSubmitting(status)
    try {
      const created = await createExam({ ...exam, questions: validation?.questions ?? exam.questions, status })
      toast.success(status === 'published'
        ? `Đã nhập và xuất bản "${created.title}"`
        : `Đã lưu bản nháp "${created.title}"`)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err?.message || 'Không lưu được đề thi.')
    } finally {
      setSubmitting(null)
    }
  }

  const switchTab = (tab) => {
    setActiveTab(tab)
    setSelectedPresetId(null)
    setFileName('')
    reset()
  }

  return (
    <Modal open={isOpen} onClose={submitting ? undefined : onClose} title="Nhập đề thi" className="max-w-3xl p-0 [&>div:first-child]:px-6 [&>div:first-child]:pt-5">
      <div className="flex gap-6 border-b border-line px-6">
        {[['preset', 'Đề mẫu có sẵn'], ['file', 'Tải file lên']].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={cn(
              'border-b-2 py-2.5 text-sm font-medium cursor-pointer transition-colors',
              activeTab === key ? 'border-brand-500 text-brand-500' : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="max-h-[65vh] space-y-5 overflow-y-auto px-6 py-5">
        {activeTab === 'preset' ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {PRESET_LIST.map((preset) => {
              const selected = selectedPresetId === preset.id
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg border p-3 text-left cursor-pointer transition-colors',
                    selected ? 'border-brand-500 bg-canvas' : 'border-line hover:border-brand-200',
                  )}
                >
                  <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-transparent')}>
                    <Check size={12} strokeWidth={2} />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-navy-700">{preset.title}</span>
                    <span className="block text-sm text-ink-muted">{preset.questionsCount} câu · {preset.duration} phút</span>
                  </span>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-canvas p-6 hover:border-brand-400">
              <Upload size={18} strokeWidth={1.75} className="text-brand-500" />
              <span className="text-sm font-medium text-navy-700">{fileName || 'Chọn file đề thi'}</span>
              <span className="text-sm text-ink-muted">JSON, Excel (.xlsx, .xls) hoặc CSV</span>
              <input type="file" accept=".json,.xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" icon={FileSpreadsheet} onClick={downloadExcelTemplate}>Tải mẫu Excel</Button>
              <a href="/samples/toeic_ets_2024_test_03.json" download="mau_de_thi.json" className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs text-ink hover:bg-canvas hover:text-brand-500">
                <Download size={18} strokeWidth={1.75} />
                Tải mẫu JSON
              </a>
            </div>
          </div>
        )}

        {loadError && <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{loadError}</p>}

        {exam && (
          <div className="space-y-4 rounded-lg border border-line p-4">
            <div>
              <label className="mb-1 block text-sm text-ink-muted" htmlFor="import-title">Tên đề thi</label>
              <input
                id="import-title"
                value={exam.title || ''}
                onChange={(e) => setExam({ ...exam, title: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-brand-500 focus:outline-none"
              />
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
                <select
                  aria-label="Loại đề"
                  value={exam.category || ''}
                  onChange={(e) => runValidation({ ...exam, category: e.target.value })}
                  className="rounded-lg border border-line px-2 py-1.5 text-sm text-ink focus:border-brand-500 focus:outline-none"
                >
                  {!exam.category && <option value="">Chọn loại đề</option>}
                  {EXAM_CATEGORIES.filter((c) => c.value !== 'ALL').map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <span>{exam.durationMinutes || 120} phút · Trình độ {exam.cefrLevel || 'B1'}</span>
              </div>
            </div>
            <ValidationPanel validation={validation} validating={validating} validateError={validateError} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-line px-6 py-4">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={Boolean(submitting)}>Hủy</Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSave('draft')}
          loading={submitting === 'draft'}
          disabled={!exam || validating || !exam.title?.trim() || !exam.category || Boolean(submitting)}
        >
          Lưu bản nháp
        </Button>
        <Button
          size="sm"
          onClick={() => handleSave('published')}
          loading={submitting === 'published'}
          disabled={!validation?.valid || validating || !exam?.title?.trim() || !exam?.category || Boolean(submitting)}
        >
          Lưu và xuất bản
        </Button>
      </div>
    </Modal>
  )
}
