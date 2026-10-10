import { useState } from 'react'
import {
  Upload,
  FileJson,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Clock,
  Layers,
  Zap,
  Loader2,
  Sparkles,
  Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { createExam } from '../examApi'

const PRESET_LIST = [
  {
    id: 'ets-2024-06',
    title: 'ETS TOEIC 2024 - Test 06',
    fileName: 'toeic_ets_2024_test_06.json',
    badge: 'Mới nhất 2024',
    questionsCount: 200,
    duration: 120,
    desc: 'Đề thi chuẩn ETS 200 câu số 06 đầy đủ Audio, hình ảnh, bài đọc và đáp án chi tiết',
  },
  {
    id: 'ets-2024-05',
    title: 'ETS TOEIC 2024 - Test 05',
    fileName: 'toeic_ets_2024_test_05.json',
    badge: 'Chuẩn ETS',
    questionsCount: 200,
    duration: 120,
    desc: 'Đề thi chuẩn ETS 200 câu số 05 với đầy đủ Audio, lời thoại đa giọng Nam - Nữ và giải thích chi tiết',
  },
  {
    id: 'ets-2024-04',
    title: 'ETS TOEIC 2024 - Test 04',
    fileName: 'toeic_ets_2024_test_04.json',
    badge: 'Chuẩn ETS',
    questionsCount: 200,
    duration: 120,
    desc: 'Đề thi chuẩn ETS 200 câu số 04 đầy đủ Audio, hình ảnh, bài đọc và giải thích chi tiết',
  },
  {
    id: 'ets-2024-03',
    title: 'ETS TOEIC 2024 - Test 03',
    fileName: 'toeic_ets_2024_test_03.json',
    badge: 'Chuẩn ETS',
    questionsCount: 200,
    duration: 120,
    desc: 'Đề thi chuẩn ETS 200 câu mới nhất kèm âm thanh, hình ảnh và lời thoại chi tiết',
  },
  {
    id: 'ets-2024-02',
    title: 'ETS TOEIC 2024 - Test 02',
    fileName: 'toeic_ets_2024_test_02.json',
    badge: 'Chuẩn ETS',
    questionsCount: 200,
    duration: 120,
    desc: 'Bộ đề thi chuẩn 200 câu đầy đủ hình ảnh Part 1 và giải thích đáp án',
  },
  {
    id: 'ets-mini-01',
    title: 'TOEIC Mini Test 01',
    fileName: 'toeic_mini_test_01.json',
    badge: 'Rút gọn',
    questionsCount: 50,
    duration: 45,
    desc: 'Đề thi rút gọn 50 câu kiểm tra nhanh 2 kỹ năng Nghe và Đọc',
  },
]

export default function ExamImportModal({ isOpen, onClose, onSuccess }) {
  const [activeTab, setActiveTab] = useState('preset') // 'preset' | 'json'
  const [selectedFile, setSelectedFile] = useState(null)
  const [parsedData, setParsedData] = useState(null)
  const [parseError, setParseError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [selectedPresetId, setSelectedPresetId] = useState('ets-2024-06')
  const [customExamTitle, setCustomExamTitle] = useState('ETS TOEIC 2024 - Test 06')

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setCustomExamTitle(preset.title)
  }

  if (!isOpen) return null

  // Handle JSON file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setParseError(null)
    setParsedData(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result)
        if (!json.title || !Array.isArray(json.questions)) {
          throw new Error('File JSON không đúng cấu trúc đề thi (cần có title và questions).')
        }
        setParsedData(json)
      } catch (err) {
        setParseError(err.message || 'File JSON không hợp lệ.')
      }
    }
    reader.readAsText(file)
  }

  // Pre-load sample file helper
  const handleLoadSample = async (testNum) => {
    setIsSubmitting(true)
    try {
      let fileName = `toeic_ets_2024_test_0${testNum}.json`
      if (testNum === 'mini') fileName = 'toeic_mini_test_01.json'

      const response = await fetch(`/samples/${fileName}`)
      if (!response.ok) {
        throw new Error('Không thể tải file mẫu từ máy chủ.')
      }
      const data = await response.json()
      setParsedData(data)
      toast.success(`Đã nạp file mẫu: ${data.title}! (${data.questions?.length || 0} câu)`)
    } catch (err) {
      toast.error('Không thể tải file mẫu: ' + (err.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit parsed JSON to Backend API
  const handleConfirmImport = async () => {
    if (!parsedData) return
    setIsSubmitting(true)
    try {
      await createExam(parsedData)
      toast.success(`Đã nạp thành công đề thi "${parsedData.title}" (${parsedData.totalQuestions || parsedData.questions.length} câu)!`)
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error('Lỗi khi lưu đề thi vào hệ thống: ' + (err?.message || ''))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Nạp từ kho đề có sẵn
  const handleStartPresetImport = async () => {
    setIsSubmitting(true)
    try {
      const found = PRESET_LIST.find((p) => p.id === selectedPresetId)
      const fileName = found ? found.fileName : 'toeic_ets_2024_test_06.json'

      const response = await fetch(`/samples/${fileName}`)
      if (!response.ok) throw new Error(`Không thể tải dữ liệu đề thi mẫu: ${fileName}`)

      const examData = await response.json()
      if (customExamTitle?.trim()) {
        examData.title = customExamTitle.trim()
      }

      const created = await createExam(examData)
      const count = created.totalQuestions || created.questions?.length || examData.questions?.length

      toast.success(`Đã nạp thành công: "${created.title}" (${count} câu đủ 7 phần)!`)
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('[ImportModal] Error:', err)
      toast.error(err?.response?.data?.message || err?.message || 'Không thể nạp đề thi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4.5 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shadow-xs">
              <Upload size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nhập Đề Thi Vào Ngân Hàng
              </h3>
              <p className="text-xs text-slate-500">
                Thêm đề thi TOEIC chuẩn 200 câu từ kho mẫu hoặc tải lên file JSON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-100 px-6 bg-white gap-6">
          <button
            onClick={() => setActiveTab('preset')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'preset'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles size={16} />
            <span>Kho đề chuẩn có sẵn</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'json'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileJson size={16} />
            <span>Tải lên file JSON</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'preset' ? (
            /* ─── TAB 1: KHO ĐỀ CÓ SẴN ─── */
            <div className="space-y-3.5">
              <div className="space-y-2">
                {PRESET_LIST.map((preset) => {
                  const isSelected = selectedPresetId === preset.id
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/30 ring-1 ring-brand-400'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            isSelected ? 'bg-brand-600 text-white' : 'border border-slate-300 text-transparent'
                          }`}
                        >
                          <Check size={12} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{preset.title}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            <span>{preset.questionsCount} câu</span>
                            <span>&bull;</span>
                            <span>{preset.duration} phút</span>
                            <span>&bull;</span>
                            <span className="text-slate-400 line-clamp-1">{preset.desc}</span>
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100 shrink-0">
                        {preset.badge}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên đề thi hiển thị:
                </label>
                <input
                  type="text"
                  value={customExamTitle}
                  onChange={(e) => setCustomExamTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-brand-500 shadow-2xs"
                  placeholder="Ví dụ: ETS TOEIC 2024 - Test 06"
                />
              </div>
            </div>
          ) : (
            /* ─── TAB 2: TẢI LÊN FILE JSON ─── */
            <div className="space-y-4">
              {/* Dropzone */}
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer bg-slate-50/50">
                <FileJson size={36} className="text-brand-500 mb-2" />
                <span className="text-sm font-bold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Chọn file JSON đề thi TOEIC'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Hỗ trợ file cấu trúc chuẩn .json 200 câu
                </span>
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {/* Sample Files Quick Picker */}
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Dùng nhanh file mẫu:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample(4)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    Test 04
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample(6)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    Test 06
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('mini')}
                    className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shadow-2xs cursor-pointer"
                  >
                    Mini Test
                  </button>
                  <a
                    href="/samples/toeic_ets_2024_test_04.json"
                    download="toeic_sample_200_questions.json"
                    className="px-2 py-1 text-xs font-semibold text-slate-500 hover:text-brand-700 flex items-center gap-1 transition-colors"
                    title="Tải file JSON mẫu về máy tính"
                  >
                    <Download size={13} />
                    Tải file mẫu
                  </a>
                </div>
              </div>

              {/* Parse Error Box */}
              {parseError && (
                <div className="flex items-start gap-2.5 bg-red-50 p-3.5 rounded-xl border border-red-200 text-xs text-red-700">
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Preview Box if Valid */}
              {parsedData && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Dữ liệu hợp lệ ({parsedData.questions?.length || parsedData.totalQuestions} câu)</span>
                  </div>

                  <div className="bg-white rounded-xl p-3.5 border border-slate-100 space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Tên đề thi hiển thị:
                      </label>
                      <input
                        type="text"
                        value={parsedData.title || ''}
                        onChange={(e) => setParsedData({ ...parsedData, title: e.target.value })}
                        className="w-full text-xs font-bold text-slate-900 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-brand-500 shadow-2xs"
                        placeholder="Ví dụ: ETS TOEIC 2024 - Test 06"
                      />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{parsedData.description}</p>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded-md border border-blue-100">
                        {parsedData.category}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md">
                        Cấp độ: {parsedData.cefrLevel || 'B2'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded-md flex items-center gap-1">
                        <Clock size={12} /> {parsedData.durationMinutes || 120} phút
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded-md flex items-center gap-1 border border-emerald-100">
                        <Layers size={12} /> {parsedData.totalQuestions || parsedData.questions?.length} câu hỏi
                      </span>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-md flex items-center gap-1 border border-amber-100">
                        <Zap size={12} /> +{parsedData.xpReward || 150} XP
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-end gap-2.5">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>

          {activeTab === 'json' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirmImport}
              disabled={!parsedData || isSubmitting}
            >
              {isSubmitting ? 'Đang nạp đề...' : 'Xác nhận Nạp đề thi'}
            </Button>
          ) : (
            <button
              type="button"
              onClick={handleStartPresetImport}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} strokeWidth={2.25} className="animate-spin shrink-0" />
                  <span>Đang nạp đề...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Nạp Đề Thi Vào Hệ Thống</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
