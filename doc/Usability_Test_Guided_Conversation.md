# Kịch bản usability test — Guided Conversation

## 1. Mục tiêu

Kiểm tra xem một thành viên **không viết rule CLIPS** có thể tự hoàn thành câu hỏi thừa kế bằng guided mode hay không. Đây là kiểm thử cách đặt câu hỏi, điều hướng và giải thích; không dùng để phê duyệt tính đúng đắn pháp lý của rule base.

Kết quả chỉ được ghi là kiểm thử với người dùng thật sau khi có người tham gia và người quan sát. Không dùng kết quả integration test thay thế cho bước này.

## 2. Người tham gia và cách tổ chức

- Tối thiểu 2 thành viên không trực tiếp viết rules CLIPS.
- Mỗi buổi từ 25 đến 35 phút, thực hiện độc lập.
- Người điều phối chỉ đọc đề bài, không chỉ vị trí nút và không giải thích thuật ngữ trước.
- Yêu cầu người tham gia nói thành tiếng điều họ đang hiểu và lý do họ chọn một thao tác.
- Người quan sát ghi lại thời gian, lỗi, câu hỏi cần trợ giúp và câu nói thể hiện hiểu sai.
- Dùng một database thử nghiệm hoặc xóa hồ sơ thử sau buổi; không nhập dữ liệu cá nhân thật.

Khởi động ứng dụng:

```bash
npm run db:init
npm run dev
```

Mở `http://localhost:3000`. Mỗi người bắt đầu từ trang này, không bắt đầu từ `/modules`.

## 3. Kịch bản

### Kịch bản A — Di chúc bằng văn bản

> Ông An có một di chúc bằng văn bản. Khi lập di chúc, ông minh mẫn, không bị lừa dối hoặc đe dọa; nhóm đã rà soát nhưng không phát hiện nội dung bị cấm hay lỗi hình thức. Hãy dùng hệ thống để tìm hiểu di chúc có hợp pháp không.

Quan sát xem người tham gia có:

- chọn đúng vấn đề mà không cần biết tên mô-đun;
- hiểu “không phát hiện” khác với khẳng định tuyệt đối “không có”;
- nhận ra khi nào đã có kết quả;
- mở được phần giải thích và nội dung điều luật;
- quay lại sửa hình thức di chúc từ văn bản sang miệng.

### Kịch bản B — Quyền hưởng của một người

> Bà Bình để lại di sản. Cần rà soát quyền hưởng của ông Cường. Nhóm chưa phát hiện căn cứ loại trừ nào thuộc khoản 1 Điều 621. Hãy lưu kết quả rà soát.

Quan sát xem người tham gia có luôn biết câu hỏi đang áp dụng cho **ông Cường**, thay vì bà Bình hoặc cả hồ sơ hay không.

### Kịch bản C — Cây gia đình và con chung

> Ông Dũng và bà Hạnh là vợ chồng. Họ có một con ruột chung là Lan. Ông Dũng có một con nuôi riêng là Minh. Hãy dựng cây gia đình để hệ thống xác định người liên quan.

Quan sát xem người tham gia có:

- phân biệt “con riêng của người đang chọn” và “con của cặp vợ chồng”;
- tạo được con ruột chung từ cạnh vợ/chồng;
- tạo được con nuôi riêng từ node ông Dũng;
- hiểu quan hệ cha/mẹ kế được hệ thống suy ra và không cần nhập;
- phát hiện hoặc hiểu được đường nối nếu graph giao chéo.

### Kịch bản D — Thời hiệu

> Ngày mở thừa kế là 29/02/2020. Người hỏi muốn yêu cầu chia một bất động sản. Hãy xác định mốc thời hiệu và mở căn cứ pháp luật của kết quả.

Quan sát xem định dạng ngày, loại yêu cầu và loại tài sản có đủ rõ ràng không; không gợi ý “30 năm” cho người tham gia.

### Kịch bản E — Tiếp tục hồ sơ đã lưu

> Hãy rời hồ sơ hiện tại, tìm lại nó trong danh sách hồ sơ rồi tiếp tục. Sau đó sửa một câu trả lời trước đó và xác nhận rằng kết quả đã được cập nhật.

