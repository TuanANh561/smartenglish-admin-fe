/**
 * aiConfigConstants.js
 * Cấu hình tham số Hệ thống AI cho SmartEnglish
 * Đồng bộ chính xác 100% với:
 * - Backend: content-service (GeminiAiService) & ai-practice-service (SpeakingPracticeService, ImageScanController)
 * - Mobile: ai-speaking (Phoneme Scoring, TTS), ai-chatbot (Teacher Cáo), ai-scan (Vision OCR)
 */

export const AI_SERVICES_STATUS = {
  llmGateway: { name: 'Google Gemini Gateway', status: 'OPERATIONAL', latency: 195, region: 'ap-southeast-1' },
  speechEngine: { name: 'Pronunciation & STT Engine', status: 'OPERATIONAL', latency: 140, service: 'ai-practice-service:8084' },
  visionEngine: { name: 'Multimodal Vision / OCR', status: 'OPERATIONAL', latency: 310, service: 'content-service:8082' },
  roleplayChat: { name: 'Teacher Cáo Dialogue', status: 'OPERATIONAL', latency: 180, service: 'ai-practice-service:8084' },
}

export const LLM_MODELS_CATALOG = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google AI',
    tier: 'Khuyên dùng mặc định',
    contextWindow: '1,048,576 tokens',
    latencyAvg: '180ms',
    costScore: '$ (Rất thấp)',
    bestFor: 'Sinh học liệu, bài thi, hội thoại Teacher Cáo và bóc tách PDF',
    recommended: true,
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google AI',
    tier: 'Siêu tốc độ',
    contextWindow: '1,048,576 tokens',
    latencyAvg: '95ms',
    costScore: '$ (Thấp nhất)',
    bestFor: 'Chatbot phản xạ nhanh, gợi ý câu nói realtime trên Mobile',
    recommended: false,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google AI',
    tier: 'Suy luận chuyên sâu',
    contextWindow: '2,097,152 tokens',
    latencyAvg: '480ms',
    costScore: '$$$ (Cao)',
    bestFor: 'Chấm bài viết luận IELTS/CEFR, soạn giáo án khóa học phức tạp',
    recommended: false,
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (LTS)',
    provider: 'Google AI',
    tier: 'Dự phòng ổn định',
    contextWindow: '1,048,576 tokens',
    latencyAvg: '210ms',
    costScore: '$ (Rất thấp)',
    bestFor: 'Dự phòng khi các dòng 2.5 đạt giới hạn tải',
    recommended: false,
  },
  {
    id: 'gpt-4o-mini',
    name: 'OpenAI GPT-4o Mini',
    provider: 'OpenAI (Secondary)',
    tier: 'Dự phòng bên thứ 3',
    contextWindow: '128,000 tokens',
    latencyAvg: '240ms',
    costScore: '$$ (Trung bình)',
    bestFor: 'Dự phòng khi cụm Google AI gặp sự cố hạ tầng',
    recommended: false,
  },
]

export const VOICE_PERSONAS_LIST = [
  {
    id: 'en-US-Standard-C',
    name: 'Sarah (US Nữ)',
    accent: 'Mỹ (General American)',
    gender: 'Nữ',
    wpm: 145,
    sampleText: 'Welcome to SmartEnglish. Let us practice English pronunciation together.',
    tag: 'Giọng bản xứ chuẩn California, ngữ điệu tự nhiên và truyền cảm.',
  },
  {
    id: 'en-US-Standard-D',
    name: 'Alex (US Nam)',
    accent: 'Mỹ (General American)',
    gender: 'Nam',
    wpm: 140,
    sampleText: 'Good morning! Focus on ending sounds and clear sentence stress.',
    tag: 'Giọng nam trầm ấm, phát âm rõ từng phụ âm, rất tốt cho người mới bắt đầu.',
  },
  {
    id: 'en-GB-Standard-A',
    name: 'Emma (UK Nữ)',
    accent: 'Anh (Received Pronunciation - RP)',
    gender: 'Nữ',
    wpm: 135,
    sampleText: 'Hello there! Today we shall practice British English vowels and intonation.',
    tag: 'Giọng chuẩn đài BBC / Oxford, thích hợp cho học viên luyện thi IELTS.',
  },
  {
    id: 'en-GB-Standard-B',
    name: 'Oliver (UK Nam)',
    accent: 'Anh (Received Pronunciation - RP)',
    gender: 'Nam',
    wpm: 142,
    sampleText: 'Brilliant work! Consistent daily practice will refine your British accent.',
    tag: 'Giọng học thuật, rõ ràng, phong cách giao tiếp công sở chuyên nghiệp.',
  },
  {
    id: 'en-AU-Standard-A',
    name: 'Liam (Úc - AU)',
    accent: 'Úc (Australian English)',
    gender: 'Nam',
    wpm: 148,
    sampleText: 'G’day! Ready to improve your conversational English fluency today?',
    tag: 'Giọng Úc thân thiện, năng động, phù hợp giao tiếp đời thường.',
  },
]

