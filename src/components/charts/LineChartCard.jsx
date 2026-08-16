import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import Card, { CardHeader } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ChartTooltip from '@/components/charts/ChartTooltip'
import ChartLegend from '@/components/charts/ChartLegend'
import ChartEmpty from '@/components/charts/ChartEmpty'
import { AXIS_TICK_STYLE, GRID_COLOR, SERIES_COLORS } from '@/components/charts/chartColors'
import { formatNumber } from '@/lib/utils'

function LineChartCard({
  title,
  description,
  data,
  series,
  dataKeyX,
  valueFormatter = formatNumber,
  isLoading = false,
  error = null,
  onRetry,
  className,
}) {
  const legendItems = series.map((item, index) => ({
    label: item.label,
    color: item.color ?? SERIES_COLORS[index % SERIES_COLORS.length],
  }))

  return (
    <Card className={className}>
      <CardHeader title={title} description={description} action={<ChartLegend items={legendItems} />} />

      {isLoading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !data?.length ? (
        <ChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKeyX}
              tickLine={false}
              axisLine={false}
              tick={AXIS_TICK_STYLE}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip formatter={valueFormatter} />}
              cursor={{ stroke: GRID_COLOR }}
            />
            {series.map((item, index) => (
              <Line
                key={item.key}
                type="monotone"
                dataKey={item.key}
                name={item.label}
                stroke={item.color ?? SERIES_COLORS[index % SERIES_COLORS.length]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default LineChartCard
