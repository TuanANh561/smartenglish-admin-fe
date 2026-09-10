# SmartEnglish AI — Admin Dashboard

Repository chứa **Admin Frontend** của đồ án tốt nghiệp *Hệ thống học tập tiếng Anh thông minh tích hợp trí tuệ nhân tạo (SmartEnglish AI)*.

Ứng dụng web quản trị nội bộ dành cho Quản trị viên (Admin), cung cấp giao diện trực quan để vận hành hệ thống, quản lý người dùng, duyệt nội dung AI, quản lý kho học liệu (từ vựng, bài đọc, bài nghe, bài kiểm tra), quản lý gói cước & đối soát thanh toán.

---

## 1. Kiến trúc & Vị trí trong hệ thống

```
┌────────────────────────────────┐
│   SmartEnglish Admin Frontend  │
│    (React 19 + Vite + Tailwind)│
│          ← Repo này            │
└───────────────┬────────────────┘
                │
                │ REST API (JSON / FormData)
                ▼
┌────────────────────────────────────────────────────────┐
│             SmartEnglish AI Backend                    │
│      (Microservices Spring Boot 3 + Java 17)           │
│                                                        │
│ • API Gateway       : http://localhost:8080/api        │
│ • Content Service   : http://localhost:8082            │
│ • Auth Service      : http://localhost:8081            │
│ • Learning Service  : http://localhost:8083            │
│ • AI Service        : http://localhost:8084            │
│ • Payment Service   : http://localhost:8085            │
└────────────────────────────────────────────────────────┘
```

---

## 2. Công nghệ sử dụng

