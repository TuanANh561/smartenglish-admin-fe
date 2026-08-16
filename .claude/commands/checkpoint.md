---
description: Cập nhật memory sau khi xong một hạng mục
---

Cập nhật `.claude/memory/MEMORY.md`:

1. Đọc file memory hiện tại.
2. Xem `git status` và `git diff --stat` để biết thực tế đã thay đổi gì.
3. Ghi vào mục **Đã làm**: một dòng, ngày `YYYY-MM-DD`, mô tả hạng mục (không phải danh sách file).
4. Nếu có quyết định kỹ thuật mới → thêm vào **Quyết định**.
5. Cập nhật **Đang làm** và **Việc tiếp theo**.
6. Xoá dòng đã lỗi thời thay vì chồng thêm — file phải luôn dưới 60 dòng.

Không thêm chi tiết đã nằm trong code hoặc lịch sử git. Xong thì trả lời một câu.
