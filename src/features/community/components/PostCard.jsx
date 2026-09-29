import { useState, useMemo } from 'react'
import {
  Bookmark,
  Download,
  Globe,
  Heart,
  MessageSquare,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn, formatRelativeTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

export default function PostCard({
  post,
  isOwner,
  isBookmarked,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onEditPost,
  onDeletePost,
  onSelectTag,
  onLikePost,
  onOpenCommentModal,
  onViewFullImage,
  onBookmarkPost,
  onSharePost,
  cardRef,
}) {
  const [isHidden, setIsHidden] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  // Kiểm tra mô tả có dài quá 1 dòng không (có xuống dòng hoặc dài hơn ~90 ký tự)
  const isContentLong = useMemo(() => {
    if (!post?.content) return false
    return post.content.includes('\n') || post.content.length > 95
  }, [post?.content])

  // Lấy nội dung hiển thị của dòng 1 khi chưa bấm "Xem thêm"
  const collapsedText = useMemo(() => {
    if (!post?.content) return ''
    const firstLine = post.content.split('\n')[0]
    if (firstLine.length > 95) {
      return firstLine.slice(0, 92).trim()
    }
    return firstLine.trim()
  }, [post?.content])

  const renderFormattedText = (text) => {
    if (!text) return null
    return text.split(' ').map((word, idx) => {
      if (word.startsWith('#')) {
        const rawTag = word.replace(/[^a-zA-Z0-9_]/g, '')
        return (
          <span
            key={idx}
            onClick={(e) => {
              e.stopPropagation()
              onSelectTag && onSelectTag(rawTag)
            }}
            className="font-semibold text-brand-600 hover:underline cursor-pointer mr-1"
          >
            {word}{' '}
          </span>
        )
      }
      return word + ' '
    })
  }

  const handleDownloadAttachment = () => {
    if (!post.attachment) return
    const fileName = post.attachment.name || 'SmartEnglish_Document.pdf'
    const url = post.attachment.url

    if (
      url &&
      (url.startsWith('http://') ||
        url.startsWith('https://') ||
        url.startsWith('data:') ||
        url.startsWith('blob:'))
    ) {
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.target = '_blank'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      const content = `SmartEnglish AI Learning Platform\n\nTài liệu: ${fileName}\nTác giả: ${
        post.authorName || 'SmartEnglish AI'
      }\nNgày tải: ${new Date().toLocaleString('vi-VN')}\n\nNội dung tóm tắt bài viết:\n${
        post.content || ''
      }\n`
      const blob = new Blob([content], { type: 'application/octet-stream;charset=utf-8' })
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(blobUrl)
    }

    toast.success(`Đã tải xuống máy: ${fileName}`)
  }

  if (isHidden) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex items-center justify-between text-xs text-slate-500">
        <span>Bài viết đã bị ẩn khỏi bảng tin của bạn.</span>
        <button
          type="button"
          onClick={() => setIsHidden(false)}
          className="font-semibold text-brand-600 hover:underline cursor-pointer"
        >
          Hoàn tác
        </button>
      </div>
    )
  }

  const commentsCount =
    post.commentsCount !== undefined
      ? post.commentsCount
      : Array.isArray(post.comments)
      ? post.comments.length
      : 0

  return (
    <div
      ref={cardRef}
      id={`post-${post.id}`}
      className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs space-y-3.5 scroll-mt-24 transition-all duration-300 hover:border-slate-300"
    >
      {/* ─── POST HEADER (Facebook Style) ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={post.authorAvatar}
            name={post.authorName}
            size="md"
            className="h-10 w-10 shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 truncate">
                {post.authorName}
              </h3>
              {post.authorRole && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 shrink-0">
                  {post.authorRole}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
              <span>{post.authorTitle || 'Thành viên'}</span>
              <span>•</span>
              <span>{formatRelativeTime(post.createdAt)}</span>
              <span>•</span>
              <Globe size={12} className="text-slate-400" />
            </div>
          </div>
        </div>

        {/* Right header buttons: ... & X */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              type="button"
              onClick={onToggleMenu}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg text-xs font-semibold animate-in fade-in zoom-in-95">
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onCloseMenu()
                        onEditPost(post)
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Pencil size={14} /> Chỉnh sửa
                    </button>
                    <button
                      type="button"
                      onClick={(e) => onDeletePost(post.id, e)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 size={14} /> Xóa bài viết
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onCloseMenu()
                      toast.success('Đã gửi báo cáo vi phạm')
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 cursor-pointer"
                  >
                    🚩 Báo cáo bài viết
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsHidden(true)}
            title="Ẩn bài viết"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ─── POST CONTENT (CÓ NÚT XEM THÊM Ở CUỐI DÒNG 1 NẾU DÀI QUÁ) ─── */}
      <div className="text-[13.5px] text-slate-800 leading-relaxed">
        {isContentLong && !isExpanded ? (
          <p>
            {renderFormattedText(collapsedText)}
            <span className="text-slate-400">... </span>
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="font-bold text-slate-900 hover:text-brand-600 hover:underline cursor-pointer transition-colors inline-block ml-0.5"
            >
              Xem thêm
            </button>
          </p>
        ) : (
          <div className="whitespace-pre-line space-y-1">
            <p>{renderFormattedText(post.content)}</p>
            {isContentLong && isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="font-bold text-xs text-slate-500 hover:text-slate-800 hover:underline cursor-pointer pt-0.5 inline-block"
              >
                Thu gọn
              </button>
            )}
          </div>
        )}
      </div>

      {/* ─── ATTACHED MEDIA (CLICKABLE TO OPEN FULLSCREEN LIGHTBOX) ─── */}
      {post.mediaUrl && (
        <div
          onClick={(e) => {
            e.stopPropagation()
            onViewFullImage && onViewFullImage(post)
          }}
          className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-950 flex items-center justify-center max-h-[310px]"
        >
          <img
            src={post.mediaUrl}
            alt={post.mediaCaption || 'Media'}
            className="w-full object-contain max-h-[310px] transition-transform duration-300 group-hover:scale-[1.01]"
          />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-black/75 backdrop-blur-xs text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-lg">
              Bấm để xem ảnh to toàn màn hình
            </span>
          </div>
        </div>
      )}

      {/* ─── ATTACHED DOCUMENT FILE ─── */}
      {post.attachment && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-2.5 truncate">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-[11px] shrink-0">
              PDF
            </span>
            <div className="truncate">
              <p className="font-semibold text-slate-900 truncate">{post.attachment.name}</p>
              <p className="text-[11px] text-slate-500">{post.attachment.size}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownloadAttachment}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors shrink-0 ml-2"
          >
            <Download size={14} /> Tải về
          </button>
        </div>
      )}

      {/* ─── ENGAGEMENT ACTION BUTTONS (GỘP SỐ LƯỢNG KẾ BÊN ICON) ─── */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
        {/* Like Button */}
        <button
          type="button"
          onClick={() => onLikePost(post.id)}
          className={cn(
            'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-colors cursor-pointer',
            post.isLiked
              ? 'text-brand-600 bg-brand-50/70 font-bold'
              : 'text-slate-600 hover:bg-slate-100',
          )}
        >
          <Heart
            size={17}
            className={cn(post.isLiked ? 'fill-brand-600 text-brand-600' : 'text-slate-500')}
          />
          <span>Thích</span>
          {Number(post.likesCount) > 0 && (
            <span className="font-bold text-xs ml-0.5">{post.likesCount}</span>
          )}
        </button>

        {/* Comment Modal Trigger Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onOpenCommentModal && onOpenCommentModal(post)
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <MessageSquare size={17} className="text-slate-500" />
          <span>Bình luận</span>
          {Number(commentsCount) > 0 && (
            <span className="font-bold text-xs ml-0.5">{commentsCount}</span>
          )}
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => onSharePost && onSharePost(post)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <Share2 size={17} className="text-slate-500" />
          <span>Chia sẻ</span>
        </button>

        {/* Bookmark Button */}
        <button
          type="button"
          onClick={() => onBookmarkPost(post.id)}
          className={cn(
            'p-2 rounded-lg font-semibold transition-colors cursor-pointer',
            isBookmarked ? 'text-navy-800 bg-slate-100' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
          )}
          title={isBookmarked ? 'Đã lưu' : 'Lưu bài viết'}
        >
          <Bookmark
            size={17}
            className={cn(isBookmarked ? 'fill-navy-800 text-navy-800' : 'text-slate-500')}
          />
        </button>
      </div>
    </div>
  )
}