Quan sát xem người tham gia có hiểu dữ liệu đã tự lưu, tìm được hồ sơ và nhận ra phần nào phải trả lời lại sau khi sửa hay không.

## 4. Nhiệm vụ kiểm tra nhanh sau mỗi kịch bản

Không giải thích thêm trước khi hỏi:

1. Hệ thống vừa kết luận điều gì, hay vẫn đang thiếu thông tin?
2. Kết luận đang nói về người hoặc phần di sản nào?
3. Điều luật nào được dùng, và bạn sẽ bấm vào đâu để đọc nó?
4. Nếu một dữ kiện nhập sai, bạn sẽ sửa ở đâu?
5. Bạn có nghĩ đây là kết luận cho toàn bộ hồ sơ không? Vì sao?

## 5. Phiếu quan sát

Sao chép bảng này cho từng người và từng kịch bản.

| Trường | Ghi nhận |
|---|---|
| Mã người tham gia |  |
| Kịch bản |  |
| Thiết bị / kích thước màn hình |  |
| Hoàn thành không cần trợ giúp | Có / Không |
| Thời gian hoàn thành |  |
| Số lần chọn sai hoặc quay lại |  |
| Số lần người điều phối phải trợ giúp |  |
| Điểm gây dừng trên 10 giây |  |
| Thuật ngữ không hiểu |  |
| Hiểu đúng chủ thể của kết luận | Có / Không |
| Mở được căn cứ pháp luật | Có / Không |
| Sửa được dữ kiện và hiểu việc hỏi lại | Có / Không |
| Câu nói đáng chú ý |  |

Sau mỗi buổi, hỏi điểm dễ sử dụng từ 1 đến 5 và một thay đổi duy nhất người tham gia muốn ưu tiên.

## 6. Phân loại vấn đề

| Mức | Tiêu chí | Hành động |
|---|---|---|
| `P0` | Không thể hoàn thành, mất dữ liệu hoặc UI dẫn tới kết luận sai chủ thể | Dừng test kịch bản và sửa trước buổi tiếp theo |
| `P1` | Cần trợ giúp mới tiếp tục, hiểu sai kết luận hoặc không tìm được căn cứ | Phải sửa trước bản trình bày |
| `P2` | Hoàn thành được nhưng dừng lâu, quay lại nhiều lần hoặc hiểu sai thuật ngữ | Ưu tiên trong vòng UX kế tiếp |
| `P3` | Vấn đề thẩm mỹ hoặc đề xuất không chặn nhiệm vụ | Ghi backlog |

Một vấn đề xuất hiện ở cả hai người được tăng một mức ưu tiên, trừ khi đã là `P0`.

## 7. Ngưỡng hoàn thành G-504

G-504 chỉ được đánh dấu hoàn thành khi:

- có đủ 2 phiếu quan sát từ thành viên không viết rules;
- cả hai hoàn thành A, B và C mà không có `P0`;
- ít nhất một người hoàn thành D và E;
- tối thiểu 80% nhiệm vụ hoàn thành không cần người điều phối chỉ vị trí thao tác;
- 100% kết luận được người tham gia xác định đúng chủ thể;
- mọi `P0` và `P1` đã được sửa hoặc có quyết định phạm vi được ghi rõ;
- issue log bên dưới có owner và trạng thái.

## 8. Issue log

| ID | Ngày | Kịch bản | Mức | Quan sát thực tế | Thay đổi đề xuất | Owner | Trạng thái |
|---|---|---|---|---|---|---|---|
| UX-001 |  |  |  |  |  |  | Chưa ghi nhận |

## 9. Rà soát heuristic trước test

Ngày 14/09/2026 đã rà soát tĩnh giao diện guided và xử lý trước các điểm sau:

- thay các thuật ngữ nội bộ “fact”, “facts revision”, “chạy CLIPS” bằng diễn đạt hướng người dùng;
- mô tả rõ thông tin được lưu và kết quả sẽ được cập nhật khi sửa;
- bổ sung live status cho trạng thái đang đối chiếu và alert semantics cho lỗi câu hỏi;
- bổ sung nhãn truy cập cho input được render từ question catalog.

Đây chỉ là vòng heuristic của development, không được tính là hai buổi usability test yêu cầu ở trên.
