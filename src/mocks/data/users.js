import { daysAgo } from '../utils'

/** Shape bám theo auth.users (đã bỏ các cột nội bộ như password_hash). */

const RAW = [
  ['Nguyễn Anh Tuấn', 'tuan.na@gmail.com', 'student', 'premium_yearly', 'B2', true, 0],
  ['Trần Thị Lan', 'lan.tt@gmail.com', 'student', 'free', 'A2', true, 1],
  ['Lê Hoàng Nam', 'nam.lh@gmail.com', 'student', 'free', 'C1', true, 2],
  ['Phạm Mỹ Linh', 'linh.pm@gmail.com', 'student', 'premium_monthly', 'B1', true, 3],
  ['Vũ Đức Thắng', 'thang.vd@gmail.com', 'teacher', 'student', 'C1', true, 1],
  ['Đỗ Thu Hà', 'ha.dt@gmail.com', 'student', 'premium_monthly', 'B2', true, 5],
  ['Bùi Quang Huy', 'huy.bq@gmail.com', 'student', 'free', 'A1', false, 12],
  ['Hoàng Thị Mai', 'mai.ht@gmail.com', 'teacher', 'student', 'C2', true, 2],
  ['Ngô Văn Kiên', 'kien.nv@gmail.com', 'student', 'lifetime', 'B2', true, 0],
  ['Đinh Thuỳ Dung', 'dung.dt@gmail.com', 'student', 'free', 'A2', true, 8],
  ['Trịnh Bảo Long', 'long.tb@gmail.com', 'student', 'premium_yearly', 'B1', true, 4],
  ['Lý Khánh Vy', 'vy.lk@gmail.com', 'student', 'free', 'A1', true, 6],
  ['Quản trị viên', 'admin@smartenglish.vn', 'admin', 'lifetime', null, true, 0],
]

export const users = RAW.map(
  ([displayName, email, role, plan, cefrLevel, isActive, lastLoginDaysAgo], index) => ({
    id: `u-${index + 1}`,
    displayName,
    email,
    avatarUrl: null,
    role,
    plan,
    cefrLevel,
    isActive,
    isEmailVerified: isActive,
    lastLoginAt: daysAgo(lastLoginDaysAgo),
    createdAt: daysAgo(30 + index * 3),
  }),
)

export const roles = [
  { id: 'r-1', name: 'admin', label: 'Quản trị viên', userCount: 1, permissions: ['*'] },
  {
    id: 'r-2',
    name: 'teacher',
    label: 'Giáo viên',
    userCount: 2,
    permissions: ['class.manage', 'assignment.manage'],
  },
  {
    id: 'r-3',
    name: 'student',
    label: 'Học viên',
    userCount: 28_394,
    permissions: ['learning.self'],
  },
]
