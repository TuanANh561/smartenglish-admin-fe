import { useEffect, useMemo, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Copy,
  Globe,
  GraduationCap,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Drawer from '@/components/ui/Drawer'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Switch from '@/components/ui/Switch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn, formatNumber } from '@/lib/utils'
import { PERMISSION_GROUPS } from '@/mocks/data/rolesPermissions'
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  resetRoleDefaults,
} from './api'

const ICONS_MAP = {
  GraduationCap: GraduationCap,
  Sparkles: Sparkles,
  Wallet: Wallet,
  Shield: Shield,
}

// Tổng số quyền được cấu hình
const TOTAL_PERMISSIONS_COUNT = PERMISSION_GROUPS.reduce(
  (sum, g) => sum + (g.items?.length || 0),
  0,
)

function PermissionsPage() {
  const [roles, setRoles] = useState([])
  const [selectedRoleId, setSelectedRoleId] = useState('teacher')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Drawer tạo vai trò mới
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleCode, setNewRoleCode] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [cloneFromRole, setCloneFromRole] = useState('teacher')
  const [isCreating, setIsCreating] = useState(false)

  // Tải danh sách vai trò từ backend thật
  const loadRoles = async (preserveSelectedId = null) => {
    try {
      setIsLoading(true)
      const data = await getRoles()
      if (Array.isArray(data) && data.length > 0) {
        setRoles(data)
        const targetId = preserveSelectedId || selectedRoleId
        const exists = data.some((r) => r.id === targetId)
        setSelectedRoleId(exists ? targetId : data[0].id)
      } else {
        setRoles([])
      }
    } catch (err) {
      console.error('Lỗi khi tải vai trò phân quyền:', err)
      toast.error(err.message || 'Không thể tải danh sách vai trò từ máy chủ')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || null
  }, [roles, selectedRoleId])

  // Đếm số quyền đang được bật của vai trò hiện tại
  const grantedCount = useMemo(() => {
    if (!currentRole?.permissions) return 0
    return Object.values(currentRole.permissions).filter(Boolean).length
  }, [currentRole])

  const handleTogglePermission = (permKey) => {
    if (!currentRole) return
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: !role.permissions?.[permKey],
          },
        }
      }),
    )
  }

  // Bật/tắt nhanh toàn bộ quyền trong một nhóm
  const handleToggleGroup = (groupKey, shouldEnable) => {
    if (!currentRole) return
    const group = PERMISSION_GROUPS.find((g) => g.key === groupKey)
    if (!group) return

    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role
        const updatedPerms = { ...role.permissions }
        group.items.forEach((item) => {
          updatedPerms[item.key] = shouldEnable
        })
        return { ...role, permissions: updatedPerms }
      }),
    )
  }

  // Lưu cấu hình phân quyền xuống Backend thật
  const handleSaveRolePermissions = async () => {
    if (!currentRole) return
    try {
      setIsSaving(true)
      const updated = await updateRole(currentRole.id, {
        name: currentRole.name,
        description: currentRole.description,
        status: currentRole.status,
        permissions: currentRole.permissions,
      })
      if (updated) {
        setRoles((prev) =>
          prev.map((r) => (r.id === currentRole.id ? { ...r, ...updated } : r)),
        )
      }
      toast.success(`Đã lưu cấu hình phân quyền cho vai trò "${currentRole?.name}"`)
    } catch (err) {
      console.error('Lỗi lưu phân quyền:', err)
      toast.error(err.message || 'Không thể lưu phân quyền lên hệ thống')
    } finally {
      setIsSaving(false)
    }
  }

  // Khôi phục quyền mặc định từ Backend thật
  const handleResetDefaults = async () => {
    if (!currentRole) return
    try {
      setIsResetting(true)
      const updated = await resetRoleDefaults(selectedRoleId)
      if (updated) {
        setRoles((prev) =>
          prev.map((r) => (r.id === selectedRoleId ? { ...r, ...updated } : r)),
        )
      }
      toast.success(`Đã khôi phục quyền mặc định cho "${currentRole?.name}"`)
    } catch (err) {
      console.error('Lỗi khôi phục quyền mặc định:', err)
      toast.error(err.message || 'Không thể khôi phục quyền mặc định')
    } finally {
      setIsResetting(false)
    }
  }

  // Tạo vai trò mới lưu vào Database thật
  const handleCreateRole = async (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) {
      toast.error('Vui lòng nhập tên vai trò')
      return
    }

    try {
      setIsCreating(true)
      const created = await createRole({
        name: newRoleName.trim(),
        code: (newRoleCode || newRoleName).toUpperCase().replace(/\s+/g, '_'),
        description: newRoleDesc.trim() || 'Vai trò tùy chỉnh mới',
        cloneFromRole,
      })

      if (created) {
        setRoles((prev) => [...prev, created])
        setSelectedRoleId(created.id)
        setIsCreateOpen(false)
        setNewRoleName('')
        setNewRoleCode('')
        setNewRoleDesc('')
        toast.success(`Đã tạo vai trò mới "${created.name}" thành công!`)
      }
    } catch (err) {
      console.error('Lỗi tạo vai trò mới:', err)
      toast.error(err.message || 'Không thể tạo vai trò mới')
    } finally {
      setIsCreating(false)
    }
  }

  // Xóa vai trò tùy chỉnh khỏi Database thật
  const handleDeleteRole = async (id, e) => {
    e.stopPropagation()
    const roleToDelete = roles.find((r) => r.id === id)
    if (roleToDelete?.isSystem) {
      toast.error('Không thể xoá vai trò mặc định của hệ thống')
      return
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xoá vai trò "${roleToDelete?.name}" khỏi hệ thống không?`)) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteRole(id)
      setRoles((prev) => prev.filter((r) => r.id !== id))
      if (selectedRoleId === id) {
        setSelectedRoleId(roles.find((r) => r.id !== id)?.id || 'teacher')
      }
      toast.success(`Đã xoá vai trò "${roleToDelete?.name}" thành công`)
    } catch (err) {
      console.error('Lỗi xoá vai trò:', err)
      toast.error(err.message || 'Không thể xoá vai trò này')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Master - Detail 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Danh sách vai trò */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
                Danh sách vai trò ({roles.length})
              </span>
              <button
                type="button"
                onClick={() => loadRoles(selectedRoleId)}
                disabled={isLoading}
                title="Tải lại từ cơ sở dữ liệu"
                className="text-slate-400 hover:text-navy-700 transition-colors p-1"
              >
                <RefreshCw size={13} className={cn(isLoading && 'animate-spin')} />
              </button>
            </div>
            <Button size="sm" icon={Plus} onClick={() => setIsCreateOpen(true)}>
              Tạo vai trò mới
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-8 border border-line flex justify-center items-center">
              <LoadingSpinner size="md" text="Đang tải dữ liệu vai trò từ cơ sở dữ liệu..." />
            </Card>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const isSelected = selectedRoleId === role.id
                const roleGranted = Object.values(role.permissions || {}).filter(Boolean).length

                return (
                  <div
                    key={role.id}
                    onClick={() => setSelectedRoleId(role.id)}
                    className={cn(
                      'rounded-xl border p-4 transition-all cursor-pointer bg-white relative',
                      isSelected
                        ? 'border-brand-500 shadow-md ring-2 ring-brand-500/10'
                        : 'border-line hover:border-slate-300 hover:bg-slate-50/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-navy-700">{role.name}</h3>
                          {role.isSystem && (
                            <span className="rounded bg-sky-50 px-1.5 py-0.2 text-[10px] font-bold text-sky-700 border border-sky-100">
                              Hệ thống
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-muted mt-1 leading-relaxed line-clamp-2">
                          {role.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {role.status === 'active' ? (
                          <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-bold uppercase text-emerald-700 border border-emerald-100">
                            Active
                          </span>
                        ) : (
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase text-slate-500">
                            Inactive
                          </span>
                        )}

                        {!role.isSystem && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteRole(role.id, e)}
                            className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                            title="Xoá vai trò này"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-sm text-ink-muted">
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-ink-muted" />
                        <strong>{formatNumber(role.userCount || 0)}</strong> người dùng
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                          {roleGranted}/{TOTAL_PERMISSIONS_COUNT} quyền
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {role.code}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Chi tiết quyền */}
        <div className="lg:col-span-7 space-y-4">
          {isLoading ? (
            <Card className="p-12 border border-line flex justify-center items-center">
              <LoadingSpinner size="lg" text="Đang tải ma trận phân quyền..." />
            </Card>
          ) : !currentRole ? (
            <Card className="p-8 border border-line text-center text-ink-muted">
              Vui lòng chọn một vai trò để xem ma trận phân quyền.
            </Card>
          ) : (
            <Card className="p-5 space-y-5 border border-line">
              {/* Header Box */}
              <div className="flex items-center justify-between border-b border-line pb-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700 text-white shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-bold text-navy-700">
                        Chi tiết quyền: {currentRole?.name}
                      </h2>
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                        {currentRole?.code}
                      </span>
                    </div>
                    <p className="text-sm text-ink-muted">
                      Tùy chỉnh phân quyền chi tiết cho nhóm người dùng này.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {grantedCount} / {TOTAL_PERMISSIONS_COUNT} quyền được cấp
                  </span>
                </div>
              </div>

              {/* Grouped Permission Panels */}
              <div className="space-y-4">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = ICONS_MAP[group.icon] || Shield
                  const groupItems = group.items || []
                  const allGroupEnabled = groupItems.every(
                    (it) => currentRole?.permissions?.[it.key],
                  )

                  return (
                    <div
                      key={group.key}
                      className="rounded-xl border border-line overflow-hidden bg-white shadow-xs"
                    >
                      {/* Panel Header */}
                      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-line flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GroupIcon size={15} className="text-navy-700" />
                          <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                            {group.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleGroup(group.key, !allGroupEnabled)}
                            className="text-brand-600 hover:text-brand-700 font-semibold cursor-pointer"
                          >
                            {allGroupEnabled ? 'Tắt tất cả' : 'Bật tất cả'}
                          </button>
                        </div>
                      </div>

                      {/* Permission Items */}
                      <div className="divide-y divide-line/60">
                        {group.items.map((item) => {
                          const isEnabled = Boolean(
                            currentRole?.permissions?.[item.key],
                          )

                          return (
                            <div
                              key={item.key}
                              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/40 transition-colors"
                            >
                              <span
                                className={cn(
                                  'text-sm',
                                  isEnabled
                                    ? 'font-medium text-navy-700'
                                    : 'text-slate-500',
                                )}
                              >
                                {item.label}
                              </span>
                              <Switch
                                checked={isEnabled}
                                onChange={() => handleTogglePermission(item.key)}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                <Button
                  variant="secondary"
                  icon={RefreshCw}
                  loading={isResetting}
                  onClick={handleResetDefaults}
                  size="sm"
                >
                  Khôi phục mặc định
                </Button>
                <Button
                  variant="primary"
                  icon={Save}
                  loading={isSaving}
                  onClick={handleSaveRolePermissions}
                  size="sm"
                >
                  Lưu thay đổi
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Drawer Tạo Vai Trò Mới */}
      <Drawer
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo Vai Trò Mới"
        className="max-w-[440px]"
      >
        <form onSubmit={handleCreateRole} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Tên vai trò *
            </label>
            <Input
              placeholder="VD: Cố vấn học tập"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="mt-1 font-semibold"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Mã code định danh
            </label>
            <Input
              placeholder="VD: ACADEMIC_ADVISOR"
              value={newRoleCode}
              onChange={(e) => setNewRoleCode(e.target.value)}
              className="mt-1 font-mono uppercase"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Mô tả nhiệm vụ
            </label>
            <Input
              placeholder="Mô tả quyền hạn và trách nhiệm..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Sao chép quyền từ vai trò mẫu
            </label>
            <Select
              value={cloneFromRole}
              onChange={(e) => setCloneFromRole(e.target.value)}
              className="mt-1 text-sm font-medium"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.code})
                </option>
              ))}
            </Select>
          </div>

          <div className="flex gap-2 pt-4 border-t border-line">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setIsCreateOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isCreating}
              icon={Plus}
            >
              Tạo Vai Trò
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}

export default PermissionsPage
