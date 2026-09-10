import { useEffect, useRef } from 'react'
import { FileText, Image as ImageIcon, Loader2, Paperclip, Sparkles, X } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function PostComposer({
  isAdmin,
  postContent,
  setPostContent,
  attachedImage,
  setAttachedImage,
  attachedDoc,
  setAttachedDoc,
  isPosting,
  isAiGenerating,
  handleAiSuggest,
  handleCreatePost,
}) {
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.max(72, textareaRef.current.scrollHeight)}px`
    }
  }, [postContent])
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
      <div className="flex items-start gap-3">
        <img
          src={
            isAdmin
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
          }
          alt="Avatar"
          className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
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
            <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200">
              <img src={attachedImage} alt="Attachment" className="h-24 w-auto object-cover" />
              <button
                type="button"
                disabled={isPosting}
                onClick={() => setAttachedImage(null)}
                className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 cursor-pointer disabled:opacity-50"
              >
                <X size={12} />
              </button>
            </div>
          )}

          {/* Attached Document Preview */}
          {attachedDoc && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs">
              <span className="flex items-center gap-2 font-semibold text-slate-700">
                <FileText size={15} className="text-red-500" />
                {attachedDoc.name} ({attachedDoc.size})
              </span>
              <button
                type="button"
                disabled={isPosting}
                onClick={() => setAttachedDoc(null)}
                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer disabled:opacity-50"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Actions of Composer */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <button
            type="button"
            disabled={isPosting}
            onClick={() =>
              setAttachedImage(
                'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
              )
            }
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageIcon size={15} className="text-slate-500" />
            <span>Ảnh / Media</span>
          </button>

          <button
            type="button"
            disabled={isPosting}
            onClick={() =>
              setAttachedDoc({ name: 'IELTS_Speaking_Structures.pdf', size: '2.4 MB' })
            }
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Paperclip size={15} className="text-slate-500" />
            <span>File PDF</span>
          </button>

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
          {isPosting ? 'Đang đăng bài...' : 'Đăng bài'}
        </Button>
      </div>
    </div>
  )
}
