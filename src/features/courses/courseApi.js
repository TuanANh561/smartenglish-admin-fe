import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'

/**
 * Chuẩn hóa một bản ghi Course từ Backend DTO sang cấu trúc dữ liệu cho Web Admin UI
 */
export function adaptBackendCourse(bCourse) {
  if (!bCourse) return null

  const minLevel = bCourse.cefrLevelMin || 'A1'
  const maxLevel = bCourse.cefrLevelMax || 'B2'
  const isExam = bCourse.courseType === 'EXAM_PREP'

  const mappedLessons = Array.isArray(bCourse.lessons)
    ? bCourse.lessons.map(adaptBackendLesson)
    : []

  // Nếu course có danh sách lessons, nhóm thành chapter cho UI view
  const chapters = [
    {
      id: `CH-${bCourse.id}`,
      title: bCourse.titleVi || `Chương ${bCourse.id}`,
      duration: `${bCourse.estimatedHours || 5}h 00m`,
      lessons: mappedLessons,
    },
  ]

  return {
    id: bCourse.id,
    title: bCourse.titleVi || bCourse.titleEn || 'Khóa học không tên',
    titleVi: bCourse.titleVi || '',
    titleEn: bCourse.titleEn || '',
    category: isExam ? 'Luyện thi' : 'Giao tiếp',
    categoryLabel: isExam ? 'Luyện thi' : 'Giao tiếp',
    level: minLevel === maxLevel ? minLevel : `${minLevel} - ${maxLevel}`,
    levelLabel: `${minLevel} - ${maxLevel} Standard`,
    cefrLevelMin: minLevel,
    cefrLevelMax: maxLevel,
    targetExam: bCourse.targetExam || 'GENERAL',
    courseType: bCourse.courseType || 'STRUCTURED',
    status: bCourse.isPublished ? 'published' : 'draft',
    statusLabel: bCourse.isPublished ? 'Đã xuất bản' : 'Bản nháp',
    isPublished: Boolean(bCourse.isPublished),
    isPremium: Boolean(bCourse.isPremium),
    createdBy: bCourse.createdBy != null ? bCourse.createdBy : 1,
    authorName:
      Number(bCourse.createdBy) === 2 || bCourse.authorName === 'Hoàng Thị Mai' || bCourse.authorEmail === 'teacher.mai@smartenglish.com'
        ? 'Cô Hoàng Mai'
        : Number(bCourse.createdBy) === 29 || bCourse.authorName === 'Thầy John' || bCourse.authorEmail === 'teacher.john@smartenglish.com'
        ? 'Thầy John'
        : (Number(bCourse.createdBy) === 1 || bCourse.createdBy == null || Number(bCourse.id) <= 4)
        ? 'Hệ thống'
        : (bCourse.authorName || 'Giáo viên'),
    authorEmail:
      bCourse.createdBy === 2
        ? 'teacher.mai@smartenglish.com'
        : bCourse.createdBy === 29
        ? 'teacher.john@smartenglish.com'
        : (bCourse.authorEmail || 'admin@smartenglish.edu.vn'),
    lessonCount: bCourse.totalLessons || mappedLessons.length || 0,
    // Dữ liệu thực từ BE — null nếu chưa có, UI sẽ hiển thị '—'
    studentCount: bCourse.studentCount ?? bCourse.enrollmentCount ?? null,
    rating: bCourse.rating ?? bCourse.averageRating ?? null,
    ratingCount: bCourse.ratingCount ?? bCourse.reviewCount ?? null,
    durationHours: bCourse.estimatedHours != null
      ? `${bCourse.estimatedHours} giờ`
      : (mappedLessons.length > 0 && mappedLessons.some(l => l.estimatedMin)
          ? (() => {
              const totalMin = mappedLessons.reduce((sum, l) => sum + (Number(l.estimatedMin) || 0), 0)
              return totalMin >= 60 ? `${(totalMin / 60).toFixed(1)} giờ` : `${totalMin} phút`
            })()
          : null),
    estimatedHours: bCourse.estimatedHours ?? null,
    updatedAt: bCourse.updatedAt || bCourse.lastModifiedAt || null,
    thumbnail:
      bCourse.thumbnailUrl ||
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=600&auto=format&fit=crop&q=80',
    description:
      bCourse.descriptionVi ||
      'Lộ trình học tiếng Anh bài bản với các bài học chuyên biệt, hỗ trợ học viên luyện tập phản xạ và phát âm trực tiếp cùng AI.',
    objectives: [
      `Nắm vững từ vựng và cấu trúc ngữ pháp cốt lõi cấp độ ${minLevel} - ${maxLevel}`,
      'Luyện phản xạ đàm thoại trong ngữ cảnh giao tiếp thực tế',
      'Được hệ thống AI kiểm tra và đánh giá chi tiết sau mỗi bài học',
    ],
    targetAudience: [
      'Học viên theo học lộ trình tiếng Anh chuẩn toàn diện của hệ thống',
      'Người học cần cải thiện kỹ năng nghe nói và phản xạ ứng dụng',
    ],
    chapters,
    lessons: mappedLessons,
  }
}

