import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Eye, EyeOff, Mail, Plus, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card, { CardHeader } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import SearchInput from '@/components/ui/SearchInput'
import FilterChip from '@/components/ui/FilterChip'
import Modal from '@/components/ui/Modal'
import Drawer from '@/components/ui/Drawer'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Skeleton, { SkeletonCard, SkeletonText } from '@/components/ui/Skeleton'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination, { PaginationBar } from '@/components/ui/Pagination'
import Avatar from '@/components/ui/Avatar'
import Tabs from '@/components/ui/Tabs'
import Switch from '@/components/ui/Switch'
import ProgressBar from '@/components/ui/ProgressBar'
import StatTile from '@/components/ui/StatTile'
import StatusDot from '@/components/ui/StatusDot'
import LineChartCard from '@/components/charts/LineChartCard'
import BarChartCard from '@/components/charts/BarChartCard'
import DonutCard from '@/components/charts/DonutCard'
import SparkLine from '@/components/charts/SparkLine'
import MiniBarChart from '@/components/charts/MiniBarChart'
import DataTable from '@/components/ui/DataTable/DataTable'
import DataTableToolbar from '@/components/ui/DataTable/DataTableToolbar'
import FilterChipRow from '@/components/ui/DataTable/FilterChipRow'
import { useDataTable } from '@/components/ui/DataTable/useDataTable'
import { exportCsv } from '@/components/ui/DataTable/exportCsv'
import { getUsers } from '@/features/users/api'
import { userColumns, userCsvColumns } from '@/features/users/columns'
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils'

const LINE_DATA = [
  { day: 'T2', free: 820, premium: 320 },
  { day: 'T3', free: 900, premium: 380 },
  { day: 'T4', free: 860, premium: 410 },
  { day: 'T5', free: 940, premium: 450 },
  { day: 'T6', free: 1020, premium: 470 },
  { day: 'T7', free: 980, premium: 510 },
  { day: 'CN', free: 1100, premium: 560 },
]

const BAR_DATA = [
  { month: 'T3', revenue: 28_400_000 },
  { month: 'T4', revenue: 31_200_000 },
  { month: 'T5', revenue: 29_800_000 },
  { month: 'T6', revenue: 35_100_000 },
  { month: 'T7', revenue: 40_600_000 },
  { month: 'T8', revenue: 45_200_000 },
]

const DONUT_DATA = [
  { label: 'Từ vựng', value: 42 },
  { label: 'Luyện nói AI', value: 28 },
  { label: 'Bài kiểm tra', value: 18 },
  { label: 'Khác', value: 12 },
]

const SPARK_DATA = [4, 6, 5, 8, 7, 9, 12].map((value) => ({ value }))
const MINI_BAR_DATA = [3, 5, 4, 6, 8, 7, 9].map((value) => ({ value }))

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        {title}
      </h2>
      <Card>{children}</Card>
    </section>
  )
}

const ROLE_CHIPS = [
  { key: 'student', label: 'Học viên' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'admin', label: 'Quản trị viên' },
]

function DataTableSection() {
  const dataTable = useDataTable()
  const usersQuery = useQuery({
    queryKey: ['ui-demo', 'users', dataTable.params],
    queryFn: () => getUsers(dataTable.params),
  })

  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Bảng dữ liệu
      </h2>
      <Card>
        <CardHeader
          title="Danh sách học viên (demo DataTable)"
          description="Tìm kiếm, sắp xếp, chọn nhiều dòng, mở rộng dòng và xuất CSV — dữ liệu qua features/users/api.js"
        />

        <DataTableToolbar
          searchValue={dataTable.search}
          onSearchChange={dataTable.setSearch}
          searchPlaceholder="Tìm theo tên hoặc email..."
          actions={
            <Button
              size="sm"
              variant="secondary"
              icon={Download}
              onClick={() => exportCsv(usersQuery.data?.items ?? [], userCsvColumns, 'hoc-vien')}
            >
              Xuất CSV
            </Button>
          }
        >
          <FilterChipRow
            chips={ROLE_CHIPS}
            value={dataTable.filters.role}
            onChange={(value) => dataTable.setFilter('role', value)}
          />
        </DataTableToolbar>

        <div className="mt-4">
          <DataTable
            columns={userColumns}
            data={usersQuery.data?.items ?? []}
            isLoading={usersQuery.isLoading}
            error={usersQuery.error}
            onRetry={usersQuery.refetch}
            pagination={usersQuery.data}
            onPageChange={dataTable.setPage}
            sorting={dataTable.sorting}
            onSortingChange={dataTable.setSorting}
            emptyMessage="Chưa có học viên nào khớp bộ lọc"
            enableSelection
            expandable
            renderExpandedRow={(user) => (
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-ink-muted">Email xác thực</p>
                  <p className="text-ink">{user.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Mã học viên</p>
                  <p className="text-ink">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Ngày tạo</p>
                  <p className="text-ink">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Đăng nhập gần nhất</p>
                  <p className="text-ink">{formatRelativeTime(user.lastLoginAt)}</p>
                </div>
              </div>
            )}
          />
        </div>
      </Card>
    </section>
  )
}

