# Development plan — Guided Conversation UI

## 1. Mục tiêu

Chuyển giao diện mặc định từ cách tổ chức theo mô-đun kỹ thuật sang một cuộc hội thoại có hướng dẫn dành cho người dùng phổ thông. Người dùng chọn vấn đề thực tế, trả lời bằng các component có cấu trúc và nhận kết quả kèm căn cứ pháp luật.

Hệ thống không sử dụng LLM. Giao diện hội thoại chỉ là presenter; tri thức pháp lý vẫn nằm trong CLIPS dưới dạng facts, production rules và forward chaining.

## 2. Nguyên tắc kiến trúc

```text
Guided Conversation UI
  → Dialogue Manager
    → Topic catalog
    → Question/component catalog
    → Question planner
  → asserted facts trong SQLite
  → CLIPS forward chaining
  → results + missing requirements + traces
  → câu hỏi tiếp theo hoặc kết quả có căn cứ
```

- Không yêu cầu người dùng biết tên mô-đun hoặc Rule ID.
- Không chuyển câu trả lời tự do thành fact bằng NLP; chỉ dùng input có kiểu rõ ràng.
- Không hỏi người dùng một kết luận pháp lý có thể được CLIPS suy ra.
- `missing-requirement` dẫn tới câu hỏi observation hoặc presenter chuyên biệt như graph/timeline.
- Các workspace hiện tại được giữ làm chế độ kỹ thuật và kiểm chứng.
- Mọi câu trả lời đã lưu phải có thể sửa, chạy lại và truy vết.

## 3. Phạm vi câu hỏi đầu vào

| Topic ID | Câu hỏi của người dùng | Nhóm xử lý liên quan |
|---|---|---|
| `who-inherits` | Ai có thể được hưởng di sản? | loại thừa kế, quyền hưởng, từ chối, hàng thừa kế, thế vị |
| `will-validity` | Di chúc có hợp pháp không? | tính hợp pháp của di chúc |
| `person-eligibility` | Một người cụ thể có bị mất quyền hưởng không? | quyền hưởng, ngoại lệ di chúc |
| `representation` | Con hoặc cháu có được hưởng thế vị không? | graph gia đình, quyền hưởng, thế vị |
| `compulsory-share` | Ai vẫn được hưởng dù di chúc không cho hưởng? | di chúc, quyền hưởng, suất bắt buộc |
| `estate-settlement` | Di sản và nghĩa vụ được thanh toán/chia thế nào? | thanh toán, người chưa sinh, hạn chế chia |
| `limitation` | Còn thời hiệu yêu cầu về thừa kế không? | timeline Điều 623 |

## 4. Backlog chia theo task

### G0 — Nền tảng điều hướng

- [x] `G-001` Xác định topic catalog bằng ngôn ngữ người dùng.
- [x] `G-002` Chuyển `/` sang guided mode; giữ `/cases` và `/modules` làm lối vào kỹ thuật.
- [x] `G-003` Tạo intake dạng hội thoại và tạo hồ sơ cùng guided session bằng một transaction.
- [x] `G-004` Tạo guided case shell và thu thập fact chung đầu tiên: người để lại di sản.

### G1 — Dialogue Manager quyết định

- [x] `G-101` Định nghĩa catalog ánh xạ requirement sang `question`, `family-tree`, `people-review` hoặc `timeline`.
- [x] `G-102` Viết question planner có priority, chống hỏi trùng và fallback cho requirement chưa ánh xạ.
- [x] `G-103` Lưu topic và danh sách bước đã hoàn thành vào `guided_sessions` trong SQLite; facts tiếp tục là nguồn sự thật của câu trả lời.
- [x] `G-104` Thêm API lấy guided state gồm facts, latest runs, unresolved requirements và bước kế tiếp.
- [x] `G-105` Hoàn thành vertical slice API ghi answer theo transaction và trả state mới: `guided-deceased-name` ghi node gốc; `will-type` ghi observation, chạy CLIPS, lưu snapshot và chọn missing requirement tiếp theo.
- [ ] `G-106` Mở rộng answer mapper và inference dispatcher cho toàn bộ predicates trong question catalog; chỉ chạy lại rule package bị ảnh hưởng. Đã có guided inference dispatcher dùng chung và mapper cho trạng thái có/không có di chúc cùng toàn bộ `missing-requirement` của `will-validity`; các package còn lại tiếp tục được bổ sung theo từng vertical slice.

### G2 — Thu thập facts theo component

