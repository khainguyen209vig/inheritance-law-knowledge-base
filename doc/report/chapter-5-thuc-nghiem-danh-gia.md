# Chương 5. Thực nghiệm và đánh giá

## 5.1. Mục tiêu và câu hỏi đánh giá

Thực nghiệm nhằm kiểm tra khả năng chuyển từ một tập dữ kiện có cấu trúc sang kết luận có thể truy vết của Mạch Di Sản. Phạm vi đánh giá tập trung vào tính nhất quán của chuỗi **tình huống rút gọn – facts đầu vào – kết quả kỳ vọng – kết quả hệ thống**, không đánh giá lại nội dung đầy đủ của bản án và không đo mức độ đồng thuận với phán quyết của Tòa án.

Năm câu hỏi được sử dụng để định hướng đánh giá:

1. Hệ thống có xác định đúng chế độ chia thừa kế theo dữ kiện về di chúc hay không?
2. Hệ thống có xác định đúng hàng thừa kế và trạng thái được gọi hưởng của từng người hay không?
3. Hệ thống có nhận diện đúng các nhánh thừa kế thế vị và trường hợp từ chối nhận di sản hay không?
4. Hệ thống có tính đúng thời hạn và ngày kết thúc thời hiệu từ dữ kiện đầu vào hay không?
5. Kết quả phân chia giá trị có nhất quán với kết quả về người hưởng và nhánh thế vị hay không?

Các câu hỏi từ 1 đến 4 đánh giá kết luận theo mô-đun. Câu hỏi 5 đánh giá khả năng kết nối các kết luận mô-đun thành một kết quả phân bổ giá trị. Sự phân biệt này cần thiết vì một hệ thống có thể xác định đúng quan hệ thừa kế nhưng vẫn phân bổ sai hoặc thiếu khi tổng hợp kết quả.

## 5.2. Thiết kế thực nghiệm

### 5.2.1. Phạm vi và đơn vị đánh giá

Bộ thực nghiệm gồm ba tình huống được nhóm giản hóa từ các bản án công khai. Số hiệu bản án được giữ lại để mô tả nguồn hình thành tình huống; tuy nhiên, sau khi giản hóa, mỗi tình huống được xem là một fixture độc lập. Việc đánh giá trong chương này không sử dụng các tệp văn bản bản án tại `tests/case_test/doc_file/` làm ground truth.

Mỗi tình huống có ba lớp hiện vật:

- tài liệu mô tả tình huống và kết quả kỹ thuật mong đợi;
- tệp CLP chứa facts đầu vào;
- các báo cáo Markdown và CLP do hệ thống sinh theo từng mô-đun.

Đơn vị so sánh là một kết luận có nghĩa cụ thể, chẳng hạn `called-to-inherit=true`, `inherits-by-representation=true` hoặc ngày kết thúc thời hiệu. Không sử dụng số lượng dòng báo cáo hoặc số rule được kích hoạt làm chỉ số đúng đắn.

### 5.2.2. Quy trình đối chiếu

Với mỗi tình huống, nhóm thực hiện bốn bước:

1. đọc mô tả rút gọn và xác định các kết luận mong đợi;
2. kiểm tra các facts tương ứng trong tệp CLP;
3. đối chiếu phần kết luận của báo cáo hệ thống với expected output;
4. kiểm tra tính nhất quán giữa các mô-đun, đặc biệt giữa kết quả thế vị và kết quả phân chia giá trị.

Các báo cáo về hiệu lực di chúc không được tính vào kết quả vì cả ba tình huống đều xác định không có di chúc. Tương tự, báo cáo về suất bắt buộc không được sử dụng để kết luận chất lượng của các case này vì câu hỏi “người thừa kế không phụ thuộc nội dung di chúc” không áp dụng. Trạng thái `missing-facts` của mô-đun hiệu lực di chúc vì vậy được xem là mô-đun không áp dụng, không phải một lỗi của tình huống.

### 5.2.3. Ground truth và giới hạn diễn giải

Ground truth của thực nghiệm là expected output do nhóm xây dựng cho phiên bản tình huống đã giản hóa. Ground truth này chưa được một chuyên gia pháp lý độc lập thẩm định. Kết quả “khớp” chỉ chứng minh hệ thống tạo đúng kết luận theo đặc tả kiểm thử; nó không chứng minh tình huống rút gọn phản ánh đầy đủ vụ án thực tế hoặc hệ thống có thể đưa ra tư vấn pháp lý.

Chi tiết về dữ kiện, expected output, actual output và đường dẫn hiện vật được tách khỏi thân bài tại Phụ lục D.1, D.2 và D.3.

