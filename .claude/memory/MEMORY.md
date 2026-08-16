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
- 2026-08-16 — Lớp dữ liệu: `lib/endpoints.js` (toàn bộ URL), `lib/api.js` (axios + công tắc mock), `src/mocks/` (handlers + data), ví dụ `features/dashboard` và `features/users`. Lint sạch.

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

1. Nối `@tailwindcss/vite` vào `vite.config.js`, viết lại `src/index.css` với `@import "tailwindcss"` + block `@theme`.
2. Dọn template Vite (`App.jsx`, `App.css`, `assets/` thừa).
3. Dựng `AppShell` + `Sidebar` + `Topbar` theo ảnh thiết kế.
4. Trang Dashboard: 4 KPI card, line chart, donut, bar chart, bảng hoạt động gần đây (đã có sẵn hook trong `features/dashboard/hooks/useDashboard.js`).

## Điểm cần lưu ý

- `.db/SmartEnglishAI_db.txt` = schema PostgreSQL 8 service / 55 bảng, **gitignore, chỉ có trên máy local**. Là nguồn để lấy shape dữ liệu; đọc bằng `awk '/CREATE TABLE <schema>.<bảng>/,/^\);/'` chứ đừng đọc cả file (80KB).
- Đường dẫn trong `endpoints.js` là **dự kiến**, backend chưa chốt. Không coi là URL thật.
