import { Line, LineChart, ResponsiveContainer } from 'recharts'
import Skeleton from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'

function SparkLine({ data, dataKey = 'value', color = '#1D8FE1', height = 40, isLoading = false, className }) {
  if (isLoading) return <Skeleton className={cn('w-full', className)} style={{ height }} />
  if (!data?.length) return <div className={cn('w-full', className)} style={{ height }} />

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export default SparkLine
