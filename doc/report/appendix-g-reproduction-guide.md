# Phụ lục G. Cài đặt, kiểm thử và tái lập

## G.1. Yêu cầu môi trường

| Thành phần | Yêu cầu |
|---|---|
| Hệ điều hành | Ubuntu/Pop!_OS hoặc môi trường chạy được CLIPS native |
| Node.js | Từ 20.9; dự án dùng target ES2022 |
| npm | Đi cùng bản Node.js được chọn |
| CLIPS | 6.x, có executable `clips` trong `PATH` |
| SQLite | Được nhúng qua `better-sqlite3`; không cần server riêng |
| LibreOffice | Chỉ cần khi tái trích xuất văn bản luật bằng `npm run law:extract` |

Các phiên bản package trực tiếp được khóa trong `package-lock.json`; nhóm không nên ghi lại toàn bộ cây dependency vào báo cáo.

Môi trường dùng cho lần kiểm tra nội dung phụ lục ngày 21/09/2026:

| Thành phần | Phiên bản quan sát được |
|---|---|
| Node.js | 24.21.0 |
| npm | 11.19.0 |
| CLIPS package | 6.30-4.1 |
| Knowledge base | `inheritance-kb-v21` |

## G.2. Cài đặt

```bash
sudo apt update
sudo apt install clips
npm ci
```

Mặc định CSDL nằm tại `data/inheritance.db`. Có thể đặt đường dẫn khác bằng biến môi trường `DATABASE_PATH`; không đặt biến này nếu muốn dùng vị trí mặc định.

Khởi tạo schema:

```bash
npm run db:init
```

## G.3. Chạy ứng dụng

Chế độ phát triển:

```bash
npm run dev
```

Sau đó mở `http://localhost:3000`; trang gốc chuyển tới Guided Conversation. Quick Logic Test nằm tại `http://localhost:3000/logic-test`.

Build và chạy bản production:

```bash
npm run build
npm run start
```

## G.4. Kiểm thử

Chạy toàn bộ kiểm thử:

```bash
npm test
```

Lệnh trên chạy lần lượt 13 script CLIPS trong `knowledge-base/tests/` và 18 tệp test TypeScript trong `tests/`. Lần kiểm tra ngày 21/09/2026 hoàn tất với exit code 0; phần Node test runner báo 18 test files pass, 0 fail. Ba case study ở `tests/case_test/` chưa nằm trong lệnh này và không được tính vào kết quả tự động.

Có thể chạy riêng:

```bash
npm run test:kb
npm run test:app
```

## G.5. Kiểm tra metadata và nguồn rule

```bash
npm run kb:generate
npm run kb:sources
npm run kb:sources:check
```

- `kb:generate` sinh `rule-metadata.clp` từ registry.
- `kb:sources` sinh catalog ánh xạ Rule ID–implementation–source.
- `kb:sources:check` kiểm tra catalog đã đồng bộ; lệnh này cũng chạy trước `next build`.

Không sửa trực tiếp file sinh tự động rồi bỏ qua source registry.

## G.6. Chạy fixture CLIPS độc lập

```bash
clips -f2 knowledge-base/run-fixture.clp
clips -f2 knowledge-base/run-machine-fixture.clp
```

File thứ nhất phục vụ đọc trace trong terminal; file thứ hai kiểm tra line protocol mà adapter sử dụng. Muốn đổi fixture phải sửa đường dẫn `load-facts` trong driver hoặc sử dụng Quick Logic Test, không nối nội dung người dùng vào câu lệnh shell.

## G.7. Tái lập ba case Chương 5

1. Mở `/logic-test`.
2. Tải từng file trong `tests/case_test/clp_test/`.
3. Chạy lần lượt các chủ đề được đánh giá: người hưởng, thế vị, thời hiệu và phân chia di sản; với Case 3 chạy thêm từ chối nhận di sản khi artifact đã hỗ trợ.
4. Xuất Markdown và CLP.
5. So sánh theo subject–predicate–value với expected output trong `tests/case_test/doc_case-test/`.
6. Không ghi đè artifact cũ trước khi lưu phiên bản knowledge base, commit và ngày chạy.

Hiện quy trình này còn thủ công. Hướng hoàn thiện là tạo expected manifest và runner tự động cho ba case.

## G.8. Thông tin cần ghi khi đóng băng báo cáo

- commit hash;
- ngày và múi giờ chạy;
- phiên bản Node.js, npm và CLIPS;
- `knowledgeBaseVersion`;
- đường dẫn CSDL thử nghiệm;
- lệnh test đã chạy và exit code;
- thay đổi chưa commit có ảnh hưởng tới kết quả hay không.
