import { useState, useRef, useEffect } from 'react'
import {
  BookOpen,
  Code2,
  Crown,
  Eye,
  FileQuestion,
  FileText,
  MessageSquare,
  RotateCcw,
  Save,
  Sparkles,
  Video,
  Volume2,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import {
  generateLessonBlocksWithAi,
  uploadCourseImage,
  uploadCourseVideo,
  createLessonApi,
  updateLessonApi,
} from '../../courseApi'

// Sub-components bài học
import LessonVocabTab from '../lesson/LessonVocabTab'
import LessonDialogueTab from '../lesson/LessonDialogueTab'
import LessonAiChatDrawer from '../lesson/LessonAiChatDrawer'
import LessonQuizTab from '../lesson/LessonQuizTab'
import LessonTheoryTab from '../lesson/LessonTheoryTab'
import LessonVideoTab from '../lesson/LessonVideoTab'
import LessonAttachmentTab from '../lesson/LessonAttachmentTab'

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
 * Khu Vực Soạn Thảo / Chỉnh Sửa Bài Học Trực Tiếp Trong Màn Hình Chính (Inline Workspace)
 * Bao gồm:
 * - Form cấu hình bài học (Tên, Loại, Thời lượng, XP, Học thử)
 * - 6 Tab nội dung chi tiết: Lý thuyết, Từ vựng, Hội thoại, Trắc nghiệm, Video, Tệp đính kèm
 * - JSON View trực tiếp
 * - Drawer Chat AI Gemini hỗ trợ soạn bài
 * - Chế độ "Xem trước học viên" (Student Preview)
 */
export default function LessonEditorWorkspace({
  courseId,
  chapterTitle,
  isCreatingNew,
  activeLesson,
  nextPosition = 1,
  onSaveSuccess,
  onCancel,
  setMediaPreview,
}) {
  const [activeTab, setActiveTab] = useState('theory')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // AI Chat State
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [isAiChatOpen, setIsAiChatOpen] = useState(false)
  const [chatPrompt, setChatPrompt] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      text: 'Xin chào! Tôi là trợ lý sư phạm AI. Hãy nhập chủ đề bài học bạn muốn tạo (ví dụ: "Gọi món tại nhà hàng", "Phỏng vấn xin việc", "Thì Hiện tại hoàn thành"). Tôi sẽ tự động phân tích và điền toàn bộ cấu trúc bài học vào biểu mẫu bên trái!',
      time: 'Vừa xong',
    },
  ])

  // JSON Raw View State
  const [jsonRaw, setJsonRaw] = useState('')
  const [jsonError, setJsonError] = useState('')

  // Draft Auto-Save State
  const draftKey = `smartenglish_draft_${courseId}_${isCreatingNew ? 'new' : (activeLesson?.id || 'new')}`
  const [draftBanner, setDraftBanner] = useState(null)

  // Media Upload State
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false)
  const [uploadAttachmentMsg, setUploadAttachmentMsg] = useState(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [uploadVideoProgress, setUploadVideoProgress] = useState(0)
  const [uploadVideoMsg, setUploadVideoMsg] = useState(null)

  const chatEndRef = useRef(null)
  const attachmentInputRef = useRef(null)
  const videoInputRef = useRef(null)

  // Lesson Form Data State
  const [formData, setFormData] = useState({
    titleVi: '',
    titleEn: '',
    lessonType: 'VOCABULARY',
    position: 1,
    estimatedMin: 15,
    xpReward: 30,
    isFreePreview: true,
    theoryContent: '',
    contentBlocks: [],
  })

  // Đồng bộ form khi activeLesson hoặc isCreatingNew thay đổi
  useEffect(() => {
    let initialData = null

    if (isCreatingNew || !activeLesson) {
      initialData = {
        titleVi: `Unit ${nextPosition}: `,
        titleEn: `Unit ${nextPosition}: `,
        lessonType: 'VOCABULARY',
        position: nextPosition,
        estimatedMin: 15,
        xpReward: 30,
        isFreePreview: true,
        theoryContent: '',
        contentBlocks: [],
      }
      setFormData(initialData)
      setActiveTab('theory')
      setIsPreviewMode(false)
      setJsonRaw('[]')
    } else {
      let theory = ''
      const blocks = Array.isArray(activeLesson.contentBlocks) ? activeLesson.contentBlocks : []
      const th = blocks.find((b) => b.type === 'theory')
      if (th) theory = th.content || ''

      initialData = {
        titleVi: activeLesson.titleVi || activeLesson.title || '',
        titleEn: activeLesson.titleEn || activeLesson.title || '',
        lessonType: activeLesson.lessonType || 'VOCABULARY',
        position: activeLesson.position || 1,
        estimatedMin: activeLesson.estimatedMin || 15,
        xpReward: activeLesson.xpReward || 30,
        isFreePreview: Boolean(activeLesson.isFreePreview),
        theoryContent: theory,
        contentBlocks: blocks,
      }
      setFormData(initialData)
      setActiveTab('theory')
      setIsPreviewMode(false)
      setJsonRaw(JSON.stringify(blocks, null, 2))
    }

    // Kiểm tra bản nháp tự động lưu trong localStorage
    try {
      const savedDraftStr = localStorage.getItem(draftKey)
      if (savedDraftStr) {
        const draftObj = JSON.parse(savedDraftStr)
        // Nếu draft khác dữ liệu gốc hoặc có nội dung đang gõ dở
        if (
          draftObj?.formData &&
          draftObj.formData.titleVi !== initialData.titleVi &&
          draftObj.formData.titleVi?.trim()
        ) {
          setDraftBanner({
            savedAt: draftObj.savedAt || 'phiên trước',
            data: draftObj.formData,
          })
        }
      }
    } catch {
      // Ignored
    }
  }, [activeLesson, isCreatingNew, nextPosition, draftKey])

  // Debounce Auto-Save vào localStorage khi formData thay đổi
  useEffect(() => {
    if (!formData.titleVi?.trim()) return

    const timer = setTimeout(() => {
      try {
        const draftPayload = {
          savedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          formData,
        }
        localStorage.setItem(draftKey, JSON.stringify(draftPayload))
      } catch {
        // Ignored if quota exceeded
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [formData, draftKey])

  useEffect(() => {
    if (isAiChatOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isAiChatOpen])

  // Trích xuất các block hiện tại từ formData
  const blocks = Array.isArray(formData.contentBlocks) ? formData.contentBlocks : []

  const theoryBlock = blocks.find((b) => b.type === 'theory') || {
    type: 'theory',
    title: '',
    content: formData.theoryContent || '',
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

  // Cập nhật một block trong contentBlocks
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

    setFormData((prev) => ({
      ...prev,
      contentBlocks: newBlocks,
    }))
  }

  // --- Handlers gửi tin nhắn chat AI Gemini ---
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
        titleVi: formData.titleVi.trim(),
        titleEn: formData.titleEn.trim(),
        lessonType: formData.lessonType,
      })

      if (result) {
        if (result.isValidTopic === false) {
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
        setFormData((prev) => ({
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

  // --- Handlers cho Attachment ---
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
        text: `Đã gán tệp tạm trên trình duyệt (${err.message || 'Lưu trữ đám mây chưa kết nối'}).`,
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

  // --- Handlers cho Video ---
  const handleVideoFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const sizeInMb = file.size / (1024 * 1024)
    const formattedSize =
      sizeInMb >= 1 ? `${sizeInMb.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`

    const fileName = file.name
    const videoTitle = videoBlock.title || fileName.replace(/\.[^/.]+$/, '')

    try {
      const tempVideo = document.createElement('video')
      tempVideo.preload = 'metadata'
      tempVideo.onloadedmetadata = () => {
        window.URL.revokeObjectURL(tempVideo.src)
        const durationSec = Math.round(tempVideo.duration) || 300
        updateBlock('video', { durationSeconds: durationSec })
      }
      tempVideo.src = URL.createObjectURL(file)
    } catch {
      // Ignored
    }

    setIsUploadingVideo(true)
    setUploadVideoProgress(0)
    setUploadVideoMsg({ type: 'info', text: `Đang tải tệp video "${fileName}" lên Cloudflare R2...` })

    try {
      const folder = `courses/${courseId || 'general'}/videos`
      const res = await uploadCourseVideo(file, folder, videoTitle, (percent) => {
        setUploadVideoProgress(percent)
      })

      const publicUrl = res.url || res.data?.url || (typeof res === 'string' ? res : '')

      updateBlock('video', {
        title: videoTitle,
        fileName: res.fileName || fileName,
        fileSize: formattedSize,
        videoUrl: publicUrl,
        isR2: res.isR2 ?? true,
      })

      setUploadVideoMsg({
        type: 'success',
        text: `Tải video "${fileName}" lên Cloudflare R2 thành công (0đ phí băng thông)!`,
      })
    } catch (err) {
      console.error('Lỗi khi tải video lên Cloudflare R2:', err)
      setUploadVideoMsg({
        type: 'warning',
        text: `Không thể tải video: ${err.message || 'Lỗi kết nối'}.`,
      })
    } finally {
      setIsUploadingVideo(false)
      if (videoInputRef.current) {
        videoInputRef.current.value = ''
      }
    }
  }

  const handleRemoveVideo = () => {
    updateBlock('video', {
      videoUrl: '',
      fileName: '',
      fileSize: '',
    })
    setUploadVideoMsg({
      type: 'info',
      text: 'Đã gỡ bỏ video. Khi bạn lưu bài học, hệ thống sẽ tự động dọn rác video cũ trên Cloudflare R2.',
    })
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
        setFormData((prev) => ({ ...prev, contentBlocks: parsed }))
        setJsonError('')
        setActiveTab('theory')
        toast.success('Đã áp dụng cấu trúc JSON vào biểu mẫu!')
      } else {
        setJsonError('JSON phải là một mảng [] chứa các block object.')
      }
    } catch (e) {
      setJsonError(`Cú pháp JSON không hợp lệ: ${e.message}`)
    }
  }

  // --- Handlers Lưu Bài Học ---
  const handleSaveLesson = async () => {
    if (!formData.titleVi?.trim()) {
      toast.error('Vui lòng nhập tên bài học tiếng Việt')
      return
    }

    setIsSaving(true)
    try {
      let finalBlocks = Array.isArray(formData.contentBlocks) ? [...formData.contentBlocks] : []

      if (formData.theoryContent?.trim()) {
        const thIdx = finalBlocks.findIndex((b) => b.type === 'theory')
        if (thIdx >= 0) {
          finalBlocks[thIdx] = {
            ...finalBlocks[thIdx],
            content: formData.theoryContent.trim(),
          }
        } else {
          finalBlocks.unshift({
            type: 'theory',
            title: 'Lý thuyết trọng tâm',
            content: formData.theoryContent.trim(),
          })
        }
      }

      const payload = {
        courseId: Number(courseId),
        titleVi: formData.titleVi.trim(),
        titleEn: formData.titleEn.trim() || formData.titleVi.trim(),
        lessonType: formData.lessonType,
        position: Number(formData.position) || 1,
        estimatedMin: Number(formData.estimatedMin) || 15,
        xpReward: Number(formData.xpReward) || 30,
        isFreePreview: Boolean(formData.isFreePreview),
        contentBlocks: finalBlocks,
      }

      let savedLesson = null
      if (!isCreatingNew && activeLesson?.id) {
        savedLesson = await updateLessonApi(activeLesson.id, payload, courseId)
        toast.success('Cập nhật bài học thành công!')
      } else {
        savedLesson = await createLessonApi(payload, courseId)
        toast.success('Thêm bài học mới thành công!')
      }

      // Xóa bản nháp tự động lưu sau khi đã lưu CSDL thành công
      try {
        localStorage.removeItem(draftKey)
      } catch {
        // Ignored
      }
      setDraftBanner(null)

      if (onSaveSuccess) {
        await onSaveSuccess(savedLesson || payload)
      }
    } catch (err) {
      console.error('Lỗi khi lưu bài học:', err)
      toast.error('Lỗi khi kết nối với máy chủ!')
    } finally {
      setIsSaving(false)
    }
  }

  // --- Keyboard Shortcuts (Ctrl+S lưu bài, Esc đóng AI/Preview) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + S hoặc Cmd + S: Lưu bài học ngay lập tức
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        handleSaveLesson()
      }
      // Phím Esc: Đóng AI Chat Drawer hoặc thoát chế độ xem trước
      if (e.key === 'Escape') {
        if (isAiChatOpen) {
          setIsAiChatOpen(false)
        } else if (isPreviewMode) {
          setIsPreviewMode(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [formData, isAiChatOpen, isPreviewMode])

  const ytEmbedUrl = getYouTubeEmbedUrl(videoBlock.videoUrl)

  return (
    <div className="w-full bg-white rounded-2xl border border-line shadow-xs overflow-hidden flex flex-col transition-all">
      {/* 1. Header Workspace Soạn Thảo */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 bg-slate-50/70">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs shrink-0">
            U{formData.position || 1}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-navy-900 text-sm truncate">
                {isCreatingNew
                  ? `Thêm bài học mới (Unit ${formData.position || 1})`
                  : `Chỉnh sửa: ${formData.titleVi || 'Bài học'}`}
              </h3>
              {formData.isFreePreview ? (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
                  Học thử miễn phí
                </span>
              ) : (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200 flex items-center gap-1">
                  <Crown size={10} /> Premium
                </span>
              )}
            </div>
            <p className="text-[11px] text-ink-muted truncate">
              {chapterTitle ? `Chương: ${chapterTitle}` : 'Soạn thảo nội dung bài học'} • {formData.estimatedMin || 15} phút • +{formData.xpReward || 30} XP
            </p>
          </div>
        </div>

        {/* Action Toolbar trên Header */}
        <div className="flex items-center gap-2">
          {/* Nút Xem trước góc độ học viên */}
          <button
            type="button"
            onClick={() => setIsPreviewMode((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isPreviewMode
                ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-200 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-navy-900'
            }`}
            title="Xem giao diện hiển thị góc độ học viên"
          >
            <Eye size={14} />
            <span>{isPreviewMode ? 'Quay lại soạn thảo' : 'Xem trước học viên'}</span>
          </button>

          {/* Nút JSON View */}
          <button
            type="button"
            onClick={handleSwitchToJsonTab}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              activeTab === 'json' && !isPreviewMode
                ? 'bg-brand-600 text-white border-brand-600 ring-2 ring-brand-200 shadow-2xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-navy-900'
            }`}
            title="Xem và chỉnh sửa trực tiếp JSON content_blocks"
          >
            <Code2 size={14} />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {/* Nút Bật/Tắt Khung Chat AI */}
          <button
            type="button"
            onClick={() => setIsAiChatOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
              isAiChatOpen
                ? 'bg-brand-600 text-white border-brand-600 shadow-2xs ring-2 ring-brand-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-navy-900'
            }`}
          >
            <Sparkles size={14} className={`text-slate-500 ${isAiGenerating ? 'animate-spin' : ''}`} />
            <span>{isAiChatOpen ? 'Ẩn Chat AI' : 'AI Soạn Bài'}</span>
          </button>
        </div>
      </div>

      {/* 2. Thân Workspace: Cột Form + Drawer AI */}
      <div className="flex flex-1 min-h-[580px] overflow-hidden">
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Banner Phát hiện bản nháp chưa lưu (Auto-Saved Draft) */}
          {draftBanner && (
            <div className="mx-5 mt-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-2xs animate-fade-in">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                <span>
                  Khôi phục nội dung bài học chưa lưu trước đó?
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(draftBanner.data)
                    setDraftBanner(null)
                    toast.success('Đã khôi phục bản nháp chưa lưu!')
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[11px] transition-colors cursor-pointer shadow-2xs"
                >
                  Khôi phục
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      localStorage.removeItem(draftKey)
                    } catch {
                      // Ignored
                    }
                    setDraftBanner(null)
                    toast('Đã bỏ qua bản nháp')
                  }}
                  className="px-2 py-1 text-slate-600 hover:text-slate-900 font-medium rounded-lg text-[11px] transition-colors cursor-pointer"
                >
                  Bỏ qua
                </button>
              </div>
            </div>
          )}
          {/* Chế độ Xem Trước Học Viên (Student Preview Mode) */}
          {isPreviewMode ? (
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye size={15} className="text-blue-600 shrink-0" />
                  <span>
                    Chế độ xem trước hiển thị cách bài học <strong>"{formData.titleVi}"</strong> được học viên trải nghiệm trên app & web.
                  </span>
                </div>
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="font-bold underline text-blue-700 hover:text-blue-900 cursor-pointer ml-3 shrink-0"
                >
                  Tiếp tục chỉnh sửa
                </button>
              </div>

              {/* Preview Cards */}
              <div className="space-y-4">
                {/* 1. Lý thuyết */}
                <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-2">
                    <BookOpen size={14} className="text-slate-600" /> 1. Lý thuyết trọng tâm
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap">
                    {formData.theoryContent || theoryBlock?.content || 'Chưa có nội dung lý thuyết.'}
                  </p>
                </div>

                {/* 2. Từ vựng */}
                {vocabBlock.items?.length > 0 && (
                  <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-3">
                      <Volume2 size={14} className="text-slate-600" /> 2. Danh sách từ vựng ({vocabBlock.items.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {vocabBlock.items.map((it, idx) => (
                        <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs">
                          <div className="flex items-baseline justify-between">
                            <span className="font-bold text-navy-900">{it.word}</span>
                            <span className="font-mono text-[11px] text-slate-600">{it.ipa}</span>
                          </div>
                          <p className="text-slate-600 mt-1">{it.meaningVi}</p>
                          {it.exampleEn && (
                            <p className="text-[11px] text-slate-500 italic mt-1">"{it.exampleEn}"</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Hội thoại */}
                {dialogueBlock.lines?.length > 0 && (
                  <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-3">
                      <MessageSquare size={14} className="text-slate-600" /> 3. Hội thoại ({dialogueBlock.lines.length} câu)
                    </h4>
                    <div className="space-y-2">
                      {dialogueBlock.lines.map((l, idx) => (
                        <div key={idx} className="flex gap-2 text-xs">
                          <span className="font-bold text-slate-700 shrink-0">{l.speaker}:</span>
                          <div>
                            <p className="text-slate-800">{l.text}</p>
                            {l.translation && <p className="text-[11px] text-slate-500">{l.translation}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Trắc nghiệm */}
                {quizBlock.questions?.length > 0 && (
                  <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-3">
                      <FileQuestion size={14} className="text-slate-600" /> 4. Trắc nghiệm ({quizBlock.questions.length} câu hỏi)
                    </h4>
                    <div className="space-y-3">
                      {quizBlock.questions.map((q, qIdx) => (
                        <div key={qIdx} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs space-y-2">
                          <p className="font-bold text-navy-800">
                            Câu {qIdx + 1}: {q.question}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {q.options?.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-2 rounded-md border text-xs ${
                                  (q.correctAnswer === String(oIdx) ||
                                    q.correctAnswer === String.fromCharCode(65 + oIdx) ||
                                    opt.startsWith(q.correctAnswer))
                                    ? 'bg-slate-100 border-slate-400 text-slate-900 font-semibold'
                                    : 'bg-white border-slate-200 text-slate-700'
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <p className="text-[11px] text-slate-500 italic mt-1">Giải thích: {q.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Video */}
                {videoBlock.videoUrl && (
                  <div className="rounded-xl border border-line bg-white p-4 shadow-2xs">
                    <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2 mb-2">
                      <Video size={14} className="text-slate-600" /> 5. Video bài giảng
                    </h4>
                    <p className="text-xs text-slate-600 mb-2 truncate">Đường dẫn: {videoBlock.videoUrl}</p>
                    {ytEmbedUrl ? (
                      <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200">
                        <iframe src={ytEmbedUrl} title="Video bài giảng" className="w-full h-full" allowFullScreen />
                      </div>
                    ) : (
                      <video src={videoBlock.videoUrl} controls className="w-full rounded-lg max-h-72 bg-black" />
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Form Metadata Thông Tin Chung */}
              <div className="px-5 py-3 bg-slate-50/80 border-b border-line space-y-2.5 text-xs">
                {/* Hàng 1: Tên Tiếng Việt & Tiếng Anh */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 flex items-center gap-1">
                      Tên tiếng Việt <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      value={formData.titleVi}
                      onChange={(e) => setFormData((prev) => ({ ...prev, titleVi: e.target.value }))}
                      placeholder="VD: Unit 1: Chào Hỏi & Làm Quen"
                      className="text-xs py-1 h-8 bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Tên tiếng Anh (Tiêu đề phụ)</label>
                    <Input
                      value={formData.titleEn}
                      onChange={(e) => setFormData((prev) => ({ ...prev, titleEn: e.target.value }))}
                      placeholder="VD: Unit 1: Greetings & Self-Introduction"
                      className="text-xs py-1 h-8 bg-white"
                    />
                  </div>
                </div>

                {/* Hàng 2: Loại Unit, Thứ tự, Thời lượng, Thưởng XP */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Kỹ năng / Phân loại</label>
                    <Select
                      value={formData.lessonType}
                      onChange={(e) => setFormData((prev) => ({ ...prev, lessonType: e.target.value }))}
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
                      value={formData.position}
                      onChange={(e) => setFormData((prev) => ({ ...prev, position: Number(e.target.value) || 1 }))}
                      className="text-xs py-1 h-8 text-center bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Thời lượng (phút)</label>
                    <Input
                      type="number"
                      min={5}
                      step={5}
                      value={formData.estimatedMin}
                      onChange={(e) => setFormData((prev) => ({ ...prev, estimatedMin: Number(e.target.value) || 15 }))}
                      className="text-xs py-1 h-8 text-center bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Thưởng XP</label>
                    <Input
                      type="number"
                      min={10}
                      step={5}
                      value={formData.xpReward}
                      onChange={(e) => setFormData((prev) => ({ ...prev, xpReward: Number(e.target.value) || 30 }))}
                      className="text-xs py-1 h-8 text-center bg-white font-semibold text-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Tabs (6 Blocks + JSON) */}
              <div className="flex items-center gap-0.5 px-4 pt-1 border-b border-line bg-white overflow-x-auto scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setActiveTab('theory')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'theory'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <BookOpen size={13} /> 1. Lý Thuyết
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('vocabulary')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'vocabulary'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <Volume2 size={13} /> 2. Từ Vựng ({vocabBlock.items?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('dialogue')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'dialogue'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <MessageSquare size={13} /> 3. Hội Thoại ({dialogueBlock.lines?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('quiz')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'quiz'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <FileQuestion size={13} /> 4. Trắc Nghiệm ({quizBlock.questions?.length || 0})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('video')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'video'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <Video size={13} /> 5. Video
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('attachment')}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[11.5px] font-semibold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === 'attachment'
                      ? 'border-brand-600 text-brand-600'
                      : 'border-transparent text-ink-muted hover:text-slate-700'
                  }`}
                >
                  <FileText size={13} /> 6. Tệp Đính Kèm {attachmentBlock.fileUrl ? '(1)' : ''}
                </button>
              </div>

              {/* Tab Contents */}
              <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
                {activeTab === 'theory' && (
                  <LessonTheoryTab
                    theoryBlock={theoryBlock}
                    updateBlock={updateBlock}
                    setLessonModal={setFormData}
                  />
                )}

                {activeTab === 'vocabulary' && (
                  <LessonVocabTab
                    vocabBlock={vocabBlock}
                    updateBlock={updateBlock}
                  />
                )}

                {activeTab === 'dialogue' && (
                  <LessonDialogueTab
                    dialogueBlock={dialogueBlock}
                    updateBlock={updateBlock}
                  />
                )}

                {activeTab === 'quiz' && (
                  <LessonQuizTab
                    quizBlock={quizBlock}
                    updateBlock={updateBlock}
                  />
                )}

                {activeTab === 'video' && (
                  <LessonVideoTab
                    videoBlock={videoBlock}
                    updateBlock={updateBlock}
                    ytEmbedUrl={ytEmbedUrl}
                    videoInputRef={videoInputRef}
                    handleVideoFileSelect={handleVideoFileSelect}
                    handleRemoveVideo={handleRemoveVideo}
                    isUploadingVideo={isUploadingVideo}
                    uploadVideoProgress={uploadVideoProgress}
                    uploadVideoMsg={uploadVideoMsg}
                  />
                )}

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

                {activeTab === 'json' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-muted">
                        Định dạng dữ liệu JSON nội dung bài học:
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
                      rows={12}
                      value={jsonRaw}
                      onChange={(e) => setJsonRaw(e.target.value)}
                      className="w-full rounded-xl border border-line p-3.5 font-mono text-[11px] bg-slate-900 text-emerald-400 focus:outline-none focus:ring-1 focus:ring-purple-500 leading-relaxed"
                    />

                    {jsonError && <p className="text-xs text-rose-600 font-semibold">{jsonError}</p>}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 3. Footer Workspace */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 bg-slate-50">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="chkWorkspaceFreePreview"
                checked={formData.isFreePreview}
                onChange={(e) => setFormData((prev) => ({ ...prev, isFreePreview: e.target.checked }))}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
              />
              <label
                htmlFor="chkWorkspaceFreePreview"
                className="text-xs text-navy-800 font-medium cursor-pointer select-none"
              >
                Học thử miễn phí (Free Preview)
              </label>
            </div>

            <div className="flex items-center gap-2">
              {onCancel && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCancel}
                  disabled={isSaving}
                  icon={RotateCcw}
                >
                  Làm mới
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                icon={Save}
                loading={isSaving}
                onClick={handleSaveLesson}
                disabled={isSaving || !formData.titleVi?.trim()}
                title="Lưu bài học (Ctrl + S)"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
              </Button>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: DRAWER CHAT AI GEMINI */}
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
  )
}

