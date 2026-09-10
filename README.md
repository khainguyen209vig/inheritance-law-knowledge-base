# Hệ hỗ trợ suy luận luật thừa kế Việt Nam

Đồ án xây dựng một hệ thống dựa trên tri thức nhằm hỗ trợ xác định các yếu tố trong luật thừa kế Việt Nam. Hệ thống biểu diễn tri thức pháp lý bằng **facts**, **production rules** và thực hiện suy luận tiến (**forward chaining**) bằng CLIPS.

> **Lưu ý:** Đây là đồ án phục vụ học tập và sử dụng nội bộ bởi nhóm phát triển. Knowledge base hiện chưa được chuyên gia pháp lý kiểm chứng hoặc phê duyệt. Kết quả của hệ thống không phải tư vấn pháp lý và không nên được sử dụng để đưa ra quyết định trong vụ việc thực tế.

## Mục tiêu

- Biểu diễn tường minh các chủ thể, quan hệ, sự kiện và điều kiện pháp lý trong lĩnh vực thừa kế.
- Tách tri thức pháp luật dùng chung khỏi dữ kiện của từng vụ việc.
- Suy luận bằng các luật `IF–THEN` có định danh và căn cứ điều luật.
- Trình bày kết luận cùng chuỗi rules và facts đã được sử dụng.
- Phân biệt được kết luận `TRUE`, `FALSE`, `UNKNOWN` và `CONFLICT`.
- Cho phép mở rộng knowledge base mà không sửa mã nguồn inference engine.

Hệ thống **không sử dụng LLM** trong quá trình nhập liệu, suy luận hoặc giải thích kết quả.

## Kiến trúc

![Kiến trúc hệ thống dựa trên tri thức](doc/knowledge-based-architect.png)

Kiến trúc của đồ án gồm hai luồng chính:

1. Thành viên nhóm nhập dữ kiện vụ việc qua giao diện; CLIPS suy luận và explanation subsystem trình bày kết quả.
2. Kỹ sư tri thức chuyển hóa nội dung pháp luật thành facts, templates và rules trong knowledge base.

Hai loại dữ liệu được tách biệt:

- **Knowledge base:** tri thức pháp lý dùng chung, được lưu dưới dạng các tệp `.clp`.
- **Case-specific database:** facts và kết quả của từng vụ việc, dự kiến được lưu bằng SQLite.

Kiến trúc triển khai mục tiêu:

```text
Next.js + TypeScript
├── App Router                 # Giao diện người dùng
├── Route Handlers             # Backend API nội bộ
├── Application services       # Điều phối các use case
├── CLIPS adapter              # Gọi CLIPS native process
├── SQLite                     # Case-specific database
└── knowledge-base/*.clp       # Templates và production rules
```

Ứng dụng dự kiến được self-host bằng Node.js hoặc Docker. Next.js Route Handlers đảm nhiệm backend API.

## Trạng thái hiện tại

Đã hoàn thành vertical slice đầu tiên cho mô-đun đánh giá tính hợp pháp cơ bản của di chúc:

- [x] Chuyển rule-base từ DOCX sang Markdown.
- [x] Định nghĩa fact contracts dùng chung trong CLIPS.
- [x] Triển khai R-B01–R-B04 bằng forward chaining.
- [x] Sinh kết luận trung gian, kết quả mô-đun và inference trace.
- [x] Kiểm thử trường hợp hợp lệ, không hợp lệ và thiếu dữ kiện.
- [ ] Triển khai các trường hợp đặc biệt R-B05–R-B09.
- [ ] Khởi tạo ứng dụng Next.js.
- [ ] Xây dựng TypeScript CLIPS adapter.
- [ ] Tích hợp SQLite và giao diện nhập facts.

## Phạm vi kết quả

Hệ thống không tính toán việc phân chia toàn bộ di sản theo một quy trình end-to-end. Kết quả được chia thành các mô-đun độc lập:

1. Tính hợp pháp của di chúc.
2. Loại thừa kế.
3. Quyền hưởng di sản.
4. Hàng thừa kế.
5. Thừa kế thế vị.
6. Suất bắt buộc.
7. Từ chối nhận di sản và tài sản không có người nhận.
8. Thời hiệu.

Phiên bản trình bày tối thiểu hướng tới mô-đun 1–4. Mức mục tiêu bổ sung mô-đun thừa kế thế vị; các mô-đun còn lại được thực hiện nếu còn thời gian.

## Yêu cầu môi trường hiện tại

- CLIPS 6.x.
- Git.
- Ubuntu/Pop!_OS hoặc môi trường có thể chạy CLIPS.

Node.js, TypeScript và Next.js sẽ trở thành yêu cầu sau khi phần ứng dụng web được khởi tạo.

## Cài đặt CLIPS

Trên Ubuntu hoặc Pop!_OS:

```bash
sudo apt update
sudo apt install clips
```

