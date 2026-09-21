# Phụ lục D. Danh mục bộ tình huống thực nghiệm

## D.1. Phân lớp hiện vật kiểm thử

| Loại | Số lượng tại thời điểm biên soạn | Vị trí | Vai trò |
|---|---:|---|---|
| Fixture CLP của knowledge base | 39 | `knowledge-base/fixtures/` | Dữ kiện đại diện cho nhánh suy luận, thiếu dữ kiện và mâu thuẫn |
| Script test CLIPS | 13 | `knowledge-base/tests/` | Assertion trực tiếp cho domain, completeness và projection rules |
| Test ứng dụng TypeScript | 18 | `tests/*.test.ts` | Parser, adapter, persistence, guided flow, registry và tích hợp |
| Case study rút gọn | 3 | `tests/case_test/clp_test/` | Đối chiếu nhiều mô-đun trên tình huống lớn hơn fixture đơn vị |
| Báo cáo Markdown của case study | 21 | `tests/case_test/results/` | Artifact kết luận và trace theo bảy chủ đề cho mỗi case |

Ba case study chưa được đăng ký trong `npm test`; vì vậy chúng được đánh giá thủ công trong Chương 5 và không được cộng vào số test tự động pass.

## D.2. Danh mục ba case study

| Case | Trọng tâm | Kết quả tổng hợp | Phụ lục chi tiết |
|---|---|---|---|
| 227/2019/DS-ST | Hai nhánh thế vị, sở hữu một phần tài sản, thời hiệu bất động sản | Đạt một phần; phân bổ tiền chưa bao gồm nhánh thế vị | [D.1](appendix-d1-case-1.md) |
| 202/2021/DS-PT | Nhánh không có người thế vị và nhánh có hai người thế vị | Cần hoàn thiện oracle phân chia | [D.2](appendix-d2-case-2.md) |
| 64/2018/DS-ST | Từ chối nhận di sản kết hợp thế vị | Đạt một phần; thiếu báo cáo từ chối riêng và phân bổ theo nhánh | [D.3](appendix-d3-case-3.md) |

## D.3. Nguyên tắc sử dụng artifact

- `doc_case-test/` mô tả fixture và expected output do nhóm xây dựng.
- `clp_test/` là dữ kiện thực sự được cung cấp cho hệ thống.
- `results/` là output đã lưu để đối chiếu.
- `doc_file/` không được sử dụng làm ground truth cho đánh giá trong báo cáo này.
- Các báo cáo của mô-đun không áp dụng, như hiệu lực di chúc khi `has-will=false`, không được tính là case failure.
- Chỉ gắn nhãn pass khi actual output khớp oracle đã review ở cấp subject, predicate và value; không chỉ so sánh tổng số hoặc tổng tiền.