- **Core Framework**: [React 19](https://react.dev/), [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (sử dụng `@theme` tokens tùy biến, tối ưu bảng màu Light Mode chuẩn mực)
- **Quản lý trạng thái & Cache**: [Zustand](https://github.com/pmndrs/zustand), [TanStack Query v5 (React Query)](https://tanstack.com/query)
- **Bảng biểu & Dữ liệu**: [TanStack Table v9](https://tanstack.com/table) (phân trang, sắp xếp đa tiêu chí, mở rộng dòng chi tiết, xuất CSV)
- **Biểu đồ thống kê**: [Recharts](https://recharts.org/) (KPI Cards, Line/Bar Chart, Donut Breakdown tùy biến cao cấp)
- **Form & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Biểu tượng & UI**: [Lucide React](https://lucide.dev/), [React Hot Toast](https://react-hot-toast.com/), [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Xử lý tệp & Import**: [PapaParse](https://www.papaparse.com/), React Dropzone

---

## 3. Các chức năng chính đã triển khai

### 3.1. Tổng quan & Thống kê (`/`)
- **Dashboard KPI**: Tổng người dùng hoạt động, học viên trả phí, tỷ lệ chuyển đổi, doanh thu thực tế.
- **Biểu đồ xu hướng**: Tăng trưởng người dùng mới, tỷ trọng học viên theo cấp độ CEFR, doanh thu theo tháng.
- **Bảng hoạt động gần đây**: Lịch sử thao tác, đăng ký và giao dịch thời gian thực.

### 3.2. Quản lý kho học liệu (`/hoc-lieu/*`)
- **Từ vựng (`/hoc-lieu/tu-vung`)**:
  - Danh sách từ vựng kèm phát âm IPA, cấp độ CEFR, từ loại, audio phát âm trực tiếp.
  - Thêm mới / Chỉnh sửa từ vựng kèm bộ câu hỏi bài tập củng cố trắc nghiệm đa năng.
  - Hỗ trợ **Wizard Import file**: Tải file lên để trích xuất danh sách từ vựng hàng loạt vào hệ thống.
- **Bài đọc hiểu (`/hoc-lieu/bai-doc`)**: Quản lý các bài đọc theo trình độ A1–C2, ngân hàng câu hỏi đọc hiểu đi kèm.
- **Bài luyện nghe (`/hoc-lieu/bai-nghe`)**: Quản lý audio nghe, transcript tương tác và bộ câu hỏi trắc nghiệm theo bài nghe.
- **Ngân hàng đề & bài kiểm tra (`/hoc-lieu/bai-kiem-tra`)**:
  - Quản lý ngân hàng câu hỏi (trắc nghiệm, điền từ, nối từ, sắp xếp câu).
  - Quản lý bộ đề thi (TOEIC, IELTS, bài kiểm tra định kỳ) dạng Card Grid trực quan.

### 3.3. Kiểm duyệt nội dung AI (`/noi-dung-ai`)
- Quy trình duyệt nội dung do AI sinh ra (Từ vựng, Ví dụ, Đề thi) với các trạng thái: *Chờ duyệt, Phê duyệt, Từ chối*.
- Bảng điều khiển cấu hình **System Prompt** và tham số AI (Temperature, Max tokens) với giao diện Dark Console chuyên nghiệp.
- Công cụ chẩn đoán kết nối API Gemini trực tiếp từ giao diện Admin.

### 3.4. Quản lý học viên (`/hoc-vien`)
- Danh sách học viên, lọc theo vai trò và trạng thái tài khoản.
- Xem chi tiết lịch sử học tập, số khóa học đã tham gia, tiến độ hoàn thành và điểm kiểm tra.
- Hỗ trợ xuất dữ liệu ra file CSV chuẩn UTF-8.

### 3.5. Doanh thu, Gói cước & Đối soát (`/doanh-thu`, `/doi-soat`, `/goi-premium`)
- **Doanh thu**: Thống kê doanh thu theo gói học, theo chu kỳ và phương thức thanh toán.
- **Đối soát giao dịch**: Quản lý đơn hàng (VNPay, MoMo, Stripe), chi tiết lý do và phê duyệt / từ chối yêu cầu hoàn tiền.
- **Gói cước & Coupon**: Cấu hình giá, tính năng các gói Premium và tạo mã khuyến mãi.

### 3.6. Quản lý cộng đồng (`/cong-dong`)
- Giám sát diễn đàn học tập, bài viết, bình luận của học viên.
- Tích hợp cửa sổ chat hỗ trợ trực tuyến đa tác vụ nổi (Floating Chat Messenger).

---

## 4. Cấu trúc thư mục dự án

```
smartenglish-admin/
├── public/                 # Tài nguyên tĩnh
├── src/
│   ├── components/         # Các thành phần tái sử dụng
│   │   ├── charts/         # Bộ biểu đồ Recharts tùy biến (Line, Bar, Donut, SparkLine)
│   │   ├── layout/         # Khung giao diện (Sidebar, Topbar, AppShell, ProtectedRoute)
│   │   └── ui/             # 19+ UI Primitives chuẩn (Button, Modal, Input, DataTable, Drawer...)
│   ├── features/           # Phân chia theo từng phân hệ nghiệp vụ
│   │   ├── aiContent/      # Duyệt nội dung & Cấu hình prompt AI
│   │   ├── auth/           # Đăng nhập & Xác thực JWT
│   │   ├── community/      # Quản trị cộng đồng & Chat
│   │   ├── dashboard/      # Màn hình Dashboard tổng quan
│   │   ├── listening/      # Quản lý bài nghe
│   │   ├── premium/        # Quản lý gói cước & Coupon
│   │   ├── quiz/           # Ngân hàng câu hỏi & Bộ đề thi
│   │   ├── reading/        # Quản lý bài đọc
│   │   ├── revenue/        # Thống kê doanh thu
│   │   ├── students/       # Quản lý học viên
│   │   ├── transactions/   # Đối soát giao dịch & Hoàn tiền
│   │   └── vocabulary/     # Quản lý từ vựng & Import file
│   ├── lib/
│   │   ├── api.js          # HTTP Client Axios với interceptors JWT & chuyển mạch mock
│   │   ├── endpoints.js    # Nơi khai báo tập trung tất cả đường dẫn API hệ thống
│   │   ├── ipaHelper.js    # Tiện ích phát âm và hiển thị ký tự phiên âm IPA
│   │   └── utils.js        # Tiện ích format tiền tệ, ngày tháng, phần trăm
│   ├── mocks/              # Bộ dữ liệu mẫu giả lập phục vụ phát triển khi chưa có backend
│   ├── store/              # Quản lý trạng thái xác thực và người dùng (Zustand)
│   ├── index.css           # Định nghĩa Design System Tokens Tailwind 4
│   ├── main.jsx            # Điểm khởi chạy ứng dụng React
│   └── routes.jsx          # Cấu hình định tuyến toàn bộ ứng dụng
├── package.json
└── vite.config.js
```

---

## 5. Hướng dẫn cài đặt & Khởi chạy

### 5.1. Cài đặt phụ thuộc
Yêu cầu môi trường máy có cài đặt **Node.js 18+** và **npm**:

```bash
# 1. Di chuyển vào thư mục dự án
cd smartenglish-admin

# 2. Cài đặt các gói phụ thuộc
npm install
```

### 5.2. Cấu hình file `.env`
Tạo tệp `.env` tại thư mục gốc của `smartenglish-admin`:

```env
# URL API Backend
# - Khi chạy qua API Gateway: http://localhost:8080/api
# - Khi chạy trực tiếp với Content Service: http://localhost:8082
VITE_API_URL=http://localhost:8082

# Chế độ dữ liệu giả (Mock Mode):
# - true : Sử dụng dữ liệu giả lập trong thư mục src/mocks (không cần backend)
# - false: Kết nối gọi API máy chủ backend thực tế
VITE_USE_MOCK=true

# Khóa API Google Gemini (dùng cho công cụ AI sinh học liệu & test prompt)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 5.3. Khởi chạy môi trường phát triển
```bash
npm run dev
```
Truy cập giao diện tại: [http://localhost:5173](http://localhost:5173)

### 5.4. Các lệnh kiểm thử & Đóng gói
```bash
npm run lint         # Kiểm tra chuẩn mã nguồn bằng ESLint
npm run test         # Chạy các bài kiểm thử tự động với Vitest
npm run build        # Đóng gói bản phát hành sản phẩm (Production Bundle)
npm run preview      # Xem trước bản đóng gói cục bộ
```

---

## 6. Cơ chế chuyển đổi Mock Data và API thật

Hệ thống được thiết kế theo cơ chế **Clean Decoupling**:
- Toàn bộ các URL API được tập trung duy nhất tại `src/lib/endpoints.js`.
- Client `src/lib/api.js` tự động kiểm tra cờ `VITE_USE_MOCK`:
  - Khi `VITE_USE_MOCK=true`: Các yêu cầu được chuyển hướng qua `src/mocks/handlers.js` để trả về dữ liệu mẫu có cấu trúc chuẩn như database backend.
  - Khi `VITE_USE_MOCK=false`: Client sẽ gửi HTTP request thực tế đến URL `VITE_API_URL` kèm theo token `Bearer` xác thực.
- Các component trong `src/features/*` không phụ thuộc vào mock, giúp việc chuyển sang backend thật diễn ra trơn tru mà không cần sửa đổi logic giao diện.

---

## 7. Thành viên thực hiện

- **Nguyễn Thế Anh** — Sinh viên thực hiện
- **Nguyễn Tuấn Anh** — Sinh viên thực hiện
