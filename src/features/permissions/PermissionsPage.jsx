import { useMemo, useState } from 'react'
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
import { cn, formatNumber } from '@/lib/utils'
import { INITIAL_ROLES, PERMISSION_GROUPS } from '@/mocks/data/rolesPermissions'

const ICONS_MAP = {
  GraduationCap: GraduationCap,
  Sparkles: Sparkles,
  Wallet: Wallet,
  Shield: Shield,
}

function PermissionsPage() {
  const [roles, setRoles] = useState(INITIAL_ROLES)
  const [selectedRoleId, setSelectedRoleId] = useState('teacher')
  const [isSaving, setIsSaving] = useState(false)

  // Drawer tạo vai trò mới
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')
  const [newRoleCode, setNewRoleCode] = useState('')
  const [newRoleDesc, setNewRoleDesc] = useState('')
  const [cloneFromRole, setCloneFromRole] = useState('teacher')

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0]
  }, [roles, selectedRoleId])

  const handleTogglePermission = (permKey) => {
    if (!currentRole) return
    setRoles((prev) =>
      prev.map((role) => {
        if (role.id !== selectedRoleId) return role
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: !role.permissions[permKey],
          },
        }
      }),
    )
  }

  const handleSaveRolePermissions = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast.success(`Đã lưu cấu hình phân quyền cho vai trò "${currentRole?.name}"`)
    }, 500)
  }

  const handleResetDefaults = () => {
    const defaultRole = INITIAL_ROLES.find((r) => r.id === selectedRoleId)
    if (!defaultRole) return
    setRoles((prev) =>
      prev.map((r) => (r.id === selectedRoleId ? { ...r, permissions: { ...defaultRole.permissions } } : r)),
    )
    toast.success(`Đã khôi phục quyền mặc định cho "${currentRole?.name}"`)
  }

  const handleCreateRole = (e) => {
    e.preventDefault()
    if (!newRoleName.trim()) {
      toast.error('Vui lòng nhập tên vai trò')
      return
    }

    const baseRole = roles.find((r) => r.id === cloneFromRole) || roles[0]
    const newId = `role_${Date.now()}`
    const newRole = {
      id: newId,
      name: newRoleName.trim(),
      code: (newRoleCode || newRoleName).toUpperCase().replace(/\s+/g, '_'),
      description: newRoleDesc.trim() || 'Vai trò tùy chỉnh mới',
      userCount: 0,
      status: 'active',
      isSystem: false,
      permissions: { ...baseRole.permissions },
    }

    setRoles((prev) => [...prev, newRole])
    setSelectedRoleId(newId)
    setIsCreateOpen(false)
    setNewRoleName('')
    setNewRoleCode('')
    setNewRoleDesc('')
    toast.success(`Đã tạo vai trò mới "${newRole.name}"`)
  }

  const handleDeleteRole = (id, e) => {
    e.stopPropagation()
    const roleToDelete = roles.find((r) => r.id === id)
    if (roleToDelete?.isSystem) {
      toast.error('Không thể xoá vai trò mặc định của hệ thống')
      return
    }
    setRoles((prev) => prev.filter((r) => r.id !== id))
    if (selectedRoleId === id) {
      setSelectedRoleId('teacher')
    }
    toast.success(`Đã xoá vai trò "${roleToDelete?.name}"`)
  }

  return (
    <main className="flex-1 bg-canvas p-4 sm:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-700">Phân quyền hệ thống</h1>
          <p className="mt-0.5 text-sm text-ink-muted">
            Quản lý vai trò người dùng và cấu hình quyền truy cập chi tiết cho từng nhóm trong SmartEnglish AI Admin Portal.
          </p>
        </div>

        <Button icon={Plus} onClick={() => setIsCreateOpen(true)}>
          Tạo vai trò mới
        </Button>
      </div>

      {/* Master - Detail 2-Column Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Danh sách vai trò */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wide text-ink-muted">
              Danh sách vai trò ({roles.length})
            </span>
          </div>

          <div className="space-y-3">
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id

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
                      <h3 className="font-bold text-sm text-navy-700">{role.name}</h3>
                      <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {role.status === 'active' ? (
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700 border border-emerald-100">
                          Active
                        </span>
                      ) : (
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                          Inactive
                        </span>
                      )}

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRole(role.id, e)}
                          className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500 cursor-pointer"
                          title="Xoá vai trò"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-line flex items-center justify-between text-xs text-ink-muted">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} className="text-ink-muted" />
                      <strong>{formatNumber(role.userCount)}</strong> người dùng
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">
                      {role.code}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Chi tiết quyền */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 space-y-5 border border-line">
            {/* Header Box */}
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-700 text-white shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-navy-700">
                  Chi tiết quyền: {currentRole?.name}
                </h2>
                <p className="text-xs text-ink-muted">
                  Tùy chỉnh quyền hạn chi tiết cho nhóm người dùng này.
                </p>
              </div>
            </div>

            {/* Grouped Permission Panels */}
            <div className="space-y-4">
              {PERMISSION_GROUPS.map((group) => {
                const GroupIcon = ICONS_MAP[group.icon] || Shield

                return (
                  <div key={group.key} className="rounded-xl border border-line overflow-hidden bg-white shadow-xs">
                    {/* Panel Header */}
                    <div className="bg-slate-50/80 px-4 py-2.5 border-b border-line flex items-center gap-2">
                      <GroupIcon size={15} className="text-navy-700" />
                      <span className="text-xs font-bold text-navy-700 uppercase tracking-wide">
                        {group.title}
                      </span>
                    </div>

                    {/* Permission Items */}
                    <div className="divide-y divide-line/60">
                      {group.items.map((item) => {
                        const isEnabled = Boolean(currentRole?.permissions?.[item.key])

                        return (
                          <div
                            key={item.key}
                            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/40 transition-colors"
                          >
                            <span className={cn('text-xs', isEnabled ? 'font-medium text-navy-700' : 'text-slate-500')}>
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
              className="mt-1 text-xs"
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
            <Button type="submit" variant="primary" fullWidth icon={Plus}>
              Tạo Vai Trò
            </Button>
          </div>
        </form>
      </Drawer>
    </main>
  )
}

export default PermissionsPage
