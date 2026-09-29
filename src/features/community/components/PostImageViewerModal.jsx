import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Smile,
  Image as ImageIcon,
  Globe,
  CornerDownRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import Avatar from '@/components/ui/Avatar'

export default function PostImageViewerModal({
  isOpen,
  onClose,
  post,
  myUser,
  onLikePost,
  onAddComment,
  onDeleteComment,
  onSharePost,
}) {
  const [commentText, setCommentText] = useState('')
  const [replyTarget, setReplyTarget] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const inputRef = useRef(null)
  const commentsEndRef = useRef(null)

  // Reset states on open/close
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1)
    } else {
      setReplyTarget(null)
      setCommentText('')
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const comments = Array.isArray(post?.comments) ? post.comments : []

  // Group root comments and child replies (Always called unconditionally at top level)
  const { rootComments, replyMap } = useMemo(() => {
    const roots = []
    const replies = {}

    comments.forEach((c) => {
      if (!c.parentCommentId) {
        roots.push(c)
      } else {
        if (!replies[c.parentCommentId]) {
          replies[c.parentCommentId] = []
        }
        replies[c.parentCommentId].push(c)
      }
    })

    return { rootComments: roots, replyMap: replies }
  }, [comments])

  if (!isOpen || !post) return null

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = commentText.trim()
    if (!text || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddComment(post.id, text, replyTarget?.id || null)
      setCommentText('')
      setReplyTarget(null)
      setTimeout(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReplyClick = (comment) => {
    setReplyTarget(comment)
    setCommentText(`@${comment.authorName} `)
    inputRef.current?.focus()
  }

  const isLiked = Boolean(post.isLiked)

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col md:flex-row bg-black animate-in fade-in duration-200 overflow-hidden">
      {/* ─── BÌNH LUẬN HIỂN THỊ BÊN TAY TRÁI (LEFT PANEL) ─── */}
      <div className="order-2 md:order-1 w-full md:w-[420px] lg:w-[460px] h-[45vh] md:h-full bg-white flex flex-col shrink-0 shadow-2xl z-20 border-r border-slate-200">
        {/* Post Author Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar
              src={post.authorAvatar}
              name={post.authorName}
              size="md"
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900 truncate">
                  {post.authorName}
                </span>
                {post.authorRole && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 truncate">
                    {post.authorRole}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span>{formatRelativeTime(post.createdAt)}</span>
                <span>•</span>
                <Globe size={12} className="text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body: Post Text + Engagement + Comments */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {/* Post Text Caption */}
          <div className="text-[13.5px] text-slate-800 leading-relaxed whitespace-pre-line">
            {post.content}
          </div>

          {/* Tags */}
          {Array.isArray(post.tags) && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Buttons Row (Gộp số lượng kế bên icon) */}
          <div className="flex items-center justify-between border-y border-slate-100 py-1.5 text-xs">
            <button
              type="button"
              onClick={() => onLikePost(post.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer',
                isLiked
                  ? 'text-brand-600 bg-brand-50/70 font-bold'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              <Heart
                size={16}
                className={cn(isLiked ? 'fill-brand-600 text-brand-600' : 'text-slate-500')}
              />
              <span>Thích</span>
              {Number(post.likesCount) > 0 && (
                <span className="font-bold text-xs ml-0.5">{post.likesCount}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => inputRef.current?.focus()}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MessageSquare size={16} className="text-slate-500" />
              <span>Bình luận</span>
              {comments.length > 0 && (
                <span className="font-bold text-xs ml-0.5">{comments.length}</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => onSharePost && onSharePost(post)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Share2 size={16} className="text-slate-500" />
              <span>Chia sẻ</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="space-y-3 pt-1">
            {rootComments.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
              </div>
            ) : (
              rootComments.map((root) => {
                const childReplies = replyMap[root.id] || []
                return (
                  <div key={root.id} className="space-y-2">
                    {/* Root comment bubble */}
                    <div className="flex items-start gap-2.5 group">
                      <Avatar
                        src={root.authorAvatar}
                        name={root.authorName}
                        size="sm"
                        className="h-8 w-8 shrink-0 mt-0.5"
                      />
                      <div className="space-y-1 max-w-[85%]">
                        <div className="rounded-2xl bg-slate-100 px-3.5 py-2 text-xs border border-slate-200/50">
                          <p className="font-bold text-slate-900 leading-tight">
                            {root.authorName}
                          </p>
                          <p className="text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                            {root.content}
                          </p>
                        </div>
                        {/* Reaction / action sub-bar */}
                        <div className="flex items-center gap-3 px-2 text-[11px] text-slate-500 font-semibold">
                          <button
                            type="button"
                            className="hover:underline hover:text-slate-800 cursor-pointer"
                          >
                            Thích
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReplyClick(root)}
                            className="hover:underline hover:text-slate-800 cursor-pointer text-brand-600"
                          >
                            Trả lời
                          </button>
                          <span className="font-normal text-slate-400">
                            {formatRelativeTime(root.createdAt)}
                          </span>
                          {onDeleteComment && (
                            <button
                              type="button"
                              onClick={() => onDeleteComment(post.id, root.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer ml-1"
                              title="Xóa bình luận"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Child replies */}
                    {childReplies.map((reply) => (
                      <div key={reply.id} className="relative pl-9 flex items-start gap-2.5 group">
                        <div className="absolute left-4 top-[-8px] bottom-3 w-4 border-l-2 border-b-2 border-slate-200 rounded-bl-xl pointer-events-none" />
                        <Avatar
                          src={reply.authorAvatar}
                          name={reply.authorName}
                          size="xs"
                          className="h-7 w-7 shrink-0 mt-0.5 z-10"
                        />
                        <div className="space-y-1 max-w-[85%]">
                          <div className="rounded-2xl bg-slate-100 px-3.5 py-2 text-xs border border-slate-200/50">
                            <p className="font-bold text-slate-900 leading-tight">
                              {reply.authorName}
                            </p>
                            <p className="text-slate-800 mt-1 whitespace-pre-wrap leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 px-2 text-[11px] text-slate-500 font-semibold">
                            <button
                              type="button"
                              className="hover:underline hover:text-slate-800 cursor-pointer"
                            >
                              Thích
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReplyClick(root)}
                              className="hover:underline hover:text-slate-800 cursor-pointer text-brand-600"
                            >
                              Trả lời
                            </button>
                            <span className="font-normal text-slate-400">
                              {formatRelativeTime(reply.createdAt)}
                            </span>
                            {onDeleteComment && (
                              <button
                                type="button"
                                onClick={() => onDeleteComment(post.id, reply.id)}
                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer ml-1"
                                title="Xóa bình luận"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })
            )}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* Sticky Comment Input Bar */}
        <div className="border-t border-slate-200 bg-white p-3 space-y-2">
          {replyTarget && (
            <div className="flex items-center justify-between bg-slate-100 rounded-lg px-3 py-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 truncate">
                <CornerDownRight size={13} className="text-brand-600 shrink-0" />
                <span>
                  Đang trả lời <strong className="text-slate-900">{replyTarget.authorName}</strong>
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setReplyTarget(null)
                  setCommentText('')
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 ml-2"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2.5">
            <Avatar
              src={myUser?.avatarUrl || myUser?.avatar}
              name={myUser?.displayName || myUser?.name || 'User'}
              size="sm"
              className="h-8 w-8 shrink-0"
            />
            <div className="flex-1 flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1.5 border border-slate-200/70 focus-within:border-brand-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết câu trả lời..."
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <div className="flex items-center gap-1 text-slate-400">
                <button
                  type="button"
                  title="Biểu tượng cảm xúc"
                  onClick={() => setCommentText((prev) => prev + ' 😊')}
                  className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <Smile size={16} />
                </button>
                <button
                  type="button"
                  title="Đính kèm ảnh"
                  className="p-1 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className={cn(
                'flex items-center justify-center h-8 w-8 rounded-full transition-all cursor-pointer',
                commentText.trim()
                  ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed',
              )}
            >
              <Send size={14} className={commentText.trim() ? '-ml-0.5' : ''} />
            </button>
          </form>
        </div>
      </div>

      {/* ─── ẢNH HIỂN THỊ Ở GIỮA / BÊN PHẢI (CENTER/RIGHT) ─── */}
      <div className="order-1 md:order-2 flex-1 h-[55vh] md:h-full bg-black relative flex items-center justify-center overflow-hidden select-none">
        {/* NÚT X TẮT NẰM BÊN TAY PHẢI (USER EXPLICIT OVERRIDE) */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          {/* Zoom controls */}
          <button
            type="button"
            title="Thu nhỏ"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/90 hover:text-white border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
          >
            <ZoomOut size={18} />
          </button>
          <button
            type="button"
            title="Phóng to"
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/90 hover:text-white border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
          >
            <ZoomIn size={18} />
          </button>
          <button
            type="button"
            title="Khôi phục kích thước"
            onClick={() => setZoomLevel(1)}
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white/90 hover:text-white border border-white/15 transition-all cursor-pointer backdrop-blur-xs"
          >
            <Maximize2 size={16} />
          </button>

          {/* Close button X */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng xem ảnh"
            className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-900/90 hover:bg-red-600 text-white border border-white/20 transition-all cursor-pointer shadow-lg ml-1 backdrop-blur-xs"
          >
            <X size={20} />
          </button>
        </div>

        {/* The Image */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <img
            src={post.mediaUrl}
            alt={post.mediaCaption || 'Full view'}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-200 ease-out cursor-grab active:cursor-grabbing"
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
