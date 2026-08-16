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

export const vocabularyColumns = [
  columnHelper.accessor('word', {
    header: 'Từ vựng',
    enableSorting: true,
    cell: (info) => <span className="font-semibold text-brand-500">{info.getValue()}</span>,
  }),
  columnHelper.accessor('pronunciation', {
    header: 'Phiên âm IPA',
    enableSorting: false,
    cell: (info) => <span className="font-mono text-sm text-ink-muted">{info.getValue()}</span>,
  }),
  columnHelper.accessor('partOfSpeech', {
    header: 'Từ loại',
    enableSorting: false,
    cell: (info) => (
      <Badge tone="info">{PART_OF_SPEECH_LABEL[info.getValue()] ?? info.getValue()}</Badge>
    ),
  }),
  columnHelper.accessor('vietnameseMeaning', {
    header: 'Nghĩa tiếng Việt',
    enableSorting: false,
    cell: (info) => <span>{info.getValue()}</span>,
  }),
  columnHelper.accessor('cefrLevel', {
    header: 'Cấp độ CEFR',
    enableSorting: false,
    cell: (info) => <Badge tone={CEFR_TONE[info.getValue()] ?? 'info'}>{info.getValue()}</Badge>,
  }),
  columnHelper.accessor('topic', {
    header: 'Chủ đề',
    enableSorting: false,
    cell: (info) => <span>{info.getValue()}</span>,
  }),
]
