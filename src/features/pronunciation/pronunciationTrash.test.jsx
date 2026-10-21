// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, fireEvent } from '@testing-library/react'

import PronunciationToolbar from './components/PronunciationToolbar'
import PronunciationTableRow from './components/PronunciationTableRow'

describe('Pronunciation Toolbar & Table Row Trash / Soft Delete Feature', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders trash button after the "Thêm" button as icon-only with no text', () => {
    const handleToggleTrash = vi.fn()
    const handleOpenCreate = vi.fn()

    const { container } = render(
      <PronunciationToolbar
        search=""
        onSearchChange={() => {}}
        selectedCategory="Tất cả phân loại"
        onCategoryChange={() => {}}
        selectedLevel="Tất cả"
        onLevelChange={() => {}}
        selectedStatus="all"
        onStatusChange={() => {}}
        trashView={false}
        onToggleTrash={handleToggleTrash}
        trashCount={3}
        onOpenCreate={handleOpenCreate}
      />
    )

    // Button "Thêm" exists
    const createBtn = screen.getByTitle('Thêm bài phát âm mới')
    expect(createBtn).toBeDefined()

    // Button "Thùng rác" exists, has title and aria-label
    const trashBtn = screen.getByTitle('Thùng rác (3)')
    expect(trashBtn).toBeDefined()
    expect(trashBtn.getAttribute('aria-label')).toBe('Thùng rác (3)')

    // Verify it is placed after the "Thêm" button in DOM order
    expect(createBtn.compareDocumentPosition(trashBtn) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()

    // Verify it has badge count 3
    expect(screen.getByText('3')).toBeDefined()

    // Click trash button calls onToggleTrash(true)
    fireEvent.click(trashBtn)
    expect(handleToggleTrash).toHaveBeenCalledWith(true)
  })

  it('renders back icon and hides add button when trashView is true', () => {
    const handleToggleTrash = vi.fn()

    render(
      <PronunciationToolbar
        search=""
        onSearchChange={() => {}}
        selectedCategory="Tất cả phân loại"
        onCategoryChange={() => {}}
        selectedLevel="Tất cả"
        onLevelChange={() => {}}
        selectedStatus="all"
        onStatusChange={() => {}}
        trashView={true}
        onToggleTrash={handleToggleTrash}
        trashCount={3}
        onOpenCreate={() => {}}
      />
    )

    // In trash view, the add button should NOT be rendered
    expect(screen.queryByTitle('Thêm bài phát âm mới')).toBeNull()

    // The back/rotate button should be rendered
    const backBtn = screen.getByTitle('Quay lại danh sách phát âm')
    expect(backBtn).toBeDefined()

    // Clicking it toggles back to active list
    fireEvent.click(backBtn)
    expect(handleToggleTrash).toHaveBeenCalledWith(false)
  })

  it('PronunciationTableRow displays restore and permanent delete actions in trash mode', () => {
    const mockLesson = {
      id: 99,
      title: 'Practice Sound /θ/',
      ipaSymbol: '/θ/',
      category: 'Consonants',
      level: 'B1',
      status: 'draft',
      updatedAt: '2026-10-21T07:00:00Z',
      deletedAt: '2026-10-21T07:05:00Z',
    }

    const handleRestore = vi.fn()
    const handlePermanentDelete = vi.fn()

    render(
      <table>
        <tbody>
          <PronunciationTableRow
            item={mockLesson}
            isTrash={true}
            onRestore={handleRestore}
            onPermanentDelete={handlePermanentDelete}
            onViewDetails={() => {}}
            onEdit={() => {}}
            onDuplicate={() => {}}
            onDelete={() => {}}
          />
        </tbody>
      </table>
    )

    // Should display "Đã xóa" badge
    expect(screen.getByText('Đã xóa')).toBeDefined()

    // Should have Restore button
    const restoreBtn = screen.getByTitle('Khôi phục bài học')
    expect(restoreBtn).toBeDefined()
    fireEvent.click(restoreBtn)
    expect(handleRestore).toHaveBeenCalled()

    // Should have Permanent Delete button
    const permanentDeleteBtn = screen.getByTitle('Xóa vĩnh viễn')
    expect(permanentDeleteBtn).toBeDefined()
    fireEvent.click(permanentDeleteBtn)
    expect(handlePermanentDelete).toHaveBeenCalled()
  })
})
