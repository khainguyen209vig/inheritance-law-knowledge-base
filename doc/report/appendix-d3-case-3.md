# Phụ lục D.3. Hồ sơ thực nghiệm Case 3 – 64/2018/DS-ST

## D.3.1. Phạm vi phụ lục

Phụ lục ghi lại tình huống rút gọn, dữ kiện trọng yếu, expected output và actual output của Case 3. Nội dung được đối chiếu từ tài liệu mô tả, tệp CLP và các báo cáo đã sinh; không sử dụng `tests/case_test/doc_file/` làm ground truth.

Các hiện vật gốc:

- [Mô tả và expected output](../../tests/case_test/doc_case-test/case3_64_2018_DS-ST.md)
- [Facts đầu vào CLP](../../tests/case_test/clp_test/case3_64_2018_DS-ST.clp)
- [Thư mục kết quả](../../tests/case_test/results/case_3/)

## D.3.2. Tình huống rút gọn

Ông Ngô T chết ngày 28/10/1993, không để lại di chúc. Bà Trung Ng là vợ còn sống. Năm người con M, M1, B, X và V còn sống; ông V có hành vi từ chối nhận di sản được fixture mô tả là hợp lệ. Ông S được xác định chết trước hoặc cùng thời điểm mở thừa kế và có hai người con là Ngô B và ông H1.

Mô tả tình huống nhắc đến ba thửa đất, nhưng phép tính giá trị trong CLP chỉ kích hoạt thửa 281 với giá trị mô phỏng 500.000.000 đồng. Yêu cầu chia di sản liên quan đến bất động sản và sử dụng ngày mở thừa kế 28/10/1993.

## D.3.3. Facts trọng yếu

| Nhóm | Dữ kiện được mã hóa |
|---|---|
| Chế độ chia | `has-will=false` |
| Tính đầy đủ | `heir-search-complete=true` |
| Người còn sống thuộc hàng thứ nhất | `ba-ng`, `ong-m`, `ong-m1`, `ba-b`, `ong-x`, `ong-v` |
| Từ chối nhận di sản | Có từ chối; ý chí thông thường; có văn bản; gửi đồng thừa kế; trước khi chia; `valid-refusal=true` |
| Người chết trước/cùng thời điểm | `ong-s` |
| Ứng viên thế vị | `ngo-b`, `ong-h1` |
| Thời hiệu | `request-type=divide-estate`, `asset-type=immovable`, ngày 28/10/1993 |
| Tài sản tham gia phép tính | Thửa 281, giá trị 500.000.000 đồng, tỷ lệ `1/1` |
| Nghĩa vụ | Tập nghĩa vụ hoàn tất, không có nghĩa vụ được khai báo |

## D.3.4. Đối chiếu expected và actual

| Nội dung | Expected output | Actual output | Đánh giá |
|---|---|---|---|
| Chế độ chia | Chia theo pháp luật | Chia theo pháp luật | Khớp |
| Được gọi hưởng trực tiếp | Bà Ng, ông M, ông M1, bà B, ông X | Bà Ng, ông M, ông M1, bà B, ông X | Khớp |
| Không được gọi hưởng trực tiếp | Ông V do từ chối; ông S do đã chết | Ông V và ông S | Khớp |
| Kết luận từ chối | `valid-refusal=true` | Được dùng gián tiếp để loại ông V; chưa có báo cáo module riêng trong artifact | Khớp một phần |
| Thừa kế thế vị | Ngô B và ông H1 | Ngô B và ông H1 | Khớp |
| Thời hạn và ngày kết thúc | 30 năm; 28/10/2023 | 30 năm; 28/10/2023 | Khớp |
| Tổng giá trị dùng để chia | 500.000.000 đồng | 500.000.000 đồng | Khớp |
| Phân bổ giá trị | Expected mô tả phần từ chối được chia lại nhưng không nêu bảng giá trị cuối cho nhánh thế vị | Năm người trực tiếp nhận 100.000.000 đồng/người; nhánh thế vị không có giá trị | Khớp một phần |

## D.3.5. Kết luận kiểm thử

Case 3 đạt mục tiêu kiểm tra việc một người có từ chối hợp lệ không được gọi hưởng và hai người cháu được xác định hưởng thế vị. Tuy nhiên, bằng chứng về từ chối hiện chỉ xuất hiện qua facts và tác động hạ nguồn; bộ kết quả thiếu một báo cáo riêng trình bày kết luận từ chối cùng trace tương ứng.

Phép phân chia giá trị cũng chưa kết nối nhánh thế vị vào kết quả cuối. Expected output của case cần được bổ sung bảng phân bổ định lượng rõ ràng trước khi dùng làm assertion hoàn chỉnh. Các bước cần thực hiện gồm:

1. sinh báo cáo riêng cho module từ chối và tài sản không có người nhận;
2. xác định oracle về số suất sau khi có người từ chối;
3. xác định phần của nhánh ông S và phần của từng người thế vị;
4. kiểm tra tổng các phần bằng di sản có thể phân chia và phần dư bằng 0.

## D.3.6. Báo cáo đầu ra liên quan

- [Ai có thể được hưởng di sản?](../../tests/case_test/results/case_3/md_file/case3-64-2018-who-inherits-report.md)
- [Ai được hưởng thế vị?](../../tests/case_test/results/case_3/md_file/case3-64-2018-representation-report.md)
- [Thời hiệu](../../tests/case_test/results/case_3/md_file/case3-64-2018-limitation-report.md)
- [Thanh toán và phân chia di sản](../../tests/case_test/results/case_3/md_file/case3-64-2018-estate-settlement-report.md)
- [Tư cách hưởng di sản](../../tests/case_test/results/case_3/md_file/case3-64-2018-person-eligibility-report.md)

Báo cáo hiệu lực di chúc và suất bắt buộc không được dùng để chấm Case 3 vì tình huống xác định không có di chúc.