## 5.3. Bộ tình huống thực nghiệm

### 5.3.1. Tình huống 1: nhiều nhánh thừa kế thế vị

Tình huống thứ nhất mô tả người để lại di sản không có di chúc, có vợ, ba người con còn sống và hai người con chết trước hoặc cùng thời điểm mở thừa kế. Mỗi người con đã chết để lại hai người con. Tài sản mô phỏng có giá 5.172.000.000 đồng, trong đó một nửa, tương đương 2.586.000.000 đồng, được đưa vào khối di sản.

Case này kiểm tra đồng thời chế độ chia theo pháp luật, hàng thừa kế thứ nhất, hai nhánh thế vị, thời hiệu đối với bất động sản và phép tính phần tài sản thuộc di sản. Dữ liệu và kết quả đầy đủ được trình bày tại [Phụ lục D.1](appendix-d1-case-1.md).

### 5.3.2. Tình huống 2: một nhánh thế vị và một nhánh không có người thế vị

Tình huống thứ hai mô tả người để lại di sản không có di chúc, có vợ và nhiều người con. Một người con chết trước nhưng không có con; một người con khác chết trước và để lại hai con có khả năng hưởng thế vị. Giá trị tài sản được dùng trong phép tính là 833.000.000 đồng.

Điểm kiểm tra quan trọng của case này là sự khác biệt giữa số người được gọi hưởng trực tiếp và số suất phân chia khi tồn tại một nhánh thế vị. Case cho phép phát hiện trường hợp tổng số suất và số tiền trên một suất có vẻ hợp lý nhưng danh sách người hoặc nhánh nhận suất không khớp với oracle. Chi tiết nằm tại [Phụ lục D.2](appendix-d2-case-2.md).

### 5.3.3. Tình huống 3: từ chối nhận di sản kết hợp thừa kế thế vị

Tình huống thứ ba mô tả một hàng thừa kế có người từ chối nhận di sản hợp lệ và một người chết trước để lại hai người con hưởng thế vị. Phép tính giá trị chỉ sử dụng thửa đất 281 với giá trị mô phỏng 500.000.000 đồng; các thửa đất còn lại được giữ trong mô tả nhưng không tham gia phép tính của fixture.

Case kiểm tra sự phối hợp giữa chuẩn hóa trạng thái từ chối, loại người từ chối khỏi danh sách được gọi hưởng, xác định nhánh thế vị và tính thời hiệu. Chi tiết nằm tại [Phụ lục D.3](appendix-d3-case-3.md).

## 5.4. Tiêu chí đánh giá

Mỗi nhóm kết luận được gán một trong bốn mức:

| Mức đánh giá | Ý nghĩa |
|---|---|
| Khớp | Actual output biểu đạt cùng kết luận với expected output cho tất cả đối tượng thuộc nhóm đang xét |
| Khớp một phần | Một phần kết luận đúng nhưng còn thiếu đối tượng, thiếu đầu ra hoặc chưa nối được sang kết quả tổng hợp |
| Không khớp | Actual output đưa ra đối tượng, trạng thái hoặc giá trị khác expected output |
| Chưa thể kết luận | Expected output thiếu hoặc tự mâu thuẫn, nên chưa có oracle đủ tin cậy để chấm actual output |
| Không áp dụng | Mô-đun không thuộc câu hỏi của tình huống hoặc không có điều kiện kích hoạt phù hợp |

Phương pháp này không quy đổi thành accuracy, precision hoặc recall. Ba fixture không phải mẫu thống kê, còn các kết luận trong cùng một case có phụ thuộc lẫn nhau. Việc đưa ra một tỷ lệ phần trăm từ tập dữ liệu nhỏ này có thể tạo cảm giác chính xác không có cơ sở.

## 5.5. Kết quả thực nghiệm

### 5.5.1. Kết quả tổng hợp

| Case | Chế độ chia | Hàng thừa kế và gọi hưởng | Thế vị | Thời hiệu | Phân chia giá trị | Đánh giá chung |
|---|---|---|---|---|---|---|
| Case 1 – 227/2019/DS-ST | Khớp | Khớp | Khớp | Khớp | Khớp một phần | Đạt một phần |
| Case 2 – 202/2021/DS-PT | Khớp | Khớp | Khớp | Khớp | Chưa thể kết luận | Cần hoàn thiện oracle |
| Case 3 – 64/2018/DS-ST | Khớp | Khớp | Khớp | Khớp | Khớp một phần | Đạt một phần |

