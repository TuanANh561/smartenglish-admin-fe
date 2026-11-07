import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import { api } from '@/lib/api'
import { ENDPOINTS } from '@/lib/endpoints'
import { speakWithWebSpeech, stopAudio } from '@/lib/ipaHelper'
import { registerAudioStopHandler } from '@/lib/appAudioCoordinator'

import {
  PAGE_SIZE,
  SORT_OPTIONS,
  CEFR_LEVELS,
  PARTS_OF_SPEECH,
  PART_OF_SPEECH_LABEL,
} from '../vocabularyConstants'

export {
  PAGE_SIZE,
  SORT_OPTIONS,
  CEFR_LEVELS,
  PARTS_OF_SPEECH,
  PART_OF_SPEECH_LABEL,
}

/**
 * Custom Hook quản lý toàn bộ nghiệp vụ, dữ liệu và trạng thái của Kho từ vựng:
 * - Tự động đồng bộ phân trang, tìm kiếm có debounce, lọc từ loại & chủ đề
 * - Quản lý chế độ Thùng rác (trashView), số lượng đếm (trashCount)
 * - Tự động kích hoạt AI/Online Dictionary nạp từ nếu CSDL chưa có
 * - Quản lý phát âm Web Speech API và điều phối âm thanh toàn cục
 * - Các thao tác Xóa mềm, Khôi phục, Xóa vĩnh viễn
 */
