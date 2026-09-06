import { useMemo, useState } from 'react'
import Input from '@/components/ui/Input'

export default function CurrencyInput({ value, onChange, className, ...props }) {
  const [localVal, setLocalVal] = useState(null)

  const displayValue = useMemo(() => {
    if (localVal !== null) return localVal
    if (value === 0 || value === '0') return '0'
    if (!value) return ''
    return Number(value).toLocaleString('vi-VN')
  }, [localVal, value])

  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '')
    if (raw === '') {
      setLocalVal('')
      onChange?.(0)
    } else {
      const num = Number(raw)
      setLocalVal(num.toLocaleString('vi-VN'))
      onChange?.(num)
    }
  }

  const handleBlur = () => {
    setLocalVal(null)
  }

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      className={className}
      {...props}
    />
  )
}
