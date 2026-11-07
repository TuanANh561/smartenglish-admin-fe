import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  MessageSquare,
  Heart,
  Calendar,
  Globe,
  Share2,
  FileText,
  Download,
  ExternalLink,
  PlusCircle,
  Sparkles,
  Inbox,
} from 'lucide-react'
import { http } from '@/lib/api'
import { formatRelativeTime, cn } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'

/**
 * ProfilePostsTab
 * Hiển thị danh sách các bài viết do một người dùng cụ thể đăng trên Bảng tin Cộng đồng
 *
 * @param {{
 *   userId: number|string,
 *   userName?: string,
 *   isSelf?: boolean,
 *   onPostCountChange?: (count: number) => void
 * }} props
 */
export default function ProfilePostsTab({
  userId,
  userName = 'Người dùng',
  isSelf = false,
  onPostCountChange,
}) {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!userId) return
    let isMounted = true
    setLoading(true)
    setError(null)

    http
      .get('/api/v1/social/posts?page=0&size=100')
      .then((res) => {
        if (!isMounted) return
        const data = res?.data || res
        const list = Array.isArray(data?.posts)
          ? data.posts
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : []

        // Lọc bài viết của đúng user này
        const userPosts = list.filter(
          (p) => String(p.authorId || p.userId) === String(userId)
        )

        setPosts(userPosts)
        onPostCountChange?.(userPosts.length)
      })
      .catch((err) => {
        if (!isMounted) return
        console.warn('Lỗi tải bài viết người dùng:', err)
        setError('Không thể tải danh sách bài viết từ hệ thống.')
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [userId, onPostCountChange])

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-xs">
        <LoadingSpinner text="Đang tải danh sách bài viết..." className="py-6" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
        <p className="text-red-500 font-semibold mb-2">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="text-brand-600 hover:underline cursor-pointer font-bold"
        >
          Thử tải lại
        </button>
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-10 sm:p-14 text-center shadow-xs">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 mb-3 border border-brand-100/80 shadow-2xs">
          <Inbox size={26} strokeWidth={1.8} />
        </div>
        <h4 className="text-sm font-bold text-slate-900">
          {isSelf
            ? 'Bạn chưa có bài viết nào trên Cộng đồng'
            : `${userName} chưa đăng bài viết nào`}
        </h4>
        <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          {isSelf
            ? 'Hãy chia sẻ kinh nghiệm học tiếng Anh, tài liệu bài tập hoặc câu hỏi thảo luận với mọi người ngay hôm nay!'
            : 'Các bài viết, chia sẻ học liệu và thảo luận của người dùng này sẽ hiển thị tại đây khi họ đăng bài.'}
        </p>
        {isSelf && (
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/app/cong-dong')}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold cursor-pointer shadow-xs"
            >
              Đến Bảng tin Cộng đồng để đăng bài
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Thanh tiêu đề thống kê nhỏ */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">
            {isSelf ? 'Tất cả bài viết của bạn' : `Bài viết của ${userName}`}
          </span>
          <span className="rounded-full bg-slate-100 text-slate-700 px-2 py-0.2 text-[10px] font-bold border border-slate-200">
            {posts.length} bài
          </span>
        </div>

        {isSelf && (
          <Link
            to="/app/cong-dong"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Tạo bài viết mới</span>
          </Link>
        )}
      </div>

      {/* Danh sách các bài viết */}
      <div className="space-y-3.5">
        {posts.map((post) => {
          const likesCount =
            post.likesCount !== undefined
              ? post.likesCount
              : Array.isArray(post.likedUserIds)
              ? post.likedUserIds.length
              : 0

          const commentsCount =
            post.commentsCount !== undefined
              ? post.commentsCount
              : Array.isArray(post.comments)
              ? post.comments.length
              : 0

          return (
            <div
              key={post.id}
              className="group relative rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
            >
              {/* Header bài viết */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Calendar size={13} className="text-slate-400" />
                  <span className="font-medium text-slate-600">
                    {formatRelativeTime(post.createdAt || post.timestamp)}
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                    <Globe size={11} /> Công khai
                  </span>
                </div>

                <Link
                  to={`/app/cong-dong#post-${post.id}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-colors shadow-2xs"
                  title="Xem trực tiếp trên bảng tin cộng đồng"
                >
                  <span>Xem trên Bảng tin</span>
                  <ExternalLink size={12} />
                </Link>
              </div>

              {/* Nội dung text */}
              <div className="text-[13.5px] leading-relaxed text-slate-800 whitespace-pre-line">
                {post.content}
              </div>

              {/* Tags (nếu có) */}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 border border-brand-100"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Hình ảnh đính kèm (nếu có) */}
              {post.mediaUrl && (
                <div className="mt-3 rounded-xl overflow-hidden border border-slate-200/80 bg-slate-50 max-h-72 flex items-center justify-center">
                  <img
                    src={post.mediaUrl}
                    alt={post.mediaCaption || 'Media'}
                    className="max-h-72 w-full object-contain"
                  />
                </div>
              )}

              {/* Tài liệu PDF / Docx đính kèm (nếu có) */}
              {post.attachment && (
                <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100 shrink-0">
                      <FileText size={16} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {post.attachment.name || 'Tài liệu học tập'}
                      </p>
                      {post.attachment.size && (
                        <p className="text-[10px] text-slate-400">
                          {post.attachment.size}
                        </p>
                      )}
                    </div>
                  </div>

                  {post.attachment.url && (
                    <a
                      href={post.attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
                    >
                      <Download size={13} />
                      <span>Tải về</span>
                    </a>
                  )}
                </div>
              )}

              {/* Footer thống kê tương tác */}
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                    <Heart size={14} className="text-rose-500 fill-rose-500/20" />
                    <span>{likesCount} lượt thích</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
                    <MessageSquare size={14} className="text-blue-500" />
                    <span>{commentsCount} bình luận</span>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400">
                  ID: #{String(post.id).slice(-6)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

