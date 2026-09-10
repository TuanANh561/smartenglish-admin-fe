/**
 * useVocabImport.js
 * Custom hook chứa toàn bộ state và business logic của luồng Import Từ Vựng.
 * Tách ra để VocabImportModal chỉ lo phần render.
 */

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { api, http } from '@/lib/api'
import { PDF_SAMPLE_FILES } from '@/mocks/data/pdfImportSamples'
import { getMockDataForType, parseJsonItems } from '../vocabImportUtils'

/**
 * @param {{ open: boolean, defaultType: string, onClose: function, onImportSuccess: function }} params
 */
export function useVocabImport({ open, defaultType, onClose, onImportSuccess }) {
  // ── Wizard state ────────────────────────────────────────────────────
  const [step, setStep] = useState(1)
  const [importType, setImportType] = useState(defaultType)

  // ── Step 1: upload / json / preset ─────────────────────────────────
  const [uploadMode, setUploadMode] = useState('file')
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [customFile, setCustomFile] = useState(null)
  const [customJsonText, setCustomJsonText] = useState('')
  const [customParsedData, setCustomParsedData] = useState(null)
  const fileInputRef = useRef(null)

  // ── Step 2: AI parsing progress ─────────────────────────────────────
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState([])

  // ── Step 3: review table ─────────────────────────────────────────────
  const [parsedItems, setParsedItems] = useState([])
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingRow, setEditingRow] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ── Step 4: success countdown ────────────────────────────────────────
  const [countdown, setCountdown] = useState(2)

  // ── Effects ─────────────────────────────────────────────────────────

  /** Reset toàn bộ state khi modal mở lại */
  useEffect(() => {
    if (open) {
      setImportType(defaultType)
      const matched = PDF_SAMPLE_FILES.find((f) => f.type === defaultType)
      setSelectedPreset(matched || PDF_SAMPLE_FILES[0])
      setStep(1)
      setProgress(0)
      setLogs([])
      setCustomFile(null)
      setCustomJsonText('')
      setCustomParsedData(null)
      setUploadMode('file')
      setFilterStatus('all')
      setEditingRow(null)
    }
  }, [open, defaultType])

  /** Tự động đóng modal sau khi hoàn thành */
  useEffect(() => {
    if (step === 4) {
      setCountdown(2)
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(timer)
            onClose?.()
            return 0
          }
          return c - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [step, onClose])

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedPreset(null)
    setCustomFile(file)

    if (file.name.endsWith('.json')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result)
          const arr = Array.isArray(parsed) ? parsed : [parsed]
          const items = parseJsonItems(arr)
          setCustomParsedData(items)
          toast.success(`Đã đọc thành công ${items.length} từ vựng từ file ${file.name}`)
        } catch {
          toast.error('File JSON không đúng định dạng cú pháp!')
        }
      }
      reader.readAsText(file)
    } else {
      setCustomParsedData(null)
      toast.success(`Đã chọn file: ${file.name}`)
    }
  }

  const handleClearFile = () => {
    setCustomFile(null)
    setCustomParsedData(null)
  }

  // ── Step 1 → Step 2: Bóc tách AI ─────────────────────────────────────

  const startAiParsing = async () => {
    let dataset = null

    if (uploadMode === 'file') {
      if (!customFile) {
        toast.error('Vui lòng chọn hoặc kéo thả một tệp .JSON hoặc .PDF!')
        return
      }
      // JSON file: customParsedData đã được đọc sẵn trong handleFileChange
      // PDF file: để dataset = null, backend Gemini AI sẽ xử lý
      dataset = customParsedData
    } else if (uploadMode === 'json') {
      if (!customJsonText.trim()) {
        toast.error('Vui lòng dán đoạn mã JSON từ AI vào khung!')
        return
      }
      try {
        const parsed = JSON.parse(customJsonText.trim())
        const arr = Array.isArray(parsed) ? parsed : [parsed]
        dataset = parseJsonItems(arr)
        toast.success(`Đã nhận diện ${dataset.length} từ vựng từ đoạn mã JSON`)
      } catch {
        toast.error('Mã JSON không hợp lệ! Vui lòng kiểm tra lại cấu trúc cú pháp.')
        return
      }
    } else {
      // uploadMode === 'preset'
      if (!selectedPreset) {
        toast.error('Vui lòng chọn một tệp mẫu thử nghiệm!')
        return
      }
      dataset = getMockDataForType(importType, selectedPreset)
    }

    const isPdfUpload = uploadMode === 'file' && customFile && !customFile.name.endsWith('.json')

    if (!isPdfUpload && (!dataset || dataset.length === 0)) {
      toast.error('Không tìm thấy dữ liệu từ vựng hợp lệ để xử lý!')
      return
    }

    setStep(2)
    setProgress(15)
    setLogs(['🚀 Đang nạp dữ liệu vào bộ nhớ...', '📄 Bắt đầu chuẩn bị tài liệu...'])

    // ── TRƯỜNG HỢP 1: Tệp PDF → Gemini AI ────────────────────────────
    if (isPdfUpload) {
      setLogs((prev) => [
        ...prev,
        `📄 Tệp: ${customFile.name} (${(customFile.size / 1024).toFixed(1)} KB)`,
        '🧠 Đang gửi tệp PDF lên Backend để Gemini AI xử lý Multimodal và đối soát CSDL...',
      ])
      setProgress(40)

      const progressTimer = setInterval(() => {
        setProgress((prev) => (prev < 88 ? prev + 3 : prev))
      }, 500)

      let extracted = null
      try {
        const formData = new FormData()
        formData.append('file', customFile)
        const res = await http.post('/admin/words/extract-pdf', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120_000,
        })
        extracted = Array.isArray(res) ? res : (res?.data || [])
      } catch (aiErr) {
        clearInterval(progressTimer)
        console.error('Lỗi khi bóc tách PDF qua Backend AI:', aiErr)
        setProgress(0)
        setLogs((prev) => [
          ...prev,
          `❌ Lỗi khi gửi tệp tới Gemini AI: ${aiErr.message || 'Không thể kết nối Backend'}`,
          '💡 Vui lòng kiểm tra lại kết nối server và thử lại.',
        ])
        toast.error(`Gemini AI không thể bóc tách file: ${aiErr.message || 'Lỗi kết nối'}`, { duration: 5000 })
        setStep(1)
        return
      } finally {
        clearInterval(progressTimer)
      }

      if (extracted && extracted.length > 0) {
        dataset = extracted
        setProgress(95)
        const dupCount = extracted.filter((w) => w.isDuplicate).length
        setLogs((prev) => [
          ...prev,
          `✨ Backend & Gemini AI đã bóc tách thành công ${extracted.length} từ vựng từ tệp PDF!`,
          dupCount > 0
            ? `⚠️ Phát hiện ${dupCount} từ đã tồn tại trong CSDL (đã gắn cờ cảnh báo).`
            : `✅ Toàn bộ ${extracted.length} từ đều mới, không bị trùng lặp trong CSDL.`,
        ])
      } else {
        setProgress(0)
        setLogs((prev) => [
          ...prev,
          '❌ Gemini AI không trích xuất được từ vựng nào từ tệp PDF này.',
          '💡 Hãy thử file PDF khác hoặc kiểm tra nội dung file có chứa từ vựng tiếng Anh không.',
        ])
        toast.error('Gemini AI không trích xuất được từ vựng từ tệp này. Hãy thử file khác!', { duration: 5000 })
        setStep(1)
        return
      }
    } else {
      // ── TRƯỜNG HỢP 2: File JSON hoặc Preset ──────────────────────────
      setProgress(50)
      setLogs((prev) => [
        ...prev,
        '🔍 Nhận diện các vùng từ vựng, phiên âm và định nghĩa song ngữ...',
        '🛡️ Đang kiểm tra đối soát trùng lặp với CSDL Smart English...',
      ])
    }

    setProgress(92)

    // ── Kiểm tra trùng lặp (cho JSON/Preset, PDF đã kiểm tra sẵn ở BE) ──
    try {
      const wordsToCheck = dataset.map((it) => it.word).filter(Boolean)
      if (wordsToCheck.length > 0 && importType === 'vocabulary' && !isPdfUpload) {
        const duplicates = await api.post('/admin/words/check-duplicates', { data: wordsToCheck })
        const dupSet = new Set((duplicates || []).map((w) => String(w).trim().toLowerCase()))

        dataset = dataset.map((item) => {
          if (item.word && dupSet.has(item.word.trim().toLowerCase())) {
            return {
              ...item,
              status: 'warning',
              statusVal: 'warning',
              statusMessage: 'Đã có trong CSDL',
              isDuplicate: true,
            }
          }
          return {
            ...item,
            status: item.status || 'valid',
            statusVal: item.status || 'valid',
            statusMessage: item.statusMessage || 'Hợp lệ',
            isDuplicate: false,
          }
        })
      }
    } catch (err) {
      console.warn('Lỗi khi kiểm tra trùng lặp:', err)
    }

    setProgress(100)
    setLogs((prev) => [...prev, '✅ Hoàn tất chuẩn bị! Đang chuyển sang bảng kiểm duyệt...'])
    setParsedItems(dataset)

    // Không chọn sẵn các từ trùng hoàn toàn (isDuplicate=true)
    const nonBlockedItems = dataset.filter((item) => !item.isDuplicate)
    setSelectedIds(new Set(nonBlockedItems.map((item) => item.id)))

    await new Promise((r) => setTimeout(r, 400))
    setStep(3)

    const dupCount = dataset.filter((item) => item.isDuplicate).length
    if (dupCount > 0) {
      toast(`Phát hiện ${dupCount} từ vựng đã tồn tại trong CSDL (cùng từ loại)!`, {
        icon: '⚠️',
        duration: 4000,
      })
    }
  }

  // ── Step 3: Review table handlers ────────────────────────────────────

  const filteredData = parsedItems.filter((item) => {
    if (filterStatus === 'all') return true
    return item.statusVal === filterStatus || item.status === filterStatus
  })

  const handleToggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(filteredData.filter((item) => !item.isDuplicate).map((item) => item.id)))
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

  // ── Step 3 → Step 4: Confirm import ──────────────────────────────────

  const handleConfirmImport = async () => {
    const itemsToImport = parsedItems.filter((item) => selectedIds.has(item.id))
    if (itemsToImport.length === 0) {
      toast.error('Vui lòng chọn ít nhất một bản ghi để import!')
      return
    }

    if (onImportSuccess) {
      setIsSubmitting(true)
      try {
        await onImportSuccess(itemsToImport, importType)
        setStep(4)
      } catch {
        // Error notification handled in onImportSuccess
      } finally {
        setIsSubmitting(false)
      }
    } else {
      setStep(4)
    }
  }

  return {
    // State
    step, setStep,
    importType, setImportType,
    uploadMode, setUploadMode,
    selectedPreset, setSelectedPreset,
    customFile, setCustomFile,
    customJsonText, setCustomJsonText,
    customParsedData,
    fileInputRef,
    progress,
    logs,
    parsedItems,
    selectedIds,
    filterStatus, setFilterStatus,
    editingRow, setEditingRow,
    isSubmitting,
    countdown,
    filteredData,
    // Handlers
    handleFileChange,
    handleClearFile,
    startAiParsing,
    handleToggleSelectAll,
    handleToggleSelectRow,
    handleDeleteRow,
    handleConfirmImport,
  }
}
