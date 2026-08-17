// Dữ liệu tĩnh mô phỏng thông tin giáo viên — thay bằng API call khi có backend

export const TEACHER_STATS = {
  totalClasses: 4,
  totalStudents: 120,
  activeAssignments: 8,
  urgentDeadlines: 3,
  completionRate: 85,
  completionDelta: 2, // +2% so tuần trước
  avgClassScore: 7.8,
}

export const TEACHER_SCORE_CHART = [
  { label: 'T2', value: 6.8 },
  { label: 'T3', value: 7.1 },
  { label: 'T4', value: 7.3 },
  { label: 'T5', value: 6.9 },
  { label: 'T6', value: 7.5 },
  { label: 'T7', value: 7.8 },
]

export const TEACHER_ACTIVITIES = [
  {
    id: 1,
    type: 'submit',
    student: 'Nguyễn Văn A',
    action: 'đã nộp bài tập',
    target: 'Essay: The Environment',
    time: '10 phút trước',
  },
  {
    id: 2,
    type: 'comment',
    student: 'Trần Thị B',
    action: 'đã bình luận trong',
    target: 'Lớp IELTS 6.5 – Tối T3, T5',
    time: '1 giờ trước',
  },
  {
    id: 3,
    type: 'submit',
    student: 'Lê Văn C',
    action: 'đã nộp bài tập',
    target: 'Listening Practice Test 4',
    time: '2 giờ trước',
  },
  {
    id: 4,
    type: 'join',
    student: 'Phạm Thị D',
    action: 'vừa tham gia lớp',
    target: 'TOEIC Intensive – Sáng CN',
    time: '3 giờ trước',
  },
  {
    id: 5,
    type: 'submit',
    student: 'Hoàng Văn E',
    action: 'đã nộp bài tập',
    target: 'Reading Comprehension #7',
    time: '5 giờ trước',
  },
]

export const TEACHER_CLASSES = [
  {
    id: 1,
    name: 'IELTS Masterclass...',
    tag: 'IELTS',
    tagColor: '#1B3A57',
    schedule: 'T2, T4, T6 • 18:00',
    students: 24,
    progress: 68,
    // Ảnh gradient placeholder — thay bằng URL thật nếu có
    coverGradient: 'linear-gradient(135deg, #1B3A57 0%, #29A8E8 100%)',
  },
  {
    id: 2,
    name: 'Tiếng Anh Giao Tiếp',
    tag: 'Giao Tiếp',
    tagColor: '#0f766e',
    schedule: 'T3, T5, T7 • 19:30',
    students: 32,
    progress: 45,
    coverGradient: 'linear-gradient(135deg, #0f766e 0%, #34d399 100%)',
  },
  {
    id: 3,
    name: 'TOEIC Intensive...',
    tag: 'TOEIC',
    tagColor: '#b45309',
    schedule: 'CN • 08:00',
    students: 45,
    progress: 82,
    coverGradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
  },
  {
    id: 4,
    name: 'IELTS Foundation',
    tag: 'IELTS',
    tagColor: '#1B3A57',
    schedule: 'T2, T4 • 20:00',
    students: 19,
    progress: 30,
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
  },
]
