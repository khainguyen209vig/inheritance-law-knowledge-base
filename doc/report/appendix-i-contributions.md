# Phụ lục I. Phân công và dấu vết đóng góp

## I.1. Nguyên tắc ghi nhận

Bảng dưới đây dựa trên hiện vật và lịch sử commit hiện có, không suy diễn tỷ lệ phần trăm đóng góp. Họ tên chính thức, mã số sinh viên và vai trò hành chính phải được đồng bộ với trang bìa trước khi nộp.

| Định danh Git | Nhóm công việc thể hiện trong repository | Hiện vật tiêu biểu |
|---|---|---|
| `ngvihoa` | Thiết kế và hiện thực hệ thống; knowledge base và rules; CLIPS adapter; CSDL/API; Guided Conversation; Quick Logic Test; kiểm thử ứng dụng; kiến trúc và nội dung báo cáo | `knowledge-base/`, `src/`, `tests/*.test.ts`, `doc/report/` |
| `Kang` | Thu thập tài liệu pháp lý ban đầu; xây dựng, cập nhật ba case study và tài liệu mô tả tình huống | `doc/` nguồn ban đầu, `tests/case_test/` |

Lịch sử tại thời điểm biên soạn ghi nhận 57 commit dưới định danh/email `ngvihoa` và 3 commit dưới định danh/email `Kang`. Số commit chỉ là dấu vết kiểm tra, không được dùng làm thước đo duy nhất về khối lượng hoặc chất lượng đóng góp.

## I.2. Ma trận trách nhiệm theo hạng mục

| Hạng mục | Người thực hiện chính theo dấu vết repo | Hình thức kiểm tra cần có trước khi nộp |
|---|---|---|
| Thu nhận tài liệu pháp lý | Kang, ngvihoa | Đối chiếu nguồn chính thức và danh mục tham khảo |
| Chuẩn hóa rule catalog | ngvihoa | Review chéo Rule ID, căn cứ và status báo cáo |
| Hiện thực CLIPS | ngvihoa | `npm run test:kb`, review source mapping |
| Ứng dụng web và API | ngvihoa | `npm run test:app`, build và walkthrough |
| Case study thực nghiệm | Kang xây dựng/cập nhật; ngvihoa đối chiếu báo cáo | Review lại oracle và tự động hóa regression test |
| Biên soạn báo cáo | ngvihoa | Cả nhóm đọc và xác nhận nội dung thuộc phần mình phụ trách |
| Trình bày và phản biện | Cả nhóm | Chốt phân công nói, demo và câu hỏi dự phòng |

## I.3. Xác nhận trước khi nộp

Mỗi thành viên cần xác nhận:

- phần đóng góp của mình được mô tả đúng;
- tên, MSSV và email học vụ khớp hồ sơ môn học;
- đã đọc các tuyên bố về phạm vi và giới hạn pháp lý;
- đồng ý với phiên bản commit được đóng băng để nộp;
- mọi nguồn và công cụ hỗ trợ đã được khai báo theo quy định học phần.