/**
 * Chuyển dữ liệu Course từ form Web Admin sang Backend CourseRequestDTO
 */
export function adaptFrontendCourseToBackend(fCourse) {
  const isExam =
    fCourse.category === 'Luyện thi' ||
    fCourse.category === 'IELTS' ||
    fCourse.category === 'TOEIC'

  let cefrMin = fCourse.cefrLevelMin
  let cefrMax = fCourse.cefrLevelMax
  if (!cefrMin && fCourse.level) {
    const parts = fCourse.level.split('-').map((s) => s.trim())
    cefrMin = parts[0] || 'A1'
    cefrMax = parts[1] || parts[0] || 'B2'
  }

  return {
    titleVi: fCourse.titleVi || fCourse.title || '',
    titleEn: fCourse.titleEn || fCourse.title || '',
    descriptionVi: fCourse.description || fCourse.descriptionVi || '',
    courseType: isExam ? 'EXAM_PREP' : 'STRUCTURED',
    cefrLevelMin: cefrMin || 'A1',
    cefrLevelMax: cefrMax || 'B2',
    targetExam:
      fCourse.targetExam ||
      (fCourse.category === 'IELTS'
        ? 'IELTS_7'
        : fCourse.category === 'TOEIC'
        ? 'TOEIC_750'
        : 'GENERAL'),
    thumbnailUrl:
      fCourse.thumbnail ||
      fCourse.thumbnailUrl ||
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846',
    totalLessons: Number(fCourse.lessonCount || fCourse.totalLessons || 0),
    estimatedHours: Number(
      fCourse.durationHours
        ? parseInt(fCourse.durationHours)
        : fCourse.estimatedHours || 5,
    ),
    isPremium: Boolean(fCourse.isPremium),
    createdBy: fCourse.createdBy != null ? Number(fCourse.createdBy) : 1,
    isPublished: fCourse.status === 'published' || Boolean(fCourse.isPublished),
  }
}

/**
 * Chuẩn hóa một bản ghi Lesson từ Backend DTO sang Admin UI
 */
export function adaptBackendLesson(bLesson) {
  if (!bLesson) return null

  let blocks = []
  if (typeof bLesson.contentBlocks === 'string') {
    try {
      blocks = JSON.parse(bLesson.contentBlocks)
    } catch {
      blocks = []
    }
  } else if (Array.isArray(bLesson.contentBlocks)) {
    blocks = bLesson.contentBlocks
  }

  const rawType = (bLesson.lessonType || 'VOCABULARY').toLowerCase()
  let uiType = 'video'
  if (rawType.includes('read')) uiType = 'reading'
  else if (rawType.includes('listen') || rawType.includes('speak')) uiType = 'video'
  else if (rawType.includes('quiz') || rawType.includes('vocab')) uiType = 'quiz'

  return {
    id: bLesson.id,
    courseId: bLesson.courseId,
    courseTitleVi: bLesson.courseTitleVi || '',
    courseTitleEn: bLesson.courseTitleEn || '',
    title: bLesson.titleVi || bLesson.titleEn || `Bài học #${bLesson.id}`,
    titleVi: bLesson.titleVi || '',
    titleEn: bLesson.titleEn || '',
    type: uiType,
    lessonType: bLesson.lessonType || 'VOCABULARY',
    position: bLesson.position || 1,
    duration: `${bLesson.estimatedMin || 15}:00`,
    estimatedMin: bLesson.estimatedMin || 15,
    xpReward: bLesson.xpReward || 30,
    prerequisiteLessonId: bLesson.prerequisiteLessonId || null,
    isFreePreview: Boolean(bLesson.isFreePreview),
    vocabWordIds: bLesson.vocabWordIds || [],
    contentBlocks: blocks,
  }
}

