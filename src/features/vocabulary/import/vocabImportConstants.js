/**
 * vocabImportConstants.js
 * Hằng số dùng trong luồng Import Từ Vựng.
 * Không chứa logic, không import React.
 */

export const TYPE_CONFIG = {
  vocabulary: {
    title: 'Import Từ Vựng Từ File JSON / PDF',
    subtitle: 'Hỗ trợ nạp nhanh từ mảng JSON chuẩn hoặc trích xuất tự động từ file PDF',
    label: 'Từ vựng',
  },
  grammar: {
    title: 'Import Bài Học Ngữ Pháp Từ File PDF',
    subtitle: 'Trích xuất tự động cấu trúc ngữ pháp, công thức, quy tắc & ví dụ minh họa',
    label: 'Ngữ pháp',
  },
  reading: {
    title: 'Import Bài Đọc Hiểu Từ File PDF',
    subtitle: 'Trích xuất tự động bài đọc hiểu và danh sách câu hỏi trắc nghiệm đính kèm',
    label: 'Bài đọc hiểu',
  },
  quiz: {
    title: 'Import Câu Hỏi Trắc Nghiệm Từ File PDF',
    subtitle: 'Trích xuất tự động ngân hàng câu hỏi, lựa chọn đáp án A/B/C/D & giải thích',
    label: 'Bài kiểm tra',
  },
}

export const SAMPLE_AI_JSON = `[
  {
    "word": "algorithm",
    "pronunciation": "/ˈæl.ɡə.rɪ.ðəm/",
    "partOfSpeech": "Noun",
    "cefrLevel": "B2",
    "vietnameseMeaning": "Thuật toán",
    "englishMeaning": "A process or set of rules to be followed in calculations or problem-solving operations.",
    "topic": "Công nghệ & AI",
    "exampleEn": "The search engine uses a complex algorithm to rank web pages.",
    "exampleVi": "Công cụ tìm kiếm sử dụng một thuật toán phức tạp để xếp hạng các trang web."
  },
  {
    "word": "resilience",
    "pronunciation": "/rɪˈzɪl.jəns/",
    "partOfSpeech": "Noun",
    "cefrLevel": "C1",
    "vietnameseMeaning": "Sự kiên cường, khả năng phục hồi",
    "englishMeaning": "The capacity to recover quickly from difficulties; toughness.",
    "topic": "Đời sống & Giao tiếp",
    "exampleEn": "Courage and resilience are essential for overcoming hardship.",
    "exampleVi": "Sự dũng cảm và kiên cường là điều cần thiết để vượt qua khó khăn."
  }
]`
