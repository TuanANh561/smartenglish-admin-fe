import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Pagination from '@/components/ui/Pagination'
import VocabImportModal from '@/features/vocabulary/import/VocabImportModal'
import { useVocabulary, PAGE_SIZE } from './hooks/useVocabulary'
import VocabToolbar from './components/VocabToolbar'
import VocabTable from './components/VocabTable'
import VocabTrashBanner from './components/VocabTrashBanner'

/**
 * Trang quản lý Kho từ vựng gốc của hệ thống (Clean Architecture).
 * Tách biệt hoàn toàn tầng Logic/State (useVocabulary hook) và tầng Giao diện (Sub-components).
 */
export function VocabularyPage() {
  const navigate = useNavigate()
  const [isPdfImportOpen, setIsPdfImportOpen] = useState(false)

  const vocab = useVocabulary()

  return (
    <div className="space-y-4">
      {/* Table card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        {/* Banner thông báo khi ở chế độ thùng rác */}
        {vocab.trashView && (
          <VocabTrashBanner
            trashCount={vocab.trashCount}
            onBack={() => vocab.toggleTrash(false)}
          />
        )}

        {/* Thanh công cụ tìm kiếm & bộ lọc */}
        <VocabToolbar
          trashView={vocab.trashView}
          trashCount={vocab.trashCount}
          searchInput={vocab.searchInput}
          onSearchChange={vocab.setSearchInput}
          onSearchClear={vocab.clearSearch}
          sortBy={vocab.sortBy}
          onSortChange={vocab.setSortBy}
          partOfSpeech={vocab.partOfSpeech}
          onPartOfSpeechChange={vocab.setPartOfSpeech}
          topicId={vocab.topicId}
          onTopicChange={vocab.setTopicId}
          topics={vocab.topics}
          onRefresh={vocab.refresh}
          onOpenImport={() => setIsPdfImportOpen(true)}
          onOpenCreate={() => navigate('/app/hoc-lieu/tu-vung/tao-moi')}
          onToggleTrash={vocab.toggleTrash}
        />

        {/* Bảng dữ liệu từ vựng */}
        <VocabTable
          isLoading={vocab.isLoading}
          vocabList={vocab.vocabList}
          trashView={vocab.trashView}
          search={vocab.search}
          playingId={vocab.playingId}
          onPlayAudio={vocab.playAudio}
          onEdit={(item) => navigate(`/app/hoc-lieu/tu-vung/${item.id}/chinh-sua`)}
          onDelete={(item) => vocab.setDeleteTarget(item)}
          onRestore={vocab.restoreWord}
          onPermanentDelete={(item) => vocab.setPermanentTarget(item)}
          onAutoImport={vocab.handleAutoImport}
          isImporting={vocab.isImporting}
        />

        {/* Phân trang */}
        {vocab.total > 0 && (
          <div className="border-t border-slate-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Hiển thị <strong>{(vocab.page - 1) * PAGE_SIZE + 1}</strong>-
              <strong>{Math.min(vocab.page * PAGE_SIZE, vocab.total)}</strong> trong tổng số{' '}
              <strong>{vocab.total}</strong> từ vựng
            </p>
            <Pagination
              page={vocab.page}
              currentPage={vocab.page}
              totalPages={vocab.totalPages}
              onChange={vocab.setPage}
              onPageChange={vocab.setPage}
            />
          </div>
        )}
      </div>

      {/* Dialog xác nhận chuyển vào thùng rác (Xóa mềm) */}
      <ConfirmDialog
        isOpen={Boolean(vocab.deleteTarget)}
        title="Chuyển từ vựng vào thùng rác"
        message={`Bạn có chắc muốn chuyển từ "${vocab.deleteTarget?.word}" vào thùng rác? Bạn có thể khôi phục lại bất kỳ lúc nào.`}
        confirmText="Chuyển vào thùng rác"
        cancelText="Hủy"
        type="warning"
        isLoading={vocab.isDeleting}
        onConfirm={vocab.deleteWord}
        onClose={() => vocab.setDeleteTarget(null)}
      />

      {/* Dialog xác nhận xóa vĩnh viễn */}
      <ConfirmDialog
        isOpen={Boolean(vocab.permanentTarget)}
        title="Xóa vĩnh viễn từ vựng"
        message={`Từ "${vocab.permanentTarget?.word}" sẽ bị xóa hoàn toàn khỏi cơ sở dữ liệu và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy"
        type="danger"
        isLoading={vocab.isDeleting}
        onConfirm={vocab.permanentDeleteWord}
        onClose={() => vocab.setPermanentTarget(null)}
      />

      {/* Modal Import từ vựng bằng file JSON hoặc PDF thông minh */}
      <VocabImportModal
        open={isPdfImportOpen}
        isOpen={isPdfImportOpen}
        onClose={() => setIsPdfImportOpen(false)}
        onImportSuccess={() => {
          vocab.setPage(1)
          vocab.refresh()
        }}
      />
    </div>
  )
}

export default VocabularyPage