export const INITIAL_AI_SYSTEM_CONFIG = {
  // 1. Quản lý LLM Provider & Key Pool (Khớp với backend .env)
  provider: 'google-gemini',
  primaryModel: 'gemini-2.5-flash',
  fallbackModel: 'gemini-1.5-flash',
  temperature: 0.4,
  maxOutputTokens: 2048,
  topP: 0.95,
  apiKeyPool: [
    {
      id: 'key-prod-01',
      label: 'Gemini Primary Production Key (.env)',
      keyMasked: 'gemini-prod-key-configured-via-backend-env-01',
      status: 'ACTIVE',
      usageToday: 14820,
      quotaLimit: 50000,
      errorRate: '0.01%',
      lastCall: '12 giây trước',
    },
    {
      id: 'key-prod-02',
      label: 'Gemini Secondary Backup Key',
      keyMasked: 'gemini-backup-standby-key-rotation-pool-02',
      status: 'STANDBY',
      usageToday: 410,
      quotaLimit: 50000,
      errorRate: '0.00%',
      lastCall: '2 giờ trước',
    },
  ],

  // 2. Phân bổ Model theo Nghiệp vụ (Task-specific Routing)
  routing: {
    // Sinh bài đọc hiểu, quiz, bài thi (content-service:8082 /admin/ai/contents)
    contentStudio: {
      model: 'gemini-2.5-flash',
      temperature: 0.4,
      autoApproveThreshold: 90, // Tự động duyệt nếu điểm tin cậy >= 90%
      generateExplanations: true,
    },
    // Bóc tách PDF từ vựng (content-service:8082 /admin/ai/extract-pdf)
    pdfExtractor: {
      model: 'gemini-2.5-flash',
      temperature: 0.2,
      ocrMode: 'MULTIMODAL_HIGH_RES',
      autoDetectIpa: true,
      autoGenerateExamples: true,
    },
    // Chatbot Teacher Cáo (ai-practice-service:8084 /ai-practice/chat)
    teacherCaoChat: {
      model: 'gemini-2.5-flash-lite',
      temperature: 0.65,
      contextMemoryTurns: 12, // Nhớ 12 lượt hội thoại gần nhất
      bilingualSupport: true, // Hỗ trợ giải nghĩa song ngữ
      personaPrompt:
        'Bạn là Teacher Cáo - Trợ lý gia sư tiếng Anh thông minh, vui vẻ và kiên nhẫn của SmartEnglish AI. Luôn điều chỉnh từ vựng theo đúng trình độ CEFR của học viên, khen ngợi sự tiến bộ, chỉ ra lỗi phát âm/ngữ pháp một cách tinh tế và gợi ý cách diễn đạt tự nhiên hơn.',
    },
    // Chấm bài viết luận (ai-writing mobile)
    writingEvaluation: {
      model: 'gemini-2.5-pro',
      temperature: 0.2,
      rubricStandard: 'CEFR_IELTS', // Chấm theo tiêu chuẩn 4 tiêu chí CEFR/IELTS
      provideDetailedCorrections: true,
    },
  },

  // 3. Động cơ Luyện nói & Chấm âm vị IPA (ai-practice-service:8084 SpeakingPracticeController)
  speechEngine: {
    selectedVoice: 'en-US-Standard-C',
    speechRate: 1.0,
    speechPitch: 1.0,
    // Ngưỡng điểm phát âm (khớp PronunciationResultResponseDTO)
    passingOverallThreshold: 75,
    minAccuracyScore: 70,
    minStressScore: 65,
    minFluencyScore: 60,
    // Chế độ nhận dạng âm vị IPA
    phonemeStrictness: 'BALANCED', // 'LENIENT' | 'BALANCED' | 'STRICT'
    highlightWeakPhonemes: true, // Bôi đỏ âm vị phát âm sai trên mobile
    nativeAudioReference: 'NEURAL_HD',
  },

  // 4. Hạn mức & Kiểm soát chi phí (Quota & Cost Protection)
  quotas: {
    freeUserChatLimitPerDay: 20,
    freeUserSpeakingLimitPerDay: 8,
    vipUserChatLimitPerDay: 500,
    vipUserSpeakingLimitPerDay: 200,
    teacherGenLimitPerDay: 100,
    costProtectionEnabled: true,
    budgetThresholdAlert: 85, // Cảnh báo khi chạm 85% hạn ngạch
    fallbackToLiteOnSpike: true, // Tự động hạ xuống model Lite khi server quá tải
  },
}
