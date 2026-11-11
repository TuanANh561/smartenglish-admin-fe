import { useEffect, useMemo, useState } from 'react'
import {
  BookOpen,
  Check,
  GraduationCap,
  RefreshCw,
  RotateCcw,
  Save,
  Settings,
  ShieldCheck,
  Smartphone,
  Table2,
  User,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Switch from '@/components/ui/Switch'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { cn } from '@/lib/utils'
import { useCtrlSave } from '@/hooks/useCtrlSave'
import { INITIAL_ROLES } from '@/mocks/data/rolesPermissions'
import {
  getRoles,
  updateRole as apiUpdateRole,
  resetRoleDefaults as apiResetRoleDefaults,
} from './permissionsApi'
import { STORAGE_KEY_ROLES } from '@/lib/rbac'

const PERMISSION_GROUPS = [
  {
    key: 'mobile_learning',
    title: 'Học tập & Trải nghiệm trên Mobile (Học viên & Khách)',
    icon: Smartphone,
    items: [
      { key: 'learn_flashcard', label: 'Học từ vựng & Thẻ ghi nhớ (Flashcard SRS)' },
      { key: 'learn_courses', label: 'Học bài giảng Khóa học (Ngữ pháp, Đọc, Nghe, Phát âm)' },
      { key: 'take_quiz_exam', label: 'Làm bài tập trắc nghiệm (Quiz) & Thi thử' },
      { key: 'use_ai_scan', label: 'Quét ảnh nhận diện từ vựng AI (AI Camera Scan)' },
      { key: 'join_class_submit', label: 'Tham gia lớp học, xem và nộp bài tập về nhà' },
      { key: 'use_community', label: 'Tham gia Cộng đồng, Bảng xếp hạng & Nhắn tin' },
    ],
  },
  {
    key: 'classes',
    title: 'Lớp học & Học viên (Giáo viên & Quản trị viên)',
    icon: GraduationCap,
    items: [
      { key: 'view_students', label: 'Xem danh sách học viên trong lớp' },
      { key: 'edit_students', label: 'Thêm, duyệt và cập nhật học viên' },
      { key: 'delete_students', label: 'Xóa học viên khỏi lớp học' },
      { key: 'create_classes', label: 'Tạo và quản lý lớp học' },
      { key: 'assign_homework', label: 'Giao bài tập và chấm điểm' },
    ],
  },
  {
    key: 'content_ai',
    title: 'Học liệu, Khóa học & Trợ lý AI',
    icon: BookOpen,
    items: [
      { key: 'access_ai_tools', label: 'Sử dụng trợ lý AI (Luyện nói Mascot, Chấm điểm & Tạo nội dung AI)' },
      { key: 'create_lessons', label: 'Quản lý khóa học và bài giảng (Từ vựng, Ngữ pháp, Đọc, Nghe, Phát âm)' },
      { key: 'publish_exams', label: 'Quản lý ngân hàng đề thi và bài kiểm tra' },
      { key: 'approve_public_content', label: 'Phê duyệt học liệu và nội dung công khai' },
    ],
  },
  {
    key: 'finance',
    title: 'Doanh thu & Gói dịch vụ',
    icon: Wallet,
    items: [
      { key: 'view_revenue', label: 'Xem doanh thu, lịch sử giao dịch và hóa đơn' },
      { key: 'manage_pricing', label: 'Quản lý gói dịch vụ Premium và mã giảm giá' },
    ],
  },
  {
    key: 'system',
    title: 'Hệ thống & Kiểm duyệt',
    icon: Settings,
    items: [
      { key: 'view_audit_logs', label: 'Xem nhật ký hoạt động' },
      { key: 'manage_reports', label: 'Xử lý báo cáo vi phạm và thông báo' },
      { key: 'manage_settings', label: 'Quản lý người dùng và cài đặt hệ thống' },
    ],
  },
]

const ROLE_META = {
  admin: {
    title: 'Quản trị viên',
    icon: ShieldCheck,
  },
  teacher: {
    title: 'Giáo viên',
    icon: GraduationCap,
  },
  student: {
    title: 'Học viên',
    icon: Users,
  },
  guest: {
    title: 'Khách vãng lai',
    icon: User,
  },
}

const TOTAL_PERMISSIONS_COUNT = 20

export default function PermissionsPage() {
  const [roles, setRoles] = useState(() => {
    try {
      localStorage.removeItem('smartenglish_admin_roles_v1')
      localStorage.removeItem('smartenglish_admin_roles_v2')
      localStorage.removeItem('se_system_roles')

      const saved = localStorage.getItem(STORAGE_KEY_ROLES)
      if (saved && !saved.includes('28394') && !saved.includes('1542')) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length >= 4) return parsed
      }
    } catch (_) {}
    return INITIAL_ROLES
  })

  const [activeTab, setActiveTab] = useState('roles') // 'roles' | 'matrix'
  const [selectedRoleId, setSelectedRoleId] = useState('teacher')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const loadRoles = async (preserveSelectedId = null) => {
    setIsLoading(true)
    try {
      const res = await getRoles()
      const data = Array.isArray(res) ? res : res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        setRoles(data)
        const targetId = preserveSelectedId || selectedRoleId
        const exists = data.some((r) => r.id === targetId)
        setSelectedRoleId(exists ? targetId : data[0].id)
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(data))
        setIsLoading(false)
        return
      }
    } catch (err) {
      console.warn('Lỗi tải vai trò từ máy chủ:', err)
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY_ROLES)
      if (saved && !saved.includes('28394')) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length >= 4) {
          setRoles(parsed)
          setIsLoading(false)
          return
        }
      }
    } catch (_) {}

    setRoles(INITIAL_ROLES)
    setIsLoading(false)
  }

  useEffect(() => {
    loadRoles()
  }, [])

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || roles[0] || null
  }, [roles, selectedRoleId])

  const roleMeta = ROLE_META[currentRole?.id] || ROLE_META.teacher

  const enabledCount = useMemo(() => {
    if (!currentRole?.permissions) return 0
    return Object.values(currentRole.permissions).filter(Boolean).length
  }, [currentRole])

  const handleTogglePermissionForRole = (roleId, permKey) => {
    if (!roleId || roleId === 'admin') return

    setRoles((prev) => {
      const next = prev.map((role) => {
        if (role.id !== roleId) return role
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permKey]: !role.permissions?.[permKey],
          },
        }
      })
      try {
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  const handleTogglePermission = (permKey) => {
    handleTogglePermissionForRole(selectedRoleId, permKey)
  }

  const handleToggleGroup = (groupKey, shouldEnable) => {
    if (!currentRole || currentRole.id === 'admin') return
    const group = PERMISSION_GROUPS.find((g) => g.key === groupKey)
    if (!group) return

    setRoles((prev) => {
      const next = prev.map((role) => {
        if (role.id !== selectedRoleId) return role
        const updatedPerms = { ...role.permissions }
        group.items.forEach((item) => {
          updatedPerms[item.key] = shouldEnable
        })
        return { ...role, permissions: updatedPerms }
      })
      try {
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(next))
      } catch (_) {}
      return next
    })
  }

  const handleSavePermissions = async () => {
    setIsSaving(true)
    try {
      if (activeTab === 'matrix') {
        const editableRoles = roles.filter((r) => r.id !== 'admin')
        await Promise.all(
          editableRoles.map((role) =>
            apiUpdateRole(role.id, {
              name: role.name,
              description: role.description,
              status: role.status || 'active',
              dataScope: role.dataScope || 'SELF',
              permissions: role.permissions,
            }),
          ),
        )
        localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles))
        window.dispatchEvent(new Event('smartenglish:permissions-updated'))
        toast.success('Đã lưu toàn bộ ma trận phân quyền')
        await loadRoles(selectedRoleId)
        return
      }

      if (!currentRole || currentRole.id === 'admin') return
      await apiUpdateRole(currentRole.id, {
        name: currentRole.name,
        description: currentRole.description,
        status: currentRole.status || 'active',
        dataScope: currentRole.dataScope || 'SELF',
        permissions: currentRole.permissions,
      })

      localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(roles))
      window.dispatchEvent(new Event('smartenglish:permissions-updated'))
      toast.success(`Đã lưu phân quyền cho ${roleMeta.title}`)
      await loadRoles(currentRole.id)
    } catch (err) {
      console.error('Lỗi lưu phân quyền:', err)
      toast.error(`Không thể lưu thay đổi: ${err.message || 'Lỗi kết nối máy chủ'}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetDefaults = async () => {
    if (!currentRole || currentRole.id === 'admin') return
    setIsResetting(true)
    try {
      await apiResetRoleDefaults(currentRole.id)
      await loadRoles(currentRole.id)
      window.dispatchEvent(new Event('smartenglish:permissions-updated'))
      toast.success(`Đã khôi phục mặc định cho ${roleMeta.title}`)
    } catch (_) {
      const defaultRole = INITIAL_ROLES.find((r) => r.id === selectedRoleId)
      if (defaultRole) {
        setRoles((prev) => {
          const next = prev.map((r) =>
            r.id === selectedRoleId
              ? {
                  ...r,
                  permissions: { ...defaultRole.permissions },
                }
              : r,
          )
          localStorage.setItem(STORAGE_KEY_ROLES, JSON.stringify(next))
          window.dispatchEvent(new Event('smartenglish:permissions-updated'))
          return next
        })
      }
      toast.success(`Đã khôi phục mặc định cho ${roleMeta.title}`)
    } finally {
      setIsResetting(false)
    }
  }

  useCtrlSave(handleSavePermissions, !isSaving && (activeTab === 'matrix' || currentRole?.id !== 'admin'))

  const orderedRolesForMatrix = useMemo(() => {
    const order = ['guest', 'student', 'teacher', 'admin']
    return order
      .map((id) => roles.find((r) => r.id === id))
      .filter(Boolean)
  }, [roles])

  return (
    <div className="space-y-5 max-w-6xl mx-auto pb-12">
      {/* Thanh chuyển chế độ xem: Theo vai trò vs Bảng ma trận */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-line bg-white p-1 shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs transition-all cursor-pointer',
              activeTab === 'roles'
                ? 'bg-navy-800 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium',
            )}
          >
            <ShieldCheck size={14} />
            Cấu hình theo vai trò
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs transition-all cursor-pointer',
              activeTab === 'matrix'
                ? 'bg-navy-800 text-white font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 font-medium',
            )}
          >
            <Table2 size={14} />
            Ma trận phân quyền (4 vai trò)
          </button>
        </div>

        {activeTab === 'matrix' && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={isLoading}
              disabled={isLoading || isSaving}
              onClick={() => loadRoles(selectedRoleId)}
            >
              Làm mới
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Save}
              loading={isSaving}
              disabled={isSaving}
              onClick={handleSavePermissions}
              title="Lưu toàn bộ ma trận (Ctrl + S)"
              className="px-4 text-xs font-semibold"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'matrix' ? (
        <Card className="border border-line bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-line bg-slate-50/80">
                  <th className="py-3.5 px-5 text-xs font-bold uppercase tracking-wider text-slate-600 min-w-[300px]">
                    Chức năng hệ thống (Mobile & Web)
                  </th>
                  {orderedRolesForMatrix.map((r) => {
                    const meta = ROLE_META[r.id] || ROLE_META.teacher
                    const count =
                      r.id === 'admin'
                        ? TOTAL_PERMISSIONS_COUNT
                        : Object.values(r.permissions || {}).filter(Boolean).length
                    return (
                      <th key={r.id} className="py-3.5 px-4 text-center min-w-[130px]">
                        <div className="text-xs font-bold text-slate-900">{meta.title}</div>
                        <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                          {count}/{TOTAL_PERMISSIONS_COUNT} quyền
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {PERMISSION_GROUPS.map((group) => {
                  const GroupIcon = group.icon
                  return (
                    <FragmentGroup
                      key={group.key}
                      group={group}
                      GroupIcon={GroupIcon}
                      roles={orderedRolesForMatrix}
                      onToggle={handleTogglePermissionForRole}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-line bg-slate-50/40">
            <Button
              type="button"
              variant="primary"
              size="sm"
              icon={Save}
              loading={isSaving}
              disabled={isSaving}
              onClick={handleSavePermissions}
              title="Lưu toàn bộ ma trận (Ctrl + S)"
              className="px-5 text-xs font-semibold"
            >
              {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
            </Button>
          </div>
        </Card>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* CỘT TRÁI: DANH SÁCH VAI TRÒ */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="p-2.5 border border-line bg-white shadow-xs">
            <div className="flex items-center justify-between px-2.5 py-2 mb-1 border-b border-line">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Vai trò hệ thống ({roles.length})
              </p>
              <button
                type="button"
                onClick={() => loadRoles(selectedRoleId)}
                disabled={isLoading}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Làm mới dữ liệu"
              >
                <RefreshCw size={13} className={cn(isLoading && 'animate-spin text-brand-600')} />
              </button>
            </div>

            {isLoading ? (
              <div className="py-8 flex justify-center items-center">
                <LoadingSpinner size="sm" text="Đang tải..." />
              </div>
            ) : (
              <div className="space-y-1">
                {roles.map((role) => {
                  const isSelected = selectedRoleId === role.id
                  const meta = ROLE_META[role.id] || ROLE_META.teacher
                  const RoleIcon = meta.icon
                  const activePermsCount =
                    role.id === 'admin'
                      ? TOTAL_PERMISSIONS_COUNT
                      : Object.values(role.permissions || {}).filter(Boolean).length

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => setSelectedRoleId(role.id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2.5 px-3.5 py-3 rounded-xl text-xs transition-all cursor-pointer text-left',
                        isSelected
                          ? 'bg-navy-800 text-white shadow-sm font-bold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-navy-900 font-medium',
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <RoleIcon
                          size={16}
                          className={cn('shrink-0', isSelected ? 'text-white' : 'text-slate-400')}
                        />
                        <div className="min-w-0">
                          <div className="truncate">{meta.title}</div>
                          <div
                            className={cn(
                              'text-[11px] font-normal truncate mt-0.5',
                              isSelected ? 'text-slate-300' : 'text-slate-400',
                            )}
                          >
                            {role.id === 'guest'
                              ? 'Khách dùng thử'
                              : `${role.userCount ?? 0} tài khoản`}
                          </div>
                        </div>
                      </div>

                      <span
                        className={cn(
                          'rounded-lg px-2 py-0.5 text-[11px] font-semibold shrink-0',
                          isSelected
                            ? 'bg-white/15 text-white'
                            : 'bg-slate-100 text-slate-600',
                        )}
                      >
                        {activePermsCount}/{TOTAL_PERMISSIONS_COUNT}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* CỘT PHẢI: DANH SÁCH CHỨC NĂNG */}
        <div className="lg:col-span-8 space-y-4">
          {currentRole && (
            <Card className="p-6 border border-line bg-white shadow-xs space-y-6">
              {/* Header Vai trò */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div className="flex items-center gap-2.5">
                  {(() => {
                    const IconComponent = roleMeta.icon
                    return <IconComponent size={18} className="text-slate-600 shrink-0" />
                  })()}
                  <h3 className="text-base font-bold text-slate-900">{roleMeta.title}</h3>
                  <span className="text-xs text-slate-400 font-medium">
                    ({currentRole.id === 'admin' ? TOTAL_PERMISSIONS_COUNT : enabledCount}/{TOTAL_PERMISSIONS_COUNT} quyền)
                  </span>
                </div>

                {currentRole.id !== 'admin' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      icon={RotateCcw}
                      loading={isResetting}
                      disabled={isResetting || isSaving}
                      onClick={handleResetDefaults}
                      title="Khôi phục mặc định"
                    >
                      Khôi phục mặc định
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      icon={Save}
                      loading={isSaving}
                      disabled={isSaving}
                      onClick={handleSavePermissions}
                      title="Lưu cài đặt (Ctrl + S)"
                      className="px-4 text-xs font-semibold"
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Nhóm chức năng */}
              <div className="space-y-6">
                {PERMISSION_GROUPS.map((group) => {
                  const allChecked = group.items.every((it) => currentRole.permissions?.[it.key])
                  const noneChecked = group.items.every((it) => !currentRole.permissions?.[it.key])
                  const GroupIcon = group.icon

                  return (
                    <div key={group.key} className="space-y-2">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <GroupIcon size={15} className="text-slate-500 shrink-0" />
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {group.title}
                          </h4>
                        </div>

                        {currentRole.id !== 'admin' && (
                          <div className="flex items-center gap-2 text-xs">
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(group.key, true)}
                              disabled={allChecked}
                              className={cn(
                                'text-[11px] font-semibold transition-colors cursor-pointer',
                                allChecked ? 'text-slate-300 cursor-default' : 'text-brand-600 hover:underline',
                              )}
                            >
                              Bật tất cả
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => handleToggleGroup(group.key, false)}
                              disabled={noneChecked}
                              className={cn(
                                'text-[11px] font-semibold transition-colors cursor-pointer',
                                noneChecked ? 'text-slate-300 cursor-default' : 'text-slate-500 hover:text-slate-800 hover:underline',
                              )}
                            >
                              Tắt tất cả
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100">
                        {group.items.map((item) => {
                          const isAdminRole = currentRole.id === 'admin'
                          const isChecked = isAdminRole ? true : Boolean(currentRole.permissions?.[item.key])

                          return (
                            <div
                              key={item.key}
                              className="flex items-center justify-between py-2.5 px-1 hover:bg-slate-50/60 rounded-lg transition-colors"
                            >
                              <label
                                htmlFor={`switch-${item.key}`}
                                className="text-xs font-medium text-slate-800 cursor-pointer pr-4 select-none"
                              >
                                {item.label}
                              </label>

                              <Switch
                                id={`switch-${item.key}`}
                                checked={isChecked}
                                onChange={() => handleTogglePermission(item.key)}
                                disabled={isAdminRole}
                              />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Thanh nút lưu dưới cùng đồng bộ với trang Cài đặt */}
              {currentRole.id !== 'admin' && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    icon={RotateCcw}
                    loading={isResetting}
                    disabled={isResetting || isSaving}
                    onClick={handleResetDefaults}
                  >
                    Khôi phục mặc định
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    icon={Save}
                    loading={isSaving}
                    disabled={isSaving}
                    onClick={handleSavePermissions}
                    title="Lưu cài đặt (Ctrl + S)"
                    className="px-5 text-xs font-semibold"
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu (Ctrl + S)'}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
      )}
    </div>
  )
}

function FragmentGroup({ group, GroupIcon, roles, onToggle }) {
  return (
    <>
      <tr className="bg-slate-50/70">
        <td colSpan={roles.length + 1} className="py-2.5 px-5">
          <div className="flex items-center gap-2">
            <GroupIcon size={14} className="text-slate-500 shrink-0" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
              {group.title}
            </span>
          </div>
        </td>
      </tr>
      {group.items.map((item) => (
        <tr key={item.key} className="hover:bg-slate-50/60 transition-colors">
          <td className="py-3 px-5 text-xs font-medium text-slate-800">
            {item.label}
          </td>
          {roles.map((r) => {
            const isAdmin = r.id === 'admin'
            const checked = isAdmin ? true : Boolean(r.permissions?.[item.key])
            return (
              <td key={`${r.id}-${item.key}`} className="py-3 px-4 text-center">
                <button
                  type="button"
                  id={`matrix-${r.id}-${item.key}`}
                  role="checkbox"
                  aria-checked={checked}
                  aria-label={`${item.label} - ${r.name || r.id}`}
                  title={isAdmin ? 'Quản trị viên luôn có toàn quyền' : checked ? 'Đang cấp quyền' : 'Chưa cấp quyền'}
                  onClick={() => onToggle(r.id, item.key)}
                  disabled={isAdmin}
                  className={cn(
                    'inline-flex h-7 w-7 items-center justify-center rounded-lg border transition-colors',
                    checked
                      ? 'border-[#15803D]/30 bg-[#DCFCE7] text-[#15803D]'
                      : 'border-line bg-white text-slate-400',
                    isAdmin ? 'cursor-not-allowed opacity-60' : checked ? 'hover:border-[#15803D]' : 'hover:border-slate-300 hover:text-slate-500',
                  )}
                >
                  {checked ? <Check size={16} strokeWidth={2.5} /> : <X size={16} strokeWidth={2.25} />}
                </button>
              </td>
            )
          })}
        </tr>
      ))}
    </>
  )
}
