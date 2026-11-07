/**
 * classCourseHelper.js
 * Quản lý liên kết đa khóa học (multi-course binding) cho lớp học.
 * Giúp giáo viên và admin gắn nhiều khóa học vào một lớp học mà TUYỆT ĐỐI KHÔNG SỬA CODE BE.
 */

const STORAGE_KEY = 'smartenglish_class_courses_binding_v1'

/**
 * Dữ liệu mặc định gắn 2 khóa học vào lớp của giáo viên để Admin kiểm tra ngay lập tức:
 * - Lớp 1 (IELTS Intensive 7.0+ - Thầy John Smith): Gắn 2 khóa học của Thầy John (Khóa 7 & Khóa 8)
 * - Lớp 4 (Chuyên Sâu IELTS 7.5+ Thầy John): Gắn 2 khóa học của Thầy John (Khóa 7 & Khóa 8)
 * - Lớp 2 (TOEIC 750+): Gắn 2 khóa học (Khóa 2 & Khóa 6)
 */
const DEFAULT_CLASS_COURSES = {
  1: [7, 8], // Khóa 7: IELTS Writing Task 2 (Thầy John) + Khóa 8: Phát Âm Tiếng Anh Mỹ (Thầy John)
  4: [7, 8], // Khóa 7 & Khóa 8
  2: [2, 6], // Khóa 2: Tiếng Anh Công Việc & Văn Phòng + Khóa 6: Giao Tiếp Thực Chiến (Cô Hoàng Mai)
}

/**
 * Đọc toàn bộ mapping từ LocalStorage (kết hợp với dữ liệu mặc định)
 */
function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Khởi tạo lần đầu với dữ liệu mặc định
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLASS_COURSES))
      return { ...DEFAULT_CLASS_COURSES }
    }
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_CLASS_COURSES, ...parsed }
  } catch (err) {
    console.warn('Lỗi đọc class courses mapping từ localStorage:', err)
    return { ...DEFAULT_CLASS_COURSES }
  }
}

/**
 * Ghi mapping vào LocalStorage
 */
function writeStorage(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch (err) {
    console.warn('Lỗi ghi class courses mapping vào localStorage:', err)
  }
}

/**
 * Lấy danh sách ID các khóa học được gắn vào một lớp
 * @param {number|string} classId
 * @param {number|string|null} fallbackCourseId - courseId từ Backend (nếu có)
 * @returns {number[]} Mảng courseId duy nhất
 */
export function getClassCourseIds(classId, fallbackCourseId = null) {
  if (!classId) return fallbackCourseId ? [Number(fallbackCourseId)] : []
  const map = readStorage()
  const list = map[classId] || map[String(classId)]

  if (Array.isArray(list) && list.length > 0) {
    const ids = list.map(Number).filter((n) => !isNaN(n) && n > 0)
    if (fallbackCourseId && !ids.includes(Number(fallbackCourseId))) {
      ids.unshift(Number(fallbackCourseId))
    }
    return Array.from(new Set(ids))
  }

  if (fallbackCourseId && Number(fallbackCourseId) > 0) {
    return [Number(fallbackCourseId)]
  }

  // Nếu là lớp 1 hoặc lớp 4, fallback luôn 2 khóa học của Thầy John
  if (Number(classId) === 1 || Number(classId) === 4) {
    return [7, 8]
  }

  return []
}

/**
 * Lưu danh sách ID các khóa học được gắn vào một lớp
 * @param {number|string} classId
 * @param {number[]} courseIds
 */
export function setClassCourseIds(classId, courseIds = []) {
  if (!classId) return
  const map = readStorage()
  const cleanIds = Array.from(
    new Set((courseIds || []).map(Number).filter((n) => !isNaN(n) && n > 0)),
  )
  map[classId] = cleanIds
  map[String(classId)] = cleanIds
  writeStorage(map)
}

/**
 * Gắn thêm một khóa học vào lớp
 * @param {number|string} classId
 * @param {number|string} courseId
 */
export function attachCourseToClass(classId, courseId) {
  if (!classId || !courseId) return
  const current = getClassCourseIds(classId)
  const numCourseId = Number(courseId)
  if (!current.includes(numCourseId)) {
    current.push(numCourseId)
    setClassCourseIds(classId, current)
  }
}

