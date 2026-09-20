# Kế hoạch biên soạn báo cáo đồ án

Thư mục này là không gian chuẩn bị báo cáo chính thức cho học phần **Biểu diễn tri thức và ứng dụng**. Báo cáo phải kể được một câu chuyện thống nhất: từ bài toán phân tích tình huống thừa kế, quá trình thu nhận và biểu diễn tri thức, cơ chế suy luận và giải thích, đến thực nghiệm đánh giá trên các tình huống có kiểm soát.

## Tên đề xuất

### Tên ứng dụng khuyến nghị: Mạch Di Sản

Tên này gợi liên tưởng đến mối liên hệ giữa người, quan hệ gia đình, phần di sản và dòng kết quả; không đưa công nghệ hay phương pháp suy luận ra làm tên sản phẩm.

**Dòng mô tả ngắn:** Ứng dụng hỗ trợ phân tích tình huống thừa kế theo pháp luật Việt Nam.

**Tên đề tài dùng trên báo cáo:** Xây dựng hệ thống biểu diễn và suy luận tri thức hỗ trợ phân tích tình huống thừa kế theo pháp luật Việt Nam.

Tên đề tài được phép nêu phương pháp vì đây là nội dung học thuật cần trình bày trong báo cáo; tên ứng dụng thì giữ hướng người dùng và bài toán.

Các phương án dự phòng, theo thứ tự ưu tiên:

1. **Dòng Thừa Kế** — trực diện, dễ hiểu, nhưng ít khác biệt khi tìm kiếm.
2. **Nối Dòng** — ngắn và có tính thương hiệu, nhưng cần dòng mô tả để người đọc hiểu lĩnh vực.
3. **Gia Phả Di Sản** — diễn đạt rõ khía cạnh quan hệ gia đình, nhưng phạm vi tên hẹp hơn chức năng thực tế.
4. **Di Sản Việt** — dễ nhận biết, nhưng dễ tạo cảm giác đây là sản phẩm pháp lý đã được thẩm định.

Không nên dùng các tên kiểu “CLIPS Thừa Kế”, “Forward Chaining Law”, “Hệ chuyên gia luật thừa kế” làm tên ứng dụng. Các cụm này mô tả giải pháp kỹ thuật hoặc tạo kỳ vọng về thẩm quyền pháp lý; chúng phù hợp trong thân báo cáo hơn.

## Các tệp chuẩn bị

- [outline.md](outline.md): sườn báo cáo chính thức, mục tiêu từng chương, hình/bảng cần có và dữ liệu cần thu thập.
- [references.md](references.md): quy ước trích dẫn và danh mục nguồn khởi tạo; tiếp tục bổ sung trong lúc viết.

## Bản thảo nội dung

- [Chương 1 — Tổng quan đề tài](chapter-1-tong-quan.md)
- [Chương 2 — Cơ sở lý thuyết và tri thức miền](chapter-2-co-so-ly-thuyet.md)
- [Chương 3 — Thu nhận và biểu diễn tri thức](chapter-3-bieu-dien-tri-thuc.md)
- [Chương 4 — Phân tích, thiết kế và hiện thực hệ thống](chapter-4-thiet-ke-he-thong.md)
- [Chương 5 — Thực nghiệm và đánh giá](chapter-5-thuc-nghiem-danh-gia.md)
- [Chương 6 — Kết luận và hướng phát triển](chapter-6-ket-luan.md)

Khi bắt đầu viết bản chính, có thể tách nội dung theo chương nhưng vẫn giữ `outline.md` làm checklist biên tập. Không sao chép nguyên README hoặc tài liệu kế hoạch phát triển vào báo cáo; chúng là nguồn nội bộ để tổng hợp, không phải bằng chứng học thuật.

## Nguyên tắc biên tập

1. **Bài toán trước, phương pháp sau.** Phần mở đầu nói về nhu cầu phân tích tình huống và yêu cầu giải thích được; CLIPS và luật sản xuất chỉ xuất hiện sau khi đã xác lập bài toán.
2. **Phân biệt tri thức pháp lý với phần mềm.** Nêu riêng nguồn luật, mô hình tri thức, bộ suy luận, giao diện và dữ liệu vụ việc.
3. **Không tuyên bố quá mức.** Báo cáo giả định toàn bộ rules trong phạm vi đã hoàn tất review nội bộ; việc này không đồng nghĩa với thẩm định bởi chuyên gia pháp lý. Sản phẩm vẫn là nguyên mẫu học thuật và kết quả không phải tư vấn pháp lý.
4. **Chỉ báo cáo kết quả đã đo.** Số lượng luật, ca kiểm thử, tỷ lệ đạt và kết quả usability phải lấy lại tại thời điểm chốt báo cáo, không dùng số ước lượng.
5. **Một khái niệm, một thuật ngữ.** Thống nhất các cặp: `dữ kiện (fact)`, `luật sản xuất (production rule)`, `bộ nhớ làm việc (working memory)`, `suy diễn tiến (forward chaining)`, `dấu vết suy luận (inference trace)`.
6. **Mỗi hình và bảng phải được dẫn trong lời văn.** Không để ảnh giao diện hoặc đoạn mã chỉ nhằm tăng số trang.
7. **Thân bài chứng minh quyết định; phụ lục cung cấp khả năng đối chiếu.** Giữ một ví dụ tiêu biểu trong thân bài, chuyển danh mục đầy đủ và log dài sang phụ lục.

## Quy trình hoàn thiện đề xuất

1. Chốt mẫu bìa, quy định trình bày và chuẩn trích dẫn của giảng viên/khoa.
2. Chốt tên ứng dụng và tên đề tài; thay tên nhất quán trên giao diện, slide và báo cáo nếu nhóm quyết định đổi.
3. Đóng băng phạm vi phiên bản được đánh giá; ghi commit, ngày kiểm thử và môi trường.
4. Hoàn thiện Chương 3 trước vì đây là phần cốt lõi của học phần; sau đó viết Chương 4 và Chương 5 từ hiện vật thực tế.
5. Viết Chương 1, tóm tắt và kết luận sau cùng để các tuyên bố khớp với kết quả thật.
6. Rà soát chéo: kỹ thuật, căn cứ pháp luật, trích dẫn, thuật ngữ, hình/bảng và giới hạn nghiên cứu.

## Điều kiện sẵn sàng nộp

- Mọi mục trong sườn có nội dung hoặc được chủ động loại bỏ có lý do.
- Mỗi phát biểu dựa trên nguồn bên ngoài đều có trích dẫn.
- Mỗi rule pháp lý được minh họa trong thân bài có Rule ID, căn cứ và được ghi nhận là đã review nội bộ.
- Chương đánh giá có bộ dữ liệu/fixture, kết quả mong đợi, kết quả thực tế và cách tái lập.
- Số liệu trong báo cáo khớp với lần chạy kiểm thử cuối cùng.
- Phụ lục được gọi tên ít nhất một lần trong thân bài.
- Có tuyên bố giới hạn sử dụng và chưa kiểm chứng pháp lý ở phần phạm vi, kết luận và màn hình sản phẩm phù hợp.
