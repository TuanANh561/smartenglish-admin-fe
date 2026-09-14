import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  Code2,
  FileQuestion,
  FileText,
  MessageSquare,
  Save,
  Sparkles,
  Video,
  Volume2,
  X,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { generateLessonBlocksWithAi, uploadCourseImage } from '../courseApi'

// Sub-components đã được tách module
import LessonVocabTab from './lesson/LessonVocabTab'
import LessonDialogueTab from './lesson/LessonDialogueTab'
import LessonAiChatDrawer from './lesson/LessonAiChatDrawer'
import LessonQuizTab from './lesson/LessonQuizTab'
import LessonTheoryTab from './lesson/LessonTheoryTab'
import LessonVideoTab from './lesson/LessonVideoTab'
import LessonAttachmentTab from './lesson/LessonAttachmentTab'

/**
 * Trợ giúp trích xuất YouTube Embed URL an toàn
 */
function getYouTubeEmbedUrl(url) {
  if (!url) return null
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`
    }
  } catch {
    return null
  }
  return null
}

/**
 * Modal Soạn Thảo Bài Học (Unit) Đầy Đủ 6 Block Chuẩn:
 * 1. Lý Thuyết
 * 2. Từ Vựng IPA (Dạng Bảng Table)
 * 3. Hội Thoại (Dạng Chat Messenger)
 * 4. Trắc Nghiệm Phản Xạ
 * 5. Video Bài Giảng
 * 6. Tệp Đính Kèm / File
 * Kèm Khung Chat Trợ Lý AI Gemini đặt bên phải modal
 */
export default function QuickLessonModal({
  isOpen,
  onClose,
  lessonModal,
  setLessonModal,
  onSave,
}) {
  const [activeTab, setActiveTab] = useState('theory')
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Tôi là trợ lý sư phạm AI. Hãy nhập chủ đề hoặc yêu cầu bạn muốn tạo cho bài học Unit này (ví dụ: "Gọi món tại nhà hàng", "Phỏng vấn xin việc tiếng Anh", "Thì Quá khứ đơn"). Tôi sẽ tự động phân tích và điền toàn bộ cấu trúc bài học vào biểu mẫu để bạn tùy chỉnh!',
      time: 'Vừa xong',
    },
  ])
  const [jsonRaw, setJsonRaw] = useState('')
  const [jsonError, setJsonError] = useState('')
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [uploadAttachmentMsg, setUploadAttachmentMsg] = useState(null)
  const chatEndRef = useRef(null)
  const attachmentInputRef = useRef(null)

  useEffect(() => {
    if (isAiChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isAiChatOpen])

  if (!isOpen) return null

  // Trích xuất các block hiện tại từ lessonModal
  const blocks = Array.isArray(lessonModal.contentBlocks) ? lessonModal.contentBlocks : []

  const theoryBlock = blocks.find((b) => b.type === 'theory') || {
    type: 'theory',
    title: '',
    content: lessonModal.theoryContent || '',
  }

  const vocabBlock = blocks.find((b) => b.type === 'vocabulary') || {
    type: 'vocabulary',
    items: [],
  }

  const dialogueBlock = blocks.find((b) => b.type === 'dialogue') || {
    type: 'dialogue',
    title: '',
    lines: [],
  }

  const quizBlock = blocks.find((b) => b.type === 'quiz') || {
    type: 'quiz',
    questions: [],
  }

  const videoBlock = blocks.find((b) => b.type === 'video') || {
    type: 'video',
    title: '',
    videoUrl: '',
    durationSeconds: 300,
    notes: '',
  }

  const attachmentBlock = blocks.find((b) => b.type === 'attachment') || {
    type: 'attachment',
    title: '',
    fileUrl: '',
    fileName: '',
    fileSize: '',
  }

  // Cập nhật một block trong mảng contentBlocks
  const updateBlock = (blockType, updatedFields) => {
    let exists = false
    const newBlocks = blocks.map((b) => {
      if (b.type === blockType) {
        exists = true
        return { ...b, ...updatedFields }
      }
      return b
    })

    if (!exists) {
      newBlocks.push({ type: blockType, ...updatedFields })
    }

    setLessonModal((prev) => ({
      ...prev,
      contentBlocks: newBlocks,
    }))
  }

  // --- Handlers gửi tin nhắn chat AI ---
  const handleSendChatMessage = async (presetText) => {
    const promptToSend = (presetText || chatPrompt).trim()
    if (!promptToSend) return

    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    setChatMessages((prev) => [...prev, { role: 'user', text: promptToSend, time: nowStr }])
    setChatPrompt('')
    setIsAiGenerating(true)

    try {
      const result = await generateLessonBlocksWithAi({
        prompt: promptToSend,
        titleVi: lessonModal.titleVi.trim(),
        titleEn: lessonModal.titleEn.trim(),
        lessonType: lessonModal.lessonType,
      })

      if (result) {
        if (result.isValidTopic === false) {
          // KHÔNG ghi đè biểu mẫu hiện tại khi yêu cầu không phải chủ đề giáo dục tiếng Anh!
          const aiMsg = {
            role: 'assistant',
            text:
              result.aiMessage ||
              `Yêu cầu "${promptToSend}" chưa phải là một chủ đề bài học tiếng Anh cụ thể. Bạn vui lòng cung cấp chủ đề hoặc tình huống thực tế (VD: "Gọi món tại nhà hàng", "Phỏng vấn xin việc tiếng Anh", "Thì Quá khứ đơn", "Từ vựng sân bay"...) để tôi hỗ trợ soạn bài nhé!`,
            time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          }
          setChatMessages((prev) => [...prev, aiMsg])
          return
        }

        const blocksToSet = result.contentBlocks || (Array.isArray(result) ? result : [])
        setLessonModal((prev) => ({
          ...prev,
          titleVi: result.titleVi || prev.titleVi,
          titleEn: result.titleEn || prev.titleEn,
          lessonType: result.lessonType || prev.lessonType,
          estimatedMin: result.durationMinutes || prev.estimatedMin || 15,
          xpReward: result.xpReward || prev.xpReward || 30,
          contentBlocks: blocksToSet,
          theoryContent: blocksToSet.find((b) => b.type === 'theory')?.content || prev.theoryContent,
        }))
        setJsonRaw(JSON.stringify(blocksToSet, null, 2))

        const aiMsg = {
          role: 'assistant',
          text:
            result.aiMessage ||
            `Đã soạn thảo hoàn tất bài học theo chủ đề "${promptToSend}"! Tôi đã điền đầy đủ Lý thuyết, Từ vựng, Hội thoại, Trắc nghiệm, Video và Tệp đính kèm vào biểu mẫu bên trái để bạn tùy chỉnh.`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        }
        setChatMessages((prev) => [...prev, aiMsg])
      }
    } catch (err) {
      console.error('Lỗi khi AI sinh block bài học:', err)
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Rất tiếc, đã có sự cố khi kết nối với AI Backend. Bạn có thể kiểm tra lại kết nối mạng hoặc chỉnh sửa bài học thủ công nhé.',
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ])
    } finally {
      setIsAiGenerating(false)
    }
  }

  // --- Handlers cho Attachment (Tệp Đính Kèm) ---
  const handleAttachmentFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMb = file.size / (1024 * 1024)
    const formattedSize =
      sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`

    const fileName = file.name
    const fileTitle = attachmentBlock.title || fileName.replace(/\.[^/.]+$/, '')

    setIsUploadingAttachment(true)
    setUploadAttachmentMsg({ type: 'info', text: `Đang tải tệp "${fileName}" lên hệ thống lưu trữ...` })

    try {
      const res = await uploadCourseImage(file, 'courses/attachments')
      const publicUrl = res.url || res.data?.url || (typeof res === 'string' ? res : '')

      updateBlock('attachment', {
        title: fileTitle,
        fileName: res.originalName || fileName,
        fileUrl: publicUrl,
        fileSize: formattedSize,
      })

      setUploadAttachmentMsg({
        type: 'success',
        text: `Tải tệp "${fileName}" lên thành công! File đã sẵn sàng.`,
      })
    } catch (err) {
      console.error('Lỗi khi tải tệp đính kèm:', err)
      const blobUrl = URL.createObjectURL(file)
      updateBlock('attachment', {
        title: fileTitle,
        fileName: fileName,
        fileUrl: blobUrl,
        fileSize: formattedSize,
      })
      setUploadAttachmentMsg({
        type: 'warning',
        text: `Đã gán tệp tạm trên trình duyệt (${err.message || 'Lưu trữ đám mây chưa kết nối'}). Hãy bổ sung AWS S3 để lưu lâu dài.`,
      })
    } finally {
      setIsUploadingAttachment(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleRemoveAttachment = () => {
    updateBlock('attachment', {
      title: '',
      fileName: '',
      fileUrl: '',
      fileSize: '',
    })
    setUploadAttachmentMsg(null)
  }

  // --- JSON View & Edit ---
  const handleSwitchToJsonTab = () => {
    setActiveTab('json')
    setJsonRaw(JSON.stringify(blocks, null, 2))
    setJsonError('')
  }

  const handleApplyJson = () => {
    try {
      const parsed = JSON.parse(jsonRaw)
      if (Array.isArray(parsed)) {
        setLessonModal((prev) => ({ ...prev, contentBlocks: parsed }))
        setJsonError('')
        setActiveTab('theory')
      } else {
        setJsonError('JSON phải là một mảng [] chứa các block object.')
      }
    } catch (e) {
      setJsonError(`Cú pháp JSON không hợp lệ: ${e.message}`)
    }
  }

  const ytEmbedUrl = getYouTubeEmbedUrl(videoBlock.videoUrl)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/60 backdrop-blur-xs animate-fade-in">
      <div
        className={`w-full bg-white rounded-2xl shadow-2xl border border-line overflow-hidden flex flex-col max-h-[94vh] transition-all duration-300 animate-scale-up ${
          isAiChatOpen ? 'max-w-7xl w-[96vw]' : 'max-w-5xl'
        }`}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3 bg-gradient-to-r from-slate-50 via-white to-purple-50/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              U{lessonModal.position || 1}
            </div>
            <div>
              <h3 className="font-bold text-navy-900 text-sm">
                {lessonModal.isEdit ? 'Chỉnh Sửa Chi Tiết Bài Học (Unit)' : 'Thêm Bài Học Mới Vào Lộ Trình (Unit)'}
              </h3>
              <p className="text-[11px] text-ink-muted">
                Soạn nội dung: Lý thuyết, Từ vựng, Hội thoại, Trắc nghiệm, Video & Tài liệu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Nút JSON View nổi bật trên Header */}
            <button
              type="button"
              onClick={handleSwitchToJsonTab}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-xs ${
                activeTab === 'json'
                  ? 'bg-slate-900 text-emerald-400 border-slate-700 ring-2 ring-emerald-400/30'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-navy-900'
              }`}
              title="Xem và chỉnh sửa trực tiếp JSON content_blocks"
            >
              <Code2 size={14} />
              <span>JSON View</span>
            </button>

            {/* Nút Bật/Tắt Khung Chat AI */}
            <button
              type="button"
              onClick={() => setIsAiChatOpen((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all shadow-xs ${
                isAiChatOpen
                  ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
              }`}
            >
              <Sparkles size={14} className={isAiGenerating ? 'animate-spin' : ''} />
              <span>{isAiChatOpen ? 'Ẩn Chat AI' : 'AI Hỗ Trợ Soạn Bài'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-900 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Main Body (Left Form + Right AI Chat Drawer) */}
        <div className="flex flex-1 overflow-hidden">
          {/* CỘT TRÁI: FORM BIỂU MẪU CHỈNH SỬA BÀI HỌC */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Form: 2 Hàng Cân Đối */}
            <div className="px-5 py-3 bg-slate-50/80 border-b border-line space-y-2.5 text-xs">
              {/* Hàng 1: Tiêu đề Tiếng Việt & Tiêu đề Tiếng Anh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center gap-1">
                    Tên tiếng Việt <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={lessonModal.titleVi}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, titleVi: e.target.value }))}
                    placeholder="VD: Unit 1: Chào Hỏi & Làm Quen"
                    className="text-xs py-1 h-8 bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Tên tiếng Anh (Tiêu đề phụ)</label>
                  <Input
                    value={lessonModal.titleEn}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, titleEn: e.target.value }))}
                    placeholder="VD: Unit 1: Greetings & Self-Introduction"
                    className="text-xs py-1 h-8 bg-white"
                  />
                </div>
              </div>

              {/* Hàng 2: 4 Cột Cân Đối (Loại Unit, Thứ tự, Thời lượng, Thưởng XP) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Loại Unit / Kỹ năng</label>
                  <Select
                    value={lessonModal.lessonType}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, lessonType: e.target.value }))}
                    className="text-xs py-1 h-8 bg-white"
                  >
                    <option value="VOCABULARY">Từ vựng (Vocab)</option>
                    <option value="GRAMMAR">Ngữ pháp (Grammar)</option>
                    <option value="LISTENING">Luyện nghe (Listen)</option>
                    <option value="READING">Luyện đọc (Read)</option>
                    <option value="SPEAKING">Luyện nói AI (Speak)</option>
                    <option value="VIDEO">Video bài giảng</option>
                    <option value="DOCUMENT">Tài liệu / File</option>
                    <option value="MIXED">Tổng hợp</option>
                  </Select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Thứ tự Unit</label>
                  <Input
                    type="number"
                    min={1}
                    value={lessonModal.position}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, position: Number(e.target.value) || 1 }))}
                    className="text-xs py-1 h-8 text-center bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Thời lượng (phút)</label>
                  <Input
                    type="number"
                    min={5}
                    step={5}
                    value={lessonModal.estimatedMin}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, estimatedMin: Number(e.target.value) || 15 }))}
                    className="text-xs py-1 h-8 text-center bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Thưởng XP</label>
                  <Input
                    type="number"
                    min={10}
                    step={5}
                    value={lessonModal.xpReward}
                    onChange={(e) => setLessonModal((prev) => ({ ...prev, xpReward: Number(e.target.value) || 30 }))}
                    className="text-xs py-1 h-8 text-center bg-white font-semibold text-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Navigation Tabs (Hỗ trợ 6 Blocks + 7. JSON View) */}
            <div className="flex items-center gap-0.5 px-4 pt-1 border-b border-line bg-white overflow-x-auto scrollbar-thin">
              <button
                onClick={() => setActiveTab('theory')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'theory'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <BookOpen size={13} /> 1. Lý Thuyết
              </button>

              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'vocabulary'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <Volume2 size={13} /> 2. Từ Vựng ({vocabBlock.items?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('dialogue')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'dialogue'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <MessageSquare size={13} /> 3. Hội Thoại ({dialogueBlock.lines?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'quiz'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <FileQuestion size={13} /> 4. Trắc Nghiệm ({quizBlock.questions?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'video'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <Video size={13} /> 5. Video
              </button>

              <button
                onClick={() => setActiveTab('attachment')}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === 'attachment'
                    ? 'border-brand-600 text-brand-600'
                    : 'border-transparent text-ink-muted hover:text-slate-700'
                }`}
              >
                <FileText size={13} /> 6. Tệp Đính Kèm {attachmentBlock.fileUrl ? '(1)' : ''}
              </button>
            </div>

            {/* Tab Contents: Render qua các Sub-Component đã tách */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* TAB 1: THEORY */}
              {activeTab === 'theory' && (
                <LessonTheoryTab
                  theoryBlock={theoryBlock}
                  updateBlock={updateBlock}
                  setLessonModal={setLessonModal}
                />
              )}

              {/* TAB 2: VOCABULARY (Dạng Table Bảng biểu) */}
              {activeTab === 'vocabulary' && (
                <LessonVocabTab
                  vocabBlock={vocabBlock}
                  updateBlock={updateBlock}
                />
              )}

              {/* TAB 3: DIALOGUE (Dạng Chat Messenger) */}
              {activeTab === 'dialogue' && (
                <LessonDialogueTab
                  dialogueBlock={dialogueBlock}
                  updateBlock={updateBlock}
                />
              )}

              {/* TAB 4: QUIZ */}
              {activeTab === 'quiz' && (
                <LessonQuizTab
                  quizBlock={quizBlock}
                  updateBlock={updateBlock}
                />
              )}

              {/* TAB 5: VIDEO BÀI GIẢNG */}
              {activeTab === 'video' && (
                <LessonVideoTab
                  videoBlock={videoBlock}
                  updateBlock={updateBlock}
                  ytEmbedUrl={ytEmbedUrl}
                />
              )}

              {/* TAB 6: TỆP ĐÍNH KÈM / FILE */}
              {activeTab === 'attachment' && (
                <LessonAttachmentTab
                  attachmentBlock={attachmentBlock}
                  updateBlock={updateBlock}
                  attachmentInputRef={attachmentInputRef}
                  handleAttachmentFileSelect={handleAttachmentFileSelect}
                  handleRemoveAttachment={handleRemoveAttachment}
                  isUploadingAttachment={isUploadingAttachment}
                  uploadAttachmentMsg={uploadAttachmentMsg}
                />
              )}

              {/* TAB 7: RAW JSON VIEW */}
              {activeTab === 'json' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-muted">
                      Chuỗi JSON lưu trữ trực tiếp vào cột `content_blocks` (PostgreSQL JSONB):
                    </span>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleApplyJson}
                      className="text-xs h-7.5"
                    >
                      Áp dụng JSON vào biểu mẫu
                    </Button>
                  </div>

                  <textarea
                    rows={13}
                    value={jsonRaw}
                    onChange={(e) => setJsonRaw(e.target.value)}
                    className="w-full rounded-xl border border-line p-3.5 font-mono text-[11px] bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
                  />

                  {jsonError && <p className="text-xs text-rose-600 font-semibold">{jsonError}</p>}
                </div>
              )}
            </div>

            {/* Footer Biểu Mẫu */}
            <div className="flex items-center justify-between border-t border-line px-5 py-3 bg-slate-50">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="chkFreePreview"
                  checked={lessonModal.isFreePreview}
                  onChange={(e) =>
                    setLessonModal((prev) => ({ ...prev, isFreePreview: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                />
                <label
                  htmlFor="chkFreePreview"
                  className="text-xs text-navy-800 font-medium cursor-pointer select-none"
                >
                  Học thử miễn phí (Free Preview)
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={onClose} disabled={lessonModal.isSaving}>
                  Hủy
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={Save}
                  onClick={onSave}
                  disabled={lessonModal.isSaving || !lessonModal.titleVi?.trim()}
                >
                  {lessonModal.isSaving ? 'Đang lưu...' : 'Lưu bài học vào CSDL'}
                </Button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: KHUNG TRỢ LÝ AI CHAT DRAWER (Sub-component) */}
          <LessonAiChatDrawer
            isOpen={isAiChatOpen}
            onClose={() => setIsAiChatOpen(false)}
            chatMessages={chatMessages}
            chatPrompt={chatPrompt}
            setChatPrompt={setChatPrompt}
            onSendMessage={handleSendChatMessage}
            isAiGenerating={isAiGenerating}
            chatEndRef={chatEndRef}
          />
        </div>
      </div>
    </div>
  )
}
