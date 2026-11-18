import Papa from 'papaparse'
import * as XLSX from 'xlsx'

/**
 * Đọc file đề thi (JSON, Excel, CSV) thành { exam, rows } để gửi lên backend kiểm tra.
 * Bảng tính chỉ cần mỗi dòng một câu; tên cột không phân biệt hoa thường/dấu cách và nhận cả tên tiếng Việt.
 */

const COLUMN_ALIASES = {
  questionNumber: ['questionnumber', 'number', 'no', 'stt', 'cau', 'socau'],
  part: ['part', 'phan'],
  questionText: ['questiontext', 'question', 'cauhoi', 'noidung'],
  A: ['a', 'optiona', 'dapana'],
  B: ['b', 'optionb', 'dapanb'],
  C: ['c', 'optionc', 'dapanc'],
  D: ['d', 'optiond', 'dapand'],
  correctAnswer: ['correctanswer', 'answer', 'dapandung', 'dapan'],
  audioScript: ['audioscript', 'script', 'loithoai', 'transcript'],
  audioUrl: ['audiourl', 'audio'],
  imageUrl: ['imageurl', 'image', 'anh', 'hinhanh'],
  passageText: ['passagetext', 'passage', 'doanvan'],
  explanationVi: ['explanationvi', 'explanation', 'giaithich'],
}

const META_ALIASES = {
  title: ['title', 'tende', 'tendethi'],
  description: ['description', 'mota'],
  category: ['category', 'loai', 'theloai'],
  cefrLevel: ['cefrlevel', 'cefr', 'capdo', 'trinhdo'],
  durationMinutes: ['durationminutes', 'duration', 'thoigian', 'sophut'],
  passingScore: ['passingscore', 'diemdat'],
  xpReward: ['xpreward', 'xp'],
}

const OPTION_KEYS = ['A', 'B', 'C', 'D']

export function simplifyHeader(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

function buildLookup(aliases) {
  const lookup = {}
  Object.entries(aliases).forEach(([field, names]) => names.forEach((n) => { lookup[n] = field }))
  return lookup
}

const COLUMN_LOOKUP = buildLookup(COLUMN_ALIASES)
const META_LOOKUP = buildLookup(META_ALIASES)

const clean = (v) => (v === undefined || v === null ? '' : String(v).trim())

/** Một dòng bảng tính → câu hỏi đúng dạng app đang đọc. Phần chuẩn hoá sâu hơn do backend làm. */
export function rowToQuestion(row) {
  const fields = {}
  Object.entries(row).forEach(([header, value]) => {
    const field = COLUMN_LOOKUP[simplifyHeader(header)]
    if (field && clean(value) !== '') fields[field] = clean(value)
  })
  if (Object.keys(fields).length === 0) return null

  const options = OPTION_KEYS.filter((k) => fields[k] !== undefined).map((k) => ({ key: k, label: k, text: fields[k] }))
  const question = { options }
  ;['questionText', 'audioScript', 'audioUrl', 'imageUrl', 'passageText', 'explanationVi'].forEach((f) => {
    if (fields[f]) question[f] = fields[f]
  })
  const number = Number.parseInt(fields.questionNumber, 10)
  if (Number.isFinite(number)) {
    question.questionNumber = number
    question.id = `q${number}`
  }
  const part = Number.parseInt(String(fields.part ?? '').replace(/\D/g, ''), 10)
  if (Number.isFinite(part)) question.part = part
  if (fields.correctAnswer) {
    const letter = fields.correctAnswer.match(/^\(?\s*([A-Da-d])\s*[).:]?$/)
    question.correctAnswer = letter ? letter[1].toUpperCase() : fields.correctAnswer
  }
  return question
}

function metaFromRows(rows) {
  const meta = {}
  rows.forEach((r) => {
    const values = Object.values(r)
    if (values.length < 2) return
    const field = META_LOOKUP[simplifyHeader(values[0])]
    if (field && clean(values[1])) meta[field] = clean(values[1])
  })
  ;['durationMinutes', 'passingScore', 'xpReward'].forEach((f) => {
    if (meta[f] !== undefined) meta[f] = Number(meta[f]) || undefined
  })
  if (meta.category) meta.category = meta.category.toUpperCase()
  return meta
}

function baseName(fileName) {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim()
}

export function parseJsonText(text, fileName = 'de-thi.json') {
  let data
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('File JSON bị lỗi cú pháp, không đọc được.')
  }
  if (Array.isArray(data)) data = { questions: data }
  if (data?.exam && Array.isArray(data.exam.questions)) data = data.exam
  if (!data || !Array.isArray(data.questions)) {
    throw new Error('Không tìm thấy danh sách câu hỏi (cần mảng "questions").')
  }
  return { ...data, title: data.title || baseName(fileName) }
}

