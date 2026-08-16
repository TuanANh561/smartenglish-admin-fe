---
name: data-table
description: Dựng bảng dữ liệu quản trị (danh sách học viên, giao dịch, hoạt động gần đây) với TanStack Table, phân trang, tìm kiếm, badge trạng thái và xuất CSV. Dùng khi cần hiển thị danh sách dạng bảng trong SmartEnglish Admin.
---

# Bảng dữ liệu

## Cấu trúc

```
Card
 ├ header: tiêu đề trái + hành động phải ("Xem tất cả ›", ô tìm kiếm, xuất CSV)
 ├ <div className="overflow-x-auto">  →  <table className="w-full text-sm">
 └ footer: phân trang (ẩn nếu chỉ 1 trang)
```

- `thead`: `text-xs uppercase tracking-wide text-ink-muted`, nền `bg-canvas`, không viền đậm.
- Hàng: `border-b border-line last:border-0`, hover `bg-canvas`.
- Ô: `px-4 py-3`, căn trái; cột số/tiền căn phải.
- Cột danh tính: avatar tròn 32px + tên (`font-medium text-navy-700`) + dòng phụ (`text-xs text-ink-muted`, ví dụ `B2 - Upper Intermediate`).

## Badge trạng thái

Dùng `<Badge tone="success|info|warning|danger">`, màu lấy từ `design-system.md`. Nhãn tiếng Việt: `Thành công`, `Đã xong`, `Chờ xác thực`, `Thất bại`.

## TanStack Table

- `getCoreRowModel` luôn có; thêm `getSortedRowModel` / `getFilteredRowModel` chỉ khi cần.
- Định nghĩa cột trong file riêng `columns.jsx` cạnh trang, dùng `columnHelper.accessor`.
- Phân trang: server-side nếu API hỗ trợ (`manualPagination: true`), ngược lại dùng `getPaginationRowModel`.
- Bảng chỉ đọc, ít hơn ~20 dòng, không sort → dùng `<table>` thuần, không cần TanStack Table.

## Trạng thái

- Đang tải: 5 hàng skeleton `bg-canvas animate-pulse`, giữ nguyên số cột.
- Rỗng: một hàng gộp cột, chữ căn giữa `text-ink-muted`, ví dụ `Chưa có dữ liệu`.
- Lỗi: thông báo + nút `Thử lại` gọi `refetch()`.

## Xuất CSV

Dùng `papaparse`:

```js
const csv = Papa.unparse(rows, { columns });
const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
```

BOM `﻿` là bắt buộc để Excel đọc đúng tiếng Việt. Tên file: `<mien>-<yyyy-MM-dd>.csv`.
