import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { createLessonApi } from '../../courseApi'

/**
 * Modal Xuất / Nhập Khung Chương Trình Học Hàng Loạt (Export / Import Modal)
 * Hỗ trợ:
 * - Xuất toàn bộ lộ trình khóa học ra file JSON hoặc sao chép clipboard
 * - Nhập hàng loạt bài học từ file JSON hoặc văn bản mẫu
 * - Tải file JSON Template mẫu
 */
export default function CourseCurriculumExportImportModal({
  isOpen,
  onClose,
  course,
  onImportSuccess,
}) {
  const [activeTab, setActiveTab] = useState('export') // 'export' | 'import'
  const [importText, setImportText] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [parsedPreview, setParsedPreview] = useState(null)
  const [parseError, setParseError] = useState('')

  if (!isOpen || !course) return null

  // Tạo payload export JSON sạch đẹp
  const exportPayload = {
    courseId: course.id,
    courseTitle: course.titleVi || course.title,
    exportedAt: new Date().toISOString(),
    chapters: (course.chapters || []).map((ch, cIdx) => ({
      title: ch.title,
      position: cIdx + 1,
      lessons: (ch.lessons || []).map((l, lIdx) => ({
        titleVi: l.titleVi || l.title,
        titleEn: l.titleEn || l.titleVi || l.title,
        lessonType: l.lessonType || 'VOCABULARY',
        position: l.position || lIdx + 1,
        estimatedMin: l.estimatedMin || 15,
        xpReward: l.xpReward || 30,
        isFreePreview: Boolean(l.isFreePreview),
        contentBlocks: Array.isArray(l.contentBlocks) ? l.contentBlocks : [],
      })),
    })),
  }

  const exportJsonString = JSON.stringify(exportPayload, null, 2)

  // Download file JSON về máy
  const handleDownloadJson = () => {
    try {
      const blob = new Blob([exportJsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `smartenglish_curriculum_course_${course.id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Đã tải file JSON chương trình học về máy!')
    } catch (err) {
      console.error(err)
      toast.error('Không thể tải file!')
    }
  }

  // Copy JSON vào clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonString)
      toast.success('Đã sao chép toàn bộ dữ liệu JSON vào Clipboard!')
    } catch {
      toast.error('Không thể sao chép!')
    }
  }

  // Tải Template JSON mẫu
  const handleDownloadSampleTemplate = () => {
    const sampleData = {
      courseId: course.id,
      chapters: [
        {
          title: 'Chương 1: Giao Tiếp Cơ Bản Hàng Ngày',
          position: 1,
          lessons: [
            {
              titleVi: 'Unit 1: Chào Hỏi & Làm Quen',
              titleEn: 'Unit 1: Greetings & Self-Introduction',
              lessonType: 'VOCABULARY',
              position: 1,
              estimatedMin: 15,
              xpReward: 30,
              isFreePreview: true,
              contentBlocks: [
                {
                  type: 'theory',
                  title: 'Các mẫu câu chào hỏi thông dụng',
                  content: 'Trong tiếng Anh giao tiếp...',
                },
                {
                  type: 'vocabulary',
                  items: [
                    { word: 'Hello', ipa: '/həˈloʊ/', meaningVi: 'Xin chào', exampleEn: 'Hello, how are you?' },
                    { word: 'Nice to meet you', ipa: '/naɪs tuː miːt juː/', meaningVi: 'Rất vui được gặp bạn' },
                  ],
                },
                {
                  type: 'quiz',
                  questions: [
                    {
                      question: 'Chọn câu chào hỏi trang trọng nhất:',
                      options: ['A. Hey', 'B. Good morning', 'C. What\'s up', 'D. Yo'],
                      correctAnswer: 'B',
                      explanation: 'Good morning là lời chào trang trọng.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    }

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'smartenglish_curriculum_template.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Đã tải Template mẫu chuẩn!')
  }

  // Phân tích cú pháp JSON nhập vào
  const handleParseImport = (text) => {
    setImportText(text)
    setParseError('')
    setParsedPreview(null)

    if (!text.trim()) return

    try {
      const parsed = JSON.parse(text)
      let lessonsToImport = []

      // Hỗ trợ cấu trúc có chapters hoặc mảng phẳng lessons
      if (Array.isArray(parsed)) {
        lessonsToImport = parsed
      } else if (Array.isArray(parsed.lessons)) {
        lessonsToImport = parsed.lessons
      } else if (Array.isArray(parsed.chapters)) {
        parsed.chapters.forEach((ch) => {
          if (Array.isArray(ch.lessons)) {
            ch.lessons.forEach((l) => {
              lessonsToImport.push({ ...l, chapterTitle: ch.title })
            })
          }
        })
      }

      if (lessonsToImport.length === 0) {
        setParseError('Không tìm thấy danh sách bài học hợp lệ trong JSON.')
        return
      }

      setParsedPreview(lessonsToImport)
    } catch (err) {
      setParseError(`Lỗi cú pháp JSON: ${err.message}`)
    }
  }

  // Tải file JSON từ máy người dùng lên
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      handleParseImport(event.target.result)
    }
    reader.readAsText(file)
  }

  // Thực thi nhập bài học hàng loạt
  const handleExecuteImport = async () => {
    if (!parsedPreview || parsedPreview.length === 0) {
      toast.error('Không có bài học nào để nhập!')
      return
    }

    setIsImporting(true)
    let successCount = 0
    let failCount = 0

    try {
      const startPos = (course.lessons?.length || 0) + 1

      for (let i = 0; i < parsedPreview.length; i++) {
        const item = parsedPreview[i]
        const payload = {
          courseId: Number(course.id),
          titleVi: item.titleVi || item.title || `Unit ${startPos + i}: Bài học`,
          titleEn: item.titleEn || item.titleVi || `Unit ${startPos + i}: Lesson`,
          lessonType: item.lessonType || 'VOCABULARY',
          position: item.position || (startPos + i),
          estimatedMin: Number(item.estimatedMin) || 15,
          xpReward: Number(item.xpReward) || 30,
          isFreePreview: Boolean(item.isFreePreview),
          contentBlocks: Array.isArray(item.contentBlocks) ? item.contentBlocks : [],
        }

        try {
          await createLessonApi(payload, course.id)
          successCount++
        } catch {
          failCount++
        }
      }

      toast.success(`Đã nhập thành công ${successCount} bài học vào khóa học!`)
      if (failCount > 0) {
        toast.error(`Có ${failCount} bài bị lỗi khi thêm.`)
      }

      if (onImportSuccess) {
        await onImportSuccess()
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Lỗi trong quá trình nhập hàng loạt!')
    } finally {
      setIsImporting(false)
    }
  }

  const totalLessonsInCourse = (course.chapters || []).reduce(
    (sum, ch) => sum + (ch.lessons?.length || 0),
    0,
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-line overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <FileCode size={16} />
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">
                Xuất / Nhập Khung Chương Trình Học
              </h3>
              <p className="text-[11px] text-ink-muted">
                {course.titleVi || course.title} • {totalLessonsInCourse} bài học
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-line px-5 bg-slate-50/70">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download size={14} />
            <span>1. Xuất Chương Trình (Export)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload size={14} />
            <span>2. Nhập Hàng Loạt (Import)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: EXPORT */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-slate-50 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-navy-800 text-xs">
                    Tệp cấu trúc toàn bộ khóa học (JSON Format)
                  </h4>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Copy}
                      onClick={handleCopyJson}
                      className="text-xs h-7"
                    >
                      Sao chép JSON
                    </Button>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Download}
                      onClick={handleDownloadJson}
                      className="text-xs h-7"
                    >
                      Tải file .json về máy
                    </Button>
                  </div>
                </div>
                <p className="text-[11px] text-ink-muted">
                  Bao gồm toàn bộ các chương, các Unit bài học, khối lý thuyết, bảng từ vựng IPA, bài tập trắc nghiệm và video.
                </p>
              </div>

              <textarea
                readOnly
                rows={13}
                value={exportJsonString}
                className="w-full rounded-xl border border-line p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 focus:outline-none select-all"
              />
            </div>
          )}

          {/* TAB 2: IMPORT */}
          {activeTab === 'import' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-blue-900">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} className="text-blue-600 shrink-0" />
                  <span>
                    Nhập nhanh hàng loạt bài học vào khóa học này từ file hoặc chuỗi JSON chuẩn.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  onClick={handleDownloadSampleTemplate}
                  className="text-xs h-7 bg-white"
                >
                  Tải Template mẫu
                </Button>
              </div>

              {/* Upload file JSON */}
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer transition-colors shadow-2xs">
                  <Upload size={14} />
                  <span>Chọn file .json từ máy tính</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-slate-400">hoặc dán trực tiếp JSON vào ô bên dưới:</span>
              </div>

              <textarea
                rows={9}
                value={importText}
                onChange={(e) => handleParseImport(e.target.value)}
                placeholder='Dán chuỗi JSON vào đây... (Ví dụ: [{"titleVi": "Unit 1: Chào hỏi", "lessonType": "VOCABULARY", ...}])'
                className="w-full rounded-xl border border-line p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />

              {parseError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-semibold text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{parseError}</span>
                </div>
              )}

              {/* Preview kết quả phân tích */}
              {parsedPreview && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Tìm thấy {parsedPreview.length} bài học hợp lệ sẵn sàng để nhập:
                    </span>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Upload}
                      onClick={handleExecuteImport}
                      disabled={isImporting}
                      className="text-xs h-7.5 bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isImporting ? 'Đang nhập bài học...' : `Xác nhận nhập ${parsedPreview.length} bài`}
                    </Button>
                  </div>

                  <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                    {parsedPreview.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-1.5 bg-white rounded border border-emerald-100 text-[11px]"
                      >
                        <span className="font-semibold text-slate-800 truncate">
                          {idx + 1}. {item.titleVi || item.title}
                        </span>
                        <span className="text-slate-500 text-[10px] shrink-0 ml-2">
                          {item.lessonType || 'VOCABULARY'} • {item.estimatedMin || 15}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-line px-5 py-3 bg-slate-50">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isImporting}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

