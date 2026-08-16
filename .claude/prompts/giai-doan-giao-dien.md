# Bộ prompt dựng giao diện Admin — 19 giai đoạn

Mỗi khối ``` bên dưới là một prompt hoàn chỉnh. Copy nguyên khối, dán vào một phiên
Claude Code mới trong repo này. Không cần giải thích thêm gì.

Làm tuần tự từ giai đoạn 0. Giai đoạn 0–6 là nền dùng chung, bỏ qua sẽ hỏng phía sau.
Từ giai đoạn 7 trở đi có thể đảo thứ tự tuỳ ưu tiên.

Sau mỗi giai đoạn: chạy `npm run dev`, mở trình duyệt kiểm tra theo mục "XONG KHI"
của prompt đó, rồi mới sang giai đoạn tiếp.

---

## Quy chuẩn chung — đã chốt từ bộ ảnh thiết kế

Bộ ảnh gốc có 8 tấm nhưng **không nhất quán với nhau**. Ba điểm sau đã được chốt và
mọi prompt bên dưới đều tuân theo, để 19 màn ra cùng một bộ mặt:

| Điểm lệch trong ảnh | Chốt dùng |
|---|---|
| Sidebar khi navy gradient (ảnh 1), khi trắng (ảnh 2), khi navy đặc (ảnh 4-6), khi rail hẹp (ảnh 3) | **Navy gradient theo ảnh 1** cho mọi màn |
| Tên thương hiệu khi "SmartEnglish AI", khi "EduAI Admin / SaaS Portal" | **SmartEnglish AI** |
| Ảnh 8 dùng tím cho nút Export CSV và header bảng | **Bỏ.** Palette không có tím — dùng bản navy ở ảnh 1 |

Ngoài ra: nhiều ảnh còn nhãn tiếng Anh (My Courses, User Management, Showing 1 to 4 of
250 entries, Admin Portal Login, Approve, Confidence Score...). **Toàn bộ phải dịch sang
tiếng Việt** — các prompt đã ghi sẵn bản dịch.

Từ các ảnh chỉ lấy **bố cục và luồng thao tác**. Màu, bo góc, khoảng cách lấy từ
`.claude/rules/design-system.md`.

## Bảng tổng quan

| # | Nội dung | Ảnh gốc | Đường dẫn kiểm tra |
|---|---|---|---|
| 0 | Nối Tailwind, token màu, tiện ích định dạng | — | `/` |
| 1 | Nguyên thủy giao diện `components/ui/` | — | `/ui` |
| 2 | AppShell + Sidebar + Topbar + khung route | ảnh 1 | mọi mục menu |
| 3 | Đăng nhập | ảnh 7 | `/dang-nhap` |
| 4 | Bộ biểu đồ `components/charts/` | ảnh 1 | `/ui` |
| 5 | Dashboard tổng quan | ảnh 1 | `/` |
| 6 | `DataTable` dùng chung | ảnh 2, 4 | `/ui` |
| 7 | Quản lý người dùng — bảng, KPI, chip lọc | ảnh 2 | `/hoc-vien` |
| 8 | Drawer chi tiết người dùng | ảnh 2 | `/hoc-vien` |
| 9 | Kho từ vựng gốc | ảnh 4 | `/hoc-lieu/tu-vung` |
| 10 | Duyệt nội dung AI + bảng điều khiển prompt | ảnh 3 | `/noi-dung-ai` |
| 11 | Cấu hình gói Premium & mã giảm giá | ảnh 5 | `/goi-premium` |
| 12 | Giao dịch & đối soát | ảnh 6 | `/doi-soat` |
| 13 | Dữ liệu chi tiết (thống kê) | — | `/du-lieu-chi-tiet` |
| 14 | Phân quyền | — | `/phan-quyen` |
| 15 | Khoá học & Bài học | — | `/hoc-lieu/khoa-hoc` |
| 16 | Bài đọc & Bài nghe | — | `/hoc-lieu/bai-doc` |
| 17 | Bài kiểm tra & ngân hàng câu hỏi | — | `/hoc-lieu/bai-kiem-tra` |
| 18 | Thông báo, báo cáo, nhật ký, cài đặt | — | `/thong-bao` |

---

## Giai đoạn 0 — Nền tảng: Tailwind, token màu, tiện ích

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite 8 + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 0: dựng nền kỹ thuật. Repo còn nguyên template Vite mặc định; Tailwind đã
cài trong package.json nhưng chưa nối vào vite.config.js nên chưa dùng được.
Lớp dữ liệu (src/lib/api.js, src/lib/endpoints.js, src/mocks/) đã có sẵn, KHÔNG đụng vào.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/design-system.md — mục "Khai báo trong Tailwind 4" có sẵn block @theme để chép
- .claude/rules/conventions.md

VIỆC CẦN LÀM:
1. Thêm plugin @tailwindcss/vite vào vite.config.js. Thêm alias '@' trỏ tới thư mục src.
2. Viết lại src/index.css: bỏ hết CSS template, chỉ còn @import "tailwindcss"; và block
   @theme khai báo đúng token màu trong design-system.md. Nền trang canvas, chữ ink,
   font system-ui.
3. Xoá file thừa của template: src/App.css, src/assets/hero.png, src/assets/react.svg,
   src/assets/vite.svg, public/icons.svg. Giữ public/favicon.svg.
4. Viết src/lib/utils.js, export tên:
   - cn(...inputs) — gộp class bằng clsx + tailwind-merge
   - formatCurrency(value, { compact }) — compact true → "45.2Mđ", false → "299.000đ", vi-VN
   - formatNumber(value) — ngăn cách nghìn kiểu 28,400
   - formatDate(value, pattern) — date-fns locale vi
   - formatRelativeTime(value) — "2 phút trước", "15 phút trước", "3 ngày trước"
   - formatPercent(value) — "8.3%"
5. Viết src/App.jsx tạm: trang kiểm tra hiện 13 ô màu token kèm tên, và khối demo 6 hàm
   định dạng với dữ liệu mẫu. Trang này sẽ bị thay ở giai đoạn 2.
6. Viết src/lib/utils.test.js phủ 6 hàm định dạng.

RÀNG BUỘC:
- KHÔNG tạo tailwind.config.js — Tailwind 4 khai báo bằng @theme trong CSS.
- Chỉ dùng đúng hex trong design-system.md.
- Không thêm dependency mới. Mọi chữ hiển thị tiếng Việt.

XONG KHI:
- npm run lint sạch; npx vitest run src/lib/utils.test.js xanh.
- npm run dev, mở http://localhost:5173/ thấy nền xám nhạt canvas (KHÔNG phải nền trắng
  hay tím của template cũ), 13 ô màu đúng, số đã định dạng kiểu Việt Nam.
- src/assets không còn file nào của template.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm", cập nhật "Việc tiếp theo".
```

---

## Giai đoạn 1 — Nguyên thủy giao diện

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 1: dựng bộ nguyên thủy giao diện dùng lại.
Giai đoạn 0 đã xong: Tailwind chạy được, token màu trong src/index.css, tiện ích ở
src/lib/utils.js (có hàm cn()).

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/design-system.md — hình khối, chữ, bảng màu badge trạng thái
- .claude/rules/conventions.md
- src/lib/utils.js

VIỆC CẦN LÀM — tạo trong src/components/ui/:
1. Button.jsx — biến thể primary (nền navy-700), secondary (viền line nền trắng), ghost,
   danger (nền đỏ nhạt chữ đỏ), success (nền xanh lá). Cỡ sm/md. Trạng thái disabled và
   đang tải (spinner). Prop icon (component lucide) đặt trái chữ, prop fullWidth.
2. Card.jsx + CardHeader (title, description, action ở góc phải).
3. Badge.jsx — tone: success / info / warning / danger / neutral / gold.
   "gold" dùng cho nhãn GOLD MEMBER: chữ #A16207 nền #FEF3C7. Bo tròn hoàn toàn.
4. Input.jsx, Textarea.jsx, Select.jsx — có label, gợi ý, lỗi màu đỏ dưới ô, disabled.
   Input nhận prop leadingIcon (icon lucide bên trong, sát trái) và trailingAction
   (nút bên trong, sát phải — dùng cho nút con mắt xem mật khẩu).
5. SearchInput.jsx — Input kèm icon kính lúp và nút xoá nhanh.
6. FilterChip.jsx — chip bo tròn: trạng thái thường viền line nền trắng, đang chọn
   nền brand-500 chữ trắng. Dùng cho hàng lọc nhanh.
7. Modal.jsx — nền mờ tối, hộp trắng giữa màn, đóng bằng Esc và click ra ngoài.
   KHÔNG dùng backdrop-blur.
8. Drawer.jsx — ngăn kéo trượt từ CẠNH PHẢI, rộng khoảng 420px, có nút X góc trên phải,
   đóng bằng Esc và click nền mờ, nội dung cuộn dọc được. Trên màn hẹp thì chiếm toàn màn.
9. ConfirmDialog.jsx — dựng trên Modal, nút chính tone danger.
10. Skeleton.jsx + SkeletonText + SkeletonCard.
11. EmptyState.jsx — icon lucide mờ, dòng chính, dòng phụ, nút hành động tuỳ chọn.
12. ErrorState.jsx — nhận { status, message, details } và onRetry, hiện message rồi
    nút "Thử lại".
13. Pagination.jsx — nhận page, totalPages, onChange. Hiện dãy nút số trang có rút gọn
    dấu ba chấm (1 2 3 … 25), nút trước/sau. Trang hiện tại nền navy-700 chữ trắng.
14. Avatar.jsx — ảnh tròn, không có ảnh thì hiện chữ cái đầu trên nền brand nhạt.
    Prop status: 'online' hiện chấm tròn xanh lá ở góc dưới phải.
15. Tabs.jsx — thanh tab gạch chân, tab đang chọn chữ và gạch màu brand-500.
16. Switch.jsx — công tắc bật/tắt, bật thì nền navy-700.
17. ProgressBar.jsx — thanh mảnh bo tròn, nhận value và max, đổi màu theo ngưỡng
    (dưới 70% brand-500, 70-99% màu cảnh báo, đầy 100% màu đỏ).
18. StatTile.jsx — ô thống kê nhỏ nền canvas bo góc: nhãn xs in hoa màu ink-muted ở trên,
    số liệu đậm màu navy-700 ở dưới. Prop tone đổi màu số liệu.
19. StatusDot.jsx — chấm tròn nhỏ + nhãn, dùng cho legend biểu đồ và nhãn cổng thanh toán.

Sau đó tạo src/pages/UiKitchenSink.jsx liệt kê mọi thành phần với đủ biến thể, chia mục
rõ ràng. Gắn tạm vào src/App.jsx để mở được.

