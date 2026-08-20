import { useState, useEffect } from 'react'
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Check,
  RotateCw,
  Edit3,
  Trash2,
  Download,
  Layers,
  Info,
  FileSpreadsheet,
  Cpu,
  Database,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { cn } from '@/lib/utils'
import {
  PDF_SAMPLE_FILES,
  MOCK_PARSED_VOCABULARY,
  MOCK_PARSED_GRAMMAR,
  MOCK_PARSED_READING,
  MOCK_PARSED_QUIZ,
} from '@/mocks/data/pdfImportSamples'

const TYPE_CONFIG = {
  vocabulary: {
    title: 'Import Từ Vựng Từ File PDF',
    subtitle: 'Trích xuất tự động từ vựng, phiên âm IPA, nghĩa tiếng Việt & câu ví dụ',
    label: 'Từ vựng',
  },
  grammar: {
    title: 'Import Bài Học Ngữ Pháp Từ File PDF',
    subtitle: 'Trích xuất tự động cấu trúc ngữ pháp, công thức, quy tắc & ví dụ minh họa',
    label: 'Ngữ pháp',
  },
  reading: {
    title: 'Import Bài Đọc Hiểu Từ File PDF',
    subtitle: 'Trích xuất tự động bài đọc hiểu và danh sách câu hỏi trắc nghiệm đính kèm',
    label: 'Bài đọc hiểu',
  },
  quiz: {
    title: 'Import Câu Hỏi Trắc Nghiệm Từ File PDF',
    subtitle: 'Trích xuất tự động ngân hàng câu hỏi, lựa chọn đáp án A/B/C/D & giải thích',
    label: 'Bài kiểm tra',
  },
}

/**
 * DataImportWizardModal - Component Fake Demo Wizard cho luồng Import PDF / Tài liệu bằng AI
 *
 * @param {boolean} open
 * @param {function} onClose
 * @param {string} defaultType - 'vocabulary' | 'grammar' | 'reading' | 'quiz'
 * @param {function} onImportSuccess - (importedItems, type) => void
 */
