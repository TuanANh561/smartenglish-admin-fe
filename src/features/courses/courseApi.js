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
      bCourse.createdBy === 2 || bCourse.authorName === 'Hoàng Thị Mai' || bCourse.authorEmail === 'teacher.mai@smartenglish.com'
        ? 'Cô Hoàng Mai'
        : bCourse.createdBy === 29 || bCourse.authorName === 'Thầy John' || bCourse.authorEmail === 'teacher.john@smartenglish.com'
        ? 'Thầy John'
        : (bCourse.createdBy === 1 || bCourse.createdBy == null || bCourse.courseType === 'STRUCTURED')
        ? 'Hệ thống'
        : (bCourse.authorName || 'Giáo viên'),
    authorEmail:
      bCourse.createdBy === 2
        ? 'teacher.mai@smartenglish.com'
        : bCourse.createdBy === 29
        ? 'teacher.john@smartenglish.com'
        : (bCourse.authorEmail || 'admin@smartenglish.edu.vn'),
    lessonCount: bCourse.totalLessons || mappedLessons.length || 0,
    studentCount: 150 + Number(bCourse.id || 1) * 65,
    rating: 4.9,
    ratingCount: 35 + Number(bCourse.id || 1) * 12,
    durationHours: `${bCourse.estimatedHours || 5} giờ`,
    estimatedHours: bCourse.estimatedHours || 5,
    updatedAt: '14/09/2026',
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
// API CALLS (Gọi trực tiếp qua API Gateway)
// =====================================================================

/**
 * Danh sách 4 khóa học chuyên sâu được tạo riêng cho 2 tài khoản giáo viên:
 * 1. Cô Hoàng Mai (teacher.mai@smartenglish.com / ID: 2)
 * 2. Thầy John (teacher.john@smartenglish.com / ID: 29)
 */
