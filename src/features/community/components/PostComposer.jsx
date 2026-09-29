import { useEffect, useRef } from 'react'
import { FileText, Image as ImageIcon, Loader2, Paperclip, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'

export default function PostComposer({
  isAdmin,
  myAvatar,
  myName,
  postContent,
  setPostContent,
  attachedImage,
  setAttachedImage,
  imageFile,
  setImageFile,
  attachedDoc,
  setAttachedDoc,
  docFile,
  setDocFile,
  isPosting,
  isAiGenerating,
  handleAiSuggest,
  handleCreatePost,
}) {
  const textareaRef = useRef(null)
  const imageInputRef = useRef(null)
  const pdfInputRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(72, textareaRef.current.scrollHeight)}px`
    }
  }, [postContent])

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  // ── Xử lý chọn ảnh từ máy tính (chỉ tạo preview, chỉ upload khi nhấn Đăng bài) ──
  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh hợp lệ (JPG, PNG, WEBP, GIF, SVG)')
      return
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error('Dung lượng ảnh tối đa 15MB')
      return
    }

    // Lưu tệp gốc để upload khi nhấn "Đăng bài"
    if (setImageFile) setImageFile(file)

    // Tạo preview URL để hiển thị ngay trên giao diện
    const previewUrl = URL.createObjectURL(file)
    setAttachedImage(previewUrl)
    toast.success(`Đã chọn ảnh: ${file.name}`)
  }

  // ── Xử lý chọn file PDF từ máy tính (chỉ đính kèm thông tin, chỉ upload khi nhấn Đăng bài) ──
  const handlePdfFileSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const isPdf =
      file.name.toLowerCase().endsWith('.pdf') ||
      file.type === 'application/pdf'

    if (!isPdf) {
      toast.error('Vui lòng chọn tệp tài liệu định dạng PDF (.pdf)')
      return
    }

    if (file.size > 30 * 1024 * 1024) {
      toast.error('Dung lượng tệp PDF tối đa 30MB')
      return
    }

    const readableSize = formatFileSize(file.size)

    // Lưu tệp gốc để upload khi nhấn "Đăng bài"
    if (setDocFile) setDocFile(file)

    // Hiển thị thông tin tệp tài liệu đã đính kèm trên giao diện
    setAttachedDoc({
      name: file.name,
      size: readableSize,
    })
    toast.success(`Đã chọn tài liệu PDF: ${file.name}`)
  }

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      {/* ── Inputs file ẩn từ máy tính ── */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFileSelect}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handlePdfFileSelect}
      />

      <div className="flex items-start gap-3">
        <Avatar
          src={myAvatar}
          name={myName}
          size="md"
          className="h-10 w-10 shrink-0"
        />

        <div className="flex-1 space-y-2">
          <textarea
            ref={textareaRef}
            rows={3}
            disabled={isPosting}
            placeholder="Chia sẻ kiến thức, bài giảng hoặc tài liệu với đồng nghiệp..."
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full resize-none overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
          />

          {/* Attached Image Preview */}
          {attachedImage && (
            <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 shadow-2xs group">
              <img
                src={attachedImage}
                alt="Ảnh đính kèm"
                className="h-28 w-auto max-w-[260px] object-cover rounded-xl"
              />
              <button
                type="button"
                disabled={isPosting}
                onClick={() => {
                  setAttachedImage(null)
                  if (setImageFile) setImageFile(null)
                }}
                title="Gỡ ảnh này"
                className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/75 hover:bg-red-600 text-white transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                <X size={13} />
              </button>
            </div>
          )}

          {/* Attached Document Preview */}
          {attachedDoc && (
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-[10px] shrink-0">
                  PDF
                </span>
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{attachedDoc.name}</p>
                  <p className="text-[11px] text-slate-500">{attachedDoc.size}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isPosting}
                onClick={() => {
                  setAttachedDoc(null)
                  if (setDocFile) setDocFile(null)
                }}
                title="Gỡ tài liệu này"
                className="p-1 rounded-md text-slate-400 hover:bg-slate-200 hover:text-red-600 transition-colors cursor-pointer ml-2 shrink-0 disabled:opacity-50"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions of Composer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          {/* Nút Chọn Ảnh từ máy tính */}
          <button
            type="button"
            disabled={isPosting}
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Chọn ảnh từ máy tính của bạn"
          >
            <ImageIcon size={15} className="text-slate-500" />
            <span>Ảnh / Media</span>
          </button>

          {/* Nút Chọn File PDF từ máy tính */}
          <button
            type="button"
            disabled={isPosting}
            onClick={() => pdfInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Chọn tệp PDF từ máy tính của bạn"
          >
            <Paperclip size={15} className="text-slate-500" />
            <span>File PDF</span>
          </button>

          {/* Nút Gợi ý AI - Giữ nguyên không động gì tới theo yêu cầu */}
          <button
            type="button"
            onClick={handleAiSuggest}
            disabled={isAiGenerating || isPosting}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-brand-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAiGenerating ? (
              <Loader2 size={15} className="animate-spin text-brand-600" />
            ) : (
              <Sparkles size={15} className="text-brand-600" />
            )}
            <span>{isAiGenerating ? 'Đang tạo...' : 'Gợi ý AI'}</span>
          </button>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={handleCreatePost}
          loading={isPosting}
          disabled={isPosting || !postContent.trim()}
          className="bg-navy-800 hover:bg-navy-900 text-white font-semibold px-4 cursor-pointer disabled:cursor-not-allowed"
        >
          {isPosting ? 'Đang đăng tải...' : 'Đăng bài'}
        </Button>
      </div>
    </div>
  )
}
