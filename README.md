# SmartEnglish Admin — Trang quản trị

Repository này chứa **Admin Frontend** của đồ án *Hệ thống học tập tiếng Anh thông minh tích hợp trí tuệ nhân tạo*. Bắt đầu 08/2026.

Hệ thống được chia thành nhiều repository độc lập; đây là một trong số đó.

## 1. Giới thiệu

Trang quản trị nội bộ dành cho quản trị viên của hệ thống. Ứng dụng cung cấp giao diện vận hành người dùng, học liệu, nội dung do AI sinh ra, gói Premium và các số liệu thống kê của toàn hệ thống.

Đây là ứng dụng frontend, không chứa nghiệp vụ phía máy chủ. Toàn bộ dữ liệu được lấy qua API của backend (repository riêng).

## 2. Mục tiêu

Mục tiêu của hệ thống tổng thể: xây dựng hệ thống học tiếng Anh hỗ trợ người học thông qua AI, gồm Web/Mobile cho học viên và Web Admin cho quản trị viên, đồng thời hỗ trợ giáo viên quản lý lớp học và quá trình học tập.

Mục tiêu của repository này: cung cấp công cụ quản trị và vận hành cho hệ thống trên.

## 3. Vị trí trong hệ thống

Hệ thống gồm nhiều repository riêng biệt, dùng chung một backend:

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   Learner Web    │  │    Mobile App    │  │  Admin Frontend  │
│    (Next.js)     │  │  (React Native)  │  │    (React.js)    │
│   repo riêng     │  │   repo riêng     │  │  ← repo này      │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │ HTTP API
                      ┌────────┴─────────┐
                      │     Backend      │
                      │  (Spring Boot)   │
                      │    repo riêng    │
                      └────────┬─────────┘
                               │
                      ┌────────┴─────────┐
                      │    Dịch vụ AI    │
                      └──────────────────┘
```

**Kiến trúc backend:** chưa quyết định. Sẽ bổ sung khi được chốt.

### Các repository liên quan

| Repository | Thành phần | Công nghệ | Đường dẫn |
|---|---|---|---|
| Admin Frontend | Trang quản trị (repo này) | React.js | Cập nhật sau |
| Learner Web | Web học tập cho học viên | Next.js | Cập nhật sau |
| Mobile App | Ứng dụng di động cho học viên | React Native | Cập nhật sau |
| Backend | API và nghiệp vụ | Spring Boot | Cập nhật sau |

## 4. Công nghệ sử dụng

Của repository này:

| Hạng mục | Công nghệ |
|---|---|
| Thư viện giao diện | React.js |
| Công cụ build | Vite |
| Giao tiếp API | Backend Spring Boot qua HTTP |

Thành phần AI sẽ được cập nhật trong quá trình phát triển.

## 5. Các đối tượng người dùng

| Đối tượng | Được phục vụ bởi |
|---|---|
| Quản trị viên | **Repository này** |
| Học viên | Learner Web, Mobile App |
| Giáo viên | Repository khác — chưa xác định |

## 6. Chức năng chính

### 6.1. Chức năng của repository này — Quản trị viên

**Tài khoản và phân quyền**
- Đăng nhập
- Quản lý thông tin cá nhân
- Quản lý người dùng
- Khóa/mở khóa tài khoản
- Phân quyền
- Quản lý vai trò

**Quản lý học liệu**
- Quản lý từ vựng
- Quản lý khóa học
- Quản lý bài học
- Quản lý bài đọc
- Quản lý bài nghe
- Quản lý nội dung kiểm tra

**Quản lý nội dung AI**
- Xem nội dung AI tạo
- Phê duyệt/chỉnh sửa/từ chối nội dung
- Cấu hình System Prompt
- Quản lý giới hạn sử dụng AI

**Premium và thanh toán**
- Quản lý gói Premium
- Cấu hình giá
- Quản lý mã giảm giá
- Xem giao dịch
- Đối soát giao dịch
- Báo cáo doanh thu

**Thống kê**
- Thống kê người dùng
- DAU/MAU
- Tỷ lệ Free → Premium
- Churn
- Thống kê tính năng
- Thống kê sử dụng AI

**Quản lý hệ thống**
- Quản lý thông báo
- Quản lý báo cáo/vi phạm
- Theo dõi hoạt động hệ thống

### 6.2. Ngoài phạm vi repository này — Giáo viên

Các chức năng dưới đây thuộc hệ thống tổng thể nhưng **không** được cài đặt trong repository này. Repository phụ trách chưa được xác định.

- **Tài khoản:** đăng ký, đăng nhập, quản lý thông tin cá nhân, thiết lập thông tin giảng dạy
- **Quản lý lớp học:** tạo và quản lý lớp, cấp mã tham gia, xem danh sách học viên, xóa học viên khỏi lớp
- **Quản lý bài tập:** tạo bài tập, giao bài cho lớp, thiết lập thời hạn, thiết lập điểm yêu cầu, theo dõi tình trạng nộp bài
- **Theo dõi học tập:** xem bảng điểm, tiến độ học viên, kết quả kiểm tra, thống kê lớp
- **Học liệu:** tra cứu từ vựng, tạo/chỉnh sửa học liệu, tạo bài học, tạo bài kiểm tra, đề xuất nội dung cho học viên
- **Tương tác:** đăng bài, bình luận, thích bài viết

## 7. Cấu trúc repository dự kiến

```
smartenglish-admin/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/          # thành phần giao diện dùng lại
│   │   ├── layout/      # bố cục chung: sidebar, thanh trên
│   │   └── charts/      # biểu đồ
│   ├── features/        # mỗi module một thư mục
│   ├── lib/             # tiện ích dùng chung, lớp gọi API
│   ├── store/           # trạng thái toàn cục
│   ├── routes.jsx
│   └── main.jsx
├── index.html
├── vite.config.js
└── package.json
```

Cấu trúc trên là dự kiến và sẽ được điều chỉnh trong quá trình phát triển.

## 8. Hướng dẫn cài đặt và chạy dự án

### Yêu cầu môi trường

- Node.js và npm
- Backend đang chạy (repository riêng) để ứng dụng lấy được dữ liệu thật

### Các bước

```bash
# 1. Clone repository
git clone <đường-dẫn-repository>
cd smartenglish-admin

