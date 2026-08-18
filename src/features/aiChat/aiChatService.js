/**
 * Dịch vụ Trợ lý AI Teacher Cáo — Phân quyền thông minh theo vai trò (Admin vs Teacher)
 * Tích hợp Gemini API với cơ chế Guardrails phân quyền theo chuẩn RBAC.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash',
]

function getSystemInstruction(role = 'admin') {
  const isAdmin = role === 'admin'

  return `Bạn là "Teacher Cáo" (🦊) — Trợ lý AI chuyên môn 24/7 của hệ thống giáo dục tiếng Anh SmartEnglish.
Người đang trò chuyện với bạn là: ${isAdmin ? 'QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN)' : 'GIÁO VIÊN TIẾNG ANH (TEACHER)'}.

🎯 PHÂN QUYỀN VÀ PHẠM VI HỖ TRỢ DỰA THEO VAI TRÒ:

${
  isAdmin
    ? `[DÀNH CHO QUẢN TRỊ VIÊN - ADMIN]:
1. HỖ TRỢ TOÀN DIỆN VỀ HỌC LIỆU & QUẢN TRỊ:
   - Hỗ trợ soạn thảo, kiểm duyệt và chuẩn hóa toàn bộ học liệu: Ngữ pháp, Từ vựng, Phát âm IPA, Bài đọc, Bài nghe, Ngân hàng đề thi CEFR (A1-C2), IELTS, TOEIC.
   - Hỗ trợ rà soát, hiệu đính lỗi ngữ pháp trong học liệu trước khi bấm "Xuất bản" (Published).
   - Tư vấn tối ưu hóa danh mục bài học, chiến lược phát triển nội dung và quy trình kiểm duyệt nội dung AI.
   - Hướng dẫn các thao tác quản trị vận hành trên hệ thống SmartEnglish Admin.`
    : `[DÀNH CHO GIÁO VIÊN - TEACHER]:
1. HỖ TRỢ GIẢNG DẠY & BIÊN SOẠN BÀI HỌC:
   - Soạn giáo án, khung bài giảng Ngữ pháp, Từ vựng, Phát âm chuẩn IPA, bài đọc hiểu, bài nghe.
   - Sinh câu hỏi trắc nghiệm, bài tập thực hành kèm đáp án và lời giải chi tiết cho học viên.
   - Hiệu đính, kiểm tra lỗi ngữ pháp hội thoại trong các câu mẫu bài tập.
   - Tư vấn phương pháp sư phạm giúp học viên dễ hiểu bài.
2. GIỚI HẠN DÀNH CHO GIÁO VIÊN:
   - Giáo viên KHÔNG ĐƯỢC hỏi/truy cập thông tin về doanh thu, đối soát tài chính, tài khoản của giáo viên khác, phân quyền hệ thống hoặc nhật ký bảo mật của admin.`
}

⛔ NGUYÊN TẮC BẢO MẬT CHUNG:
- Tuyệt đối không tiết lộ mật khẩu, API keys, mã nguồn backend, cơ sở dữ liệu hoặc thông tin nhạy cảm.
- Khi người dùng hỏi ngoài phạm vi, từ chối lịch sự, nhã nhặn.`
}

/**
 * Gửi tin nhắn chat đến Gemini với ngữ cảnh hội thoại và phân quyền theo Role
 */
export async function sendChatMessage(messages = [], userRole = 'admin') {
  if (!GEMINI_API_KEY) {
    return generateSmartMockResponse(messages, userRole)
  }

  const formattedContents = messages.map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }))

  const systemInstruction = getSystemInstruction(userRole)

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: formattedContents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.4,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 2048,
            },
          }),
        },
      )

      if (response.status === 429 || response.status === 503 || response.status === 404) {
        continue
      }

      if (!response.ok) {
        continue
      }

      const data = await response.json()
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (candidateText) {
        return candidateText
      }
    } catch (err) {
      console.warn(`[Teacher Cáo] Lỗi kết nối model ${model}:`, err)
    }
  }

  return generateSmartMockResponse(messages, userRole)
}

