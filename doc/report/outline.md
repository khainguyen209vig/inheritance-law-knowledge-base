# Sườn báo cáo chính thức

## Thông tin điều phối

**Tên đề tài đề xuất:** Xây dựng hệ thống biểu diễn và suy luận tri thức hỗ trợ phân tích tình huống thừa kế theo pháp luật Việt Nam.

**Tên ứng dụng:** Mạch Di Sản.

**Thông điệp trung tâm:** Đồ án chuyển một phần tri thức về thừa kế thành dữ kiện và luật có cấu trúc, từ đó tạo kết luận có thể truy vết, chỉ rõ căn cứ và thừa nhận khi dữ kiện chưa đủ hoặc mâu thuẫn.

**Đối tượng đọc chính:** giảng viên học phần và người có kiến thức nền về công nghệ thông tin; không giả định người đọc biết CLIPS hoặc luật thừa kế chuyên sâu.

**Phạm vi phải phát biểu nhất quán:** nguyên mẫu phục vụ học tập, hỗ trợ phân tích từng mô-đun, không tự động giải quyết trọn vẹn một vụ thừa kế và không thay thế tư vấn pháp lý.

**Giả định trạng thái tri thức cho báo cáo:** toàn bộ rules thuộc phạm vi phiên bản được báo cáo đã hoàn tất review nội bộ và dùng trạng thái thống nhất `reviewed`; không còn trình bày rule ở trạng thái `draft` hoặc `TEAM_REVIEW`. Review nội bộ xác nhận tính nhất quán với đặc tả của nhóm, không được diễn giải thành thẩm định pháp lý độc lập.

## Phần đầu báo cáo

### Bìa và trang phụ bìa

Điền theo mẫu chính thức của trường/khoa:

- trường, khoa, học phần;
- tên đề tài;
- giảng viên hướng dẫn/phụ trách;
- nhóm, thành viên, mã số sinh viên;
- địa điểm và thời gian.

Không đặt tên công nghệ vào tên ứng dụng trên bìa. Nếu mẫu cho phép, đặt “Mạch Di Sản” dưới tên đề tài như tên sản phẩm.

### Phiếu giao nhiệm vụ/nhận xét

Chỉ thêm nếu mẫu của khoa yêu cầu. Giữ đúng biểu mẫu, không tự thiết kế lại.

### Lời cảm ơn

Ngắn gọn, khoảng nửa trang. Không đưa mô tả kỹ thuật hoặc tuyên bố đóng góp vào đây.

### Cam đoan

Nêu trách nhiệm của nhóm về nội dung, nguồn trích dẫn và kết quả thực nghiệm. Nếu có sử dụng công cụ hỗ trợ trong quá trình phát triển/biên soạn, khai báo theo quy định của học phần.

### Tóm tắt tiếng Việt

Khoảng 250–350 từ, trả lời đủ năm ý:

1. bài toán và động cơ;
2. phạm vi tri thức thừa kế được xử lý;
3. cách biểu diễn và suy luận ở mức khái quát;
4. sản phẩm và cách đánh giá;
5. kết quả chính và giới hạn.

Cuối phần có 4–6 từ khóa, ví dụ: `biểu diễn tri thức`, `hệ dựa trên luật`, `suy diễn tiến`, `giải thích suy luận`, `luật thừa kế`.

### Abstract tiếng Anh

Dịch theo nội dung đã chốt của tóm tắt tiếng Việt, không dịch từng chữ. Dùng nhất quán thuật ngữ `knowledge representation`, `rule-based system`, `forward chaining`, `explanation trace`, `inheritance law`.

### Mục lục và các danh mục

Theo thứ tự:

- mục lục;
- danh mục từ viết tắt và thuật ngữ;
- danh mục hình;
- danh mục bảng.

Danh mục từ viết tắt dự kiến có: BLDS, CSDL, UI, API, CLIPS. Không đưa từ chỉ xuất hiện một lần.

## Chương 1. Tổng quan đề tài

### 1.1. Bối cảnh và lý do chọn đề tài

Trình bày đặc điểm của bài toán: nhiều chủ thể và quan hệ, điều kiện/ngoại lệ, dữ kiện có thể thiếu hoặc mâu thuẫn, và nhu cầu giải thích căn cứ. Không mở đầu bằng việc “nhóm chọn CLIPS”.

### 1.2. Phát biểu bài toán

Mô tả đầu vào, đầu ra và người sử dụng:

