export const LEVEL_LABEL = {
  A1: 'A1 Sơ cấp',
  A2: 'A2 Tiền trung cấp',
  B1: 'B1 Trung cấp',
  B2: 'B2 Trung cấp cao',
  C1: 'C1 Nâng cao',
  C2: 'C2 Thành thạo',
}

export const LEVEL_TONE = {
  A1: 'neutral',
  A2: 'neutral',
  B1: 'info',
  B2: 'info',
  C1: 'danger',
  C2: 'danger',
}

export const LEVEL_GROUPS = [
  { key: 'all', label: 'Tất cả', levels: null },
  { key: 'a', label: 'A1-A2', levels: ['A1', 'A2'] },
  { key: 'b', label: 'B1-B2', levels: ['B1', 'B2'] },
  { key: 'c', label: 'C1-C2', levels: ['C1', 'C2'] },
]
