# Chương 4. Phân tích, thiết kế và hiện thực hệ thống

## 4.1. Yêu cầu hệ thống

Ứng dụng cần hỗ trợ các chức năng chính sau:

- tạo, đổi tên, mở lại và xóa hồ sơ;
- nhập facts bằng biểu mẫu, hội thoại có hướng dẫn, bảng người, timeline hoặc graph gia đình;
- chọn câu hỏi phân tích và chạy mô-đun tương ứng;
- hiển thị kết luận, dữ kiện thiếu, mâu thuẫn và dấu vết suy luận;
- mở căn cứ điều luật và implementation liên quan;
- lưu snapshot mỗi lần suy luận để xem lại;
- tải tệp case study CLP có kiểm soát và xuất báo cáo Markdown/CLP.

Các yêu cầu phi chức năng quan trọng gồm tính tất định, khả năng truy vết, khả năng tái lập, giới hạn đầu vào, tách tri thức khỏi dữ liệu vụ việc và không cho nội dung upload tùy ý trở thành mã thực thi.

## 4.2. Kiến trúc tổng thể

Hệ thống sử dụng kiến trúc web full-stack với Next.js và TypeScript. CLIPS chạy như một tiến trình riêng cho mỗi yêu cầu suy luận, còn SQLite lưu dữ liệu hồ sơ.

```text
Người dùng
   │
   ▼
Next.js UI
   │
   ▼
Route Handlers / Application services
   ├──────────────► SQLite
   │                 ├── cases
   │                 ├── asserted_facts
   │                 └── inference snapshots
   │
   ▼
CLIPS adapter
   │
   ├── fact serializer
   ├── module rule package
   └── machine-output parser
          │
          ▼
Knowledge base
   ├── templates
   ├── rule metadata
   ├── domain rules
   ├── completeness/conflict
   ├── explanation
   └── result projection
```

Giao diện không gọi trực tiếp CLIPS. Route Handler kiểm tra request, application service đọc facts của hồ sơ, adapter tuần tự hóa facts và chọn package rules. Sau khi CLIPS chạy, line protocol được parse thành kiểu dữ liệu TypeScript, lưu thành snapshot rồi trả về giao diện.

Kiến trúc này giữ ranh giới rõ ràng: UI thu nhận observations; CLIPS tạo kết luận pháp lý; SQLite lưu trạng thái vụ việc; TypeScript điều phối nhưng không tái hiện domain rules bằng `if/else`.

## 4.3. Package luật và luồng suy luận

Mỗi mô-đun có một package gồm domain rules cần thiết, completeness rules, explanation và projection. Ví dụ package `will-validity` nạp bốn nhóm tệp: luật tính hợp pháp, kiểm tra tính đầy đủ, giải thích và projection. Package `compulsory-share` nạp thêm rules về quyền hưởng, từ chối, hàng thừa kế, thanh toán và phép tính giá trị vì các kết quả này là dependency.

Một lần suy luận diễn ra theo trình tự:

1. Nhận `caseId`, subject và yêu cầu mô-đun.
2. Đọc tập facts hiện hành của hồ sơ.
3. Kiểm tra dữ liệu bằng schema Zod.
4. Tạo thư mục làm việc tạm thời.
5. Tuần tự hóa `analysis-request` và `asserted-fact` sang CLP.
6. Tạo driver nạp templates, metadata, package rules và machine output.
7. Chạy CLIPS với giới hạn thời gian 10 giây và output buffer 2 MiB.
8. Parse `module-result`, `missing-requirement` và `inference-trace`.
9. Bổ sung hậu xử lý kỹ thuật nếu cần, chẳng hạn tính ngày hết thời hiệu từ số năm và ngày mở thừa kế.
10. Lưu snapshot bất biến rồi trả kết quả.
11. Xóa thư mục tạm trong khối `finally`.

Việc chạy một tiến trình mới cho mỗi yêu cầu giúp working memory không bị rò rỉ giữa các hồ sơ. Đổi lại, cách này có chi phí khởi động tiến trình; đây là đánh đổi chấp nhận được cho nguyên mẫu học thuật và cần được đo nếu triển khai ở quy mô lớn.

## 4.4. Thiết kế lưu trữ

SQLite lưu bảy nhóm bảng chính:

| Bảng | Vai trò |
|---|---|
| `cases` | Metadata hồ sơ và `facts_revision` |
| `asserted_facts` | Facts hiện hành do người dùng hoặc hệ thống nhập |
| `inference_runs` | Metadata lần chạy, phiên bản KB và snapshot đầu vào |
| `module_results` | Kết quả công khai của lần chạy |
| `missing_requirements` | Dữ kiện còn thiếu |
| `inference_traces` | Rule ID, kết luận và supports |
| `guided_sessions` | Chủ đề và tiến độ hội thoại có hướng dẫn |

`facts_revision` tăng khi facts thay đổi. Một inference run lưu revision tương ứng; giao diện chỉ coi kết quả là hiện hành nếu revision của lần chạy khớp với hồ sơ. `input_snapshot_json` bảo toàn dữ liệu tại thời điểm suy luận, còn `knowledge_base_version` cho biết phiên bản tri thức đã sử dụng.

Khi xóa hồ sơ, facts và các bản ghi phụ thuộc được xử lý theo ràng buộc khóa ngoại. Lần chạy tham chiếu hồ sơ bằng `ON DELETE RESTRICT` ở cấp schema; service phải điều phối việc xóa đúng thứ tự để tránh mất snapshot ngoài ý muốn.

