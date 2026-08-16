function ChartEmpty({ message = 'Chưa có dữ liệu cho khoảng thời gian này', height = 260 }) {
  return (
    <div className="flex items-center justify-center text-sm text-ink-muted" style={{ height }}>
      {message}
    </div>
  )
}

export default ChartEmpty