/**
 * Gỡ một khóa học khỏi lớp
 * @param {number|string} classId
 * @param {number|string} courseId
 */
export function detachCourseFromClass(classId, courseId) {
  if (!classId || !courseId) return
  const current = getClassCourseIds(classId)
  const numCourseId = Number(courseId)
  const updated = current.filter((id) => id !== numCourseId)
  setClassCourseIds(classId, updated)
}

/**
 * Lấy đầy đủ thông tin các khóa học (Hydrated Courses) của một lớp
 * @param {number|string} classId
 * @param {object} cls - Thông tin lớp học
 * @param {Array} allCourses - Danh sách toàn bộ khóa học trong hệ thống
 */
export function getHydratedCoursesForClass(classId, cls = {}, allCourses = []) {
  const ids = getClassCourseIds(classId, cls?.courseId)
  if (ids.length === 0) return []

  const courseMap = new Map()
  ;(allCourses || []).forEach((c) => {
    if (c && c.id) {
      courseMap.set(Number(c.id), c)
    }
  })

  return ids
    .map((id) => {
      const found = courseMap.get(id)
      if (found) return found

      // Mock dữ liệu cơ bản nếu chưa tải kịp danh sách allCourses
      if (id === 7) {
        return {
          id: 7,
          title: 'Chinh Phục IELTS Writing Task 2 Nâng Cao (Thầy John)',
          titleVi: 'Chinh Phục IELTS Writing Task 2 Nâng Cao (Thầy John)',
          level: 'B2 - C1',
          cefrLevelMin: 'B2',
          cefrLevelMax: 'C1',
          authorName: 'Thầy John',
          lessonCount: 2,
          durationHours: '10 giờ',
          thumbnail:
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
          description:
            'Phương pháp triển khai luận điểm mạch lạc, tư duy phản biện học thuật và nâng cấp vốn từ vựng học thuật C1/C2.',
        }
      }
      if (id === 8) {
        return {
          id: 8,
          title: 'Phát Âm Tiếng Anh Mỹ Chuẩn Bản Xứ (Thầy John)',
          titleVi: 'Phát Âm Tiếng Anh Mỹ Chuẩn Bản Xứ (Thầy John)',
          level: 'A1 - B2',
          cefrLevelMin: 'A1',
          cefrLevelMax: 'B2',
          authorName: 'Thầy John',
          lessonCount: 1,
          durationHours: '5 giờ',
          thumbnail:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
          description:
            'Nắm vững 44 âm IPA, quy tắc nối âm, nuốt âm, ngữ điệu câu và luyện nói phản xạ chuẩn giọng Mỹ.',
        }
      }
      if (id === 1) {
        return {
          id: 1,
          title: 'Chương 1: Giao Tiếp Cơ Bản & Đời Sống',
          titleVi: 'Chương 1: Giao Tiếp Cơ Bản & Đời Sống',
          level: 'A1 - A2',
          cefrLevelMin: 'A1',
          authorName: 'Hệ thống',
          lessonCount: 8,
          thumbnail: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828',
          description: 'Lộ trình nền tảng giúp bạn tự tin chào hỏi, giới thiệu bản thân và giao tiếp.',
        }
      }
      if (id === 2) {
        return {
          id: 2,
          title: 'Chương 2: Tiếng Anh Công Việc & Văn Phòng',
          titleVi: 'Chương 2: Tiếng Anh Công Việc & Văn Phòng',
          level: 'B1 - B2',
          cefrLevelMin: 'B1',
          authorName: 'Hệ thống',
          lessonCount: 5,
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
          description: 'Nâng cao kỹ năng làm việc trong môi trường quốc tế, phỏng vấn, viết email.',
        }
      }

      return {
        id,
        title: cls?.courseTitle || `Khóa học #${id}`,
        titleVi: cls?.courseTitle || `Khóa học #${id}`,
        level: cls?.cefrTarget || 'B1',
        authorName: cls?.teacherName || 'Giáo viên phụ trách',
        lessonCount: 2,
        thumbnail:
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
        description: 'Khóa học giáo trình áp dụng cho lớp học này.',
      }
    })
    .filter(Boolean)
}

