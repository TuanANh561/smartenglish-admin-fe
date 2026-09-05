// ─────────────────────────────────────────────────────────────────────────────
// CHAT MOCK DATA & SERVICE
//
// Kiến trúc bám sát REST API / WebSocket khi kết nối backend (PostgreSQL + MongoDB):
// - Người dùng & Liên hệ: GET /api/chat/contacts
// - Danh sách hội thoại:  GET /api/chat/conversations?userId=...
// - Lịch sử tin nhắn:     GET /api/chat/conversations/:id/messages
// - Gửi tin nhắn:         POST /api/chat/conversations/:id/messages
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_USERS = {
  admin: {
    id: 'u-13',
    userCode: 'ADM-001',
    name: 'Quản trị viên',
    role: 'admin',
    roleLabel: 'Quản trị viên',
    email: 'admin@smartenglish.edu.vn',
    maskedEmail: 'ad***@smartenglish.edu.vn',
    department: 'Ban Quản Trị Trung Tâm',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
  },
  mai: {
    id: 'u-8',
    userCode: 'GV-2026-08',
    name: 'Hoàng Thị Mai',
    role: 'teacher',
    roleLabel: 'Giảng viên IELTS',
    email: 'mai.ht@smartenglish.edu.vn',
    maskedEmail: 'ma***@smartenglish.edu.vn',
    department: 'Tổ Chuyên Môn IELTS',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  },
  thang: {
    id: 'u-5',
    userCode: 'GV-2026-05',
    name: 'Vũ Đức Thắng',
    role: 'teacher',
    roleLabel: 'Giảng viên TOEIC',
    email: 'thang.vd@smartenglish.edu.vn',
    maskedEmail: 'th***@smartenglish.edu.vn',
    department: 'Tổ Chuyên Môn TOEIC',
    status: 'busy',
    lastSeen: 'Đang soạn giáo án',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  },
  ha_teacher: {
    id: 'u-ha',
    userCode: 'GV-2026-09',
    name: 'Phạm Thanh Hà',
    role: 'teacher',
    roleLabel: 'Giảng viên Speaking',
    email: 'ha.pt@smartenglish.edu.vn',
    maskedEmail: 'ha***@smartenglish.edu.vn',
    department: 'Tổ Chuyên Môn Speaking',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&auto=format&fit=crop&q=80',
  },
  tuan: {
    id: 'u-1',
    userCode: 'HV-2026-01',
    name: 'Nguyễn Anh Tuấn',
    role: 'student',
    roleLabel: 'Học viên IELTS 6.5+',
    email: 'tuan.na@student.smartenglish.edu.vn',
    maskedEmail: 'tu***@student.smartenglish.edu.vn',
    department: 'Lớp IELTS Master 6.5+',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  },
  linh: {
    id: 'u-4',
    userCode: 'HV-2026-04',
    name: 'Phạm Mỹ Linh',
    role: 'student',
    roleLabel: 'Học viên Speaking',
    email: 'linh.pm@student.smartenglish.edu.vn',
    maskedEmail: 'li***@student.smartenglish.edu.vn',
    department: 'Lớp Speaking Intensive',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  },
  khoi: {
    id: 'u-khoi',
    userCode: 'HV-2026-15',
    name: 'Trần Minh Khôi',
    role: 'student',
    roleLabel: 'Học viên IELTS',
    email: 'khoi.tm@student.smartenglish.edu.vn',
    maskedEmail: 'kh***@student.smartenglish.edu.vn',
    department: 'Lớp IELTS Foundation',
    status: 'online',
    lastSeen: 'Vừa online',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  },
  phuong_anh: {
    id: 'u-phuonganh',
    userCode: 'HV-2026-22',
    name: 'Lê Thị Phương Anh',
    role: 'student',
    roleLabel: 'Học viên TOEIC',
    email: 'anh.ltp@student.smartenglish.edu.vn',
    maskedEmail: 'an***@student.smartenglish.edu.vn',
    department: 'Lớp TOEIC 750+ Sprint',
    status: 'offline',
    lastSeen: '15 phút trước',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  },
  doha: {
    id: 'u-6',
    userCode: 'HV-2026-06',
    name: 'Đỗ Thu Hà',
    role: 'student',
    roleLabel: 'Học viên Grammar',
    email: 'ha.dt@student.smartenglish.edu.vn',
    maskedEmail: 'ha***@student.smartenglish.edu.vn',
    department: 'Lớp English Grammar Pro',
    status: 'offline',
    lastSeen: '1 giờ trước',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  },
  lan: {
    id: 'u-lan',
    userCode: 'HV-2026-31',
    name: 'Bùi Thị Lan',
    role: 'student',
    roleLabel: 'Học viên Vocabulary',
    email: 'lan.bt@student.smartenglish.edu.vn',
    maskedEmail: 'la***@student.smartenglish.edu.vn',
    department: 'Lớp Vocabulary & Collocations',
    status: 'offline',
    lastSeen: 'Hôm qua',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&auto=format&fit=crop&q=80',
  },
}

