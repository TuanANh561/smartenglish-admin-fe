/**
 * Dịch vụ Gemini AI — sinh nội dung học tiếng Anh
 * Bao gồm: gọi API, xử lý prompt, parse JSON phản hồi, xử lý lỗi
 */

/**
 * Dịch vụ Gemini AI — sinh nội dung học tiếng Anh
 * Hỗ trợ Auto-Fallback (Tự động chuyển Model khi đụng trần Quota/Rate Limit)
 */

// API key lấy từ biến môi trường .env (không hardcode vào source)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// ─── Danh sách các Model ưu tiên theo thứ tự (Auto Fallback) ──────────────────
// Khi Model trước bị đụng rate limit (429) hoặc hết quota, code sẽ tự nhảy sang Model tiếp theo
const GEMINI_MODELS_FALLBACK = [
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash',
  'gemini-3.1-flash',
]

// Lưu kết quả chẩn đoán lần gọi gần nhất để debug khi cần
let lastDiagnostic = null

export function getLastGeminiDiagnostic() {
  return lastDiagnostic
}

// ─── Lớp lỗi tùy chỉnh cho Gemini ────────────────────────────────────────────
// Giúp phân biệt lỗi từ Gemini với các lỗi khác trong app
export class GeminiServiceError extends Error {
  constructor(message, code = 'GEMINI_ERROR', details = null) {
    super(message)
    this.code = code       // Mã lỗi: 'NO_API_KEY', 'RATE_LIMIT', 'PARSE_ERROR'...
    this.details = details // Chi tiết kỹ thuật thêm (nếu có)
    this.name = 'GeminiServiceError'
  }
}

// ─── Trích xuất dữ liệu từ phản hồi thô của Gemini API ───────────────────────
// Gemini trả về cấu trúc lồng nhau, hàm này lấy ra phần quan trọng
export function extractGeminiCandidate(data) {
  const candidate = data?.candidates?.[0] ?? null
  const parts = candidate?.content?.parts ?? []
  // Ghép tất cả phần text lại thành một chuỗi
  const rawText = parts.map((part) => part.text ?? '').join('').trim()
  const finishReason = candidate?.finishReason ?? 'UNKNOWN'
  const usage = data?.usageMetadata ?? null
  // Lý do bị chặn (nếu prompt vi phạm chính sách)
  const blockReason = data?.promptFeedback?.blockReason ?? null
  const safetyRatings = candidate?.safetyRatings ?? []

  return {
    rawText,
    finishReason,
    usage,
    blockReason,
    safetyRatings,
    hasCandidate: Boolean(candidate),
    partCount: parts.length,
  }
}

// ─── Phân tích nguyên nhân lỗi từ metadata Gemini ────────────────────────────
// Đọc các thông số trả về để xác định tại sao Gemini không sinh được nội dung
export function diagnoseGeminiFailure({
  rawText = '',
  finishReason = 'UNKNOWN',
  usage = null,
  blockReason = null,
  parseError = null,
} = {}) {
  // Số token đã dùng (để debug khi bị cắt nội dung)
  const outputTokens = usage?.candidatesTokenCount ?? usage?.candidates_token_count ?? null
  const inputTokens = usage?.promptTokenCount ?? usage?.prompt_token_count ?? null
  const totalTokens = usage?.totalTokenCount ?? usage?.total_token_count ?? null
  const thoughtsTokens = usage?.thoughtsTokenCount ?? usage?.thoughts_token_count ?? null

  const hints = []
  let likelyCause = 'unknown'
  let summary = 'Không xác định được nguyên nhân'

  if (blockReason) {
    // Prompt bị chặn vì nội dung nhạy cảm
    likelyCause = 'safety_block'
    summary = `Gemini chặn prompt (blockReason: ${blockReason})`
    hints.push('Thử chủ đề/prompt khác, tránh nội dung nhạy cảm.')
  } else if (finishReason === 'MAX_TOKENS') {
    // Gemini sinh giữa chừng thì hết quota token → JSON bị cắt
    likelyCause = 'token_limit'
    summary = 'Phản hồi bị cắt giữa chừng do giới hạn token (finishReason: MAX_TOKENS)'
    hints.push('Tăng maxOutputTokens hoặc giảm độ dài yêu cầu (ít câu hỏi / bài ngắn hơn).')
    if (thoughtsTokens) {
      hints.push(`Model đã dùng ${thoughtsTokens} token cho "thinking" — cân nhắc tắt thinkingBudget.`)
    }
  } else if (finishReason === 'SAFETY') {
    // Bộ lọc an toàn của Gemini kích hoạt giữa chừng
    likelyCause = 'safety_filter'
    summary = 'Gemini dừng vì bộ lọc an toàn (finishReason: SAFETY)'
    hints.push('Đổi chủ đề hoặc làm prompt trung tính hơn.')
  } else if (!rawText) {
    // Không nhận được text nào từ Gemini
    likelyCause = 'empty_response'
    summary = 'Gemini không trả về text (có thể bị chặn hoặc lỗi model)'
    hints.push('Kiểm tra quota API key và thử lại sau vài giây.')
  } else if (parseError) {
    // Có text nhưng không parse được thành JSON hợp lệ
    likelyCause = finishReason === 'MAX_TOKENS' ? 'token_limit' : 'invalid_json'
    summary =
      finishReason === 'MAX_TOKENS'
        ? 'JSON không hợp lệ vì phản hồi bị cắt (MAX_TOKENS)'
        : 'Gemini trả về text nhưng không parse được JSON'
    hints.push('Bật responseMimeType: application/json trong generationConfig.')
    hints.push('Xem rawPreview trong console để kiểm tra JSON bị cắt hay sai format.')
  }

  return {
    summary,
    likelyCause,
    hints,
    meta: {
      finishReason,
      blockReason,
      rawTextLength: rawText.length,
      rawPreview: rawText.slice(0, 300),
      rawTail: rawText.length > 300 ? rawText.slice(-200) : '',
      outputTokens,
      inputTokens,
      totalTokens,
      thoughtsTokens,
      parseError: parseError?.message ?? null,
    },
  }
}

// Lưu kết quả diagnostic vào biến module (chỉ in ra console ở môi trường dev)
function setLastDiagnostic(payload) {
  lastDiagnostic = payload
  if (import.meta.env.DEV) {
    console.group('[Gemini Diagnostic]')
    console.log(payload)
    console.groupEnd()
  }
}

// ─── Parse JSON từ text thô của Gemini ───────────────────────────────────────
// Gemini đôi khi trả về JSON bọc trong ```json ... ``` hoặc có text thừa xung quanh
// Hàm này thử nhiều cách để trích xuất JSON hợp lệ
export function parseGeminiJsonPayload(rawText) {
  if (typeof rawText !== 'string') {
    throw new GeminiServiceError('Phản hồi Gemini không phải chuỗi JSON hợp lệ', 'PARSE_ERROR')
  }

  let cleaned = rawText.trim()
  if (!cleaned) {
    throw new GeminiServiceError('Gemini trả về nội dung rỗng', 'EMPTY_RESPONSE')
  }

  // Bước 1: Xóa markdown code fence (```json ... ```)
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim()

  // Bước 2: Tìm đoạn JSON đầu tiên trong text (từ { đến })
  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')
  const candidate = firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned

  const tryParse = (value) => {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  // Bước 3: Parse trực tiếp
  const direct = tryParse(candidate)
  if (direct) return direct

  // Bước 4: Xóa trailing comma rồi thử lại (lỗi phổ biến của Gemini)
  const normalized = candidate.replace(/,\s*([}\]])/g, '$1')
  const repaired = (() => {
    let result = normalized
    // Tự động đóng ngoặc { } và [ ] nếu bị cắt giữa chừng
    while ((result.match(/\{/g) || []).length > (result.match(/\}/g) || []).length) {
      result += '}'
    }
    while ((result.match(/\[/g) || []).length > (result.match(/\]/g) || []).length) {
      result += ']'
    }
    return result
  })()

  const recovered = tryParse(repaired)
  if (recovered) return recovered

  // Bước 5: Duyệt từng ký tự để tìm đoạn JSON cân bằng ngoặc
  let start = cleaned.indexOf('{')
  if (start === -1) {
    throw new GeminiServiceError('Không thể phân tích phản hồi Gemini', 'PARSE_ERROR')
  }

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < cleaned.length; i += 1) {
    const ch = cleaned[i]

    if (inString) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === '"') {
        inString = false
      }
      continue
    }

    if (ch === '"') {
      inString = true
    } else if (ch === '{') {
      depth += 1
    } else if (ch === '}') {
      depth -= 1
      if (depth === 0) {
        const balanced = cleaned.slice(start, i + 1)
        const parsedBalanced = tryParse(balanced)
        if (parsedBalanced) return parsedBalanced
      }
    }
  }

  throw new GeminiServiceError('Không thể phân tích phản hồi Gemini', 'PARSE_ERROR')
}

// ─── Đọc body lỗi từ HTTP response của Gemini ────────────────────────────────
async function readApiErrorBody(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

// ─── Hàm gọi Gemini API (Có Auto-Fallback chuyển Model khi gặp lỗi/Quota) ────
async function callGeminiApi(prompt, generationConfig = {}) {
  // Kiểm tra API key trước khi gọi
  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError('VITE_GEMINI_API_KEY không được cấu hình', 'NO_API_KEY')
  }

  let lastError = null

  for (const model of GEMINI_MODELS_FALLBACK) {
    try {
      if (import.meta.env.DEV) {
        console.log(`[Gemini API] Đang thử gọi model: ${model}...`)
      }

      const response = await fetch(`${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topK: 20,
            topP: 0.8,
            responseMimeType: 'application/json',
            ...generationConfig,
          },
        }),
      })

      if (response.status === 429 || response.status === 404 || response.status === 503) {
        console.warn(`[Gemini Fallback] Model ${model} gặp sự cố (HTTP ${response.status}). Đang tự động chuyển model tiếp theo...`)
        lastError = new GeminiServiceError(`Model ${model} bị vướng rate limit hoặc quá tải`, 'RATE_LIMIT', {
          httpStatus: response.status,
        })
        continue
      }

      if (!response.ok) {
        const apiErrorBody = await readApiErrorBody(response)
        console.warn(`[Gemini Fallback] Model ${model} trả về lỗi:`, apiErrorBody?.error?.message)
        lastError = new GeminiServiceError(
          apiErrorBody?.error?.message || `Gemini API HTTP ${response.status}`,
          apiErrorBody?.error?.code || 'API_ERROR',
          { httpStatus: response.status, apiError: apiErrorBody },
        )
        continue
      }

      const data = await response.json()
      if (import.meta.env.DEV) {
        console.log(`[Gemini API Success] Gọi thành công qua Model: ${model}`)
      }
      return extractGeminiCandidate(data)
    } catch (err) {
      console.warn(`[Gemini Fallback] Lỗi kết nối tới model ${model}:`, err.message)
      lastError = err
    }
  }

  throw new GeminiServiceError(
    'Tất cả các Model Gemini trong danh sách dự phòng đều bị quá tải hoặc vướng hạn mức. Vui lòng thử lại sau ít phút.',
    'ALL_MODELS_EXHAUSTED',
    { lastError },
  )
}

// ─── Xử lý candidate từ Gemini và parse JSON ─────────────────────────────────
// Kiểm tra các trường hợp lỗi: bị chặn, rỗng, bị cắt, JSON lỗi
function handleGeminiCandidate(candidateMeta, label) {
  const { rawText, finishReason, usage, blockReason } = candidateMeta

  if (blockReason) {
    // Prompt vi phạm chính sách nội dung của Google
    const diagnosis = diagnoseGeminiFailure({ rawText, finishReason, usage, blockReason })
    setLastDiagnostic({ label, ok: false, ...diagnosis })
    throw new GeminiServiceError(diagnosis.summary, 'SAFETY_BLOCK', diagnosis)
  }

  if (!rawText) {
    // Không có nội dung nào được trả về
    const diagnosis = diagnoseGeminiFailure({ rawText, finishReason, usage, blockReason })
    setLastDiagnostic({ label, ok: false, ...diagnosis })
    throw new GeminiServiceError('Gemini không trả về nội dung', 'EMPTY_RESPONSE', diagnosis)
  }

  if (finishReason === 'MAX_TOKENS') {
    // Bị cắt giữa chừng → JSON chắc chắn không hợp lệ
    const diagnosis = diagnoseGeminiFailure({ rawText, finishReason, usage, blockReason })
    setLastDiagnostic({ label, ok: false, ...diagnosis })
    throw new GeminiServiceError(
      'Phản hồi bị cắt do giới hạn token — JSON không đủ để parse',
      'TRUNCATED_RESPONSE',
      diagnosis,
    )
  }

  try {
    const parsed = parseGeminiJsonPayload(rawText)
    // Ghi lại kết quả thành công để debug nếu cần
    setLastDiagnostic({
      label,
      ok: true,
      summary: 'Parse JSON thành công',
      likelyCause: null,
      meta: {
        finishReason,
        rawTextLength: rawText.length,
        outputTokens: usage?.candidatesTokenCount ?? null,
        thoughtsTokens: usage?.thoughtsTokenCount ?? null,
      },
    })
    return parsed
  } catch (parseError) {
    const diagnosis = diagnoseGeminiFailure({ rawText, finishReason, usage, blockReason, parseError })
    setLastDiagnostic({ label, ok: false, ...diagnosis })
    throw new GeminiServiceError(diagnosis.summary, 'PARSE_ERROR', diagnosis)
  }
}

// ─── Sinh bài đọc tiếng Anh + 3 câu hỏi trắc nghiệm ────────────────────────
// Gọi Gemini với prompt cố định, trả về { title, text, questions }
export async function generateReading({ topic, level, questionCount = 3 }) {
  const safeQuestionCount = Math.min(Math.max(Number(questionCount) || 3, 1), 5)
  const englishTopic = String(topic || '').trim() || 'General English'
  const prompt = `You are an expert English teacher.
The source topic may be in English or Vietnamese. First interpret the topic correctly, normalize it to English internally, and then generate the final exercise in English.

Topic: ${englishTopic}
CEFR Level: ${level}

Requirements:
- Reading length: 120-180 words only
- Exactly ${safeQuestionCount} questions
- Each question has 4 options A/B/C/D
- One correct answer per question
- Keep the exercise content fully in English, but keep explanations short in Vietnamese

Output ONLY valid JSON with this shape:
{
  "title": "Short reading title",
  "text": "Short reading passage here",
  "questions": [
    {
      "id": 1,
      "questionText": "Question 1?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanationVi": "Giải thích ngắn"
    }
  ]
}`

  try {
    const candidateMeta = await callGeminiApi(prompt, {
      temperature: 0.4,
      maxOutputTokens: 4096,
    })
    const parsed = handleGeminiCandidate(candidateMeta, 'generateReading')

    return {
      title: parsed.title || 'Reading Passage',
      text: parsed.text || '',
      questions: (parsed.questions || []).slice(0, safeQuestionCount),
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    throw new GeminiServiceError(`Lỗi gọi Gemini API: ${error.message}`, 'NETWORK_ERROR')
  }
}

// ─── Sinh câu hỏi điền khuyết theo dạng TOEIC/Part 5/Part 6 ───────────────
// Dạng hỗ trợ: cloze_sentence, cloze_paragraph, toeic_part_5, toeic_part_6
export async function generateCloze({ topic, level, type = 'cloze_sentence', questionCount = 3 }) {
  const isToeicPart5 = type === 'toeic_part_5'
  const isToeicPart6 = type === 'toeic_part_6'
  const safeQuestionCount = isToeicPart5 || isToeicPart6
    ? Math.min(Math.max(Number(questionCount) || 30, 1), 30)
    : Math.min(Math.max(Number(questionCount) || 3, 1), 5)
  const variant = ['cloze_sentence', 'toeic_part_5'].includes(type) ? 'sentence' : 'paragraph'
  const englishTopic = String(topic || '').trim() || 'General English'

  const prompt = isToeicPart5
    ? `You are an expert TOEIC English test writer.

Create a TOEIC Part 5 Incomplete Sentences exercise.

Requirements:
- Generate exactly ${safeQuestionCount} questions.
- For TOEIC Part 5, each question must be ONE independent sentence.
- Each sentence must contain exactly ONE blank represented by "_____".
- Each question must have exactly 4 answer choices.
- Choices must be labeled A, B, C, and D through their position in the JSON array.
- There must be exactly ONE correct answer.
- Questions must be grammatically and semantically natural.
- Questions must resemble real TOEIC Part 5 style.
- Do not repeat the same sentence pattern.
- Avoid duplicate questions.
- Distribute questions across different grammar and vocabulary categories.
- Keep the question and answer choices in English.
- Keep the explanation short and in Vietnamese.

Topic: "${englishTopic}"
Level: ${level}

Output ONLY valid JSON with this shape:
{
  "title": "TOEIC Part 5 - Topic",
  "questions": [
    {
      "id": 1,
      "questionText": "The manager _____ the report yesterday.",
      "options": ["submits", "submitted", "submit", "submitting"],
      "correctAnswer": "B",
      "explanationVi": "Dùng thì quá khứ đơn vì có 'yesterday'."
    }
  ]
}

Important rules:
- Each question is a standalone sentence, not a paragraph.
- Each question has exactly one blank represented by "_____".
- The correct answer must be one of "A", "B", "C", or "D" based on the order in options.
- Avoid repeating the same vocabulary or grammar pattern.
- Cover a wide range of TOEIC grammar and vocabulary areas such as vocabulary, word form, verb tense, subject-verb agreement, prepositions, conjunctions, pronouns, adjective/adverb usage, gerunds/infinitives, passive voice, comparatives/superlatives, relative clauses, articles, modal verbs, conditional structures, and other common TOEIC grammar points.
- Do not include markdown or extra commentary.`
    : isToeicPart6
      ? `You are an expert TOEIC Part 6 test writer.

Create a TOEIC Part 6 Text Completion exercise.

Requirements:
- Generate exactly ${safeQuestionCount} questions.
- This is a passage-based cloze exercise.
- Create a short reading passage in the "text" field with several sentences and blanks represented by "_____".
- Each missing word in the passage must be numbered so the reader can tell which question belongs to which blank.
- Use the numbered blank format in the passage: "[131] _____", "[132] _____", etc.
- The number in the passage must match the question number in the question array.
- The passage must be a real TOEIC-style paragraph and must contain full sentence context.
- The JSON must contain a separate array of questions. Each question is just a numbered item, not the full sentence again.
- Each question must use "questionText" as only the number with a trailing period, for example: "131." or "132.".
- The real sentence content belongs only in the "text" field of the paragraph.
- Each question must have exactly 4 answer choices labeled A, B, C, and D.
- There must be exactly ONE correct answer.
- Keep the passage natural and suitable for business/academic TOEIC context.
- Do not repeat the same sentence pattern or produce duplicate items.
- Spread the grammar focus across common TOEIC Part 6 areas such as vocabulary, collocations, grammar, word forms, prepositions, conjunctions, articles, pronouns, verb tense, and sentence logic.
- Keep the passage and answer choices in English.
- Keep the explanation short and in Vietnamese.

Topic: "${englishTopic}"
Level: ${level}

Output ONLY valid JSON with this shape:
{
  "title": "TOEIC Part 6 - Topic",
  "text": "Employees often suffer from chronic sleep deprivation and therefore experience a significant decline in their overall performance. The company [131] _____ a new training program to address this issue. Many employees [132] _____ that the policy improves morale and productivity.",
  "questions": [
    {
      "id": 1,
      "questionText": "131.",
      "options": ["launches", "launched", "launching", "launch"],
      "correctAnswer": "A",
      "explanationVi": "Dùng thì hiện tại đơn vì chủ ngữ 'The company' là số ít."
    },
    {
      "id": 2,
      "questionText": "132.",
      "options": ["report", "reports", "reported", "reporting"],
      "correctAnswer": "C",
      "explanationVi": "Dùng thì quá khứ đơn vì hành động đã xảy ra trong quá khứ."
    }
  ]
}

Important rules:
- "text" is the passage with numbered blanks.
- Each blank in the passage must carry a matching question number like [131], [132].
- "questionText" must be only the number and period, like "131.".
- The actual sentence itself should not be repeated inside questionText.
- Do not include markdown or extra commentary.`
      : `You are an expert TOEIC English teacher.
The source topic may be in English or Vietnamese. Convert the topic to English internally and generate the exercise in English while preserving the same meaning.

Topic: "${englishTopic}"
Level: ${level}
Type: ${type}
Requirements:
- Exactly ${safeQuestionCount} items
- Each item must have exactly 1 blank only
- Each item has 4 options A/B/C/D
- One correct answer only
- Keep the exercise text fully in English
- Keep explanation short in Vietnamese
- Keep sentences natural and suitable for TOEIC
- Use a blank shown as "_____" in the sentence or paragraph

Output ONLY valid JSON with this shape:
{
  "title": "Short cloze title",
  "questions": [
    {
      "id": 1,
      "questionText": "The manager _____ the report yesterday.",
      "options": ["submits", "submitted", "submit", "submitting"],
      "correctAnswer": "B",
      "explanationVi": "Dùng thì quá khứ đơn vì có 'yesterday'."
    }
  ]
}

Important rules:
- If type is cloze_sentence or toeic_part_5, each item is a single sentence with 1 blank.
- If type is cloze_paragraph or toeic_part_6, create one short paragraph with 3 blanks across the paragraph, and still output 3 items in array.
- Do not include markdown or extra commentary.`

  try {
    const candidateMeta = await callGeminiApi(prompt, {
      temperature: 0.35,
      maxOutputTokens: isToeicPart5 || isToeicPart6 ? 8192 : 4096,
    })
    const parsed = handleGeminiCandidate(candidateMeta, `generateCloze_${type}`)

    const questions = (parsed.questions || []).slice(0, safeQuestionCount).map((q, idx) => {
      const rawQuestionText = q.questionText || q.text || `Question ${idx + 1}`
      const normalizedQuestionText = isToeicPart6
        ? String(rawQuestionText).replace(/^\s*(\d+)\.?\s*.*$/, '$1.')
        : rawQuestionText

      return {
        id: q.id ?? idx + 1,
        questionText: normalizedQuestionText,
        options: q.options || ['A', 'B', 'C', 'D'],
        correctAnswer: q.correctAnswer || 'A',
        explanationVi: q.explanationVi || 'Explanation not provided',
      }
    })

    const numberedText = isToeicPart6 && typeof parsed.text === 'string' && parsed.text.trim()
      ? questions.reduce((acc, question, index) => {
          const number = question.id ?? index + 1
          const marker = `[${number}]`
          if (acc.includes(marker)) return acc
          return acc.replace(/_____/, ` ${marker} _____`)
        }, parsed.text)
      : (isToeicPart6 ? 'Cloze paragraph exercise' : (variant === 'paragraph' ? 'Cloze paragraph exercise' : 'Cloze sentence exercise'))

    return {
      title: parsed.title || `${type === 'cloze_paragraph' || type === 'toeic_part_6' ? 'Cloze Paragraph' : 'Cloze Sentence'} - ${topic}`,
      text: numberedText,
      questions,
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    throw new GeminiServiceError(`Lỗi gọi Gemini API: ${error.message}`, 'NETWORK_ERROR')
  }
}

// ─── Sinh câu hỏi trắc nghiệm tiếng Anh ───────────────────────────────────
// Trả về { questions } — không có bài đọc kèm theo
export async function generateQuiz({ topic, level, questionCount = 3 }) {
  const safeQuestionCount = Math.min(Math.max(Number(questionCount) || 3, 1), 5)
  const englishTopic = String(topic || '').trim() || 'General English'
  const prompt = `You are an expert English teacher.
The source topic may be in English or Vietnamese. Interpret it accurately, normalize it to English, and then generate the quiz in English.

Topic: ${englishTopic}
CEFR Level: ${level}

Requirements:
- Exactly ${safeQuestionCount} questions
- Each question has 4 options A/B/C/D
- One correct answer only
- Keep the question text in English
- Keep each explanation very short in Vietnamese

Output ONLY valid JSON:
{
  "questions": [
    {"id": 1, "questionText": "Question 1?", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "explanationVi": "Giải thích ngắn"}
  ]
}`

  try {
    const candidateMeta = await callGeminiApi(prompt, {
      temperature: 0.3,
      maxOutputTokens: 4096,
    })
    const parsed = handleGeminiCandidate(candidateMeta, 'generateQuiz')

    return {
      questions: (parsed.questions || []).slice(0, safeQuestionCount),
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    throw new GeminiServiceError(`Lỗi gọi Gemini API: ${error.message}`, 'NETWORK_ERROR')
  }
}