RÀNG BUỘC:
- Function component + hooks. Export mặc định cho component.
- Gộp class bằng cn(), không nối chuỗi thủ công.
- Chỉ dùng token màu trong design-system.md.
- Icon lucide-react, size 18, strokeWidth 1.75. Cấm emoji làm icon.
- Cấm gradient tím/hồng, backdrop-blur, shadow-2xl, rounded-3xl, animation nảy, hover phóng to.
- Mọi chữ tiếng Việt. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Trang kitchen-sink hiện đủ 19 nhóm, mọi biến thể đúng.
- Modal và Drawer đều đóng được bằng Esc và click nền; Drawer trượt vào từ cạnh phải.
- Pagination với 25 trang hiện đúng dạng rút gọn 1 2 3 … 25.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 2 — Khung ứng dụng: Sidebar, Topbar, route

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 2: dựng khung ứng dụng và điều hướng, bám theo ảnh thiết kế Dashboard gốc.
Giai đoạn 0-1 đã xong: Tailwind + token màu, tiện ích src/lib/utils.js, bộ nguyên thủy
trong src/components/ui/.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/design-system.md — mục Hình khối: quy cách sidebar, khoảng cách, chữ
- .claude/rules/conventions.md
- src/components/ui/ — dùng lại, đừng viết trùng

VIỆC CẦN LÀM:
1. src/components/layout/Sidebar.jsx — rộng w-64, nền GRADIENT NAVY từ navy-800 ở đỉnh
   xuống navy-900 ở đáy, cao đúng 100vh.
   - Trên cùng: icon lucide GraduationCap + chữ "SmartEnglish AI" màu trắng, cỡ vừa, đậm.
   - Giữa: danh sách nav CUỘN DỌC được, chia 5 nhóm. Nhãn nhóm chữ rất nhỏ, in hoa,
     giãn chữ, màu xanh nhạt mờ:
     MENU: Dashboard (/), Dữ liệu chi tiết (/du-lieu-chi-tiet), Học viên (/hoc-vien)
     HỌC LIỆU: Kho từ vựng (/hoc-lieu/tu-vung), Khoá học & Bài học (/hoc-lieu/khoa-hoc),
       Bài đọc & Bài nghe (/hoc-lieu/bai-doc), Bài kiểm tra (/hoc-lieu/bai-kiem-tra)
     NỘI DUNG AI: Duyệt nội dung AI (/noi-dung-ai), Cấu hình AI (/voice-ai)
     KINH DOANH: Doanh thu (/doanh-thu), Giao dịch & Đối soát (/doi-soat),
       Gói Premium (/goi-premium)
     CÀI ĐẶT HỆ THỐNG: Phân quyền (/phan-quyen), Thông báo (/thong-bao),
       Báo cáo vi phạm (/bao-cao), Nhật ký hoạt động (/nhat-ky), Cài đặt (/cai-dat)
   - Mỗi nav item: icon lucide + nhãn, bo rounded-lg, cao vừa phải.
     Item ĐANG CHỌN: nền brand-500 ĐẶC, chữ trắng. Item thường: chữ xanh rất nhạt,
     hover nền trắng mờ 10%.
   - Dưới đáy, CỐ ĐỊNH không cuộn: thẻ người dùng nền trắng mờ nhẹ bo rounded-lg gồm
     Avatar, tên "Quản trị viên" chữ trắng, dòng phụ "Quản trị hệ thống" chữ nhạt nhỏ,
     và nút đăng xuất (icon LogOut) sát phải.
2. src/components/layout/Topbar.jsx — nền trắng, viền dưới màu line, cao khoảng 72px:
   - Trái: tiêu đề trang (text-2xl font-semibold navy-700) và mô tả phụ
     (text-sm ink-muted) nằm dưới.
   - Phải: vùng nhận prop actions. Mặc định gồm nút chọn khoảng ngày (viền line, nền trắng,
     icon Calendar, chữ ví dụ "01/08 - 31/08/2026") và nút "Xuất CSV"
     (nền navy-700 chữ trắng, icon Download).
   Tiêu đề và mô tả lấy theo route đang mở.
3. src/components/layout/AppShell.jsx — Sidebar cố định trái; bên phải là cột dọc gồm
   Topbar, <main> nền canvas padding 6 khoảng cách giữa các khối 5, và footer một dòng
   chữ nhỏ căn giữa màu ink-muted: "© 2026 SmartEnglish AI — Trang quản trị nội bộ".
4. src/components/layout/PlaceholderPage.jsx — trang tạm dùng chung, hiện EmptyState
   "Màn hình đang được xây dựng" kèm tên màn.
5. src/routes.jsx — khai báo toàn bộ 17 route trên bằng react-router-dom v7, bọc trong
   AppShell, tạm trỏ hết vào PlaceholderPage (trừ /ui trỏ kitchen-sink).
   Thêm route * hiện trang 404 tiếng Việt.
6. Cập nhật src/main.jsx: bọc QueryClientProvider (TanStack Query), RouterProvider và
   <Toaster position="top-right" /> của react-hot-toast.
   QueryClient: retry 1 lần, staleTime 30 giây, không refetch khi focus lại cửa sổ.
7. Xoá src/App.jsx và src/App.css nếu không còn dùng.

RÀNG BUỘC:
- Sidebar cao đúng 100vh, phần nav cuộn khi tràn, thẻ người dùng luôn dính đáy.
- Dùng NavLink để lấy trạng thái active, không tự so sánh chuỗi đường dẫn.
- Chỉ dùng token màu trong design-system.md. Icon lucide-react size 18 strokeWidth 1.75.
- Mọi chữ tiếng Việt, kể cả trang 404. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- npm run dev: bấm được cả 17 mục menu, mỗi mục đổi URL và đổi tiêu đề Topbar, mục đang
  mở nền xanh brand-500 đặc.
- Gõ URL bậy → trang 404 tiếng Việt.
- Thu nhỏ chiều cao cửa sổ: nav cuộn, thẻ người dùng vẫn dính đáy.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 3 — Đăng nhập (theo ảnh 7)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 3: màn đăng nhập và bảo vệ route.
Giai đoạn 0-2 đã xong: Tailwind + token màu, bộ ui/, AppShell + Sidebar + Topbar + 17 route.
Backend CHƯA có — dữ liệu chạy qua mock, bật bằng VITE_USE_MOCK trong .env.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/conventions.md — mục Dữ liệu, ba lớp endpoints / api / mocks
- src/lib/api.js — cách chuyển mock và hình dạng lỗi { status, message, details }
- src/lib/endpoints.js — nhóm ENDPOINTS.auth
- src/mocks/handlers.js và src/mocks/data/users.js — cách đăng ký mock

BỐ CỤC THEO ẢNH THIẾT KẾ — một card đơn giản giữa màn hình, nền trang canvas:
- Phần đầu card căn giữa: icon GraduationCap + chữ "SmartEnglish AI" (chữ đậm, navy-700),
  bên dưới là tiêu đề "Đăng nhập trang quản trị" (đậm, cỡ vừa), rồi dòng phụ
  "Chào mừng trở lại, Quản trị viên." màu ink-muted. Có đường kẻ ngang ngăn với phần thân.
- Thân card: ô "Địa chỉ email" (icon phong bì bên trong sát trái, gợi ý
  admin@smartenglish.vn); ô "Mật khẩu" (icon ổ khoá sát trái, nút con mắt sát phải để
  hiện/ẩn); hàng dưới gồm checkbox "Ghi nhớ đăng nhập" bên trái và liên kết
  "Quên mật khẩu?" bên phải; nút "Đăng nhập" nền navy-700, chữ trắng, chiếm hết chiều ngang.
- Chân card: dải nền xám nhạt, icon tam giác cảnh báo màu đỏ + chữ nhỏ:
  "Đây là khu vực hạn chế. Mọi truy cập trái phép đều bị nghiêm cấm. Toàn bộ hoạt động
  trên hệ thống đều được ghi lại."

VIỆC CẦN LÀM:
1. Thêm mock đăng nhập vào src/mocks/handlers.js, khoá lấy từ ENDPOINTS.auth:
   - POST auth.login: email "admin@smartenglish.vn" + mật khẩu "admin123" → trả
     { token, user } với user là bản ghi admin trong src/mocks/data/users.js;
     sai thì ném { status: 401, message: 'Email hoặc mật khẩu không đúng.', details: null }.
   - GET auth.me: trả bản ghi admin. POST auth.logout: trả { success: true }.
2. src/features/auth/api.js — login(payload), logout(), getMe(). Chỉ dùng api.* với khoá
   trong ENDPOINTS, không gõ chuỗi URL.
3. src/store/authStore.js — zustand giữ user, token, trạng thái đã khởi tạo.
   Ghi/xoá token vào localStorage khoá 'se_admin_token' (khoá này đã dùng trong
   src/lib/api.js, ĐỪNG đặt tên khác).
4. src/features/auth/hooks/useAuth.js — đăng nhập bằng useMutation, đăng xuất, nạp lại
   phiên từ token khi mở app.
5. src/features/auth/LoginPage.jsx theo bố cục trên. Form dùng react-hook-form + zod qua
   @hookform/resolvers, lỗi tiếng Việt ("Email không hợp lệ", "Mật khẩu tối thiểu 6 ký tự").
   Sai tài khoản → hiện lỗi NGAY TRONG FORM, không dùng toast.
   Thành công → toast.success("Đăng nhập thành công") rồi về /.
   Đang chờ → nút chuyển trạng thái tải và khoá lại.
   Dưới card ghi dòng nhỏ ink-muted: tài khoản demo admin@smartenglish.vn / admin123.
6. src/components/layout/ProtectedRoute.jsx — chưa có token thì chuyển về /dang-nhap và
   nhớ đường dẫn đang định vào để quay lại sau khi đăng nhập.
7. Cập nhật src/routes.jsx: /dang-nhap đứng NGOÀI AppShell, mọi route còn lại bọc trong
   ProtectedRoute.
8. Nối nút đăng xuất ở Sidebar: ConfirmDialog "Đăng xuất khỏi trang quản trị?" → đồng ý
   thì xoá token và về /dang-nhap.

RÀNG BUỘC:
- Không import gì từ src/mocks trong src/features — mock chỉ do src/lib/api.js nạp.
- Lỗi từ api.js đã có message tiếng Việt, hiển thị thẳng, không viết lại.
- Trang đăng nhập KHÔNG ảnh nền, KHÔNG gradient màu, KHÔNG glassmorphism.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở http://localhost:5173/ khi chưa đăng nhập → bị đưa về /dang-nhap.
- Sai mật khẩu → "Email hoặc mật khẩu không đúng." hiện trong form.
- Đúng → vào Dashboard; F5 vẫn còn đăng nhập.
- Bấm con mắt → mật khẩu hiện dạng chữ thường.
- Đăng xuất → hỏi xác nhận → về /dang-nhap, F5 không vào lại được.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 4 — Bộ biểu đồ dùng chung

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 4: dựng bộ biểu đồ dùng lại bằng recharts.
Giai đoạn 0-3 đã xong: Tailwind + token màu, bộ ui/, AppShell + route, đăng nhập.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/design-system.md — mục Biểu đồ: màu chuỗi, grid, legend, donut
- .claude/skills/dashboard-chart/SKILL.md — có sẵn khuôn mẫu code, dùng lại
- src/lib/utils.js — hàm định dạng số và tiền
- src/components/ui/Card.jsx

VIỆC CẦN LÀM — tạo trong src/components/charts/:
1. ChartTooltip.jsx — tooltip tự viết: nền trắng, viền line, rounded-lg, shadow nhẹ;
   dòng đầu là nhãn trục, các dòng sau là chấm màu + tên chuỗi + giá trị đã định dạng.
   Prop formatter để đổi cách hiện giá trị (số thường hoặc tiền).
