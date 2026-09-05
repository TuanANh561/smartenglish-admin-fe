import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bookmark,
  Download,
  FileText,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Search,
  Send,
  Share2,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import {
  getConversationsForUser,
  getContactsForUser,
  getUsersForGroupCreation,
  MOCK_USERS,
} from './chatData'
import CreateGroupModal from './CreateGroupModal'
import { INITIAL_POSTS, TOP_TEACHERS, TRENDING_TOPICS } from '@/mocks/data/posts'
import { useAuthStore } from '@/store/authStore'

function CommunityPage() {
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === 'admin'

  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [teachers, setTeachers] = useState(TOP_TEACHERS)
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set())
  const [conversations, setConversations] = useState(() => getConversationsForUser(user))
  const contacts = useMemo(() => getContactsForUser(user), [user])
  const availableUsersForGroup = useMemo(() => getUsersForGroupCreation(user), [user])
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  useEffect(() => {
    setConversations(getConversationsForUser(user))
  }, [user])

  const [conversationSearch, setConversationSearch] = useState('')
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [openConversationIds, setOpenConversationIds] = useState([])
  const [messageDraft, setMessageDraft] = useState('')

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

  const checkPostOwnership = useCallback((post) => {
    if (!user) return false
    if (isAdmin) return true
    return (
      post.authorEmail === user.email ||
      post.authorName === user.displayName ||
      post.authorName === 'Hoàng Thị Mai'
    )
  }, [isAdmin, user])

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
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
  }, [posts, selectedTag, searchQuery])

  const filteredConversations = useMemo(() => {
    const keyword = conversationSearch.trim().toLowerCase()
    return conversations.filter((conversation) =>
      !keyword || conversation.participantName.toLowerCase().includes(keyword),
    )
  }, [conversationSearch, conversations])

  const getConversationAvatar = (conversation) =>
    conversation.participantAvatar ||
    conversation.avatar ||
    contacts.find((contact) => contact.id === conversation.participantId)?.avatar

  const handleOpenConversation = (conversationId) => {
    setActiveConversationId(conversationId)
    setOpenConversationIds((prev) => [
      ...prev.filter((id) => id !== conversationId),
      conversationId,
    ].slice(-3))          // tối đa 3 panel cùng lúc
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    )
  }

  const handleToggleConversation = (conversationId) => {
    if (openConversationIds.includes(conversationId)) {
      setOpenConversationIds((prev) => prev.filter((id) => id !== conversationId))
      return
    }
    setActiveConversationId(conversationId)
    setOpenConversationIds((prev) => [...prev, conversationId])
  }

  const handleCloseConversation = (conversationId) => {
    setOpenConversationIds((prev) => prev.filter((id) => id !== conversationId))
    if (activeConversationId === conversationId) setActiveConversationId(null)
  }

  const handleCreateGroup = ({ name, members, avatar }) => {
    const myId = user?.id || (isAdmin ? MOCK_USERS.admin.id : MOCK_USERS.mai.id)
    const myName = user?.displayName || (isAdmin ? MOCK_USERS.admin.name : MOCK_USERS.mai.name)
    const myAvatar = user?.avatarUrl || (isAdmin ? MOCK_USERS.admin.avatar : MOCK_USERS.mai.avatar)

    const newGroupId = `conv-grp-${Date.now()}`
    const now = new Date()
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const newGroupConversation = {
      id: newGroupId,
      type: 'group',
      participantId: `grp-${Date.now()}`,
      participantName: name,
      participantRole: `Nhóm thảo luận (${members.length + 1} thành viên)`,
      participantAvatar: avatar || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80',
      lastMessage: `${myName} đã tạo nhóm`,
      lastTime: 'Vừa xong',
      unread: 0,
      online: true,
      memberCount: members.length + 1,
      messages: [
        {
          id: `m-init-${Date.now()}`,
          from: 'me',
          senderId: myId,
          senderName: myName,
          senderAvatar: myAvatar,
          text: `Chào mừng các thành viên tham gia nhóm "${name}"! Hãy bắt đầu thảo luận nào.`,
          time: timeString,
        },
      ],
    }

    setConversations((prev) => [newGroupConversation, ...prev])
    handleOpenConversation(newGroupId)
    toast.success(`Đã tạo nhóm "${name}" thành công!`)
  }

  const handleSendMessage = (conversationId) => {
    const text = messageDraft.trim()
    if (!text) return

    const now = new Date()
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    const myId = user?.id || (isAdmin ? MOCK_USERS.admin.id : MOCK_USERS.mai.id)
    const myName = user?.displayName || (isAdmin ? MOCK_USERS.admin.name : MOCK_USERS.mai.name)
    const myAvatar = user?.avatarUrl || (isAdmin ? MOCK_USERS.admin.avatar : MOCK_USERS.mai.avatar)

    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId
          ? {
              ...conversation,
              lastMessage: text,
              lastTime: 'Vừa xong',
              messages: [
                ...conversation.messages,
                {
                  id: `m-${Date.now()}`,
                  from: 'me',
                  senderId: myId,
                  senderName: myName,
                  senderAvatar: myAvatar,
                  text,
                  time: timeString,
                },
              ],
            }
          : conversation,
      ),
    )
    setMessageDraft('')
  }

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
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-sm font-bold text-slate-800">Cuộc trò chuyện</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {conversations.reduce((total, conversation) => total + conversation.unread, 0)} tin chưa đọc
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateGroupOpen(true)}
                  className="rounded-lg bg-navy-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-navy-800 transition-colors cursor-pointer"
                >
                  Tạo nhóm
                </button>
                <MessageSquare size={17} className="text-brand-500" />
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Nhập tên để tìm"
                value={conversationSearch}
                onChange={(event) => setConversationSearch(event.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-0.5 max-h-72 overflow-y-auto scrollbar-none no-scrollbar">
              {filteredConversations.map((conversation) => {
                const contact = contacts.find((c) => c.id === conversation.participantId)
                const roleLabel = conversation.participantRole || contact?.roleLabel
                const isStudent = conversation.participantRole?.includes('Học viên') || contact?.role === 'student'
                const isGroup = conversation.type === 'group' || contact?.isGroup
                const isAdminRole = conversation.participantRole?.includes('Quản trị viên') || contact?.role === 'admin'

                const roleBadgeClass =
                  isStudent
                    ? 'bg-emerald-50 text-emerald-700'
                    : isGroup && roleLabel?.toLowerCase().includes('học viên')
                    ? 'bg-blue-50 text-blue-700'
                    : isGroup
                    ? 'bg-purple-50 text-purple-700'
                    : isAdminRole
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => handleOpenConversation(conversation.id)}
                    className="flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={getConversationAvatar(conversation)}
                        alt={conversation.participantName}
                        className="h-10 w-10 rounded-full object-cover border border-slate-200"
                      />
                      {conversation.online && (
                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="truncate text-xs font-semibold text-slate-800">{conversation.participantName}</p>
                        <span className="shrink-0 text-[10px] text-slate-400">{conversation.lastTime}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {roleLabel && (
                          <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-semibold ${roleBadgeClass}`}>
                            {roleLabel}
                          </span>
                        )}
                        <p className="truncate text-[11px] text-slate-400">{conversation.lastMessage}</p>
                      </div>
                    </div>

                    {conversation.unread > 0 && (
                      <span className="min-w-[18px] rounded-full bg-brand-500 px-1.5 py-0.5 text-center text-[10px] font-bold text-white shrink-0">
                        {conversation.unread}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

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


      {openConversationIds.map((conversationId, index) => {
        const conversation = conversations.find((item) => item.id === conversationId)
        if (!conversation) return null

        return (
        <div
          key={conversation.id}
          className="fixed bottom-6 z-40 flex h-[min(560px,calc(100vh-4rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          style={{ right: `calc(6rem + ${(openConversationIds.length - index - 1) * 392}px)` }}
        >
          <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
            <Avatar src={getConversationAvatar(conversation)} name={conversation.participantName} size="md" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-navy-700">{conversation.participantName}</p>
              <div className="flex items-center gap-1 text-[11px] text-ink-muted">
                <span className={`h-2 w-2 rounded-full ${conversation.online ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {conversation.online ? 'Đang trực tuyến' : 'Đang offline'}
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng cuộc trò chuyện"
              onClick={() => handleCloseConversation(conversation.id)}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-canvas hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>

        {conversation && (
          <>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto scrollbar-none no-scrollbar bg-canvas px-4 py-4">
              {conversation.messages.map((message) => {
                const isMe = message.from === 'me'
                const isGroup = conversation.type === 'group'

                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 ${
                      isMe ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    {/* Avatar người gửi — chỉ hiện trong group chat và tin nhắn của người khác */}
                    {isGroup && !isMe ? (
                      <img
                        src={message.senderAvatar}
                        alt={message.senderName}
                        className="h-7 w-7 rounded-full object-cover border border-slate-200 shrink-0 mb-0.5"
                      />
                    ) : (
                      /* placeholder để căn chỉnh tin nhắn của mình trong group */
                      isGroup && <span className="w-7 shrink-0" />
                    )}

                    <div className={`flex flex-col max-w-[72%] ${ isMe ? 'items-end' : 'items-start'}`}>
                      {/* Tên người gửi — chỉ hiện trong group, không phải tin của mình */}
                      {isGroup && !isMe && (
                        <span className="mb-0.5 px-1 text-[10px] font-semibold text-slate-500">
                          {message.senderName}
                        </span>
                      )}
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          isMe
                            ? 'rounded-br-sm bg-navy-700 text-white'
                            : 'rounded-bl-sm border border-line bg-white text-ink shadow-xs'
                        }`}
                      >
                        {message.text}
                        <p className={`mt-0.5 text-[10px] ${ isMe ? 'text-white/60 text-right' : 'text-ink-muted'}`}>
                          {message.time}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="shrink-0 border-t border-line bg-white p-4">
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') handleSendMessage(conversation.id)
                  }}
                  placeholder="Viết tin nhắn..."
                  className="h-10 flex-1 rounded-lg border border-line bg-canvas px-3 text-sm text-ink outline-none focus:border-brand-500"
                />
                <Button icon={Send} onClick={() => handleSendMessage(conversation.id)}>Gửi</Button>
              </div>
            </div>
          </>
        )}
        </div>
        )
      })}

      {/* Modal tạo nhóm mới */}
      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        availableUsers={availableUsersForGroup}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  )
}

export default CommunityPage
