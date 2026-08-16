function ChartTooltip({ active, payload, label, formatter = (value) => value }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      {label && <p className="mb-1 text-xs font-medium text-ink-muted">{label}</p>}
      <div className="flex flex-col gap-1">
        {payload.map((entry) => (
          <div key={entry.dataKey ?? entry.name} className="flex items-center gap-2 text-sm">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-ink-muted">{entry.name}</span>
            <span className="ml-auto font-medium text-ink">
              {formatter(entry.value, entry)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ChartTooltip