## 4.5. Module registry và điều phối phụ thuộc

Module registry là danh mục TypeScript mô tả mười mô-đun, gồm ID, tiêu đề, mô tả, kiểu tương tác, predicate kết quả, dependency và runtime path. Bốn kiểu tương tác hiện có là questionnaire, family tree, people table và timeline.

Dependency có thể là bắt buộc hoặc có điều kiện. Khi lập execution plan, hệ thống chỉ tự động đưa dependency bắt buộc đã triển khai vào trước target module. Dependency có điều kiện được quyết định từ facts và chủ đề hiện tại. Ví dụ, đánh giá loại thừa kế chỉ cần kết quả di chúc nếu vụ việc thực sự có di chúc.

Guided Conversation sử dụng dependency plan để chọn câu hỏi tiếp theo. Nó đọc missing requirements từ các lần suy luận mới nhất, ánh xạ predicate sang presenter phù hợp và trả trạng thái `collecting`, `complete`, `unknown` hoặc `conflict`. Câu trả lời được lưu thành facts; nội dung pháp lý vẫn do CLIPS suy ra.

## 4.6. Thiết kế giao diện

Ứng dụng có ba luồng giao diện chính.

**Hội thoại có hướng dẫn** là điểm vào cho người dùng không muốn thao tác trực tiếp với predicates. Người dùng chọn chủ đề, trả lời từng câu hỏi, và hệ thống chạy lại các mô-đun đủ dữ kiện. Câu hỏi kế tiếp được xác định từ dependency plan và missing requirements.

**Không gian làm việc theo mô-đun** dành cho việc quan sát kỹ thuật. Mỗi mô-đun dùng presenter thích hợp. Di chúc dùng questionnaire; quyền hưởng dùng bảng người; hàng thừa kế và thế vị dùng cùng graph gia đình; thời hiệu và quan hệ vợ chồng đặc biệt dùng timeline.

**Quick Logic Test** cho phép thành viên nhóm tải case study `.clp`, xem preview facts, chọn câu hỏi, chạy suy luận, mở source rule và xuất kết quả. Luồng này không tạo hồ sơ SQLite, phù hợp với kiểm thử nhanh và trình diễn khả năng giải thích.

Nguyên tắc chung của giao diện là hỏi observations thay vì hỏi kết luận. Người dùng khai báo quan hệ cha/mẹ–con, không chọn “hàng thừa kế thứ nhất”. Người dùng nhập trạng thái sống và hành vi liên quan, không nhập “được quyền hưởng”.

## 4.7. Phân hệ giải thích

Phân hệ giải thích kết hợp ba nguồn:

- kết quả và derivations từ CLIPS;
- inference traces và supports;
- rule metadata cùng legal source catalog.

Màn hình kết quả có thể hiển thị câu kết luận tiếng Việt, các bước dữ kiện–rule–kết luận, điều/khoản/điểm và phần thông tin còn thiếu. Chế độ kỹ thuật hiển thị thêm predicate, raw value, fact ID và implementation CLIPS.

Văn bản điều luật không được nhúng lặp lại trong từng component. UI truy xuất theo `provisionId` và section ID. Cách này giúp cùng một nguồn được dùng nhất quán, đồng thời cho phép đánh dấu phần điều luật mà rule đang tham chiếu.

## 4.8. Kiểm soát đầu vào Quick Logic Test

Tệp upload không được chuyển thẳng cho CLIPS. Hệ thống xây dựng một parser S-expression giới hạn, chỉ chấp nhận hai top-level form là `analysis-request` và `asserted-fact`. Các construct như `defrule`, `deffunction`, `load`, `batch` hoặc lời gọi hệ thống bị từ chối.

Các giới hạn chính gồm:

- tên tệp `.clp` hợp lệ;
- UTF-8 hợp lệ;
- dung lượng tối đa 1 MiB;
- tối đa 500 facts;
- mỗi slot có đúng một scalar value;
- predicate thuộc allowlist sinh từ fact contract;
- fact ID không trùng và case ID nhất quán.

Sau khi parse, hệ thống chuẩn hóa facts thành object nội bộ và chỉ serializer tin cậy mới tạo tệp CLP để chạy. Thiết kế này giảm nguy cơ biến chức năng upload dữ liệu thành khả năng thực thi mã tùy ý.

## 4.9. Công nghệ hiện thực

| Thành phần | Công nghệ | Vai trò |
|---|---|---|
| Giao diện và API | Next.js 16, React 19 | App Router, component và Route Handlers |
| Ngôn ngữ ứng dụng | TypeScript 5.9 | Kiểu dữ liệu và điều phối |
| Validation | Zod 4 | Fact contract và request schema |
| Bộ suy luận | CLIPS 6.x | Facts, production rules và forward chaining |
| Lưu trữ | SQLite qua `better-sqlite3` | Hồ sơ và snapshot suy luận |
| Kiểm thử | CLIPS scripts và Node test runner | Regression knowledge base và ứng dụng |

Next.js được sử dụng như framework full-stack [4], còn SQLite phù hợp với nguyên mẫu self-host vì là cơ sở dữ liệu nhúng và không yêu cầu máy chủ riêng [5]. Phiên bản chính xác của môi trường dùng để tái lập kết quả được ghi ở Chương 5 và phụ lục cài đặt.

