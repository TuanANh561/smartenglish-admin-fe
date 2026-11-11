import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import React from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Helper trích xuất text hiển thị từ children của <option>
 */
function extractTextFromChildren(children) {
  if (children === null || children === undefined) return ''
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(extractTextFromChildren).join('')
  if (React.isValidElement(children)) return extractTextFromChildren(children.props.children)
  return String(children)
}

/**
 * Modern Custom Dropdown / Select Component for SmartEnglish
 * Thay thế hoàn toàn popup native vuông vức của OS bằng menu bo cong rounded-2xl, shadow-xl sang trọng
 */
const Select = forwardRef(function Select(
  {
    label,
    hint,
    error,
    disabled = false,
    className,
    containerClassName,
    selectClassName,
    id: propId,
    value: propValue,
    defaultValue,
    onChange,
    onBlur,
    options,
    children,
    placeholder = 'Chọn một tùy chọn...',
    align = 'left',
    size = 'md', // 'sm' | 'md'
    ...props
  },
  ref,
) {
  const generatedId = useId()
  const id = propId || generatedId
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 160 })

  const updateMenuPosition = useCallback(() => {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth
    const estimatedMenuHeight = 260
    const spaceBelow = viewportHeight - rect.bottom
    const openUpward = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight

    const minWidth = Math.max(rect.width, 160)
    let leftPos = align === 'right' ? rect.right - minWidth : rect.left
    if (leftPos + minWidth > viewportWidth - 12) {
      leftPos = Math.max(12, viewportWidth - minWidth - 12)
    }

    setMenuPosition({
      top: openUpward ? Math.max(12, rect.top - 6) : rect.bottom + 6,
      left: Math.max(12, leftPos),
      width: rect.width,
      openUpward,
    })
  }, [align])

  // Parse options từ props.options hoặc từ props.children (<option>, <optgroup>)
  const parsedOptions = useMemo(() => {
    if (Array.isArray(options) && options.length > 0) {
      return options.map((opt) =>
        typeof opt === 'object' && opt !== null
          ? {
              value: String(opt.value !== undefined ? opt.value : ''),
              label: opt.label !== undefined ? String(opt.label) : String(opt.value),
              icon: opt.icon,
              disabled: Boolean(opt.disabled),
              isGroupHeader: Boolean(opt.isGroupHeader),
            }
          : { value: String(opt), label: String(opt), disabled: false },
      )
    }

    const items = []
    const parseChild = (child) => {
      if (!React.isValidElement(child)) return
      if (child.type === 'optgroup') {
        if (child.props.label) {
          items.push({
            value: `__group_${child.props.label}`,
            label: child.props.label,
            isGroupHeader: true,
            disabled: true,
          })
        }
        React.Children.forEach(child.props.children, parseChild)
      } else {
        const text = extractTextFromChildren(child.props.children) || child.props.label || String(child.props.value || '')
        items.push({
          value: child.props.value !== undefined ? String(child.props.value) : '',
          label: text,
          disabled: Boolean(child.props.disabled),
        })
      }
    }

    React.Children.forEach(children, parseChild)
    return items
  }, [options, children])

  // Quản lý internal value nếu uncontrolled
  const [internalValue, setInternalValue] = useState(
    defaultValue !== undefined ? String(defaultValue) : parsedOptions.find((o) => !o.isGroupHeader)?.value || '',
  )

  const currentValue = propValue !== undefined ? String(propValue) : internalValue

  // Tìm option đang được chọn (bỏ qua group header)
  const selectedOption = useMemo(() => {
    return parsedOptions.find((opt) => !opt.isGroupHeader && String(opt.value) === String(currentValue)) || null
  }, [parsedOptions, currentValue])

  // Xử lý click outside, phím Escape & cập nhật tọa độ Portal khi cuộn/resize
  useEffect(() => {
    if (!isOpen) return
    updateMenuPosition()

    const handleClickOutside = (e) => {
      const clickedInsideTrigger = dropdownRef.current && dropdownRef.current.contains(e.target)
      const clickedInsideMenu = menuRef.current && menuRef.current.contains(e.target)
      if (!clickedInsideTrigger && !clickedInsideMenu) {
        setIsOpen(false)
        onBlur?.({ target: { name: props.name || id, value: currentValue } })
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        onBlur?.({ target: { name: props.name || id, value: currentValue } })
      }
    }
    const handleScrollOrResize = (e) => {
      if (menuRef.current && e?.target && menuRef.current.contains(e.target)) {
        return
      }
      updateMenuPosition()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [isOpen, onBlur, props.name, id, currentValue, updateMenuPosition])

  const handleSelect = (optValue) => {
    if (disabled) return
    setInternalValue(optValue)
    setIsOpen(false)

    if (onChange) {
      // Giả lập native event object để tương thích 100% với e.target.value
      const syntheticEvent = {
        target: {
          value: optValue,
          name: props.name || id,
          id,
        },
        currentTarget: {
          value: optValue,
          name: props.name || id,
          id,
        },
        value: optValue,
        preventDefault: () => {},
        stopPropagation: () => {},
      }
      onChange(syntheticEvent)
    }
  }

  const hasLabelOrHint = Boolean(label || hint || error)

  return (
    <div
      ref={dropdownRef}
      className={cn(
        hasLabelOrHint ? 'flex flex-col gap-1.5' : 'relative',
        containerClassName,
      )}
    >
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}

      <div className="relative w-full">
        {/* Hidden input để hỗ trợ native form submission / ref */}
        <input
          type="hidden"
          ref={ref}
          name={props.name}
          id={id}
          value={currentValue}
          disabled={disabled}
        />

        {/* Trigger Button */}
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => {
            if (disabled) return
            if (!isOpen) updateMenuPosition()
            setIsOpen((prev) => !prev)
          }}
          title={selectedOption ? selectedOption.label : placeholder}
          className={cn(
            'flex w-full items-center justify-between gap-2 rounded-xl border border-line bg-white text-left font-medium text-slate-700 shadow-2xs transition-all cursor-pointer select-none',
            size === 'sm' ? 'h-9 px-3 text-xs' : 'h-10 px-3.5 text-sm',
            isOpen ? 'border-brand-500 ring-2 ring-brand-200/60' : 'hover:border-slate-300 hover:bg-slate-50/50',
            disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-75',
            error && 'border-[#B91C1C] focus:border-[#B91C1C] ring-1 ring-red-300/50',
            selectClassName || className,
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown
            size={size === 'sm' ? 14 : 16}
            strokeWidth={2}
            className={cn('text-slate-400 shrink-0 transition-transform duration-200', isOpen && 'rotate-180 text-brand-600')}
          />
        </button>

        {/* Custom Popover Dropdown Menu rendered via Portal to avoid overflow-hidden clipping */}
        {isOpen &&
          typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: 'fixed',
                top: menuPosition.top,
                left: menuPosition.left,
                minWidth: Math.max(menuPosition.width || 160, 160),
                transform: menuPosition.openUpward ? 'translateY(-100%)' : undefined,
                zIndex: 9999,
              }}
              className="w-max max-w-sm rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-xl shadow-slate-200/60 max-h-64 overflow-y-auto select-scrollbar pr-1 transition-all duration-150 animate-in fade-in-0 zoom-in-95"
            >
              {parsedOptions.length === 0 ? (
                <div className="py-2 px-3 text-xs text-slate-400 italic text-center">
                  Không có tùy chọn nào
                </div>
              ) : (
                parsedOptions.map((opt) => {
                  if (opt.isGroupHeader) {
                    return (
                      <div
                        key={opt.value}
                        className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none"
                      >
                        {opt.label}
                      </div>
                    )
                  }

                  const isSelected = String(opt.value) === String(currentValue)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 transition-all cursor-pointer text-left select-none whitespace-nowrap',
                        size === 'sm' ? 'text-xs' : 'text-sm',
                        isSelected
                          ? 'bg-brand-50 text-brand-600 font-semibold shadow-2xs'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-navy-900',
                        opt.disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <Check size={size === 'sm' ? 13 : 15} strokeWidth={2.5} className="text-brand-600 shrink-0 ml-1.5" />
                      )}
                    </button>
                  )
                })
              )}
            </div>,
            document.body,
          )}
      </div>

      {error ? (
        <span className="text-xs text-[#B91C1C]">{error}</span>
      ) : (
        hint && <span className="text-xs text-ink-muted">{hint}</span>
      )}
    </div>
  )
})

export default Select
