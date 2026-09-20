# Chương 2. Cơ sở lý thuyết và tri thức miền

## 2.1. Hệ thống dựa trên tri thức

Hệ thống dựa trên tri thức giải quyết bài toán bằng cách lưu trữ tri thức miền dưới một hình thức mà máy tính có thể xử lý, sau đó áp dụng một cơ chế suy luận lên dữ kiện của trường hợp cụ thể. Cấu trúc cơ bản thường gồm cơ sở tri thức, bộ nhớ làm việc, bộ suy luận, giao diện thu nhận dữ kiện và phân hệ giải thích. Cách tiếp cận này phù hợp khi lời giải phụ thuộc vào nhiều quy tắc có thể phát biểu tường minh và cần được thay đổi độc lập với mã giao diện.

Trong đồ án, các thành phần được ánh xạ như sau:

| Thành phần khái niệm | Thành phần trong Mạch Di Sản |
|---|---|
| Cơ sở tri thức | Fact contracts, knowledge facts và rules trong `knowledge-base/` |
| Bộ nhớ làm việc | Tập `asserted-fact` và `derived-fact` của một lần chạy CLIPS |
| Bộ suy luận | CLIPS và agenda thực thi rules |
| Dữ kiện vụ việc | Facts nhập từ giao diện hoặc tệp case study |
| Phân hệ giải thích | `inference-trace`, rule metadata và giao diện căn cứ |
| Kho lưu trữ | SQLite lưu hồ sơ và snapshot suy luận |

Việc tách cơ sở tri thức khỏi dữ kiện vụ việc có hai lợi ích. Thứ nhất, cùng một phiên bản tri thức có thể áp dụng cho nhiều hồ sơ mà không làm lẫn thông tin giữa các vụ việc. Thứ hai, rules có thể được kiểm thử và phiên bản hóa độc lập với giao diện ứng dụng.

## 2.2. Luật sản xuất

Luật sản xuất biểu diễn tri thức theo cấu trúc điều kiện–kết luận:

```text
IF <các điều kiện được thỏa mãn>
THEN <sinh kết luận hoặc hành động>
```

Trong CLIPS, luật được khai báo bằng `defrule`. Vế trái chứa các mẫu cần đối sánh trong bộ nhớ làm việc; vế phải tạo dữ kiện dẫn xuất khi luật được kích hoạt. CLIPS được phát triển cho các ứng dụng dựa trên luật và cung cấp trực tiếp các khái niệm facts, templates, rules, agenda và chiến lược giải quyết xung đột [2], [3]. Nền tảng về hệ chuyên gia dựa trên luật và kinh nghiệm tổ chức tri thức theo mô-đun cũng được ghi nhận trong các hệ thống kinh điển như MYCIN [6].

Ví dụ khái quát cho điều kiện về ý chí khi lập di chúc:

```text
IF người lập di chúc minh mẫn, sáng suốt
AND không bị lừa dối, đe dọa hoặc cưỡng ép
THEN điều kiện về ý chí hợp lệ
```

Luật trong hệ thống không chỉ tạo giá trị kết luận mà còn ghi Rule ID và danh sách facts hỗ trợ. Nhờ đó, kết quả không bị tách rời khỏi lý do hình thành.

## 2.3. Suy diễn tiến

Suy diễn tiến bắt đầu từ các facts đã biết và liên tục kích hoạt những luật có điều kiện phù hợp để tạo thêm facts. Chu trình khái quát gồm bốn bước:

1. đối sánh điều kiện của rules với bộ nhớ làm việc;
2. đưa các rule có thể kích hoạt vào agenda;
3. chọn và thực thi một activation theo chiến lược giải quyết xung đột;
4. cập nhật bộ nhớ làm việc rồi lặp lại cho đến khi không còn activation phù hợp.

