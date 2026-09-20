# Chương 6. Kết luận và hướng phát triển

## 6.1. Kết quả đạt được

Đồ án đã xây dựng Mạch Di Sản, một nguyên mẫu hệ thống dựa trên tri thức hỗ trợ phân tích một số yếu tố trong tình huống thừa kế theo pháp luật Việt Nam. Kết quả được đối chiếu với các mục tiêu ban đầu như sau.

Về biểu diễn tri thức, đồ án đã xây dựng hợp đồng dữ kiện dùng chung, phân biệt observations, tri thức dẫn xuất, knowledge facts, yêu cầu phân tích và kết quả trình bày. Chủ thể và quan hệ được gắn định danh theo vụ việc; phần di sản và kết luận được gắn subject cụ thể, hạn chế nhầm lẫn giữa các đối tượng.

Về cơ sở luật, phiên bản báo cáo tổ chức tri thức thành mười mô-đun, với 87 registry entries và 155 mappings tới implementations. Mỗi Rule ID có mô tả, loại, căn cứ, phân đoạn pháp luật liên quan và ánh xạ source. Toàn bộ rules thuộc phạm vi được coi là đã hoàn tất review nội bộ.

Về suy luận, hệ thống sử dụng CLIPS và forward chaining để sinh tri thức mới từ facts. Domain rules không phụ thuộc vào yêu cầu hiển thị; module request chỉ chọn package và projection. Các completeness và conflict rules cho phép phân biệt kết luận đúng, sai, chưa xác định và mâu thuẫn.

Về giải thích, mỗi derived fact lưu Rule ID và supports. Inference trace, rule registry và legal source catalog kết hợp để tạo chuỗi dữ kiện–rule–kết luận và mở phần điều luật liên quan. Thiết kế này đáp ứng mục tiêu truy vết kỹ thuật của đồ án.

Về ứng dụng, hệ thống đã có giao diện hội thoại có hướng dẫn, workspace theo mô-đun, graph gia đình, quản lý hồ sơ, lưu snapshot và Quick Logic Test. Dữ kiện vụ việc được lưu bằng SQLite; knowledge base nằm riêng trong các tệp CLIPS.

Về kiểm thử, dự án đã xây dựng hạ tầng kiểm thử cho rules và các thành phần ứng dụng, gồm fixture cho nhiều nhánh suy luận và kiểm thử tích hợp. Bộ asset đánh giá chính thức và kết quả tổng hợp chưa được chốt, do đó báo cáo chưa đưa ra kết luận thực nghiệm định lượng ở phiên bản này.

## 6.2. Hạn chế

Hạn chế quan trọng nhất là tính đúng đắn pháp lý chưa được thẩm định độc lập. Review nội bộ giúp duy trì tính nhất quán của đặc tả, rules và test, nhưng không thay thế ý kiến của chuyên gia pháp luật. Vì vậy ứng dụng không được sử dụng như nguồn tư vấn hoặc quyết định pháp lý.

Phạm vi mô hình hóa chưa bao phủ toàn bộ chế định thừa kế và chưa xử lý mọi cách diễn giải có thể xảy ra. Một số điều kiện pháp lý vẫn được nhập dưới dạng observation tổng hợp. Nếu observation ban đầu sai hoặc chưa được xác minh, dấu vết suy luận có thể hoàn toàn nhất quán nhưng kết luận vẫn không phản ánh vụ việc thực.

Hệ thống chủ yếu trả kết quả theo mô-đun. Mặc dù đã có phép tính giá trị di sản và một số nguyên tắc phân chia, ứng dụng chưa tạo một phương án phân chia end-to-end cho mọi hồ sơ. Các vấn đề như định giá, chứng cứ, tranh chấp và quyết định của Tòa án nằm ngoài phạm vi.

Bộ kiểm thử hiện chủ yếu phục vụ phát triển và hồi quy nội bộ. Bộ dữ liệu đánh giá độc lập, mutation coverage của rules và usability study chưa được hoàn thiện. Vì vậy báo cáo chưa đưa ra số liệu kết quả hoặc các chỉ số accuracy, precision và recall.

Về kỹ thuật, cách khởi tạo một tiến trình CLIPS cho mỗi lần chạy ưu tiên sự cô lập và đơn giản nhưng chưa được benchmark cho tải đồng thời. Cơ chế quản trị trạng thái review cũng cần được duy trì nhất quán khi bổ sung hoặc thay đổi rules trong các phiên bản tiếp theo.

## 6.3. Hướng phát triển

Hướng ưu tiên đầu tiên là tổ chức thẩm định cùng người có chuyên môn pháp lý. Quy trình nên ghi lại từng nhận xét, điều khoản liên quan, thay đổi rule và ca kiểm thử hồi quy. Trạng thái `approved` chỉ nên được sử dụng khi có tiêu chí và người chịu trách nhiệm rõ ràng.

Hướng thứ hai là tăng độ nguyên tử của facts. Các observations tổng hợp về nội dung, hình thức hoặc kết quả đánh giá bên ngoài cần được phân rã khi có đủ căn cứ. Việc này làm tăng số câu hỏi đầu vào nhưng cải thiện khả năng giải thích và giảm giả định ẩn.

Hướng thứ ba là mở rộng đánh giá. Nhóm cần xây một tập tình huống độc lập, có expected result được xác nhận riêng; bổ sung property-based test, mutation test cho rules và kiểm tra coverage theo Rule ID, nhánh điều kiện và trạng thái kết quả.

Hướng thứ tư là thực hiện usability test với người không tham gia viết rules. Các chỉ số nên gồm tỷ lệ hoàn thành tác vụ, thời gian, số lần cần trợ giúp, lỗi nhập quan hệ và khả năng giải thích lại kết quả. Kết quả này sẽ giúp cải thiện guided conversation và graph editor.

Hướng thứ năm là quản lý phiên bản tri thức đầy đủ hơn. Mỗi inference run đã lưu `knowledge_base_version`; bước tiếp theo là hỗ trợ so sánh hai lần chạy của cùng hồ sơ, làm rõ kết quả nào thay đổi do facts và kết quả nào thay đổi do rule base.

Hướng cuối cùng là mở rộng từ các kết quả mô-đun sang quy trình phân tích tổng hợp. Việc này chỉ nên thực hiện sau khi dependencies, completeness và phạm vi pháp lý được xác định chặt chẽ. Hệ thống cần tiếp tục giữ nguyên tắc không che giấu thiếu dữ kiện, không tự suy diễn từ sự vắng mặt và luôn cho phép người dùng truy về căn cứ.

## 6.4. Kết luận chung

Đồ án cho thấy một phần tri thức thừa kế có thể được chuyển thành facts và luật sản xuất để máy tính xử lý theo cách tất định và có thể truy vết. Giá trị nổi bật của hệ thống không chỉ nằm ở việc tạo một nhãn kết quả, mà ở khả năng thể hiện điều kiện đã sử dụng, rule đã kích hoạt, căn cứ liên quan và những gì hệ thống chưa biết.

Trong phạm vi một đồ án môn Biểu diễn tri thức và ứng dụng, Mạch Di Sản đã hình thành được chu trình tương đối đầy đủ từ thu nhận tri thức, mô hình hóa, suy luận, giải thích, tích hợp ứng dụng đến kiểm thử. Những giới hạn còn lại cũng chỉ ra hướng phát triển rõ ràng: nâng chất lượng thẩm định, tăng tính nguyên tử của tri thức, mở rộng đánh giá độc lập và hoàn thiện trải nghiệm người dùng.
