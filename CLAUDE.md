# SmartEnglish AI — Admin Dashboard

React 19 + Vite 8 + Tailwind 4. Trang quản trị nội bộ (tiếng Việt).

## ⛔ BẮT BUỘC trước khi làm bất cứ việc gì

1. Đọc `.claude/memory/MEMORY.md` — biết đã làm tới đâu, tránh làm lại.
2. Đọc `.claude/rules/` — file nào liên quan tới việc đang làm thì đọc file đó.
3. Làm việc.
4. Cập nhật `.claude/memory/MEMORY.md` khi xong một hạng mục.

Không đọc → dễ làm trùng, sai màu, sai cấu trúc.

## Bản đồ `.claude/`

| Đường dẫn | Đọc khi nào |
|---|---|
| `memory/MEMORY.md` | **Luôn luôn, đầu tiên** |
| `rules/workflow.md` | Luôn luôn (quy trình + quy tắc tiết kiệm token) |
| `rules/design-system.md` | Chạm vào UI, màu, layout |
| `rules/conventions.md` | Tạo file/thư mục/đặt tên mới |
| `skills/*/SKILL.md` | Tự động khi task khớp mô tả skill |
| `agents/*.md` | Chỉ khi người dùng yêu cầu subagent |

## Lệnh

```bash
npm run dev      # vite dev server
npm run build
npm run lint
npx vitest run   # test
```

## Ràng buộc cứng

- **Tiếng Việt** cho mọi text hiển thị trong UI.
- **Không tự ý đổi palette.** Màu duy nhất được dùng nằm ở `rules/design-system.md`.
- Không thêm dependency mới nếu `package.json` đã có thứ tương đương.