2. ChartLegend.jsx — hàng chấm tròn nhỏ + tên chuỗi, chữ text-sm, đặt được ở góc phải
   header của Card (theo ảnh Dashboard: "Free" chấm navy, "Premium" chấm xanh sáng).
3. ChartEmpty.jsx — không có dữ liệu thì hiện chữ căn giữa màu ink-muted
   "Chưa có dữ liệu cho khoảng thời gian này", KHÔNG vẽ khung biểu đồ trống.
4. LineChartCard.jsx — bọc Card + ResponsiveContainer cao 260. Nhận data, mảng series
   ({ key, label, color }), dataKey trục X. Đường type monotone, strokeWidth 2, KHÔNG chấm
   điểm. Grid chỉ kẻ NGANG nét đứt #E6EDF3, ẩn trục Y, trục X bỏ đường kẻ và vạch chia.
   Thứ tự màu mặc định: navy-700 → brand-400 → brand-200.
5. BarChartCard.jsx — cột bo góc trên 6px. Mặc định mọi cột màu chart-idle; prop
   highlightIndex tô cột đó navy-700 VÀ hiện nhãn giá trị phía trên cột trong hộp nhỏ
   nền navy-700 chữ trắng bo góc (theo ảnh Dashboard: cột tháng cuối kèm nhãn "45.2M").
6. DonutCard.jsx — vòng MẢNH (innerRadius lớn), tối đa 4 lát, lát cuối "Khác" dùng #EEF3F7.
   Chữ giữa vòng nhận từ prop (ảnh Dashboard ghi "Top 4" đậm và "tính năng" nhỏ bên dưới).
   Bên dưới vòng là danh sách từng mục: chấm màu + tên bên trái, phần trăm căn phải.
7. SparkLine.jsx — đường nhỏ không trục, không grid, nhúng trong thẻ KPI.
8. MiniBarChart.jsx — biểu đồ cột rất nhỏ không trục, dùng nhúng trong thẻ nội dung
   (giai đoạn 10 cần cho thẻ đề thi IELTS Writing).

Mỗi thành phần nhận prop isLoading (hiện Skeleton) và error (hiện ErrorState).

Bổ sung vào /ui mục "Biểu đồ" trình bày cả 8 thành phần với dữ liệu mẫu khai báo ngay
trong trang đó, kèm ví dụ trạng thái đang tải và rỗng.

RÀNG BUỘC:
- Không dùng màu mặc định của recharts; mọi màu lấy từ token design-system.md.
- Không dùng tooltip mặc định của recharts.
- Bỏ trục Y khi giá trị đã hiện ở tooltip hoặc nhãn.
- Nhãn trục, tên chuỗi, legend đều tiếng Việt. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- /ui mục Biểu đồ: line 2 chuỗi navy và xanh sáng, bar có đúng 1 cột đậm kèm nhãn hộp,
  donut là vòng mảnh có chữ giữa và danh sách phần trăm bên dưới.
- Rê chuột lên biểu đồ thấy tooltip trắng viền mảnh, số định dạng kiểu Việt Nam.
- Kéo hẹp cửa sổ, biểu đồ co theo, không tràn ngang.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 5 — Dashboard tổng quan (theo ảnh 1)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 5: Dashboard tổng quan — màn chính, dựng bám ảnh thiết kế gốc.
Giai đoạn 0-4 đã xong: Tailwind + token màu, bộ ui/, AppShell + Sidebar + Topbar, đăng nhập,
và bộ biểu đồ trong src/components/charts/.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/rules/design-system.md
- .claude/skills/admin-page/SKILL.md và .claude/skills/dashboard-chart/SKILL.md
- src/features/dashboard/hooks/useDashboard.js — hook ĐÃ VIẾT SẴN, dùng lại, ĐỪNG viết mới
- src/mocks/data/dashboard.js — biết trước hình dạng dữ liệu
- src/components/charts/ và src/components/ui/

BỐ CỤC THEO ẢNH THIẾT KẾ, từ trên xuống:
1. Topbar: tiêu đề "Dashboard Tổng quan", mô tả phụ "Chào mừng trở lại, hệ thống đang
   hoạt động ổn định." Bên phải: nút khoảng ngày (icon Calendar, viền line) và nút
   "Xuất CSV" (nền navy-700, icon Download).
