# Chương 1. Tổng quan đề tài

## 1.1. Bối cảnh và lý do chọn đề tài

Thừa kế là một lĩnh vực pháp luật gắn với nhiều chủ thể, quan hệ gia đình, mốc thời gian và điều kiện ngoại lệ. Khi xem xét một tình huống, người phân tích không chỉ cần biết có hay không có di chúc mà còn phải xác định hình thức và tính hợp pháp của di chúc, phần di sản nào được định đoạt, tư cách của từng người liên quan, hàng thừa kế, trường hợp thế vị, quyền hưởng bắt buộc, việc từ chối nhận di sản, nghĩa vụ tài sản và thời hiệu. Một thay đổi nhỏ trong dữ kiện, chẳng hạn thời điểm một người chết hoặc tình trạng của người thụ hưởng, có thể làm thay đổi nhánh quy định được áp dụng.

Đặc điểm trên khiến bài toán phù hợp với hướng tiếp cận dựa trên tri thức. Thay vì chôn các điều kiện pháp lý trong mã điều khiển giao diện hoặc một chuỗi câu lệnh `if/else`, tri thức có thể được mô tả tường minh bằng các dữ kiện và luật. Bộ suy luận đối sánh dữ kiện của từng vụ việc với cơ sở luật để tạo kết luận mới. Nếu mỗi kết luận còn lưu lại luật đã áp dụng và các dữ kiện hỗ trợ, người dùng có thể kiểm tra được vì sao hệ thống đưa ra kết quả.

Một khó khăn quan trọng khác là dữ liệu thực tế thường không đầy đủ. Việc không có dữ kiện chứng minh một mệnh đề không đồng nghĩa mệnh đề đó sai. Ví dụ, chưa có thông tin về sự đồng ý của người giám hộ không cho phép kết luận rằng người giám hộ đã không đồng ý. Hệ thống vì vậy cần thể hiện được trạng thái chưa đủ thông tin, đồng thời chỉ ra chính xác dữ kiện cần bổ sung. Tương tự, nếu hồ sơ đồng thời chứa những dữ kiện dẫn tới hai kết luận không tương thích, hệ thống cần phản ánh mâu thuẫn thay vì tự chọn một kết quả.

Từ nhu cầu đó, đồ án xây dựng **Mạch Di Sản**, một ứng dụng hỗ trợ phân tích tình huống thừa kế theo pháp luật Việt Nam. Tên ứng dụng nhấn mạnh bài toán và mối liên hệ giữa người, quan hệ gia đình và di sản.

## 1.2. Phát biểu bài toán

Bài toán của đồ án được phát biểu như sau: từ một tập dữ kiện có cấu trúc về vụ việc thừa kế và một cơ sở tri thức được xây dựng từ các quy định có liên quan của Bộ luật Dân sự năm 2015, hệ thống cần tạo ra các kết luận theo từng câu hỏi phân tích, đồng thời cung cấp dấu vết suy luận, căn cứ điều luật và danh sách thông tin còn thiếu.

Đầu vào của hệ thống gồm bốn nhóm chính:

- chủ thể và quan hệ, như người để lại di sản, vợ/chồng, cha/mẹ, con, quan hệ nuôi dưỡng và quan hệ huyết thống;
- sự kiện và trạng thái, như thời điểm chết, tình trạng còn sống, hành vi làm mất quyền hưởng hoặc việc từ chối nhận di sản;
- thông tin về di chúc, phần di sản, tài sản và nghĩa vụ;
- yêu cầu phân tích, xác định mô-đun và đối tượng mà người dùng muốn xem kết quả.

Đầu ra không phải là một bản tư vấn pháp lý cuối cùng. Hệ thống trả về một hoặc nhiều kết quả mô-đun, ví dụ `valid-will=true`, `inheritance-regime=statutory` hoặc `candidate-heir-rank=rank-1`. Mỗi kết quả có thể đi kèm các Rule ID tạo ra nó, danh sách dữ kiện hỗ trợ, căn cứ điều luật và các yêu cầu bổ sung dữ kiện. Kết quả được biểu diễn theo bốn trạng thái cơ bản: đúng, sai, chưa xác định và mâu thuẫn.

