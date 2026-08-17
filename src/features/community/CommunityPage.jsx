import { useMemo, useState } from 'react'
import {
  Bookmark,
  Check,
  Download,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageCircle,
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
  UserCheck,
  UserPlus,
  Users,
  Video,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
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

  // New Post Form State
  const [postContent, setPostContent] = useState('')
  const [attachedImage, setAttachedImage] = useState(null)
  const [attachedDoc, setAttachedDoc] = useState(null)
  const [isPosting, setIsPosting] = useState(false)
  const [isAiGenerating, setIsAiGenerating] = useState(false)
  const [activeCommentPostId, setActiveCommentPostId] = useState(null)
  const [commentInputs, setCommentInputs] = useState({})

  // Dropdown open states
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
      const matchTag = !selectedTag || post.tags.includes(selectedTag)
      const matchSearch =
        !searchQuery.trim() ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchTag && matchSearch
    })
  }, [posts, selectedTag, searchQuery])

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
      prev.map((t) =>
        t.id === teacherId ? { ...t, isFollowing: !t.isFollowing } : t,
      ),
    )
    const target = teachers.find((t) => t.id === teacherId)
    if (target) {
      toast.success(
        target.isFollowing
          ? `Đã hủy theo dõi ${target.name}`
          : `Đã theo dõi ${target.name}`,
      )
    }
  }

  const handleAiSuggest = () => {
    setIsAiGenerating(true)
    setTimeout(() => {
      setIsAiGenerating(false)
      setPostContent(
        '🚀 Tổng hợp 7 Collocations chủ đề "Environment & Sustainability" cực kỳ đắt giá cho IELTS Writing & Speaking!\n\n1. Carbon footprint\n2. Renewable energy sources\n3. Ecological balance\n\nCác thầy cô có thể tải tài liệu đính kèm bên dưới về giảng dạy nhé! 📚✨ #IELTS_Tips #WritingTips #AI_in_Education',
      )
      setAttachedImage(
        'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
      )
      setAttachedDoc({ name: 'IELTS_Collocations_Environment.pdf', size: '3.1 MB' })
      toast.success('Trợ lý AI đã tạo nội dung gợi ý bài viết mẫu!')
    }, 600)
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
        mediaCaption: attachedImage ? 'Tài liệu học tập đính kèm' : null,
        attachment: attachedDoc,
        likesCount: 0,
        isLiked: false,
        commentsCount: 0,
        comments: [],
        tags: postContent
          .match(/#[\w_]+/g)
          ?.map((t) => t.replace('#', '')) || ['SmartEnglish'],
      }

      setPosts([newPost, ...posts])
      setPostContent('')
      setAttachedImage(null)
      setAttachedDoc(null)
      toast.success('Đã đăng bài viết thành công lên Cộng đồng!')
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
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Top Header with Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Cộng đồng Giáo viên & Học liệu</h1>
          <p className="mt-0.5 text-xs text-ink-muted">
            Không gian chia sẻ kiến thức, tài liệu bài giảng, mẹo luyện thi và thảo luận học thuật.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Tìm kiếm bài viết, giáo viên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-line bg-white pl-10 pr-4 py-2 text-xs focus:border-brand-500 focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* ─── LEFT COLUMN: FEED & POST CREATOR (68%) ───────────────────── */}
        <div className="lg:col-span-8 space-y-5">
          {/* Active Tag Filter Indicator */}
          {selectedTag && (
            <div className="flex items-center justify-between rounded-xl bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-brand-700">
              <span className="flex items-center gap-1.5 font-semibold">
                <Tag size={14} /> Đang lọc theo chủ đề: <strong>#{selectedTag}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="font-bold text-brand-600 hover:text-brand-800 cursor-pointer flex items-center gap-1"
              >
                <X size={14} /> Bỏ lọc
              </button>
            </div>
          )}

          {/* ─── POST COMPOSER WIDGET (Mockup Top Widget) ───────────────── */}
          <Card className="p-4 border border-line shadow-xs space-y-3.5">
            <div className="flex items-start gap-3">
              <img
                src={
                  isAdmin
                    ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
                }
                alt="My Avatar"
                className="h-10 w-10 rounded-full object-cover border border-line shrink-0"
              />

              <div className="flex-1">
                <textarea
                  rows={3}
                  placeholder="Chia sẻ kiến thức hoặc tài liệu mới..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full rounded-2xl border border-line bg-slate-50/70 p-3 text-xs placeholder:text-ink-muted focus:border-brand-500 focus:bg-white focus:outline-none transition-all"
                />

                {/* Attached Image Preview */}
                {attachedImage && (
                  <div className="relative mt-2 inline-block rounded-xl overflow-hidden border border-line">
                    <img src={attachedImage} alt="Attachment" className="h-28 w-auto object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-1.5 right-1.5 rounded-full bg-navy-900/80 p-1 text-white hover:bg-red-500 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {/* Attached Document Preview */}
                {attachedDoc && (
                  <div className="mt-2 flex items-center justify-between rounded-lg border border-line bg-slate-100 p-2 text-xs">
                    <span className="flex items-center gap-2 font-semibold text-navy-700">
                      <FileText size={15} className="text-red-500" />
                      {attachedDoc.name} ({attachedDoc.size})
                    </span>
                    <button
                      type="button"
                      onClick={() => setAttachedDoc(null)}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions of Composer */}
            <div className="flex items-center justify-between border-t border-line pt-3 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-ink-muted">
                <button
                  type="button"
                  onClick={() =>
                    setAttachedImage(
                      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-navy-700 font-semibold cursor-pointer transition-colors"
                >
                  <ImageIcon size={16} className="text-blue-500" />
                  <span>Image/Video</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAttachedDoc({ name: 'IELTS_Speaking_Structures.pdf', size: '2.4 MB' })
                  }
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-slate-100 hover:text-navy-700 font-semibold cursor-pointer transition-colors"
                >
                  <Paperclip size={16} className="text-emerald-500" />
                  <span>Document</span>
                </button>

                <button
                  type="button"
                  onClick={handleAiSuggest}
                  disabled={isAiGenerating}
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 hover:bg-brand-50 hover:text-brand-600 font-semibold text-brand-600 cursor-pointer transition-colors"
                >
                  <Sparkles size={16} className="text-amber-500" />
                  <span>{isAiGenerating ? 'AI đang soạn...' : 'AI Assistant'}</span>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleCreatePost}
                loading={isPosting}
                className="px-5 rounded-full"
              >
                Post
              </Button>
            </div>
          </Card>

          {/* ─── POSTS FEED LIST ────────────────────────────────────────── */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <Card className="p-10 text-center text-xs text-ink-muted">
                Không tìm thấy bài viết nào phù hợp với bộ lọc.
              </Card>
            ) : (
              filteredPosts.map((post) => {
                const isOwner = checkPostOwnership(post)
                const isCommentOpen = activeCommentPostId === post.id

                return (
                  <Card key={post.id} className="p-5 border border-line shadow-xs space-y-4">
                    {/* Post Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={post.authorAvatar}
                          alt={post.authorName}
                          className="h-10 w-10 rounded-full object-cover border border-line"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-navy-700">{post.authorName}</h3>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                              {post.authorRole}
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-muted">
                            {post.authorTitle} • {post.createdAt}
                          </p>
                        </div>
                      </div>

                      {/* Options Dropdown */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                          }
                          className="rounded-full p-1.5 text-ink-muted hover:bg-slate-100 hover:text-navy-700 cursor-pointer"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {activeMenuPostId === post.id && (
                          <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-line bg-white py-1.5 shadow-lg text-xs">
                            {isOwner ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuPostId(null)
                                    toast.success('Mở trình chỉnh sửa bài viết')
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-ink hover:bg-slate-50 cursor-pointer"
                                >
                                  <Pencil size={14} /> Chỉnh sửa bài viết
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
                                  toast.success('Đã gửi báo cáo vi phạm tới Ban quản trị')
                                }}
                                className="flex w-full items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 cursor-pointer"
                              >
                                🚩 Báo cáo vi phạm
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Post Content */}
                    <div className="text-xs text-ink leading-relaxed space-y-2 whitespace-pre-line">
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

                    {/* Attached Infographic / Media */}
                    {post.mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-line bg-slate-50">
                        <img
                          src={post.mediaUrl}
                          alt={post.mediaCaption || 'Infographic'}
                          className="w-full object-contain max-h-[420px] bg-slate-900/5"
                        />
                        {post.mediaCaption && (
                          <div className="px-3 py-1.5 text-[11px] text-ink-muted bg-slate-50 border-t border-line text-center italic">
                            {post.mediaCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attached Document File */}
                    {post.attachment && (
                      <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50/70 p-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold">
                            PDF
                          </span>
                          <div>
                            <p className="font-semibold text-navy-700">{post.attachment.name}</p>
                            <p className="text-[10px] text-ink-muted">{post.attachment.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toast.success(`Đang tải tập tin: ${post.attachment.name}`)}
                          className="flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 font-semibold text-navy-700 hover:bg-brand-50 hover:text-brand-600 cursor-pointer shadow-xs"
                        >
                          <Download size={13} /> Tải về
                        </button>
                      </div>
                    )}

                    {/* Engagement Actions */}
                    <div className="flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
                      <div className="flex items-center gap-5">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={cn(
                            'flex items-center gap-1.5 font-semibold transition-colors cursor-pointer',
                            post.isLiked
                              ? 'text-red-500 font-bold'
                              : 'hover:text-red-500',
                          )}
                        >
                          <Heart
                            size={16}
                            fill={post.isLiked ? 'currentColor' : 'none'}
                          />
                          <span>{post.likesCount}</span>
                        </button>

                        {/* Comments Button */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveCommentPostId(
                              activeCommentPostId === post.id ? null : post.id,
                            )
                          }
                          className="flex items-center gap-1.5 font-semibold hover:text-navy-700 cursor-pointer transition-colors"
                        >
                          <MessageCircle size={16} />
                          <span>{post.commentsCount} Comments</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => handleSharePost(post)}
                        className="flex items-center gap-1.5 font-semibold hover:text-navy-700 cursor-pointer transition-colors"
                      >
                        <Share2 size={15} />
                        <span>Share</span>
                      </button>
                    </div>

                    {/* ─── EXPANDABLE COMMENTS SECTION ────────────────────── */}
                    {isCommentOpen && (
                      <div className="border-t border-line pt-3 space-y-3 bg-slate-50/60 -mx-5 -mb-5 p-4 rounded-b-xl">
                        {/* Existing comments */}
                        {post.comments?.length > 0 ? (
                          <div className="space-y-2.5">
                            {post.comments.map((cmt) => (
                              <div key={cmt.id} className="flex items-start gap-2.5 text-xs">
                                <img
                                  src={cmt.authorAvatar}
                                  alt={cmt.authorName}
                                  className="h-7 w-7 rounded-full object-cover border border-line shrink-0 mt-0.5"
                                />
                                <div className="flex-1 rounded-xl bg-white p-2.5 border border-line shadow-xs space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-navy-700">{cmt.authorName}</span>
                                    <span className="text-[10px] text-ink-muted">{cmt.createdAt}</span>
                                  </div>
                                  <p className="text-ink">{cmt.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-ink-muted text-center py-1">
                            Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!
                          </p>
                        )}

                        {/* Add comment input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Viết câu trả lời hoặc thảo luận..."
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(post.id)
                            }}
                            className="flex-1 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                          />
                          <Button
                            size="sm"
                            icon={Send}
                            onClick={() => handleAddComment(post.id)}
                            className="rounded-full px-3"
                          >
                            Gửi
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TOPICS & TOP TEACHERS (32%) ───────────────── */}
        <div className="lg:col-span-4 space-y-5">
          {/* Chủ đề thảo luận (Trending Topics - Mockup Top Right) */}
          <Card className="p-5 border border-line shadow-xs space-y-4">
            <h2 className="text-base font-bold text-navy-700">Chủ đề thảo luận</h2>

            <div className="space-y-3">
              {TRENDING_TOPICS.map((topic) => (
                <div
                  key={topic.tag}
                  onClick={() => setSelectedTag(selectedTag === topic.tag ? null : topic.tag)}
                  className={cn(
                    'flex items-center justify-between p-2 rounded-xl transition-colors cursor-pointer group',
                    selectedTag === topic.tag
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div>
                    <p className="font-bold text-xs text-navy-700 group-hover:text-brand-600 transition-colors">
                      {topic.label}
                    </p>
                    <p className="text-[11px] text-ink-muted">{topic.postCount}</p>
                  </div>

                  <span className="text-slate-400 group-hover:text-brand-600 transition-colors">
                    <TrendingUp size={16} />
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Giáo viên tiêu biểu (Featured Teachers - Mockup Bottom Right) */}
          <Card className="p-5 border border-line shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-700">Giáo viên tiêu biểu</h2>
            </div>

            <div className="space-y-3.5">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-9 w-9 rounded-full object-cover border border-line shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-navy-700 truncate">{teacher.name}</p>
                      <p className="text-[10px] text-ink-muted truncate">{teacher.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(teacher.id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer shrink-0',
                      teacher.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-100 text-brand-700 hover:bg-blue-200 font-bold',
                    )}
                  >
                    {teacher.isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-line pt-3 text-center">
              <button
                type="button"
                onClick={() => toast.success('Mở danh bạ toàn bộ 420 giáo viên trong hệ thống')}
                className="text-xs font-bold text-brand-600 hover:underline cursor-pointer"
              >
                Xem tất cả
              </button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default CommunityPage