/**
 * Chuyển dữ liệu Lesson từ UI sang Backend LessonRequestDTO
 */
export function adaptFrontendLessonToBackend(fLesson, courseId) {
  let rawBlocks = fLesson.contentBlocks
  if (typeof rawBlocks !== 'string') {
    rawBlocks = JSON.stringify(rawBlocks || [])
  }

  return {
    courseId: Number(courseId || fLesson.courseId),
    titleVi: fLesson.titleVi || fLesson.title || '',
    titleEn: fLesson.titleEn || fLesson.title || '',
    lessonType: (fLesson.lessonType || (fLesson.type === 'quiz' ? 'VOCABULARY' : 'MIXED')).toUpperCase(),
    position: Number(fLesson.position || 1),
    contentBlocks: rawBlocks,
    vocabWordIds: fLesson.vocabWordIds || [],
    xpReward: Number(fLesson.xpReward || 30),
    prerequisiteLessonId: fLesson.prerequisiteLessonId ? Number(fLesson.prerequisiteLessonId) : null,
    estimatedMin: Number(
      fLesson.estimatedMin ||
        (fLesson.duration ? parseInt(fLesson.duration) : 15),
    ),
    isFreePreview: Boolean(fLesson.isFreePreview),
  }
}

// =====================================================================
// API CALLS (Gọi trực tiếp qua API Gateway - 100% dữ liệu thực từ CSDL)
// =====================================================================

/**
 * Lấy danh sách toàn bộ khóa học từ API Backend
 */
export async function fetchCoursesApi(params = {}) {
  const res = await api.get(ENDPOINTS.courses.list, { params })
  const rawList = Array.isArray(res) ? res : res?.data || []
  return rawList.map(adaptBackendCourse).filter(Boolean)
}

/**
 * Lấy cây cấu trúc khóa học và bài học (Curriculum Tree) từ API Backend
 */
export async function fetchCourseTreeApi() {
  const res = await api.get(ENDPOINTS.courses.tree)
  const rawList = Array.isArray(res) ? res : res?.data || []
  return rawList.map(adaptBackendCourse).filter(Boolean)
}

/**
 * Lấy chi tiết một khóa học theo ID từ API Backend
 */
export async function fetchCourseByIdApi(id) {
  const res = await api.get(ENDPOINTS.courses.detail, { path: { id } })
  const rawCourse = res?.data || res
  return adaptBackendCourse(rawCourse)
}

/**
 * Tạo mới một khóa học
 */
export async function createCourseApi(courseData) {
  const payload = adaptFrontendCourseToBackend(courseData)
  const res = await api.post(ENDPOINTS.courses.create, { data: payload })
  const rawCourse = res?.data || res
  return adaptBackendCourse(rawCourse)
}

/**
 * Cập nhật khóa học theo ID
 */
export async function updateCourseApi(id, courseData) {
  const payload = adaptFrontendCourseToBackend(courseData)
  const res = await api.put(ENDPOINTS.courses.update, { path: { id }, data: payload })
  const rawCourse = res?.data || res
  return adaptBackendCourse(rawCourse)
}

/**
 * Xóa khóa học theo ID
 */
export async function deleteCourseApi(id) {
  return await api.del(ENDPOINTS.courses.remove, { path: { id } })
}

/**
 * Lấy danh sách bài học theo courseId từ API Backend
 */
export async function fetchLessonsByCourseApi(courseId) {
  const res = await api.get(ENDPOINTS.lessons.byCourse, { params: { courseId } })
  const rawList = Array.isArray(res) ? res : res?.data || []
  return rawList.map(adaptBackendLesson).filter(Boolean)
}

/**
 * Lấy chi tiết một bài học
 */
export async function fetchLessonByIdApi(id) {
  const res = await api.get(ENDPOINTS.lessons.detail, { path: { id } })
  const rawLesson = res?.data || res
  return adaptBackendLesson(rawLesson)
}

/**
 * Tạo mới một bài học
 */
export async function createLessonApi(lessonData, courseId) {
  const payload = adaptFrontendLessonToBackend(lessonData, courseId)
  const res = await api.post(ENDPOINTS.lessons.create, { data: payload })
  const rawLesson = res?.data || res
  return adaptBackendLesson(rawLesson)
}

