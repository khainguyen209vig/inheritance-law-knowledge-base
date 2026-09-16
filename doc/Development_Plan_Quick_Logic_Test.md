# Development plan — Quick Logic Test

## 1. Mục tiêu

Xây một trang dành cho thành viên trong team kiểm tra nhanh khả năng giải một case study đã được mô tả bằng facts CLIPS:

```text
upload .clp chứa asserted-fact
  → xem và xác nhận facts đã đọc
  → chọn một câu hỏi thừa kế bằng ngôn ngữ thường
  → chạy các rule package liên quan
  → xem kết luận và quá trình suy luận
  → explore code CLIPS của từng bước khi cần
  → tải báo cáo .md hoặc case .clp có chú thích kết quả
```

Tính năng không sử dụng LLM. Giải thích lấy từ `rule-registry.json`, trace do CLIPS sinh ra và nội dung luật đã được trích xuất trong repository.

## 2. Phạm vi bản release đầu tiên

### Có trong MVP

- Một trang riêng tại `/logic-test`, không nằm trong guided case flow.
- Upload đúng một file `.clp` tại một thời điểm.
- File có thể chứa comment, một `analysis-request` tùy chọn và nhiều `asserted-fact`.
- Preview facts theo `subject`, hiển thị lỗi theo dòng trước khi cho chạy.
- Chọn một trong bảy câu hỏi phổ thông đang có trong `guidedTopics`.
- Chạy các goal package cần thiết cho câu hỏi trên cùng một bộ asserted facts.
- Hiển thị kết luận cuối, trạng thái `COMPLETE`, `UNKNOWN`, `CONFLICT` hoặc `MISSING_FACTS`.
- Hiển thị chuỗi suy luận bằng tiếng Việt; code chỉ mở trong dialog “Explore”.
- Nhóm các bước cùng thuộc một điều luật vào một khối; khoản/điểm là các bước con trong khối đó.
- Tải kết quả dưới dạng `.md` và `.clp`.

### Chưa có trong MVP

- Sửa facts bằng form hoặc graph sau khi upload.
- Chạy nội dung `defrule`, `deffunction`, `batch`, `load`, `system` hoặc code tùy ý từ file upload.
- Lưu case test vào danh sách hồ sơ SQLite.
- Chia sẻ link hoặc cộng tác nhiều người.
- So sánh hai lần chạy.
- Sinh diễn giải bằng ngôn ngữ tự nhiên động.

Trang dùng trạng thái tạm thời trong phiên trình duyệt. Refresh trang sẽ yêu cầu upload lại; file export là cách lưu kết quả của MVP.

## 3. Quyết định an toàn bắt buộc

Không truyền file upload trực tiếp cho lệnh `clips -f2` hoặc `load-facts`.

Server phải:

1. đọc file như text;
2. token hóa và parse bằng grammar giới hạn;
3. chỉ chấp nhận `asserted-fact` và một `analysis-request` tùy chọn;
4. kiểm tra kiểu, tên slot, symbol, ID trùng, `case-id` nhất quán và predicate allow-list;
5. bỏ qua module trong `analysis-request` của file; câu hỏi người dùng mới quyết định rule package;
6. serialize lại facts từ AST đã kiểm tra bằng adapter của hệ thống;
7. chỉ sau đó mới chạy CLIPS với rule files thuộc repository.

Giới hạn đề xuất cho MVP:

- dung lượng tối đa `1 MiB`;
- tối đa `500` asserted facts;
- UTF-8;
- giá trị chỉ là `SYMBOL`, `STRING`, `INTEGER`, `FLOAT` hoặc boolean symbol;
- timeout dùng giới hạn hiện tại của adapter là 10 giây cho mỗi package;
- không trả absolute path hoặc stderr nội bộ ra UI.

Nếu gặp top-level form không được hỗ trợ, toàn bộ file bị từ chối và UI chỉ rõ dòng/cột. Không “lọc rồi chạy phần còn lại”, vì cách đó có thể làm người dùng tưởng toàn bộ case đã được xét.

## 4. Kiến trúc đề xuất

