import { createColumnHelper } from '@tanstack/react-table'
import Badge from '@/components/ui/Badge'

const PART_OF_SPEECH_LABEL = {
  Noun: 'Danh từ',
  Verb: 'Động từ',
  Adjective: 'Tính từ',
  Adverb: 'Trạng từ',
  Pronoun: 'Đại từ',
  Preposition: 'Giới từ',
}

const CEFR_TONE = {
  A1: 'info',
  A2: 'success',
  B1: 'warning',
  B2: 'warning',
  C1: 'danger',
  C2: 'danger',
}

const columnHelper = createColumnHelper()

const COMMON_WORD_MAP = {
  baby: 'Em bé, trẻ sơ sinh',
  'arena of valor': 'Liên Quân Mobile',
  calculator: 'Máy tính cầm tay',
  calc: 'Tính toán',
  fan: 'Cái quạt',
  bag: 'Túi xách, túi',
  balo: 'Balo',
  ox: 'Bò đực',
  shoulder: 'Bờ vai',
  forget: 'Quên',
  forgot: 'Đã quên',
  locate: 'Xác định vị trí',
  procrastinate: 'Trì hoãn, chần chừ',
  compact: 'Thỏa thuận, hợp đồng',
  oxt: 'Nhóm nhạc OxT',
  rer: 'Tàu tốc hành RER',
  dont: 'Không làm (quy tắc DONT)',
  oxy: 'Oxy (nhóm ete)',
}

export const cleanDisplayMeaning = (val, word = '') => {
  if (!val || typeof val !== 'string') return val ?? ''
  const cleanWord = String(word).trim().toLowerCase()
  if (COMMON_WORD_MAP[cleanWord]) {
    return COMMON_WORD_MAP[cleanWord]
  }

  let text = val
  if (text.includes('%')) {
    try {
      text = decodeURIComponent(text.replace(/\+/g, '%2B'))
    } catch {
      // ignore malformed URI
    }
  }
  text = text
    .replace(/%2C/gi, ',')
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()

  // Bắt mẫu "còn được biết đến với tên tiếng Việt là..."
  const knownAsMatch = text.match(/(?:còn được biết đến với tên tiếng Việt là|tên tiếng Việt là)\s+([^.,;]+)/i)
  if (knownAsMatch && knownAsMatch[1] && knownAsMatch[1].trim().length < 40) {
    return knownAsMatch[1].trim()
  }

  // Bỏ tiền tố nhãn/từ loại trong ngoặc ở đầu như (không chính thức), (transitive), (chemistry)
  text = text.replace(/^\s*\([^)]{1,30}\)\s*/i, '')

  // Bỏ tiền tố "Để " ở đầu động từ
  text = text.replace(/^(để|de)\s+/i, '')

  // Cắt theo dấu chấm phẩy ; lấy phân đoạn nghĩa đầu tiên
  if (text.includes(';')) {
    text = text.split(';')[0].trim()
  }

  // Bỏ các chú thích giải thích trong ngoặc đơn ở giữa hoặc cuối câu
  text = text.replace(/\s*\([^)]*\)/g, '').trim()

  // Bỏ dấu chấm câu ở cuối
  text = text.replace(/[.;,]+$/, '').trim()

  // Nếu chuỗi dài gồm nhiều từ đồng nghĩa cách bởi dấu phẩy (> 2), lấy tối đa 2 từ cốt lõi
  const commaParts = text.split(',').map((s) => s.trim()).filter(Boolean)
  if (commaParts.length > 2) {
    text = commaParts.slice(0, 2).join(', ')
  }

  // Viết hoa chữ cái đầu tiên cho chuẩn giao diện
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1)
  }

  return text
}

export const vocabularyColumns = [
  columnHelper.accessor('word', {
    header: 'Từ vựng',
    enableSorting: true,
    cell: (info) => (
      <span className="font-bold text-slate-900 text-sm tracking-tight truncate block w-full" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('pronunciation', {
    header: 'Phiên âm IPA',
    enableSorting: false,
    cell: (info) => (
      <span className="font-mono text-xs text-slate-600 bg-slate-100/80 px-2 py-0.5 rounded-md border border-slate-200/60 font-medium truncate inline-block max-w-full" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('partOfSpeech', {
    header: 'Từ loại',
    enableSorting: false,
    cell: (info) => (
      <span className="whitespace-nowrap inline-block">
        <Badge tone="info">{PART_OF_SPEECH_LABEL[info.getValue()] ?? info.getValue()}</Badge>
      </span>
    ),
  }),
  columnHelper.accessor('vietnameseMeaning', {
    header: 'Nghĩa tiếng Việt',
    enableSorting: false,
    cell: (info) => {
      const fullRaw = info.getValue()
      const word = info.row?.original?.word
      const meaning = cleanDisplayMeaning(fullRaw, word)
      return (
        <span
          className="text-sm font-medium text-slate-800 truncate block w-full"
          title={fullRaw || meaning}
        >
          {meaning}
        </span>
      )
    },
  }),
  columnHelper.accessor('cefrLevel', {
    header: 'Cấp độ CEFR',
    enableSorting: false,
    cell: (info) => (
      <span className="whitespace-nowrap inline-block">
        <Badge tone={CEFR_TONE[info.getValue()] ?? 'info'}>{info.getValue()}</Badge>
      </span>
    ),
  }),
  columnHelper.accessor('topic', {
    header: 'Chủ đề',
    enableSorting: false,
    cell: (info) => (
      <span className="text-sm font-medium text-slate-700 truncate block w-full" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
]
