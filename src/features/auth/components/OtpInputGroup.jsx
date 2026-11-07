import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Component 6 ô nhập mã OTP tách rời (PIN Code)
 * Tự động chuyển ô tiếp theo khi gõ, lùi về ô trước khi xoá (Backspace),
 * hỗ trợ paste trọn vẹn chuỗi 6 ký tự số.
 */
export default function OtpInputGroup({
  value = ['', '', '', '', '', ''],
  onChange,
  onComplete,
  disabled = false,
  autoFocus = true,
  error = false,
}) {
  const inputRefs = useRef([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleChange = (e, index) => {
    const rawVal = e.target.value
    // Chỉ giữ lại ký tự số cuối cùng được nhập
    const digit = rawVal.replace(/\D/g, '').slice(-1)

    const nextValue = [...value]
    nextValue[index] = digit
    onChange(nextValue)

    // Nếu vừa nhập ký tự số thành công -> tự động focus ô tiếp theo
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus()
      inputRefs.current[index + 1]?.select()
    }

    // Nếu đã đủ 6 số -> gọi onComplete
    const fullCode = nextValue.join('')
    if (fullCode.length === 6 && onComplete) {
      onComplete(fullCode)
    }
  }

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Ô hiện tại rỗng mà nhấn backspace -> focus ô trước và xoá
        inputRefs.current[index - 1]?.focus()
        const nextValue = [...value]
        nextValue[index - 1] = ''
        onChange(nextValue)
      } else {
        const nextValue = [...value]
        nextValue[index] = ''
        onChange(nextValue)
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return

    const nextValue = ['', '', '', '', '', '']
    for (let i = 0; i < pasted.length; i++) {
      nextValue[i] = pasted[i]
    }
    onChange(nextValue)

    // Focus vào ô tiếp theo sau ký tự cuối cùng vừa paste
    const nextIndex = Math.min(pasted.length, 5)
    inputRefs.current[nextIndex]?.focus()

    if (pasted.length === 6 && onComplete) {
      onComplete(pasted)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-2.5" onPaste={handlePaste}>
      {value.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          onFocus={(e) => e.target.select()}
          className={cn(
            'h-12 w-11 sm:h-13 sm:w-12 rounded-xl text-center text-xl sm:text-2xl font-bold transition-all outline-none',
            'border bg-white shadow-2xs font-mono',
            error
              ? 'border-red-400 bg-red-50/40 text-red-700 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : digit
                ? 'border-brand-500 text-navy-900 bg-brand-50/20 ring-1 ring-brand-500/20'
                : 'border-slate-300 text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed',
          )}
          aria-label={`Chữ số thứ ${idx + 1}`}
        />
      ))}
    </div>
  )
}