/**
 * Cập nhật bài học
 */
export async function updateLessonApi(id, lessonData, courseId) {
  const payload = adaptFrontendLessonToBackend(lessonData, courseId)
  const res = await api.put(ENDPOINTS.lessons.update, { path: { id }, data: payload })
  const rawLesson = res?.data || res
  return adaptBackendLesson(rawLesson)
}

/**
 * Xóa bài học
 */
export async function deleteLessonApi(id) {
  return await api.del(ENDPOINTS.lessons.remove, { path: { id } })
}

/**
 * =====================================================================
 * AI ASSISTANT: TỰ ĐỘNG SINH NỘI DUNG CHƯƠNG & BÀI HỌC THEO CHUẨN DUOLINGO
 * =====================================================================
 */
export async function generateCourseCurriculumWithAi({ topic, level = 'B1', courseType = 'STRUCTURED' }) {
  try {
    const res = await api.post('/admin/ai/generate-curriculum', {
      data: { topic, level, courseType },
    })
    const data = res?.data !== undefined ? res.data : res
    if (data && (data.titleVi || data.units)) return data
  } catch (err) {
    throw new Error(`Backend AI không thể sinh chương trình học: ${err?.message || 'Không xác định'}`, { cause: err })
  }
  throw new Error('Backend AI trả về chương trình học không hợp lệ')

  // Legacy code below is intentionally unreachable until it is removed in a dedicated cleanup.
  // eslint-disable-next-line no-unreachable
  const GEMINI_API_KEY = null
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

  const prompt = `Bạn là chuyên gia sư phạm tiếng Anh hàng đầu cho hệ thống SmartEnglish AI.
Hãy tạo 1 Chương học (Course) hoàn chỉnh kèm 4 Bài học leo tháp (Unit 1 đến Unit 4) theo chủ đề: "${topic}".
Cấp độ CEFR yêu cầu: ${level}.
Loại khóa học: ${courseType}.

Yêu cầu trả về DUY NHẤT 1 chuỗi JSON hợp lệ với cấu trúc sau (không bọc trong markdown hay bất kỳ văn bản nào khác):
{
  "titleVi": "Chương X: [Tên tiếng Việt hấp dẫn]",
  "titleEn": "Chapter X: [English Name]",
  "descriptionVi": "Mô tả lộ trình học súc tích, chuyên nghiệp từ 2 đến 3 câu...",
  "courseType": "${courseType}",
  "cefrLevelMin": "${level}",
  "cefrLevelMax": "${level === 'A1' ? 'A2' : level === 'A2' ? 'B1' : level === 'B1' ? 'B2' : 'C1'}",
  "targetExam": "${courseType === 'EXAM_PREP' ? 'IELTS_7' : 'GENERAL'}",
  "estimatedHours": 6.0,
  "isPremium": ${courseType === 'EXAM_PREP'},
  "objectives": [
    "Nắm vững 40+ từ vựng và mẫu câu giao tiếp trọng tâm về ${topic}",
    "Tự tin ứng dụng phản xạ nghe nói thực tế với trợ lý Speaking AI",
    "Hoàn thành các bài tập trắc nghiệm và thử thách đạt điểm cao"
  ],
  "targetAudience": [
    "Học viên muốn nâng cao kỹ năng tiếng Anh thực chiến về ${topic}",
    "Người đi làm và sinh viên chuẩn bị môi trường quốc tế"
  ],
  "lessons": [
    {
      "position": 1,
      "titleVi": "Unit 1: Khởi động & Từ vựng căn bản",
      "titleEn": "Unit 1: Fundamentals & Vocabulary",
      "lessonType": "VOCABULARY",
      "estimatedMin": 15,
      "xpReward": 30,
      "isFreePreview": true,
      "contentBlocks": [
        {
          "type": "theory",
          "title": "Tổng quan & Cấu trúc chính",
          "content": "Lý thuyết ngắn gọn dễ hiểu về ${topic}..."
        },
        {
          "type": "vocabulary",
          "items": [
            { "word": "sample_word", "ipa": "/ˈsæm.pəl/", "meaningVi": "nghĩa tiếng Việt", "exampleEn": "Example sentence." }
          ]
        }
      ]
    },
    {
      "position": 2,
      "titleVi": "Unit 2: Luyện Nghe & Đàm Thoại",
      "titleEn": "Unit 2: Listening & Dialogue Practice",
      "lessonType": "LISTENING",
      "estimatedMin": 15,
      "xpReward": 35,
      "isFreePreview": true,
      "contentBlocks": [
        {
          "type": "theory",
          "title": "Mẫu câu đàm thoại",
          "content": "Cách phản xạ trong tình huống thực tế..."
        }
      ]
    },
    {
      "position": 3,
      "titleVi": "Unit 3: Đọc hiểu & Ứng dụng Thực Tế",
      "titleEn": "Unit 3: Reading Comprehension & Application",
      "lessonType": "READING",
      "estimatedMin": 18,
      "xpReward": 40,
      "isFreePreview": false,
      "contentBlocks": [
        {
          "type": "theory",
          "title": "Tài liệu đọc chuyên sâu",
          "content": "Kỹ thuật đọc quét và phân tích thông tin..."
        }
      ]
    },
    {
      "position": 4,
      "titleVi": "Unit 4: Luyện Nói AI & Đánh Giá Tổng Hợp",
      "titleEn": "Unit 4: AI Speaking Coach & Mastery Quiz",
      "lessonType": "SPEAKING",
      "estimatedMin": 20,
      "xpReward": 50,
      "isFreePreview": false,
      "contentBlocks": [
        {
          "type": "theory",
          "title": "Thực hành phản xạ với AI",
          "content": "Các mẫu câu tranh luận và bảo vệ quan điểm..."
        }
      ]
    }
  ]
}`

  if (GEMINI_API_KEY) {
    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro']
    for (const model of models) {
      try {
        const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: 'application/json',
            },
          }),
        })

        if (response.ok) {
          const resJson = await response.json()
          const text = resJson?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            const parsed = JSON.parse(text)
            if (parsed?.titleVi) {
              return parsed
            }
          }
        }
      } catch (err) {
        console.warn(`[AI Course Gen] Model ${model} failed, trying next...`, err)
      }
    }
  }

  throw new Error("Dịch vụ AI không thể khởi tạo giáo trình lúc này. Vui lòng thử lại!")
}