Đồ án chọn suy diễn tiến vì một tập dữ kiện của vụ việc có thể tạo ra nhiều kết luận trung gian được tái sử dụng giữa các mô-đun. Ví dụ, trạng thái quyền hưởng của một người có thể được dùng khi xác định người thuộc hàng thừa kế đang hoạt động, điều kiện thế vị và suất bắt buộc. Rules miền hoạt động trên working memory chung trong một package thay vì được backend gọi tuần tự theo từng Rule ID.

Suy diễn lùi thường khởi đầu từ một mục tiêu và truy ngược các điều kiện cần chứng minh. Đồ án không hiện thực backward chaining. Việc chọn câu hỏi trên giao diện chỉ quyết định package rules và kết quả cần projection; nó không thay đổi bản chất suy diễn của domain rules. Dữ kiện thiếu được phát hiện bằng các completeness rules và schema đầu vào.

## 2.4. Tri thức không đầy đủ và giả định thế giới mở

Trong nhiều chương trình nghiệp vụ, sự vắng mặt của một giá trị thường bị hiểu là phủ định. Cách hiểu đó không an toàn với dữ kiện pháp lý. Nếu hệ thống chưa nhận được fact `refusal-made=true`, không thể tự động suy ra người đó không từ chối nhận di sản. Có thể người dùng chưa nhập thông tin, hoặc việc xác minh chưa hoàn tất.

Đồ án áp dụng nguyên tắc gần với giả định thế giới mở: chỉ kết luận đúng hoặc sai khi có đủ facts và rule phù hợp. Khi thiếu điều kiện cần thiết, completeness layer tạo `missing-requirement`. Khi dữ kiện đã được đánh dấu là đầy đủ nhưng chưa khớp đường suy luận đã mô hình hóa, hệ thống có thể trả `unknown` hoặc `unresolved-rule-path` thay vì suy đoán.

Bốn trạng thái kết quả được sử dụng như sau:

| Trạng thái | Ý nghĩa |
|---|---|
| `TRUE` | Có chuỗi facts và rules hỗ trợ kết luận dương |
| `FALSE` | Có chuỗi facts và rules hỗ trợ kết luận phủ định |
| `UNKNOWN` | Chưa đủ cơ sở để kết luận hoặc chưa có đường luật phù hợp |
| `CONFLICT` | Đồng thời tồn tại các kết luận không tương thích |

Đây là quy ước trạng thái đầu ra của hệ thống, không phải tuyên bố rằng toàn bộ cơ sở tri thức hiện thực đầy đủ một hệ logic bốn trị hình thức. Sự phân biệt này giúp mô tả đúng hiện thực kỹ thuật và tránh gán cho hệ thống năng lực chưa được chứng minh.

## 2.5. Tính đầy đủ và phát hiện mâu thuẫn

Một số kết luận phủ định chỉ có ý nghĩa khi phạm vi tìm kiếm đã hoàn tất. Chẳng hạn, không thể xác định hàng thừa kế đang hoạt động nếu danh sách người liên quan chưa được rà soát đầy đủ. Vì vậy, hệ thống dùng các completeness facts như `heir-search-complete=true` để biểu diễn việc người dùng hoặc quy trình bên ngoài đã hoàn thành một bước kiểm tra.

Completeness rules có trách nhiệm phát hiện predicate còn thiếu. Chúng không thay đổi tri thức pháp lý mà tạo yêu cầu bổ sung dữ kiện cho giao diện. Conflict rules kiểm tra sự đồng tồn tại của các kết luận đối nghịch, ví dụ vừa suy ra di chúc hợp pháp vừa suy ra không hợp pháp cho cùng chủ thể. Result projection ưu tiên phản ánh `conflict` thay vì che giấu một nhánh.

Việc tách ba loại rule — domain, completeness/conflict và projection — làm rõ trách nhiệm:

- domain rules tạo tri thức pháp lý dẫn xuất;
- completeness/conflict rules đánh giá trạng thái thông tin;
- projection rules chọn kết quả công khai cho yêu cầu phân tích.

## 2.6. Khả năng giải thích và nguồn gốc kết luận