Quy trình khái quát của bài toán được mô tả như sau:

```text
Dữ kiện vụ việc
      │
      ▼
Kiểm tra và chuẩn hóa dữ liệu
      │
      ▼
Cơ sở tri thức + bộ suy luận
      │
      ├── Kết luận theo mô-đun
      ├── Dữ kiện còn thiếu
      ├── Dấu vết suy luận
      └── Căn cứ pháp luật
```

Người dùng mục tiêu trong phạm vi đồ án là thành viên nhóm phát triển, sinh viên hoặc người nghiên cứu muốn khảo sát một tình huống có cấu trúc. Ứng dụng chưa hướng tới việc thay thế luật sư, công chứng viên, cơ quan xét xử hoặc bất kỳ chủ thể có thẩm quyền nào.

## 1.3. Mục tiêu

Mục tiêu tổng quát của đồ án là xây dựng một hệ thống dựa trên tri thức có khả năng hỗ trợ xác định và giải thích một số yếu tố trong tình huống thừa kế theo pháp luật Việt Nam.

Các mục tiêu cụ thể gồm:

1. Xây dựng từ vựng tri thức mô tả chủ thể, quan hệ, sự kiện, di chúc, phần di sản và các trạng thái pháp lý cần thiết.
2. Chuyển hóa một phần các quy định thừa kế của Bộ luật Dân sự năm 2015 thành các luật sản xuất có định danh và căn cứ.
3. Tách tri thức pháp luật dùng chung khỏi dữ kiện riêng của từng hồ sơ.
4. Thực hiện suy diễn tiến để tạo các dữ kiện dẫn xuất và kết quả mô-đun từ dữ kiện ban đầu.
5. Không suy diễn phủ định chỉ từ sự vắng mặt của dữ kiện; nhận diện trường hợp thiếu thông tin hoặc mâu thuẫn.
6. Giải thích kết quả thông qua chuỗi dữ kiện, luật đã kích hoạt và điều khoản liên quan.
7. Xây dựng ứng dụng web hỗ trợ nhập dữ kiện, quản lý hồ sơ, chạy suy luận và xem lại snapshot kết quả.
8. Xây dựng bộ kiểm thử hồi quy cho cơ sở tri thức và các thành phần tích hợp.

Mỗi mục tiêu được đối chiếu với bằng chứng ở Chương 3 đến Chương 5. Cụ thể, mô hình dữ kiện và luật được trình bày ở Chương 3; kiến trúc và ứng dụng ở Chương 4; kết quả kiểm thử và giới hạn đánh giá ở Chương 5.

## 1.4. Phạm vi và giới hạn

Nguồn pháp lý chính của đồ án là Bộ luật Dân sự số 91/2015/QH13, được Quốc hội ban hành ngày 24/11/2015 và có hiệu lực từ ngày 01/01/2017 [1]. Catalog pháp lý của phiên bản hiện tại chứa nội dung được chuẩn hóa từ 19 điều, gồm các Điều 620–623, 627, 629–630, 644, 649–655 và 658–661. Các điều này phục vụ mười mô-đun phân tích:

1. tính hợp pháp của di chúc;
2. loại thừa kế;
3. quyền hưởng di sản;
4. hàng thừa kế;
5. thừa kế thế vị và một số quan hệ đặc biệt;
6. suất thừa kế bắt buộc;
7. quan hệ vợ chồng đặc biệt;
8. từ chối nhận di sản và tài sản không có người nhận;
9. thanh toán nghĩa vụ và nguyên tắc phân chia di sản;
10. thời hiệu thừa kế.

Toàn bộ rules thuộc phạm vi báo cáo được giả định đã hoàn tất review nội bộ và có trạng thái thống nhất là `reviewed`. Review nội bộ nhằm kiểm tra tính nhất quán giữa đặc tả của nhóm, mã luật và ca kiểm thử. Trạng thái này không đồng nghĩa với việc cơ sở tri thức đã được luật sư hoặc chuyên gia pháp lý độc lập thẩm định.