Không case nào được gắn nhãn “đạt hoàn toàn”, bởi kết quả phân chia giá trị chưa nhất quán đầy đủ với kết luận về nhánh thế vị hoặc expected output chưa đủ chặt chẽ để làm oracle.

### 5.5.2. Kết quả Case 1

Hệ thống xác định đúng chia theo pháp luật; vợ và ba người con còn sống được gọi hưởng trực tiếp; hai người con đã chết không được gọi hưởng trực tiếp; bốn người cháu được xác định hưởng thế vị. Mô-đun thời hiệu trả thời hạn 30 năm và ngày kết thúc 01/01/2014. Phép tính tài sản cũng xác định đúng phần thuộc di sản là 2.586.000.000 đồng.

Hạn chế xuất hiện ở kết quả phân chia: toàn bộ di sản được chia thành bốn suất trực tiếp, mỗi suất 646.500.000 đồng, trong khi hai nhánh thế vị đã được xác định ở mô-đun khác nhưng chưa nhận phần giá trị tương ứng. Vì vậy, kết quả này chỉ có thể được diễn giải là phép tính giả định trên tập người hưởng trực tiếp, không phải phương án phân chia cuối cùng cho toàn bộ case.

### 5.5.3. Kết quả Case 2

Các kết luận về chế độ chia, hàng thừa kế, trạng thái gọi hưởng, hai người cháu hưởng thế vị và ngày kết thúc thời hiệu 02/11/2026 đều khớp expected output.

Sai lệch xuất hiện khi phân chia 833.000.000 đồng. Expected output dành bốn suất cho bốn người con còn sống và một suất cho nhánh của ông Tác; hai người trong nhánh này dự kiến nhận 83.300.000 đồng mỗi người. Tuy nhiên, chính phần expected về người được gọi hưởng lại xác định người vợ cũng được hưởng trực tiếp. Hai phần của oracle vì vậy không nhất quán. Actual output chia năm suất bằng nhau cho người vợ và bốn người con còn sống, mỗi suất 166.600.000 đồng, đồng thời không gán giá trị cho hai người cháu. Có thể khẳng định actual khác expected đã ghi và chưa thể hiện nhánh thế vị, nhưng chưa thể kết luận phương án tiền nào đúng cho fixture cho đến khi nhóm sửa và review lại oracle.

### 5.5.4. Kết quả Case 3

Hệ thống xác định đúng chế độ chia theo pháp luật, năm người được gọi hưởng trực tiếp, ông V không được gọi hưởng, ông S không được gọi hưởng và hai người con của ông S được hưởng thế vị. Mô-đun thời hiệu trả ngày kết thúc 28/10/2023.

Kết quả ông V không được gọi hưởng cho thấy trạng thái từ chối đã được các mô-đun hạ nguồn sử dụng. Tuy nhiên, bộ artifact chưa có báo cáo riêng cho câu hỏi từ chối nhận di sản để trình bày trực tiếp kết luận `valid-refusal=true`. Báo cáo phân chia cũng chia 500.000.000 đồng thành năm suất trực tiếp, mỗi suất 100.000.000 đồng, nhưng chưa thể hiện phần giá trị của nhánh thế vị. Vì vậy case này khớp về phân loại người hưởng nhưng mới khớp một phần ở kết quả tổng hợp.

## 5.6. Phân tích và thảo luận

### 5.6.1. Điểm hệ thống thực hiện tốt

Ba case cho thấy kết quả ổn định ở các bước phân loại cốt lõi. Từ cùng một tập facts, hệ thống có thể suy ra chế độ chia, hàng thừa kế, trạng thái gọi hưởng, nhánh thế vị và thời hạn theo một chuỗi rule có thể truy vết. Các báo cáo chỉ ra Rule ID, supports và nguồn hiện thực, giúp người kiểm tra xác định kết luận được tạo từ dữ kiện nào.

Việc tách kết luận theo mô-đun cũng giúp khoanh vùng sai lệch. Trong cả ba case, lỗi không nằm ở việc nhận diện quan hệ thế vị mà nằm ở bước đưa nhánh thế vị vào phép tính giá trị. Đây là thông tin hữu ích hơn một nhãn pass/fail duy nhất cho toàn bộ case.

### 5.6.2. Hạn chế được phát hiện

Hạn chế chính của bộ artifact là kết quả `estate-settlement` đang dựa trên số người được gọi hưởng trực tiếp và chưa thể hiện đơn vị “suất theo nhánh”. Do đó, một người chết trước có thể bị loại khỏi danh sách trực tiếp, các con của người đó được xác định hưởng thế vị, nhưng nhánh không xuất hiện trong kết quả giá trị. Trước khi xác định đây hoàn toàn là lỗi hiện thực, expected output cũng phải được sửa để liệt kê nhất quán mọi người và nhánh được hưởng.

