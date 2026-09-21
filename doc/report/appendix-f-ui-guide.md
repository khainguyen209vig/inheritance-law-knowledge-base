# Phụ lục F. Hướng dẫn thao tác và kế hoạch ảnh giao diện

## F.1. Các điểm vào chính

| Đường dẫn | Người dùng mục tiêu | Chức năng |
|---|---|---|
| `/guided` | Người dùng phổ thông trong phạm vi đồ án | Chọn câu hỏi và nhập dữ kiện theo hội thoại có hướng dẫn |
| `/cases` | Thành viên nhóm/người kiểm thử | Quản lý hồ sơ, mở facts và lịch sử suy luận |
| `/cases/:caseId` | Thành viên nhóm | Xem dữ kiện, chọn mô-đun và snapshot gần nhất |
| `/cases/:caseId/runs/:runId` | Người kiểm tra | Xem snapshot bất biến, kết quả, trace và căn cứ |
| `/modules` | Người học/kỹ sư tri thức | Khảo sát danh mục mười mô-đun |
| `/logic-test` | Thành viên nhóm | Tải CLP, chọn câu hỏi, chạy và xuất báo cáo mà không lưu case |

## F.2. Luồng Guided Conversation

1. Mở `/guided` và chọn vấn đề cần phân tích, không chọn tên rule hoặc predicate.
2. Đặt tên hồ sơ; ứng dụng tạo case và guided session.
3. Trả lời các câu hỏi observation. Với quan hệ gia đình, dùng graph để thêm người và cạnh quan hệ.
4. Hệ thống lưu câu trả lời thành asserted facts và chạy các mô-đun đã đủ dữ kiện.
5. Nếu còn thiếu, giao diện hiển thị câu hỏi tiếp theo dựa trên `missing-requirement`.
6. Khi có kết luận, mở phần giải thích để xem dữ kiện, Rule ID và căn cứ.
7. Quay lại câu trả lời trước để sửa; kết quả cũ được nhận diện qua `facts_revision` và không được trình bày như kết quả hiện hành.

Người dùng cần luôn kiểm tra chủ thể của kết luận. Một kết quả về một người hoặc một phần di sản không tự động trở thành kết luận cho toàn bộ hồ sơ.

## F.3. Luồng Quick Logic Test

1. Mở `/logic-test` và chọn file `.clp` UTF-8 không quá 1 MiB.
2. Đọc diagnostics theo dòng/cột; sửa toàn bộ lỗi trước khi chạy. Warning thiếu nhãn không chặn suy luận.
3. Kiểm tra số facts, số subject và preview dữ kiện đã chuẩn hóa.
4. Chọn câu hỏi cần kiểm tra. Câu hỏi trên giao diện quyết định package chạy; `analysis-request` trong file chỉ phục vụ preview.
5. Chọn subject nếu muốn giới hạn phạm vi.
6. Chạy suy luận và đọc trạng thái `complete`, `missing-facts`, `unknown` hoặc `conflict`.
7. Mở từng bước để xem supports, căn cứ và source CLIPS ở chế độ chỉ đọc.
8. Xuất báo cáo Markdown để đọc hoặc CLP replayable để chạy lại với knowledge base hiện hành.

## F.4. Quy ước đọc trạng thái

| Trạng thái | Cách diễn giải |
|---|---|
| `complete` | Có kết luận cho các goal được chọn |
| `missing-facts` | Thiếu observation cụ thể; cần bổ sung theo danh sách |
| `unknown` | Chưa có kết luận xác định dù không còn missing requirement trực tiếp |
| `conflict` | Có các kết luận không tương thích; cần kiểm tra facts và trace |

`unknown` không đồng nghĩa với `false`; `missing-facts` không đồng nghĩa với input sai cú pháp.

## F.5. Danh mục ảnh cần chốt trước khi xuất bản

Tại thời điểm biên soạn, bộ screenshot chính thức chưa được đóng băng. Phụ lục này không chèn ảnh tạm để tránh giao diện trong báo cáo khác phiên bản trình diễn. Khi khóa release, nhóm cần chụp cùng một kích thước viewport và cùng bộ dữ kiện demo.

| Mã ảnh | Nội dung bắt buộc | Mục đích |
|---|---|---|
| F-01 | Màn hình chọn chủ đề Guided Conversation | Minh họa cách tiếp cận theo câu hỏi người dùng |
| F-02 | Bước dựng graph gia đình | Minh họa biểu diễn quan hệ nhiều chủ thể |
| F-03 | Kết luận cùng dữ kiện thiếu | Phân biệt kết luận và completeness |
| F-04 | Dialog căn cứ và trace | Minh họa khả năng giải thích |
| F-05 | Quick Logic Test sau khi parse CLP | Minh họa contract và diagnostics |
| F-06 | Báo cáo Quick Logic Test hoàn chỉnh | Minh họa kết luận nhóm theo điều luật |
| F-07 | Danh sách hồ sơ và lịch sử inference run | Minh họa lưu snapshot và phiên bản hóa |

Mỗi ảnh cần chú thích đường dẫn, case demo, phiên bản commit và ý nghĩa thiết kế. Không chụp dữ liệu cá nhân thật.
