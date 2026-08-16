import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts'
import Skeleton from '@/components/ui/Skeleton'
import { IDLE_COLOR } from '@/components/charts/chartColors'
import { cn } from '@/lib/utils'

function MiniBarChart({
  data,
  dataKey = 'value',
  color = '#1D8FE1',
  height = 40,
  isLoading = false,
  className,
}) {
  if (isLoading) return <Skeleton className={cn('w-full', className)} style={{ height }} />
  if (!data?.length) return <div className={cn('w-full', className)} style={{ height }} />

  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      <BarChart data={data}>
        <Bar dataKey={dataKey} radius={[2, 2, 0, 0]} isAnimationActive={false}>
          {data.map((_, index) => (
            <Cell key={index} fill={index === data.length - 1 ? color : IDLE_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default MiniBarChart