function UiKitchenSink() {
  const [search, setSearch] = useState('')
  const [activeChip, setActiveChip] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [tab, setTab] = useState('overview')
  const [switchOn, setSwitchOn] = useState(true)
  const [page, setPage] = useState(1)

  return (
    <div className="min-h-screen bg-canvas p-6">
      <h1 className="text-2xl font-semibold text-navy-700">Bộ nguyên thuỷ giao diện</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Kitchen sink — liệt kê mọi thành phần dùng lại trong src/components/ui. Trang này sẽ
        không xuất hiện trong sản phẩm cuối.
      </p>

      <div className="mt-8">
        <Section title="1. Button">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button size="sm">Cỡ nhỏ</Button>
            <Button size="md">Cỡ vừa</Button>
            <Button icon={Plus}>Thêm mới</Button>
            <Button loading>Đang tải</Button>
            <Button disabled>Vô hiệu</Button>
            <Button fullWidth className="max-w-xs">
              Chiếm hết chiều rộng
            </Button>
          </div>
        </Section>

        <Section title="2. Card">
          <Card className="border-dashed">
            <CardHeader
              title="Tiêu đề thẻ"
              description="Mô tả ngắn cho nội dung bên trong."
              action={<Button size="sm">Hành động</Button>}
            />
            <p className="text-sm text-ink">Nội dung mẫu bên trong Card.</p>
          </Card>
        </Section>

        <Section title="3. Badge">
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Thành công</Badge>
            <Badge tone="info">Đã xong</Badge>
            <Badge tone="warning">Chờ xác thực</Badge>
            <Badge tone="danger">Thất bại</Badge>
            <Badge tone="neutral">Trung tính</Badge>
            <Badge tone="gold">GOLD MEMBER</Badge>
          </div>
        </Section>

        <Section title="4. Input / Textarea / Select">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Họ tên" placeholder="Nguyễn Văn A" hint="Nhập đầy đủ họ tên" />
            <Input label="Email" leadingIcon={Mail} placeholder="ten@vidu.com" />
            <Input
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              defaultValue="matkhau123"
              trailingAction={
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label="Hiện mật khẩu"
                  className="rounded-full p-1 text-ink-muted hover:bg-canvas hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff size={18} strokeWidth={1.75} />
                  ) : (
                    <Eye size={18} strokeWidth={1.75} />
                  )}
                </button>
              }
            />
            <Input
              label="Số điện thoại"
              defaultValue="0123"
              error="Số điện thoại không hợp lệ"
            />
            <Input label="Không dùng được" disabled defaultValue="Đã khoá" />
            <Select label="Vai trò" defaultValue="admin">
              <option value="admin">Quản trị viên</option>
              <option value="editor">Biên tập viên</option>
              <option value="viewer">Chỉ xem</option>
            </Select>
          </div>
          <div className="mt-4">
            <Textarea label="Ghi chú" placeholder="Nhập ghi chú..." hint="Tối đa 500 ký tự" />
          </div>
        </Section>

        <Section title="5. SearchInput">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm học viên theo tên hoặc email..."
            className="max-w-sm"
          />
        </Section>

        <Section title="6. FilterChip">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Tất cả' },
              { value: 'active', label: 'Đang hoạt động' },
              { value: 'locked', label: 'Đã khoá' },
              { value: 'gold', label: 'Gold Member' },
            ].map((chip) => (
              <FilterChip
                key={chip.value}
                active={activeChip === chip.value}
                onClick={() => setActiveChip(chip.value)}
              >
                {chip.label}
              </FilterChip>
            ))}
          </div>
        </Section>

        <Section title="7. Modal">
          <Button onClick={() => setModalOpen(true)}>Mở modal</Button>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Tiêu đề modal">
            <p className="text-sm text-ink">
              Đóng bằng phím Esc hoặc bấm ra vùng nền mờ bên ngoài hộp thoại.
            </p>
            <div className="mt-5 flex justify-end">
              <Button onClick={() => setModalOpen(false)}>Đóng</Button>
            </div>
          </Modal>
        </Section>

        <Section title="8. Drawer">
          <Button onClick={() => setDrawerOpen(true)}>Mở drawer</Button>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Chi tiết học viên">
            <p className="text-sm text-ink">
              Ngăn kéo trượt từ cạnh phải, đóng bằng Esc hoặc bấm nền mờ. Nội dung dài sẽ cuộn
              dọc bên trong.
            </p>
            <SkeletonText lines={6} className="mt-4" />
          </Drawer>
        </Section>

        <Section title="9. ConfirmDialog">
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>
            Xoá học viên
          </Button>
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => setConfirmOpen(false)}
            title="Xoá học viên?"
            description="Hành động này không thể hoàn tác. Toàn bộ dữ liệu học tập sẽ bị xoá."
            confirmText="Xoá"
          />
        </Section>

        <Section title="10. Skeleton">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Skeleton className="h-24 w-full" />
              <SkeletonText lines={3} className="mt-3" />
            </div>
            <SkeletonCard />
          </div>
        </Section>

        <Section title="11. EmptyState">
          <EmptyState
            icon={Users}
            title="Chưa có học viên nào"
            description="Thêm học viên mới để bắt đầu theo dõi."
            actionLabel="Thêm học viên"
            onAction={() => {}}
          />
        </Section>

        <Section title="12. ErrorState">
          <ErrorState
            error={{ status: 500, message: 'Không tải được dữ liệu từ máy chủ.' }}
            onRetry={() => {}}
          />
        </Section>

        <Section title="13. Pagination & PaginationBar">
          <div className="space-y-4">
            <PaginationBar page={page} pageSize={10} total={245} itemLabel="học viên" onChange={setPage} />
            <div className="pt-2">
              <Pagination page={page} totalPages={25} onChange={setPage} />
              <p className="mt-2 text-xs text-ink-muted">Trang hiện tại: {page} / 25</p>
            </div>
          </div>
        </Section>

        <Section title="14. Avatar">
          <div className="flex items-center gap-4">
            <Avatar name="Nguyễn Lan" size="sm" />
            <Avatar name="Trần Bảo" size="md" status="online" />
            <Avatar name="Phạm Khang" size="lg" />
          </div>
        </Section>

        <Section title="15. Tabs">
          <Tabs
            tabs={[
              { value: 'overview', label: 'Tổng quan' },
              { value: 'activity', label: 'Hoạt động' },
              { value: 'billing', label: 'Thanh toán' },
            ]}
            value={tab}
            onChange={setTab}
          />
          <p className="mt-3 text-sm text-ink-muted">Đang xem tab: {tab}</p>
        </Section>

        <Section title="16. Switch">
          <Switch checked={switchOn} onChange={setSwitchOn} label="Bật thông báo email" />
          <Switch checked={false} onChange={() => {}} disabled label="Không dùng được" className="mt-2" />
        </Section>

        <Section title="17. ProgressBar">
          <div className="flex flex-col gap-3">
            <ProgressBar value={40} />
            <ProgressBar value={85} />
            <ProgressBar value={100} />
          </div>
        </Section>

        <Section title="18. StatTile">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatTile label="Học viên" value="28,400" />
            <StatTile label="Tăng trưởng" value="+8.3%" tone="success" />
            <StatTile label="Rời bỏ" value="-2.1%" tone="danger" />
            <StatTile label="Doanh thu" value="45.2Mđ" tone="info" />
          </div>
        </Section>

        <Section title="19. StatusDot">
          <div className="flex flex-wrap gap-4">
            <StatusDot label="Miễn phí" color="#D6DFE8" />
            <StatusDot label="Premium" color="#29A8E8" />
            <StatusDot label="VNPay" color="#1D8FE1" />
            <StatusDot label="MoMo" color="#A16207" />
          </div>
        </Section>

        <section className="mb-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Biểu đồ
          </h2>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <LineChartCard
              title="Người dùng hoạt động"
              description="7 ngày gần nhất"
              data={LINE_DATA}
              dataKeyX="day"
              series={[
                { key: 'free', label: 'Free' },
                { key: 'premium', label: 'Premium' },
              ]}
            />
            <BarChartCard
              title="Doanh thu theo tháng"
              description="6 tháng gần nhất"
              data={BAR_DATA}
              dataKeyX="month"
              dataKeyY="revenue"
              highlightIndex={BAR_DATA.length - 1}
              valueFormatter={(value) => formatCurrency(value, { compact: true })}
            />
            <DonutCard
              title="Tính năng dùng nhiều nhất"
              description="Theo lượt sử dụng trong tháng"
              centerLabel="Top 4"
              centerSubLabel="tính năng"
              data={DONUT_DATA}
            />
            <Card>
              <CardHeader title="SparkLine & MiniBarChart" description="Nhúng trong thẻ KPI nhỏ" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-ink-muted">Học viên mới / ngày</p>
                  <p className="mt-1 text-xl font-bold text-navy-700">12</p>
                  <SparkLine data={SPARK_DATA} className="mt-2" />
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Bài nộp IELTS Writing / ngày</p>
                  <p className="mt-1 text-xl font-bold text-navy-700">9</p>
                  <MiniBarChart data={MINI_BAR_DATA} className="mt-2" />
                </div>
              </div>
            </Card>

            <LineChartCard
              title="Đang tải"
              description="Trạng thái isLoading"
              data={LINE_DATA}
              dataKeyX="day"
              series={[{ key: 'free', label: 'Free' }]}
              isLoading
            />
            <LineChartCard
              title="Không có dữ liệu"
              description="Trạng thái rỗng"
              data={[]}
              dataKeyX="day"
              series={[{ key: 'free', label: 'Free' }]}
            />
          </div>
        </section>

        <DataTableSection />
      </div>
    </div>
  )
}

export default UiKitchenSink