export const MOCK_GROUPS = {
  class_mai: {
    id: 'grp-class-mai',
    name: 'Lớp IELTS Master 6.5+ (Cô Mai)',
    roleLabel: 'Nhóm học viên',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=200&auto=format&fit=crop&q=80',
    memberCount: 22,
    online: true,
  },
  teachers: {
    id: 'grp-teachers',
    name: 'Tổ Chuyên Môn Tiếng Anh',
    roleLabel: 'Nhóm giảng viên',
    avatar: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&auto=format&fit=crop&q=80',
    memberCount: 8,
    online: true,
  },
  management: {
    id: 'grp-management',
    name: 'Ban Quản Trị & Giảng Viên',
    roleLabel: 'Nhóm nội bộ',
    avatar: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&auto=format&fit=crop&q=80',
    memberCount: 5,
    online: true,
  },
  class_toeic: {
    id: 'grp-class-toeic',
    name: 'Lớp TOEIC 750+ Sprint',
    roleLabel: 'Nhóm học viên',
    avatar: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&auto=format&fit=crop&q=80',
    memberCount: 18,
    online: false,
  },
  announcements: {
    id: 'grp-announcements',
    name: 'Kênh Thông Báo Toàn Trung Tâm',
    roleLabel: 'Kênh thông báo',
    avatar: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=200&auto=format&fit=crop&q=80',
    memberCount: 128,
    online: true,
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS DÀNH CHO GIẢNG VIÊN HOÀNG THỊ MAI (Teacher)
// ─────────────────────────────────────────────────────────────────────────────
const TEACHER_MAI_CONVERSATIONS = [
  // 1. Chat với Quản trị viên (Admin)
  {
    id: 'conv-mai-admin',
    type: 'direct',
    participantId: MOCK_USERS.admin.id,
    participantName: MOCK_USERS.admin.name,
    participantRole: 'Quản trị viên',
    participantAvatar: MOCK_USERS.admin.avatar,
    lastMessage: 'Ok cô nhé, phòng đào tạo sẽ xuất bản khoá học lên hệ thống chiều nay.',
    lastTime: '5 phút trước',
    unread: 1,
    online: true,
    messages: [
      { id: 'm-ma-1', from: 'them', text: 'Chào cô Mai, giáo trình IELTS Speaking quý 4 đã hoàn thiện chưa cô?', time: '08:45' },
      { id: 'm-ma-2', from: 'me', text: 'Dạ em đã tải file hoàn chỉnh lên Google Drive của tổ chuyên môn rồi ạ.', time: '08:50' },
      { id: 'm-ma-3', from: 'them', text: 'Tuyệt vời, ban đào tạo đang review nội dung, thấy bài tập bổ trợ rất phong phú.', time: '09:00' },
      { id: 'm-ma-4', from: 'me', text: 'Vâng anh, em có bổ sung thêm các chủ đề bám sát đề thi thật 2026.', time: '09:05' },
      { id: 'm-ma-5', from: 'them', text: 'Ok cô nhé, phòng đào tạo sẽ xuất bản khoá học lên hệ thống chiều nay.', time: '09:15' },
    ],
  },

  // 2. Chat với Đồng nghiệp: Thầy Vũ Đức Thắng (Giảng viên TOEIC)
  {
    id: 'conv-mai-thang',
    type: 'direct',
    participantId: MOCK_USERS.thang.id,
    participantName: MOCK_USERS.thang.name,
    participantRole: 'Giảng viên TOEIC',
    participantAvatar: MOCK_USERS.thang.avatar,
    lastMessage: 'Nhất trí luôn! Cảm ơn cô Mai nhiều nhé.',
    lastTime: '20 phút trước',
    unread: 0,
    online: false,
    messages: [
      { id: 'm-mt-1', from: 'them', text: 'Cô Mai ơi, sáng mai cô có trống tiết không? Cho tôi đổi ca lớp IELTS 6.5 sáng mai được không?', time: '08:15' },
      { id: 'm-mt-2', from: 'me', text: 'Được thầy Thắng ơi, sáng mai em trống tiết 2 và 3. Thầy dạy bù giúp em ca tối thứ 5 nhé.', time: '08:20' },
      { id: 'm-mt-3', from: 'them', text: 'Ok cô, tối thứ 5 tôi trực ca đó giúp cô nhé.', time: '08:22' },
      { id: 'm-mt-4', from: 'me', text: 'Vâng ạ, em gửi slide bài giảng tuần 3 qua zalo thầy rồi nha.', time: '08:25' },
      { id: 'm-mt-5', from: 'them', text: 'Nhất trí luôn! Cảm ơn cô Mai nhiều nhé.', time: '08:30' },
    ],
  },

  // 3. Chat với Học viên: Nguyễn Anh Tuấn (Học viên hỏi bài Writing)
  {
    id: 'conv-mai-tuan',
    type: 'direct',
    participantId: MOCK_USERS.tuan.id,
    participantName: MOCK_USERS.tuan.name,
    participantRole: 'Học viên IELTS 6.5+',
    participantAvatar: MOCK_USERS.tuan.avatar,
    lastMessage: 'Dạ em cảm ơn cô Mai nhiều ạ, bài chữa chi tiết quá!',
    lastTime: '30 phút trước',
    unread: 2,
    online: true,
    messages: [
      { id: 'm-mtu-1', from: 'them', text: 'Cô Mai ơi, em vừa nộp lại bài Writing Task 2 chủ đề Environment, cô xem giúp em đạt 6.5 chưa ạ?', time: '09:20' },
      { id: 'm-mtu-2', from: 'me', text: 'Cô vừa xem qua bài của Tuấn rồi nhé. Luận điểm rõ ràng, từ vựng học thuật tốt.', time: '09:25' },
      { id: 'm-mtu-3', from: 'them', text: 'Dạ em cảm ơn cô! Đoạn thân bài 2 em dùng các từ nối như thế đã tự nhiên chưa cô?', time: '09:27' },
      { id: 'm-mtu-4', from: 'me', text: 'Đoạn 2 em nên thay "On the other hand" bằng "Conversely" hoặc "From another perspective" để tránh lặp nhé.', time: '09:30' },
      { id: 'm-mtu-5', from: 'them', text: 'Dạ em cảm ơn cô Mai nhiều ạ, bài chữa chi tiết quá!', time: '09:32' },
    ],
  },

  // 4. Chat với Học viên: Phạm Mỹ Linh (Học viên xin tài liệu Speaking)
  {
    id: 'conv-mai-linh',
    type: 'direct',
    participantId: MOCK_USERS.linh.id,
    participantName: MOCK_USERS.linh.name,
    participantRole: 'Học viên Speaking',
    participantAvatar: MOCK_USERS.linh.avatar,
    lastMessage: 'Dạ em nhận được tài liệu rồi, em cảm ơn cô Mai ạ!',
    lastTime: '1 giờ trước',
    unread: 0,
    online: true,
    messages: [
      { id: 'm-ml-1', from: 'them', text: 'Cô Mai ơi cho em xin bộ Forecast Speaking Part 2 quý này với ạ, tuần sau em thi thử rồi.', time: '08:00' },
      { id: 'm-ml-2', from: 'me', text: 'Cô vừa gửi file PDF qua email cho Linh rồi nhé, chú ý các chủ đề về AI và Renewable Energy.', time: '08:05' },
      { id: 'm-ml-3', from: 'them', text: 'Dạ em nhận được tài liệu rồi, em cảm ơn cô Mai ạ!', time: '08:08' },
    ],
  },

  // 5. Chat với Học viên: Đỗ Thu Hà (Học viên hỏi thắc mắc Grammar)
  {
    id: 'conv-mai-ha',
    type: 'direct',
    participantId: MOCK_USERS.doha.id,
    participantName: MOCK_USERS.doha.name,
    participantRole: 'Học viên Grammar',
    participantAvatar: MOCK_USERS.doha.avatar,
    lastMessage: 'Em hiểu rồi, cảm ơn cô Mai giải thích siêu dễ hiểu!',
    lastTime: '2 giờ trước',
    unread: 0,
    online: false,
    messages: [
      { id: 'm-mh-1', from: 'them', text: 'Cô ơi câu điều kiện loại 3 với Mixed Conditionals em hay bị nhầm thì quá cô ạ.', time: '07:30' },
      { id: 'm-mh-2', from: 'me', text: 'Em cứ nhớ nguyên tắc: Vế If giả định quá khứ (had + P2), vế chính kết quả hiện tại (would + V-inf) nhé.', time: '07:35' },
      { id: 'm-mh-3', from: 'them', text: 'Em hiểu rồi, cảm ơn cô Mai giải thích siêu dễ hiểu!', time: '07:40' },
    ],
  },

  // 6. Nhóm Lớp IELTS Master 6.5+ (Cô Mai phụ trách)
  {
    id: 'conv-grp-class-mai',
    type: 'group',
    participantId: MOCK_GROUPS.class_mai.id,
    participantName: MOCK_GROUPS.class_mai.name,
    participantRole: MOCK_GROUPS.class_mai.roleLabel,
    participantAvatar: MOCK_GROUPS.class_mai.avatar,
    lastMessage: 'Tuấn: Em đã nộp bài tập Writing Task 1 rồi cô ơi!',
    lastTime: '15 phút trước',
    unread: 4,
    online: true,
    memberCount: MOCK_GROUPS.class_mai.memberCount,
    messages: [
      {
        id: 'm-gcm-1',
        from: 'me',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Chào cả lớp! Nhắc nhở hạn nộp bài tập Writing Task 1 là 23h59 tối nay trên hệ thống nhé.',
        time: '08:00',
      },
      {
        id: 'm-gcm-2',
        from: 'them',
        senderId: MOCK_USERS.linh.id,
        senderName: MOCK_USERS.linh.name,
        senderAvatar: MOCK_USERS.linh.avatar,
        text: 'Dạ cô ơi bài biểu đồ đường thì có cần so sánh trend giữa các năm không cô?',
        time: '08:10',
      },
      {
        id: 'm-gcm-3',
        from: 'me',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Có nhé Linh, luôn cần chỉ ra xu hướng tăng giảm nổi bật trong phần Overview.',
        time: '08:12',
      },
      {
        id: 'm-gcm-4',
        from: 'them',
        senderId: MOCK_USERS.tuan.id,
        senderName: MOCK_USERS.tuan.name,
        senderAvatar: MOCK_USERS.tuan.avatar,
        text: 'Em đã nộp bài tập Writing Task 1 rồi cô ơi!',
        time: '08:25',
      },
    ],
  },

  // 7. Nhóm Tổ Chuyên Môn Tiếng Anh
  {
    id: 'conv-grp-teachers',
    type: 'group',
    participantId: MOCK_GROUPS.teachers.id,
    participantName: MOCK_GROUPS.teachers.name,
    participantRole: MOCK_GROUPS.teachers.roleLabel,
    participantAvatar: MOCK_GROUPS.teachers.avatar,
    lastMessage: 'Hà: Mình đã gửi bộ câu hỏi Speaking quý mới vào folder chung.',
    lastTime: '45 phút trước',
    unread: 3,
    online: true,
    memberCount: MOCK_GROUPS.teachers.memberCount,
    messages: [
      {
        id: 'm-gt-1',
        from: 'them',
        senderId: MOCK_USERS.thang.id,
        senderName: MOCK_USERS.thang.name,
        senderAvatar: MOCK_USERS.thang.avatar,
        text: 'Mọi người đã chốt đề thi thử tháng 9 cho học viên chưa?',
        time: '07:45',
      },
      {
        id: 'm-gt-2',
        from: 'me',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Mình vừa hoàn thành bộ đề Reading và Listening rồi, đã tải lên folder tổ chuyên môn.',
        time: '07:50',
      },
      {
        id: 'm-gt-3',
        from: 'them',
        senderId: MOCK_USERS.ha_teacher.id,
        senderName: MOCK_USERS.ha_teacher.name,
        senderAvatar: MOCK_USERS.ha_teacher.avatar,
        text: 'Mình đã gửi bộ câu hỏi Speaking quý mới vào folder chung, các thầy cô xem qua nhé.',
        time: '08:00',
      },
    ],
  },

  // 8. Nhóm Ban Quản Trị & Giảng Viên
  {
    id: 'conv-grp-management',
    type: 'group',
    participantId: MOCK_GROUPS.management.id,
    participantName: MOCK_GROUPS.management.name,
    participantRole: MOCK_GROUPS.management.roleLabel,
    participantAvatar: MOCK_GROUPS.management.avatar,
    lastMessage: 'Admin: Buổi demo tính năng AI chấm bài diễn ra lúc 14h chiều nay.',
    lastTime: '2 giờ trước',
    unread: 1,
    online: true,
    memberCount: MOCK_GROUPS.management.memberCount,
    messages: [
      {
        id: 'm-gm-1',
        from: 'them',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Chào các thầy cô, trung tâm chuẩn bị cập nhật tính năng AI hỗ trợ chấm bài Writing.',
        time: '07:00',
      },
      {
        id: 'm-gm-2',
        from: 'me',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Tính năng này rất hữu ích, giáo viên sẽ có thêm công cụ hỗ trợ gợi ý chữa bài cho học viên.',
        time: '07:15',
      },
      {
        id: 'm-gm-3',
        from: 'them',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Buổi demo tính năng AI chấm bài diễn ra lúc 14h chiều nay, mời thầy cô tham gia.',
        time: '07:30',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS DÀNH CHO QUẢN TRỊ VIÊN (Admin)
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_CONVERSATIONS = [
  // 1. Chat với Giảng viên: Hoàng Thị Mai
  {
    id: 'conv-admin-mai',
    type: 'direct',
    participantId: MOCK_USERS.mai.id,
    participantName: MOCK_USERS.mai.name,
    participantRole: 'Giảng viên IELTS',
    participantAvatar: MOCK_USERS.mai.avatar,
    lastMessage: 'Ok cô nhé, phòng đào tạo sẽ xuất bản khoá học lên hệ thống chiều nay.',
    lastTime: '5 phút trước',
    unread: 1,
    online: true,
    messages: [
      { id: 'm-am-1', from: 'me', text: 'Chào cô Mai, giáo trình IELTS Speaking quý 4 đã hoàn thiện chưa cô?', time: '08:45' },
      { id: 'm-am-2', from: 'them', text: 'Dạ em đã tải file hoàn chỉnh lên Google Drive của tổ chuyên môn rồi ạ.', time: '08:50' },
      { id: 'm-am-3', from: 'me', text: 'Tuyệt vời, ban đào tạo đang review nội dung, thấy bài tập bổ trợ rất phong phú.', time: '09:00' },
      { id: 'm-am-4', from: 'them', text: 'Vâng anh, em có bổ sung thêm các chủ đề bám sát đề thi thật 2026.', time: '09:05' },
      { id: 'm-am-5', from: 'me', text: 'Ok cô nhé, phòng đào tạo sẽ xuất bản khoá học lên hệ thống chiều nay.', time: '09:15' },
    ],
  },

  // 2. Chat với Giảng viên: Vũ Đức Thắng
  {
    id: 'conv-admin-thang',
    type: 'direct',
    participantId: MOCK_USERS.thang.id,
    participantName: MOCK_USERS.thang.name,
    participantRole: 'Giảng viên TOEIC',
    participantAvatar: MOCK_USERS.thang.avatar,
    lastMessage: 'Dạ em đã cập nhật và sửa lỗi chính tả ở slide 12 rồi anh.',
    lastTime: '18 phút trước',
    unread: 0,
    online: false,
    messages: [
      { id: 'm-at-1', from: 'me', text: 'Thầy Thắng kiểm tra lại slide bài giảng khóa TOEIC bài 5 giúp anh nhé.', time: '08:10' },
      { id: 'm-at-2', from: 'them', text: 'Dạ em đã cập nhật và sửa lỗi chính tả ở slide 12 rồi anh.', time: '08:25' },
      { id: 'm-at-3', from: 'me', text: 'Tốt lắm, anh đã duyệt và mở khóa bài học cho học viên rồi.', time: '08:28' },
    ],
  },

  // 3. Chat với Giảng viên: Phạm Thanh Hà
  {
    id: 'conv-admin-ha',
    type: 'direct',
    participantId: MOCK_USERS.ha_teacher.id,
    participantName: MOCK_USERS.ha_teacher.name,
    participantRole: 'Giảng viên Speaking',
    participantAvatar: MOCK_USERS.ha_teacher.avatar,
    lastMessage: 'Vâng em nhận lịch rồi, cảm ơn admin!',
    lastTime: '1 giờ trước',
    unread: 0,
    online: true,
    messages: [
      { id: 'm-ah-1', from: 'me', text: 'Cô Hà phụ trách lớp Speaking cấp tốc khai giảng thứ 3 tuần sau nhé.', time: '07:50' },
      { id: 'm-ah-2', from: 'them', text: 'Vâng em nhận lịch rồi, cảm ơn admin!', time: '08:00' },
    ],
  },

  // 4. Chat Hỗ trợ Học viên: Trần Minh Khôi (Hỗ trợ kích hoạt gói học Premium)
  {
    id: 'conv-admin-khoi',
    type: 'direct',
    participantId: MOCK_USERS.khoi.id,
    participantName: MOCK_USERS.khoi.name,
    participantRole: 'Học viên (Hỗ trợ tài khoản)',
    participantAvatar: MOCK_USERS.khoi.avatar,
    lastMessage: 'Dạ em cảm ơn admin nhiều ạ, hệ thống hỗ trợ nhanh quá!',
    lastTime: '25 phút trước',
    unread: 2,
    online: true,
    messages: [
      { id: 'm-ak-1', from: 'them', text: 'Chào admin, em vừa chuyển khoản gói Premium 1 năm nhưng app chưa mở khóa ạ.', time: '08:35' },
      { id: 'm-ak-2', from: 'me', text: 'Chào bạn, bạn gửi mã giao dịch ngân hàng để bên mình kiểm tra ngay nhé.', time: '08:37' },
      { id: 'm-ak-3', from: 'them', text: 'Dạ mã giao dịch là VCB-9928172 lúc 08h30 sáng nay ạ.', time: '08:40' },
      { id: 'm-ak-4', from: 'me', text: 'Hệ thống đã khớp giao dịch thành công! Tài khoản của bạn đã được kích hoạt Premium 1 năm.', time: '08:42' },
      { id: 'm-ak-5', from: 'them', text: 'Dạ em cảm ơn admin nhiều ạ, hệ thống hỗ trợ nhanh quá!', time: '08:45' },
    ],
  },

  // 5. Chat Tư vấn Học viên: Lê Thị Phương Anh (Tư vấn khóa học mới)
  {
    id: 'conv-admin-phuonganh',
    type: 'direct',
    participantId: MOCK_USERS.phuong_anh.id,
    participantName: MOCK_USERS.phuong_anh.name,
    participantRole: 'Học viên (Tư vấn khoá học)',
    participantAvatar: MOCK_USERS.phuong_anh.avatar,
    lastMessage: 'Vâng em vừa đăng ký giữ chỗ rồi ạ, cảm ơn admin!',
    lastTime: '2 giờ trước',
    unread: 0,
    online: false,
    messages: [
      { id: 'm-ap-1', from: 'them', text: 'Admin ơi cho em hỏi lớp IELTS 6.5 của cô Mai còn chỗ không ạ?', time: '07:10' },
      { id: 'm-ap-2', from: 'me', text: 'Chào bạn, lớp của cô Mai đang còn 2 suất cuối khai giảng vào tuần sau nhé.', time: '07:15' },
      { id: 'm-ap-3', from: 'them', text: 'Vâng em vừa đăng ký giữ chỗ rồi ạ, cảm ơn admin!', time: '07:20' },
    ],
  },

  // 6. Nhóm Ban Quản Trị & Giảng Viên
  {
    id: 'conv-admin-grp-management',
    type: 'group',
    participantId: MOCK_GROUPS.management.id,
    participantName: MOCK_GROUPS.management.name,
    participantRole: MOCK_GROUPS.management.roleLabel,
    participantAvatar: MOCK_GROUPS.management.avatar,
    lastMessage: 'Admin: Buổi demo tính năng AI chấm bài diễn ra lúc 14h chiều nay.',
    lastTime: '2 giờ trước',
    unread: 3,
    online: true,
    memberCount: MOCK_GROUPS.management.memberCount,
    messages: [
      {
        id: 'm-agm-1',
        from: 'me',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Chào các thầy cô, trung tâm chuẩn bị cập nhật tính năng AI hỗ trợ chấm bài Writing.',
        time: '07:00',
      },
      {
        id: 'm-agm-2',
        from: 'them',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Tính năng này rất hữu ích, giáo viên sẽ có thêm công cụ hỗ trợ gợi ý chữa bài cho học viên.',
        time: '07:15',
      },
      {
        id: 'm-agm-3',
        from: 'me',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Buổi demo tính năng AI chấm bài diễn ra lúc 14h chiều nay, mời thầy cô tham gia.',
        time: '07:30',
      },
    ],
  },

  // 7. Nhóm Tổ Chuyên Môn Tiếng Anh
  {
    id: 'conv-admin-grp-teachers',
    type: 'group',
    participantId: MOCK_GROUPS.teachers.id,
    participantName: MOCK_GROUPS.teachers.name,
    participantRole: MOCK_GROUPS.teachers.roleLabel,
    participantAvatar: MOCK_GROUPS.teachers.avatar,
    lastMessage: 'Admin: Phòng đào tạo đã phê duyệt kế hoạch thi thử tháng 9.',
    lastTime: '3 giờ trước',
    unread: 0,
    online: true,
    memberCount: MOCK_GROUPS.teachers.memberCount,
    messages: [
      {
        id: 'm-agt-1',
        from: 'them',
        senderId: MOCK_USERS.thang.id,
        senderName: MOCK_USERS.thang.name,
        senderAvatar: MOCK_USERS.thang.avatar,
        text: 'Mọi người đã chốt đề thi thử tháng 9 cho học viên chưa?',
        time: '06:45',
      },
      {
        id: 'm-agt-2',
        from: 'them',
        senderId: MOCK_USERS.mai.id,
        senderName: MOCK_USERS.mai.name,
        senderAvatar: MOCK_USERS.mai.avatar,
        text: 'Mình vừa hoàn thành bộ đề Reading và Listening rồi, đã tải lên folder tổ chuyên môn.',
        time: '06:50',
      },
      {
        id: 'm-agt-3',
        from: 'me',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Phòng đào tạo đã phê duyệt kế hoạch thi thử tháng 9.',
        time: '07:00',
      },
    ],
  },

  // 8. Kênh Thông Báo Toàn Trung Tâm
  {
    id: 'conv-admin-grp-announcements',
    type: 'group',
    participantId: MOCK_GROUPS.announcements.id,
    participantName: MOCK_GROUPS.announcements.name,
    participantRole: MOCK_GROUPS.announcements.roleLabel,
    participantAvatar: MOCK_GROUPS.announcements.avatar,
    lastMessage: 'Admin: Hệ thống sẽ bảo trì nâng cấp lúc 00:00 ngày Chủ Nhật.',
    lastTime: 'Hôm qua',
    unread: 0,
    online: true,
    memberCount: MOCK_GROUPS.announcements.memberCount,
    messages: [
      {
        id: 'm-aga-1',
        from: 'me',
        senderId: MOCK_USERS.admin.id,
        senderName: MOCK_USERS.admin.name,
        senderAvatar: MOCK_USERS.admin.avatar,
        text: 'Hệ thống sẽ bảo trì nâng cấp lúc 00:00 ngày Chủ Nhật trong 30 phút.',
        time: 'Hôm qua 18:00',
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────────────────────
// HÀM LẤY DANH SÁCH HỘI THOẠI ĐỘNG THEO NGƯỜI DÙNG ĐĂNG NHẬP
// Tương đương GET /api/chat/conversations
// ─────────────────────────────────────────────────────────────────────────────
export function getConversationsForUser(user) {
  const isAdmin = user?.role === 'admin'
  const isTeacherMai =
    user?.displayName === 'Hoàng Thị Mai' ||
    user?.email === 'mai.ht@gmail.com' ||
    (user?.role === 'teacher' && !user?.displayName?.includes('Thắng'))

  if (isAdmin) {
    return structuredClone(ADMIN_CONVERSATIONS)
  }

  // Mặc định hoặc khi là giáo viên Hoàng Thị Mai:
  return structuredClone(TEACHER_MAI_CONVERSATIONS)
}

// ─────────────────────────────────────────────────────────────────────────────
// HÀM LẤY DANH SÁCH CONTACT (LOẠI TRỪ CHÍNH USER ĐANG ĐĂNG NHẬP)
// Tương đương GET /api/chat/contacts
// ─────────────────────────────────────────────────────────────────────────────
export function getContactsForUser(user) {
  const allUsers = Object.values(MOCK_USERS)
  const allGroups = Object.values(MOCK_GROUPS).map((grp) => ({
    ...grp,
    role: 'group',
    isGroup: true,
  }))

  const userEmail = user?.email
  const userName = user?.displayName
  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'

  const filteredUsers = allUsers
    .filter((u) => {
      if (userName && u.name === userName) return false
      if (userEmail && u.email === userEmail) return false
      if (isTeacher && u.name === 'Hoàng Thị Mai' && (!userName || userName.includes('Mai'))) return false
      if (isAdmin && u.role === 'admin') return false
      return true
    })
    .map((u) => ({
      ...u,
      isGroup: false,
    }))

  return [...filteredUsers, ...allGroups]
}

// Hàm lấy danh sách người dùng khả dụng để thêm vào nhóm mới (loại bỏ chính mình)
export function getUsersForGroupCreation(user) {
  const allUsers = Object.values(MOCK_USERS)
  const userEmail = user?.email
  const userName = user?.displayName
  const isTeacher = user?.role === 'teacher'
  const isAdmin = user?.role === 'admin'

  return allUsers.filter((u) => {
    if (userName && u.name === userName) return false
    if (userEmail && u.email === userEmail) return false
    if (isTeacher && u.name === 'Hoàng Thị Mai' && (!userName || userName.includes('Mai'))) return false
    if (isAdmin && u.role === 'admin') return false
    return true
  })
}

// Xuất khẩu tĩnh mặc định để tương thích các nơi import sẵn
export const contactList = getContactsForUser({ displayName: 'Hoàng Thị Mai', role: 'teacher' })
export const chatConversations = TEACHER_MAI_CONVERSATIONS
export const currentUser = MOCK_USERS.mai
