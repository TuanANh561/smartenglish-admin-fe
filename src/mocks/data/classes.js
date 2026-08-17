// Mock data lớp học của giáo viên

export const CLASS_STUDENTS = {
  'cls-1': [
    { id: 's1', name: 'Nguyễn Văn An', email: 'an.nguyen@example.com', initials: 'NA', avatarColor: '#29A8E8', avgScore: 8.5, progress: 70, lastSeen: 'Hôm nay, 10:30 AM' },
    { id: 's2', name: 'Trần Thị Bích', email: 'bich.tran@example.com', initials: 'TB', avatarColor: '#f59e0b', avgScore: 6.8, progress: 45, lastSeen: 'Hôm qua, 14:15 PM' },
    { id: 's3', name: 'Lê Văn Duy', email: 'duy.le@example.com', initials: 'LD', avatarColor: '#10b981', avgScore: 9.2, progress: 85, lastSeen: '2 ngày trước' },
    { id: 's4', name: 'Phạm Hương', email: 'huong.pham@example.com', initials: 'PH', avatarColor: '#8b5cf6', avgScore: 7.5, progress: 60, lastSeen: '3 ngày trước' },
    { id: 's5', name: 'Hoàng Minh Khôi', email: 'khoi.hoang@example.com', initials: 'HK', avatarColor: '#ef4444', avgScore: 7.0, progress: 52, lastSeen: '4 ngày trước' },
  ],
  'cls-2': [
    { id: 's6', name: 'Vũ Thị Lan', email: 'lan.vu@example.com', initials: 'VL', avatarColor: '#29A8E8', avgScore: 7.8, progress: 65, lastSeen: 'Hôm nay, 08:00 AM' },
    { id: 's7', name: 'Đặng Quốc Toàn', email: 'toan.dang@example.com', initials: 'DT', avatarColor: '#f59e0b', avgScore: 8.1, progress: 75, lastSeen: 'Hôm qua, 19:00 PM' },
    { id: 's8', name: 'Bùi Anh Tuấn', email: 'tuan.bui@example.com', initials: 'BT', avatarColor: '#10b981', avgScore: 5.9, progress: 30, lastSeen: '5 ngày trước' },
    { id: 's9', name: 'Ngô Thị Hà', email: 'ha.ngo@example.com', initials: 'NH', avatarColor: '#8b5cf6', avgScore: 8.8, progress: 88, lastSeen: 'Hôm nay, 09:15 AM' },
  ],
  'cls-3': [
    { id: 's10', name: 'Trịnh Văn Hùng', email: 'hung.trinh@example.com', initials: 'TH', avatarColor: '#29A8E8', avgScore: 6.5, progress: 50, lastSeen: '1 ngày trước' },
    { id: 's11', name: 'Lý Mỹ Duyên', email: 'duyen.ly@example.com', initials: 'LD', avatarColor: '#ef4444', avgScore: 9.0, progress: 90, lastSeen: 'Hôm nay, 11:00 AM' },
    { id: 's12', name: 'Đinh Tuấn Anh', email: 'anh.dinh@example.com', initials: 'DA', avatarColor: '#f59e0b', avgScore: 7.2, progress: 55, lastSeen: '3 ngày trước' },
  ],
  'cls-4': [
    { id: 's13', name: 'Phan Thị Quỳnh', email: 'quynh.phan@example.com', initials: 'PQ', avatarColor: '#10b981', avgScore: 8.0, progress: 72, lastSeen: 'Hôm qua, 20:00 PM' },
    { id: 's14', name: 'Hồ Văn Bình', email: 'binh.ho@example.com', initials: 'HB', avatarColor: '#8b5cf6', avgScore: 6.2, progress: 35, lastSeen: '6 ngày trước' },
  ],
}

export const CLASSES = [
  {
    id: 'cls-1',
    name: 'IELTS Intensive B2',
    code: 'ENG-2024-01',
    level: 'B2',
    tags: ['IELTS Preparation', 'Intermediate'],
    description: 'Focus on fluency, complex vocabulary, and mock interview strategies.',
    joinCode: 'SA82-KM',
    studentCount: 30,
    assignmentCount: 12,
    status: 'active',
    coverGradient: 'linear-gradient(135deg, #1B3A57 0%, #29A8E8 100%)',
  },
  {
    id: 'cls-2',
    name: 'Advanced English C1',
    code: 'ENG-2024-02',
    level: 'C1',
    tags: ['Advanced', 'Academic'],
    description: 'Advanced grammar, academic writing, and complex reading comprehension.',
    joinCode: 'AE91-CX',
    studentCount: 25,
    assignmentCount: 8,
    status: 'active',
    coverGradient: 'linear-gradient(135deg, #0f766e 0%, #34d399 100%)',
  },
  {
    id: 'cls-3',
    name: 'TOEIC Foundation',
    code: 'TOE-2024-01',
    level: 'A2',
    tags: ['TOEIC', 'Foundation'],
    description: 'Build solid English foundation for the TOEIC exam with practice tests.',
    joinCode: 'TF55-QR',
    studentCount: 40,
    assignmentCount: 20,
    status: 'ended',
    coverGradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
  },
  {
    id: 'cls-4',
    name: 'Communication Skills B1',
    code: 'COM-2024-03',
    level: 'B1',
    tags: ['Speaking', 'Communication'],
    description: 'Develop speaking confidence and everyday communication skills.',
    joinCode: 'CS33-PL',
    studentCount: 15,
    assignmentCount: 5,
    status: 'upcoming',
    coverGradient: 'linear-gradient(135deg, #4f46e5 0%, #818cf8 100%)',
  },
  {
    id: 'cls-5',
    name: 'Business English',
    code: 'BUS-2024-01',
    level: 'B2',
    tags: ['Business', 'Professional'],
    description: 'Professional English for workplace communication and presentations.',
    joinCode: 'BE77-MN',
    studentCount: 22,
    assignmentCount: 10,
    status: 'active',
    coverGradient: 'linear-gradient(135deg, #be185d 0%, #f472b6 100%)',
  },
  {
    id: 'cls-6',
    name: 'IELTS Writing C1',
    code: 'ENG-2024-03',
    level: 'C1',
    tags: ['IELTS', 'Writing'],
    description: 'Intensive writing practice for IELTS Task 1 and Task 2.',
    joinCode: 'IW66-NB',
    studentCount: 18,
    assignmentCount: 15,
    status: 'active',
    coverGradient: 'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
  },
]

// Trạng thái lớp học
export const CLASS_STATUS = {
  active:   { label: 'Đang diễn ra', tone: 'success',  dot: '#22c55e' },
  ended:    { label: 'Đã kết thúc',  tone: 'neutral',  dot: '#94a3b8' },
  upcoming: { label: 'Sắp khai giảng', tone: 'warning', dot: '#f59e0b' },
}

// Màu badge cấp độ CEFR
export const LEVEL_COLOR = {
  A1: { bg: '#f0fdf4', text: '#15803d' },
  A2: { bg: '#f0fdf4', text: '#15803d' },
  B1: { bg: '#eff6ff', text: '#1d4ed8' },
  B2: { bg: '#eff6ff', text: '#1d4ed8' },
  C1: { bg: '#faf5ff', text: '#7c3aed' },
  C2: { bg: '#faf5ff', text: '#7c3aed' },
}
