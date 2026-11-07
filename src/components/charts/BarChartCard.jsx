import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card, { CardHeader } from '@/components/ui/Card'
import Skeleton from '@/components/ui/Skeleton'
import ErrorState from '@/components/ui/ErrorState'
import ChartTooltip from '@/components/charts/ChartTooltip'
import ChartEmpty from '@/components/charts/ChartEmpty'
import { AXIS_TICK_STYLE, GRID_COLOR, IDLE_COLOR } from '@/components/charts/chartColors'
import { formatNumber } from '@/lib/utils'

const HIGHLIGHT_COLOR = '#1B3A57'

function HighlightLabel({ x, y, width, value, index, highlightIndex, formatter }) {
  if (index !== highlightIndex || value == null) return null
  const text = formatter(value)
  const boxWidth = Math.max(46, text.length * 7 + 16)
  const boxHeight = 22
  const boxX = x + width / 2 - boxWidth / 2
  const boxY = y - boxHeight - 8

  return (
    <g>
      <rect x={boxX} y={boxY} width={boxWidth} height={boxHeight} rx={6} fill={HIGHLIGHT_COLOR} />
      <text
        x={x + width / 2}
        y={boxY + boxHeight / 2 + 4}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="#FFFFFF"
      >
        {text}
      </text>
    </g>
  )
}

function BarChartCard({
  title,
  description,
  action,
  data,
  dataKeyX,
  dataKeyY,
  highlightIndex,
  valueFormatter = formatNumber,
  isLoading = false,
  error = null,
  onRetry,
  className,
  barSize,
  maxBarSize = 52,
}) {
  // Tự động tính toán barSize tối ưu nếu không truyền vào: ít cột thì cột to dày dặn hơn
  const computedBarSize = barSize ?? (data && data.length <= 6 ? 48 : data && data.length <= 10 ? 38 : undefined)

  return (
    <Card className={className}>
      <CardHeader title={title} description={description} action={action} />

      {isLoading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : !data?.length ? (
        <ChartEmpty />
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={data}
            margin={{ top: 28, right: 12, left: 0, bottom: 0 }}
            barCategoryGap={data.length <= 6 ? '25%' : '15%'}
          >
            <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
            <XAxis dataKey={dataKeyX} tickLine={false} axisLine={false} tick={AXIS_TICK_STYLE} />
            <YAxis hide />
            <Tooltip content={<ChartTooltip formatter={valueFormatter} />} cursor={{ fill: 'transparent' }} />
            <Bar
              dataKey={dataKeyY}
              radius={[8, 8, 0, 0]}
              barSize={computedBarSize}
              maxBarSize={maxBarSize}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={index === highlightIndex ? HIGHLIGHT_COLOR : IDLE_COLOR} />
              ))}
              <LabelList
                dataKey={dataKeyY}
                content={(props) => (
                  <HighlightLabel {...props} highlightIndex={highlightIndex} formatter={valueFormatter} />
                )}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export default BarChartCard
