<p align="center">
  <img src="public/loxera-logo.png" alt="Loxera English" width="96" />
</p>

<h1 align="center">SmartEnglish AI — Web quản lý (Admin & Giáo viên)</h1>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=flat-square&logo=reactquery&logoColor=white" alt="TanStack Query" />
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel" alt="Vercel" />
</p>

Trang web cho **quản trị viên** và **giáo viên** của hệ thống học tiếng Anh SmartEnglish AI (thương hiệu *Loxera English*).
Học viên dùng ứng dụng di động ([`smartenglish-ai-mobile`](../smartenglish-ai-mobile)); mọi dữ liệu đi qua API Gateway của [`smartenglish-ai-backend`](../smartenglish-ai-backend).

---

## 1. Vị trí trong hệ thống

```
 Web quản lý (React) ─┐
                      ├──HTTPS──► API Gateway :8080 ──► các microservice (Eureka)
 App học viên (Expo) ─┘                │
                                       └──SockJS/STOMP /ws-chat──► social-service (chat realtime)
```

- Chỉ gọi **một địa chỉ** là API Gateway (`VITE_API_URL`); Eureka / discovery-service là chuyện nội bộ của backend, web không cần cấu hình thêm.
- Chat realtime đi qua gateway tại `${VITE_API_URL}/ws-chat` (có thể ghi đè bằng `VITE_WS_URL`).
- Thông báo realtime nhận qua **SSE** từ notification-service.

## 2. Công nghệ

| Nhóm | Thư viện | Dùng để |
|---|---|---|
| Nền tảng | React 19, Vite, React Router | SPA, định tuyến |
| Giao diện | Tailwind CSS 4, lucide-react | Design system navy / brand, icon đơn sắc |
| Dữ liệu | TanStack Query, Axios, Zustand | Gọi API + cache, tự refresh token khi 401, trạng thái đăng nhập |
| Bảng / biểu đồ | TanStack Table, Recharts | Danh sách lớn có lọc/sắp xếp, thống kê doanh thu |
| Form | react-hook-form, zod | Kiểm tra dữ liệu nhập |
| Nhập/xuất file | xlsx, papaparse | Import từ vựng, đề thi từ Excel/CSV; xuất CSV |
| Realtime | @stomp/stompjs, sockjs-client | Nhắn tin cộng đồng |
| Kiểm thử | Vitest | Unit test |

## 3. Chức năng

### Dùng chung

- **Trang giới thiệu** (`/`) — landing page giới thiệu ứng dụng; menu di động có nút Đăng nhập.
- **Đăng nhập** (`/dang-nhap`) có bước xác thực OTP qua email; **mỗi trình duyệt một phiên** (đổi tài khoản ở tab khác thì các tab tự tải lại).
- **Đăng ký giáo viên** (`/dang-ky-giao-vien`) — hồ sơ chờ quản trị viên duyệt.
- **Cộng đồng** (`/app/cong-dong`) — bài đăng, kết bạn, hộp tin nhắn realtime.
- **Hồ sơ, Cài đặt, Thông báo**.

### Giáo viên

| Trang | Nội dung |
|---|---|
| Lớp học `/app/lop-hoc` | Tạo lớp, mã tham gia, học viên, giáo trình; **giao bài** (chọn sẵn bài học khi giao từ tab Khoá học), xem chi tiết bài, **xem bài nộp & chấm điểm** |
| Học liệu `/app/hoc-lieu/*` | Từ vựng, ngữ pháp, phát âm & kịch bản nói, khoá học, bài đọc, bài nghe, đề kiểm tra |
| Nội dung AI `/app/noi-dung-ai` | Soạn bài/đề với AI; chỉ thấy nội dung **của mình và của hệ thống** |
| Gói dịch vụ `/app/goi-dich-vu` | Xem gói, nâng cấp (không cho hạ cấp khi đang dùng gói cao hơn), **huỷ gói & yêu cầu hoàn tiền** |

### Quản trị viên

| Trang | Nội dung |
|---|---|
| Tổng quan `/app` | Số liệu người dùng, học tập, doanh thu |
| Người dùng `/app/nguoi-dung` | Danh sách, chi tiết, khoá/mở tài khoản, cấp gói trực tiếp |
| Phân quyền `/app/phan-quyen` | Ma trận quyền theo vai trò (Khách / Học viên / Giáo viên / Quản trị) và phạm vi dữ liệu |
| Doanh thu, Giao dịch, Đối soát | Đơn hàng SePay, đối soát giao dịch ngân hàng, duyệt hoàn tiền |
| Báo cáo `/app/bao-cao` | Xử lý báo cáo vi phạm cộng đồng |
| Nhật ký `/app/nhat-ky` | Lịch sử thao tác |
| Lớp học | Xem và chỉnh thông tin lớp (không giao bài thay giáo viên) |

## 4. Cấu trúc thư mục

```
src/
├── components/      # ui/ (Button, Modal, DataTable…), layout/ (AppShell, Sidebar, GuestOnlyRoute)
├── features/        # mỗi nghiệp vụ một thư mục: classes, vocabulary, premium, community, permissions…
├── pages/landing/   # trang giới thiệu (components/*)
├── lib/             # api.js (axios + refresh token), endpoints.js (mọi URL API), rbac.js, utils.js
├── store/           # authStore (Zustand)
├── mocks/           # dữ liệu giả cho chế độ VITE_USE_MOCK=true
└── routes.jsx
```

Quy ước: mọi URL API khai báo ở `lib/endpoints.js`; feature không import axios trực tiếp; text giao diện tiếng Việt; màu lấy từ token trong `src/index.css` (xem `.claude/rules/design-system.md`).

## 5. Cài đặt & chạy

```bash
npm install
cp .env.example .env    # nếu chưa có .env
npm run dev             # http://localhost:5173
```

Biến môi trường:

| Biến | Ví dụ | Ý nghĩa |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8080` | Địa chỉ API Gateway |
| `VITE_USE_MOCK` | `false` | `true` = dùng dữ liệu giả trong `src/mocks`, không cần backend |
| `VITE_WS_URL` | *(để trống)* | Ghi đè địa chỉ SockJS chat; mặc định `${VITE_API_URL}/ws-chat` |

Lệnh khác:

```bash
npm run lint      # ESLint
npm run test      # Vitest
npm run build     # build production vào dist/
```

## 6. Triển khai lên Vercel

1. Import repo vào Vercel, **Root Directory** = `smartenglish-admin`. `vercel.json` đã cấu hình build và rewrite mọi đường dẫn về `index.html` (tránh 404 khi tải lại trang con).
2. Khai báo `VITE_API_URL=https://api.<domain>` và `VITE_USE_MOCK=false`.
3. Backend **bắt buộc chạy HTTPS** (trình duyệt chặn gọi `http://` từ trang `https://`) và proxy WebSocket cho đường dẫn `/ws-chat`.

## 7. Tài khoản kiểm thử

Liên hệ nhóm thực hiện để được cấp tài khoản thử nghiệm.

## 8. Thành viên thực hiện

- **Nguyễn Thế Anh** — Sinh viên thực hiện
- **Nguyễn Tuấn Anh** — Sinh viên thực hiện

Giải đáp kỹ thuật (token, luồng thanh toán, chat, thông báo…): xem [`QUESTION.md`](../QUESTION.md).