Đồ án không giải quyết các nội dung sau:

- xác minh tính xác thực hoặc giá trị chứng cứ của tài liệu;
- giải quyết xung đột pháp luật, tranh chấp hoặc diễn giải tư pháp phức tạp;
- định giá tài sản ngoài dữ liệu do người dùng cung cấp;
- tự động phân chia trọn vẹn mọi di sản theo một quy trình end-to-end;
- đưa ra tư vấn pháp lý hoặc quyết định có giá trị bắt buộc;
- sử dụng mô hình ngôn ngữ lớn để tự tạo facts, rules hoặc kết luận.

Kết quả của hệ thống chỉ đúng trong phạm vi dữ kiện đã nhập, phiên bản cơ sở tri thức được sử dụng và các quy tắc đã được mô hình hóa.

## 1.5. Sản phẩm và đóng góp của đồ án

Sản phẩm đầu tiên là một cơ sở tri thức thực thi được bằng CLIPS. Ở thời điểm lập báo cáo, registry chứa 87 mục tri thức thuộc mười mô-đun, bao gồm 61 mục luật pháp lý, 19 quy tắc nội bộ và 7 quy tắc hệ thống. Các mục này ánh xạ tới 155 implementations trong các tệp CLIPS. Con số trên mô tả cấu trúc phiên bản `inheritance-kb-v21`; nó không đồng nghĩa với 155 điều luật độc lập, vì một Rule ID có thể có nhiều implementation để xử lý các nhánh dữ kiện khác nhau.

Sản phẩm thứ hai là mô hình suy luận có provenance. Dữ kiện người dùng, dữ kiện dẫn xuất, kết quả trình bày và dấu vết suy luận được tách thành các loại fact khác nhau. Cách tổ chức này giúp ngăn người dùng nhập trực tiếp kết luận cần suy ra và cho phép lần ngược từ kết quả về nguồn hỗ trợ.

Sản phẩm thứ ba là ứng dụng web gồm giao diện hội thoại có hướng dẫn, trình biên tập quan hệ gia đình, không gian làm việc theo mô-đun, quản lý hồ sơ và công cụ Quick Logic Test. Hồ sơ và các lần suy luận được lưu bằng SQLite; mỗi lần chạy giữ snapshot dữ kiện và phiên bản cơ sở tri thức để phục vụ đối chiếu.

Sản phẩm thứ tư là bộ kiểm thử tự động. Cơ sở tri thức có 13 tệp kiểm thử CLIPS và 39 fixture CLP. Lần chạy toàn bộ tại thời điểm chuẩn bị báo cáo ghi nhận 88 kiểm tra nghiệp vụ CLIPS đạt. Tầng ứng dụng có 18 tệp kiểm thử Node.js, toàn bộ đều đạt trong lần chạy được trình bày ở Chương 5.

Đóng góp chính của đồ án không nằm ở việc tạo ra một quy định pháp luật mới, mà ở việc thiết kế một cách chuyển hóa, tổ chức và thực thi tri thức thừa kế sao cho kết quả có thể kiểm tra, tái lập và giải thích.

## 1.6. Cấu trúc báo cáo

Báo cáo gồm sáu chương. Chương 1 giới thiệu bài toán, mục tiêu, phạm vi và sản phẩm. Chương 2 trình bày cơ sở lý thuyết về biểu diễn tri thức, luật sản xuất, suy diễn tiến, xử lý thiếu thông tin và tri thức miền thừa kế. Chương 3 mô tả quá trình thu nhận, chuẩn hóa và tổ chức cơ sở tri thức. Chương 4 trình bày kiến trúc, thiết kế dữ liệu, luồng suy luận và giao diện của ứng dụng. Chương 5 mô tả phương pháp kiểm thử, kết quả thực nghiệm và các đe dọa tính hợp lệ. Chương 6 tổng kết kết quả, hạn chế và hướng phát triển.

