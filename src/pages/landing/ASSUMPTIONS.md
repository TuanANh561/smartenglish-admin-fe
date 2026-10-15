# ASSUMPTIONS.md — SmartEnglish Landing Page

> File này liệt kê tất cả giả định đã được đưa ra khi code landing page.
> **Cần cập nhật trước khi ra mắt chính thức.**

---

## 🔴 CẦN THAY THẾ TRƯỚC KHI LAUNCH

### 1. Số liệu thống kê (trust signals)
- **Vị trí**: `TrustBar.jsx`, `TestimonialsSection.jsx` (stats row), `HeroSection.jsx` (trust badges)
- **Cần thay**: Số lượt tải, đánh giá app store, số học viên đang học, % cải thiện trung bình
- **Hiện tại**: `[CẦN SỐ LIỆU THẬT]`

### 2. Testimonials học viên
- **Vị trí**: `TestimonialsSection.jsx`
- **Cần thay**: 3 testimonials thật với tên, chức danh, ảnh đại diện thật của học viên đã đồng ý
- **Hiện tại**: Tên Việt Nam thật nhưng quote là placeholder có nhãn rõ

### 3. Giá các gói subscription
- **Vị trí**: `PricingSection.jsx`
- **Cần thay**: Giá gói Pro (hiển thị theo tháng và năm), gói Business (contact form hoặc giá cố định)
- **Hiện tại**: `[GIÁ]`

### 4. App Store / Google Play links
- **Vị trí**: `HeroSection.jsx`, `CTASection.jsx`
- **Cần thay**: Link thật đến App Store và Google Play khi app đã publish
- **Hiện tại**: `href="#download"` (anchor)

### 5. Email hỗ trợ
- **Vị trí**: `FAQSection.jsx` ("Liên hệ đội ngũ hỗ trợ"), `LandingFooter.jsx`
- **Cần thay**: Email thật (vd: support@smartenglish.vn)
- **Hiện tại**: `mailto:[CẦN EMAIL HỖ TRỢ]`

### 6. Social media links
- **Vị trí**: `LandingFooter.jsx`
- **Cần thay**: Link Facebook, YouTube, TikTok thật
- **Hiện tại**: `href="#"`

---

## 🟡 QUYẾT ĐỊNH THIẾT KẾ ĐÃ ĐƯA RA

### Logo
- Dùng text logo "SmartEnglish" với icon `BookOpen` (Lucide) màu amber
- **Lý do**: Không có file logo thật → text logo đẹp, dễ thay sau

### Palette amber `#F59E0B`
- Màu này **không có** trong `design-system.md` của admin app
- **Lý do**: Landing page là trang riêng, có thể dùng palette khác admin dashboard
- Nếu muốn đồng nhất 100%, thay `#F59E0B` → `#1D8FE1` (brand-500)

### Ngôn ngữ
- Tiêu đề section: **Tiếng Anh** (font Merriweather, serif, uy tín)
- Mô tả, label, body: **Tiếng Việt** (font Inter)
- **Lý do**: User chọn "Song ngữ Việt-Anh"

### Testimonials
- 3 cards với tên Việt Nam thực tế nhưng toàn bộ quote là `[CẦN DỮ LIỆU THẬT]`
- **Lý do**: Rule "không dùng fake data" — tên placeholder rõ ràng, không để người dùng nhầm

### Pricing tier
- Free → Pro → Business (3 tier)
- Pro được highlight vì là tier chuyển đổi chính
- **Lý do**: Pattern chuẩn của market, phù hợp đối tượng người đi làm luyện IELTS

---

## 🟢 ASSUMPTIONS AN TOÀN (không cần thay)

- Màu navy `#1B3A57` — đúng với design system (navy-700)
- Framer Motion animations — đã có trong project
- lucide-react icons — đã có trong project
- Google Fonts Merriweather + Inter — load qua CSS @import, không cần cài npm
- `prefers-reduced-motion` — đã handle trong tất cả animations
- Responsive breakpoints: 480px, 768px, 900px, 1200px

---

## 📋 TODO TRƯỚC LAUNCH CHECKLIST

- [ ] Thay số liệu thật vào TrustBar + TestimonialsSection
- [ ] Thay testimonials bằng feedback học viên thật (có xác nhận)
- [ ] Cập nhật giá các gói vào PricingSection
- [ ] Thêm app store links khi app publish
- [ ] Thêm email hỗ trợ vào FAQSection + Footer
- [ ] Thêm social media links thật vào Footer
- [ ] Upload logo file thật (nếu có) → thay text logo trong Navbar + Footer
- [ ] SEO: Cập nhật title, description, og:image trong index.html
- [ ] Analytics: Thêm tracking vào các data-cta buttons
- [ ] Test Lighthouse trên production build
