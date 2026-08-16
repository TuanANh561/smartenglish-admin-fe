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
- 2026-08-16 — GIAI ĐOẠN 3 xong (đăng nhập + JWT access/refresh token giả lập, theo yêu cầu riêng — xem "Quyết định"): `mocks/tokenUtils.js` (token JWT giả, payload `{sub, role, type, iat, exp}` base64, không chữ ký thật); mock `auth.login/refresh/me/logout` trong `handlers.js`; `lib/api.js` tự bắt 401 → xin access token mới bằng refresh token → gọi lại request một lần, hết hạn cả hai thì xoá token + phát sự kiện `se-admin:unauthorized`; `store/authStore.js` (zustand, chỉ giữ `user`+`initialized`, nghe sự kiện trên); `features/auth/api.js`, `features/auth/hooks/useAuth.js` (useLogin, useLogout, useInitAuth), `features/auth/LoginPage.jsx` (react-hook-form + zod, lỗi sai tài khoản hiện trong form qua `setError('root', ...)`, không dùng toast); `components/layout/ProtectedRoute.jsx` (chờ `useInitAuth` xong mới quyết định redirect, nhớ `location` để quay lại sau đăng nhập); `routes.jsx`: `/dang-nhap` đứng ngoài, còn lại bọc `ProtectedRoute` → `AppShellLayout`; Sidebar nối nút đăng xuất qua `ConfirmDialog` + hiện tên người dùng thật. Thêm 4 test mock JWT vào `lib/api.test.js` (đăng nhập đúng/sai, refresh còn hạn/hết hạn). `lib/api.js` phải bọc `localStorage` qua biến `storage` (null khi không có `window`) vì vitest chạy môi trường Node không có `localStorage`/`window`. Lint sạch, 20/20 test xanh, build qua.
- 2026-08-16 — GIAI ĐOẠN 4 xong: bộ biểu đồ dùng chung trong `src/components/charts/` — `ChartTooltip.jsx` (tự viết, không dùng tooltip mặc định recharts), `ChartLegend.jsx`, `ChartEmpty.jsx`, `chartColors.js` (màu chuỗi dùng chung: navy-700→brand-400→brand-200, `#EEF3F7` cho lát "Khác"), `LineChartCard.jsx`, `BarChartCard.jsx` (nhãn hộp navy-700 phía trên cột `highlightIndex`, vẽ bằng SVG `<g>` qua `LabelList content`), `DonutCard.jsx` (vòng mảnh, tối đa 4 lát, chữ giữa đè bằng div `absolute`), `SparkLine.jsx`, `MiniBarChart.jsx`. 5 component card (Line/Bar/Donut/Spark/MiniBar) đều nhận `isLoading` (Skeleton) và `error` (ErrorState, riêng Spark/MiniBar bỏ qua vì quá nhỏ). `/ui` có mục "Biểu đồ" demo đủ 8 + ví dụ isLoading/rỗng. Lint sạch, build qua (bundle to hơn hẳn do recharts — chỉ là cảnh báo, không lỗi).
- 2026-08-16 — GIAI ĐOẠN 5 xong: `features/dashboard/DashboardPage.jsx` ráp 5 khối (KPI ×4, Line+Donut, Bar doanh thu, bảng hoạt động gần đây) dùng nguyên `hooks/useDashboard.js` có sẵn, mỗi khối tự xử lý loading/rỗng/lỗi qua props của `charts/*` và `ui/*`. `features/dashboard/components/KpiCard.jsx` (icon góc trái nền `brand-500/10`, mũi tên `ArrowUpRight`/`ArrowDownRight` xanh `#15803D`/đỏ `#DC2626` góc phải), `RecentActivityCard.jsx` (bảng 5 cột, header `bg-canvas` chữ hoa, badge trạng thái map `success/done/pending/failed`, cuộn ngang `overflow-x-auto` + `min-w-[640px]`, link "Xem tất cả" → `/hoc-vien`). Thêm prop `action` cho `BarChartCard` (chữ tổng doanh thu góc phải header, trước đó chỉ có title/description). `navConfig.js` cập nhật `ROUTE_META['/']` đúng tiêu đề/mô tả ảnh gốc. `routes.jsx`: route `index` trỏ `DashboardPage` thay `PlaceholderPage`. Lint sạch, 20/20 test xanh, build qua.

## Quyết định