export default function DataImportWizardModal({
  open,
  onClose,
  defaultType = 'vocabulary',
  onImportSuccess,
}) {
  const [step, setStep] = useState(1) // 1: Upload/Select, 2: AI Parsing, 3: Review Table, 4: Success
  const [importType, setImportType] = useState(defaultType)
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [customFile, setCustomFile] = useState(null)

  // AI Parsing Simulation States
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])

  // Review Table Data State
  const [parsedItems, setParsedItems] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterStatus, setFilterStatus] = useState('all')

  // Inline edit item
  const [editingRow, setEditingRow] = useState(null)

  // Cập nhật importType khi modal mở
  useEffect(() => {
    if (open) {
      setImportType(defaultType)
      const matched = PDF_SAMPLE_FILES.find((f) => f.type === defaultType)
      setSelectedPreset(matched || PDF_SAMPLE_FILES[0])
      setStep(1)
      setProgress(0)
      setLogs([])
      setCustomFile(null)
    }
  }, [open, defaultType])

  // Lấy dữ liệu mock tương ứng với importType
  const getMockDataForType = (type) => {
    switch (type) {
      case 'grammar':
        return MOCK_PARSED_GRAMMAR
      case 'reading':
        return MOCK_PARSED_READING
      case 'quiz':
        return MOCK_PARSED_QUIZ
      case 'vocabulary':
      default:
        return MOCK_PARSED_VOCABULARY
    }
  }

  // Giả lập tiến trình bóc tách bằng AI
  const startAiParsing = () => {
    setStep(2)
    setProgress(0)
    setLogs(['🚀 Đã tải tài liệu vào bộ nhớ tạm...', '📄 Bắt đầu phân tích cấu trúc trang PDF...'])

    const dataset = getMockDataForType(importType)

    const timer1 = setTimeout(() => {
      setProgress(25)
      setLogs((prev) => [
        ...prev,
        '🔍 Chạy AI OCR (Optical Character Recognition) trích xuất văn bản...',
        '📊 Nhận diện các vùng dữ liệu bảng, danh sách và phần ví dụ...',
      ])
    }, 800)

    const timer2 = setTimeout(() => {
      setProgress(60)
      setLogs((prev) => [
        ...prev,
        '🤖 Gọi LLM Structural Engine (Prompting JSON Schema v2.4)...',
        '⚡ Ánh xạ các trường dữ liệu chuẩn hóa...',
      ])
    }, 1800)

    const timer3 = setTimeout(() => {
      setProgress(90)
      setLogs((prev) => [
        ...prev,
        '🛡️ Kiểm tra tính hợp lệ & đối soát trùng lặp với CSDL Smart English...',
        '✅ Hoàn tất bóc tách! Chuyển sang bước kiểm duyệt dữ liệu.',
      ])
    }, 2800)

    const timer4 = setTimeout(() => {
      setProgress(100)
      setParsedItems(dataset)
      setSelectedIds(new Set(dataset.map((item) => item.id)))
      setStep(3)
    }, 3600)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }

  // Lọc dữ liệu trong bảng Review
  const filteredData = parsedItems.filter((item) => {
    if (filterStatus === 'all') return true
    return item.statusVal === filterStatus || item.status === filterStatus
  })

  // Chọn/bỏ chọn tất cả dòng
  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.map((item) => item.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelectRow = (id) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleDeleteRow = (id) => {
    setParsedItems((prev) => prev.filter((item) => item.id !== id))
    const next = new Set(selectedIds)
    next.delete(id)
    setSelectedIds(next)
    toast.success('Đã xóa bản ghi khỏi danh sách xem trước')
  }

  // Xác nhận Import thành công
  const handleConfirmImport = () => {
    const itemsToImport = parsedItems.filter((item) => selectedIds.has(item.id))
    if (itemsToImport.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bản ghi để import!')
      return
    }

    setStep(4)
    if (onImportSuccess) {
      onImportSuccess(itemsToImport, importType)
    }
  }

  if (!open) return null

  const currentConfig = TYPE_CONFIG[importType] || TYPE_CONFIG.vocabulary

  return (
    <Modal
      open={open}
      onClose={onClose}
      showCloseButton={false}
      className="max-w-4xl p-0 overflow-hidden rounded-2xl border border-slate-200"
    >
      {/* Header Modal */}
      <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
            <FileText size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              {currentConfig.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentConfig.subtitle}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Stepper Bar */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-xs max-w-2xl mx-auto">
          <div
            className={cn(
              'flex items-center gap-2 font-semibold',
              step >= 1 ? 'text-brand-600' : 'text-slate-400',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600',
              )}
            >
              1
            </span>
            <span>Chọn Tài Liệu</span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: step >= 2 ? '100%' : '0%' }}
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2 font-semibold',
              step >= 2 ? 'text-brand-600' : 'text-slate-400',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600',
              )}
            >
              2
            </span>
            <span>AI Bóc Tách</span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: step >= 3 ? '100%' : '0%' }}
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2 font-semibold',
              step >= 3 ? 'text-brand-600' : 'text-slate-400',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-600',
              )}
            >
              3
            </span>
            <span>Kiểm Duyệt Bảng</span>
          </div>

          <div className="h-0.5 flex-1 mx-3 bg-slate-200">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: step >= 4 ? '100%' : '0%' }}
            />
          </div>

          <div
            className={cn(
              'flex items-center gap-2 font-semibold',
              step >= 4 ? 'text-emerald-600' : 'text-slate-400',
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold',
                step >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600',
              )}
            >
              4
            </span>
            <span>Hoàn Tất</span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {/* ─── STEP 1: Select File ────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Presets vs File Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Pick Preloaded Demo PDF */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  1. Chọn Mẫu Tệp PDF Có Sẵn (Demo)
                </label>
                <div className="space-y-2.5">
                  {PDF_SAMPLE_FILES.filter((f) => f.type === importType).map((file) => (
                    <div
                      key={file.id}
                      onClick={() => {
                        setSelectedPreset(file)
                        setCustomFile(null)
                      }}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer',
                        selectedPreset?.id === file.id && !customFile
                          ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white',
                      )}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 font-bold text-xs">
                        PDF
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-800 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {file.sampleTitle} · {file.itemCount} bản ghi mẫu
                        </p>
                      </div>
                      <div className="shrink-0 text-xs font-semibold text-slate-400">
                        {file.size}
                      </div>
                    </div>
                  ))}

                  {PDF_SAMPLE_FILES.filter((f) => f.type === importType).length === 0 && (
                    <p className="text-xs text-slate-400 italic">
                      Đang sử dụng mẫu bóc tách mặc định cho loại dữ liệu này.
                    </p>
                  )}
                </div>
              </div>

              {/* Option B: Custom File Upload */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Hoặc Tải Lên Tệp PDF / Word / Excel Của Bạn
                </label>
                <div
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-6 text-center flex flex-col items-center justify-center transition-colors cursor-pointer min-h-[160px]',
                    customFile
                      ? 'border-brand-500 bg-brand-50/30'
                      : 'border-slate-300 hover:border-brand-400 bg-slate-50/50 hover:bg-slate-50',
                  )}
                  onClick={() => {
                    // Simulate custom file select
                    const fakeName = `My_Uploaded_${importType.toUpperCase()}_Document.pdf`
                    setCustomFile({ name: fakeName, size: '3.5 MB' })
                    setSelectedPreset(null)
                    toast.success(`Đã chọn file ${fakeName}`)
                  }}
                >
                  <Upload size={28} className="text-brand-500 mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {customFile ? customFile.name : 'Nhấp hoặc kéo thả file vào đây'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hỗ trợ .PDF, .DOCX, .XLSX, .CSV (Tối đa 25MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 2: AI Parsing Animation Progress ──────────────────── */}
        {step === 2 && (
          <div className="py-8 space-y-6 max-w-lg mx-auto text-center">
            <div className="relative inline-flex items-center justify-center">
              <div className="h-20 w-20 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
              <Sparkles size={28} className="absolute text-brand-600 animate-pulse" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Đang Trích Xuất Dữ Liệu Từ File PDF...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Tệp: <strong>{customFile ? customFile.name : selectedPreset?.name}</strong>
              </p>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Tiến trình xử lý</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-brand-600 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Live Terminal Log */}
            <div className="rounded-xl bg-slate-950 p-4 font-mono text-[11px] text-emerald-400 text-left space-y-1.5 shadow-inner max-h-44 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP 3: Review & Edit Interactive Table ────────────────── */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Lọc theo trạng thái:</span>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    filterStatus === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100',
                  )}
                >
                  Tất cả ({parsedItems.length})
                </button>
                <button
                  onClick={() => setFilterStatus('valid')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    filterStatus === 'valid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
                  )}
                >
                  Hợp lệ (
                  {
                    parsedItems.filter(
                      (i) => i.statusVal === 'valid' || i.status === 'valid',
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setFilterStatus('warning')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    filterStatus === 'warning'
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100',
                  )}
                >
                  Cảnh báo (
                  {
                    parsedItems.filter(
                      (i) => i.statusVal === 'warning' || i.status === 'warning',
                    ).length
                  }
                  )
                </button>
                <button
                  onClick={() => setFilterStatus('error')}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors',
                    filterStatus === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100',
                  )}
                >
                  Cần sửa lỗi (
                  {
                    parsedItems.filter(
                      (i) => i.statusVal === 'error' || i.status === 'error',
                    ).length
                  }
                  )
                </button>
              </div>

              <div className="text-xs text-slate-500 font-semibold">
                Đã chọn: <strong className="text-brand-600">{selectedIds.size}</strong>/
                {parsedItems.length} mục
              </div>
            </div>

            {/* Render Preview Table per Import Type */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          filteredData.length > 0 &&
                          filteredData.every((item) => selectedIds.has(item.id))
                        }
                        onChange={(e) => handleToggleSelectAll(e.target.checked)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                    </th>

                    {/* Dynamic Headers */}
                    {importType === 'vocabulary' && (
                      <>
                        <th className="p-3">Từ vựng (Word)</th>
                        <th className="p-3">Phiên âm IPA</th>
                        <th className="p-3">Nghĩa tiếng Việt</th>
                        <th className="p-3">Ví dụ minh họa</th>
                        <th className="p-3">Chủ đề</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </>
                    )}

                    {importType === 'grammar' && (
                      <>
                        <th className="p-3">Tên bài học ngữ pháp</th>
                        <th className="p-3">Công thức tổng quát</th>
                        <th className="p-3">Cấp độ</th>
                        <th className="p-3">Ví dụ</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </>
                    )}

                    {importType === 'reading' && (
                      <>
                        <th className="p-3">Tiêu đề bài đọc</th>
                        <th className="p-3">Số từ</th>
                        <th className="p-3">Chủ đề</th>
                        <th className="p-3">Số câu hỏi</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </>
                    )}

                    {importType === 'quiz' && (
                      <>
                        <th className="p-3">Nội dung câu hỏi</th>
                        <th className="p-3">Các lựa chọn đáp án</th>
                        <th className="p-3">Đáp án</th>
                        <th className="p-3">Dạng bài</th>
                        <th className="p-3 text-center">Trạng thái</th>
                        <th className="p-3 text-right">Thao tác</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                        Không có mục nào trong danh sách lọc này.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => {
                      const st = item.statusVal || item.status || 'valid'
                      return (
                        <tr
                          key={item.id}
                          className={cn(
                            'hover:bg-slate-50 transition-colors',
                            !selectedIds.has(item.id) && 'opacity-60 bg-slate-50/40',
                          )}
                        >
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedIds.has(item.id)}
                              onChange={() => handleToggleSelectRow(item.id)}
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>

                          {/* VOCABULARY ROW */}
                          {importType === 'vocabulary' && (
                            <>
                              <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                                {item.word}{' '}
                                <span className="text-[10px] text-slate-400 font-normal">
                                  ({item.partOfSpeech})
                                </span>
                              </td>
                              <td className="p-3 font-mono text-slate-600">
                                {item.phonetic || <span className="text-red-500">Thiếu</span>}
                              </td>
                              <td className="p-3 font-medium text-slate-800">
                                {item.vietnameseMeaning}
                              </td>
                              <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">
                                {item.exampleSentence}
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                                  {item.topic}
                                </span>
                              </td>
                            </>
                          )}

                          {/* GRAMMAR ROW */}
                          {importType === 'grammar' && (
                            <>
                              <td className="p-3 font-bold text-slate-900 max-w-xs">
                                {item.title}
                              </td>
                              <td className="p-3 font-mono text-[11px] text-blue-700 max-w-xs">
                                {item.formula}
                              </td>
                              <td className="p-3">
                                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded font-bold">
                                  {item.level}
                                </span>
                              </td>
                              <td className="p-3 text-slate-600 line-clamp-1 max-w-xs">
                                {item.examples?.[0]?.en}
                              </td>
                            </>
                          )}

                          {/* READING ROW */}
                          {importType === 'reading' && (
                            <>
                              <td className="p-3 font-bold text-slate-900 max-w-sm">
                                {item.title}
                              </td>
                              <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                                {item.wordCount} từ
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-700">
                                  {item.topic}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-brand-600 whitespace-nowrap">
                                {item.questions?.length || 0} câu hỏi
                              </td>
                            </>
                          )}

                          {/* QUIZ ROW */}
                          {importType === 'quiz' && (
                            <>
                              <td className="p-3 font-medium text-slate-900 max-w-xs">
                                {item.question}
                              </td>
                              <td className="p-3 text-slate-600 max-w-xs line-clamp-1">
                                {item.options?.join(' | ')}
                              </td>
                              <td className="p-3 font-bold text-emerald-700">
                                Đáp án {item.correctAnswer}
                              </td>
                              <td className="p-3">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                                  {item.skill}
                                </span>
                              </td>
                            </>
                          )}

                          {/* STATUS BADGE */}
                          <td className="p-3 text-center whitespace-nowrap">
                            {st === 'valid' && (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-emerald-200">
                                <CheckCircle2 size={12} /> Hợp lệ
                              </span>
                            )}
                            {st === 'warning' && (
                              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-amber-200">
                                <AlertTriangle size={12} /> Cảnh báo
                              </span>
                            )}
                            {st === 'error' && (
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-semibold text-[11px] border border-red-200">
                                <XCircle size={12} /> Thiếu trường
                              </span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td className="p-3 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleDeleteRow(item.id)}
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Xóa dòng này"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── STEP 4: Success & Ingest Summary ────────────────────────── */}
        {step === 4 && (
          <div className="py-8 space-y-6 max-w-md mx-auto text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Import Dữ Liệu Thành Công!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Đã nạp trực tiếp <strong>{selectedIds.size}</strong> bản ghi mới từ file PDF vào cơ
                sở dữ liệu Smart English.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Tệp nguồn PDF:</span>
                <span className="font-semibold text-slate-800">
                  {customFile ? customFile.name : selectedPreset?.name}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Loại học liệu:</span>
                <span className="font-bold text-brand-600 uppercase">{importType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Số mục đã import thành công:</span>
                <span className="font-bold text-emerald-600">{selectedIds.size} mục</span>
              </div>
            </div>

            <Button
              onClick={onClose}
              className="bg-navy-800 hover:bg-navy-900 text-white font-semibold w-full py-2.5"
            >
              Xem Bản Ghi Vừa Nạp Trong Bảng
            </Button>
          </div>
        )}
      </div>

      {/* Footer Navigation */}
      {step !== 4 && (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              onClick={() => setStep((prev) => Math.max(1, prev - 1))}
              disabled={step === 2}
            >
              Quay lại
            </Button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Hủy bỏ
            </Button>

            {step === 1 && (
              <Button
                size="sm"
                icon={Upload}
                onClick={startAiParsing}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold"
              >
                Bắt đầu trích xuất
              </Button>
            )}

            {step === 3 && (
              <Button
                size="sm"
                icon={Check}
                onClick={handleConfirmImport}
                disabled={selectedIds.size === 0}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Xác nhận Import ({selectedIds.size}) bản ghi
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