- đầu vào: dữ kiện có cấu trúc về người, quan hệ, di chúc, phần di sản và sự kiện;
- đầu ra: kết luận theo mô-đun, dữ kiện thiếu, trạng thái mâu thuẫn, dấu vết suy luận và căn cứ điều luật;
- người sử dụng: thành viên nhóm/người học cần khảo sát tình huống, không phải hệ thống ra quyết định pháp lý.

Nên có một sơ đồ hộp “dữ kiện vụ việc → cơ sở tri thức và bộ suy luận → kết luận có giải thích”.

### 1.3. Mục tiêu

Tách thành:

- mục tiêu tổng quát;
- mục tiêu biểu diễn tri thức;
- mục tiêu suy luận và giải thích;
- mục tiêu hiện thực hóa ứng dụng;
- mục tiêu kiểm thử và đánh giá.

Mỗi mục tiêu phải có tiêu chí quan sát được ở Chương 5.

### 1.4. Phạm vi và giới hạn

Nêu rõ:

- phạm vi các điều về thừa kế trong Bộ luật Dân sự 2015 mà dự án đã mô hình hóa;
- các mô-đun hiện có và mức hoàn thiện tại bản đóng băng;
- không định giá tài sản, giải quyết chứng cứ/tranh chấp, hoặc tự động chia toàn bộ di sản end-to-end;
- toàn bộ rules trong phạm vi đã được review nội bộ, nhưng chưa được chuyên gia pháp lý thẩm định độc lập;
- không sử dụng LLM để tạo kết luận;
- kết quả không phải tư vấn pháp lý.

### 1.5. Sản phẩm và đóng góp

Nêu ở mức có thể kiểm chứng:

- bộ từ vựng và hợp đồng dữ kiện;
- cơ sở luật có định danh, căn cứ và provenance;
- cơ chế trả bốn trạng thái và phát hiện dữ kiện thiếu;
- dấu vết giải thích;
- ứng dụng web, lưu hồ sơ và công cụ kiểm thử logic;
- bộ fixture và regression test.

Không gọi mọi tính năng là “đóng góp mới”; phân biệt đóng góp của đồ án với công nghệ có sẵn.

### 1.6. Cấu trúc báo cáo

Mỗi chương một câu, tập trung vào vai trò của chương trong lập luận chung.

## Chương 2. Cơ sở lý thuyết và tri thức miền

### 2.1. Biểu diễn tri thức trong hệ dựa trên tri thức

Giới thiệu ngắn: tri thức miền, dữ kiện vụ việc, cơ sở tri thức, bộ nhớ làm việc, bộ suy luận và phân hệ giải thích. Kèm mô hình khái niệm tổng quát, sau đó ánh xạ sang đề tài.

### 2.2. Luật sản xuất và suy diễn tiến

Trình bày dạng `IF điều kiện THEN kết luận`, chu trình khớp–chọn–thực thi và lý do suy diễn tiến phù hợp khi cần suy ra toàn bộ hệ quả từ dữ kiện người dùng cung cấp. So sánh rất ngắn với suy diễn lùi để làm rõ quyết định, không biến thành khảo sát dài.

### 2.3. Suy luận trong điều kiện tri thức không đầy đủ

Giải thích lựa chọn không đồng nhất “không có dữ kiện” với “sai”; định nghĩa và minh họa bốn trạng thái `TRUE`, `FALSE`, `UNKNOWN`, `CONFLICT`. Nêu vai trò của completeness facts và missing requirements.

Không tuyên bố đây là logic bốn trị hình thức nếu hệ thống không hiện thực đầy đủ một hệ logic bốn trị; mô tả chính xác là quy ước trạng thái kết quả của hệ thống.

### 2.4. Khả năng giải thích và nguồn gốc tri thức

Trình bày vì sao một kết luận cần liên kết với facts hỗ trợ, Rule ID, điều/khoản/điểm và phiên bản cơ sở tri thức. Phân biệt lời giải thích thân thiện với dữ liệu provenance kỹ thuật.

### 2.5. Khái quát miền luật thừa kế

Tóm lược đúng phần cần cho mô hình: thời điểm mở thừa kế, di chúc, thừa kế theo pháp luật, hàng thừa kế, quyền hưởng, thế vị, suất bắt buộc, từ chối, thanh toán/phân chia và thời hiệu. Trích nguồn pháp luật chính thức ở mọi phát biểu quy phạm.

