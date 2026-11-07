import { useEffect, useRef } from 'react'

/**
 * Hook bắt phím tắt Ctrl + S (Windows/Linux) hoặc Cmd + S (macOS)
 * - Tự động ngăn chặn hành vi mặc định của trình duyệt (hộp thoại Save Webpage As...).
 * - Gọi hàm onSave được truyền vào khi người dùng nhấn tổ hợp phím.
 *
 * @param {Function} onSave - Hàm thực thi việc lưu dữ liệu
 * @param {boolean} [enabled=true] - Điều kiện kích hoạt (thường là !isSaving hoặc !loading)
 */
export function useCtrlSave(onSave, enabled = true) {
  const onSaveRef = useRef(onSave)
  const enabledRef = useRef(enabled)

  useEffect(() => {
    onSaveRef.current = onSave
    enabledRef.current = enabled
  }, [onSave, enabled])

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Kiểm tra phím Ctrl (Windows/Linux) hoặc Cmd (macOS) + phím S
      if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
        event.preventDefault()
        event.stopPropagation()

        if (enabledRef.current && typeof onSaveRef.current === 'function') {
          onSaveRef.current()
        }
      }
    }

    // Dùng capture: true để chặn triệt để sự kiện trình duyệt kể cả khi focus bên trong ô input / textarea
    window.addEventListener('keydown', handleKeyDown, { capture: true })
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true })
    }
  }, [])
}

export default useCtrlSave

