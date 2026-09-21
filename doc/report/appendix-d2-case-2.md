# Phụ lục D.2. Hồ sơ thực nghiệm Case 2 – 202/2021/DS-PT

## D.2.1. Phạm vi phụ lục

Phụ lục ghi lại tình huống rút gọn, dữ kiện trọng yếu, expected output và actual output của Case 2. Nội dung được đối chiếu từ tài liệu mô tả, tệp CLP và các báo cáo đã sinh; không sử dụng `tests/case_test/doc_file/` làm ground truth.

Các hiện vật gốc:

- [Mô tả và expected output](../../tests/case_test/doc_case-test/case2_202_2021_DS-PT.md)
- [Facts đầu vào CLP](../../tests/case_test/clp_test/case2_202_2021_DS-PT.clp)
- [Thư mục kết quả](../../tests/case_test/results/case_2/)

## D.2.2. Tình huống rút gọn

Cụ Nguyễn Văn Lưu chết ngày 02/11/1996, không để lại di chúc. Cụ Nguyễn Thị Đục là vợ còn sống tại thời điểm mở thừa kế. Bốn người con LT, S, D và L còn sống. Ông Sáng được fixture xác định chết trước và không có con. Ông Tác được xác định chết trước hoặc cùng thời điểm mở thừa kế, để lại hai người con là anh Đ và anh ĐC.

Tài sản dùng trong phép tính là thửa đất ao có giá trị 833.000.000 đồng, toàn bộ giá trị được đưa vào khối di sản. Yêu cầu chia di sản liên quan đến bất động sản và sử dụng ngày mở thừa kế 02/11/1996.

## D.2.3. Facts trọng yếu

| Nhóm | Dữ kiện được mã hóa |
|---|---|
| Chế độ chia | `has-will=false` |
| Tính đầy đủ | `heir-search-complete=true` |
| Hàng thứ nhất còn sống | `cu-duc`, `ong-lt`, `ba-s`, `ba-d`, `ba-l` |
| Người chết trước/cùng thời điểm | `ong-sang`, `ong-tac` |
| Ứng viên thế vị | `anh-d`, `anh-dc` thuộc nhánh `ong-tac` |
| Nhánh không có người thế vị | `ong-sang` |
| Thời hiệu | `request-type=divide-estate`, `asset-type=immovable`, ngày 02/11/1996 |
| Tài sản | 833.000.000 đồng, tỷ lệ sở hữu của người chết là `1/1` |
| Nghĩa vụ | Tập nghĩa vụ hoàn tất, không có nghĩa vụ được khai báo |

## D.2.4. Đối chiếu expected và actual

| Nội dung | Expected output | Actual output | Đánh giá |
|---|---|---|---|
| Chế độ chia | Chia theo pháp luật | Chia theo pháp luật | Khớp |
| Được gọi hưởng trực tiếp | Cụ Đục, ông LT, bà S, bà D, bà L | Cụ Đục, ông LT, bà S, bà D, bà L | Khớp |
| Không được gọi hưởng trực tiếp | Ông Tác, ông Sáng | Ông Tác, ông Sáng | Khớp |
| Thừa kế thế vị | Anh Đ và anh ĐC | Anh Đ và anh ĐC | Khớp |
| Thời hạn và ngày kết thúc | 30 năm; 02/11/2026 | 30 năm; 02/11/2026 | Khớp |
| Tổng di sản có thể chia | 833.000.000 đồng | 833.000.000 đồng | Khớp |
| Số suất | 5 | 5 | Chỉ khớp về số lượng; expected chưa nhất quán với danh sách người hưởng |
| Người hoặc nhánh nhận suất | Ông LT, bà S, bà D, bà L và nhánh ông Tác; bỏ cụ Đục dù phần trước xác định cụ được gọi hưởng | Cụ Đục, ông LT, bà S, bà D, bà L | Chưa thể kết luận do oracle mâu thuẫn |
| Phần của hai người thế vị | 83.300.000 đồng/người | Không được tạo | Actual khác expected, nhưng oracle cần được sửa trước khi chấm cuối |

## D.2.5. Kết luận kiểm thử

Case 2 đạt ở các mô-đun xác định người hưởng, thế vị và thời hiệu. Chưa thể chấm đạt hay không đạt cho phép phân bổ giá trị vì expected output hiện tại tự mâu thuẫn: cụ Đục được xác định là người được gọi hưởng trực tiếp nhưng không xuất hiện trong danh sách nhận suất. Đây là phản ví dụ cho cách kiểm tra chỉ dựa trên tổng số suất: cả expected và actual đều cho năm suất, mỗi suất 166.600.000 đồng, nhưng chủ thể hoặc nhánh nhận suất khác nhau.

Assertion cho case này phải so sánh trên khóa gồm ít nhất:

- định danh người hoặc nhánh nhận;
- loại quyền hưởng trực tiếp hay thế vị;
- giá trị của suất;
- tổng phần được phân bổ cho nhánh;
- phần dư sau phân bổ.

Trước khi chạy lại, nhóm phải chốt oracle gồm cả cụ Đục và nhánh ông Tác, tính lại số suất và giá trị của từng suất. Cho đến khi hoàn thành bước đó, Case 2 phải được báo cáo là “cần hoàn thiện oracle”, không phải “pass” hoặc “fail”.

## D.2.6. Báo cáo đầu ra liên quan

- [Ai có thể được hưởng di sản?](../../tests/case_test/results/case_2/md_file/case2-202-2021-who-inherits-report.md)
- [Ai được hưởng thế vị?](../../tests/case_test/results/case_2/md_file/case2-202-2021-representation-report.md)
- [Thời hiệu](../../tests/case_test/results/case_2/md_file/case2-202-2021-limitation-report.md)
- [Thanh toán và phân chia di sản](../../tests/case_test/results/case_2/md_file/case2-202-2021-estate-settlement-report.md)
- [Tư cách hưởng di sản](../../tests/case_test/results/case_2/md_file/case2-202-2021-person-eligibility-report.md)

Báo cáo hiệu lực di chúc và suất bắt buộc không được dùng để chấm Case 2 vì tình huống xác định không có di chúc.
