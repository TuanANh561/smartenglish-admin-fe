import { Send } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export default function PostCommentSection({
  postId,
  comments = [],
  commentInput = '',
  onCommentInputChange,
  onAddComment,
}) {
  return (
    <div className="border-t border-slate-100 pt-3 space-y-2.5">
      {comments?.length > 0 ? (
        <div className="space-y-2">
          {comments.map((cmt) => (
            <div key={cmt.id} className="flex items-start gap-2.5">
              <img
                src={cmt.authorAvatar}
                alt={cmt.authorName}
                className="h-7 w-7 rounded-full object-cover border border-slate-200 mt-0.5 shrink-0"
              />
              <div className="flex-1 rounded-xl bg-slate-50 p-2.5 text-xs space-y-0.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{cmt.authorName}</span>
                  <span className="text-[10px] text-slate-400">{formatRelativeTime(cmt.createdAt)}</span>
                </div>
                <p className="text-slate-700">{cmt.content}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400 text-center py-1">
          Chưa có bình luận nào.
        </p>
      )}

      {/* Add comment input */}
      <div className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Viết bình luận..."
          value={commentInput}
          onChange={(e) => onCommentInputChange(postId, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAddComment(postId)
          }}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={() => onAddComment(postId)}
          className="rounded-xl bg-navy-800 hover:bg-navy-900 px-3 py-1.5 text-white cursor-pointer transition-colors"
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}