Case 2 còn cho thấy một sai lệch có thể bị che giấu nếu chỉ kiểm tra số học tổng quát. Actual và expected đều có năm suất và giá trị 166.600.000 đồng trên một suất, nhưng khác nhau về đối tượng nhận; đồng thời oracle tự mâu thuẫn về quyền của người vợ. Bộ kiểm thử sau này phải so sánh đồng thời tổng giá trị, số suất, chủ thể nhận và quan hệ nhánh, đồng thời bắt buộc review tính nhất quán của oracle trước khi chạy.

Ngoài ra, việc tạo báo cáo cho mọi mô-đun làm xuất hiện output không áp dụng, như hiệu lực di chúc trong case không có di chúc. Bộ điều phối báo cáo nên đánh dấu `not-applicable` hoặc không sinh báo cáo thay vì trả `missing-facts`, để người đọc không nhầm giữa thiếu dữ kiện và câu hỏi nằm ngoài phạm vi case.

### 5.6.3. Ý nghĩa đối với mục tiêu đồ án

Thực nghiệm cung cấp bằng chứng rằng cơ sở tri thức có thể tạo các kết luận mô-đun có giải thích trên tình huống nhiều người và nhiều nhánh. Đồng thời, nó xác định rõ ranh giới của nguyên mẫu: hệ thống hỗ trợ phân tích từng yếu tố nhưng chưa tạo phương án phân chia end-to-end đáng tin cậy khi có thừa kế thế vị. Kết quả này phù hợp với phạm vi đã tuyên bố ở Chương 1 và là căn cứ trực tiếp cho hướng phát triển ở Chương 6.

## 5.7. Đe dọa tính hợp lệ

**Tính hợp lệ nội tại.** Expected output được xây dựng cùng quá trình tạo fixture nên có nguy cơ lặp lại giả định của người viết facts. Việc đối chiếu hiện tại phát hiện bất nhất giữa các mô-đun nhưng chưa thay thế một quy trình review oracle độc lập.

**Tính hợp lệ cấu trúc.** Các mức “khớp” đánh giá sự phù hợp với expected output, không đo toàn bộ khái niệm đúng đắn pháp lý. Một kết luận có thể đúng theo predicate kỹ thuật nhưng vẫn thiếu ngữ cảnh cần thiết để áp dụng vào một vụ việc thực.

**Tính hợp lệ bên ngoài.** Ba case đều là tình huống không có di chúc và có bất động sản. Bộ dữ liệu chưa đại diện cho các trường hợp di chúc hợp lệ hoặc vô hiệu, người thừa kế bắt buộc, nghĩa vụ tài sản, di sản không có người nhận và nhiều loại tài sản.

**Đánh giá người dùng.** Bộ công cụ usability đã được chuẩn bị tại [Phụ lục H](appendix-h-usability-instrument.md), nhưng chưa có đủ phiên quan sát người dùng thật. Vì vậy chương này không đưa ra kết luận về mức dễ sử dụng hoặc khả năng người dùng hiểu đúng kết quả.

**Tính hợp lệ kết luận.** Kích thước tập dữ liệu nhỏ và các quan sát có phụ thuộc lẫn nhau, nên không sử dụng các chỉ số thống kê. Kết luận của chương chỉ áp dụng cho ba fixture và phiên bản artifact được lưu trong repository.

**Độ tin cậy của nguồn tham chiếu.** Việc giản hóa có thể loại bỏ dữ kiện quan trọng của bản án ban đầu. Vì chương này chủ động không sử dụng `doc_file` làm ground truth, kết quả không được diễn giải thành mức độ tái hiện phán quyết của Tòa án.

## 5.8. Khả năng tái lập

Các facts đầu vào được lưu tại `tests/case_test/clp_test/`; mô tả và expected output tại `tests/case_test/doc_case-test/`; báo cáo đầu ra tại `tests/case_test/results/`. Phụ lục D.1–D.3 cung cấp liên kết đến từng hiện vật.

Tại thời điểm biên soạn, ba case chưa được đăng ký thành test tự động trong script của dự án. Vì vậy các artifact hiện tại là bằng chứng của lần sinh báo cáo đã lưu, chưa phải bằng chứng rằng một regression suite đã tự động chạy và pass. Để tái lập chặt chẽ hơn, nhóm cần bổ sung expected manifest có cấu trúc, runner sinh lại báo cáo và assertion so sánh theo chủ thể, predicate và giá trị.