Không chép toàn văn điều luật vào thân bài; nội dung dài chuyển sang phụ lục hoặc dẫn nguồn.

### 2.6. Công nghệ nền tảng liên quan

Giới thiệu vừa đủ về CLIPS và vai trò của nó trong đồ án. Next.js, TypeScript và SQLite chỉ mô tả ngắn ở đây hoặc chuyển sang Chương 4; không để phần công nghệ lấn át nội dung biểu diễn tri thức.

## Chương 3. Thu nhận và biểu diễn tri thức

Đây là chương trọng tâm của học phần và nên được ưu tiên dung lượng.

### 3.1. Quy trình thu nhận và chuẩn hóa tri thức

Mô tả pipeline:

1. xác định nguồn Bộ luật Dân sự;
2. khoanh vùng điều khoản;
3. phân rã điều kiện, ngoại lệ và kết luận;
4. chuẩn hóa thuật ngữ và chủ thể;
5. gắn định danh, căn cứ và xác nhận trạng thái `reviewed`;
6. hiện thực rule;
7. kiểm thử bằng tình huống phản ví dụ và biên.

Nêu vai trò của `Loc_Rulebase_v2.md`, legal source catalog và rule registry như hiện vật dự án, nhưng không trích dẫn tài liệu nội bộ thay cho nguồn luật.

### 3.2. Mô hình khái niệm miền

Trình bày các thực thể và quan hệ chính: vụ việc, người, người để lại di sản, di chúc, phần di sản, quan hệ gia đình, sự kiện, yêu cầu phân tích. Cần một sơ đồ khái niệm/quan hệ có chú giải.

### 3.3. Mô hình dữ kiện

Phân biệt:

- asserted facts do người dùng hoặc hồ sơ cung cấp;
- derived facts do rule suy ra;
- knowledge facts biểu diễn bảng/tri thức dùng chung;
- control/projection facts chỉ điều phối kết quả hiển thị.

Đưa một `deftemplate` và một bộ facts nhỏ làm ví dụ. Danh mục slot đầy đủ chuyển Phụ lục A.

### 3.4. Mô hình luật

Giải thích cấu trúc Rule ID, điều kiện trái, kết luận phải, supports, căn cứ điều luật và implementation mapping. Xác nhận các rules trong bản báo cáo đều đã qua review nội bộ. Chọn 2–3 rules tiêu biểu có quan hệ nối tiếp để minh họa; không in toàn bộ rule base.

### 3.5. Tổ chức cơ sở tri thức theo mô-đun

Trình bày các nhóm A–J và dependency graph giữa các kết quả. Nêu rõ các mô-đun dùng chung working memory và có thể tái sử dụng derived facts; chúng không phải một chuỗi thủ tục cố định.

Cần một bảng tóm tắt: mô-đun, câu hỏi trả lời, đầu vào chính, kết luận chính, căn cứ luật, trạng thái triển khai.

### 3.6. Biểu diễn thiếu dữ kiện, mâu thuẫn và tính đầy đủ

Dùng ba tình huống đối chiếu:

- đủ dữ kiện và có kết luận;
- thiếu dữ kiện nên trả `UNKNOWN` kèm yêu cầu bổ sung;
- có kết luận không tương thích nên trả `CONFLICT`.

Giải thích các rule completeness/conflict riêng với domain rules.

### 3.7. Dấu vết suy luận và liên kết căn cứ

Chỉ ra cấu trúc `facts → rule → derived fact → module result`, cách ánh xạ Rule ID sang điều/khoản/điểm, và cách giao diện tạo lời giải thích từ dữ liệu này.

### 3.8. Ví dụ suy luận xuyên suốt

Dùng một tình huống đủ nhỏ nhưng thể hiện ít nhất hai bước suy diễn. Bao gồm:

- facts ban đầu;
- activations/rules chính;
- facts dẫn xuất;
- kết quả và căn cứ;
- biến thể thiếu một fact để chứng minh hệ thống không suy diễn quá mức.

## Chương 4. Phân tích, thiết kế và hiện thực hệ thống

### 4.1. Yêu cầu chức năng và phi chức năng

Nhóm chức năng theo use case: nhập tình huống, chọn câu hỏi, chạy suy luận, xem giải thích/căn cứ, lưu và mở lại hồ sơ, kiểm thử nhanh bằng file. Yêu cầu phi chức năng: tính tất định, truy vết, an toàn đầu vào, khả năng tái lập và tách tri thức khỏi dữ liệu vụ việc.

