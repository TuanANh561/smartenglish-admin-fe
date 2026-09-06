import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  getConversationsForUser,
  getContactsForUser,
  getUsersForGroupCreation,
  MOCK_USERS,
} from './chatData'
import CreateGroupModal from './CreateGroupModal'
import PostComposer from './components/PostComposer'
import PostCard from './components/PostCard'
import ChatConversationSidebar from './components/ChatConversationSidebar'
import ChatFloatingWindows from './components/ChatFloatingWindows'
import TrendingTopicsCard from './components/TrendingTopicsCard'
import FeaturedTeachersCard from './components/FeaturedTeachersCard'
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

  const checkPostOwnership = useCallback(
    (post) => {
      if (!user) return false
      if (isAdmin) return true
      return (
        post.authorEmail === user.email ||
        post.authorName === user.displayName ||
        post.authorName === 'Hoàng Thị Mai'
      )
    },
    [isAdmin, user],
  )

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchTag = !selectedTag || post.tags.includes(selectedTag)
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
    setOpenConversationIds((prev) =>
      [...prev.filter((id) => id !== conversationId), conversationId].slice(-3),
    )
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    )
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
      participantAvatar:
        avatar ||
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80',
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
          <PostComposer
            isAdmin={isAdmin}
            postContent={postContent}
            setPostContent={setPostContent}
            attachedImage={attachedImage}
            setAttachedImage={setAttachedImage}
            attachedDoc={attachedDoc}
            setAttachedDoc={setAttachedDoc}
            isPosting={isPosting}
            isAiGenerating={isAiGenerating}
            handleAiSuggest={handleAiSuggest}
            handleCreatePost={handleCreatePost}
          />

          {/* ─── POSTS FEED LIST ────────────────────────────────────────── */}
          <div className="space-y-4">
            {filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-8 text-center text-xs text-slate-400">
                Không tìm thấy bài viết nào phù hợp.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isOwner={checkPostOwnership(post)}
                  isBookmarked={bookmarkedPostIds.has(post.id)}
                  isCommentOpen={activeCommentPostId === post.id}
                  isMenuOpen={activeMenuPostId === post.id}
                  onToggleMenu={() =>
                    setActiveMenuPostId(activeMenuPostId === post.id ? null : post.id)
                  }
                  onCloseMenu={() => setActiveMenuPostId(null)}
                  onEditPost={() => toast.success('Mở trình chỉnh sửa bài viết')}
                  onDeletePost={handleDeletePost}
                  onSelectTag={setSelectedTag}
                  onLikePost={handleLikePost}
                  onToggleComment={() =>
                    setActiveCommentPostId(
                      activeCommentPostId === post.id ? null : post.id,
                    )
                  }
                  onBookmarkPost={handleBookmarkPost}
                  onSharePost={handleSharePost}
                  commentInput={commentInputs[post.id] || ''}
                  onCommentInputChange={(id, val) =>
                    setCommentInputs((prev) => ({ ...prev, [id]: val }))
                  }
                  onAddComment={handleAddComment}
                />
              ))
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: TOPICS & FEATURED TEACHERS (4 COLS) ───────── */}
        <div className="lg:col-span-4 space-y-4">
          <ChatConversationSidebar
            conversations={conversations}
            filteredConversations={filteredConversations}
            contacts={contacts}
            conversationSearch={conversationSearch}
            setConversationSearch={setConversationSearch}
            getConversationAvatar={getConversationAvatar}
            onOpenConversation={handleOpenConversation}
            onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
          />

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

          <TrendingTopicsCard
            topics={TRENDING_TOPICS}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
          />

          <FeaturedTeachersCard
            teachers={teachers}
            onToggleFollow={handleToggleFollow}
          />
        </div>
      </div>

      <ChatFloatingWindows
        openConversationIds={openConversationIds}
        conversations={conversations}
        getConversationAvatar={getConversationAvatar}
        onCloseConversation={handleCloseConversation}
        messageDraft={messageDraft}
        setMessageDraft={setMessageDraft}
        onSendMessage={handleSendMessage}
      />

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