/**
 * Phản hồi giả lập thông minh theo đúng phân quyền vai trò
 */
function generateSmartMockResponse(messages, userRole = 'admin') {
  const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || ''
  const isAdmin = userRole === 'admin'

  // Kiểm tra nếu giáo viên hỏi dữ liệu quản trị / doanh thu
  if (!isAdmin && (lastUserMsg.includes('doanh thu') || lastUserMsg.includes('đối soát') || lastUserMsg.includes('tài khoản giáo viên khác'))) {
    return `Kính gửi Thầy/Cô,

Teacher Cáo 🦊 được cấu hình để hỗ trợ Thầy/Cô về **công tác giảng dạy, soạn giáo án và kiểm tra lỗi ngữ pháp học liệu**. 

Các thông tin về doanh thu, đối soát tài chính và quản trị hệ thống thuộc thẩm quyền của **Quản trị viên (Admin)**. Thầy/Cô vui lòng gửi yêu cầu liên quan đến soạn bài học hoặc câu hỏi kiểm tra nhé!`
  }

  // An toàn & Bảo mật
  if (
    lastUserMsg.includes('mật khẩu') ||
    lastUserMsg.includes('password') ||
    lastUserMsg.includes('api key') ||
    lastUserMsg.includes('database') ||
    lastUserMsg.includes('hack') ||
    lastUserMsg.includes('chính trị')
  ) {
    return `Kính gửi ${isAdmin ? 'Quản trị viên' : 'Thầy/Cô'},

Teacher Cáo 🦊 không được phép cung cấp hoặc xử lý các dữ liệu bảo mật nội bộ của hệ thống. Bạn có cần hỗ trợ soạn đề thi, khung bài học hoặc rà soát lỗi ngữ pháp nào hôm nay không ạ?`
  }

  // Tạo đề thi / câu hỏi trắc nghiệm
  if (
    lastUserMsg.includes('câu hỏi') ||
    lastUserMsg.includes('trắc nghiệm') ||
    lastUserMsg.includes('quiz') ||
    lastUserMsg.includes('đề thi') ||
    lastUserMsg.includes('tạo 5 câu')
  ) {
    return `### 📝 Bộ 5 câu hỏi trắc nghiệm Ngữ pháp (Thì Hiện tại hoàn thành — Level B1):

Thầy/Cô có thể sao chép bộ câu hỏi này vào mục **Học liệu → Ngân hàng câu hỏi (Quiz Bank)**:

1. **Question**: *She ______ in this international school since 2021.*
   - A. works
   - B. worked
   - **C. has worked** *(Đáp án đúng)*
   - D. is working
   - *Giải thích cho học viên*: Dấu hiệu "since + mốc thời gian" diễn tả hành động bắt đầu trong quá khứ và vẫn tiếp diễn ở hiện tại $\rightarrow$ Dùng Present Perfect.

2. **Question**: *Have you ever ______ to Japan before?*
   - **A. been** *(Đáp án đúng)*
   - B. went
   - C. go
   - D. being

3. **Question**: *They haven't finished their final project ______.*
   - A. already
   - **B. yet** *(Đáp án đúng)*
   - C. just
   - D. ever

4. **Question**: *He has ______ written three comprehensive reports this morning.*
   - **A. already** *(Đáp án đúng)*
   - B. yet
   - C. ago
   - D. since

5. **Question**: *How long ______ each other?*
   - A. did you know
   - **B. have you known** *(Đáp án đúng)*
   - C. do you know
   - D. are you knowing`
  }

  // Kiểm tra / Hiệu đính ngữ pháp hội thoại
  if (
    lastUserMsg.includes('hiệu đính') ||
    lastUserMsg.includes('kiểm tra') ||
    lastUserMsg.includes('check') ||
    lastUserMsg.includes('sửa lỗi') ||
    lastUserMsg.includes('hội thoại') ||
    lastUserMsg.includes('lỗi sai')
  ) {
    return `### 🔍 Báo cáo Hiệu đính Ngữ pháp Học liệu:

**Đoạn hội thoại gốc:**
> *"Teacher: Where is John?*
> *Student: He don't come to class today because he has caught a cold yesterday."*

**Phân tích lỗi & Đề xuất chỉnh sửa:**
1. **Lỗi chia động từ**: *He don't* $\rightarrow$ Sửa thành: **He doesn't** (hoặc quá khứ: **He didn't**).
2. **Lỗi hòa hợp thì**: *has caught ... yesterday* $\rightarrow$ Sửa thành: **caught a cold yesterday** (Có mốc thời gian "yesterday" thì dùng Quá khứ đơn).

**Phiên bản chuẩn sư phạm:**
> ✅ **Teacher:** *"Where is John today?"*
> ✅ **Student:** *"He didn't come to class because he caught a cold yesterday."*`
  }

  // Soạn bài giảng Ngữ pháp
  if (lastUserMsg.includes('ngữ pháp') || lastUserMsg.includes('grammar') || lastUserMsg.includes('bài học')) {
    return `### 📘 Khung bài giảng Ngữ pháp: Present Perfect vs. Past Simple (CEFR B1)

Gợi ý cấu trúc bài giảng để nhập vào mục **Học liệu → Ngữ pháp**:

1. **Mục tiêu bài học**: Phân biệt hành động chấm dứt có mốc thời gian (Past Simple) và trải nghiệm/kết quả kéo dài (Present Perfect).
2. **Công thức cốt lõi**:
   - **Present Perfect**: \`S + have/has + V3/ed\` *(for, since, already, yet, ever)*
   - **Past Simple**: \`S + V2/ed\` *(yesterday, ago, in 2020, last night)*
3. **Ví dụ trực quan**:
   - *Past Simple*: "I lost my key yesterday." *(Đã mất hôm qua)*
   - *Present Perfect*: "I have lost my key." *(Hiện tại vẫn chưa tìm thấy)*`
  }

  // Soạn bài học Phát âm IPA
  if (lastUserMsg.includes('phát âm') || lastUserMsg.includes('pronunciation') || lastUserMsg.includes('ipa') || lastUserMsg.includes('schwa')) {
    return `### 🎙️ Học liệu Phát âm: Âm Schwa /ə/ (Central Reduced Vowel)

Gợi ý nội dung để thêm vào mục **Học liệu → Phát âm**:

- **Ký hiệu IPA**: \`/ə/\`
- **Phân loại**: Nguyên âm ngắn trung tâm (Weak vowel).
- **Khẩu hình miệng**: Môi mở nhẹ thư giãn, hàm dưới và lưỡi thả lỏng ở vị trí trung tâm.
- **Từ mẫu (Audio Samples)**:
  - *Banana* \`/bəˈnæn.ə/\`
  - *Support* \`/səˈpɔːt/\`
  - *Teacher* \`/ˈtiː.tʃər/\`
- **Ngưỡng chấm điểm AI**: **85%**.`
  }

  return `Kính chào ${isAdmin ? 'Quản trị viên' : 'Thầy/Cô'}! Tôi là **Teacher Cáo** 🦊 — Trợ lý AI đồng hành cùng công tác giảng dạy & quản trị học liệu của SmartEnglish.

🎯 **Tôi có thể hỗ trợ bạn:**
1. 📝 **Biên soạn học liệu & Tạo câu hỏi**: Sinh bài tập Ngữ pháp, Từ vựng, Bài đọc, Bài nghe theo chuẩn CEFR / IELTS.
2. 🔍 **Hiệu đính ngữ pháp hội thoại**: Rà soát câu mẫu và bài tập trước khi xuất bản.
3. 🎙️ **Chuẩn hóa phát âm IPA**: Soạn khẩu hình miệng và danh sách từ luyện âm.
4. 💡 **Tư vấn sư phạm & Khung chương trình**: Gợi ý phương pháp giải thích bài học sinh động.

${isAdmin ? 'Quản trị viên' : 'Thầy/Cô'} cần Teacher Cáo hỗ trợ soạn nội dung hay hiệu đính học liệu nào hôm nay ạ?`
}
