# Phụ lục D.1. Hồ sơ thực nghiệm Case 1 – 227/2019/DS-ST

## D.1.1. Phạm vi phụ lục

Phụ lục ghi lại tình huống rút gọn, dữ kiện trọng yếu, expected output và actual output của Case 1. Nội dung được đối chiếu từ tài liệu mô tả, tệp CLP và các báo cáo đã sinh; không sử dụng `tests/case_test/doc_file/` làm ground truth.

Các hiện vật gốc:

- [Mô tả và expected output](../../tests/case_test/doc_case-test/case1_227_2019_DS-ST.md)
- [Facts đầu vào CLP](../../tests/case_test/clp_test/case1_227_2019_DS-ST.clp)
- [Thư mục kết quả](../../tests/case_test/results/case_1/)

## D.1.2. Tình huống rút gọn

Ông Trần Văn Ngọ chết, không để lại di chúc. Tại thời điểm mở thừa kế, bà Phạm Thị Thêm là vợ còn sống; bà K, bà Đ và ông Q là ba người con còn sống. Bà Tý và ông Chính được fixture xác định là chết trước hoặc cùng thời điểm mở thừa kế. Bà Tý có hai người con là bà P và bà L; ông Chính có hai người con là T2 và T1.

Căn nhà được định giá 5.172.000.000 đồng. Fixture xác định phần sở hữu của người chết là một nửa, nên giá trị đưa vào khối di sản là 2.586.000.000 đồng. Yêu cầu chia di sản liên quan đến bất động sản, với ngày mở thừa kế được chuẩn hóa thành 01/01/1984.

## D.1.3. Facts trọng yếu

| Nhóm | Dữ kiện được mã hóa |
|---|---|
| Chế độ chia | `has-will=false` |
| Tính đầy đủ | `heir-search-complete=true` |
| Hàng thứ nhất còn sống | `ba-them`, `ba-k`, `ba-d`, `ong-q` |
| Người chết trước/cùng thời điểm | `ba-ty`, `ong-chinh` |
| Ứng viên thế vị | `ba-p`, `ba-l`, `ong-t2`, `be-t1` |
| Thời hiệu | `request-type=divide-estate`, `asset-type=immovable`, ngày 01/01/1984 |
| Tài sản | Giá trị 5.172.000.000 đồng; tỷ lệ sở hữu của người chết là `1/2` |
| Nghĩa vụ | Tập nghĩa vụ hoàn tất, không có nghĩa vụ được khai báo |

## D.1.4. Đối chiếu expected và actual

| Nội dung | Expected output | Actual output | Đánh giá |
|---|---|---|---|
| Chế độ chia | Chia theo pháp luật | Chia theo pháp luật | Khớp |
| Được gọi hưởng trực tiếp | Bà Thêm, bà K, bà Đ, ông Q | Bà Thêm, bà K, bà Đ, ông Q | Khớp |
| Không được gọi hưởng trực tiếp | Bà Tý, ông Chính | Bà Tý, ông Chính | Khớp |
| Thừa kế thế vị | Bà P, bà L, T2, T1 | Bà P, bà L, T2, T1 | Khớp |
| Thời hạn | 30 năm | 30 năm | Khớp |
| Ngày kết thúc | 01/01/2014 | 01/01/2014 | Khớp |
| Giá trị thuộc di sản | 2.586.000.000 đồng | 2.586.000.000 đồng | Khớp |
| Phân bổ cuối | Bốn suất trực tiếp, mỗi suất 646.500.000 đồng; expected chưa phân bổ cho nhánh thế vị | Bốn suất trực tiếp, mỗi suất 646.500.000 đồng; không có giá trị cho nhánh thế vị | Khớp với oracle hiện tại nhưng oracle chưa đầy đủ |

## D.1.5. Kết luận kiểm thử

Case 1 đạt các mục tiêu kiểm tra chế độ chia, hàng thừa kế, trạng thái gọi hưởng, thế vị, thời hiệu và xác định giá trị thuộc di sản. Phần phân chia tiền không được coi là phương án phân chia cuối cùng vì bốn suất trực tiếp đã sử dụng toàn bộ di sản trong khi hai nhánh thế vị chỉ xuất hiện ở báo cáo quan hệ.

Khi tự động hóa regression test, expected manifest cần tách hai lớp:

1. kết luận về người và quan hệ thừa kế;
2. kết luận phân bổ giá trị theo từng suất và từng nhánh.

Case chỉ được chuyển sang trạng thái đạt hoàn toàn sau khi lớp thứ hai biểu diễn và kiểm tra phần của hai nhánh thế vị.

## D.1.6. Báo cáo đầu ra liên quan

- [Ai có thể được hưởng di sản?](../../tests/case_test/results/case_1/md_file/case1-227-2019-who-inherits-report.md)
- [Ai được hưởng thế vị?](../../tests/case_test/results/case_1/md_file/case1-227-2019-representation-report.md)
- [Thời hiệu](../../tests/case_test/results/case_1/md_file/case1-227-2019-limitation-report.md)
- [Thanh toán và phân chia di sản](../../tests/case_test/results/case_1/md_file/case1-227-2019-estate-settlement-report.md)
- [Tư cách hưởng di sản](../../tests/case_test/results/case_1/md_file/case1-227-2019-person-eligibility-report.md)

Báo cáo hiệu lực di chúc và suất bắt buộc không được dùng để chấm Case 1 vì tình huống xác định không có di chúc.
