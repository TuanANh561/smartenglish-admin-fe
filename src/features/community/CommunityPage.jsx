import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import CreateGroupModal from './CreateGroupModal'
import PostComposer from './components/PostComposer'
import PostCard from './components/PostCard'
import ChatConversationSidebar from './components/ChatConversationSidebar'
import ChatFloatingWindows from './components/ChatFloatingWindows'
import TrendingTopicsCard from './components/TrendingTopicsCard'
import FeaturedTeachersCard from './components/FeaturedTeachersCard'
import SharePostModal from './components/SharePostModal'
import FindFriendsModal from './components/FindFriendsModal'
import { sanitizeAvatarUrl } from '@/components/ui/Avatar'
import { useAuthStore, TEST_USERS } from '@/store/authStore'
import { useChatStore } from '@/store/chatStore'
import { http } from '@/lib/api'
import { formatRelativeTime, cn } from '@/lib/utils'
import { subscribeToConversation, connectSocket, subscribeToTyping, sendTyping, subscribeToUserEvents } from './socketService'


const DEFAULT_TEACHERS = [
  {
    id: 2,
    name: 'Thầy John Smith',
    role: 'Senior IELTS Instructor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    followersCount: 1420,
    isFollowing: true,
  },
  {
    id: 8,
    name: 'Vũ Đức Thắng',
    role: 'TOEIC & Grammar Specialist',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    followersCount: 890,
    isFollowing: false,
  },
  {
    id: 9,
    name: 'Phạm Thanh Hà',
    role: 'IELTS Speaking Examiner',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    followersCount: 1150,
    isFollowing: false,
  },
]