# 2. Cài đặt phụ thuộc
npm install

# 3. Tạo file .env ở thư mục gốc (xem bảng biến môi trường bên dưới)

# 4. Chạy môi trường phát triển
npm run dev
```

### Biến môi trường

File `.env` không được đẩy lên git. Tạo thủ công với nội dung:

```
VITE_API_URL=http://localhost:8080/api
VITE_USE_MOCK=true
```

| Biến | Ý nghĩa |
|---|---|
| `VITE_API_URL` | Địa chỉ gốc của API backend. Chỉ có tác dụng khi `VITE_USE_MOCK=false`. |
| `VITE_USE_MOCK` | `true` dùng dữ liệu giả trong `src/mocks` (mặc định khi chưa có backend), `false` gọi API thật. |

### Các lệnh

| Lệnh | Tác dụng |
|---|---|
| `npm run dev` | Chạy môi trường phát triển |
| `npm run build` | Đóng gói bản phát hành |
| `npm run preview` | Xem thử bản đã đóng gói |
| `npm run lint` | Kiểm tra chất lượng mã nguồn |

Khi backend sẵn sàng: sửa đường dẫn trong `src/lib/endpoints.js` cho khớp API thật và đặt `VITE_USE_MOCK=false`. Mã nguồn trong `src/features` không cần sửa.

## 9. Trạng thái phát triển

Repository này đang trong giai đoạn khởi động (bắt đầu 08/2026).

| Hạng mục | Trạng thái |
|---|---|
| Khởi tạo dự án và cấu hình | Đang thực hiện |
| Bố cục chung và điều hướng | Chưa bắt đầu |
| Các màn hình chức năng | Chưa bắt đầu |
| Kết nối API backend | Chưa bắt đầu — backend chưa sẵn sàng |
| Kiến trúc backend | Chưa quyết định |
| Thành phần AI | Chưa xác định |

## 10. Thành viên

| Họ và tên | Vai trò |
|---|---|
| Nguyễn Thế Anh | Sinh viên thực hiện |
| Nguyễn Tuấn Anh | Sinh viên thực hiện |

## 11. Repository và liên hệ

| Mục | Thông tin |
|---|---|
| Repository | Cập nhật sau |
| Email | Cập nhật sau |
