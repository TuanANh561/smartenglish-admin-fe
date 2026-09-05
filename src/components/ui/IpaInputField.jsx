import { useEffect, useRef, useState } from 'react'
import {
  Check,
  Keyboard,
  Loader2,
  Sparkles,
  Volume2,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  IPA_KEYBOARD_GROUPS,
  generateIpaWithSpellCheck,
  speakWord,
} from '@/lib/ipaHelper'

/**
 * Intelligent IPA Input Field with Online Dictionary Auto-Fetch & Virtual Keyboard
 */
export default function IpaInputField({
  value = '',
  onChange,
  sourceWord = '',
  onWordCorrect,
  placeholder = 'VD: /ˌser.ənˈdɪp.ɪ.ti/',
  label = 'Phiên âm IPA',
  required = false,
  className = '',
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const inputRef = useRef(null)
  const lastAutoFetchedWordRef = useRef('')
  const lastAutoFetchedIpaRef = useRef('')

  // Trigger AI generate and spellcheck
  const handleAiGenerate = async (isManual = false) => {
    const trimmedWord = (sourceWord || '').trim()
    if (!trimmedWord) {
      if (isManual) {
        toast.error('Vui lòng nhập từ vựng trước để tra cứu phiên âm')
      }
      return
    }

    setIsLoading(true)
    try {
      const result = await generateIpaWithSpellCheck(trimmedWord)

      if (result.audioUrl) {
        setAudioUrl(result.audioUrl)
      }

      // 1. If typo detected, auto correct word
      if (result.isCorrected && onWordCorrect) {
        onWordCorrect(result.correctedWord)
        toast.success(
          `✨ Đã sửa chính tả: "${result.originalWord}" → "${result.correctedWord}"`,
          { icon: '🪄', duration: 4000 }
        )
      }

      // 2. Set generated IPA or handle not found
      if (result.notFound) {
        if (isManual) {
          toast('Chưa tìm thấy phiên âm tự động. Bạn có thể bấm "Ký tự" để chọn IPA thủ công.', { icon: 'ℹ️' })
        }
      } else if (result.ipa && onChange) {
        lastAutoFetchedWordRef.current = trimmedWord.toLowerCase()
        lastAutoFetchedIpaRef.current = result.ipa
        onChange(result.ipa)
        if (!result.isCorrected && isManual) {
          toast.success(`✨ Đã lấy phiên âm chuẩn: ${result.ipa}`, { duration: 2500 })
        }
      }
    } catch (err) {
      if (isManual) {
        toast.error('Không thể tra cứu IPA, vui lòng nhập thủ công')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Tự động tra cứu từ điển online khi người dùng gõ từ mới (debounced 600ms)
  useEffect(() => {
    const trimmed = (sourceWord || '').trim()
    if (!trimmed || trimmed.length < 2) return

    // Nếu từ chưa đổi thì không tra lại
    if (trimmed.toLowerCase() === lastAutoFetchedWordRef.current) return

    // Tự động tra cứu nếu:
    // 1. Ô phiên âm đang trống (!value), HOẶC
    // 2. Phiên âm hiện tại khớp với phiên âm tự động của từ trước đó (người dùng chưa gõ tay IPA riêng)
    const shouldAutoFetch = !value || (lastAutoFetchedIpaRef.current && value === lastAutoFetchedIpaRef.current)

    if (shouldAutoFetch) {
      const timer = setTimeout(() => {
        handleAiGenerate(false)
      }, 650)
      return () => clearTimeout(timer)
    }
  }, [sourceWord])

  // Handle onFocus: Auto-suggest if field is empty
  const handleFocus = () => {
    if (!value && sourceWord.trim()) {
      handleAiGenerate(false)
    }
  }

  // Handle speak audio
  const handleSpeak = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const wordToSpeak = (sourceWord || '').trim() || value.replace(/[\/\[\]]/g, '')
    if (!wordToSpeak) {
      toast.error('Chưa có từ để phát âm')
      return
    }
    setIsPlayingAudio(true)
    speakWord(wordToSpeak, audioUrl)
    setTimeout(() => setIsPlayingAudio(false), 1500)
  }

  // Insert IPA symbol at cursor position
  const handleInsertSymbol = (sym) => {
    const input = inputRef.current
    if (!input) {
      onChange((value || '') + sym)
      return
    }

    const start = input.selectionStart ?? value.length
    const end = input.selectionEnd ?? value.length
    const nextVal = value.substring(0, start) + sym + value.substring(end)
    onChange(nextVal)

    // Restore cursor position
    setTimeout(() => {
      input.focus()
      input.setSelectionRange(start + sym.length, start + sym.length)
    }, 10)
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Actions */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="flex items-center gap-1.5">
          {/* Quick IPA Trigger Button */}
          <button
            type="button"
            onClick={() => handleAiGenerate(true)}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-brand-700 px-2 py-0.5 text-[11px] font-semibold border border-brand-200 transition-colors cursor-pointer"
            title="Tự động tra cứu phiên âm chuẩn quốc tế và kiểm tra chính tả (0 token)"
          >
            {isLoading ? (
              <>
                <Loader2 size={12} className="animate-spin text-brand-600" />
                <span>Đang tra cứu...</span>
              </>
            ) : (
              <>
                <Sparkles size={12} className="text-brand-600" />
                <span>Lấy IPA chuẩn</span>
              </>
            )}
          </button>

          {/* Virtual Keyboard Toggle Button */}
          <button
            type="button"
            onClick={() => setShowKeyboard((prev) => !prev)}
            className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-semibold border transition-colors cursor-pointer ${
              showKeyboard
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Mở bảng phím chọn ký tự IPA"
          >
            <Keyboard size={12} />
            <span>Ký tự</span>
          </button>
        </div>
      </div>

      {/* Input wrapper */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-3.5 pr-20 text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:font-sans focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
        />

        {/* Right action icons */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Audio Speaker */}
          <button
            type="button"
            onClick={handleSpeak}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors cursor-pointer ${
              isPlayingAudio
                ? 'bg-brand-500 text-white animate-pulse'
                : 'text-slate-400 hover:bg-slate-100 hover:text-brand-600'
            }`}
            title="Nghe phát âm chuẩn (AI Speech)"
          >
            <Volume2 size={15} />
          </button>

          {/* Quick Clear */}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex h-6 w-6 items-center justify-center rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Xóa phiên âm"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Virtual Keyboard Dropdown Palette */}
      {showKeyboard && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-lg space-y-2.5 transition-all text-xs z-30">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Keyboard size={14} className="text-brand-600" />
              Bàn phím ký tự IPA quốc tế
            </span>
            <button
              type="button"
              onClick={() => setShowKeyboard(false)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
            >
              <X size={14} />
            </button>
          </div>

          <div className="space-y-2">
            {IPA_KEYBOARD_GROUPS.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {group.name}
                </span>
                <div className="flex flex-wrap gap-1">
                  {group.symbols.map((sym, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleInsertSymbol(sym)}
                      className="min-w-[28px] h-7 px-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700 font-mono text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
                    >
                      {sym}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>💡 Click vào ký tự để chèn vào vị trí con trỏ</span>
            <button
              type="button"
              onClick={() => {
                let formatted = value.trim()
                if (formatted && !formatted.startsWith('/')) formatted = '/' + formatted
                if (formatted && !formatted.endsWith('/')) formatted = formatted + '/'
                onChange(formatted)
              }}
              className="font-medium text-brand-600 hover:underline cursor-pointer"
            >
              Bọc dấu /.../
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
