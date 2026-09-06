import { Bookmark, Download, Heart, MessageSquare, MoreHorizontal, Pencil, Share2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import PostCommentSection from './PostCommentSection'

export default function PostCard({
  post,
  isOwner,
  isBookmarked,
  isCommentOpen,
  isMenuOpen,
  onToggleMenu,
  onCloseMenu,
  onEditPost,
  onDeletePost,
  onSelectTag,
  onLikePost,
  onToggleComment,
  onBookmarkPost,
  onSharePost,
  commentInput,
  onCommentInputChange,
  onAddComment,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5">
      {/* Post Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">{post.authorName}</h3>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                {post.authorRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {post.authorTitle} • {post.createdAt}
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
          >
            <MoreHorizontal size={18} />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-md text-xs font-semibold">
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
                  🚩 Báo cáo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Post Content */}
      <div className="text-sm text-slate-800 leading-relaxed space-y-2 whitespace-pre-line">
        <p>
          {post.content.split(' ').map((word, idx) => {
            if (word.startsWith('#')) {
              const rawTag = word.replace(/[^a-zA-Z0-9_]/g, '')
              return (
                <span
                  key={idx}
                  onClick={() => onSelectTag(rawTag)}
                  className="font-semibold text-brand-600 hover:underline cursor-pointer mr-1"
                >
                  {word}{' '}
                </span>
              )
            }
            return word + ' '
          })}
        </p>
      </div>

      {/* Attached Media */}
      {post.mediaUrl && (
        <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          <img
            src={post.mediaUrl}
            alt={post.mediaCaption || 'Media'}
            className="w-full object-contain max-h-[380px]"
          />
        </div>
      )}

      {/* Attached Document File */}
      {post.attachment && (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-[11px]">
              PDF
            </span>
            <div>
              <p className="font-semibold text-slate-900">{post.attachment.name}</p>
              <p className="text-[11px] text-slate-500">{post.attachment.size}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              toast.success(`Đang tải tập tin: ${post.attachment.name}`)
            }
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs transition-colors"
          >
            <Download size={14} /> Tải về
          </button>
        </div>
      )}

      {/* Engagement Actions */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-5">
          {/* Like Button */}
          <button
            type="button"
            onClick={() => onLikePost(post.id)}
            className={cn(
              'flex items-center gap-1.5 font-semibold transition-colors cursor-pointer',
              post.isLiked ? 'text-red-500 font-bold' : 'hover:text-slate-800',
            )}
          >
            <Heart
              size={16}
              className={cn(post.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400')}
            />
            <span>{post.likesCount}</span>
          </button>

          {/* Comments Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleComment(post.id)}
            className="flex items-center gap-1.5 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
          >
            <MessageSquare size={16} className="text-slate-400" />
            <span>{post.commentsCount}</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onBookmarkPost(post.id)}
            className={cn(
              'flex items-center gap-1 font-semibold hover:text-slate-800 transition-colors cursor-pointer',
              isBookmarked && 'text-navy-800 font-bold',
            )}
          >
            <Bookmark
              size={16}
              className={cn(isBookmarked ? 'fill-navy-800 text-navy-800' : 'text-slate-400')}
            />
          </button>

          <button
            type="button"
            onClick={() => onSharePost(post)}
            className="flex items-center gap-1 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
          >
            <Share2 size={16} className="text-slate-400" />
            <span>Chia sẻ</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments Section */}
      {isCommentOpen && (
        <PostCommentSection
          postId={post.id}
          comments={post.comments}
          commentInput={commentInput}
          onCommentInputChange={onCommentInputChange}
          onAddComment={onAddComment}
        />
      )}
    </div>
  )
}
