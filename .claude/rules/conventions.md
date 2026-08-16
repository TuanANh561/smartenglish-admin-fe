# Quy ước code

## Cấu trúc thư mục

```
src/
  components/
    ui/            # nguyên thủy dùng lại: Button, Card, Badge, Table, Modal
    layout/        # Sidebar, Topbar, AppShell
    charts/        # bọc recharts: LineChartCard, BarChartCard, DonutCard
  features/
    dashboard/     # mỗi feature: components/ + hooks/ + api.js
    students/
    revenue/
    settings/
  lib/
    api.js         # instance axios
    utils.js       # cn(), formatCurrency(), formatDate()
  store/           # zustand
  routes.jsx
  main.jsx
```

Component chỉ dùng ở một feature → để trong feature đó. Dùng ≥ 2 nơi mới nâng lên `components/ui/`.

## Đặt tên

- File component: `PascalCase.jsx`. Hook: `useTenHook.js`. Còn lại: `camelCase.js`.
- Export mặc định cho component, export tên cho hook/util.
- Không dùng `index.js` chỉ để re-export.

## React

- Function component + hooks. Không class.
- Props destructure ngay tại tham số.
- Gộp class bằng `cn()` (`clsx` + `tailwind-merge`) trong `lib/utils.js`.
- State server → TanStack Query. State UI toàn cục → Zustand. Còn lại → `useState` tại chỗ.
- Form → `react-hook-form` + `zod` qua `@hookform/resolvers`.
- Thông báo → `react-hot-toast`, nội dung tiếng Việt.

## Dữ liệu

Ba lớp, không được trộn vào nhau:

```
src/lib/endpoints.js   # CHỈ đường dẫn API. Mọi URL của dự án nằm ở đây.
src/lib/api.js         # axios instance + công tắc mock/thật (VITE_USE_MOCK)
src/mocks/             # dữ liệu giả, tạm thời — xoá cả thư mục khi có backend
src/features/*/api.js  # hàm gọi dữ liệu của từng feature
```

- Thêm endpoint mới → thêm vào `lib/endpoints.js` trước, không gõ chuỗi URL trong feature.
- Tham số động dùng `:ten` trong endpoint, truyền qua `path`:
  `api.get(ENDPOINTS.users.detail, { path: { id }, params: { page } })`.
- Feature **không** được biết đến `src/mocks` và không được `import axios` trực tiếp.
- Thêm dữ liệu giả → thêm vào `src/mocks/data/` rồi đăng ký khoá trong `src/mocks/handlers.js`
  (khoá lấy từ `ENDPOINTS`, không gõ tay).
- Mock phải trả đúng shape mà API thật sẽ trả (danh sách có phân trang → `{ items, total, page, size, totalPages }`).
- Query key dạng mảng: `['students', { page, search }]`.
- Mỗi khối dữ liệu phải xử lý đủ 3 trạng thái: đang tải (skeleton), rỗng, lỗi.
- Lỗi từ `api.js` luôn có shape `{ status, message, details }`, `message` đã là tiếng Việt — hiển thị thẳng.

## Định dạng hiển thị

- Tiền: `formatCurrency(45200000)` → `45.2Mđ` (rút gọn) hoặc `299.000đ` (đầy đủ), dùng `vi-VN`.
- Ngày: `date-fns` với locale `vi`.
- Thời gian tương đối: `2 phút trước`, `15 phút trước`.
- Số lớn: dấu phẩy ngăn nghìn (`28,400`) đúng như thiết kế.

## Không làm

- Không thêm TypeScript (dự án dùng JS thuần).
- Không tạo file barrel, không tạo abstraction cho thứ mới dùng 1 lần.
- Không comment giải thích code hiển nhiên.
