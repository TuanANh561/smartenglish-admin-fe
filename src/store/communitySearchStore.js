import { create } from 'zustand'

export const useCommunitySearchStore = create((set, get) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  resetSearchQuery: () => set({ searchQuery: '', isSearchingMode: false, isDropdownOpen: false }),

  // Trạng thái Dropdown tìm kiếm trên Topbar
  isDropdownOpen: false,
  setIsDropdownOpen: (isOpen) => set({ isDropdownOpen: isOpen }),

  // Chế độ xem Kết quả tìm kiếm toàn diện (thay thế PostComposer và Feed)
  isSearchingMode: false,
  setIsSearchingMode: (isSearching) => set({ isSearchingMode: isSearching }),

  // Tab đang kích hoạt trong SearchResults: 'posts' | 'users'
  searchActiveTab: 'posts',
  setSearchActiveTab: (tab) => set({ searchActiveTab: tab }),

  // Chủ đề thảo luận được đồng bộ từ CommunityPage
  trendingTopics: [],
  setTrendingTopics: (topics) => set({ trendingTopics: topics }),

  // Tag đang được chọn để lọc
  selectedTag: null,
  setSelectedTag: (tag) => set({ selectedTag: tag }),

  // Danh sách users, friends, requests từ CommunityPage để Dropdown sử dụng
  users: [],
  setUsers: (users) => set({ users }),
  friends: [],
  setFriends: (friends) => set({ friends }),
  pendingRequests: [],
  setPendingRequests: (requests) => set({ pendingRequests: requests }),
  sentRequestUserIds: new Set(),
  setSentRequestUserIds: (ids) => set({ sentRequestUserIds: ids }),
  onlineUserIds: new Set(),
  setOnlineUserIds: (ids) => set({ onlineUserIds: ids }),

  // Callbacks được đăng ký từ CommunityPage để gọi API
  onSendFriendRequest: null,
  onRespondFriendRequest: null,
  onStartChatWithUser: null,
  registerActions: ({ onSendFriendRequest, onRespondFriendRequest, onStartChatWithUser }) =>
    set({ onSendFriendRequest, onRespondFriendRequest, onStartChatWithUser }),
}))