```text
/logic-test
  → Upload + local file preview
  → POST /api/logic-tests/parse
      → restricted CLP tokenizer/parser
      → fact schema + predicate allow-list
      → normalized case-study AST
  → chọn GuidedTopicId
  → POST /api/logic-tests/run
      → topic goal planner
      → chạy các CLIPS goal package trên cùng normalized facts
      → aggregate result/missing/trace
      → explanation graph
      → group theo provisionId/article
  → Result presenter
      → final answers
      → reasoning groups
      → Explore dialog: code + supports
  → client gọi export endpoint hoặc tải Blob
      → .md report
      → normalized/replayable .clp
```

Không tạo engine suy luận thứ hai. `clipsRulePackages`, các hàm inference hiện tại, `guidedInferenceGoals`, `rule-registry.json` và legal catalog tiếp tục là nguồn sự thật.

### Ranh giới server/client

- Parser, validation, orchestration và đọc source code rule chạy ở server.
- Client chỉ giữ file đã chọn, normalized preview, câu hỏi và report đã trả về.
- Component kết quả nhận một DTO đã hoàn thiện; không tự ghép trace hoặc đọc registry ở nhiều request nối tiếp.
- Một lần bấm “Chạy suy luận” tạo một request; server chạy các goal package độc lập song song khi không có dependency runtime giữa chúng.

## 5. Định dạng file đầu vào

Ví dụ tối thiểu:

```clips
; analysis-request trong file chỉ có tính mô tả
(analysis-request
  (case-id case-nguyen)
  (subject case-nguyen)
  (module heir-rank))

(asserted-fact
  (fact-id deceased)
  (case-id case-nguyen)
  (subject ong-an)
  (predicate deceased-person)
  (value true))

(asserted-fact
  (fact-id deceased-label)
  (case-id case-nguyen)
  (subject ong-an)
  (predicate heir-person-label)
  (value "Ông An"))
```

Sau parse, UI cần cho biết:

- tên file, dung lượng và case ID;
- tổng số facts và số subjects;
- facts được nhóm theo subject;
- warning không chặn, ví dụ thiếu label;
- error chặn chạy, ví dụ predicate không được phép hoặc nhiều case ID.

Predicate allow-list phải được tạo từ contract của các module, không hard-code rải rác trong route.

## 6. Chọn câu hỏi và điều phối

Trang tái sử dụng bảy câu hỏi trong `guidedTopics`:

| Câu hỏi | Goal package chính |
|---|---|
| Ai có thể được hưởng di sản? | `inheritance-type`, `heir-rank`, `representation` |
| Di chúc có hợp pháp không? | `will-validity` |
| Một người có bị mất quyền hưởng không? | `eligibility` |
| Con hoặc cháu có được hưởng thế vị không? | `representation` |
| Ai vẫn được hưởng dù di chúc không cho hưởng? | `compulsory-share` |
| Di sản và nghĩa vụ được thanh toán hoặc chia thế nào? | `estate-settlement` |
| Còn thời hiệu yêu cầu về thừa kế không? | `limitation` |

Các dependency rule đã nằm trong từng `clipsRulePackages`, nên không cần chạy mô-đun phụ chỉ để sao chép derived fact sang working memory khác. Với câu hỏi có nhiều goal chính, từng package nhận cùng normalized facts và kết quả được tổng hợp theo `guidedInferenceGoals`.

Nếu file có nhiều subject có thể là đối tượng câu hỏi, MVP hiển thị thêm selector “Đang hỏi về ai/phần nào?”. Selector chỉ chọn scope kết quả, không sửa facts.

## 7. Mô hình báo cáo suy luận

API trả một DTO độc lập với raw stdout:

```ts
interface LogicTestReport {
  query: { topicId: GuidedTopicId; scopeSubject?: string };
  input: { fileName: string; caseId: string; facts: ApiFact[] };
  status: "complete" | "unknown" | "conflict" | "missing-facts";
  conclusions: LogicConclusion[];
  reasoningGroups: LegalReasoningGroup[];
  missing: ExplainedMissingRequirement[];
  knowledgeBaseVersion: string;
}

interface LegalReasoningGroup {
  provisionId?: string;
  citation: string;
  title: string;
  steps: ReasoningStep[];
}

interface ReasoningStep {
  id: string;
  plainExplanation: string;
  conclusion: string;
  ruleId: string;
  supports: ExplainedSupport[];
  codeReferences: Array<{ implementation: string; file: string }>;
}
```

