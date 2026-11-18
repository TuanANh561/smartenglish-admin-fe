import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { parseCsvText, parseJsonText, parseWorkbook, rowToQuestion, simplifyHeader } from './examImport'

describe('examImport', () => {
  it('đơn giản hoá tên cột tiếng Việt', () => {
    expect(simplifyHeader('Đáp án đúng')).toBe('dapandung')
    expect(simplifyHeader(' Option A ')).toBe('optiona')
  })

  it('đổi một dòng bảng tính thành câu hỏi', () => {
    const q = rowToQuestion({ 'Số câu': '7', Part: 'Part 2', A: 'Yes', B: 'No', C: 'Maybe', 'Đáp án': '(b)', 'Lời thoại': 'Is it ready?' })
    expect(q).toMatchObject({ questionNumber: 7, part: 2, correctAnswer: 'B', audioScript: 'Is it ready?', id: 'q7' })
    expect(q.options).toEqual([
      { key: 'A', label: 'A', text: 'Yes' },
      { key: 'B', label: 'B', text: 'No' },
      { key: 'C', label: 'C', text: 'Maybe' },
    ])
  })

  it('bỏ dòng trống', () => {
    expect(rowToQuestion({ foo: '', bar: '' })).toBeNull()
  })

  it('nhận JSON dạng mảng hoặc bọc trong exam', () => {
    expect(parseJsonText('[{"questionNumber":1}]', 'de_moi.json')).toMatchObject({ title: 'de moi', questions: [{ questionNumber: 1 }] })
    expect(parseJsonText('{"exam":{"title":"X","questions":[]}}').title).toBe('X')
    expect(() => parseJsonText('{"title":"X"}')).toThrow()
    expect(() => parseJsonText('{oops')).toThrow()
  })

  it('đọc CSV', () => {
    const exam = parseCsvText('questionNumber,part,questionText,A,B,C,D,answer\n101,5,Pick one,by,until,since,during,A\n')
    expect(exam.questions[0]).toMatchObject({ questionNumber: 101, part: 5, correctAnswer: 'A' })
  })

  it('đọc Excel có trang Thông tin và Câu hỏi', () => {
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['title', 'Đề A'], ['category', 'toeic_mini'], ['durationMinutes', '45']]), 'Thông tin')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
      ['questionNumber', 'part', 'questionText', 'A', 'B', 'C', 'D', 'correctAnswer'],
      [101, 5, 'Pick one', 'by', 'until', 'since', 'during', 'd'],
    ]), 'Câu hỏi')
    const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
    const exam = parseWorkbook(new Uint8Array(buffer), 'x.xlsx')
    expect(exam).toMatchObject({ title: 'Đề A', category: 'TOEIC_MINI', durationMinutes: 45 })
    expect(exam.questions[0].correctAnswer).toBe('D')
  })
})
