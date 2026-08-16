# Design System — SmartEnglish AI Admin

Trích từ bản thiết kế dashboard gốc. **Đây là nguồn màu duy nhất.** Không sinh màu mới.

## Palette

| Token | Hex | Dùng cho |
|---|---|---|
| `navy-900` | `#0F3A5C` | Nền sidebar (đáy gradient) |
| `navy-800` | `#17456B` | Nền sidebar (đỉnh gradient) |
| `navy-700` | `#1B3A57` | Chữ tiêu đề, số liệu KPI, cột bar được nhấn |
| `brand-600` | `#1673B8` | Hover nút chính |
| `brand-500` | `#1D8FE1` | Nav item đang chọn, nút chính, link |
| `brand-400` | `#29A8E8` | Đường "Premium", cung donut phụ, icon nhấn |
| `brand-200` | `#9ED2F2` | Chuỗi dữ liệu nhạt thứ 3 |
| `surface` | `#FFFFFF` | Nền card |
| `canvas` | `#F5F8FB` | Nền trang |
| `border` | `#E6EDF3` | Viền card, đường kẻ bảng |
| `text` | `#334155` | Chữ thường |
| `text-muted` | `#64748B` | Nhãn phụ, header bảng, caption |
| `chart-idle` | `#D6DFE8` | Cột/lát biểu đồ không nhấn |

### Trạng thái (badge)

| Trạng thái | Chữ | Nền |
|---|---|---|
| Thành công | `#15803D` | `#DCFCE7` |
| Đã xong / thông tin | `#1D4ED8` | `#DBEAFE` |
| Chờ xác thực | `#A16207` | `#FEF3C7` |
| Thất bại | `#B91C1C` | `#FEE2E2` |

Chỉ số tăng dùng `#15803D`, chỉ số giảm dùng `#DC2626`.

## Khai báo trong Tailwind 4

Đặt trong `src/index.css` (Tailwind 4 dùng `@theme`, **không** có `tailwind.config.js`):

```css
@import "tailwindcss";

@theme {
  --color-navy-900: #0F3A5C;
  --color-navy-800: #17456B;
  --color-navy-700: #1B3A57;
  --color-brand-600: #1673B8;
  --color-brand-500: #1D8FE1;
  --color-brand-400: #29A8E8;
  --color-brand-200: #9ED2F2;
  --color-canvas:    #F5F8FB;
  --color-line:      #E6EDF3;
  --color-ink:       #334155;
  --color-ink-muted: #64748B;
  --color-chart-idle:#D6DFE8;
}
```

Dùng: `bg-navy-900`, `text-ink-muted`, `border-line`.

## Hình khối

- Card: `bg-white rounded-xl border border-line p-5` + shadow rất nhẹ (`shadow-[0_1px_2px_rgba(16,24,40,0.04)]`). Không shadow dày.
- Sidebar rộng `w-64`, nền gradient navy, nav item bo `rounded-lg`, item active nền `brand-500` đặc.
- Badge: `rounded-full px-2.5 py-0.5 text-xs font-medium`.
- Nút chính: `bg-navy-700 text-white rounded-lg px-4 py-2 text-sm`.
- Khoảng cách giữa các khối: `gap-5`. Padding trang: `p-6`.

## Chữ

- Font hệ thống (`system-ui`). Không nhúng font ngoài.
- Tiêu đề trang: `text-2xl font-semibold text-navy-700`.
- Số liệu KPI: `text-3xl font-bold text-navy-700`.
- Nhãn: `text-sm text-ink-muted`. Header bảng: `text-xs uppercase tracking-wide text-ink-muted`.

## Biểu đồ (recharts)

- Line: chuỗi chính `navy-700`, chuỗi phụ `brand-400`, `strokeWidth={2}`, `type="monotone"`, không chấm điểm.
- Bar: mặc định `chart-idle`, cột được nhấn `navy-700` + tooltip label.
- Donut: `innerRadius` lớn (dạng vòng mảnh), tối đa 4 lát, phần "Khác" dùng `#EEF3F7`.
- Grid: chỉ kẻ ngang, `stroke="#E6EDF3"` nét đứt. Bỏ trục Y nếu đã có nhãn giá trị.
- Legend dạng chấm tròn nhỏ + chữ `text-sm`.

## ⛔ Cấm — tránh "giao diện AI sinh tự động"

- Gradient tím/hồng/neon, `from-purple-500 to-pink-500`, nền gradient toàn trang.
- Glassmorphism, `backdrop-blur`, viền phát sáng, `shadow-2xl`.
- Emoji làm icon → dùng `lucide-react`, `size={18}`, `strokeWidth={1.75}`.
- Bo góc quá lớn (`rounded-3xl`), animation nảy, hover phóng to.
- Dark mode (bản này chỉ có light).
- Chữ tiếng Anh trong UI, marketing copy, câu cảm thán.
