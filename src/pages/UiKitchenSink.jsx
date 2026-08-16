import { useState } from 'react'
import { Eye, EyeOff, Mail, Plus, Users } from 'lucide-react'
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
import Pagination from '@/components/ui/Pagination'
import Avatar from '@/components/ui/Avatar'
import Tabs from '@/components/ui/Tabs'
import Switch from '@/components/ui/Switch'
import ProgressBar from '@/components/ui/ProgressBar'
import StatTile from '@/components/ui/StatTile'
import StatusDot from '@/components/ui/StatusDot'

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

        <Section title="13. Pagination">
          <Pagination page={page} totalPages={25} onChange={setPage} />
          <p className="mt-2 text-xs text-ink-muted">Trang hiện tại: {page} / 25</p>
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
      </div>
    </div>
  )
}

export default UiKitchenSink