2. Hàng 4 thẻ KPI (lưới 4 cột màn rộng, 2 cột tablet, 1 cột điện thoại):
   "Người dùng hoạt động ngày (DAU)" 1,248 +12% | "Người dùng hoạt động tháng (MAU)"
   28,400 +8% | "Doanh thu tháng" 45.2Mđ +22% | "Tỷ lệ chuyển đổi Premium" 8.3% -1.5%.
   Mỗi thẻ: icon lucide trong ô vuông bo góc nền màu rất nhạt ở GÓC TRÁI TRÊN; phần trăm
   thay đổi ở GÓC PHẢI TRÊN kèm mũi tên chéo (xanh #15803D khi tăng, đỏ #DC2626 khi giảm);
   bên dưới là nhãn text-sm ink-muted; dưới cùng là số liệu text-3xl font-bold navy-700.
3. Hàng hai chia 2 cột tỉ lệ ~2:1, dồn 1 cột khi hẹp:
   - Trái: LineChartCard "Biểu đồ người dùng hoạt động", 2 chuỗi "Free" (navy-700) và
     "Premium" (brand-400), legend chấm tròn ở GÓC PHẢI HEADER, trục X là thứ trong tuần
     (T2..CN). Dữ liệu useActiveUsers().
   - Phải: DonutCard "Tính năng được dùng nhiều", chữ giữa vòng "Top 4" + dòng phụ
     "tính năng"; bên dưới liệt kê 4 mục: chấm màu + tên + phần trăm căn phải.
     Dữ liệu useFeatureUsage().
4. BarChartCard "Doanh thu theo tháng": 6 cột, cột cuối tô navy-700 kèm nhãn giá trị
   trong hộp nhỏ phía trên; các cột khác chart-idle. Góc phải header ghi
   "Tổng tháng này: 45.2Mđ". Dữ liệu useRevenueByMonth().
5. Card "Hoạt động gần đây", góc phải header có liên kết "Xem tất cả ›" trỏ /hoc-vien.
   Bảng 5 cột, header chữ xs IN HOA giãn chữ màu ink-muted trên nền canvas:
   HỌC VIÊN (Avatar + tên đậm navy-700 + dòng phụ trình độ CEFR ink-muted) |
   HÀNH ĐỘNG | TRẠNG THÁI (Badge: success "Thành công", info "Đã xong",
   warning "Chờ xác thực", danger "Thất bại") | THỜI GIAN ("2 phút trước") |
   GIAO DỊCH (số tiền đầy đủ "+299.000đ" màu xanh lá, hoặc dấu "-").
   Bọc trong khối cuộn ngang khi màn hẹp.
   Dữ liệu useRecentActivity().

DỮ LIỆU: dùng nguyên các hook trong src/features/dashboard/hooks/useDashboard.js.
Mock đã đủ trong src/mocks/data/dashboard.js, KHÔNG cần thêm.
Không import gì từ src/mocks trong code feature.

RÀNG BUỘC:
- Mọi chữ tiếng Việt. Chỉ dùng token màu trong design-system.md, không sinh hex mới.
- ĐẶC BIỆT: không dùng màu tím cho nút Xuất CSV hay header bảng — dùng navy-700.
- Icon lucide-react size 18 strokeWidth 1.75. Cấm emoji làm icon.
- Cấm gradient tím/hồng, backdrop-blur, shadow dày, rounded-3xl, hover phóng to.
- Mỗi khối dữ liệu xử lý đủ 3 trạng thái: đang tải (Skeleton), rỗng (EmptyState),
  lỗi (ErrorState có nút thử lại).
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch, không còn console.log.
- Mở http://localhost:5173/ thấy đủ 5 khối đúng thứ tự trên.
- Sửa tạm mock để ném lỗi → thấy ErrorState có nút "Thử lại", không trắng trang.
- Thu nhỏ dưới 640px: 4 KPI xếp chồng, biểu đồ dồn 1 cột, bảng cuộn ngang, KHÔNG có
  thanh cuộn ngang toàn trang.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 6 — DataTable dùng chung

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 6: dựng bảng dữ liệu dùng chung cho mọi màn danh sách phía sau.
Giai đoạn 0-5 đã xong: nền Tailwind, bộ ui/, AppShell + route, đăng nhập, biểu đồ, Dashboard.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md — quy cách bảng, badge, xuất CSV, làm theo
- .claude/rules/design-system.md
- src/components/ui/ — Pagination, SearchInput, FilterChip, Skeleton, EmptyState,
  ErrorState, Badge, Avatar
- src/mocks/utils.js — hình dạng dữ liệu phân trang
  { items, total, page, size, totalPages }

VIỆC CẦN LÀM — tạo src/components/ui/DataTable/:
1. DataTable.jsx dựng trên @tanstack/react-table. Nhận: columns, data, isLoading, error,
   onRetry, pagination, onPageChange, sorting, onSortingChange, emptyMessage, onRowClick,
   selectedRowId (tô nền brand nhạt cho hàng đang chọn), enableSelection (cột checkbox
   đầu bảng, có checkbox chọn tất cả ở header), expandable + renderExpandedRow.
   - Header: chữ xs IN HOA giãn chữ màu ink-muted, nền canvas; cột sắp xếp được thì hiện
     mũi tên nhỏ và bấm được.
   - Hàng: viền dưới line, hàng cuối không viền, hover nền canvas, con trỏ pointer khi có
     onRowClick. Hàng đang chọn hoặc đang tick: nền xanh rất nhạt.
   - Ô: padding x4 y3, mặc định căn trái; cột số/tiền căn phải qua meta.align.
   - Khi expandable: cột đầu là nút mũi tên xoay; mở ra thì chèn một hàng gộp hết cột
     bên dưới, nội dung do renderExpandedRow trả về, nền canvas.
   - Bọc trong khối overflow-x-auto.
   - Đang tải: 5 hàng Skeleton giữ đúng số cột. Rỗng: một hàng gộp cột hiện EmptyState.
     Lỗi: ErrorState kèm nút thử lại.
   - Dưới bảng: bên trái ghi "Hiển thị 1-10 trên 28,400 mục" (số đã ngăn cách nghìn),
     bên phải là Pagination. Tự ẩn cả hàng khi chỉ có 1 trang.
2. DataTableToolbar.jsx — hàng công cụ trên bảng: SearchInput bên trái (trì hoãn 300ms
   trước khi gọi lại dữ liệu), vùng giữa nhận children (bộ lọc), vùng phải nhận actions
   (các nút Nhập/Xuất/Thêm mới).
3. FilterChipRow.jsx — hàng chip lọc nhanh nằm trên bảng, dùng FilterChip đã có.
   Nhận danh sách chip { key, label } và giá trị đang chọn. Chip đầu luôn là "Tất cả".
4. useDataTable.js — hook gom trạng thái page, size, search, sorting, filters, trả về
   đúng object tham số để truyền thẳng vào hàm api của feature.
5. exportCsv.js — dùng papaparse. BẮT BUỘC thêm BOM "﻿" trước chuỗi CSV để Excel đọc
   đúng tiếng Việt. Tên file <ten-mien>-<yyyy-MM-dd>.csv. Nhận danh sách cột để đặt
   tiêu đề tiếng Việt.

Bổ sung vào /ui mục "Bảng dữ liệu": dùng thử DataTable với dữ liệu người dùng qua
src/features/users/api.js (hàm getUsers đã có sẵn), bật đủ tìm kiếm, phân trang, sắp xếp,
chọn nhiều dòng, hàng mở rộng và nút xuất CSV chạy thật.

RÀNG BUỘC:
- Bảng chỉ đọc dưới 20 dòng và không cần sắp xếp thì màn đó dùng thẻ table thuần,
  KHÔNG bắt buộc DataTable — ghi rõ điều này trong ghi chú đầu file.
- Định nghĩa cột luôn ở file riêng columns.jsx cạnh từng trang, không nhét vào DataTable.
- Chỉ dùng token màu trong design-system.md. Mọi chữ tiếng Việt.
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- /ui mục Bảng dữ liệu: gõ "lan" → lọc lại sau ~300ms; bấm tiêu đề cột → đổi thứ tự;
  chuyển trang chạy đúng; tick checkbox header → chọn hết hàng trong trang.
- Bấm mũi tên đầu hàng → mở khối nội dung mở rộng bên dưới hàng đó.
- Bấm "Xuất CSV" tải được file, mở bằng Excel thấy tiếng Việt đúng dấu.
- Lúc đang tải thấy 5 hàng skeleton, không phải bảng trắng.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 7 — Quản lý người dùng (theo ảnh 2)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 7: màn quản lý người dùng tại /hoc-vien, dựng bám ảnh thiết kế.
Giai đoạn 0-6 đã xong: nền, bộ ui/, AppShell + route, đăng nhập, biểu đồ, Dashboard,
và DataTable dùng chung ở src/components/ui/DataTable/.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md và .claude/skills/admin-page/SKILL.md
- src/components/ui/DataTable/ — DÙNG LẠI, không viết bảng mới
- src/features/users/api.js — getUsers, lockUser, unlockUser ĐÃ CÓ SẴN
- src/mocks/data/users.js — hình dạng bản ghi người dùng

BỐ CỤC THEO ẢNH THIẾT KẾ:
1. Topbar: tiêu đề "Quản lý người dùng", mô tả phụ nêu tổng số. Bên phải: ô tìm kiếm
   và nút "Xuất CSV".
2. Hàng 3 thẻ KPI: "Tổng số người dùng" 28,400 kèm ↑4.2% màu xanh lá |
   "Người dùng Premium" 2,354 kèm dòng phụ nhỏ "Gói Premium năm" |
   "Tài khoản bị khoá" 12 (số màu đỏ).
   Thẻ đang được chọn làm bộ lọc thì có VIỀN TRÁI DÀY màu brand-500 — bấm vào thẻ sẽ lọc
   bảng theo nhóm tương ứng, bấm lần nữa thì bỏ lọc.
3. Hàng chip lọc nhanh (dùng FilterChipRow): "Tất cả" | "Gói: Premium" | "Gói: Miễn phí" |
   "Trạng thái: Hoạt động" | "Trạng thái: Bị khoá". Chip đang chọn nền brand-500 chữ trắng.
4. Bảng (DataTable) các cột:
   - HỒ SƠ: Avatar + tên đậm navy-700, dòng dưới là email nhỏ màu ink-muted
   - GÓI: Badge — premium_* dùng tone "gold" nhãn "PREMIUM", free dùng neutral
     nhãn "MIỄN PHÍ", lifetime dùng success nhãn "TRỌN ĐỜI"
   - CẤP ĐỘ: mã CEFR chữ đậm màu brand-500, rỗng thì "-"
   - NGÀY THAM GIA: dạng dd/MM/yyyy
   - ĐĂNG NHẬP GẦN NHẤT: dạng "3 ngày trước"
   - TRẠNG THÁI: Badge success "Đang hoạt động" / danger "Đã khoá"
   - THAO TÁC: nút ba chấm mở menu "Xem chi tiết", "Khoá tài khoản"/"Mở khoá tài khoản",
     "Đặt lại mật khẩu"
   Hàng đang mở chi tiết được tô nền xanh rất nhạt (truyền selectedRowId).
   Chân bảng: "Hiển thị 1-10 trên 28,400 người dùng".
5. Bấm vào một hàng KHÔNG chuyển trang — mở Drawer chi tiết bên phải (làm ở giai đoạn 8).
   Giai đoạn này chỉ cần lưu id đang chọn vào state và tô sáng hàng đó.

VIỆC CẦN LÀM:
1. src/features/users/hooks/useUsers.js — useQuery danh sách với query key
   ['users', { page, size, search, role, plan, status }]; useMutation khoá/mở khoá,
   xong thì invalidate đúng key và toast tiếng Việt.
2. src/features/users/columns.jsx theo mô tả cột trên.
3. src/features/users/UsersPage.jsx theo bố cục trên.
   Khoá tài khoản phải qua ConfirmDialog: "Khoá tài khoản của <tên>? Người dùng sẽ không
   đăng nhập được cho tới khi được mở khoá."

DỮ LIỆU: mock users.list, users.detail, users.lock, users.unlock ĐÃ CÓ trong
src/mocks/handlers.js. Cần bổ sung mock cho ENDPOINTS.users.resetPassword
(trả { success: true }), khoá lấy từ ENDPOINTS, không gõ tay URL.
Không import gì từ src/mocks trong code feature.

RÀNG BUỘC:
- Mọi chữ tiếng Việt, kể cả nhãn chip và toast. Không để lại nhãn tiếng Anh kiểu
  "User Management", "Showing 1 to 10 of ...".
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-vien thấy 3 KPI, hàng chip, bảng 13 người dùng có phân trang.
- Gõ "lan" → còn đúng bản ghi Trần Thị Lan.
- Bấm chip "Trạng thái: Bị khoá" → chỉ còn tài khoản đã khoá; bấm "Tất cả" → về đủ.
- Bấm thẻ KPI "Người dùng Premium" → bảng lọc theo Premium và thẻ đó hiện viền trái đậm.
- Khoá một tài khoản → hộp xác nhận → đồng ý → Badge đổi "Đã khoá" và có toast.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 8 — Drawer chi tiết người dùng (theo ảnh 2)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 8: ngăn kéo chi tiết người dùng, mở từ bảng ở /hoc-vien.
Giai đoạn 0-7 đã xong, trong đó có component Drawer trong src/components/ui/ và màn
danh sách người dùng.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- src/components/ui/Drawer.jsx và StatTile.jsx — DÙNG LẠI
- src/features/users/api.js, hooks/useUsers.js, UsersPage.jsx
- src/mocks/handlers.js, src/mocks/data/users.js, src/mocks/data/payments.js
- src/lib/endpoints.js — nhóm users, orders
- Schema gốc, đọc ĐÚNG bảng cần, KHÔNG đọc cả file 80KB:
  awk '/CREATE TABLE learning.user_stats/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE auth.user_devices/,/^\);/' .db/SmartEnglishAI_db.txt

BỐ CỤC THEO ẢNH THIẾT KẾ — ngăn kéo trượt từ cạnh phải, rộng ~420px, cuộn dọc được:
1. Đầu ngăn: tiêu đề "Chi tiết người dùng" bên trái, nút X bên phải, có đường kẻ dưới.
2. Khối nhận diện, căn giữa: Avatar lớn (~96px) có chấm tròn xanh lá góc dưới phải nếu
   đang hoạt động; tên đậm cỡ lớn; email màu ink-muted; hàng 2 badge:
   tone gold "THÀNH VIÊN PREMIUM" và tone info "TRÌNH ĐỘ B2".
3. Lưới 2x2 các StatTile nền canvas bo góc:
   "TỔNG XP" 12,450 | "BÀI HỌC" 142 | "CHUỖI NGÀY" 12 ngày | "TỈ LỆ ĐÚNG" 88% (số màu
   xanh lá). Nhãn chữ xs in hoa ink-muted, số liệu đậm navy-700.
4. Mục "LỊCH SỬ GIAO DỊCH" (nhãn xs in hoa, có đường kẻ trên): mỗi dòng gồm icon hoá đơn
   bên trái, giữa là tên giao dịch đậm + dòng phụ "12/05/2026 • #HD-4920", bên phải là
   số tiền màu đỏ dạng "-299.000đ". Hiện tối đa 3 dòng, dưới cùng là liên kết
   "Xem tất cả giao dịch" màu brand-500.
5. Mục "THAO TÁC QUẢN TRỊ" (nhãn xs in hoa): hàng 2 nút cạnh nhau —
   "Khoá tài khoản" (nền đỏ rất nhạt, chữ đỏ, icon Ban) và "Tặng Premium" (nền xanh rất
   nhạt, chữ brand-500, icon Gift); bên dưới là nút "Gửi tin nhắn trực tiếp" viền line
   chiếm hết chiều ngang.

VIỆC CẦN LÀM:
1. Bổ sung mock: thêm vào bản ghi người dùng các trường thống kê học tập theo
   learning.user_stats (tổng XP, chuỗi ngày học liên tiếp, số bài học hoàn thành,
   tỉ lệ trả lời đúng); đăng ký ENDPOINTS.users.devices trả 2-3 thiết bị theo
   auth.user_devices. Tên trường camelCase.
2. src/features/users/api.js — thêm getUserOrders(id) dùng ENDPOINTS.orders.list với
   tham số userId.
3. src/features/users/components/UserDetailDrawer.jsx theo bố cục trên.
   Nhận userId và onClose. userId null thì không mở.
   Đang tải thì hiện Skeleton đúng khung, không nhảy layout.
   Không tìm thấy thì hiện EmptyState "Không tìm thấy người dùng".
4. Nối vào UsersPage: bấm hàng nào thì mở ngăn kéo cho người đó và tô sáng hàng đang mở.
   Đóng ngăn kéo thì bỏ tô sáng.
5. Nút "Khoá tài khoản" trong ngăn kéo dùng chung mutation đã có, qua ConfirmDialog.
   "Tặng Premium" và "Gửi tin nhắn trực tiếp" mở Modal riêng: tặng Premium chọn gói và
   số tháng; gửi tin nhắn có ô tiêu đề và nội dung. Chưa có endpoint thật thì chỉ cần
   hiện toast "Đã gửi" và đóng modal, kèm ghi chú // TODO: nối endpoint khi backend có.

RÀNG BUỘC:
- Ngăn kéo đóng được bằng Esc và click nền mờ. Trên màn hẹp chiếm toàn màn.
- Mọi chữ tiếng Việt. Chỉ dùng token màu trong design-system.md.
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-vien, bấm một hàng → ngăn kéo trượt vào từ phải, hàng đó nền xanh nhạt.
- Trong ngăn kéo thấy đủ 5 khối trên, số liệu đã định dạng kiểu Việt Nam.
- Bấm Esc hoặc nền mờ → ngăn kéo đóng, hàng hết tô sáng.
- Bấm "Khoá tài khoản" trong ngăn kéo → xác nhận → trạng thái đổi cả trong bảng lẫn ngăn kéo.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 9 — Kho từ vựng gốc (theo ảnh 4)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 9: màn quản lý kho từ vựng tại /hoc-lieu/tu-vung, dựng bám ảnh thiết kế.
Giai đoạn 0-8 đã xong, có DataTable dùng chung (hỗ trợ chọn nhiều dòng) và màn người dùng.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md và .claude/skills/admin-page/SKILL.md
- src/components/ui/DataTable/ — DÙNG LẠI, bật enableSelection
- src/lib/endpoints.js — nhóm topics, words, phrases
- src/mocks/utils.js — hàm paginate
- Schema, đọc ĐÚNG bảng cần:
  awk '/CREATE TABLE content.topics/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE content.words/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE content.word_meanings/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE content.word_examples/,/^\);/' .db/SmartEnglishAI_db.txt

BỐ CỤC THEO ẢNH THIẾT KẾ:
1. Trên tiêu đề có đường dẫn phân cấp nhỏ: "Quản lý học liệu › Kho từ vựng gốc"
   (mục cuối màu brand-500). Tạo component Breadcrumb.jsx trong src/components/ui/.
2. Tiêu đề trang cỡ lớn "Quản lý kho từ vựng gốc".
3. Card công cụ riêng phía trên bảng: ô tìm kiếm rộng bên trái (gợi ý
   "Tìm kiếm từ vựng, ý nghĩa..."), bên phải là 3 nút:
   "Nhập từ file Excel/CSV" (viền line, icon Upload) |
   "Xuất dữ liệu" (viền line, icon Download, có mũi tên xổ chọn CSV hoặc Excel) |
   "Thêm từ mới" (nút ĐẶC màu brand-500, icon Plus).
4. Card bảng (DataTable, bật chọn nhiều dòng) các cột:
   checkbox | TỪ VỰNG (chữ đậm màu brand-500) | PHIÊN ÂM IPA (font monospace, ink-muted) |
   TỪ LOẠI (Badge neutral, nhãn tiếng Việt: Danh từ / Động từ / Tính từ / Trạng từ) |
   NGHĨA TIẾNG VIỆT | CẤP ĐỘ CEFR (Badge info) | CHỦ ĐỀ |
   AUDIO (nút tròn icon Play, bấm phát phiên âm) | HÀNH ĐỘNG (icon bút chì sửa, icon
   thùng rác xoá).
   Hàng đã tick nền xanh rất nhạt.
   Khi có dòng được tick thì hiện thanh hành động hàng loạt phía trên bảng:
   "Đã chọn 3 mục" + nút "Xoá đã chọn" + "Đổi chủ đề" + "Bỏ chọn".
5. Chân bảng: "Hiển thị 1-4 trên 250 mục" bên trái, Pagination dạng số trang
   1 2 3 … 25 bên phải.

VIỆC CẦN LÀM:
1. Tạo src/mocks/data/content.js bám đúng schema: 8 chủ đề (tên tiếng Anh + tên tiếng Việt,
   số từ, cấp độ CEFR); 40 từ vựng (chữ viết, phiên âm IPA, loại từ, nghĩa tiếng Việt,
   cấp độ CEFR, chủ đề, đường dẫn audio giả, số nghĩa, số ví dụ); mỗi từ 1-3 nghĩa và
   1-2 ví dụ. Đăng ký vào src/mocks/handlers.js cho topics.* và words.* (list dùng paginate).
2. src/features/vocabulary/api.js, hooks/, columns.jsx.
3. src/features/vocabulary/VocabularyPage.jsx theo bố cục trên. Tìm kiếm theo từ hoặc
   nghĩa; lọc theo chủ đề, cấp độ, từ loại.
4. Modal thêm/sửa từ: từ vựng, phiên âm IPA, từ loại, cấp độ, chủ đề, danh sách nghĩa
   (thêm/xoá từng dòng), danh sách ví dụ (câu tiếng Anh + bản dịch), đường dẫn audio.
   react-hook-form + zod, lỗi tiếng Việt.
5. Modal "Nhập từ file": vùng kéo thả dùng react-dropzone (đã có trong package.json),
   đọc CSV bằng papaparse, hiện bảng xem trước 10 dòng đầu và số dòng lỗi, rồi mới cho
   xác nhận. Gọi ENDPOINTS.words.import.
6. Nút Audio: dùng thẻ <audio> tạo bằng JS để phát, đang phát thì icon đổi sang Pause.
   File giả không phát được thì bắt lỗi và toast "Không phát được audio", KHÔNG để văng lỗi.

RÀNG BUỘC:
- Chữ tiếng Anh trong cột TỪ VỰNG, PHIÊN ÂM và câu ví dụ là DỮ LIỆU, được phép.
  Mọi NHÃN giao diện phải tiếng Việt — không để lại "Showing 1 to 4 of 250 entries",
  "Import file", "Noun", "Adjective".
- Nút "Thêm từ mới" trong ảnh màu xanh lá; ở đây dùng brand-500 cho đúng palette.
- Mock trả đúng shape API thật, danh sách phân trang dùng paginate trong src/mocks/utils.js.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-lieu/tu-vung thấy đường dẫn phân cấp, thanh công cụ 3 nút, bảng 40 từ phân trang.
- Lọc theo một chủ đề → danh sách ngắn lại đúng.
- Tick 3 dòng → hiện thanh "Đã chọn 3 mục" với các nút hành động hàng loạt.
- Bấm nút Play ở cột Audio → không văng lỗi (có toast nếu không phát được).
- Kéo thả file CSV vào modal nhập → hiện bảng xem trước trước khi xác nhận.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 10 — Duyệt nội dung AI (theo ảnh 3)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 10: màn duyệt nội dung do AI sinh tại /noi-dung-ai, dựng bám ảnh thiết kế.
Giai đoạn 0-9 đã xong, có bộ ui/, biểu đồ (kể cả MiniBarChart) và các màn quản trị trước.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/admin-page/SKILL.md
- src/lib/endpoints.js — nhóm aiContent, aiSettings
- src/mocks/data/dashboard.js — đã có aiUsage
- src/components/ui/ và src/components/charts/MiniBarChart.jsx

BỐ CỤC THEO ẢNH THIẾT KẾ — hai cột: cột nội dung rộng bên trái, bảng điều khiển hẹp
(~340px) cố định bên phải, cả hai cùng cuộn trong <main>:

CỘT TRÁI:
1. Đầu trang: tiêu đề "Nội dung sinh bởi AI — Chờ duyệt", mô tả phụ "Kiểm tra và xác thực
   nội dung giáo trình được tạo tự động." Bên phải tiêu đề: Badge tròn nền đỏ rất nhạt
   chữ đỏ "47 mục chờ", nút "Lọc" (viền line, icon Filter), nút "Duyệt tất cả" (nền
   navy-700, icon CheckCheck).
2. Tabs: "Từ vựng mới" | "Câu ví dụ" | "Đề thi".
3. Danh sách thẻ nội dung xếp dọc, mỗi thẻ là một Card:
   - Hàng đầu: ô vuông bo góc nền navy nhạt chứa icon loại nội dung; bên cạnh là tên
     nội dung đậm và nhãn xs in hoa ink-muted ("MỤC TỪ VỰNG" / "CỤM TỪ" / "ĐỀ LUYỆN TẬP");
     góc phải là chữ nhỏ "Độ tin cậy" kèm Badge phần trăm (≥90% tone success,
     70-89% tone warning, <70% tone danger).
   - Thân: các khối nội dung nền canvas bo góc, mỗi khối có nhãn xs in hoa ở trên
     ("Định nghĩa", "Ngữ cảnh (AI tạo)"). Trong khối ngữ cảnh, từ khoá được in đậm.
   - Thẻ loại đề thi có thêm MiniBarChart minh hoạ ở giữa khối nội dung.
   - Hàng cuối: 3 nút cùng hàng — "Duyệt" (nền navy-700, chiếm phần lớn chiều ngang) |
     "Sửa" (viền line) | nút X vuông nhỏ (nền đỏ rất nhạt, chữ đỏ) để từ chối.

CỘT PHẢI — Card "Bảng điều khiển AI":
1. Tiêu đề "Bảng điều khiển AI", mô tả phụ "Tinh chỉnh System Prompt và tham số AI."
2. Nhãn "Bộ sinh nội dung hệ thống" kèm Badge neutral hiện tên mô hình đang dùng.
3. Ô soạn System Prompt: nền canvas, chữ nhỏ, font monospace, cao ~200px, cuộn được.
4. Nút "Cập nhật System Prompt" nền navy-700, icon Save, chiếm hết chiều ngang.
5. Hai ô thống kê cạnh nhau (StatTile): "LƯỢT GỌI API HÔM NAY" 12,402 kèm dòng phụ "/ 20.000"
   và ProgressBar bên dưới | "TOKEN ĐÃ DÙNG" 88.4M kèm dòng phụ "24 giờ qua".
6. Khối "Tham số": hai hàng, mỗi hàng gồm nhãn bên trái, giá trị bên phải, và thanh trượt
   (input range) bên dưới — "Nhiệt độ (Temperature)" 0.7 và "Top P" 0.9.

VIỆC CẦN LÀM:
1. Tạo src/mocks/data/ai.js và đăng ký handlers:
   - aiContent.list — 20 nội dung (loại: vocabulary/phrase/exam, tiêu đề, các khối nội dung,
     mô hình đã dùng, thời điểm sinh, trạng thái pending/approved/rejected, điểm tin cậy);
     lọc được theo loại và trạng thái, dùng paginate.
   - aiContent.approve / aiContent.reject / aiContent.update — trả bản ghi đã đổi trạng thái.
   - aiSettings.prompts và aiSettings.updatePrompt — 3-5 System Prompt (tên, mã, nội dung
     nhiều dòng, mô hình, phiên bản, lần sửa gần nhất).
   - aiSettings.quotas — hạn mức: lượt gọi hôm nay, giới hạn ngày, token đã dùng 24h,
     nhiệt độ, topP.
2. src/features/ai-content/ — api.js, hooks/, và các component theo bố cục trên.
3. Duyệt/từ chối phải invalidate đúng query key để danh sách và số "47 mục chờ" cập nhật ngay.
4. "Sửa" mở Modal cho sửa nội dung trước khi duyệt (gọi aiContent.update rồi approve).
5. "Từ chối" mở Modal bắt buộc chọn lý do (Nội dung sai / Không phù hợp / Trùng lặp / Khác)
   kèm ô ghi chú.
6. "Duyệt tất cả" mở ConfirmDialog nêu rõ số mục sẽ duyệt.
7. Đổi thanh trượt tham số hoặc sửa prompt thì nút "Cập nhật System Prompt" mới bật;
   lưu xong toast "Đã cập nhật cấu hình AI".

RÀNG BUỘC:
- Nội dung do AI sinh có thể là tiếng Anh (đó là DỮ LIỆU). Mọi NHÃN giao diện phải tiếng
  Việt — không để lại "Approve", "Edit", "Confidence Score", "New Vocab", "Examples", "Exams".
- Danh sách nội dung dùng Card, KHÔNG dùng bảng (nội dung dài).
- Cột phải cố định trên màn rộng; màn hẹp thì dồn xuống dưới cột trái.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /noi-dung-ai thấy 2 cột đúng bố cục, badge số mục chờ, 3 tab.
- Duyệt một thẻ → thẻ biến mất khỏi danh sách chờ và số mục chờ giảm 1.
- Từ chối mà không chọn lý do → không cho gửi.
- Kéo thanh trượt Nhiệt độ → giá trị hiện đổi theo và nút cập nhật bật lên.
- Thu hẹp cửa sổ → cột điều khiển xuống dưới, không vỡ layout.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 11 — Gói Premium & mã giảm giá (theo ảnh 5)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 11: màn cấu hình gói Premium và mã giảm giá tại /goi-premium,
dựng bám ảnh thiết kế.
Giai đoạn 0-10 đã xong, có Switch, ProgressBar trong src/components/ui/.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/admin-page/SKILL.md
- src/lib/endpoints.js — nhóm plans, coupons, subscriptions
- src/mocks/data/payments.js — đã có plans, coupons
- Schema:
  awk '/CREATE TABLE payment.coupons/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE payment.subscriptions/,/^\);/' .db/SmartEnglishAI_db.txt

BỐ CỤC THEO ẢNH THIẾT KẾ — hai cột: cột trái rộng (các gói), cột phải hẹp (~360px, mã
giảm giá):
1. Đầu trang: tiêu đề "Cấu hình gói Premium & giá", mô tả phụ "Quản lý các gói dịch vụ và
   mã giảm giá của hệ thống." Bên phải: nút "Lưu thay đổi" nền navy-700 icon Save
   (chỉ bật khi có thay đổi chưa lưu).
2. CỘT TRÁI — mục "Các gói dịch vụ" (tiêu đề nhỏ có icon LayoutGrid) kèm liên kết
   "+ Thêm gói mới" ở góc phải cùng hàng.
   Bên dưới là lưới thẻ gói, mỗi thẻ là một Card SỬA ĐƯỢC TRỰC TIẾP:
   - Hàng đầu: icon tròn + tên gói đậm.
   - Ô nhập "Tên gói".
   - Hàng 2 ô cạnh nhau: "Giá (VNĐ)" và "Thời hạn (tháng)". Dưới ô giá hiện bản xem trước
     đã định dạng, ví dụ "199.000đ".
   - Mục "TÍNH NĂNG BAO GỒM" (nhãn xs in hoa, có đường kẻ trên): các dòng gồm tên tính năng
     bên trái và Switch bên phải — "Trò chuyện AI không giới hạn", "Chấm điểm phát âm",
     "Sửa lỗi bài viết", "Không quảng cáo".
   - Gói được đánh dấu nổi bật có VIỀN brand-500 và ruy băng góc trên phải nền navy-700
     chữ trắng "PHỔ BIẾN NHẤT".
   - Gói ngừng bán thì làm mờ thẻ và hiện Badge neutral "Ngừng bán".
3. CỘT PHẢI — Card "Quản lý mã giảm giá" (tiêu đề có icon Tag):
   - Bảng gọn 3 cột: MÃ CODE (chữ monospace đậm màu brand-500) | GIẢM ("45%" hoặc
     "50.000đ") | ĐÃ DÙNG / HẠN MỨC ("128 / 500" kèm ProgressBar mảnh bên dưới).
     Mã đã hết lượt (dùng = hạn mức) thì cả hàng làm mờ đi.
   - Bên dưới, khối "⊕ Tạo mã mới" nền canvas bo góc: ô "Nhập mã (VD: HE2026)",
     ô "Giảm" kèm đơn vị % hoặc đ (chọn được), ô "Số lượng", ô chọn ngày hết hạn,
     và nút "Tạo mã giảm giá" nền navy-700 chiếm hết chiều ngang.

VIỆC CẦN LÀM:
1. Bổ sung mock cho plans.create/update/remove, coupons.create/update/remove và
   ENDPOINTS.subscriptions.list.
2. src/features/plans/api.js, hooks/usePlans.js, hooks/useCoupons.js.
3. src/features/plans/PlansPage.jsx theo bố cục trên.
   Sửa trực tiếp trên thẻ gói chỉ thay đổi state cục bộ; chỉ khi bấm "Lưu thay đổi" mới
   gọi API cho các gói đã đổi. Rời trang khi còn thay đổi chưa lưu thì cảnh báo.
4. Form tạo mã dùng react-hook-form + zod: mã tự viết hoa và bỏ khoảng trắng, giảm theo
   phần trăm phải trong 1-100, số lượng > 0, ngày hết hạn phải sau hôm nay. Lỗi tiếng Việt.
5. Xoá gói qua ConfirmDialog, chặn nếu còn người đang dùng, gợi ý dùng "Ngừng bán" thay thế.

RÀNG BUỘC:
- KHÔNG dùng DataTable cho lưới gói và bảng mã (ít dòng, bố cục riêng) — dùng Card và
  thẻ table thuần.
- Mọi chữ tiếng Việt — không để lại "Premium Package & Pricing Configurator", "Tên Gói",
  "MÃ CODE" kiểu nửa Anh nửa Việt trong nhãn mới viết.
- Tiền luôn định dạng vi-VN. Chỉ dùng token màu trong design-system.md.
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /goi-premium thấy 2 cột đúng bố cục; gói năm có viền xanh và ruy băng "PHỔ BIẾN NHẤT".
- Sửa giá một gói → bản xem trước định dạng đổi ngay, nút "Lưu thay đổi" bật lên.
- Gạt một công tắc tính năng rồi bấm Lưu → có toast, tải lại trang vẫn giữ (mock ghi nhớ
  trong phiên).
- Mã FLASH10 (1000/1000) hiện mờ đi trong bảng.
- Tạo mã với ngày hết hạn trong quá khứ → báo lỗi tiếng Việt, không cho tạo.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 12 — Giao dịch & đối soát (theo ảnh 6)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 12: màn giao dịch và đối soát tại /doi-soat, dựng bám ảnh thiết kế.
Giai đoạn 0-11 đã xong, DataTable đã hỗ trợ hàng mở rộng (expandable + renderExpandedRow).

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md
- src/components/ui/DataTable/ — DÙNG LẠI, bật expandable
- src/lib/endpoints.js — nhóm orders, revenue
- src/mocks/data/payments.js — đã có orders
- Schema: awk '/CREATE TABLE payment.orders/,/^\);/' .db/SmartEnglishAI_db.txt

BỐ CỤC THEO ẢNH THIẾT KẾ:
1. Đầu trang: tiêu đề "Giao dịch & Đối soát", mô tả phụ "Quản lý dòng tiền, theo dõi thanh
   toán và xử lý các yêu cầu hoàn tiền từ học viên."
2. Hàng 3 thẻ KPI, mỗi thẻ có ICON TRÒN LỚN bên trái và nội dung bên phải:
   - "DOANH THU HÔM NAY" (nhãn xs in hoa) — 124.500.000đ, dòng dưới "↗ +12% so với hôm qua"
     màu xanh lá. Icon tròn nền navy-700 chữ trắng.
   - "GIAO DỊCH THÀNH CÔNG" — 842, dòng dưới "Tỷ lệ thành công: 98.5%". Icon tròn nền
     xanh lá nhạt.
   - "YÊU CẦU HOÀN TIỀN" — 12 (số màu đỏ) kèm Badge warning "Đang chờ xử lý", dòng dưới là
     liên kết "Xem chi tiết →". Icon tròn nền đỏ nhạt.
3. Card thanh lọc riêng: 3 nút xổ xuống — khoảng ngày ("7 ngày qua (10/10 - 17/10)",
   icon Calendar) | cổng thanh toán ("Tất cả cổng thanh toán", icon Building) |
   trạng thái ("Trạng thái: Tất cả", icon Filter) — và liên kết "Xoá bộ lọc" bên phải.
4. Card bảng (DataTable, bật expandable) các cột:
   mũi tên mở rộng | MÃ GIAO DỊCH (chữ đậm màu brand-500, dạng "GD-98234A") |
   KHÁCH HÀNG (email) | GÓI ĐĂNG KÝ | SỐ TIỀN (Đ) (căn phải, ngăn cách nghìn) |
   CỔNG TT (StatusDot chấm màu + tên: MoMo hồng, VNPay xanh dương, ZaloPay xanh nhạt,
   Visa xám) | THỜI GIAN (2 dòng: ngày và giờ) | TRẠNG THÁI (Badge: success "Thành công",
   warning "Yêu cầu hoàn", info "Đã hoàn tiền", danger "Thất bại").
   Đơn đã hoàn tiền thì mã giao dịch bị gạch ngang.
5. HÀNG MỞ RỘNG (chỉ đơn có yêu cầu hoàn tiền) — nền canvas, chia 3 khối ngang:
   - Khối trái "LÝ DO HOÀN TIỀN" (nhãn có icon tam giác cảnh báo đỏ): trích dẫn lời khách
     trong hộp nền đỏ rất nhạt, chữ nghiêng. Bên dưới là 3 dòng kiểm tra điều kiện, mỗi
     dòng gồm nhãn bên trái và giá trị bên phải kèm đánh giá trong ngoặc:
     "Tiến độ khoá học: 2% (Hợp lệ)" | "Thời gian mua: Dưới 7 ngày (Hợp lệ)" |
     "Phiếu hỗ trợ: #HT-4412" (mã là liên kết màu brand-500).
     Chữ "(Hợp lệ)" màu xanh lá, "(Không hợp lệ)" màu đỏ.
   - Khối giữa "NHẬT KÝ WEBHOOK CỔNG THANH TOÁN" (nhãn có icon Terminal): khối mã nền
     ĐEN chữ sáng, font monospace, cỡ nhỏ, cuộn được, hiện JSON thô của webhook.
   - Khối phải: chữ "Số tiền hoàn (100%)" nhỏ ở trên, số tiền cỡ lớn màu đỏ đậm,
     rồi nút "Phê duyệt hoàn tiền" (nền ĐỎ ĐẶC chữ trắng, icon Undo2) và nút
     "Từ chối & Gửi email" (viền line) bên dưới.

VIỆC CẦN LÀM:
1. Bổ sung mock: thêm vào một số bản ghi orders trường refundRequest gồm lý do khách viết,
   tiến độ khoá học, số ngày kể từ khi mua, mã phiếu hỗ trợ, và chuỗi JSON nhật ký webhook.
   Đăng ký ENDPOINTS.orders.refund (trả đơn đã chuyển trạng thái refunded) và
   ENDPOINTS.orders.reconcile.
2. src/features/transactions/api.js, hooks/, columns.jsx.
3. src/features/transactions/TransactionsPage.jsx theo bố cục trên.
4. "Phê duyệt hoàn tiền" phải qua ConfirmDialog nêu rõ số tiền và cảnh báo không thể hoàn
   tác; xong thì invalidate danh sách, đóng hàng mở rộng, toast "Đã hoàn tiền cho đơn <mã>".
5. "Từ chối & Gửi email" mở Modal có ô lý do bắt buộc, gửi xong toast.
6. Liên kết "Xem chi tiết →" ở thẻ KPI hoàn tiền sẽ đặt bộ lọc trạng thái thành
   "Yêu cầu hoàn" và cuộn xuống bảng.

RÀNG BUỘC:
- Chỉ đơn có yêu cầu hoàn tiền mới mở rộng được; đơn khác thì ẩn mũi tên.
- Khối nhật ký webhook là nơi DUY NHẤT được dùng nền tối trong toàn ứng dụng (nó là khối
  mã), phần còn lại giữ nền sáng.
- Mọi chữ tiếng Việt — không để lại "Search transactions...", "Export Data".
- Tiền định dạng vi-VN đầy đủ. Chỉ dùng token màu trong design-system.md.
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /doi-soat thấy 3 KPI có icon tròn, thanh lọc, bảng giao dịch.
- Bấm mũi tên ở đơn "Yêu cầu hoàn" → mở khối 3 phần đúng bố cục, có khối mã nền đen.
- Bấm "Phê duyệt hoàn tiền" → xác nhận → trạng thái đổi "Đã hoàn tiền", mã giao dịch bị
  gạch ngang.
- Bấm "Xem chi tiết →" ở thẻ KPI → bảng tự lọc còn các đơn yêu cầu hoàn.
- Bấm "Xoá bộ lọc" → về danh sách đầy đủ.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 13 — Dữ liệu chi tiết (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 13: màn thống kê chi tiết tại /du-lieu-chi-tiet.
Màn này KHÔNG có ảnh thiết kế — dựng theo design system và bám phong cách Dashboard đã làm.
Giai đoạn 0-12 đã xong, có bộ biểu đồ src/components/charts/ và Dashboard.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/dashboard-chart/SKILL.md và .claude/rules/design-system.md
- src/features/dashboard/DashboardPage.jsx — bám đúng phong cách đã dựng
- src/components/charts/ — DÙNG LẠI, không viết biểu đồ mới
- src/lib/endpoints.js — nhóm stats
- Schema: awk '/CREATE TABLE content.system_daily_stats/,/^\);/' .db/SmartEnglishAI_db.txt

VIỆC CẦN LÀM:
1. Bổ sung mock vào src/mocks/data/dashboard.js và đăng ký handlers:
   - stats.userGrowth — đăng ký mới theo ngày, 30 ngày
   - stats.conversion — tỷ lệ Free sang Premium theo tháng, 6 tháng
   - stats.churn — số huỷ gói và tỷ lệ churn theo tháng, 6 tháng
   - stats.retention — retention D1, D7, D30 theo tuần
   Shape bám content.system_daily_stats, tên trường camelCase.
2. src/features/stats/api.js và hooks/useStats.js.
3. src/features/stats/StatsPage.jsx — tiêu đề "Dữ liệu chi tiết", bộ chọn khoảng thời gian
   ở Topbar (7 ngày / 30 ngày / 3 tháng / 12 tháng) áp dụng cho TOÀN TRANG:
   - Hàng 4 KPI: tổng người dùng, người dùng hoạt động tháng, tỷ lệ chuyển đổi, tỷ lệ churn.
   - LineChartCard "Tăng trưởng người dùng" (đăng ký mới theo ngày).
   - Hai cột: LineChartCard "Tỷ lệ chuyển đổi Free sang Premium" và LineChartCard
     "Tỷ lệ rời bỏ (churn)".
   - BarChartCard "Tỷ lệ giữ chân" — 3 nhóm cột D1, D7, D30.
   - DonutCard "Tính năng được dùng nhiều" (dùng lại stats.featureUsage đã có mock).
   - LineChartCard "Lượng token AI tiêu thụ" (dùng stats.aiUsage đã có mock).
   - Nút "Xuất CSV" xuất toàn bộ số liệu đang xem.

RÀNG BUỘC:
- Khoảng thời gian phải nằm trong query key để dữ liệu tải lại đúng.
- Mọi nhãn, đơn vị, chú giải tiếng Việt. Tỷ lệ hiện kèm %.
- Thứ tự màu chuỗi navy-700 → brand-400 → brand-200.
- Đủ 3 trạng thái đang tải / rỗng / lỗi cho từng biểu đồ.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /du-lieu-chi-tiet thấy 4 KPI và 6 biểu đồ, không biểu đồ nào trắng trơn.
- Đổi khoảng thời gian → biểu đồ hiện skeleton rồi vẽ lại.
- Rê chuột lên mọi biểu đồ đều có tooltip tiếng Việt, số đã định dạng.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 14 — Phân quyền (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 14: màn vai trò và phân quyền tại /phan-quyen.
Màn này KHÔNG có ảnh thiết kế — dựng theo design system.
Giai đoạn 0-13 đã xong, có Switch trong src/components/ui/.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/admin-page/SKILL.md
- src/lib/endpoints.js — nhóm roles
- src/mocks/data/users.js — đã có mảng roles

VIỆC CẦN LÀM:
1. Bổ sung mock: ENDPOINTS.roles.permissions trả danh sách quyền gom theo nhóm chức năng
   (Người dùng, Học liệu, Nội dung AI, Thanh toán, Thống kê, Hệ thống), mỗi quyền có mã
   (dạng "content.write"), tên tiếng Việt, mô tả ngắn.
   Thêm mock roles.create, roles.update, roles.remove.
2. src/features/roles/api.js và hooks/useRoles.js.
3. src/features/roles/RolesPage.jsx:
   - Tiêu đề "Phân quyền", nút "Thêm vai trò" bên phải.
   - Cột trái (~320px): danh sách vai trò dạng thẻ bấm chọn được, mỗi thẻ hiện tên tiếng
     Việt, mã vai trò (chữ monospace nhỏ), số người dùng đang giữ. Thẻ đang chọn có viền
     brand-500.
   - Cột phải: ma trận quyền của vai trò đang chọn — quyền gom theo nhóm, mỗi quyền một
     dòng gồm tên + mô tả bên trái và Switch bên phải. Mỗi nhóm có công tắc "Chọn cả nhóm".
     Vai trò admin toàn quyền và BỊ KHOÁ không cho sửa, hiện ghi chú "Vai trò hệ thống,
     không thể chỉnh sửa".
   - Có thay đổi chưa lưu thì hiện thanh dính dưới cùng với nút "Lưu thay đổi" và "Huỷ".
     Lưu xong toast "Đã cập nhật quyền cho vai trò <tên>".
4. Modal thêm/sửa vai trò: tên hiển thị, mã vai trò, mô tả. react-hook-form + zod,
   lỗi tiếng Việt.
5. Xoá vai trò qua ConfirmDialog, chặn nếu còn người dùng đang giữ, nêu rõ lý do.

RÀNG BUỘC:
- Không dùng DataTable cho danh sách vai trò — dùng thẻ.
- Mọi chữ tiếng Việt. Chỉ dùng token màu trong design-system.md.
- Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /phan-quyen: chọn vai trò khác nhau thì ma trận quyền đổi theo.
- Bật/tắt một quyền → hiện thanh "Lưu thay đổi"; bấm Huỷ thì về trạng thái cũ.
- Chọn vai trò admin → mọi công tắc bị khoá kèm ghi chú.
- Thử xoá vai trò "Học viên" (đang có 28.394 người) → bị chặn kèm lý do.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 15 — Khoá học & Bài học (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 15: quản lý khoá học và bài học tại /hoc-lieu/khoa-hoc.
Màn này KHÔNG có ảnh thiết kế — dựng theo design system, bám phong cách màn Kho từ vựng.
Giai đoạn 0-14 đã xong, có DataTable và màn từ vựng.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/admin-page/SKILL.md
- src/features/vocabulary/ — bám đúng phong cách đã dựng (breadcrumb, thanh công cụ, bảng)
- src/lib/endpoints.js — nhóm courses, lessons
- src/mocks/data/content.js — tạo ở giai đoạn 9, bổ sung tiếp
- Schema:
  awk '/CREATE TABLE content.courses/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE content.lessons/,/^\);/' .db/SmartEnglishAI_db.txt

VIỆC CẦN LÀM:
1. Bổ sung vào src/mocks/data/content.js: 6 khoá học (tên, mô tả, cấp độ CEFR, số bài học,
   số người đang học, trạng thái nháp/đã xuất bản, ngày cập nhật) và 8-12 bài học mỗi khoá
   (tiêu đề, thứ tự, loại nội dung, thời lượng ước tính, trạng thái).
   Đăng ký handlers cho courses.* và lessons.* (kể cả lessons.byCourse, lessons.reorder).
2. src/features/courses/api.js, hooks/, columns.jsx.
3. src/features/courses/CoursesPage.jsx — DataTable: KHOÁ HỌC (tên đậm + mô tả rút gọn
   một dòng), CẤP ĐỘ (Badge), SỐ BÀI HỌC, SỐ NGƯỜI HỌC, TRẠNG THÁI (Badge success
   "Đã xuất bản" / neutral "Bản nháp"), CẬP NHẬT, THAO TÁC.
   Tìm kiếm theo tên, lọc theo cấp độ và trạng thái. Nút "Thêm khoá học".
   Bấm hàng sang /hoc-lieu/khoa-hoc/:id.
4. src/features/courses/CourseDetailPage.jsx:
   - Đầu trang: nút quay lại, tên khoá, Badge trạng thái, nút "Xuất bản" hoặc "Chuyển về
     nháp", nút "Sửa thông tin".
   - Card thông tin khoá: mô tả, cấp độ, số người học, ngày tạo/cập nhật.
   - Card "Danh sách bài học": bảng SẮP XẾP LẠI ĐƯỢC BẰNG KÉO THẢ (dùng thuộc tính
     draggable của HTML, KHÔNG cài thư viện kéo thả). Mỗi dòng: số thứ tự, tiêu đề,
     loại nội dung, thời lượng, trạng thái, menu thao tác.
     Thả xong gọi ENDPOINTS.lessons.reorder và toast "Đã cập nhật thứ tự bài học".
   - Nút "Thêm bài học" mở Modal: tiêu đề, loại nội dung, thời lượng, mô tả.
5. Xuất bản khoá học qua ConfirmDialog, chặn nếu khoá chưa có bài học nào.

RÀNG BUỘC:
- KHÔNG cài thư viện kéo thả — dùng draggable + dragstart/dragover/drop.
- Mọi nhãn giao diện tiếng Việt.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-lieu/khoa-hoc thấy 6 khoá; bấm một khoá mở trang chi tiết.
- Kéo một bài học lên vị trí khác → thứ tự đổi ngay và có toast.
- Thử xuất bản khoá chưa có bài học → bị chặn kèm lý do.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 16 — Bài đọc & Bài nghe (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 16: quản lý bài đọc và bài nghe tại /hoc-lieu/bai-doc.
Màn này KHÔNG có ảnh thiết kế — dựng theo design system, bám phong cách màn Kho từ vựng.
Giai đoạn 0-15 đã xong.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md
- src/features/vocabulary/ — bám phong cách Tabs + thanh công cụ + DataTable đã dựng
- src/lib/endpoints.js — nhóm readings, listenings
- src/mocks/data/content.js

VIỆC CẦN LÀM:
1. Bổ sung vào src/mocks/data/content.js: 15 bài đọc (tiêu đề, đoạn văn tiếng Anh, cấp độ
   CEFR, chủ đề, số từ, thời gian đọc ước tính, số câu hỏi, trạng thái) và 12 bài nghe
   (tiêu đề, đường dẫn audio giả, thời lượng giây, bản ghi lời thoại, cấp độ, chủ đề,
   số câu hỏi, trạng thái). Đăng ký handlers cho readings.* và listenings.*.
2. src/features/reading-listening/ — api.js, hooks/, columns.jsx.
3. Trang chung với Tabs 2 mục, dùng chung một component bảng có tham số:
   - "Bài đọc": TIÊU ĐỀ, CẤP ĐỘ (Badge), CHỦ ĐỀ, SỐ TỪ, THỜI GIAN ĐỌC, SỐ CÂU HỎI,
     TRẠNG THÁI, THAO TÁC.
   - "Bài nghe": TIÊU ĐỀ, CẤP ĐỘ, CHỦ ĐỀ, THỜI LƯỢNG (dạng "2:45"), SỐ CÂU HỎI,
     TRẠNG THÁI, THAO TÁC.
   Cả hai có tìm kiếm theo tiêu đề và lọc theo cấp độ, chủ đề, trạng thái.
4. Modal soạn bài đọc: tiêu đề, chủ đề, cấp độ, Textarea cao nhập đoạn văn; bên dưới TỰ
   ĐẾM số từ và ước lượng thời gian đọc theo thời gian thực.
5. Modal soạn bài nghe: tiêu đề, chủ đề, cấp độ, vùng kéo thả file audio dùng react-dropzone
   (chỉ nhận mp3/m4a/wav, tối đa 20MB, sai định dạng báo lỗi tiếng Việt); chọn xong hiện
   tên file, dung lượng và trình phát <audio controls> để nghe thử; ô nhập bản ghi lời thoại.
   Tải lên gọi ENDPOINTS.listenings.uploadAudio, mock trả đường dẫn giả.

RÀNG BUỘC:
- Nội dung tiếng Anh trong đoạn văn và bản ghi là DỮ LIỆU, được phép; nhãn giao diện
  phải tiếng Việt.
- Trình phát audio dùng thẻ <audio controls> gốc, không cài thư viện phát nhạc.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-lieu/bai-doc thấy 2 tab, tab Bài đọc 15 bản ghi, tab Bài nghe 12.
- Soạn bài đọc: gõ đoạn văn → số từ và thời gian đọc đổi theo.
- Kéo file .txt vào vùng tải audio → báo lỗi định dạng tiếng Việt.
- Kéo file mp3 vào → hiện tên file và nghe thử được.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 17 — Bài kiểm tra & ngân hàng câu hỏi (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 17: bài kiểm tra tại /hoc-lieu/bai-kiem-tra.
Màn này KHÔNG có ảnh thiết kế — dựng theo design system.
Giai đoạn 0-16 đã xong, toàn bộ phần học liệu còn lại đã có.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/data-table/SKILL.md và .claude/skills/admin-page/SKILL.md
- src/lib/endpoints.js — nhóm quizzes, questions
- src/mocks/data/content.js
- Schema:
  awk '/CREATE TABLE learning.quizzes/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE learning.questions/,/^\);/' .db/SmartEnglishAI_db.txt

VIỆC CẦN LÀM:
1. Bổ sung mock: 10 bài kiểm tra (tiêu đề, mô tả, cấp độ, số câu, thời gian làm bài,
   điểm đạt, số lượt làm, trạng thái) và 30 câu hỏi (nội dung, loại câu, các lựa chọn,
   đáp án đúng, giải thích, điểm). Đăng ký handlers cho quizzes.* và questions.*.
2. src/features/quizzes/api.js, hooks/, columns.jsx.
3. src/features/quizzes/QuizzesPage.jsx — DataTable: TIÊU ĐỀ, CẤP ĐỘ, SỐ CÂU,
   THỜI GIAN LÀM ("15 phút"), ĐIỂM ĐẠT, SỐ LƯỢT LÀM, TRẠNG THÁI, THAO TÁC.
   Nút "Tạo bài kiểm tra". Bấm hàng sang trang soạn đề.
4. src/features/quizzes/QuizEditorPage.jsx — trang soạn đề:
   - Đầu trang: tiêu đề bài, Badge trạng thái, nút "Lưu" và "Xuất bản".
   - Card cài đặt: tiêu đề, mô tả, cấp độ, thời gian làm bài, điểm đạt, công tắc xáo trộn
     câu hỏi.
   - Danh sách câu hỏi: mỗi câu là một Card GẤP/MỞ được, hiện số thứ tự, nội dung câu hỏi,
     loại câu (Badge: "Trắc nghiệm" / "Đúng sai" / "Điền từ" / "Nối"), số điểm.
     Mở ra sửa được nội dung, các lựa chọn (thêm/xoá), chọn đáp án đúng bằng radio,
     và ô giải thích.
   - Nút "Thêm câu hỏi" ở cuối, cho chọn loại câu trước khi thêm.
   - Sắp xếp lại bằng nút mũi tên lên/xuống trên từng Card (không cần kéo thả).
   - Thanh dính dưới hiện tổng điểm toàn bài, kèm cảnh báo nếu có câu chưa có đáp án đúng.
5. Xuất bản bị chặn nếu chưa có câu hỏi, hoặc có câu chưa chọn đáp án đúng — nêu rõ câu số mấy.

RÀNG BUỘC:
- Nội dung câu hỏi tiếng Anh là DỮ LIỆU; nhãn giao diện tiếng Việt.
- KHÔNG dùng DataTable cho danh sách câu hỏi trong trang soạn đề — dùng Card gấp/mở.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Mở /hoc-lieu/bai-kiem-tra thấy 10 bài; bấm một bài mở trang soạn đề.
- Thêm câu trắc nghiệm mới, thêm 4 lựa chọn, chọn đáp án đúng → tổng điểm cập nhật ngay.
- Xoá đáp án đúng của một câu rồi bấm Xuất bản → bị chặn kèm số thứ tự câu thiếu.

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm".
```

---

## Giai đoạn 18 — Thông báo, báo cáo, nhật ký, cài đặt (không có ảnh gốc)

```
Dự án: SmartEnglish Admin — trang quản trị React 19 + Vite + Tailwind 4, giao diện tiếng Việt.
Đang ở GIAI ĐOẠN 18 (cuối): bốn màn vận hành — /thong-bao, /bao-cao, /nhat-ky, /cai-dat.
Các màn này KHÔNG có ảnh thiết kế — dựng theo design system.
Giai đoạn 0-17 đã xong, toàn bộ phần còn lại của trang quản trị đã hoàn thiện.

ĐỌC TRƯỚC KHI LÀM:
- .claude/memory/MEMORY.md
- .claude/skills/admin-page/SKILL.md và .claude/skills/data-table/SKILL.md
- src/lib/endpoints.js — nhóm notifications, reports, system, auth
- Schema:
  awk '/CREATE TABLE notification.templates/,/^\);/' .db/SmartEnglishAI_db.txt
  awk '/CREATE TABLE social.post_reports/,/^\);/' .db/SmartEnglishAI_db.txt

VIỆC CẦN LÀM:
1. Tạo src/mocks/data/system.js và đăng ký handlers cho notifications.*, reports.*,
   system.activityLog:
   - 12 thông báo (tiêu đề, nội dung, đối tượng nhận, trạng thái nháp/đã gửi/hẹn giờ,
     số người nhận, số người đã mở, thời điểm gửi)
   - 6 mẫu thông báo (mã, tiêu đề, nội dung có chỗ thay thế dạng {{ten}}, kênh gửi)
   - 15 báo cáo vi phạm (loại nội dung bị báo, người báo, lý do, nội dung trích dẫn,
     trạng thái chờ xử lý/đã xử lý/đã bỏ qua, thời điểm)
   - 40 dòng nhật ký hoạt động (người thực hiện, hành động, đối tượng, địa chỉ IP, thời điểm)
2. /thong-bao — DataTable: TIÊU ĐỀ, ĐỐI TƯỢNG (Badge: "Tất cả" / "Người dùng Premium" /
   "Người dùng miễn phí"), TRẠNG THÁI, SỐ NGƯỜI NHẬN, TỶ LỆ MỞ ("62%"), THỜI ĐIỂM GỬI,
   THAO TÁC. Nút "Soạn thông báo" mở Modal: tiêu đề, nội dung, đối tượng, gửi ngay hay
   hẹn giờ. Tab phụ "Mẫu thông báo" quản lý các mẫu.
   Gửi thông báo qua ConfirmDialog nêu rõ số người sẽ nhận.
3. /bao-cao — danh sách báo cáo vi phạm dạng Card (nội dung dài): loại nội dung, trích dẫn
   nội dung bị báo, người báo, lý do, thời điểm, nút "Xử lý" / "Bỏ qua". Lọc theo trạng thái.
   "Xử lý" mở Modal chọn hành động (ẩn nội dung / cảnh cáo người dùng / khoá tài khoản)
   kèm ghi chú.
4. /nhat-ky — DataTable chỉ đọc: THỜI ĐIỂM, NGƯỜI THỰC HIỆN, HÀNH ĐỘNG (Badge theo nhóm),
   ĐỐI TƯỢNG, ĐỊA CHỈ IP. Lọc theo người thực hiện và khoảng thời gian, tìm kiếm theo
   hành động. Nút "Xuất CSV". KHÔNG có cột thao tác.
5. /cai-dat — Tabs 2 mục:
   - "Hồ sơ cá nhân": ảnh đại diện, tên hiển thị, email, số điện thoại; form đổi mật khẩu
     (mật khẩu hiện tại, mật khẩu mới, nhập lại) dùng react-hook-form + zod, kiểm tra hai
     lần nhập khớp nhau, lỗi tiếng Việt. Gọi ENDPOINTS.auth.updateProfile và
     auth.changePassword (bổ sung mock cho hai endpoint này).
   - "Hệ thống": thông tin phiên bản, trạng thái kết nối backend (đọc VITE_USE_MOCK để hiện
     Badge "Đang dùng dữ liệu giả" hoặc "Đã kết nối API"), múi giờ, ngôn ngữ giao diện.

RÀNG BUỘC:
- Mọi chữ tiếng Việt. Nhật ký chỉ đọc, không cho sửa/xoá.
- Chỉ dùng token màu trong design-system.md. Không thêm dependency mới.

XONG KHI:
- npm run lint sạch.
- Bốn đường dẫn đều mở được và có dữ liệu; KHÔNG còn trang "Đang xây dựng" nào trong
  toàn bộ menu.
- Soạn và gửi một thông báo → xác nhận nêu đúng số người nhận → trạng thái đổi "Đã gửi".
- Đổi mật khẩu nhập hai lần khác nhau → báo lỗi tiếng Việt.
- Tab Hệ thống hiện Badge "Đang dùng dữ liệu giả" (vì VITE_USE_MOCK đang là true).

CUỐI CÙNG: ghi một dòng vào .claude/memory/MEMORY.md mục "Đã làm", cập nhật mục
"Hiện trạng" thành đã hoàn thiện toàn bộ giao diện admin, và "Việc tiếp theo" thành nối
API thật khi backend sẵn sàng.
```

---

## Sau khi xong toàn bộ

Khi backend sẵn sàng, KHÔNG dùng lại bộ prompt này. Thay vào đó:

1. Sửa đường dẫn thật trong `src/lib/endpoints.js`.
2. Đặt `VITE_USE_MOCK=false` trong `.env`.
3. Xoá thư mục `src/mocks/`.
4. Dùng agent `api-integrator` (`.claude/agents/api-integrator.md`) cho từng feature nếu
   shape dữ liệu thật khác mock.

Code trong `src/features/` không phải sửa nếu shape khớp.