### 4.2. Kiến trúc tổng thể

Dùng sơ đồ kiến trúc cập nhật từ `doc/knowledge-based-architect.png`, thể hiện rõ:

- giao diện Next.js;
- Route Handlers/application services;
- CLIPS adapter và tiến trình CLIPS;
- knowledge base;
- SQLite case database;
- explanation/result projection.

Phần mô tả phải đi theo một request cụ thể thay vì chỉ liệt kê công nghệ.

### 4.3. Luồng xử lý một phiên suy luận

Trình bày sequence: nhận và kiểm tra dữ liệu → chuẩn hóa facts → chọn package rule → chạy engine → parse machine output → lưu snapshot → hiển thị kết quả/trace. Nên có sequence diagram.

### 4.4. Thiết kế dữ liệu và quản lý phiên bản

Trình bày schema ở mức các bảng chính, khóa liên kết và snapshot bất biến. Nêu cách tách case-specific data với knowledge base. DDL chi tiết chuyển phụ lục.

### 4.5. Thiết kế giao diện tương tác

Chọn các màn hình đại diện: hội thoại có hướng dẫn, graph gia đình, không gian xem kết quả và Quick Logic Test. Phân tích quyết định tương tác giúp giảm việc người dùng phải nhập trực tiếp kết luận pháp lý.

### 4.6. Explanation subsystem

Mô tả cách kết luận, facts hỗ trợ, luật, căn cứ và dữ kiện thiếu được chuyển thành nội dung người dùng đọc được; phân biệt chế độ phổ thông và kỹ thuật nếu bản đóng băng còn duy trì hai chế độ.

### 4.7. Kiểm soát đầu vào và an toàn thực thi

Trình bày parser allowlist cho file CLP, giới hạn kích thước/số facts, từ chối construct thực thi và nguyên tắc không chuyển nội dung upload trực tiếp cho CLIPS. Đây là một quyết định thiết kế, không cần đưa toàn bộ grammar vào thân bài.

### 4.8. Môi trường và công nghệ hiện thực

Bảng ngắn nêu công nghệ, phiên bản tại thời điểm chốt và vai trò. Hướng dẫn cài đặt chi tiết chuyển phụ lục.

## Chương 5. Thực nghiệm và đánh giá

### 5.1. Mục tiêu và câu hỏi đánh giá

Đề xuất bốn câu hỏi:

- **RQ1:** Các rules có tạo đúng kết luận mong đợi trên bộ tình huống đã thiết kế không?
- **RQ2:** Hệ thống có phản ánh đúng trường hợp thiếu hoặc mâu thuẫn dữ kiện không?
- **RQ3:** Kết quả có truy vết được về facts, Rule ID và căn cứ pháp luật không?
- **RQ4:** Người thử nghiệm có hoàn thành được các tác vụ nhập tình huống và đọc kết quả cốt lõi không?

Nếu chưa có usability test thật, không báo cáo RQ4 như đã hoàn thành; ghi rõ đây là hướng đánh giá dự kiến.

### 5.2. Thiết lập thực nghiệm

Ghi ngày, commit/tag, hệ điều hành, Node.js, CLIPS, lệnh chạy và cấu hình liên quan. Nêu nguyên tắc xây fixture và nguồn của expected result.

### 5.3. Bộ tình huống kiểm thử

Phân nhóm:

- trường hợp điển hình;
- trường hợp biên;
- thiếu dữ kiện;
- dữ kiện mâu thuẫn;
- regression theo từng mô-đun;
- kiểm thử parser/adapter/lưu snapshot ở tầng ứng dụng.

Thân bài chỉ cần bảng tổng hợp. Danh sách từng fixture, facts và expected result chuyển Phụ lục D.

### 5.4. Chỉ số đánh giá

Chỉ dùng chỉ số có dữ liệu thực:

- số ca đạt/tổng số ca theo mô-đun;
- số ca `UNKNOWN` và `CONFLICT` được nhận diện đúng;
- tỷ lệ kết quả có đủ Rule ID/căn cứ/supports theo tiêu chí kiểm tra;
- thời gian chạy nếu nhóm đo bằng quy trình lặp lại được;
- tỷ lệ hoàn thành tác vụ và lỗi quan sát được nếu có usability test.

