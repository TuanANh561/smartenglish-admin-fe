import { useMemo, useState } from 'react'
import {
  Bookmark,
  Check,
  Download,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Send,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { INITIAL_POSTS, TOP_TEACHERS, TRENDING_TOPICS } from '@/mocks/data/posts'
import { useAuthStore } from '@/store/authStore'

function CommunityPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'
  const isTeacher = user?.role === 'teacher'

  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [teachers, setTeachers] = useState(TOP_TEACHERS)
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'popular' | 'docs' | 'mine'
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set())

  // New Post Form State
  const [postContent, setPostContent] = useState('')
  const [attachedImage, setAttachedImage] = useState(null)
  const [attachedDoc, setAttachedDoc] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)

  // Interactive States
  const [activeCommentPostId, setActiveCommentPostId] = useState(null)
  const [commentInputs, setCommentInputs] = useState({})
  const [activeMenuPostId, setActiveMenuPostId] = useState(null)

  const checkPostOwnership = (post) => {
    if (!user) return false
    if (isAdmin) return true
    return (
      post.authorEmail === user.email ||
      post.authorName === user.displayName ||
      post.authorName === 'Hoàng Thị Mai'
    )
  }

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (activeTab === 'popular' && post.likesCount < 40) return false
      if (activeTab === 'docs' && !post.attachment) return false
      if (activeTab === 'mine' && !checkPostOwnership(post)) return false

      // Tag filter
      const matchTag = !selectedTag || post.tags.includes(selectedTag)

      // Search filter
      const keyword = searchQuery.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        post.content.toLowerCase().includes(keyword) ||
        post.authorName.toLowerCase().includes(keyword) ||
        post.tags.some((t) => t.toLowerCase().includes(keyword))

      return matchTag && matchSearch
    })
  }, [posts, selectedTag, searchQuery, activeTab, user])

  // Handlers
  const handleLikePost = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextLiked ? p.likesCount + 1 : Math.max(0, p.likesCount - 1),
          }
        }
        return p
      }),
    )
  }

  const handleBookmarkPost = (postId) => {
    const next = new Set(bookmarkedPostIds)
    if (next.has(postId)) {
      next.delete(postId)
      toast.success('Đã bỏ lưu bài viết')
    } else {
      next.add(postId)
      toast.success('Đã lưu bài viết')
    }
    setBookmarkedPostIds(next)
  }

  const handleSharePost = (post) => {
    navigator.clipboard?.writeText(window.location.href)
    toast.success(`Đã sao chép liên kết bài viết của "${post.authorName}"`)
  }

  const handleDeletePost = (postId, e) => {
    e?.stopPropagation()
    setPosts((prev) => prev.filter((p) => p.id !== postId))
    setActiveMenuPostId(null)
    toast.success('Đã xoá bài viết thành công')
  }

  const handleToggleFollow = (teacherId) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, isFollowing: !t.isFollowing } : t)),
    )
    const target = teachers.find((t) => t.id === teacherId)
    if (target) {
      toast.success(
        target.isFollowing ? `Đã hủy theo dõi ${target.name}` : `Đã theo dõi ${target.name}`,
      )
    }
  }

  const handleAiSuggest = () => {
    setIsAiGenerating(true)
    setTimeout(() => {
      setIsAiGenerating(false)
      setPostContent(
        'Gợi ý 7 Collocations chủ đề "Environment & Sustainability" cho IELTS Writing & Speaking:\n\n1. Carbon footprint\n2. Renewable energy sources\n3. Ecological balance\n\nCác thầy cô có thể tải tài liệu đính kèm bên dưới về giảng dạy. #IELTS_Tips #WritingTips #AI_in_Education',
      )
      setAttachedImage(
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
      )
      setAttachedDoc({ name: 'IELTS_Collocations_Environment.pdf', size: '3.1 MB' })
      toast.success('Đã tạo gợi ý bài viết mẫu')
    }, 500)
  }

  const handleCreatePost = (e) => {
    e.preventDefault()
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết')
      return
    }

    setIsPosting(true)
    setTimeout(() => {
      setIsPosting(false)
      const newPost = {
        id: `post-${Date.now()}`,
        authorId: user?.id || 'u-curr',
        authorName: user?.displayName || (isAdmin ? 'Quản trị viên' : 'Hoàng Thị Mai'),
        authorEmail: user?.email || (isAdmin ? 'admin@smartenglish.vn' : 'mai.ht@gmail.com'),
        authorRole: isAdmin ? 'Quản trị viên' : 'Giáo viên',
        authorTitle: isAdmin ? 'Quản trị hệ thống' : 'Senior Instructor • SmartEnglish AI',
        authorAvatar: isAdmin
          ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        createdAt: 'Vừa xong',
        content: postContent,
        mediaType: attachedImage ? 'image' : null,
        mediaUrl: attachedImage,
        mediaCaption: attachedImage ? 'Hình ảnh học liệu đính kèm' : null,
        attachment: attachedDoc,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        tags:
          postContent.match(/#[\w_]+/g)?.map((t) => t.replace('#', '')) || ['SmartEnglish'],
      }

      setPosts([newPost, ...posts])
      setPostContent('')
      setAttachedImage(null)
      setAttachedDoc(null)
      toast.success('Đã đăng bài viết thành công')
    }, 400)
  }

  const handleAddComment = (postId) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newCmt = {
            id: `cmt-${Date.now()}`,
            authorName: user?.displayName || (isAdmin ? 'Quản trị viên' : 'Hoàng Thị Mai'),
            authorAvatar: isAdmin
              ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            content: text,
            createdAt: 'Vừa xong',
            likesCount: 0,
          }
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newCmt],
          }
        }
        return p
      }),
    )

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
    toast.success('Đã gửi bình luận!')
  }

  return (
    <div className="space-y-4">
      {/* ─── MAIN 2-COLUMN LAYOUT ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* ─── LEFT COLUMN: COMPOSER & FEED (8 COLS) ──────────────────── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Feed Filter Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex items-center gap-1 overflow-x-auto">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'popular', label: 'Nổi bật' },
                { id: 'docs', label: 'Có tài liệu PDF' },
                { id: 'mine', label: 'Của tôi' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap',
                    activeTab === tab.id
                      ? 'bg-navy-800 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {selectedTag && (
              <div className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700 font-semibold">
                <span>#{selectedTag}</span>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="hover:text-red-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* ─── POST COMPOSER CARD ────────────────────────────────────── */}
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
                  rows={3}
                  placeholder="Chia sẻ kiến thức, bài giảng hoặc tài liệu với đồng nghiệp..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none transition-all leading-relaxed"
                />

                {/* Attached Image Preview */}
                {attachedImage && (
                  <div className="relative inline-block rounded-lg overflow-hidden border border-slate-200">
                    <img src={attachedImage} alt="Attachment" className="h-24 w-auto object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-1 right-1 rounded-full bg-slate-900/80 p-1 text-white hover:bg-red-600 cursor-pointer"
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
                      onClick={() => setAttachedDoc(null)}
                      className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
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
                  onClick={() =>
                    setAttachedImage(
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <ImageIcon size={15} className="text-slate-500" />
                  <span>Ảnh / Media</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAttachedDoc({ name: 'IELTS_Speaking_Structures.pdf', size: '2.4 MB' })
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-slate-700 transition-colors cursor-pointer"
                >
                  <Paperclip size={15} className="text-slate-500" />
                  <span>File PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 font-medium text-brand-600 transition-colors cursor-pointer"
                >
                  <Sparkles size={15} className="text-brand-600" />
                  <span>{isAiGenerating ? 'Đang tạo...' : 'Gợi ý AI'}</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreatePost}
                loading={isPosting}
                className="bg-navy-800 hover:bg-navy-900 text-white font-semibold px-4"
              >
                Đăng bài
              </Button>
            </div>
          </div>

          {/* ─── POSTS FEED LIST ────────────────────────────────────────── */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
                Không tìm thấy bài viết nào phù hợp.
              </div>
            ) : (
              filteredPosts.map((post) => {
                const isOwner = checkPostOwnership(post)
                const isCommentOpen = activeCommentPostId === post.id
                const isBookmarked = bookmarkedPostIds.has(post.id)

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3.5"
                  >
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
                          onClick={() =>
                            setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                          }
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeMenuPostId === post.id && (
                          <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-slate-200 bg-white py-1 shadow-md text-xs font-semibold">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuPostId(null)
                                    toast.success('Mở trình chỉnh sửa bài viết')
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                >
                                  <Pencil size={14} /> Chỉnh sửa
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleDeletePost(post.id, e)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 size={14} /> Xóa bài viết
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuPostId(null)
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
                                onClick={() => setSelectedTag(rawTag)}
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
                          onClick={() => handleLikePost(post.id)}
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
                          onClick={() =>
                            setActiveCommentPostId(
                              activeCommentPostId === post.id ? null : post.id,
                            )
                          }
                          className="flex items-center gap-1.5 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <MessageSquare size={16} className="text-slate-400" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleBookmarkPost(post.id)}
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
                          onClick={() => handleSharePost(post)}
                          className="flex items-center gap-1 font-semibold hover:text-slate-800 transition-colors cursor-pointer"
                        >
                          <Share2 size={16} className="text-slate-400" />
                          <span>Chia sẻ</span>
                        </button>
                      </div>
                    </div>

                    {/* ─── EXPANDABLE COMMENTS SECTION ────────────────────── */}
                    {isCommentOpen && (
                      <div className="border-t border-slate-100 pt-3 space-y-2.5">
                        {post.comments?.length > 0 ? (
                          <div className="space-y-2">
                            {post.comments.map((cmt) => (
                              <div key={cmt.id} className="flex items-start gap-2.5">
                                <img
                                  src={cmt.authorAvatar}
                                  alt={cmt.authorName}
                                  className="h-7 w-7 rounded-full object-cover border border-slate-200 mt-0.5 shrink-0"
                                />
                                <div className="flex-1 rounded-xl bg-slate-50 p-2.5 text-xs space-y-0.5 border border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-900">{cmt.authorName}</span>
                                    <span className="text-[10px] text-slate-400">{cmt.createdAt}</span>
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
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id)
                            }}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="rounded-xl bg-navy-800 hover:bg-navy-900 px-3 py-1.5 text-white cursor-pointer transition-colors"
                          >
                            <Send size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TOPICS & FEATURED TEACHERS (4 COLS) ───────── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Search Input Bar */}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm bài viết, giáo viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none shadow-2xs"
            />
          </div>

          {/* Chủ đề thảo luận hot */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Chủ Đề Thảo Luận
            </h2>

            <div className="space-y-1">
              {TRENDING_TOPICS.map((topic) => (
                <div
                  key={topic.tag}
                  onClick={() => setSelectedTag(selectedTag === topic.tag ? null : topic.tag)}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group',
                    selectedTag === topic.tag
                      ? 'bg-slate-100 font-bold'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div>
                    <p className="font-semibold text-xs text-slate-900 group-hover:text-brand-600 transition-colors">
                      {topic.label}
                    </p>
                    <p className="text-[11px] text-slate-400">{topic.postCount}</p>
                  </div>

                  <TrendingUp size={14} className="text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Giáo viên tiêu biểu */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Giáo Viên Nổi Bật
            </h2>

            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{teacher.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{teacher.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(teacher.id)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer shrink-0',
                      teacher.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-navy-800 text-white hover:bg-navy-900',
                    )}
                  >
                    {teacher.isFollowing ? 'Đã theo dõi' : 'Theo dõi'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommunityPage
