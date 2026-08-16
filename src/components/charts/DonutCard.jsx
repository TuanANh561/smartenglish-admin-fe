import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import Card, { CardHeader } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ChartTooltip from '@/components/charts/ChartTooltip'
import ChartEmpty from '@/components/charts/ChartEmpty'
import { OTHER_SLICE_COLOR, SERIES_COLORS } from '@/components/charts/chartColors'
import { formatPercent } from '@/lib/utils'

/** Gộp tối đa 3 hạng mục đầu, phần còn lại dồn vào lát "Khác". */
function buildSlices(data) {
  if (data.length <= 4) {
    return data.map((item, index) => ({
      ...item,
      color: item.color ?? (item.label === 'Khác' ? OTHER_SLICE_COLOR : SERIES_COLORS[index % 3]),
    }))
  }
  const top = data.slice(0, 3).map((item, index) => ({
    ...item,
    color: item.color ?? SERIES_COLORS[index],
  }))
  const otherValue = data.slice(3).reduce((sum, item) => sum + item.value, 0)
  return [...top, { label: 'Khác', value: otherValue, color: OTHER_SLICE_COLOR }]
}

function DonutCard({
  title,
  description,
  centerLabel,
  centerSubLabel,
  data,
  isLoading = false,
  error = null,
  onRetry,
  className,
}) {
  const slices = data ? buildSlices(data) : []
  const total = slices.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card className={className}>
      <CardHeader title={title} description={description} />

      {isLoading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !slices.length || total === 0 ? (
        <ChartEmpty />
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="label"
                  innerRadius="72%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((slice) => (
                    <Cell key={slice.label} fill={slice.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip formatter={(value) => formatPercent((value / total) * 100)} />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-lg font-bold text-navy-700">{centerLabel}</p>
              {centerSubLabel && <p className="text-xs text-ink-muted">{centerSubLabel}</p>}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {slices.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2 text-ink">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: slice.color }}
                  />
                  {slice.label}
                </span>
                <span className="font-medium text-ink">
                  {formatPercent((slice.value / total) * 100)}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  )
}

export default DonutCard
