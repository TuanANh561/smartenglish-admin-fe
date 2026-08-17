/**
 * Dịch vụ Gemini AI — sinh nội dung học tiếng Anh
 * Bao gồm: gọi API, xử lý prompt, parse JSON phản hồi, xử lý lỗi
 */

// API key lấy từ biến môi trường .env (không hardcode vào source)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

// Lưu kết quả chẩn đoán lần gọi gần nhất để debug khi cần
let lastDiagnostic = null

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

// ─── Hàm gọi Gemini API (dùng chung cho reading và quiz) ─────────────────────
async function callGeminiApi(prompt, generationConfig = {}) {
  // Kiểm tra API key trước khi gọi
  if (!GEMINI_API_KEY) {
    throw new GeminiServiceError('VITE_GEMINI_API_KEY không được cấu hình', 'NO_API_KEY')
  }

  const response = await fetch(`${GEMINI_API_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        topK: 20,
        topP: 0.8,
        // Yêu cầu Gemini trả về JSON thuần túy (không bọc markdown)
        responseMimeType: 'application/json',
        ...generationConfig,
      },
    }),
  })

  // Xử lý riêng lỗi 429: vượt giới hạn tốc độ (rate limit)
  if (response.status === 429) {
    throw new GeminiServiceError(
      'Gemini đang vượt giới hạn sử dụng. Vui lòng thử lại sau.',
      'RATE_LIMIT',
      { httpStatus: 429 },
    )
  }

  // Xử lý các lỗi HTTP khác (401 sai key, 500 lỗi server...)
  if (!response.ok) {
    const apiErrorBody = await readApiErrorBody(response)
    throw new GeminiServiceError(
      apiErrorBody?.error?.message || `Gemini API HTTP ${response.status}`,
      apiErrorBody?.error?.code || 'API_ERROR',
      { httpStatus: response.status, apiError: apiErrorBody },
    )
  }

  const data = await response.json()
  return extractGeminiCandidate(data)
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
export async function generateReading({ topic, level }) {
  const prompt = `You are an expert English teacher. Generate a very short reading passage and exactly 3 multiple-choice questions.

Topic: ${topic}
CEFR Level: ${level}

Requirements:
- Reading length: 120-180 words only
- Exactly 3 questions
- Each question has 4 options A/B/C/D
- One correct answer per question
- Keep explanation short in Vietnamese

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
      // Tắt "thinking" để tiết kiệm token và tăng tốc độ phản hồi
      thinkingConfig: { thinkingBudget: 0 },
    })
    const parsed = handleGeminiCandidate(candidateMeta, 'generateReading')

    return {
      title: parsed.title || 'Reading Passage',
      text: parsed.text || '',
      questions: (parsed.questions || []).slice(0, 3), // Giới hạn tối đa 3 câu
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    throw new GeminiServiceError(`Lỗi gọi Gemini API: ${error.message}`, 'NETWORK_ERROR')
  }
}

// ─── Sinh 3 câu hỏi trắc nghiệm tiếng Anh ───────────────────────────────────
// Trả về { questions } — không có bài đọc kèm theo
export async function generateQuiz({ topic, level }) {
  const prompt = `You are an expert English teacher. Generate exactly 3 multiple-choice quiz questions.

Topic: ${topic}
CEFR Level: ${level}

Requirements:
- Exactly 3 questions
- Each question has 4 options A/B/C/D
- One correct answer only
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
      thinkingConfig: { thinkingBudget: 0 },
    })
    const parsed = handleGeminiCandidate(candidateMeta, 'generateQuiz')

    return {
      questions: (parsed.questions || []).slice(0, 3),
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) throw error
    throw new GeminiServiceError(`Lỗi gọi Gemini API: ${error.message}`, 'NETWORK_ERROR')
  }
}
