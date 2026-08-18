import { useMemo, useState } from 'react'
import {
  Bookmark,
  Check,
  Download,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageCircle,
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
    <div className="space-y-4">
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
                    <div className="text-sm text-slate-800 leading-relaxed space-y-2.5 whitespace-pre-line">
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
                          <div className="px-3 py-1.5 text-xs text-slate-500 bg-slate-50 border-t border-line text-center italic">
                            {post.mediaCaption}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Attached Document File */}
                    {post.attachment && (
                      <div className="flex items-center justify-between rounded-xl border border-line bg-slate-50/70 p-3.5 text-sm">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 text-red-600 font-bold text-xs">
                            PDF
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{post.attachment.name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{post.attachment.size}</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toast.success(`Đang tải tập tin: ${post.attachment.name}`)}
                          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600 cursor-pointer shadow-2xs transition-colors"
                        >
                          <Download size={14} /> Tải về
                        </button>
                      </div>
                    )}

                    {/* Engagement Actions */}
                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500">
                      <div className="flex items-center gap-6">
                        {/* Like Button */}
                        <button
                          type="button"
                          onClick={() => handleLikePost(post.id)}
                          className={cn(
                            'flex items-center gap-1.5 font-semibold text-sm transition-colors cursor-pointer',
                            post.isLiked
                              ? 'text-red-500 font-bold'
                              : 'hover:text-red-500',
                          )}
                        >
                          <Heart
                            size={18}
                            className={cn(post.isLiked ? 'fill-red-500 text-red-500' : 'text-slate-400')}
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
                          className="flex items-center gap-1.5 font-semibold text-sm hover:text-brand-600 transition-colors cursor-pointer"
                        >
                          <MessageSquare size={18} className="text-slate-400" />
                          <span>{post.commentsCount}</span>
                        </button>
                      </div>

                      {/* Share Button */}
                      <button
                        type="button"
                        onClick={() => handleSharePost(post)}
                        className="flex items-center gap-1.5 font-semibold text-sm hover:text-brand-600 transition-colors cursor-pointer"
                      >
                        <Share2 size={18} className="text-slate-400" />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {/* ─── EXPANDABLE COMMENTS SECTION ────────────────────── */}
                    {isCommentOpen && (
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        {/* Existing comments */}
                        {post.comments?.length > 0 ? (
                          <div className="space-y-2.5 pl-10">
                            {post.comments.map((cmt) => (
                              <div key={cmt.id} className="rounded-xl bg-slate-50 p-3 text-sm space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 text-xs">{cmt.authorName}</span>
                                  <span className="text-[10px] text-slate-400">{cmt.createdAt}</span>
                                </div>
                                <p className="text-slate-700 text-sm">{cmt.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-ink-muted text-center py-1">
                            Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!
                          </p>
                        )}

                        {/* Add comment input */}
                        <div className="flex items-center gap-2.5 pt-1">
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
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddComment(post.id)}
                            className="rounded-xl bg-brand-500 hover:bg-brand-600 p-2 text-white cursor-pointer transition-colors"
                          >
                            <Send size={16} />
                          </button>
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
          {/* Search Bar */}
          <div className="flex w-full justify-end">
            <div className="relative w-full">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm bài viết, giáo viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Chủ đề thảo luận (Trending Topics - Mockup Top Right) */}
          <Card className="p-5 border border-line shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Chủ đề thảo luận</h2>

            <div className="space-y-2.5">
              {TRENDING_TOPICS.map((topic) => (
                <div
                  key={topic.tag}
                  onClick={() => setSelectedTag(selectedTag === topic.tag ? null : topic.tag)}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-xl transition-colors cursor-pointer group',
                    selectedTag === topic.tag
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div>
                    <p className="font-bold text-sm text-slate-900 group-hover:text-brand-600 transition-colors">
                      {topic.label}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{topic.postCount}</p>
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
              <h2 className="text-base font-bold text-slate-900">Giáo viên tiêu biểu</h2>
            </div>

            <div className="space-y-3.5">
              {teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={teacher.avatar}
                      alt={teacher.name}
                      className="h-10 w-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-900 truncate">{teacher.name}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{teacher.role}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleFollow(teacher.id)}
                    className={cn(
                      'rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer shrink-0 shadow-2xs',
                      teacher.isFollowing
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-blue-50 text-brand-700 hover:bg-blue-100 border border-blue-200 font-bold',
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
    </div>
  )
}

export default CommunityPage
