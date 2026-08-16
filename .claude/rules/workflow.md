# Quy trình làm việc & tiết kiệm token

## Vòng lặp chuẩn

```
MEMORY.md → rules liên quan → code → verify → cập nhật MEMORY.md
```

Bỏ bước 1 hoặc bước cuối = lỗi quy trình.

## Tiết kiệm token — luật cứng

**Đọc**
- Grep/Glob để định vị trước, chỉ Read đúng đoạn cần (`offset`/`limit`). Không Read cả file > 300 dòng để "xem cho biết".
- Không đọc lại file vừa sửa để kiểm tra — Edit đã báo lỗi nếu thất bại.
- Không `cat` cả thư mục, không đọc `node_modules`, `package-lock.json`, `.dist`.
- Một file chỉ đọc một lần trong phiên, trừ khi nó đã bị sửa bởi người khác.

**Sửa**
- Ưu tiên `Edit` thay vì `Write` khi file đã tồn tại. Write đè = tốn gấp đôi.
- Sửa nhiều chỗ trong cùng file → gộp thành các Edit liên tiếp, không đọc lại giữa chừng.

**Chạy**
- Gọi song song các tool độc lập trong cùng một lượt.
- Không chạy `npm run dev` để "xem thử" trừ khi người dùng yêu cầu chạy app — nó chiếm terminal và không trả về gì hữu ích.
- Verify bằng `npm run lint` hoặc `npx vitest run <file>`, không build toàn bộ.

**Subagent**
- Chỉ spawn khi người dùng nói rõ. Mỗi agent khởi động lạnh, phải đọc lại context = đắt nhất.

**Trả lời**
- Ngắn. Không tóm tắt lại code vừa viết, không liệt kê file đã tạo nếu tool đã hiển thị.
- Không hỏi lại những gì suy ra được từ code hoặc rules.

## Khi nào cập nhật memory

Cập nhật `memory/MEMORY.md` khi: xong một trang/module, thêm dependency, đổi cấu trúc thư mục, chốt một quyết định kỹ thuật.
Không ghi: chi tiết vụn vặt, nội dung đã có trong code, lỗi tự sửa trong cùng lượt.

## Định nghĩa "xong"

- `npm run lint` sạch.
- Không có `console.log` sót lại.
- Text UI bằng tiếng Việt.
- Màu lấy từ token trong `design-system.md`, không hardcode hex mới.
