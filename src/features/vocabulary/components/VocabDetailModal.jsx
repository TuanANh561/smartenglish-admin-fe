import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import { cleanDisplayMeaning } from '../columns'

const PART_OF_SPEECH_LABEL = {
  Noun: 'Danh từ',
  Verb: 'Động từ',
  Adjective: 'Tính từ',
  Adverb: 'Trạng từ',
  Pronoun: 'Đại từ',
  Preposition: 'Giới từ',
}

function Field({ label, children }) {
  if (!children) return null
  return (
    <div>
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  )
}

/** Chi tiết một từ vựng: dùng chung cho từ đã có trong kho và từ đang chờ duyệt (footer = thanh duyệt). */
function VocabDetailModal({ vocab, onClose, footer }) {
  if (!vocab) return null
  const ipa = vocab.pronunciation || vocab.ipaUs || vocab.ipaUk
  const meaning = cleanDisplayMeaning(vocab.vietnameseMeaning, vocab.word)
  const examples = Array.isArray(vocab.exercises) ? vocab.exercises.filter((q) => q?.question) : []

  return (
    <Modal open onClose={onClose} title="Chi tiết từ vựng" className="max-w-xl">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div>
          <h2 className="text-2xl font-semibold text-navy-700">{vocab.word || '—'}</h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {ipa ? <span className="font-mono text-sm text-ink-muted">{ipa}</span> : null}
            {vocab.partOfSpeech ? (
              <Badge tone="info">{PART_OF_SPEECH_LABEL[vocab.partOfSpeech] ?? vocab.partOfSpeech}</Badge>
            ) : null}
            {vocab.cefrLevel ? <Badge tone="neutral">{vocab.cefrLevel}</Badge> : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-lg border border-line p-4 sm:grid-cols-2">
          <Field label="Nghĩa tiếng Việt">{meaning}</Field>
          <Field label="Nghĩa tiếng Anh">{cleanDisplayMeaning(vocab.englishMeaning)}</Field>
          <Field label="Chủ đề">{vocab.topic}</Field>
          <Field label="Từ đồng nghĩa">{vocab.synonyms}</Field>
        </div>

        {vocab.exampleEn || vocab.exampleVi ? (
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-ink-muted">Ví dụ</p>
            {vocab.exampleEn ? <p className="mt-1 text-sm text-ink">{vocab.exampleEn}</p> : null}
            {vocab.exampleVi ? <p className="mt-0.5 text-sm text-ink-muted">{cleanDisplayMeaning(vocab.exampleVi)}</p> : null}
          </div>
        ) : null}

        {examples.length > 0 ? (
          <div className="rounded-lg border border-line p-4">
            <p className="text-xs font-medium text-ink-muted">Bài tập ({examples.length} câu)</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink">
              {examples.map((q, i) => (
                <li key={i}>{q.question}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {footer}
      </div>
    </Modal>
  )
}

export default VocabDetailModal