Thứ tự step được dựng bằng dependency graph từ `trace.supports`, không dựa vào thứ tự CLIPS in facts. Nếu trace có cycle hoặc support không tìm thấy, report giữ bước đó và thêm diagnostic thay vì làm mất nội dung.

### Nhóm điều luật

- `provisionId` là khóa nhóm chính, ví dụ mọi rule thuộc Điều 630 nằm trong một card “Điều 630”.
- `relevantSections` xác định khoản/điểm con và thứ tự hiển thị theo legal catalog.
- Nhiều rule cùng áp dụng một khoản/điểm được trình bày như các bước con trong cùng nhóm.
- Rule `internal` không có điều luật riêng được đặt trong nhóm “Bước kết nối của hệ thống” gần legal step mà nó hỗ trợ.
- Rule `system` như conflict được đặt trong nhóm “Kiểm tra nhất quán”.
- Không lặp toàn văn điều luật ở từng step; một nút đọc luật dùng chung cho cả group.

## 8. Thiết kế giao diện

Trang có bốn trạng thái rõ ràng:

1. **Upload:** vùng chọn/kéo-thả file và link tải file mẫu.
2. **Review facts:** summary, danh sách facts thu gọn theo subject, lỗi/warning; nút “Dùng file khác”.
3. **Choose question:** các option giống trang guided; nếu cần thì chọn scope subject.
4. **Result:** kết luận trước, chuỗi suy luận sau, dữ kiện thiếu và export cuối trang.

Mỗi dòng suy luận chỉ hiển thị:

```text
[số bước] Giải thích bằng ngôn ngữ thường      [Explore]
```

Nút `Explore` mở dialog gồm:

- Rule ID và implementation name;
- file nguồn;
- đoạn `defrule` CLIPS chính xác, read-only;
- facts/derived facts hỗ trợ bước đó;
- kết luận máy tương ứng;
- link mở nội dung điều luật của cả nhóm.

Không render toàn bộ code trong DOM của danh sách khi dialog chưa mở. Source catalog được trả theo step hoặc tải khi mở dialog để tránh response và bundle quá lớn.

## 9. Xuất kết quả

### Markdown

File `<case-id>-<topic-id>-report.md` gồm:

1. metadata file và knowledge-base version;
2. câu hỏi;
3. kết luận cuối;
4. quá trình suy luận nhóm theo điều luật;
5. facts đã dùng;
6. dữ kiện thiếu/conflict;
7. phụ lục Rule ID và source file, không cần chép toàn bộ code mặc định.

### CLP

File `<case-id>-<topic-id>-result.clp` phải vẫn chạy lại được:

- normalized `analysis-request` theo goal đã chọn;
- normalized `asserted-fact` đã kiểm tra;
- kết quả và trace được ghi dưới dạng comment `; RESULT`, `; TRACE`, `; MISSING` ở cuối file;
- không assert ngược `module-result` hoặc `derived-fact`, tránh kết quả export làm ô nhiễm lần suy luận kế tiếp.

Hai exporter phải là hàm thuần và có golden-file tests.

## 10. Backlog triển khai

### QL0 — Contract và fixture

- [x] `QL-001` Chốt input grammar, giới hạn upload và error contract có dòng/cột tại `doc/Quick_Logic_Test_CLP_Format.md`.
- [x] `QL-002` Tạo `LogicTestReport` contract và mapping topic → goal packages tại `src/domain/logic-test.ts`; mapping dẫn xuất từ guided goal catalog để không có nguồn cấu hình thứ hai.
- [x] `QL-003` Thêm ba fixture cấp tính năng: complete, unknown/missing và conflict; dùng lại facts pháp lý hiện có thay vì viết rule mới. Fixtures có regression test CLIPS riêng.

### QL1 — Parser an toàn

