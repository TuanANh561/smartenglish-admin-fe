// Mock data cho Cộng đồng giáo viên & Bảng tin chia sẻ SmartEnglish AI

export const INITIAL_POSTS = [
  {
    id: 'post-1',
    authorId: 'u-8',
    authorName: 'Hoàng Thị Mai',
    authorEmail: 'mai.ht@gmail.com',
    authorRole: 'Giáo viên',
    authorTitle: 'Senior Instructor • SmartEnglish AI',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2 giờ trước',
    content:
      'Gợi ý 5 cấu trúc câu "ăn điểm" trong IELTS Speaking Part 3 chủ đề Technology! Rất hữu ích cho các bạn học sinh band 6.0+ đang muốn bứt phá lên 7.5+ 🚀 #IELTS_Tips #Speaking #AI_in_Education',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    mediaCaption: 'Infographic: IELTS Speaking Part 3 - Mastering the Structures',
    attachment: {
      name: 'IELTS_Speaking_Part3_Mastery.pdf',
      size: '2.4 MB',
      type: 'pdf',
    },
    likesCount: 45,
    isLiked: false,
    commentsCount: 12,
    comments: [
      {
        id: 'cmt-1',
        authorName: 'Vũ Đức Thắng',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        content: 'Cấu trúc số 2 và 3 áp dụng vào bài thi thực tế rất mượt mà cô Mai ơi! Cảm ơn cô đã chia sẻ.',
        createdAt: '1 giờ trước',
        likesCount: 4,
      },
      {
        id: 'cmt-2',
        authorName: 'Nguyễn Anh Tuấn',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        content: 'Tài liệu quá chi tiết ạ, em vừa tải về làm tài liệu ôn thi tuần sau luôn!',
        createdAt: '45 phút trước',
        likesCount: 2,
      },
    ],
    tags: ['IELTS_Tips', 'Speaking', 'AI_in_Education'],
  },
  {
    id: 'post-2',
    authorId: 'u-5',
    authorName: 'Vũ Đức Thắng',
    authorEmail: 'thang.vd@gmail.com',
    authorRole: 'Giáo viên',
    authorTitle: 'IELTS Trainer & Exam Reviewer',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    createdAt: '5 giờ trước',
    content:
      'Vừa thử nghiệm tính năng AI chấm điểm Writing Task 2 mới của SmartEnglish AI trên 30 bài làm của lớp Advanced. Kết quả nhận xét chi tiết từng tiêu chí TR, CC, LR, GRA và phát hiện lỗi ngữ pháp rất sát thực tế! Các thầy cô nên thử tích hợp vào quy trình giao bài tập nhé. 🤖📝 #AI_in_Education #WritingTips #SmartEnglish',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    mediaCaption: 'Giao diện phân tích thang điểm 4 tiêu chí của trợ lý AI Writing Coach',
    attachment: null,
    likesCount: 68,
    isLiked: true,
    commentsCount: 18,
    comments: [
      {
        id: 'cmt-201',
        authorName: 'Quản trị viên',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        content: 'Cảm ơn thầy Thắng đã đóng góp phản hồi! Phiên bản cập nhật tuần tới sẽ có thêm tính năng xuất báo cáo PDF gửi phụ huynh tự động.',
        createdAt: '3 giờ trước',
        likesCount: 9,
      },
    ],
    tags: ['AI_in_Education', 'WritingTips', 'SmartEnglish'],
  },
  {
    id: 'post-3',
    authorId: 'u-13',
    authorName: 'Quản trị viên',
    authorEmail: 'admin@smartenglish.vn',
    authorRole: 'Quản trị viên',
    authorTitle: 'SmartEnglish AI System Admin',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    createdAt: '1 ngày trước',
    content:
      '📢 [THÔNG BÁO HỆ THỐNG] Đã mở khóa bộ 100+ Đề thi thử TOEIC format 2026 và tích hợp Voice AI chấm phát âm Speaking trực tiếp theo bảng âm IPA quốc tế. Mời quý thầy cô truy cập Kho học liệu để tạo bài kiểm tra cho lớp. #GrammarHacks #TOEIC_Listening #ThongBaoHeThong',
    mediaType: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    mediaCaption: 'Bộ đề thi TOEIC & Ngân hàng bài nghe chuẩn hóa mới nhất',
    attachment: {
      name: 'Tong_Hop_100_De_TOEIC_2026.pdf',
      size: '5.8 MB',
      type: 'pdf',
    },
    likesCount: 102,
    isLiked: false,
    commentsCount: 24,
    comments: [],
    tags: ['GrammarHacks', 'TOEIC_Listening', 'ThongBaoHeThong'],
  },
]

export const TRENDING_TOPICS = [
  { tag: 'IELTS_Tips', label: '#IELTS_Tips', postCount: '1.2k bài viết', isHot: true },
  { tag: 'AI_in_Education', label: '#AI_in_Education', postCount: '856 bài viết', isHot: true },
  { tag: 'GrammarHacks', label: '#GrammarHacks', postCount: '420 bài viết', isHot: false },
  { tag: 'TOEIC_Listening', label: '#TOEIC_Listening', postCount: '310 bài viết', isHot: false },
  { tag: 'SpeakingFluency', label: '#SpeakingFluency', postCount: '240 bài viết', isHot: false },
]

export const TOP_TEACHERS = [
  {
    id: 't-1',
    name: 'Hoàng Thị Mai',
    role: 'Senior Master Trainer',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    isFollowing: true,
  },
  {
    id: 't-2',
    name: 'Vũ Đức Thắng',
    role: 'IELTS Examiner & Coach',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
  },
  {
    id: 't-3',
    name: 'Phạm Tuấn Anh',
    role: 'Master Trainer • TESOL',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    isFollowing: false,
  },
]