function CommunityPage() {
  const user = useAuthStore((s) => s.user)
  const [searchParams] = useSearchParams()
  const asUserParam = searchParams.get('asUser') || searchParams.get('userId') || searchParams.get('as')
  const [realUsers, setRealUsers] = useState([])

  const currentDbUser = useMemo(() => {
    if (asUserParam) {
      const targetId =
        Number(asUserParam) ||
        (asUserParam.toLowerCase() === 'teacher'
          ? 2
          : asUserParam.toLowerCase() === 'student'
          ? 3
          : 1)
      const found = realUsers.find((u) => Number(u.id) === targetId)
      return (
        found ||
        TEST_USERS[targetId] || {
          id: targetId,
          displayName: targetId === 2 ? 'Thầy John Smith' : 'Người dùng',
          role: targetId === 2 ? 'teacher' : 'student',
        }
      )
    }
    if (user && user.id) return user
    return (
      realUsers.find((u) => u.role === 'admin' || Number(u.id) === 1) || {
        id: 1,
        displayName: 'Quản trị viên',
        email: 'admin@smartenglish.com',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      }
    )
  }, [asUserParam, user, realUsers])

  const myId = Number(currentDbUser?.id) || 1
  const isAdmin = currentDbUser?.role === 'admin'
  const myName = currentDbUser?.displayName || currentDbUser?.name || 'Quản trị viên Hệ thống'
  const myAvatar =
    sanitizeAvatarUrl(currentDbUser?.avatarUrl) ||
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80'

  useEffect(() => {
    if (asUserParam && currentDbUser && user?.id !== currentDbUser.id) {
      useAuthStore.getState().setUser(currentDbUser)
    }
  }, [asUserParam, currentDbUser, user?.id])

  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [postPage, setPostPage] = useState(0)
  const [hasMorePosts, setHasMorePosts] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [teachers, setTeachers] = useState(DEFAULT_TEACHERS)
  const [selectedTag, setSelectedTag] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState(new Set())
  const [conversations, setConversations] = useState([])

  const contacts = useMemo(() => {
    return realUsers.map((u) => ({
      id: u.id,
      name: u.displayName || u.username,
      avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      roleLabel: u.role === 'teacher' ? 'Giáo viên' : u.role === 'admin' ? 'Quản trị viên' : 'Học viên',
      role: u.role,
    }))
  }, [realUsers])

  const availableUsersForGroup = useMemo(() => {
    return realUsers
      .filter((u) => u.id !== myId)
      .map((u) => ({
        id: u.id,
        name: u.displayName || u.username,
        avatar: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        roleLabel: u.role === 'teacher' ? 'Giáo viên' : u.role === 'admin' ? 'Quản trị viên' : 'Học viên',
        role: u.role,
        email: u.email,
      }))
  }, [realUsers, myId])

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  // Share post modal state
  const [sharingPost, setSharingPost] = useState(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Friends and Friend Requests state
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [sentRequestUserIds, setSentRequestUserIds] = useState(new Set())
  const [isFindFriendsOpen, setIsFindFriendsOpen] = useState(false)

  // Helper to convert internal role string to Vietnamese display label
  const getRoleLabel = useCallback((role) => {
    if (!role) return 'Học viên'
    const r = String(role).toLowerCase()
    if (r.includes('admin') || r.includes('quản trị')) return 'Quản trị viên'
    if (r.includes('teacher') || r.includes('giáo viên') || r.includes('instructor')) return 'Giáo viên'
    if (r.includes('student') || r.includes('học viên') || r.includes('user')) return 'Học viên'
    return 'Học viên'
  }, [])

  // Default diverse, reliable Unsplash avatar links for users without avatar in database
  const FALLBACK_AVATARS = useMemo(
    () => [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    ],
    [],
  )

  const realUsersRef = useRef([])
  useEffect(() => {
    realUsersRef.current = realUsers
  }, [realUsers])

  // Fetch real users from auth-service
  const fetchUsers = useCallback(async () => {
    try {
      const res = await http.get('/admin/users?size=50')
      const userList = res?.data?.items || (Array.isArray(res?.data) ? res?.data : (res?.items || []))
      if (Array.isArray(userList)) {
        setRealUsers(
          userList.map((u, idx) => {
            const cleanUrl = sanitizeAvatarUrl(u.avatarUrl)
            const fallbackAvatar = FALLBACK_AVATARS[idx % FALLBACK_AVATARS.length]
            return {
              ...u,
              avatarUrl: cleanUrl || fallbackAvatar,
            }
          }),
        )
      }
    } catch (err) {
      console.warn('Could not fetch real users from auth-service:', err)
    }
  }, [FALLBACK_AVATARS])

  // Load real posts from MongoDB Atlas with pagination (10 posts per batch)
  const fetchPosts = useCallback(
    async (showSkeleton = false, pageNum = 0) => {
      if (showSkeleton) setIsLoadingPosts(true)
      if (pageNum > 0) setIsLoadingMore(true)
      try {
        const res = await http.get(`/api/v1/social/posts?page=${pageNum}&size=10`)
        const data = res?.data || res
        const list = Array.isArray(data?.posts)
          ? data.posts
          : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : []

        const formatted = list.map((p) => ({
          ...p,
          createdAt: p.createdAt || 'Vừa xong',
          isLiked: Array.isArray(p.likedUserIds) && p.likedUserIds.includes(myId),
          likesCount: p.likesCount || (p.likedUserIds ? p.likedUserIds.length : 0),
          commentsCount: p.commentsCount || (p.comments ? p.comments.length : 0),
          comments: Array.isArray(p.comments) ? p.comments : [],
          tags: Array.isArray(p.tags) ? p.tags : [],
          mediaUrl: p.mediaUrl || p.imageUrl,
        }))

        if (pageNum === 0) {
          setPosts(formatted)
        } else {
          setPosts((prev) => {
            const existingIds = new Set(prev.map((item) => item.id))
            const uniqueNew = formatted.filter((item) => !existingIds.has(item.id))
            return [...prev, ...uniqueNew]
          })
        }

        setPostPage(pageNum)
        const hasMore = data?.hasMore !== undefined ? data.hasMore : list.length >= 10
        setHasMorePosts(hasMore)
      } catch (err) {
        console.warn('Cannot fetch posts from MongoDB Atlas:', err)
      } finally {
        setIsLoadingPosts(false)
        setIsLoadingMore(false)
      }
    },
    [myId],
  )

  // Sentinel IntersectionObserver for infinite scrolling (triggers on 8th post of current batch)
  const observerRef = useRef(null)
  const triggerPostRef = useCallback(
    (node) => {
      if (isLoadingPosts || isLoadingMore) return
      if (observerRef.current) observerRef.current.disconnect()
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMorePosts) {
            fetchPosts(false, postPage + 1)
          }
        },
        { rootMargin: '120px' },
      )
      if (node) observerRef.current.observe(node)
    },
    [isLoadingPosts, isLoadingMore, hasMorePosts, postPage, fetchPosts],
  )

  // Navigate to post and highlight when clicked from Chat (closes chat window & fetches if not loaded)
  const handleNavigateToPost = useCallback(
    (postId, conversationId) => {
      if (!postId) return

      // Tắt cửa sổ chat để không che mất nội dung bài viết
      if (conversationId) {
        setOpenConversationIds((prev) => prev.filter((id) => String(id) !== String(conversationId)))
      } else {
        setOpenConversationIds([])
      }

      const el = document.getElementById(`post-${postId}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
        }, 3000)
      } else {
        // Bài viết chưa được nạp lên feed (ví dụ bài cũ thuộc các trang sau):
        toast.loading('Đang tải bài viết được chia sẻ...', { id: 'nav-post' })
        http
          .get(`/api/v1/social/posts/${postId}`)
          .then((res) => {
            const postData = res?.data || res
            if (postData && postData.id) {
              setPosts((prev) => [
                {
                  ...postData,
                  createdAt: postData.createdAt || 'Vừa xong',
                  isLiked: Array.isArray(postData.likedUserIds) && postData.likedUserIds.includes(myId),
                  likesCount: postData.likesCount || (postData.likedUserIds ? postData.likedUserIds.length : 0),
                  commentsCount: postData.commentsCount || (postData.comments ? postData.comments.length : 0),
                  comments: Array.isArray(postData.comments) ? postData.comments : [],
                  tags: Array.isArray(postData.tags) ? postData.tags : [],
                  mediaUrl: postData.mediaUrl || postData.imageUrl,
                },
                ...prev.filter((p) => String(p.id) !== String(postData.id)),
              ])

              toast.success('Đã chuyển đến bài viết!', { id: 'nav-post' })

              setTimeout(() => {
                const newEl = document.getElementById(`post-${postId}`)
                if (newEl) {
                  newEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  newEl.classList.add('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
                  setTimeout(() => {
                    newEl.classList.remove('ring-4', 'ring-brand-500', 'shadow-2xl', 'scale-[1.01]')
                  }, 3000)
                }
              }, 250)
            } else {
              toast.error('Bài viết này không tồn tại hoặc đã bị tác giả xóa', { id: 'nav-post' })
            }
          })
          .catch(() => {
            toast.error('Bài viết này không tồn tại hoặc đã bị tác giả xóa', { id: 'nav-post' })
          })
      }
    },
    [myId],
  )

  // Load real conversations from MongoDB Atlas
  const fetchConversations = useCallback(async () => {
    try {
      const res = await http.get(`/api/v1/social/conversations?userId=${myId}`)
      const data = res?.data || res
      if (Array.isArray(data)) {
        const total = data.reduce((sum, c) => sum + (Number(c.unreadCount) || 0), 0)
        useChatStore.getState().setTotalUnreadCount(total)

        setConversations((prev) => {
          const prevMap = new Map((prev || []).map((p) => [p.id, p]))
          return data.map((c) => {
            const isDirect = (c.type || '').toUpperCase() === 'DIRECT'
            // In 1-1 direct conversation, identify the OTHER participant
            const otherMember = c.members?.find((m) => Number(m.userId) !== myId)
            const otherUserId = Number(
              otherMember?.userId ||
                (isDirect ? c.memberIds?.find((id) => Number(id) !== myId) : null) ||
                c.participantId,
            )

            // Look up details from realUsers (via ref) or TEST_USERS
            const currentUsers = realUsersRef.current || []
            const matchedUser =
              (otherUserId ? currentUsers.find((u) => Number(u.id) === otherUserId) : null) ||
              (otherUserId ? TEST_USERS[otherUserId] : null)

            const resolvedRole = isDirect
              ? getRoleLabel(matchedUser?.role || otherMember?.role)
              : `Nhóm (${c.memberIds?.length || 2} thành viên)`

            const resolvedName = isDirect
              ? (matchedUser?.displayName || matchedUser?.name || otherMember?.name || 'Người dùng')
              : (c.name || 'Nhóm trò chuyện')

            const rawAvatar = isDirect
              ? (matchedUser?.avatarUrl || matchedUser?.avatar || otherMember?.avatar)
              : c.avatar
            const resolvedAvatar = sanitizeAvatarUrl(rawAvatar)

            const existing = prevMap.get(c.id)
            const preservedMessages =
              existing?.messages && existing.messages.length > 0
                ? existing.messages
                : Array.isArray(c.messages)
                ? c.messages
                : []

            return {
              ...c,
              type: (c.type || 'direct').toLowerCase(),
              participantId: otherUserId || c.id,
              participantName: resolvedName,
              participantAvatar: resolvedAvatar,
              participantRole: resolvedRole,
              lastMessage: c.lastMessage || 'Bắt đầu cuộc trò chuyện',
              lastTime: formatRelativeTime(c.lastMessageAt),
              unread: Number(c.unreadCount) || 0,
              online: true,
              messages: preservedMessages,
            }
          })
        })
      }
    } catch (err) {
      console.warn('Cannot fetch conversations from MongoDB Atlas, using fallback:', err)
    }
  }, [myId, getRoleLabel])

  // Load friends and pending requests from MongoDB Atlas
  const fetchFriends = useCallback(async () => {
    try {
      const res = await http.get(`/api/v1/social/friends?userId=${myId}`)
      const list = res?.data || res
      if (Array.isArray(list)) setFriends(list)
    } catch (err) {
      console.warn('Cannot fetch friends:', err)
    }
  }, [myId])

  const fetchFriendRequests = useCallback(async () => {
    try {
      const res = await http.get(`/api/v1/social/friends/requests?userId=${myId}`)
      const list = res?.data || res
      if (Array.isArray(list)) setPendingRequests(list)
    } catch (err) {
      console.warn('Cannot fetch friend requests:', err)
    }
  }, [myId])

  const fetchSentRequests = useCallback(async () => {
    try {
      const res = await http.get(`/api/v1/social/friends/sent-requests?userId=${myId}`)
      const list = res?.data || res
      if (Array.isArray(list)) {
        setSentRequestUserIds(new Set(list.map((r) => Number(r.addresseeId))))
      }
    } catch (err) {
      console.warn('Cannot fetch sent friend requests:', err)
    }
  }, [myId])

  useEffect(() => {
    if (!myId) return
    fetchUsers()
    fetchPosts(true)
    fetchConversations()
    fetchFriends()
    fetchFriendRequests()
    fetchSentRequests()
    // Connect WebSocket on page load
    connectSocket()
  }, [myId])

  useEffect(() => {
    if (isFindFriendsOpen) {
      fetchFriends()
      fetchFriendRequests()
      fetchSentRequests()
    }
  }, [isFindFriendsOpen, fetchFriends, fetchFriendRequests, fetchSentRequests])

  const [conversationSearch, setConversationSearch] = useState('')
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [openConversationIds, setOpenConversationIds] = useState([])
  const openConversationIdsRef = useRef(openConversationIds)
  useEffect(() => {
    openConversationIdsRef.current = openConversationIds
  }, [openConversationIds])

  const [messageDraft, setMessageDraft] = useState('')

  // Real-time personal channel for instant friend events & incoming messages
  useEffect(() => {
    if (!myId) return
    const unsubscribe = subscribeToUserEvents(myId, (event) => {
      if (event.type === 'FRIEND_ACCEPTED') {
        fetchFriends()
        fetchConversations()
        toast.success(
          `${event.friendName || 'Bạn mới'} đã chấp nhận lời mời kết bạn! Cuộc trò chuyện đã sẵn sàng.`,
          { icon: '🎉' },
        )
      } else if (event.type === 'FRIEND_REQUEST_RECEIVED') {
        fetchFriendRequests()
        toast.info('Bạn vừa nhận được một lời mời kết bạn mới!', { icon: '👋' })
      } else if (event.type === 'NEW_MESSAGE') {
        const incomingMsg = event.message
        const convId = String(event.conversationId)
        const isOpen = openConversationIdsRef.current?.some((id) => String(id) === convId)

        const isSharePost = incomingMsg?.type === 'SHARE_POST' || incomingMsg?.sharedPost != null
        const displayPreview = isSharePost ? '[Chia sẻ bài viết]' : (incomingMsg?.content || 'Đã gửi một tin nhắn')

        if (isOpen) {
          // If the user is currently watching this conversation, mark as read immediately!
          http.post(`/api/v1/social/conversations/${convId}/read?userId=${myId}`).catch(() => {})
        } else {
          toast.info(
            `${event.senderName || 'Tin nhắn mới'}: ${displayPreview}`,
            { duration: 4000 },
          )
          useChatStore.getState().incrementUnreadCount(1)
        }

        // Real-time update the conversations state and promote to top
        setConversations((prev) => {
          const target = prev.find((c) => String(c.id) === convId)
          if (!target) {
            fetchConversations()
            return prev
          }

          const prevMsgs = target.messages || []
          const exists = prevMsgs.some((m) => String(m.id) === String(incomingMsg?.id))
          const formatted = incomingMsg
            ? {
                ...incomingMsg,
                from: String(incomingMsg.senderId) === String(myId) ? 'me' : 'other',
                text: incomingMsg.content,
                time: incomingMsg.createdAt
                  ? new Date(incomingMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : 'Vừa xong',
              }
            : null

          const nextMsgs = exists
            ? prevMsgs
            : formatted
            ? [...prevMsgs, formatted]
            : prevMsgs

          const updatedTarget = {
            ...target,
            lastMessage: displayPreview,
            lastMessageSenderId: incomingMsg?.senderId ?? target.lastMessageSenderId,
            lastMessageSenderName: incomingMsg?.senderName ?? target.lastMessageSenderName,
            lastTime: 'Vừa xong',
            unread: isOpen ? 0 : (Number(target.unread) || 0) + 1,
            messages: nextMsgs,
          }

          return [updatedTarget, ...prev.filter((c) => String(c.id) !== convId)]
        })
      }
    })
    return () => {
      unsubscribe?.()
    }
  }, [myId, fetchFriends, fetchConversations, fetchFriendRequests])

  // Automatically sync conversations list whenever global total unread count changes
  const totalUnreadCount = useChatStore((s) => s.totalUnreadCount)
  const prevTotalUnreadRef = useRef(totalUnreadCount)
  useEffect(() => {
    if (prevTotalUnreadRef.current !== totalUnreadCount) {
      prevTotalUnreadRef.current = totalUnreadCount
      fetchConversations()
    }
  }, [totalUnreadCount, fetchConversations])

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
        Number(post.authorId) === Number(myId) ||
        post.authorEmail === user.email ||
        post.authorName === myName
      )
    },
    [isAdmin, myId, myName, user],
  )


  // Filtered Posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchTag = !selectedTag || (post.tags && post.tags.includes(selectedTag))
      const keyword = searchQuery.trim().toLowerCase()
      const matchSearch =
        !keyword ||
        post.content?.toLowerCase().includes(keyword) ||
        post.authorName?.toLowerCase().includes(keyword) ||
        post.tags?.some((t) => t.toLowerCase().includes(keyword))

      return matchTag && matchSearch
    })
  }, [posts, selectedTag, searchQuery])

  // Dynamic Trending Topics computed from posts with curated fallback
  const trendingTopics = useMemo(() => {
    const tagCountMap = {}
    posts.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => {
          if (tag) tagCountMap[tag] = (tagCountMap[tag] || 0) + 1
        })
      }
    })

    const dynamicTopics = Object.entries(tagCountMap).map(([tag, count]) => ({
      tag,
      label: `#${tag}`,
      postCount: `${count} bài viết`,
      count,
    }))

    const curated = [
      { tag: 'IELTS', label: '#IELTS', postCount: '128 bài viết', count: 128 },
      { tag: 'WritingTips', label: '#WritingTips', postCount: '94 bài viết', count: 94 },
      { tag: 'Collocations', label: '#Collocations', postCount: '82 bài viết', count: 82 },
      { tag: 'SmartEnglish', label: '#SmartEnglish', postCount: '76 bài viết', count: 76 },
      { tag: 'Speaking_Part2', label: '#Speaking_Part2', postCount: '65 bài viết', count: 65 },
      { tag: 'GrammarMaster', label: '#GrammarMaster', postCount: '53 bài viết', count: 53 },
    ]

    const list = [...dynamicTopics]
    curated.forEach((c) => {
      if (!list.some((item) => item.tag.toLowerCase() === c.tag.toLowerCase())) {
        list.push(c)
      }
    })

    return list.slice(0, 6)
  }, [posts])

  const filteredConversations = useMemo(() => {
    const keyword = conversationSearch.trim().toLowerCase()
    return conversations.filter((conversation) =>
      !keyword || (conversation.participantName || conversation.name || '').toLowerCase().includes(keyword),
    )
  }, [conversationSearch, conversations])

  const getConversationAvatar = (conversation) =>
    conversation.participantAvatar ||
    conversation.avatar ||
    contacts.find((contact) => contact.id === conversation.participantId)?.avatar

  const handleOpenConversation = async (conversationId) => {
    setActiveConversationId(conversationId)
    setOpenConversationIds((prev) =>
      [...prev.filter((id) => id !== conversationId), conversationId].slice(-3),
    )
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation,
      ),
    )

    // Mark as read in backend and update store
    http
      .post(`/api/v1/social/conversations/${conversationId}/read?userId=${myId}`)
      .then((res) => {
        const remaining = res?.data?.unreadCount ?? res?.unreadCount
        if (remaining !== undefined) {
          useChatStore.getState().setTotalUnreadCount(remaining)
        } else {
          useChatStore.getState().fetchUnreadCount(myId)
        }
      })
      .catch(() => {})

    // Load messages from MongoDB Atlas
    try {
      const res = await http.get(`/api/v1/social/conversations/${conversationId}/messages`)
      const msgs = res?.data || res
      if (Array.isArray(msgs)) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: msgs.map((m) => ({
                    ...m,
                    from: m.senderId === myId ? 'me' : 'other',
                    text: m.content,
                    time: m.createdAt ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Vừa xong',
                  })),
                }
              : c,
          ),
        )
      }
    } catch (err) {
      console.warn('Error loading messages from API:', err)
    }

    // Subscribe to typing indicator for this conversation
    subscribeToTyping(conversationId, (typingEvent) => {
      if (!typingEvent || Number(typingEvent.userId) === Number(myId)) return
      useChatStore.getState().setTyping(conversationId, typingEvent)
      if (typingEvent.isTyping) {
        setTimeout(() => {
          useChatStore.getState().clearTyping(conversationId)
        }, 3500)
      }
    })

    // Subscribe to STOMP WebSocket topic for this conversation
    subscribeToConversation(conversationId, (incomingMsg) => {
      if (incomingMsg.type === 'READ_RECEIPT') return

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            const existsIndex = c.messages?.findIndex((m) => m.id === incomingMsg.id)
            let updatedMessages
            const formattedIncoming = {
              ...incomingMsg,
              from: incomingMsg.senderId === myId ? 'me' : 'other',
              text: incomingMsg.content,
              time: incomingMsg.createdAt
                ? new Date(incomingMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Vừa xong',
            }

            if (existsIndex >= 0) {
              updatedMessages = [...c.messages]
              updatedMessages[existsIndex] = formattedIncoming
            } else {
              updatedMessages = [...(c.messages || []), formattedIncoming]
            }

            return {
              ...c,
              lastMessage: incomingMsg.content,
              lastMessageSenderId: incomingMsg.senderId ?? c.lastMessageSenderId,
              lastMessageSenderName: incomingMsg.senderName ?? c.lastMessageSenderName,
              lastTime: 'Vừa xong',
              unread: 0,
              messages: updatedMessages,
            }
          }
          return c
        }),
      )

      if (incomingMsg.senderId !== myId) {
        http.post(`/api/v1/social/conversations/${conversationId}/read?userId=${myId}`).catch(() => {})
      }
    })
  }

  const typingMap = useChatStore((s) => s.typingMap)

  const handleSendTyping = (convId, isTyping) => {
    sendTyping(convId, myId, myName, isTyping)
  }

  const handleCloseConversation = (conversationId) => {
    setOpenConversationIds((prev) => prev.filter((id) => id !== conversationId))
    if (activeConversationId === conversationId) setActiveConversationId(null)
  }

  // Create Group in MongoDB Atlas
  const handleCreateGroup = async ({ name, members, avatar }) => {
    try {
      const memberList = [
        { userId: myId, name: myName, avatar: myAvatar, role: 'OWNER' },
        ...members.map((m) => ({
          userId: Number(m.id || m.userId || Date.now()),
          name: m.name || m.displayName,
          avatar: m.avatar,
          role: 'MEMBER',
        })),
      ]

      const res = await http.post('/api/v1/social/conversations/group', {
        name,
        avatar: avatar || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80',
        createdBy: myId,
        members: memberList,
      })

      const newConv = res?.data || res
      const formattedConv = {
        ...newConv,
        participantId: newConv.id,
        participantName: name,
        participantRole: `Nhóm thảo luận (${memberList.length} thành viên)`,
        participantAvatar: newConv.avatar,
        lastMessage: `${myName} đã tạo nhóm`,
        lastTime: 'Vừa xong',
        unread: 0,
        online: true,
        memberCount: memberList.length,
        messages: [],
      }

      setConversations((prev) => [formattedConv, ...prev])
      handleOpenConversation(newConv.id)
      toast.success(`Đã tạo nhóm "${name}" thành công!`)
    } catch (err) {
      console.error('Error creating group:', err)
      toast.error('Lỗi khi tạo nhóm')
    }
  }

  // Send Message (supporting ReplyTo) in MongoDB Atlas
  const handleSendMessage = async (conversationId, replyTarget = null) => {
    const text = messageDraft.trim()
    if (!text) return

    setMessageDraft('')

    const payload = {
      senderId: myId,
      senderName: myName,
      senderAvatar: myAvatar,
      type: 'TEXT',
      content: text,
      replyTo: replyTarget
        ? {
            messageId: replyTarget.id,
            senderName: replyTarget.senderName,
            content: replyTarget.text || replyTarget.content,
          }
        : null,
    }

    try {
      const res = await http.post(`/api/v1/social/conversations/${conversationId}/messages`, payload)
      const savedMsg = res?.data || res

      setConversations((prev) => {
        const target = prev.find((c) => c.id === conversationId)
        if (!target) return prev
        const alreadyExists = target.messages?.some((m) => m.id === savedMsg.id)
        if (alreadyExists) return prev
        const updated = {
          ...target,
          lastMessage: text,
          lastMessageSenderId: myId,
          lastMessageSenderName: myName,
          lastTime: 'Vừa xong',
          messages: [
            ...(target.messages || []),
            {
              ...savedMsg,
              from: 'me',
              text,
              time: 'Vừa xong',
            },
          ],
        }
        return [updated, ...prev.filter((c) => c.id !== conversationId)]
      })
    } catch (err) {
      console.error('Error sending message:', err)
      toast.error('Lỗi khi gửi tin nhắn')
    }
  }

  // React to Message
  const handleReactMessage = async (conversationId, messageId, reactionType) => {
    try {
      const res = await http.post(
        `/api/v1/social/conversations/${conversationId}/messages/${messageId}/reactions?userId=${myId}&reactionType=${reactionType}`,
      )
      const updated = res?.data || res

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: (c.messages || []).map((m) => (m.id === messageId ? { ...m, reactions: updated.reactions } : m)),
            }
          }
          return c
        }),
      )
    } catch (err) {
      console.error('Error reacting to message:', err)
    }
  }

  // Recall Message (Thu hồi)
  const handleRecallMessage = async (conversationId, messageId) => {
    try {
      await http.post(
        `/api/v1/social/conversations/${conversationId}/messages/${messageId}/recall?userId=${myId}`,
      )
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: (c.messages || []).map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      isRecalled: true,
                      content: 'Tin nhắn đã được thu hồi',
                      text: 'Tin nhắn đã được thu hồi',
                      attachmentUrl: null,
                      sharedPost: null,
                    }
                  : m,
              ),
            }
          }
          return c
        }),
      )
      toast.success('Đã thu hồi tin nhắn')
    } catch (err) {
      console.error('Error recalling message:', err)
      toast.error('Không thể thu hồi tin nhắn')
    }
  }

  // Toggle Pin Message
  const handleTogglePinMessage = async (conversationId, messageId) => {
    try {
      const res = await http.post(
        `/api/v1/social/conversations/${conversationId}/messages/${messageId}/pin`,
      )
      const updated = res?.data || res

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: (c.messages || []).map((m) => (m.id === messageId ? { ...m, isPinned: updated.isPinned } : m)),
            }
          }
          return c
        }),
      )
      toast.success(updated.isPinned ? 'Đã ghim tin nhắn' : 'Đã bỏ ghim tin nhắn')
    } catch (err) {
      console.error('Error pinning message:', err)
    }
  }

  // Send Media Message (Image or File)
  const handleSendMediaMessage = async (conversationId, mediaData) => {
    try {
      const payload = {
        senderId: myId,
        senderName: myName,
        senderAvatar: myAvatar,
        ...mediaData,
      }
      const res = await http.post(`/api/v1/social/conversations/${conversationId}/messages`, payload)
      const savedMsg = res?.data || res

      setConversations((prev) => {
        const target = prev.find((c) => c.id === conversationId)
        if (!target) return prev
        const updated = {
          ...target,
          lastMessage: payload.content,
          lastMessageSenderId: myId,
          lastMessageSenderName: myName,
          lastTime: 'Vừa xong',
          messages: [
            ...(target.messages || []),
            {
              ...savedMsg,
              from: 'me',
              text: payload.content,
              time: 'Vừa xong',
            },
          ],
        }
        return [updated, ...prev.filter((c) => c.id !== conversationId)]
      })
      toast.success('Đã gửi tệp thành công!')
    } catch (err) {
      console.error('Error sending media message:', err)
      toast.error('Lỗi khi gửi tệp')
    }
  }

  // Like Post in MongoDB Atlas
  const handleLikePost = async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextLiked ? (p.likesCount || 0) + 1 : Math.max(0, (p.likesCount || 1) - 1),
          }
        }
        return p
      }),
    )

    try {
      await http.post(`/api/v1/social/posts/${postId}/like?userId=${myId}`)
    } catch (err) {
      console.error('Error liking post:', err)
    }
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

  // Share Post via Chat Modal
  const handleSharePost = (post) => {
    setSharingPost(post)
    setIsShareModalOpen(true)
  }

  const handleConfirmShareToConversation = async (targetConversationId, post) => {
    try {
      const postInfo = {
        postId: post.id,
        authorId: post.authorId || myId,
        authorName: post.authorName,
        authorAvatar: post.authorAvatar,
        content: post.content,
        imageUrl: post.mediaUrl || post.imageUrl || null,
      }

      const res = await http.post(
        `/api/v1/social/conversations/${targetConversationId}/share-post?senderId=${myId}&senderName=${encodeURIComponent(myName)}&senderAvatar=${encodeURIComponent(myAvatar)}`,
        postInfo,
      )
      const savedMsg = res?.data || res

      toast.success('Đã chia sẻ bài viết vào cuộc trò chuyện!')

      // Immediately promote conversation to index 0 and update local state
      setConversations((prev) => {
        const target = prev.find((c) => c.id === targetConversationId)
        if (!target) return prev
        const updated = {
          ...target,
          lastMessage: '[Chia sẻ bài viết]',
          lastMessageSenderId: myId,
          lastMessageSenderName: myName,
          lastTime: 'Vừa xong',
          unread: 0,
          messages: [
            ...(target.messages || []),
            {
              ...savedMsg,
              from: 'me',
              text: '[Chia sẻ bài viết]',
              time: 'Vừa xong',
            },
          ],
        }
        return [updated, ...prev.filter((c) => c.id !== targetConversationId)]
      })

      handleOpenConversation(targetConversationId)
    } catch (err) {
      console.error('Error sharing post:', err)
      toast.error('Không thể chia sẻ bài viết')
    }
  }

  // Friendships Handlers
  const handleSendFriendRequest = async (targetUser) => {
    try {
      const body = {
        requesterId: myId,
        requesterName: myName,
        requesterAvatar: myAvatar,
        addresseeId: Number(targetUser.id),
        addresseeName: targetUser.name || targetUser.displayName || targetUser.username || targetUser.email,
        addresseeAvatar: targetUser.avatarUrl || targetUser.avatar || '',
      }
      await http.post('/api/v1/social/friends/request', body)
      setSentRequestUserIds((prev) => new Set([...prev, Number(targetUser.id)]))
      toast.success(`Đã gửi lời mời kết bạn tới ${body.addresseeName}`)
    } catch (err) {
      console.error('Error sending friend request:', err)
      toast.error('Không thể gửi lời mời kết bạn')
    }
  }

  const handleRespondFriendRequest = async (friendshipId, accept) => {
    try {
      const body = {
        friendshipId,
        currentUserId: myId,
        accept,
      }
      await http.post('/api/v1/social/friends/respond', body)
      setPendingRequests((prev) => prev.filter((r) => r.id !== friendshipId))
      if (accept) {
        toast.success('Đã chấp nhận kết bạn thành công!')
        fetchFriends()
        fetchConversations()
      } else {
        toast.success('Đã từ chối lời mời kết bạn')
      }
    } catch (err) {
      console.error('Error responding friend request:', err)
      toast.error('Có lỗi xảy ra khi xử lý lời mời')
    }
  }

  const handleStartChatWithUser = async (targetUser) => {
    const targetUserId = Number(targetUser.id)
    const existing = conversations.find(
      (c) => c.type === 'direct' && Number(c.participantId) === targetUserId,
    )
    if (existing) {
      handleOpenConversation(existing.id)
      return
    }

    try {
      const targetName =
        targetUser.name || targetUser.displayName || targetUser.username || targetUser.email
      const targetAvatar = targetUser.avatarUrl || targetUser.avatar || ''
      const res = await http.post(
        `/api/v1/social/conversations/direct?myId=${myId}&myName=${encodeURIComponent(myName)}&myAvatar=${encodeURIComponent(myAvatar || '')}&friendId=${targetUserId}&friendName=${encodeURIComponent(targetName)}&friendAvatar=${encodeURIComponent(targetAvatar)}`,
      )
      const conv = res?.data || res
      if (conv?.id) {
        await fetchConversations()
        handleOpenConversation(conv.id)
      }
    } catch (err) {
      console.error('Error creating direct conversation:', err)
      toast.error('Không thể mở cuộc trò chuyện')
    }
  }

  // Delete Post in MongoDB Atlas
  const handleDeletePost = async (postId, e) => {
    e?.stopPropagation()
    try {
      await http.delete(`/api/v1/social/posts/${postId}?userId=${myId}&isAdmin=${isAdmin}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
      setActiveMenuPostId(null)
      toast.success('Đã xoá bài viết thành công')
    } catch (err) {
      console.error('Error deleting post:', err)
      toast.error('Không thể xoá bài viết')
    }
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

  // Create Post in MongoDB Atlas
  const handleCreatePost = async (e) => {
    e?.preventDefault?.()
    if (!postContent.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết')
      return
    }

    setIsPosting(true)
    try {
      const req = {
        authorId: myId,
        authorName: myName,
        authorEmail: user?.email || (isAdmin ? 'admin@smartenglish.vn' : 'mai.ht@gmail.com'),
        authorRole: isAdmin ? 'Quản trị viên' : 'Giáo viên',
        authorTitle: isAdmin ? 'Quản trị viên' : 'Senior Instructor • SmartEnglish AI',
        authorAvatar: myAvatar,
        content: postContent.trim(),
        mediaType: attachedImage ? 'image' : null,
        mediaUrl: attachedImage,
        mediaCaption: attachedImage ? 'Hình ảnh học liệu đính kèm' : null,
        attachment: attachedDoc,
        tags: postContent.match(/#[\w_]+/g)?.map((t) => t.replace('#', '')) || ['SmartEnglish'],
      }

      const res = await http.post('/api/v1/social/posts', req)
      const savedPost = res?.data || res

      // Cập nhật lại danh sách bài viết từ server để bảo đảm hiển thị đầy đủ dữ liệu thực
      await fetchPosts().catch(() => {
        if (savedPost && savedPost.id) {
          setPosts((prev) => [
            {
              ...savedPost,
              createdAt: 'Vừa xong',
              isLiked: false,
              likesCount: 0,
              commentsCount: 0,
              comments: [],
              tags: req.tags,
            },
            ...prev,
          ])
        }
      })

      // Đã đưa lên feed thành công -> dọn dẹp form và hiển thị thông báo
      setPostContent('')
      setAttachedImage(null)
      setAttachedDoc(null)
      toast.success('Đã đăng bài viết thành công!')
    } catch (err) {
      console.error('Error creating post:', err)
      toast.error('Không thể đăng bài viết. Vui lòng thử lại.')
    } finally {
      setIsPosting(false)
    }
  }

  // Add Comment in MongoDB Atlas
  const handleAddComment = async (postId) => {
    const text = commentInputs[postId]?.trim()
    if (!text) return

    try {
      const res = await http.post(`/api/v1/social/posts/${postId}/comments`, {
        authorId: myId,
        authorName: myName,
        authorAvatar: myAvatar,
        authorRole: isAdmin ? 'Quản trị viên' : 'Giáo viên',
        content: text,
      })

      const savedComment = res?.data || res

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: (p.commentsCount || 0) + 1,
              comments: [...(p.comments || []), savedComment],
            }
          }
          return p
        }),
      )

      setCommentInputs((prev) => ({ ...prev, [postId]: '' }))
      toast.success('Đã gửi bình luận!')
    } catch (err) {
      console.error('Error adding comment:', err)
      toast.error('Lỗi khi gửi bình luận')
    }
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
            {isLoadingPosts ? (
              <div className="space-y-4">
                {[1, 2, 3].map((skeletonId) => (
                  <div
                    key={skeletonId}
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs animate-pulse space-y-4"
                  >
                    {/* Author header skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 rounded bg-slate-200" />
                          <div className="h-2.5 w-20 rounded bg-slate-100" />
                        </div>
                      </div>
                      <div className="h-4 w-6 rounded bg-slate-100" />
                    </div>

                    {/* Content text lines skeleton */}
                    <div className="space-y-2 pt-1">
                      <div className="h-3 w-full rounded bg-slate-200" />
                      <div className="h-3 w-5/6 rounded bg-slate-200" />
                      <div className="h-3 w-3/5 rounded bg-slate-100" />
                    </div>

                    {/* Media placeholder skeleton (first card) */}
                    {skeletonId === 1 && (
                      <div className="h-44 w-full rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <div className="h-8 w-8 rounded-full bg-slate-200" />
                      </div>
                    )}

                    {/* Tags skeleton */}
                    <div className="flex gap-2">
                      <div className="h-5 w-16 rounded-md bg-slate-100" />
                      <div className="h-5 w-20 rounded-md bg-slate-100" />
                    </div>

                    {/* Footer buttons skeleton */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="h-6 w-14 rounded-lg bg-slate-100" />
                        <div className="h-6 w-14 rounded-lg bg-slate-100" />
                        <div className="h-6 w-14 rounded-lg bg-slate-100" />
                      </div>
                      <div className="h-6 w-6 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center text-slate-400 shadow-2xs">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FileText size={22} />
                </div>
                <p className="text-sm font-semibold text-slate-700">Chưa có bài viết nào</p>
                <p className="text-xs text-slate-400 mt-1">Hãy là người đầu tiên chia sẻ kiến thức hoặc kinh nghiệm học tiếng Anh!</p>
              </div>
            ) : (
              <>
                {filteredPosts.map((post, index) => {
                  const triggerIndex = filteredPosts.length >= 8 ? filteredPosts.length - 3 : filteredPosts.length - 1
                  const isTrigger = index === triggerIndex && hasMorePosts
                  return (
                    <PostCard
                      key={post.id}
                      post={post}
                      cardRef={isTrigger ? triggerPostRef : null}
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
                  )
                })}

                {/* Loading indicator when fetching next batch */}
                {isLoadingMore && (
                  <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span className="text-xs font-medium text-slate-500">Đang tải thêm bài viết...</span>
                  </div>
                )}

                {/* All caught up footer */}
                {!hasMorePosts && filteredPosts.length >= 8 && (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    ✨ Bạn đã xem hết tất cả các bài viết trong cộng đồng
                  </div>
                )}
              </>
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
            onOpenFindFriends={() => setIsFindFriendsOpen(true)}
            pendingRequestsCount={pendingRequests.length}
            myId={myId}
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
            topics={trendingTopics}
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
        myId={myId}
        myName={myName}
        openConversationIds={openConversationIds}
        conversations={conversations}
        getConversationAvatar={getConversationAvatar}
        onCloseConversation={handleCloseConversation}
        messageDraft={messageDraft}
        setMessageDraft={setMessageDraft}
        onSendMessage={handleSendMessage}
        onReactMessage={handleReactMessage}
        onRecallMessage={handleRecallMessage}
        onTogglePinMessage={handleTogglePinMessage}
        onSendMediaMessage={handleSendMediaMessage}
        typingMap={typingMap}
        onTyping={handleSendTyping}
        onNavigateToPost={handleNavigateToPost}
      />

      {/* Modal tạo nhóm mới */}
      <CreateGroupModal
        open={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        availableUsers={availableUsersForGroup}
        onCreateGroup={handleCreateGroup}
      />

      {/* Modal tìm bạn & kết bạn */}
      <FindFriendsModal
        open={isFindFriendsOpen}
        onClose={() => setIsFindFriendsOpen(false)}
        myId={myId}
        myName={myName}
        availableUsers={availableUsersForGroup}
        friends={friends}
        pendingRequests={pendingRequests}
        sentRequestUserIds={sentRequestUserIds}
        onSendFriendRequest={handleSendFriendRequest}
        onRespondFriendRequest={handleRespondFriendRequest}
        onStartChatWithUser={handleStartChatWithUser}
      />

      {/* Modal chia sẻ bài viết vào cuộc trò chuyện */}
      <SharePostModal
        open={isShareModalOpen}
        onClose={() => {
          setIsShareModalOpen(false)
          setSharingPost(null)
        }}
        post={sharingPost}
        conversations={conversations}
        onShare={handleConfirmShareToConversation}
      />
    </div>
  )
}

export default CommunityPage