- [ ] `QL-101` Viết tokenizer hỗ trợ comment, string escape, symbol và number.
- [ ] `QL-102` Parse duy nhất `analysis-request`/`asserted-fact` thành AST; từ chối mọi construct khác.
- [ ] `QL-103` Validate schema, predicate allow-list, ID/case consistency và giới hạn tài nguyên.
- [ ] `QL-104` API parse trả normalized facts, preview summary và diagnostics.
- [ ] `QL-105` Unit/fuzz-style tests cho malformed input và payload có `load`, `batch`, `system`, `defrule`.

### QL2 — Runner và explanation model

- [ ] `QL-201` Thêm generic module runner dùng lại adapter/`clipsRulePackages`, không lưu SQLite.
- [ ] `QL-202` Topic planner chọn goal packages và scope subject.
- [ ] `QL-203` Aggregate results, missing requirements và conflict thành status cuối.
- [ ] `QL-204` Dựng dependency-ordered trace từ supports.
- [ ] `QL-205` Nhóm trace theo `provisionId`, giữ khoản/điểm trong cùng legal group.
- [ ] `QL-206` Sinh source catalog từ các `defrule` và `implementations` trong registry; build phải fail nếu mapping bị thiếu.
- [ ] `QL-207` API run trả report; không trả raw process output.

### QL3 — UI

- [ ] `QL-301` Tạo `/logic-test` và entry “Test nhanh logic” ở khu vực kỹ thuật.
- [ ] `QL-302` Upload/dropzone và preview facts theo subject, kèm diagnostics theo dòng.
- [ ] `QL-303` Question picker tái sử dụng topic catalog và scope selector khi cần.
- [ ] `QL-304` Result header phân biệt complete/unknown/conflict/missing-facts.
- [ ] `QL-305` Reasoning groups theo điều luật và các step con theo khoản/điểm.
- [ ] `QL-306` Explore dialog hiển thị code read-only, supports và link điều luật.
- [ ] `QL-307` Loading/error/retry không làm mất file đã parse trong phiên hiện tại.

### QL4 — Export và release

- [ ] `QL-401` Markdown exporter và golden test.
- [ ] `QL-402` Replayable CLP exporter bằng normalized facts + comment report và golden test.
- [ ] `QL-403` Integration test upload → chọn topic → run → inspect report → export.
- [ ] `QL-404` Security regression cho code injection, oversized file, timeout và stderr sanitization.
- [ ] `QL-405` Smoke test đủ bảy topic bằng fixture đại diện.
- [ ] `QL-406` Viết README cho format file, file mẫu, giới hạn và cách đọc status.

## 11. Thứ tự release đề xuất

Slice có thể trình bày sớm nhất:

```text
QL-001 → QL-003
  → QL-101 → QL-105
  → QL-201 → QL-207
  → QL-301 → QL-306
  → QL-401 → QL-406
```

Ưu tiên vertical slice đầu với `will-validity` để xác nhận parser, trace grouping, Explore dialog và export. Sau khi contract ổn định, mở cả bảy topic bằng chính topic planner; không tạo bảy trang riêng.

## 12. Tiêu chí hoàn thành release

- Không có đường nào thực thi code CLIPS từ file upload.
- File hợp lệ được parse với diagnostic đủ để truy ra dòng input.
- Cùng một file và knowledge-base version sinh kết quả xác định như nhau.
- Câu hỏi quyết định package chạy; module trong file không thể override lựa chọn đó.
- Mỗi kết luận có chuỗi trace hoặc chỉ rõ `UNKNOWN`/dữ kiện thiếu/conflict.
- Mọi step có giải thích thường; code chỉ hiện khi bấm `Explore`.
- Các khoản/điểm cùng điều luật nằm trong cùng một legal group.
- File `.md` đọc được độc lập; file `.clp` export có thể dùng lại làm input.
- Đủ test cho bảy topic, parser security và hai exporter.
- `npm test`, type-check và production build đều pass.

## 13. Công việc tạm hoãn

Trong thời gian thực hiện Quick Logic Test:

- không tiếp tục tổ chức hai buổi usability test của `G-504`;
- không bắt đầu `G-505`;
- không đóng `G-504` vì chưa có dữ liệu người dùng thật;
- các sửa lỗi trực tiếp ảnh hưởng tính đúng đắn hoặc an toàn của inference vẫn được phép ưu tiên.
