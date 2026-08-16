import { Hammer } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import { ROUTE_META } from '@/components/layout/navConfig'

function PlaceholderPage() {
  const { pathname } = useLocation()
  const meta = ROUTE_META[pathname] ?? { title: 'Màn hình này' }

  return (
    <Card>
      <EmptyState
        icon={Hammer}
        title="Màn hình đang được xây dựng"
        description={`"${meta.title}" sẽ sớm có mặt.`}
      />
    </Card>
  )
}

export default PlaceholderPage
