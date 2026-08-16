# Memory — SmartEnglish Admin

> Đọc file này đầu tiên mỗi phiên. Cập nhật khi xong một hạng mục (`/checkpoint`). Giữ dưới 60 dòng.

## Bối cảnh

Dashboard quản trị nội bộ cho SmartEnglish AI (đồ án KLTN). Người dùng: quản trị viên. UI tiếng Việt, chỉ light mode.
Phạm vi: Dashboard tổng quan, Dữ liệu chi tiết, Học viên, Doanh thu, Voice AI Settings, Phân quyền, Cài đặt.

## Hiện trạng (2026-08-16)

- Repo này **chỉ là Admin Frontend**; hệ thống chia nhiều repo riêng (learner web Next.js, mobile RN, backend Spring Boot). README đã viết theo hướng đó.
- Đã có lớp dữ liệu (endpoints + api + mocks). `src/` vẫn còn template Vite (`App.jsx`, `App.css`, `assets/`) — **chưa có UI sản phẩm**.
- Dependencies đã cài đủ: react-router-dom 7, TanStack Query 5 + Table, zustand, recharts, react-hook-form + zod, axios, tailwind 4, lucide-react, papaparse, react-hot-toast, date-fns, monaco-editor, react-dropzone.
- Tailwind 4 **chưa được nối** vào `vite.config.js` (thiếu plugin `@tailwindcss/vite`) và `src/index.css` vẫn là CSS mặc định của template.

## Đã làm

- 2026-08-16 — Dựng bộ `.claude/`: rules (workflow, design-system, conventions), skills (admin-page, dashboard-chart, data-table), agents (ui-auditor, api-integrator), commands (checkpoint, new-page), memory. Palette rút từ ảnh thiết kế dashboard.
- 2026-08-16 — README theo hướng repo Admin riêng lẻ, có bảng các repo liên quan.
- 2026-08-16 — Lớp dữ liệu: `lib/endpoints.js` (toàn bộ URL), `lib/api.js` (axios + công tắc mock), `src/mocks/` (handlers + data), ví dụ `features/dashboard` và `features/users`. Lint sạch, 6/6 test xanh.
- 2026-08-16 — `.claude/prompts/giai-doan-giao-dien.md`: 19 prompt tự chứa để dựng giao diện theo giai đoạn, bám 8 ảnh thiết kế người dùng cung cấp.
- 2026-08-16 — GIAI ĐOẠN 0 xong: nối `@tailwindcss/vite` + alias `@` → `src` vào `vite.config.js`; `src/index.css` chỉ còn `@import "tailwindcss"` + `@theme` (13 token màu); xoá hết file template (`App.css`, `src/assets/*`, `public/icons.svg`); `lib/utils.js` (cn, formatCurrency, formatNumber, formatDate, formatRelativeTime, formatPercent — lưu ý `formatNumber`/phần thập phân của `formatCurrency`/`formatPercent` KHÔNG dùng `toLocaleString('vi-VN')` vì locale đó cho dấu phẩy thập phân/chấm nghìn ngược với thiết kế, phải tự làm tròn); `App.jsx` tạm hiện 13 ô màu + demo 6 hàm định dạng; `lib/utils.test.js` 10/10 xanh. Lint sạch, build qua.
- 2026-08-16 — GIAI ĐOẠN 1 xong: 19 nguyên thủy trong `src/components/ui/` (Button, Card+CardHeader, Badge, Input, Textarea, Select, SearchInput, FilterChip, Modal, Drawer, ConfirmDialog, Skeleton+SkeletonText+SkeletonCard, EmptyState, ErrorState, Pagination, Avatar, Tabs, Switch, ProgressBar, StatTile, StatusDot); `src/pages/UiKitchenSink.jsx` demo đủ 19 mục, gắn tạm vào `App.jsx`. Pagination rút gọn kiểu `1 2 3 … 25`; Modal/Drawer đóng bằng Esc + click nền, không backdrop-blur. Icon lucide toàn bộ size 18/strokeWidth 1.75. Màu warning/danger dùng hex badge trong design-system.md (`#A16207`, `#DC2626`) vì chưa có token @theme riêng. Lint sạch, build qua.
- 2026-08-16 — GIAI ĐOẠN 2 xong: `components/layout/Sidebar.jsx` (gradient navy-800→navy-900, 5 nhóm nav cuộn dọc, thẻ người dùng dính đáy), `Topbar.jsx` (tiêu đề/mô tả theo route qua `navConfig.js`, actions mặc định Calendar + Xuất CSV), `AppShell.jsx`, `AppShellLayout.jsx` (route layout dùng `<Outlet/>`), `PlaceholderPage.jsx`, `navConfig.js` (NAV_GROUPS + ROUTE_META, nguồn dữ liệu menu/tiêu đề duy nhất). `src/routes.jsx`: 17 route bọc AppShell (tạm PlaceholderPage) + `/ui` (kitchen-sink, đứng ngoài AppShell) + `*` → `pages/NotFound.jsx` tiếng Việt. `main.jsx` đổi sang `RouterProvider` + `QueryClientProvider` (retry 1, staleTime 30s, không refetch on focus) + `Toaster`. Xoá `src/App.jsx`. Lint sạch, build qua.

## Quyết định

- JS thuần, không TypeScript.
- Tailwind 4 khai báo màu bằng `@theme` trong `src/index.css` — không có `tailwind.config.js`.
- Palette chốt tại `.claude/rules/design-system.md`, là nguồn màu duy nhất.
- **Mock/API thật chuyển bằng `VITE_USE_MOCK` trong `.env`** (mặc định `true` = mock). Feature không biết mock tồn tại → khi có backend chỉ đổi env + sửa URL trong `endpoints.js`, không sửa code feature.
- Mock trả đúng shape API thật; danh sách phân trang dạng `{ items, total, page, size, totalPages }`.
- Lỗi chuẩn hoá thành `{ status, message, details }`, `message` sẵn tiếng Việt.

## Đang làm

Chưa có.

## Việc tiếp theo

Giai đoạn 0–1 đã xong. Tiếp tục giai đoạn 2 trong `.claude/prompts/giai-doan-giao-dien.md` (khung ứng dụng: Sidebar + Topbar + route, bám ảnh Dashboard gốc). Giai đoạn 0–6 là nền dùng chung, không được bỏ qua.

## Điểm cần lưu ý

- `.db/SmartEnglishAI_db.txt` = schema PostgreSQL 8 service / 55 bảng, **gitignore, chỉ có trên máy local**. Là nguồn để lấy shape dữ liệu; đọc bằng `awk '/CREATE TABLE <schema>.<bảng>/,/^\);/'` chứ đừng đọc cả file (80KB).
- Đường dẫn trong `endpoints.js` là **dự kiến**, backend chưa chốt. Không coi là URL thật.
