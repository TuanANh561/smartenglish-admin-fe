---
name: admin-page
description: Dựng một trang quản trị mới trong SmartEnglish Admin (Học viên, Doanh thu, Cài đặt, Phân quyền...). Dùng khi cần thêm route mới, trang danh sách, trang chi tiết, hoặc bố cục trang trong dashboard admin.
---

# Dựng trang admin mới

Đọc `.claude/rules/design-system.md` trước khi viết JSX.

## Bộ khung trang

Mọi trang nằm trong `AppShell` (Sidebar + vùng nội dung) và theo thứ tự:

1. **Header trang** — tiêu đề `text-2xl font-semibold text-navy-700`, mô tả phụ `text-sm text-ink-muted`, hành động chính đẩy sang phải (bộ lọc ngày, nút xuất CSV).
2. **Hàng KPI** (nếu có) — `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5`.
3. **Nội dung chính** — biểu đồ / bảng, `gap-5`.
4. **Footer** — chỉ ở `AppShell`, không lặp trong trang.

Khung: `<main className="flex-1 bg-canvas p-6 space-y-5">`.

## Các bước

1. Tạo `src/features/<ten>/` với `<Ten>Page.jsx`, `api.js`, `components/`.
2. Đăng ký route trong `src/routes.jsx`.
3. Thêm mục vào Sidebar (`components/layout/Sidebar.jsx`) — icon `lucide-react`, nhãn tiếng Việt, nhóm đúng section (`MENU` hoặc `CÀI ĐẶT HỆ THỐNG`).
4. Dữ liệu qua TanStack Query; chưa có API thì mock trong `features/<ten>/mock.js`.
5. Xử lý đủ trạng thái tải / rỗng / lỗi.

## KPI card

```jsx
<Card>
  <div className="flex items-start justify-between">
    <span className="rounded-lg bg-brand-500/10 p-2 text-brand-500"><Icon size={18} /></span>
    <Delta value={12} />           {/* xanh khi tăng, đỏ khi giảm */}
  </div>
  <p className="mt-4 text-sm text-ink-muted">{label}</p>
  <p className="mt-1 text-3xl font-bold text-navy-700">{value}</p>
</Card>
```

## Kiểm tra trước khi báo xong

- Nhãn, tiêu đề, thông báo đều tiếng Việt.
- Không hex lạ ngoài token.
- Responsive: KPI xếp chồng dưới `sm`, bảng cuộn ngang trong `overflow-x-auto`.
- `npm run lint` sạch.
- Ghi một dòng vào `.claude/memory/MEMORY.md`.