export function useVocabulary() {
  const [vocabList, setVocabList] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState('created_desc')
  const [partOfSpeech, setPartOfSpeech] = useState('')
  const [topicId, setTopicId] = useState('')
  const [topics, setTopics] = useState([])

  const [trashView, setTrashView] = useState(false)
  const [trashCount, setTrashCount] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [permanentTarget, setPermanentTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [playingId, setPlayingId] = useState(null)

  // 1. Tải danh sách chủ đề từ CSDL
  const loadTopics = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.words.topics)
      const list = Array.isArray(res) ? res : res?.data || []
      setTopics(list)
    } catch (err) {
      console.warn('Lỗi khi tải danh sách chủ đề:', err)
    }
  }, [])

  // 2. Tải số lượng từ trong thùng rác
  const refreshTrashCount = useCallback(async () => {
    try {
      const res = await api.get(ENDPOINTS.words.trashCount)
      const count = typeof res === 'number' ? res : res?.data ?? 0
      setTrashCount(Number(count) || 0)
    } catch (err) {
      console.warn('Lỗi khi tải số lượng từ trong thùng rác:', err)
    }
  }, [])

  useEffect(() => {
    loadTopics()
    refreshTrashCount()
  }, [loadTopics, refreshTrashCount])

  // 3. Debounce tìm kiếm: Tự động kích hoạt sau khi người dùng dừng gõ 450ms
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = searchInput.trim()
      if (trimmed !== search) {
        setSearch(trimmed)
        setPage(1)
      }
    }, 450)
    return () => clearTimeout(handler)
  }, [searchInput, search])

  // 4. Truy vấn danh sách từ vựng từ Backend API
  const fetchWords = useCallback(
    async (targetPage, targetSearch, targetPos, targetTopic, targetSort, targetTrash) => {
      const p = targetPage !== undefined ? targetPage : page
      const s = targetSearch !== undefined ? targetSearch : search
      const pos = targetPos !== undefined ? targetPos : partOfSpeech
      const tid = targetTopic !== undefined ? targetTopic : topicId
      const sby = targetSort !== undefined ? targetSort : sortBy
      const isTrash = targetTrash !== undefined ? targetTrash : trashView

      setIsLoading(true)
      try {
        const params = {
          page: p,
          size: PAGE_SIZE,
          sortBy: sby,
          trash: isTrash,
        }
        if (s && s.trim()) params.search = s.trim()
        if (pos) params.partOfSpeech = pos
        if (tid) params.topicId = tid

        const res = await api.get(ENDPOINTS.words.list, { params })
        const items = res?.items || (Array.isArray(res) ? res : [])
        const currentTotal = res?.total ?? items.length

        setVocabList(items)
        setTotal(currentTotal)
        setTotalPages(res?.totalPages ?? (Math.ceil(currentTotal / PAGE_SIZE) || 1))
        if (s && items.length > 0) {
          loadTopics()
        }
      } catch (err) {
        console.error('Lỗi khi tải từ vựng:', err)
        toast.error('Không thể kết nối đến máy chủ để lấy từ vựng')
      } finally {
        setIsLoading(false)
      }
    },
    [search, page, partOfSpeech, topicId, sortBy, trashView, loadTopics, refreshTrashCount],
  )

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  // 5. Ngắt âm thanh khi chuyển trang, đổi bộ lọc hoặc chế độ xem
  useEffect(() => {
    stopAudio()
    setPlayingId(null)
  }, [page, search, partOfSpeech, topicId, sortBy, trashView])

  useEffect(() => {
    const unregister = registerAudioStopHandler(() => {
      setPlayingId(null)
    })
    return () => {
      unregister()
      stopAudio()
    }
  }, [])

  // 6. Chuyển đổi trạng thái Thùng rác
  const toggleTrash = (nextTrash) => {
    const nextVal = typeof nextTrash === 'boolean' ? nextTrash : !trashView
    setTrashView(nextVal)
    setPage(1)
    setSearchInput('')
    setSearch('')
    fetchWords(1, '', partOfSpeech, topicId, sortBy, nextVal)
  }

  // 7. Xóa tìm kiếm
  const clearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  // 8. Tải lại danh sách
  const refresh = () => {
    fetchWords()
    loadTopics()
    refreshTrashCount()
  }

  // 9. Phát âm
  const playAudio = (e, item) => {
    e?.stopPropagation?.()
    if (playingId === item.id) {
      setPlayingId(null)
      stopAudio()
      toast('Đã dừng phát âm')
    } else {
      setPlayingId(item.id)
      speakWithWebSpeech(item.word, () => {
        setPlayingId((curr) => (curr === item.id ? null : curr))
      })
      setTimeout(() => {
        setPlayingId((curr) => (curr === item.id ? null : curr))
      }, 3000)
    }
  }

  // 10. Xóa mềm vào thùng rác
  const deleteWord = async () => {
    if (!deleteTarget || isDeleting) return
    setIsDeleting(true)
    const target = deleteTarget

    try {
      await api.del(ENDPOINTS.words.remove, { path: { id: target.id } })
      setVocabList((prev) => prev.filter((v) => v.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => prev + 1)
      setDeleteTarget(null)
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã chuyển từ "${target.word}" vào thùng rác`)
    } catch (err) {
      console.error('Lỗi khi xóa từ vựng:', err)
      toast.error(`Lỗi khi xóa từ "${target.word}". Vui lòng thử lại!`)
    } finally {
      setIsDeleting(false)
    }
  }

  // 11. Khôi phục từ thùng rác
  const restoreWord = async (vocab) => {
    try {
      await api.patch(ENDPOINTS.words.restore, null, { path: { id: vocab.id } })
      setVocabList((prev) => prev.filter((v) => v.id !== vocab.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => Math.max(0, prev - 1))
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã khôi phục từ "${vocab.word}" thành công!`)
    } catch (err) {
      console.error('Lỗi khi khôi phục từ vựng:', err)
      toast.error(`Không thể khôi phục từ "${vocab.word}"`)
    }
  }

  // 12. Xóa vĩnh viễn khỏi CSDL
  const permanentDeleteWord = async () => {
    if (!permanentTarget || isDeleting) return
    setIsDeleting(true)
    const target = permanentTarget

    try {
      await api.del(ENDPOINTS.words.permanentRemove, { path: { id: target.id } })
      setVocabList((prev) => prev.filter((v) => v.id !== target.id))
      setTotal((prev) => Math.max(0, prev - 1))
      setTrashCount((prev) => Math.max(0, prev - 1))
      setPermanentTarget(null)
      loadTopics()
      refreshTrashCount()
      toast.success(`Đã xóa vĩnh viễn từ "${target.word}"`)
    } catch (err) {
      console.error('Lỗi khi xóa vĩnh viễn từ vựng:', err)
      toast.error(`Xóa vĩnh viễn thất bại: ${err?.message || ''}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // 13. Chủ động tra cứu & nạp từ điển quốc tế / AI khi người dùng xác nhận
  const handleAutoImport = async (targetWord) => {
    const w = (targetWord || searchInput || search).trim()
    if (!w) return
    setIsImporting(true)
    try {
      const res = await api.post(ENDPOINTS.words.autoImport, null, {
        params: { word: w },
      })
      const newWord = res?.data || res
      toast.success(`Đã nạp thành công từ "${newWord.word || w}" vào CSDL!`)
      await fetchWords(1, newWord.word || w, '', '', sortBy, false)
      loadTopics()
      refreshTrashCount()
    } catch (err) {
      const errMsg = err?.response?.data?.message || err?.message || `Không thể tra cứu từ "${w}"`
      toast.error(errMsg)
    } finally {
      setIsImporting(false)
    }
  }

  return {
    vocabList,
    isLoading,
    total,
    totalPages,
    page,
    setPage,
    searchInput,
    search,
    setSearchInput,
    clearSearch,
    sortBy,
    setSortBy,
    partOfSpeech,
    setPartOfSpeech,
    topicId,
    setTopicId,
    topics,
    trashView,
    trashCount,
    toggleTrash,
    playingId,
    playAudio,
    deleteTarget,
    setDeleteTarget,
    permanentTarget,
    setPermanentTarget,
    isDeleting,
    isImporting,
    handleAutoImport,
    deleteWord,
    restoreWord,
    permanentDeleteWord,
    refresh,
  }
}

export default useVocabulary