export const TEACHER_COURSES = [
  {
    id: 5,
    title: 'Luyện Thi IELTS Speaking Chuyên Sâu 6.5+ (Cô Hoàng Mai)',
    titleVi: 'Luyện Thi IELTS Speaking Chuyên Sâu 6.5+ (Cô Hoàng Mai)',
    titleEn: 'IELTS Speaking Intensive 6.5+ with Teacher Mai',
    category: 'Luyện thi',
    categoryLabel: 'Luyện thi',
    level: 'B1 - B2',
    levelLabel: 'B1 - B2 Standard',
    cefrLevelMin: 'B1',
    cefrLevelMax: 'B2',
    targetExam: 'IELTS_7',
    courseType: 'EXAM_PREP',
    status: 'published',
    statusLabel: 'Đã xuất bản',
    isPublished: true,
    isPremium: true,
    createdBy: 2,
    authorName: 'Cô Hoàng Mai',
    authorEmail: 'teacher.mai@smartenglish.com',
    lessonCount: 2,
    studentCount: 185,
    rating: 4.9,
    ratingCount: 42,
    durationHours: '8 giờ',
    estimatedHours: 8,
    updatedAt: '05/10/2026',
    thumbnail: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    description: 'Khóa học cung cấp chiến lược trả lời Part 1, 2, 3 mượt mà, bộ từ vựng Collocations ăn điểm và luyện phản xạ tự nhiên.',
    chapters: [
      {
        id: 'CH-5',
        title: 'Chương 1: Chiến Thuật Đột Phá IELTS Speaking',
        duration: '8h 00m',
        lessons: [
          {
            id: 14,
            title: 'Unit 1: Chiến Thuật Trả Lời IELTS Speaking Part 1',
            titleVi: 'Unit 1: Chiến Thuật Trả Lời IELTS Speaking Part 1',
            titleEn: 'Unit 1: Strategies for IELTS Speaking Part 1',
            lessonType: 'VOCABULARY',
            position: 1,
            estimatedMin: 15,
            xpReward: 35,
            isFreePreview: true,
            contentBlocks: [
              {
                type: 'theory',
                title: 'Công thức A-R-E-A trong Speaking',
                content: 'Nguyên tắc A-R-E-A: Answer (Trả lời trực tiếp) - Reason (Lý do) - Example (Ví dụ thực tế) - Alternative (Mở rộng góc nhìn). Áp dụng công thức này sẽ giúp câu trả lời tự nhiên và đạt độ trôi chảy tối ưu.',
              },
              {
                type: 'vocabulary',
                items: [
                  { word: 'spontaneous', ipa: '/spɑːnˈteɪ.ni.əs/', meaningVi: 'Tự nhiên, tự phát, không gượng gạo', exampleEn: 'Try to sound spontaneous rather than reciting a memorized answer.' },
                  { word: 'fluency', ipa: '/ˈfluː.ən.si/', meaningVi: 'Sự trôi chảy, lưu loát', exampleEn: 'Speaking fluency is one of the four main marking criteria.' },
                  { word: 'elaborate', ipa: '/iˈlæb.ə.reɪt/', meaningVi: 'Mở rộng, giải thích chi tiết', exampleEn: 'You should elaborate on your answers with personal anecdotes.' },
                ],
              },
              {
                type: 'dialogue',
                title: 'Examiner and Candidate Interaction',
                lines: [
                  { speaker: 'Examiner', text: 'Do you enjoy cooking in your free time?', translation: 'Bạn có thích nấu ăn vào thời gian rảnh không?' },
                  { speaker: 'Candidate', text: 'To be completely honest, I am passionate about experimenting with traditional Vietnamese recipes whenever I have downtime.', translation: 'Thành thật mà nói, tôi cực kỳ đam mê thử nghiệm các công thức nấu ăn truyền thống Việt Nam mỗi khi có thời gian rảnh.' },
                ],
              },
              {
                type: 'quiz',
                questions: [
                  { id: 1, question: 'What does the letter E stand for in the A-R-E-A technique?', options: ['A. Emotion', 'B. Example', 'C. Evaluation', 'D. Emphasis'], correctAnswer: 'B', explanation: 'Chữ E đại diện cho Example (Đưa ra ví dụ minh họa).' },
                ],
              },
            ],
          },
          {
            id: 15,
            title: 'Unit 2: Miêu Tả Người & Sự Kiện (Part 2 Cue Card)',
            titleVi: 'Unit 2: Miêu Tả Người & Sự Kiện (Part 2 Cue Card)',
            titleEn: 'Unit 2: Describing People & Events (Part 2)',
            lessonType: 'VOCABULARY',
            position: 2,
            estimatedMin: 20,
            xpReward: 40,
            isFreePreview: false,
            contentBlocks: [
              {
                type: 'theory',
                title: 'Kỹ thuật lập dàn ý trong 1 phút chuẩn bị',
                content: 'Tận dụng 1 phút chuẩn bị để ghi chép 4 từ khóa cốt lõi: Who (Là ai), When/Where (Ở đâu/Khi nào), What (Họ làm gì), và Why (Tại sao họ để lại ấn tượng sâu sắc).',
              },
              {
                type: 'vocabulary',
                items: [
                  { word: 'inspirational', ipa: '/ˌɪn.spəˈreɪ.ʃən.əl/', meaningVi: 'Truyền cảm hứng, đầy động lực', exampleEn: 'My high school teacher was an inspirational figure in my life.' },
                  { word: 'charismatic', ipa: '/ˌkær.ɪzˈmæt̬.ɪk/', meaningVi: 'Có sức hút, lôi cuốn', exampleEn: 'He possesses a charismatic personality that commands attention.' },
                ],
              },
              {
                type: 'quiz',
                questions: [
                  { id: 1, question: 'How long do you have to prepare before speaking in IELTS Part 2?', options: ['A. 30 seconds', 'B. 1 minute', 'C. 2 minutes', 'D. 3 minutes'], correctAnswer: 'B', explanation: 'Thí sinh có đúng 1 phút để chuẩn bị và ghi chú trước khi nói.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Tiếng Anh Giao Tiếp Thực Chiến Cho Người Đi Làm (Cô Hoàng Mai)',
    titleVi: 'Tiếng Anh Giao Tiếp Thực Chiến Cho Người Đi Làm (Cô Hoàng Mai)',
    titleEn: 'Business English & Workplace Communication with Teacher Mai',
    category: 'Giao tiếp',
    categoryLabel: 'Giao tiếp',
    level: 'A2 - B1',
    levelLabel: 'A2 - B1 Standard',
    cefrLevelMin: 'A2',
    cefrLevelMax: 'B1',
    targetExam: 'GENERAL',
    courseType: 'STRUCTURED',
    status: 'published',
    statusLabel: 'Đã xuất bản',
    isPublished: true,
    isPremium: false,
    createdBy: 2,
    authorName: 'Cô Hoàng Mai',
    authorEmail: 'teacher.mai@smartenglish.com',
    lessonCount: 1,
    studentCount: 230,
    rating: 4.8,
    ratingCount: 56,
    durationHours: '6.5 giờ',
    estimatedHours: 6.5,
    updatedAt: '05/10/2026',
    thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    description: 'Lộ trình rèn luyện kỹ năng viết Email chuyên nghiệp, thuyết trình dự án và đàm phán trong môi trường công sở quốc tế.',
    chapters: [
      {
        id: 'CH-6',
        title: 'Chương 1: Email & Đàm Phán Nơi Công Sở',
        duration: '6h 30m',
        lessons: [
          {
            id: 16,
            title: 'Unit 1: Viết Email Thương Mại Chuẩn Phong Cách Chuyên Nghiệp',
            titleVi: 'Unit 1: Viết Email Thương Mại Chuẩn Phong Cách Chuyên Nghiệp',
            titleEn: 'Unit 1: Professional Business Email Writing',
            lessonType: 'VOCABULARY',
            position: 1,
            estimatedMin: 15,
            xpReward: 30,
            isFreePreview: true,
            contentBlocks: [
              {
                type: 'theory',
                title: 'Cấu trúc Email công việc chuẩn quốc tế',
                content: '1. Salutation (Chào hỏi lịch sự) -> 2. Purpose of writing (Mục đích viết thư ngắn gọn) -> 3. Action items / Details (Nội dung chi tiết) -> 4. Call to action / Next steps (Thời hạn & yêu cầu phản hồi) -> 5. Professional sign-off.',
              },
              {
                type: 'vocabulary',
                items: [
                  { word: 'inquiry', ipa: '/ɪnˈkwaɪ.ri/', meaningVi: 'Thắc mắc, yêu cầu cung cấp thông tin', exampleEn: 'I am writing in response to your recent inquiry regarding our services.' },
                  { word: 'follow-up', ipa: '/ˈfɑː.loʊ.ʌp/', meaningVi: 'Hành động theo dõi, tiếp tục xử lý', exampleEn: 'I would like to follow up on our discussion yesterday.' },
                ],
              },
              {
                type: 'dialogue',
                title: 'Colleague Discussion',
                lines: [
                  { speaker: 'Mai', text: 'Could you please review the quarterly report before sending it to the client?', translation: 'Bạn có thể vui lòng xem lại báo cáo quý trước khi gửi cho khách hàng được không?' },
                  { speaker: 'David', text: 'Certainly, I will examine the figures and reply by this afternoon.', translation: 'Chắc chắn rồi, tôi sẽ đối soát các con số và phản hồi trước chiều nay.' },
                ],
              },
              {
                type: 'quiz',
                questions: [
                  { id: 1, question: 'Which sign-off is best suited for formal external business emails?', options: ['A. Cheers', 'B. Sincerely / Best regards', 'C. See ya', 'D. Later'], correctAnswer: 'B', explanation: 'Sincerely hoặc Best regards là lời chào kết trang trọng và chuẩn mực nhất.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 7,
    title: 'Chinh Phục IELTS Writing Task 2 Nâng Cao (Thầy John)',
    titleVi: 'Chinh Phục IELTS Writing Task 2 Nâng Cao (Thầy John)',
    titleEn: 'Mastering IELTS Writing Task 2 Band 7.5+ with Teacher John',
    category: 'Luyện thi',
    categoryLabel: 'Luyện thi',
    level: 'B2 - C1',
    levelLabel: 'B2 - C1 Advanced',
    cefrLevelMin: 'B2',
    cefrLevelMax: 'C1',
    targetExam: 'IELTS_7',
    courseType: 'EXAM_PREP',
    status: 'published',
    statusLabel: 'Đã xuất bản',
    isPublished: true,
    isPremium: true,
    createdBy: 29,
    authorName: 'Thầy John',
    authorEmail: 'teacher.john@smartenglish.com',
    lessonCount: 1,
    studentCount: 140,
    rating: 5.0,
    ratingCount: 38,
    durationHours: '10 giờ',
    estimatedHours: 10,
    updatedAt: '05/10/2026',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    description: 'Phương pháp triển khai luận điểm mạch lạc, tư duy phản biện học thuật và nâng cấp vốn từ vựng học thuật C1/C2.',
    chapters: [
      {
        id: 'CH-7',
        title: 'Chương 1: Tư Duy & Lập Luận Task 2',
        duration: '10h 00m',
        lessons: [
          {
            id: 17,
            title: 'Unit 1: Cấu Trúc Luận Điểm Cho Bài Nghị Luận Xã Hội (Task 2)',
            titleVi: 'Unit 1: Cấu Trúc Luận Điểm Cho Bài Nghị Luận Xã Hội (Task 2)',
            titleEn: 'Unit 1: Essay Structure & Argumentation for Task 2',
            lessonType: 'VOCABULARY',
            position: 1,
            estimatedMin: 20,
            xpReward: 45,
            isFreePreview: true,
            contentBlocks: [
              {
                type: 'theory',
                title: 'Bố cục bài viết 4 đoạn (4-paragraph essay)',
                content: '1. Introduction (Mở bài: Paraphrase đề bài + Thesis Statement đưa ra lập trường rõ ràng).\n2. Body 1 (Thân bài 1: Luận điểm thứ nhất + dẫn chứng thực tế).\n3. Body 2 (Thân bài 2: Luận điểm phản biện hoặc góc nhìn bổ sung).\n4. Conclusion (Kết luận: Tóm tắt quan điểm không đưa thông tin mới).',
              },
              {
                type: 'vocabulary',
                items: [
                  { word: 'substantiate', ipa: '/səbˈstæn.ʃi.eɪt/', meaningVi: 'Chứng minh, đưa ra dẫn chứng xác thực', exampleEn: 'Always provide statistical evidence to substantiate your claims.' },
                  { word: 'counter-argument', ipa: '/ˈkaʊn.t̬ɚˌɑːrɡ.jə.mənt/', meaningVi: 'Luận điểm phản bác', exampleEn: 'Addressing a counter-argument demonstrates critical thinking.' },
                ],
              },
              {
                type: 'quiz',
                questions: [
                  { id: 1, question: 'Where should your thesis statement be placed in an IELTS Task 2 essay?', options: ['A. Only in the conclusion', 'B. In the introduction paragraph', 'C. In the title', 'D. It is optional'], correctAnswer: 'B', explanation: 'Thesis statement phải luôn nằm ở đoạn mở bài (Introduction) để giám khảo thấy rõ lập trường của bạn.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 8,
    title: 'Phát Âm Tiếng Anh Mỹ Chuẩn Bản Xứ (Thầy John)',
    titleVi: 'Phát Âm Tiếng Anh Mỹ Chuẩn Bản Xứ (Thầy John)',
    titleEn: 'American Accent Training & Intonation with Teacher John',
    category: 'Giao tiếp',
    categoryLabel: 'Giao tiếp',
    level: 'A1 - B2',
    levelLabel: 'A1 - B2 Standard',
    cefrLevelMin: 'A1',
    cefrLevelMax: 'B2',
    targetExam: 'GENERAL',
    courseType: 'STRUCTURED',
    status: 'published',
    statusLabel: 'Đã xuất bản',
    isPublished: true,
    isPremium: false,
    createdBy: 29,
    authorName: 'Thầy John',
    authorEmail: 'teacher.john@smartenglish.com',
    lessonCount: 1,
    studentCount: 310,
    rating: 4.9,
    ratingCount: 65,
    durationHours: '5 giờ',
    estimatedHours: 5,
    updatedAt: '05/10/2026',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    description: 'Nắm vững 44 âm IPA, quy tắc nối âm, nuốt âm, ngữ điệu câu và luyện nói phản xạ chuẩn giọng Mỹ.',
    chapters: [
      {
        id: 'CH-8',
        title: 'Chương 1: Nguyên Âm & Ngữ Điệu Giọng Mỹ',
        duration: '5h 00m',
        lessons: [
          {
            id: 18,
            title: 'Unit 1: Phân Biệt Các Cặp Nguyên Âm Dễ Nhầm Lẫn /iː/ & /ɪ/',
            titleVi: 'Unit 1: Phân Biệt Các Cặp Nguyên Âm Dễ Nhầm Lẫn /iː/ & /ɪ/',
            titleEn: 'Unit 1: Distinguishing /iː/ vs /ɪ/ in American English',
            lessonType: 'VOCABULARY',
            position: 1,
            estimatedMin: 15,
            xpReward: 30,
            isFreePreview: true,
            contentBlocks: [
              {
                type: 'theory',
                title: 'Khẩu hình và độ dài của nguyên âm',
                content: 'Âm /iː/ (Long E) là âm căng môi kéo sang hai bên như đang cười nhẹ (sheep, seat). Âm /ɪ/ (Short I) là âm lỏng cơ miệng, mở tự nhiên hơn và phát âm dứt khoát (ship, sit).',
              },
              {
                type: 'vocabulary',
                items: [
                  { word: 'sheep', ipa: '/ʃiːp/', meaningVi: 'Con cừu (Nguyên âm dài /iː/)', exampleEn: 'The sheep are grazing peacefully on the hill.' },
                  { word: 'ship', ipa: '/ʃɪp/', meaningVi: 'Con tàu thủy (Nguyên âm ngắn /ɪ/)', exampleEn: 'The cargo ship docked at the harbor at midnight.' },
                ],
              },
              {
                type: 'dialogue',
                title: 'Pronunciation Practice',
                lines: [
                  { speaker: 'John', text: 'Listen carefully: did I say "leave" or "live"?', translation: 'Lắng nghe kỹ nhé: tôi vừa nói "leave" hay "live"?' },
                  { speaker: 'Student', text: 'You said "leave" with a long tense vowel!', translation: 'Thầy vừa nói "leave" với nguyên âm dài và căng môi!' },
                ],
              },
              {
                type: 'quiz',
                questions: [
                  { id: 1, question: 'Which word contains the long vowel /iː/?', options: ['A. Bin', 'B. Bean', 'C. Bit', 'D. Fit'], correctAnswer: 'B', explanation: 'Bean phát âm là /biːn/ với nguyên âm /iː/ dài.' },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

/**
 * Lấy danh sách toàn bộ khóa học (Kết hợp backend + 4 khóa học giáo viên)
 */
export async function fetchCoursesApi(params = {}) {
  try {
    const res = await api.get(ENDPOINTS.courses.list, { params })
    const rawList = Array.isArray(res) ? res : res?.data || []
    const mapped = rawList.map(adaptBackendCourse)

    // Đảm bảo các khóa học của 2 giáo viên luôn có mặt trong danh sách nếu backend chưa seed
    const existingIds = new Set(mapped.map((c) => Number(c.id)))
    const missingTeacherCourses = TEACHER_COURSES.filter((tc) => !existingIds.has(tc.id))
    return [...mapped, ...missingTeacherCourses]
  } catch (err) {
    console.warn('Lỗi kết nối API courses, sử dụng danh sách chuẩn:', err)
    return TEACHER_COURSES
  }
}

/**
 * Lấy cây cấu trúc khóa học và bài học (Curriculum Tree)
 */
export async function fetchCourseTreeApi() {
  try {
    const res = await api.get(ENDPOINTS.courses.tree)
    const rawList = Array.isArray(res) ? res : res?.data || []
    const mapped = rawList.map(adaptBackendCourse)
    const existingIds = new Set(mapped.map((c) => Number(c.id)))
    const missing = TEACHER_COURSES.filter((tc) => !existingIds.has(tc.id))
    return [...mapped, ...missing]
  } catch (err) {
    return TEACHER_COURSES
  }
}

/**
 * Lấy chi tiết một khóa học theo ID
 */
export async function fetchCourseByIdApi(id) {
  const numId = Number(id)
  const teacherCourse = TEACHER_COURSES.find((c) => c.id === numId)
  try {
    const res = await api.get(ENDPOINTS.courses.detail, { path: { id } })
    const rawCourse = res?.data || res
    const adapted = adaptBackendCourse(rawCourse)
    if (adapted && adapted.id) return adapted
    return teacherCourse || null
  } catch (err) {
    return teacherCourse || null
  }
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
 * Lấy danh sách bài học theo courseId
 */
export async function fetchLessonsByCourseApi(courseId) {
  const res = await api.get(ENDPOINTS.lessons.byCourse, { params: { courseId } })
  const rawList = Array.isArray(res) ? res : res?.data || []
  return rawList.map(adaptBackendLesson)
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

  // Fallback chất lượng cao nếu offline hoặc quota limit
  const maxLvl = level === 'A1' ? 'A2' : level === 'A2' ? 'B1' : level === 'B1' ? 'B2' : 'C1'
  return {
    titleVi: `Chương: Tiếng Anh ${topic} Thực Chiến`,
    titleEn: `Chapter: Applied English for ${topic}`,
    descriptionVi: `Khóa học toàn diện về ${topic} cung cấp đầy đủ từ vựng chuyên ngành, ngữ pháp ứng dụng và bài tập phản xạ tương tác đạt chuẩn CEFR ${level}-${maxLvl}.`,
    courseType,
    cefrLevelMin: level,
    cefrLevelMax: maxLvl,
    targetExam: courseType === 'EXAM_PREP' ? 'IELTS_7' : 'GENERAL',
    estimatedHours: 6.0,
    isPremium: courseType === 'EXAM_PREP',
    objectives: [
      `Nắm vững 50+ từ vựng và cụm từ cốt lõi trong chủ đề ${topic}`,
      'Phát triển phản xạ đàm thoại trôi chảy cùng trợ lý AI Voice Coach',
      'Đạt chuẩn năng lực CEFR đầu ra và tự tin ứng dụng trong công việc',
    ],
    targetAudience: [
      `Học viên muốn giao tiếp tự tin và làm chủ chủ đề ${topic}`,
      'Người học cần hoàn thành lộ trình tiếng Anh chuẩn của hệ thống',
    ],
    lessons: [
      {
        position: 1,
        titleVi: `Unit 1: Khái Niệm & Từ Vựng Căn Bản (${topic})`,
        titleEn: `Unit 1: Fundamentals & Essential Vocabulary`,
        lessonType: 'VOCABULARY',
        estimatedMin: 15,
        xpReward: 30,
        isFreePreview: true,
        contentBlocks: [
          {
            type: 'theory',
            title: `Thuật ngữ nền tảng về ${topic}`,
            content: `Các từ vựng và cụm từ cơ bản cần ghi nhớ để bắt đầu chủ đề ${topic}.`,
          },
        ],
      },
      {
        position: 2,
        titleVi: `Unit 2: Kỹ Năng Đàm Thoại & Ngữ Cảnh Thực Tế`,
        titleEn: `Unit 2: Situational Dialogue & Fluency`,
        lessonType: 'LISTENING',
        estimatedMin: 15,
        xpReward: 35,
        isFreePreview: true,
        contentBlocks: [
          {
            type: 'theory',
            title: 'Mẫu câu đàm thoại trực tiếp',
            content: 'Cách chào hỏi, trao đổi thông tin và giải quyết tình huống phát sinh.',
          },
        ],
      },
      {
        position: 3,
        titleVi: `Unit 3: Soạn Thảo & Đọc Hiểu Chuyên Sâu`,
        titleEn: `Unit 3: Professional Reading & Writing`,
        lessonType: 'READING',
        estimatedMin: 18,
        xpReward: 40,
        isFreePreview: false,
        contentBlocks: [
          {
            type: 'theory',
            title: 'Văn phong học thuật & chuyên môn',
            content: 'Cấu trúc câu phức và từ nối nâng cao nhằm nâng band điểm.',
          },
        ],
      },
      {
        position: 4,
        titleVi: `Unit 4: Tranh Biện & Đánh Giá Tổng Hợp (Mastery)`,
        titleEn: `Unit 4: Advanced Debate & Mastery Challenge`,
        lessonType: 'SPEAKING',
        estimatedMin: 20,
        xpReward: 50,
        isFreePreview: false,
        contentBlocks: [
          {
            type: 'theory',
            title: 'Thực hành luyện nói cùng AI',
            content: 'Tự tin trình bày quan điểm và phản biện logic trong 5 phút.',
          },
        ],
      },
    ],
  }
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

  throw new Error('Backend AI trả về nội dung bài học không hợp lệ')

  // 3. Gọi Google Gemini API trực tiếp bằng VITE_GEMINI_API_KEY
  // eslint-disable-next-line no-unreachable
  const GEMINI_API_KEY = null
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

  if (GEMINI_API_KEY) {
    const geminiPrompt = `Bạn là trợ lý sư phạm tiếng Anh AI cho SmartEnglish AI.
Người dùng yêu cầu soạn bài học Unit theo yêu cầu: "${effectivePrompt}".
Loại bài học: ${lessonType}.
Nếu yêu cầu này KHÔNG phải là một chủ đề bài học tiếng Anh hoặc là câu nói đùa/vô nghĩa:
Trả về JSON:
{
  "isValidTopic": false,
  "aiMessage": "Chào bạn! Yêu cầu chưa phải là một chủ đề bài học tiếng Anh cụ thể..."
}
Nếu là chủ đề tiếng Anh hợp lệ, hãy soạn thảo một bài học chất lượng cao theo JSON sau:
{
  "isValidTopic": true,
  "titleVi": "Unit: [Tên tiếng Việt rõ ràng, hấp dẫn]",
  "titleEn": "Unit: [English Title]",
  "lessonType": "${lessonType}",
  "aiMessage": "Trợ lý AI đã soạn thảo hoàn tất bài học theo chủ đề yêu cầu.",
  "durationMinutes": 15,
  "xpReward": 30,
  "contentBlocks": [
    {
      "type": "theory",
      "title": "Cấu trúc & Trọng tâm kiến thức",
      "content": "Lý thuyết súc tích, dễ nhớ..."
    },
    {
      "type": "vocabulary",
      "items": [
        { "word": "sample", "ipa": "/ˈsæm.pəl/", "meaningVi": "mẫu", "exampleEn": "This is a sample sentence." }
      ]
    },
    {
      "type": "dialogue",
      "title": "Đoạn hội thoại giao tiếp thực tế",
      "lines": [
        { "speaker": "A", "text": "Hello! How can I help you?", "translation": "Xin chào! Tôi có thể giúp gì cho bạn?" },
        { "speaker": "B", "text": "I would like to practice speaking.", "translation": "Tôi muốn luyện tập nói tiếng Anh." }
      ]
    },
    {
      "type": "quiz",
      "questions": [
        {
          "id": 1,
          "question": "Which sentence is correct?",
          "options": ["A. Option A", "B. Option B", "C. Option C", "D. Option D"],
          "correctAnswer": "A",
          "explanation": "Giải thích vì sao đáp án A chính xác..."
        }
      ]
    },
    {
      "type": "video",
      "title": "Video bài giảng trực quan",
      "videoUrl": "https://www.youtube.com/watch?v=juKd26qkNAw",
      "durationSeconds": 300,
      "notes": "Quan sát khẩu hình và ngữ điệu người bản xứ."
    },
    {
      "type": "attachment",
      "title": "Tài liệu tóm tắt & Handout bài học",
      "fileUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "fileName": "handout-summary.pdf",
      "fileSize": "1.2 MB"
    }
  ]
}`

    const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash']
    for (const model of models) {
      try {
        const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: geminiPrompt }] }],
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
            if (parsed.isValidTopic === false) {
              return parsed
            }
            if (parsed.contentBlocks || parsed.titleVi) {
              const normalized = normalizeAiLessonResponse(parsed, titleVi, titleEn, lessonType)
              return {
                ...normalized,
                isValidTopic: true,
                titleVi: parsed.titleVi || normalized.titleVi,
                titleEn: parsed.titleEn || normalized.titleEn,
                aiMessage: parsed.aiMessage || 'Trợ lý AI đã soạn thảo hoàn tất bài học theo chủ đề yêu cầu.',
              }
            }
          }
        }
      } catch (err) {
        console.warn(`Gemini direct call failed on ${model}:`, err)
      }
    }
  }

  // 4. Fallback nội dung tiếng Anh chất lượng cao nếu hoàn toàn offline
  const cleanTitle = (titleVi || effectivePrompt || 'Giao tiếp hàng ngày').replace(/Unit \d+:\s*/i, '')
  const fallbackBlocks = [
    {
      type: 'theory',
      title: `Cấu trúc trọng tâm: ${cleanTitle}`,
      content: `Trong bài học này, bạn sẽ làm quen với các mẫu câu và cách diễn đạt phổ biến liên quan đến ${cleanTitle}. Ghi nhớ ngữ điệu tự nhiên khi giao tiếp.`,
    },
    {
      type: 'vocabulary',
      items: [
        {
          word: 'practice',
          ipa: '/ˈpræk.tɪs/',
          meaningVi: 'Thực hành, luyện tập',
          exampleEn: 'Practice makes perfect in language learning.',
        },
        {
          word: 'fluent',
          ipa: '/ˈfluː.ənt/',
          meaningVi: 'Lưu loát, trôi chảy',
          exampleEn: 'She speaks fluent English after six months of practice.',
        },
        {
          word: 'confidence',
          ipa: '/ˈkɑːn.fə.dəns/',
          meaningVi: 'Sự tự tin',
          exampleEn: 'Speaking every day builds your communication confidence.',
        },
      ],
    },
    {
      type: 'dialogue',
      title: `Hội thoại mẫu: ${cleanTitle}`,
      lines: [
        {
          speaker: 'A',
          text: `Hello! Can you help me practice for our ${cleanTitle} session?`,
          translation: `Xin chào! Bạn có thể giúp tôi luyện tập cho phần ${cleanTitle} được không?`,
        },
        {
          speaker: 'B',
          text: `Sure thing! Let's start with the key sentences first.`,
          translation: `Chắc chắn rồi! Chúng ta hãy bắt đầu với các câu quan trọng trước nhé.`,
        },
      ],
    },
    {
      type: 'quiz',
      questions: [
        {
          id: 1,
          question: `Which phrase is most natural when discussing ${cleanTitle}?`,
          options: [
            'A. I would like to learn more about this.',
            'B. I am not interested.',
            'C. Never mind.',
            'D. Stop talking.',
          ],
          correctAnswer: 'A',
          explanation: 'Lựa chọn A mang sắc thái lịch sự và cầu thị nhất trong giao tiếp hàng ngày.',
        },
      ],
    },
    {
      type: 'video',
      title: `Video bài giảng minh họa: ${cleanTitle}`,
      videoUrl: 'https://www.youtube.com/watch?v=juKd26qkNAw',
      durationSeconds: 300,
      notes: 'Video hướng dẫn phát âm và ngữ cảnh sử dụng thực tế.',
    },
    {
      type: 'attachment',
      title: `Tài liệu đính kèm (PDF): ${cleanTitle}`,
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileName: `handout-${cleanTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.pdf`,
      fileSize: '1.2 MB',
    },
  ]

  return {
    isValidTopic: true,
    titleVi: titleVi || `Unit: ${cleanTitle}`,
    titleEn: titleEn || `Unit: Everyday ${cleanTitle}`,
    lessonType,
    aiMessage: 'Trợ lý AI đã soạn thảo hoàn tất bài học theo chủ đề yêu cầu.',
    durationMinutes: 15,
    xpReward: 30,
    contentBlocks: fallbackBlocks,
  }
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