- [x] `G-201` Component registry cho choice, Boolean ba trạng thái, number, date và text label. Renderer dùng chung nhận metadata từ question catalog; các kiểu chưa có answer mapper sẽ chưa được planner đưa ra cho người dùng.
- [x] `G-202` Nhúng family graph vào luồng hội thoại thay vì điều hướng sang workspace khác; lưu graph facts, chạy `heir-rank` và trả quyền điều khiển cho question planner ngay trong cùng màn hình.
- [x] `G-203` Nhúng people review cho Điều 621, từ chối và suất bắt buộc. Ba presenter dùng lại người từ graph, lưu facts nguyên tử và chạy lại các package phụ thuộc.
- [x] `G-204` Nhúng estate portions và beneficiaries. Topic `compulsory-share` hỗ trợ nhiều phần và calculation ngưỡng `2/3`; topic `who-inherits` hỗ trợ nhiều phần, người/tổ chức được chỉ định và các nhánh R-A01–R-A06 trước khi quyết định có cần mở cây thừa kế theo pháp luật hay không.
- [ ] `G-205` Nhúng timeline cho Điều 623 và Điều 661.
- [ ] `G-206` Cho phép quay lại, sửa câu trả lời và vô hiệu hóa kết quả cũ.

### G3 — Điều phối suy luận đa mô-đun

- [x] `G-301` Khai báo result goals cho từng topic, phân biệt kết quả chính và kết quả phụ thuộc; orchestration không còn lấy thứ tự presenter làm kế hoạch suy luận.
- [ ] `G-302` Tính dependency plan dựa trên facts hiện có và mục tiêu người dùng. Đã có dependency gate cho trạng thái/tính hợp pháp của di chúc, ngoại lệ Điều 621 và goal `inheritance-regime`; graph/hàng thừa kế chỉ được mở khi CLIPS xác định có phần phải chia theo pháp luật. Cần mở rộng dependency graph tổng quát cho các topic còn lại.
- [ ] `G-303` Chạy các rule package liên quan trên cùng working memory. Đã có một guided dispatcher chọn package theo goal và facts kích hoạt, thay cho việc từng presenter hard-code chuỗi endpoint; bước còn lại là hợp nhất các package trong một CLIPS session khi cần chia sẻ derived facts.
- [ ] `G-304` Không hỏi trực tiếp derived facts như `valid-will` hoặc `article-621-status`.
- [ ] `G-305` Dừng đúng lúc ở `TRUE`, `FALSE`, `UNKNOWN`, `CONFLICT` hoặc khi cần review ngoài phạm vi.

### G4 — Kết quả và explanation

- [ ] `G-401` Trình bày kết luận bằng ngôn ngữ người dùng trước thông tin kỹ thuật.
- [ ] `G-402` Hiển thị facts đã dùng, Rule ID, chuỗi suy luận và điều luật tương ứng.
- [ ] `G-403` Cho mở toàn văn điều luật ngay trong flow.
- [ ] `G-404` Phân biệt dữ kiện còn thiếu, kết luận chưa thể đưa ra và phạm vi chưa được mô hình hóa.
- [ ] `G-405` Cho chuyển sang technical mode tại đúng hồ sơ và module liên quan.

### G5 — Kiểm thử và hoàn thiện UX

- [x] `G-501` Unit tests cho topic catalog và question planner nền tảng.
- [x] `G-502` Integration tests cho tạo hồ sơ → trả lời → lưu facts → chọn bước tiếp theo. Đã bao phủ tạo/resume session và happy path di chúc viết đến kết luận từ CLIPS.
- [ ] `G-503` Test mỗi topic với happy path, unknown path và sửa câu trả lời.
- [ ] `G-504` Usability test nội bộ với thành viên không viết rule.
- [ ] `G-505` Review responsive, keyboard navigation và screen reader labels.

## 5. Vertical slice đầu tiên

Vertical slice G0/G1 tạo được đường đi:

```text
/ → /guided
  → chọn câu hỏi thực tế
  → đặt tên hồ sơ
  → tạo case trong SQLite
  → hỏi tên người để lại di sản
  → lưu deceased-person + heir-person-label
  → đề xuất presenter tiếp theo
```

Bước kế tiếp là hoàn thiện `G-302/G-303`: biểu diễn dependency graph tổng quát và hợp nhất các package cần chia sẻ derived facts trong cùng một CLIPS session. `G-204` đã hoàn tất cho phạm vi presenter hiện tại; sau đó triển khai `G-205` cho timeline Điều 623 và Điều 661.

## 6. Tiêu chí hoàn thành

- Người dùng hoàn thành một topic chính mà không cần mở `/modules`.
- Câu hỏi tiếp theo xuất phát từ facts/missing requirements, không phải chuỗi UI hard-code toàn bộ.
- Không có derived legal conclusion nào được nhập trực tiếp từ người dùng.
- Mọi kết luận mở được trace và nội dung điều luật.
- Guided mode và technical mode dùng chung case facts và inference snapshots.