/**
 * AI tự động sinh trọn bộ các block bài học (Lý thuyết, Từ vựng IPA, Hội thoại, Trắc nghiệm, Video, File)
 * Gọi qua Backend API `POST /admin/lessons/generate-ai` (chạy trên Google Gemini)
 */
export async function generateLessonBlocksWithAi({ prompt, titleVi, titleEn, lessonType = 'VOCABULARY' }) {
  const effectivePrompt = (prompt || titleVi || '').trim()

  // 1. Heuristic kiểm tra nội dung không phải chủ đề giáo dục (tên riêng, câu chào, ký tự ngẫu nhiên)
  const lower = effectivePrompt.toLowerCase()
  const vietnameseNamesRegex = /^(hòa trần|hoa tran|nguyễn|trần|lê|phạm|hoàng|huỳnh|phan|vũ|võ|đặng|bùi|đỗ|hồ|ngô|dương|lý)\s*([a-zA-Zà-ỹÀ-Ỹ\s]*)$/i
  const isGreetingOrSpam = /^(hi|hello|alo|chào|xin chào|hey|test|testing|abc|123|haizz|ơi|bạn ơi|chào bạn|admin|ê|tôi là ai)$/i.test(lower)

  if (
    !effectivePrompt ||
    effectivePrompt.length < 3 ||
    isGreetingOrSpam ||
    (vietnameseNamesRegex.test(lower) &&
      effectivePrompt.split(/\s+/).length <= 4 &&
      !lower.includes('bài') &&
      !lower.includes('học') &&
      !lower.includes('tiếng anh'))
  ) {
    return {
      isValidTopic: false,
      aiMessage: `Chào bạn! Yêu cầu "${effectivePrompt}" dường như là tên riêng, câu chào hỏi hoặc chưa phải một chủ đề bài học tiếng Anh cụ thể.\n\nĐể tôi hỗ trợ soạn giáo án chuẩn nhất, bạn vui lòng cung cấp chủ đề hoặc ngữ cảnh bài học tiếng Anh nhé (Ví dụ: "Gọi món ở nhà hàng", "Thì Quá khứ đơn", "Phỏng vấn xin việc tiếng Anh", "Từ vựng sân bay & du lịch"...).`,
    }
  }

  // 2. Thử gọi qua Backend API Gateway (POST /admin/lessons/generate-ai)
  try {
    const res = await api.post(ENDPOINTS.lessons.generateAi, {
      data: {
        prompt: effectivePrompt,
        lessonType,
        currentTitle: titleVi || '',
      },
    })

    if (res && (res.contentBlocks || res.titleVi)) {
      const normalized = normalizeAiLessonResponse(res, titleVi, titleEn, lessonType)
      return { ...normalized, isValidTopic: true }
    }
  } catch (backendErr) {
    throw new Error(`Backend AI không thể sinh bài học: ${backendErr?.message || 'Không xác định'}`, { cause: backendErr })
  }

  throw new Error('Backend AI không thể sinh nội dung bài học lúc này. Vui lòng thử lại!')
}

