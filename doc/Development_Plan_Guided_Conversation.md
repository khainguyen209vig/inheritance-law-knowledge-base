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
- [x] `G-205` Nhúng timeline cho Điều 623 và Điều 661. Presenter Điều 623 thu thập loại yêu cầu, loại tài sản và ngày mở thừa kế để CLIPS chọn thời hạn rồi temporal adapter tính ngày kết thúc. Presenter Điều 661 tách rõ nhánh mốc hạn chế phân chia và nhánh vợ/chồng yêu cầu Tòa án trì hoãn; cả hai lưu facts nguyên tử và mở được căn cứ R-I04/R-I05 ngay trong flow.
- [x] `G-206` Cho phép quay lại, sửa câu trả lời và vô hiệu hóa kết quả cũ. Guided UI liệt kê các câu trả lời có cấu trúc và cho sửa trực tiếp; khi sửa một bước, các answer facts và completed steps phụ thuộc phía sau bị loại bỏ để planner hỏi lại. Mỗi inference snapshot mang `facts_revision`: lịch sử cũ vẫn được giữ để audit nhưng không được coi là kết quả hiện hành sau khi facts thay đổi.

### G3 — Điều phối suy luận đa mô-đun

- [x] `G-301` Khai báo result goals cho từng topic, phân biệt kết quả chính và kết quả phụ thuộc; orchestration không còn lấy thứ tự presenter làm kế hoạch suy luận.
- [x] `G-302` Tính dependency plan dựa trên facts hiện có và mục tiêu người dùng. Planner dùng graph có cạnh phụ thuộc tường minh và trạng thái `complete`, `ready`, `blocked`, `skipped` cho mọi topic; riêng `who-inherits`, graph/hàng thừa kế chỉ được mở khi CLIPS xác định có ít nhất một phần phải chia theo pháp luật.
- [x] `G-303` Chạy rule goal cùng các rule phụ thuộc trên một CLIPS working memory. Registry package là nguồn cấu hình duy nhất cho driver: ví dụ `inheritance-type` nạp chung luật di chúc/từ chối, còn `heir-rank` nạp chung luật Điều 621/từ chối trước khi forward chaining. Guided dispatcher vẫn lưu snapshot riêng theo module để kết quả và trace không bị gán nhầm module.
- [x] `G-304` Không hỏi trực tiếp derived facts như `valid-will`, `article-621-status`, `valid-refusal` hoặc `disposition-status`. Presenter phần di sản chỉ ghi nhận việc có định đoạt, loại người hưởng và trạng thái sống/tồn tại; CLIPS kết hợp kết quả Điều 621 và Điều 620 để suy ra hiệu lực trung gian. Workspace kỹ thuật cũ vẫn được giữ như compatibility boundary trong giai đoạn chuyển đổi.
- [x] `G-305` Dừng đúng lúc ở kết quả xác định, `UNKNOWN` hoặc `CONFLICT`. Guided state trả `inferenceStatus`; conflict gate dừng dependency graph, còn UI phân biệt rõ hoàn tất, chưa thể kết luận và dữ kiện mâu thuẫn.

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

Bước kế tiếp là `G-401`: trình bày kết luận pháp lý bằng ngôn ngữ người dùng ngay trong guided flow, thay cho thông báo hoàn tất chung. Sau đó nối facts, Rule ID, trace và toàn văn điều luật ở `G-402`–`G-403`.

## 6. Tiêu chí hoàn thành

- Người dùng hoàn thành một topic chính mà không cần mở `/modules`.
- Câu hỏi tiếp theo xuất phát từ facts/missing requirements, không phải chuỗi UI hard-code toàn bộ.
- Không có derived legal conclusion nào được nhập trực tiếp từ người dùng.
- Mọi kết luận mở được trace và nội dung điều luật.
- Guided mode và technical mode dùng chung case facts và inference snapshots.