Kiểm tra bằng bộ test hiện có:

```bash
clips -f2 knowledge-base/tests/will-validity.clp
```

Kết quả mong đợi:

```text
PASS will-valid
PASS will-invalid
PASS will-unknown
PASS will-conflict
PASS domain-independent-from-analysis-request
```

## Chạy ví dụ suy luận

```bash
clips -f2 knowledge-base/run-fixture.clp
```

Ví dụ hợp lệ hiện tạo chuỗi suy luận:

```text
Facts đầu vào
  → R-B01: điều kiện về ý chí hợp lệ
  → R-B02: điều kiện về nội dung và hình thức hợp lệ
  → R-B03: di chúc hợp pháp
  → module-result + inference-trace
```

Để đổi fixture đang chạy, sửa đường dẫn `load-facts` trong `knowledge-base/run-fixture.clp` thành một trong các tệp:

- `knowledge-base/fixtures/will-valid.clp`;
- `knowledge-base/fixtures/will-invalid.clp`;
- `knowledge-base/fixtures/will-unknown.clp`.

## Cấu trúc repository

```text
.
├── doc/
│   ├── Development_Plan.md          # Kế hoạch phát triển và quyết định kiến trúc
│   ├── Loc_Rulebase.md              # Rule-base đọc được bởi con người
│   ├── Loc_Rulebase.docx            # Tài liệu nguồn
│   └── knowledge-based-architect.png
├── knowledge-base/
│   ├── fixtures/                    # Facts mẫu cho từng trường hợp
│   ├── rules/                       # Production rules CLIPS
│   ├── tests/                       # Regression tests của knowledge base
│   ├── rule-metadata.clp            # Căn cứ và mô tả luật
│   ├── templates.clp                # Fact contracts dùng chung
│   └── run-fixture.clp              # Điểm chạy ví dụ bằng CLI
├── reference/                       # Tài liệu nghiên cứu tham khảo
└── README.md
```

## Mô hình kết quả CLIPS

Mỗi lần suy luận sử dụng hoặc có thể sinh các loại fact sau:

- `asserted-fact`: dữ kiện nguyên tử được cung cấp cho vụ việc.
- `derived-fact`: kết luận trung gian hoặc cuối cùng được luật suy ra, kèm provenance.
- `module-result`: kết quả công khai của một mô-đun phân tích.
- `inference-trace`: Rule ID, facts hỗ trợ và kết luận của từng bước.
- `missing-requirement`: dữ kiện bắt buộc còn thiếu.

Ví dụ rút gọn:

```clips
(module-result
  (case-id case-valid)
  (subject will-valid-01)
  (module will-validity)
  (predicate valid-will)
  (value true)
  (derivations R-B03))
```

Căn cứ và mô tả của R-B03 được tra từ `rule-metadata.clp`, không viết lặp lại trong từng kết quả. Không có fact chứng minh một mệnh đề không đồng nghĩa với mệnh đề đó sai. Nếu thiếu dữ kiện, mô-đun trả `unknown`; nếu có kết luận trái ngược, mô-đun trả `conflict`.

## Nguyên tắc phát triển

- Luật pháp lý không được viết cứng bằng `if/else` trong Next.js.
- Knowledge base độc lập với inference engine và giao diện.
- Domain rules chỉ phụ thuộc vào facts nghiệp vụ, không phụ thuộc vào route hoặc màn hình đang mở.
- Logic completeness, explanation và result projection được tách khỏi domain rules.
- Dữ liệu đầu vào phải được kiểm tra trước khi chuyển thành CLIPS facts.
- Không ghép trực tiếp chuỗi do người dùng nhập vào mã lệnh CLIPS.
- Mỗi rule phải có Rule ID và căn cứ pháp lý.
- Mỗi kết luận dẫn xuất phải truy ngược được tới facts ban đầu.
- Mỗi mô-đun cần ít nhất một test kích hoạt, không kích hoạt và thiếu dữ kiện.
- Các rules hiện tại mặc định ở trạng thái bản nháp cho đến khi được kiểm chứng pháp lý.

## Tài liệu

- [Kế hoạch phát triển](doc/Development_Plan.md)
- [Rule-base dạng Markdown](doc/Loc_Rulebase.md)
- [Rule-base V2 đề xuất để team review](doc/Loc_Rulebase_v2.md)
- [Hướng dẫn knowledge base](knowledge-base/README.md)

## Roadmap gần nhất

1. Hoàn thiện R-B05–R-B09 cho mô-đun tính hợp pháp của di chúc.
2. Chuẩn hóa output của CLIPS để TypeScript có thể đọc ổn định.
3. Khởi tạo ứng dụng Next.js full-stack.
4. Xây dựng `POST /api/inference/will-validity`.
5. Thêm SQLite để lưu case, asserted facts, derived facts và inference trace.
6. Xây dựng giao diện nhập dữ kiện và xem cây giải thích.