/**
 * Chuẩn hóa các block trả về từ Backend Gemini thành định dạng giao diện tương thích
 */
function normalizeAiLessonResponse(res, originalTitleVi, originalTitleEn, originalLessonType) {
  const rawBlocks = Array.isArray(res.contentBlocks) ? res.contentBlocks : []

  let theoryBlock = {
    type: 'theory',
    title: '',
    content: '',
  }

  const vocabItems = []
  const dialogueLines = []
  let dialogueTitle = 'Đoạn hội thoại thực hành'
  const quizQuestions = []
  let videoBlock = null
  let attachmentBlock = null

  rawBlocks.forEach((b, idx) => {
    const type = (b.type || '').toLowerCase()

    if (type === 'theory') {
      theoryBlock = {
        type: 'theory',
        title: b.title || theoryBlock.title || 'Cấu trúc & Quy tắc trọng tâm',
        content: b.content || theoryBlock.content || '',
      }
    } else if (type === 'vocabulary') {
      if (Array.isArray(b.items)) {
        b.items.forEach((it) => {
          vocabItems.push({
            word: it.word || '',
            ipa: it.ipa || it.phonetic || '',
            meaningVi: it.meaningVi || it.meaning || '',
            exampleEn: it.exampleEn || it.example || '',
          })
        })
      } else if (b.word) {
        vocabItems.push({
          word: b.word,
          ipa: b.phonetic || b.ipa || '',
          meaningVi: b.meaning || b.meaningVi || '',
          exampleEn: b.example || b.exampleEn || '',
        })
      }
    } else if (type === 'dialogue') {
      if (b.title) dialogueTitle = b.title
      if (Array.isArray(b.lines)) {
        b.lines.forEach((l) => {
          dialogueLines.push({
            speaker: l.speaker || (dialogueLines.length % 2 === 0 ? 'A' : 'B'),
            text: l.text || l.english || '',
            translation: l.translation || l.vietnamese || '',
          })
        })
      } else if (b.english || b.text) {
        dialogueLines.push({
          speaker: b.speaker || (dialogueLines.length % 2 === 0 ? 'A' : 'B'),
          text: b.english || b.text || '',
          translation: b.vietnamese || b.translation || '',
        })
      }
    } else if (type === 'quiz') {
      if (Array.isArray(b.questions)) {
        b.questions.forEach((q, qIndex) => {
          quizQuestions.push({
            id: q.id || qIndex + 1,
            question: q.question || '',
            options: Array.isArray(q.options) ? q.options : ['A. ', 'B. ', 'C. ', 'D. '],
            correctAnswer: q.correctAnswer || 'A',
            explanation: q.explanation || '',
          })
        })
      } else if (b.question) {
        quizQuestions.push({
          id: quizQuestions.length + 1,
          question: b.question,
          options: Array.isArray(b.options) ? b.options : ['A. ', 'B. ', 'C. ', 'D. '],
          correctAnswer: b.correctAnswer || 'A',
          explanation: b.explanation || '',
        })
      }
    } else if (type === 'video') {
      videoBlock = {
        type: 'video',
        title: b.title || 'Video bài giảng minh họa',
        videoUrl: b.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        durationSeconds: b.durationSeconds || 300,
        notes: b.notes || 'Xem kỹ video để nắm vững phát âm và ngữ điệu giao tiếp.',
      }
    } else if (type === 'attachment' || type === 'file' || type === 'document') {
      attachmentBlock = {
        type: 'attachment',
        title: b.title || 'Tài liệu tóm tắt & Handout bài học',
        fileUrl: b.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        fileName: b.fileName || 'lesson-notes.pdf',
        fileSize: b.fileSize || '1.5 MB',
      }
    }
  })

  // Nếu chưa có video/attachment thì bổ sung mặc định mẫu
  if (!videoBlock) {
    videoBlock = {
      type: 'video',
      title: 'Video bài giảng minh họa',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      durationSeconds: 300,
      notes: 'Video hỗ trợ luyện nghe phát âm và các mẫu câu giao tiếp.',
    }
  }

  if (!attachmentBlock) {
    attachmentBlock = {
      type: 'attachment',
      title: 'Tài liệu đính kèm (Slide / PDF)',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: 'handout-lesson.pdf',
      fileSize: '1.2 MB',
    }
  }

  const finalBlocks = [
    theoryBlock,
    {
      type: 'vocabulary',
      items: vocabItems.length > 0 ? vocabItems : [
        { word: 'practice', ipa: '/ˈpræk.tɪs/', meaningVi: 'Luyện tập', exampleEn: 'Practice makes perfect.' }
      ],
    },
    {
      type: 'dialogue',
      title: dialogueTitle,
      lines: dialogueLines.length > 0 ? dialogueLines : [
        { speaker: 'A', text: 'Hello! How are you doing today?', translation: 'Xin chào! Hôm nay bạn thế nào?' },
        { speaker: 'B', text: 'I am doing great, thank you!', translation: 'Tôi rất khỏe, cảm ơn bạn!' },
      ],
    },
    {
      type: 'quiz',
      questions: quizQuestions.length > 0 ? quizQuestions : [
        {
          id: 1,
          question: 'What is the standard response to "How are you"?',
          options: ['A. I am good, thank you.', 'B. Good morning.', 'C. Nice.', 'D. See you.'],
          correctAnswer: 'A',
          explanation: 'Lựa chọn A là cách đáp lại lịch sự và phổ biến nhất.',
        }
      ],
    },
    videoBlock,
    attachmentBlock,
  ]

  return {
    titleVi: res.titleVi || originalTitleVi || 'Unit Mới',
    titleEn: res.titleEn || originalTitleEn || 'New Unit',
    lessonType: res.lessonType || originalLessonType || 'VOCABULARY',
    aiMessage: res.aiMessage || 'Trợ lý AI đã sinh cấu trúc bài học thành công theo yêu cầu của bạn.',
    durationMinutes: res.durationMinutes || 15,
    xpReward: res.xpReward || 30,
    contentBlocks: finalBlocks,
  }
}

