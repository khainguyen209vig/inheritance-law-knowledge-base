# Kế hoạch tài liệu tham khảo

## Quy ước

Đề xuất dùng chuẩn **IEEE dạng đánh số** nếu giảng viên/khoa không quy định chuẩn khác. Trong nội dung, trích dẫn dạng `[1]`, `[2]`; danh mục sắp theo thứ tự xuất hiện, không sắp theo tên tác giả.

Mỗi nguồn web cần có tổ chức/tác giả, tên tài liệu, phiên bản hoặc ngày ban hành/cập nhật nếu có, URL và ngày truy cập. Với văn bản pháp luật, ưu tiên cơ sở dữ liệu của cơ quan nhà nước và ghi số ký hiệu, cơ quan ban hành, ngày ban hành, ngày hiệu lực. Không dùng blog để làm nguồn cho định nghĩa cốt lõi khi có giáo trình, bài báo hoặc tài liệu chính thức.

Ngày truy cập của các nguồn web phải được cập nhật đồng loạt ở lần chốt báo cáo; ngày dưới đây là ngày khởi tạo danh mục, **20/09/2026**.

## Danh mục khởi tạo đã kiểm tra

1. Quốc hội nước Cộng hòa xã hội chủ nghĩa Việt Nam, “Bộ luật Dân sự,” Luật số 91/2015/QH13, ban hành ngày 24/11/2015, có hiệu lực ngày 01/01/2017. [Trực tuyến]. Có tại: https://vanban.chinhphu.vn/default.aspx?docid=183188&pageid=27160. [Truy cập: 20/09/2026].

2. Secret Society Software, LLC, *CLIPS Reference Manual, Volume I: Basic Programming Guide*, version 6.4.2, 16/01/2025. [Trực tuyến]. Có tại: https://www.clipsrules.net/documentation/v642/bpg642.pdf. [Truy cập: 20/09/2026].

3. CLIPS, “CLIPS Documentation.” [Trực tuyến]. Có tại: https://www.clipsrules.net/Documentation.html. [Truy cập: 20/09/2026].

4. Vercel, “Next.js Documentation.” [Trực tuyến]. Có tại: https://nextjs.org/docs. [Truy cập: 20/09/2026].

5. SQLite, “About SQLite.” [Trực tuyến]. Có tại: https://www.sqlite.org/about.html. [Truy cập: 20/09/2026].

6. B. G. Buchanan and E. H. Shortliffe, Eds., *Rule-Based Expert Systems: The MYCIN Experiments of the Stanford Heuristic Programming Project*. Reading, MA, USA: Addison-Wesley, 1984, ISBN 0-201-10172-6. [Trực tuyến]. Có tại: https://www.shortliffe.net/Buchanan-Shortliffe-1984/Contents.pdf. [Truy cập: 20/09/2026].

7. W. Swartout, C. Paris, and J. Moore, “Explanations in knowledge systems: Design for explainable expert systems,” *IEEE Expert*, vol. 6, no. 3, pp. 58–64, Jun. 1991, doi: 10.1109/64.87686.

8. H. Surden, “Computable Law and AI,” in *The Cambridge Handbook of Private Law and Artificial Intelligence*, E. Lim and P. Morgan, Eds. Cambridge University Press, 2024, pp. 36–68, doi: 10.1017/9781108980197.003.

Nguồn số 1 là căn cứ pháp lý gốc. Nguồn số 2 là tài liệu chính cho facts, `deftemplate`, `defrule`, chu trình thực thi và chiến lược giải quyết xung đột trong CLIPS. Nguồn số 3 chỉ nên dùng để giới thiệu hệ sinh thái/tài liệu CLIPS; tránh trích lặp nếu nguồn số 2 đã đủ. Nguồn số 4–5 chỉ cần trích ở phần công nghệ hiện thực, không dùng thay cho nguồn học thuật về biểu diễn tri thức. Nguồn số 6 hỗ trợ nền tảng về hệ dựa trên luật; nguồn số 7 cho phần giải thích; nguồn số 8 cho bối cảnh chuyển tri thức pháp lý thành dữ liệu và rules có thể xử lý bằng máy.

## Nguồn cần bổ sung trước khi viết bản chính

### Cơ sở học thuật

Danh mục khởi tạo đã có nguồn về hệ dựa trên luật, giải thích và computable law. Trước khi viết cần đọc phần thực sự được viện dẫn và bổ sung:

- một giáo trình uy tín về trí tuệ nhân tạo/biểu diễn tri thức;
- một nguồn hiện đại tổng quan về knowledge representation and reasoning;
- nếu cần so sánh, một nghiên cứu gần đây về biểu diễn tri thức pháp lý hoặc legal expert systems.

Mỗi nguồn phải gắn với một luận điểm cụ thể trong Chương 2; không thêm chỉ để kéo dài danh mục.

### Nguồn pháp luật

- Đối chiếu chính xác các Điều 609–662 mà bản đóng băng thực sự sử dụng.
- Nếu có văn bản sửa đổi, hướng dẫn hoặc án lệ được đưa vào rule base, thêm từng nguồn chính thức tương ứng và ghi rõ phạm vi áp dụng.
- Nhờ người phụ trách nội dung pháp lý kiểm tra trích dẫn điều/khoản/điểm trước khi nộp.

### Nguồn công nghệ

Chỉ thêm tài liệu chính thức cho thành phần được phân tích trong báo cáo, ví dụ Node.js/TypeScript/React hoặc thư viện SQLite binding. Không cần trích dẫn mọi package trong `package.json`.

## Bảng kiểm chất lượng trích dẫn

- [ ] Mọi định nghĩa học thuật quan trọng ở Chương 2 có nguồn.
- [ ] Mọi phát biểu về điều kiện pháp lý có nguồn luật sát câu.
- [ ] Không dùng tài liệu nội bộ của dự án làm căn cứ pháp luật.
- [ ] Không có nguồn trong danh mục mà chưa từng được dẫn trong thân bài.
- [ ] Không có URL tìm kiếm, URL rút gọn hoặc liên kết blog khi đã có nguồn gốc.
- [ ] Phiên bản tài liệu công nghệ khớp với phiên bản thực tế hoặc được mô tả rõ là nguồn khái niệm.
- [ ] Ngày truy cập web được cập nhật ở lần chốt.
- [ ] Trích dẫn hình, bảng hoặc nội dung phỏng theo nguồn khác ngay tại chú thích.
- [ ] Trích dẫn trực tiếp được đặt trong ngoặc kép và có số trang/mục khi nguồn hỗ trợ.