export function parseCsvText(text, fileName = 'de-thi.csv') {
  const { data, errors } = Papa.parse(text, { header: true, skipEmptyLines: true })
  if (errors.length && data.length === 0) throw new Error('File CSV không đọc được.')
  const questions = data.map(rowToQuestion).filter(Boolean)
  if (questions.length === 0) throw new Error('File CSV không có dòng câu hỏi nào khớp tên cột mẫu.')
  return { title: baseName(fileName), questions }
}

export function parseWorkbook(buffer, fileName = 'de-thi.xlsx') {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheets = workbook.SheetNames.map((name) => ({
    name,
    simple: simplifyHeader(name),
    rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { defval: '' }),
  }))
  const questionSheet = sheets.find((s) => ['cauhoi', 'questions', 'question'].includes(s.simple))
    || sheets.find((s) => s.rows.some((r) => rowToQuestion(r)?.options?.length))
  if (!questionSheet) throw new Error('Không tìm thấy trang tính câu hỏi trong file Excel.')
  const infoSheet = sheets.find((s) => ['thongtin', 'info', 'exam'].includes(s.simple))
  const infoRows = infoSheet
    ? XLSX.utils.sheet_to_json(workbook.Sheets[infoSheet.name], { header: ['k', 'v'], defval: '' })
    : []
  const questions = questionSheet.rows.map(rowToQuestion).filter(Boolean)
  if (questions.length === 0) throw new Error('Trang tính câu hỏi không có dòng nào khớp tên cột mẫu.')
  return { title: baseName(fileName), ...metaFromRows(infoRows), questions }
}

export async function readExamFile(file) {
  const name = file.name || ''
  const ext = name.split('.').pop().toLowerCase()
  if (ext === 'json') return parseJsonText(await file.text(), name)
  if (ext === 'csv') return parseCsvText(await file.text(), name)
  if (ext === 'xlsx' || ext === 'xls') return parseWorkbook(new Uint8Array(await file.arrayBuffer()), name)
  throw new Error('Chỉ hỗ trợ file .json, .xlsx, .xls hoặc .csv.')
}

/** File Excel mẫu: trang "Thông tin" và trang "Câu hỏi" với vài dòng ví dụ. */
export function downloadExcelTemplate() {
  const info = [
    ['title', 'TOEIC Test mới'],
    ['category', 'TOEIC_FULL'],
    ['cefrLevel', 'B2'],
    ['durationMinutes', 120],
    ['passingScore', 500],
    ['description', ''],
  ]
  const header = ['questionNumber', 'part', 'questionText', 'A', 'B', 'C', 'D', 'correctAnswer',
    'audioScript', 'audioUrl', 'imageUrl', 'passageText', 'explanation']
  const rows = [
    [1, 1, '', 'A man is opening a window.', 'A man is reading a book.', 'A man is cleaning a desk.', 'A man is carrying a box.', 'B',
      '(A) A man is opening a window. (B) A man is reading a book. (C) A man is cleaning a desk. (D) A man is carrying a box.', '', 'https://...', '', 'Người đàn ông đang đọc sách.'],
    [7, 2, '', 'In the meeting room.', 'At three o\'clock.', 'Yes, I sent it.', '', 'A',
      'Where is the training session? (A) In the meeting room. (B) At three o\'clock. (C) Yes, I sent it.', '', '', '', 'Hỏi địa điểm nên chọn nơi chốn.'],
    [101, 5, 'The report must be submitted ------- Friday.', 'by', 'until', 'since', 'during', 'A', '', '', '', '', '"by + thời hạn" chỉ hạn chót.'],
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(info), 'Thông tin')
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([header, ...rows]), 'Câu hỏi')
  XLSX.writeFile(workbook, 'mau_nhap_de_thi.xlsx')
}