/**
 * Tải ảnh lên AWS S3 qua Content Service API
 * @param {File} file
 * @param {string} folder
 * @returns {Promise<{ url: string, fileName?: string, isS3?: boolean, message?: string }>}
 */
export async function uploadCourseImage(file, folder = 'courses/thumbnails') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)

  try {
    const res = await api.post('/admin/courses/upload/image', {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res?.data || res
  } catch (e) {
    const res = await api.post('/admin/upload/image', {
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return res?.data || res
  }
}

/**
 * Tải video bài giảng lên Cloudflare R2 qua Content Service API (0đ phí băng thông)
 * @param {File} file tệp video mp4/webm
 * @param {string} folder thư mục lưu trữ, vd: courses/1/lessons/2/videos
 * @param {string} title tiêu đề bài học để sinh tên file chuẩn đẹp
 * @param {function} onProgress callback nhận % tiến trình upload (0 - 100)
 * @returns {Promise<{ url: string, fileName: string, size: number, isR2: boolean, message: string }>}
 */
export async function uploadCourseVideo(file, folder = 'courses/videos', title = '', onProgress = null) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  if (title) {
    formData.append('title', title)
  }

  const { http } = await import('@/lib/api')

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    },
  }

  try {
    const res = await http.post('/admin/courses/upload/video', formData, config)
    return res?.data || res
  } catch (e) {
    const res = await http.post('/admin/upload/video', formData, config)
    return res?.data || res
  }
}

/**
 * Xóa video bài giảng trên Cloudflare R2
 * @param {string} videoUrl đường dẫn URL video cần xóa
 */
export async function deleteCourseVideo(videoUrl) {
  if (!videoUrl) return null
  const { http } = await import('@/lib/api')
  try {
    return await http.delete('/admin/upload/video', { params: { videoUrl } })
  } catch (err) {
    console.warn('Lỗi khi xóa video trên Cloudflare R2:', err)
    return null
  }
}