Một hệ thống hỗ trợ phân tích pháp lý cần cho người dùng biết không chỉ kết luận mà cả cơ sở của kết luận. Nghiên cứu về hệ chuyên gia giải thích nhấn mạnh nhu cầu trình bày sự biện minh cho hành động của hệ thống, chiến lược giải quyết vấn đề và thuật ngữ miền [7]. Trong đồ án, yêu cầu giải thích được cụ thể hóa bằng bốn câu hỏi:

1. Hệ thống kết luận điều gì?
2. Những facts nào hỗ trợ kết luận?
3. Rule nào được áp dụng và rule đó dựa trên điều luật nào?
4. Còn thiếu dữ kiện hoặc tồn tại mâu thuẫn nào?

Mỗi `derived-fact` lưu `rule-id` và `supports`. Rule metadata lưu mô-đun, mô tả, căn cứ và trạng thái review. `inference-trace` sao chép quan hệ provenance ở dạng ổn định để tầng ứng dụng xử lý. Thứ tự giải thích được tái dựng từ quan hệ phụ thuộc giữa các facts thay vì phụ thuộc vào một bộ đếm có thể thay đổi theo agenda.

Khả năng giải thích của hệ thống có giới hạn. Dấu vết chứng minh rule nào đã kích hoạt; nó không tự chứng minh rằng cách mô hình hóa điều luật là cách diễn giải pháp lý duy nhất. Do đó báo cáo phân biệt **tính truy vết kỹ thuật** với **tính đúng đắn pháp lý**.

## 2.7. Tri thức pháp lý có thể xử lý bằng máy

Văn bản pháp luật được viết cho con người, chứa cấu trúc điều, khoản, điểm và nhiều khái niệm phụ thuộc ngữ cảnh. Để máy tính xử lý, một phần nội dung cần được chuyển thành dữ liệu, rules hoặc biểu mẫu có cấu trúc. Đây là hướng tiếp cận thường được gọi là computable law [8]. Quá trình chuyển đổi không đơn thuần là chép câu chữ vào mã; kỹ sư tri thức phải xác định chủ thể, thời điểm, điều kiện, ngoại lệ, phạm vi phủ định và loại kết luận.

Trong phạm vi đồ án, tri thức miền được chia thành các nhóm:

- tri thức về hình thức và tính hợp pháp của di chúc;
- tri thức xác định phần di sản theo di chúc hoặc theo pháp luật;
- tri thức về người có hoặc không có quyền hưởng;
- tri thức về quan hệ gia đình, hàng thừa kế và thế vị;
- tri thức về suất bắt buộc và quan hệ vợ chồng đặc biệt;
- tri thức về từ chối, tài sản không có người nhận, thanh toán, phân chia và thời hiệu.

Nguồn gốc pháp lý chính là Bộ luật Dân sự năm 2015 [1]. Nội dung điều luật được lưu trong legal source catalog với ID ổn định như `article-630` hoặc `clause-1-a`. Rules tham chiếu các ID này thông qua registry, nhờ đó giao diện có thể hiển thị phần văn bản liên quan mà không phải phân tích lại tệp tài liệu ở mỗi lần chạy.

## 2.8. Công nghệ nền tảng

CLIPS đảm nhiệm biểu diễn facts, rules và suy luận. Phiên bản tài liệu 6.4.2 mô tả các cấu trúc `deftemplate`, `deffacts`, `defrule`, chu trình thực thi và chiến lược agenda được sử dụng trong đồ án [2].

Ứng dụng được xây dựng bằng Next.js và TypeScript. Next.js cung cấp mô hình full-stack dựa trên React cùng App Router và Route Handlers [4]. SQLite được dùng để lưu dữ kiện và snapshot vì đây là cơ sở dữ liệu nhúng, không cần tiến trình máy chủ riêng và lưu dữ liệu trong tệp cục bộ [5]. Những công nghệ này là phương tiện hiện thực hóa; đóng góp trọng tâm của học phần vẫn là mô hình tri thức, suy luận và giải thích.