- JS thuần, không TypeScript.
- Tailwind 4 khai báo màu bằng `@theme` trong `src/index.css` — không có `tailwind.config.js`.
- Palette chốt tại `.claude/rules/design-system.md`, là nguồn màu duy nhất.
- **Mock/API thật chuyển bằng `VITE_USE_MOCK` trong `.env`** (mặc định `true` = mock). Feature không biết mock tồn tại → khi có backend chỉ đổi env + sửa URL trong `endpoints.js`, không sửa code feature.
- Mock trả đúng shape API thật; danh sách phân trang dạng `{ items, total, page, size, totalPages }`.
- Lỗi chuẩn hoá thành `{ status, message, details }`, `message` sẵn tiếng Việt.
- **Xác thực dùng mô hình JWT access + refresh token** (đổi so với bản kế hoạch gốc trong `giai-doan-giao-dien.md` — bản đó chỉ có 1 `token` duy nhất). Login trả `{ accessToken, refreshToken, user }`, không phải `{ token, user }`. localStorage 2 khoá: `se_admin_token` (access) — **giữ nguyên tên cũ, đừng đổi** — và `se_admin_refresh_token` (mới). Access token sống 15 phút, refresh 7 ngày (chỉnh ở `mocks/handlers.js`). Khi backend thật thay mock: chỉ cần trả đúng 2 shape trên (`login`→3 field kèm token thật, `refresh`→2 token mới), không sửa gì ở `features/auth`, `store/authStore.js` hay `ProtectedRoute`.

- 2026-08-16 — Sinh động hoá riêng DashboardPage (theo yêu cầu người dùng — chỉ phạm vi Dashboard, KHÔNG đụng ui/charts dùng chung): `KpiCard.jsx` thêm prop `tone` (brand/navy/success/gold — 4 màu nhấn khác nhau cho 4 chỉ số, vẫn trong palette), viền trái `border-l-[3px]` theo tone, chip đổi màu nền cho phần trăm tăng/giảm, hover nhẹ nhấc shadow. `DashboardPage.jsx` thêm eyebrow "Tổng quan/Xu hướng & phân tích/Chi tiết" trên từng khối, và truyền `title` dạng JSX (icon + chữ) cho `LineChartCard`/`BarChartCard`/`DonutCard` — làm được mà KHÔNG sửa file component biểu đồ dùng chung vì `CardHeader` vốn chỉ render `{title}` nguyên trạng. `RecentActivityCard.jsx` thêm icon cạnh tiêu đề, hover hàng bảng, viền nhẹ quanh Avatar. Lint sạch, build qua.

- 2026-08-16 — GIAI ĐOẠN 6 xong: Bộ DataTable dùng chung TanStack Table v9 (`useTable` + `rowSortingFeature` manual) không dùng rowSelectionFeature/rowExpandingFeature vì đơn giản hơn. `DataTable.jsx` (sắp xếp 1 cột, chọn nhiều dòng, mở rộng dòng, loading/error/empty), `DataTableToolbar.jsx` (tìm kiếm debounce 300ms + slot filter/actions), `FilterChipRow.jsx` (chip nhanh), `useDataTable.js` (gom state → `params` đúng shape API), `exportCsv.js` (CSV + BOM UTF-8). `features/users/columns.jsx` (7 cột + CSV columns riêng). Test thêm sắp xếp asc/desc, 21/21 xanh.
- 2026-08-16 — GIAI ĐOẠN 7–8 xong: Hai trang danh sách. (7) `StudentsPage.jsx` — dùng DataTable + filter vai trò, tìm kiếm tên/email, mở rộng (4 thông tin chi tiết), xuất CSV. (8) `RevenueListPage.jsx` — 4 KPI (tổng doanh thu/giao dịch/giá trị trung bình/tỉ lệ chuyển đổi) + bảng giao dịch 6 cột (ngày/học viên/gói/khoản tiền/trạng thái/phương thức), filter trạng thái, tìm kiếm, xuất CSV. Mock: `transactions.js` (15 record), handler `/admin/revenue/transactions` + `/admin/revenue/stats`. Cập nhật `endpoints.js` + `routes.jsx` (route `/hoc-vien` & `/doanh-thu`) + `navConfig.js` mô tả. Lint sạch, 21/21 test, build qua.

## Đang làm

Chưa có.

## Việc tiếp theo

Giai đoạn 0–8 đã xong. Tiếp tục giai đoạn 9+ trong `.claude/prompts/giai-doan-giao-dien.md` (các trang con còn lại: tích hợp nội dung/phân quyền/cài đặt). Giai đoạn 0–6 là nền dùng chung.

## Điểm cần lưu ý

- `.db/SmartEnglishAI_db.txt` = schema PostgreSQL 8 service / 55 bảng, **gitignore, chỉ có trên máy local**. Là nguồn để lấy shape dữ liệu; đọc bằng `awk '/CREATE TABLE <schema>.<bảng>/,/^\);/'` chứ đừng đọc cả file (80KB).
- Đường dẫn trong `endpoints.js` là **dự kiến**, backend chưa chốt. Không coi là URL thật.
