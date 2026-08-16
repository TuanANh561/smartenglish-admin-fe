---
name: dashboard-chart
description: Vẽ biểu đồ trong SmartEnglish Admin bằng recharts — line, bar, donut, sparkline, KPI trend. Dùng khi cần trực quan hoá số liệu người dùng, doanh thu, tỉ lệ sử dụng tính năng.
---

# Biểu đồ (recharts)

Bảng màu bắt buộc: `.claude/rules/design-system.md` → mục "Biểu đồ".

## Chọn dạng

| Nhu cầu | Dạng |
|---|---|
| Xu hướng theo thời gian, ≤ 3 chuỗi | Line mượt (`type="monotone"`) |
| So sánh theo kỳ (tháng/tuần) | Bar, nhấn kỳ hiện tại |
| Tỉ trọng, ≤ 4 hạng mục | Donut vòng mảnh, phần dư gộp "Khác" |
| Xu hướng nhỏ trong card | Sparkline không trục |

> 6 hạng mục → dùng bảng xếp hạng, không dùng biểu đồ tròn.

## Khuôn mẫu

Bọc trong `Card` với header: tiêu đề trái (`text-base font-medium text-navy-700`), legend/tổng phải (`text-sm text-ink-muted`).
Luôn dùng `<ResponsiveContainer width="100%" height={260}>`.

```jsx
<LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
  <CartesianGrid vertical={false} stroke="#E6EDF3" strokeDasharray="3 3" />
  <XAxis dataKey="day" tickLine={false} axisLine={false}
         tick={{ fill: '#64748B', fontSize: 12 }} />
  <YAxis hide />
  <Tooltip content={<ChartTooltip />} />
  <Line type="monotone" dataKey="free"    stroke="#1B3A57" strokeWidth={2} dot={false} />
  <Line type="monotone" dataKey="premium" stroke="#29A8E8" strokeWidth={2} dot={false} />
</LineChart>
```

Bar nhấn kỳ hiện tại:

```jsx
<Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
  {data.map((d, i) => (
    <Cell key={i} fill={i === data.length - 1 ? '#1B3A57' : '#D6DFE8'} />
  ))}
</Bar>
```

## Quy tắc

- Thứ tự màu: `#1B3A57` → `#29A8E8` → `#9ED2F2` → `#EEF3F7`. Không dùng màu ngẫu nhiên của recharts.
- Tooltip tự viết, nền trắng, `border-line`, `rounded-lg`, số đã format tiếng Việt — không dùng tooltip mặc định.
- Bỏ trục Y khi giá trị đã hiện ở nhãn hoặc tooltip.
- Không animation lặp; `isAnimationActive` để mặc định, không tăng thời lượng.
- Nhãn trục, legend, đơn vị: tiếng Việt.
- Rỗng/lỗi: hiện chữ căn giữa `text-sm text-ink-muted`, không vẽ khung trống.