Không dùng accuracy/precision/recall nếu không có tập nhãn độc lập và cách định nghĩa lớp rõ ràng.

### 5.5. Kết quả

Tạo bảng kết quả theo mô-đun và theo loại tình huống. Chèn một trace thành công, một kết quả thiếu dữ kiện và một conflict tiêu biểu. Tất cả con số phải được lấy từ lần chạy chốt, kèm log hoặc script tái lập.

### 5.6. Phân tích kết quả

Trả lời từng RQ, giải thích trường hợp chưa đạt và liên hệ với quyết định mô hình hóa. Tách lỗi tri thức, lỗi engine/adapter và lỗi giao diện để tránh quy kết chung.

### 5.7. Đe dọa tính hợp lệ và giới hạn đánh giá

Nêu ít nhất:

- expected result chủ yếu do nhóm xây dựng nên có nguy cơ thiên lệch;
- chưa có chuyên gia pháp lý xác nhận toàn bộ rule base;
- fixture chưa đại diện cho mọi tranh chấp thực tế;
- một số input vẫn là observation tổng hợp;
- usability test nội bộ có cỡ mẫu nhỏ hoặc chưa thực hiện;
- kết quả chỉ đúng với phiên bản knowledge base được đóng băng.

## Chương 6. Kết luận và hướng phát triển

### 6.1. Kết quả đạt được

Đối chiếu trực tiếp từng mục tiêu ở 1.3 với bằng chứng tại Chương 3–5. Không thêm tính năng chưa trình bày.

### 6.2. Hạn chế

Nhắc lại ngắn gọn các giới hạn có ảnh hưởng đến cách sử dụng: kiểm chứng pháp lý, phạm vi mô-đun, mức nguyên tử của facts, đánh giá người dùng và khả năng xử lý tranh chấp/chứng cứ.

### 6.3. Hướng phát triển

Ưu tiên theo giá trị nghiên cứu/sản phẩm:

1. thẩm định rule với người có chuyên môn pháp lý;
2. mở rộng và phiên bản hóa nguồn tri thức;
3. tăng bộ ca kiểm thử độc lập và mutation/coverage cho rules;
4. hoàn thiện nhập liệu graph và đánh giá usability;
5. so sánh các lần suy luận khi facts hoặc knowledge base thay đổi;
6. mở rộng phân chia di sản end-to-end chỉ khi mô hình pháp lý đã đủ chặt chẽ.

## Tài liệu tham khảo

Dùng danh mục trong [references.md](references.md) làm điểm khởi đầu. Trong bản chính, mục này phải đứng sau kết luận và trước phụ lục; chỉ liệt kê nguồn thực sự được trích trong nội dung.

Tối thiểu cần có ba nhóm:

- văn bản pháp luật và nguồn chính thức;
- giáo trình/bài báo về biểu diễn tri thức, hệ dựa trên luật, suy luận và giải thích;
- tài liệu chính thức của công nghệ trực tiếp được mô tả.

## Phụ lục đề xuất và tự đánh giá

Tiêu chí chuyển xuống phụ lục: nội dung cần cho tái lập hoặc đối chiếu, nhưng quá dài, lặp cấu trúc, hoặc không cần thiết để hiểu lập luận chính. Không chuyển kiến trúc cốt lõi, mô hình tri thức, ví dụ suy luận chính hoặc kết quả tổng hợp xuống phụ lục.

| Phụ lục | Nội dung | Đề xuất | Lý do |
|---|---|---|---|
| A | Fact contract/deftemplate và từ điển predicate đầy đủ | Nên có | Quan trọng để đối chiếu nhưng quá chi tiết cho Chương 3 |
| B | Rule catalog A–J: Rule ID, mô tả, căn cứ và xác nhận review | Nên có | Cho phép kiểm tra độ bao phủ và đối chiếu việc review nội bộ mà không làm loãng thân bài |
| C | Mã CLIPS tiêu biểu và mapping registry | Có chọn lọc | Chỉ đưa các đoạn đại diện; toàn bộ source đã nằm trong repository, không in hàng chục trang |
| D | Danh mục fixture/test case, facts đầu vào và expected result | Nên có | Là bằng chứng tái lập cho Chương 5 |
| E | Schema CSDL, API contract và line protocol | Có chọn lọc | Hữu ích cho hiện thực hóa nhưng không phải trọng tâm biểu diễn tri thức |
| F | Ảnh giao diện bổ sung và hướng dẫn thao tác | Có chọn lọc | Thân bài chỉ giữ màn hình được phân tích; ảnh walkthrough dài để ở đây |
| G | Hướng dẫn cài đặt, lệnh chạy và môi trường | Nên có | Hỗ trợ tái lập, tránh biến Chương 4 thành README |
| H | Phiếu usability test và dữ liệu quan sát đã ẩn danh | Chỉ khi đã test | Không đưa biểu mẫu trống như thể là kết quả thực nghiệm |
| I | Bảng phân công và đóng góp thành viên | Theo yêu cầu môn học | Mang tính quản trị, không thuộc lập luận học thuật |
| J | Toàn văn các điều luật | Không khuyến nghị | Dài, dễ lỗi thời và trùng nguồn; nên dẫn văn bản chính thức, chỉ trích đoạn thật sự cần phân tích |
| K | Log test thô đầy đủ | Không in mặc định | Nên lưu như artifact điện tử; báo cáo chỉ nêu hash/đường dẫn và bảng tổng hợp |

