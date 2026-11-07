/**
 * vocabImportConstants.js
 * Hằng số dùng trong luồng Import Từ Vựng.
 * Không chứa logic, không import React.
 */

export const TYPE_CONFIG = {
  vocabulary: {
    title: 'Import từ vựng',
    subtitle: 'Hỗ trợ tệp định dạng .JSON hoặc .PDF',
    label: 'Từ vựng',
  },
  grammar: {
    title: 'Import bài học ngữ pháp',
    subtitle: 'Hỗ trợ tệp định dạng .PDF hoặc .JSON',
    label: 'Ngữ pháp',
  },
  reading: {
    title: 'Import bài đọc hiểu',
    subtitle: 'Hỗ trợ tệp định dạng .PDF hoặc .JSON',
    label: 'Bài đọc hiểu',
  },
  quiz: {
    title: 'Import câu hỏi trắc nghiệm',
    subtitle: 'Hỗ trợ tệp định dạng .PDF hoặc .JSON',
    label: 'Bài kiểm tra',
  },
}

export const REAL_SAMPLE_FILES = [
  {
    id: 'sample-vocab-audio',
    name: 'vocabulary_audio_sample.json',
    type: 'vocabulary',
    typeLabel: 'Tệp mẫu JSON',
    size: '5.0 KB',
    itemCount: 10,
    sampleTitle: 'Từ vựng tiếng Anh kèm phiên âm IPA',
    url: '/samples/vocabulary_audio_sample.json',
  },
  {
    id: 'sample-vocab-pdf',
    name: 'English_Vocabulary_With_Audio.pdf',
    type: 'vocabulary',
    typeLabel: 'Tệp mẫu PDF',
    size: '12.2 KB',
    itemCount: 15,
    sampleTitle: 'Tài liệu từ vựng tiếng Anh',
    url: '/samples/English_Vocabulary_With_Audio.pdf',
  },
]

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
    "exampleVi": "Công cụ tìm kiếm sử dụng một thuật toán phức tạp để xếp hạng các trang web.",
    "audioUrl": "https://api.dictionaryapi.dev/media/pronunciations/en/algorithm-us.mp3"
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
    "exampleVi": "Sự dũng cảm và kiên cường là điều cần thiết để vượt qua khó khăn.",
    "audioUrl": "https://api.dictionaryapi.dev/media/pronunciations/en/resilience-us.mp3"
  }
]`
