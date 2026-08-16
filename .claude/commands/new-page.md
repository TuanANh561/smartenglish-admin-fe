---
description: Tạo một trang admin mới theo chuẩn dự án
argument-hint: <tên trang> (vd. students, revenue)
---

Tạo trang admin `$1` theo skill `admin-page`.

Trình tự:
1. Đọc `.claude/memory/MEMORY.md` và `.claude/rules/design-system.md`.
2. Áp dụng skill `admin-page` (`.claude/skills/admin-page/SKILL.md`).
3. Tạo `src/features/$1/` + đăng ký route + thêm mục Sidebar.
4. Dữ liệu để mock có ghi chú `// MOCK:` nếu chưa có API.
5. `npm run lint`.
6. Ghi một dòng vào memory.

Nếu `$1` trống, hỏi tên trang trước khi làm.