## Danh sách hình và bảng cần chuẩn bị

### Hình cốt lõi

1. Sơ đồ bài toán đầu vào–xử lý–đầu ra.
2. Mô hình thành phần của hệ dựa trên tri thức và ánh xạ sang dự án.
3. Mô hình khái niệm miền thừa kế.
4. Dependency graph các mô-đun tri thức.
5. Kiến trúc hệ thống.
6. Sequence diagram một lần suy luận.
7. Chuỗi giải thích của tình huống xuyên suốt.
8. Ảnh 2–4 màn hình đại diện, mỗi ảnh gắn với một quyết định thiết kế.

### Bảng cốt lõi

1. Mục tiêu và tiêu chí đánh giá.
2. Bảng thuật ngữ/loại tri thức.
3. So sánh `TRUE/FALSE/UNKNOWN/CONFLICT`.
4. Tổng quan mô-đun A–J.
5. Ánh xạ thành phần kiến trúc với trách nhiệm.
6. Bộ tình huống kiểm thử.
7. Kết quả thực nghiệm theo mô-đun.
8. Hạn chế và hướng khắc phục.

## Ma trận truy xuất nội dung từ repository

| Nội dung báo cáo | Nguồn nội bộ để tổng hợp | Lưu ý |
|---|---|---|
| Mục tiêu, phạm vi | `README.md`, `doc/Development_Plan.md` | Đối chiếu với trạng thái hiện tại, không sao chép backlog cũ |
| Từ vựng và quyết định mô hình | `doc/Loc_Rulebase_v2.md` | Chọn các quyết định thực sự đã hiện thực |
| Kiến trúc knowledge base | `knowledge-base/README.md`, `templates.clp` | Kiểm tra lại tên layer và contract |
| Catalog luật | `knowledge-base/rule-registry.json`, `rule-source-catalog.json` | Sinh số liệu tại thời điểm đóng băng |
| Căn cứ pháp lý | `knowledge-base/legal-sources/*.json` và nguồn chính thức | JSON là bản trích xuất nội bộ, nguồn trích dẫn vẫn là văn bản chính thức |
| Kiểm thử tri thức | `knowledge-base/tests/`, `knowledge-base/fixtures/` | Tổng hợp bằng lệnh/script, tránh đếm thủ công |
| Kiểm thử ứng dụng | `tests/` | Phân nhóm theo parser, adapter, persistence, UI/domain |
| Luồng hệ thống | `src/app/api/`, `src/server/`, `src/domain/` | Chỉ mô tả code đang dùng trong bản đóng băng |
| Giao diện | `src/app/`, `src/components/` | Chụp ảnh cùng một bộ dữ liệu demo nhất quán |
| Usability | `doc/Usability_Test_Guided_Conversation.md` | Chỉ báo cáo dữ liệu thật sau khi thực hiện |

## Phân bổ dung lượng gợi ý

Tùy quy định của khoa, với phần nội dung chính khoảng 45–60 trang:

| Phần | Tỷ trọng gợi ý |
|---|---:|
| Chương 1 | 8–10% |
| Chương 2 | 15–18% |
| Chương 3 | 25–30% |
| Chương 4 | 20–25% |
| Chương 5 | 18–22% |
| Chương 6 | 5–7% |

Phụ lục và tài liệu tham khảo không dùng để bù cho một Chương 3 hoặc Chương 5 thiếu chiều sâu.
