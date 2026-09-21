# Phụ lục C. Mã CLIPS tiêu biểu và ánh xạ registry

## C.1. Nguyên tắc chọn đoạn mã

Phụ lục chỉ trình bày các đoạn đại diện cho chuỗi **observation → derived fact → trace → module result → line protocol**. Toàn bộ mã nguồn nằm trong `knowledge-base/`; việc sao chép mọi rule vào báo cáo sẽ làm mất trọng tâm và khó đồng bộ khi source thay đổi.

## C.2. Fact đầu vào và kết luận dẫn xuất

Ví dụ observation về trạng thái tinh thần:

```clips
(asserted-fact
  (fact-id fact-mental)
  (case-id case-demo)
  (subject will-demo)
  (predicate testator-mental-state)
  (value lucid)
  (source user))
```

Một domain rule không trả chuỗi giải thích trực tiếp. Rule tạo `derived-fact` và giữ Rule ID cùng danh sách supports:

```clips
(defrule R-B01-valid-intention
  (asserted-fact
    (fact-id ?mental-id) (case-id ?case-id) (subject ?will-id)
    (predicate testator-mental-state) (value lucid))
  (asserted-fact
    (fact-id ?influence-id) (case-id ?case-id) (subject ?will-id)
    (predicate undue-influence) (value none))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?will-id)
    (predicate valid-intention) (value true)
    (rule-id R-B01)
    (supports ?mental-id ?influence-id))))
```

Mã đầy đủ: [`rules/01-will-validity.clp`](../../knowledge-base/rules/01-will-validity.clp).

## C.3. Ví dụ nối nhiều quan hệ: thừa kế thế vị

Rule R-E01 khớp quan hệ từ người để lại di sản tới người con được thế vị và từ người con đó tới ứng viên. Rule chỉ kích hoạt khi kết luận trung gian cho biết người được thế vị lẽ ra có quyền hưởng và ứng viên đã qua kiểm tra tư cách:

```clips
(defrule R-E01-grandchild-represents-child
  (asserted-fact (case-id ?case-id) (subject ?deceased)
    (predicate biological-parent-of) (value ?represented))
  (asserted-fact (case-id ?case-id) (subject ?represented)
    (predicate biological-parent-of) (value ?person))
  (derived-fact (case-id ?case-id) (subject ?represented)
    (predicate would-be-entitled-if-alive) (value true))
  (derived-fact (case-id ?case-id) (subject ?person)
    (predicate qualified-representation-candidate) (value true))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?person)
    (predicate inherits-by-representation) (value true)
    (rule-id R-E01)
    (supports ?parent-edge ?child-edge ?would-be-rule ?candidate-rule))))
```

Đoạn trên được rút gọn để trình bày; source thực thi đầy đủ nằm tại [`rules/05-representation.clp`](../../knowledge-base/rules/05-representation.clp).

## C.4. Tạo dấu vết giải thích

Rule dùng chung `record-inference-trace` sao chép provenance của mọi `derived-fact` sang cấu trúc trace. Thứ tự giải thích được dựng lại từ quan hệ supports, không dùng bộ đếm thay đổi theo agenda.

```clips
(defrule record-inference-trace
  (derived-fact
    (case-id ?case-id) (subject ?subject)
    (predicate ?predicate) (value ?value)
    (rule-id ?rule-id) (supports $?supports))
  =>
  (assert (inference-trace
    (case-id ?case-id) (subject ?subject)
    (rule-id ?rule-id)
    (conclusion-predicate ?predicate)
    (conclusion-value ?value)
    (supports $?supports))))
```

Source: [`rules/98-explanation.clp`](../../knowledge-base/rules/98-explanation.clp).

## C.5. Ánh xạ Rule ID sang implementation

`rule-registry.json` là nguồn metadata chính. Mỗi entry liên kết một Rule ID logic với không, một hoặc nhiều `defrule` thực thi. Ví dụ một Rule ID có thể cần nhiều implementation cho các hướng quan hệ hoặc các nhánh điều kiện khác nhau.

| Lớp | Ví dụ trường | Vai trò |
|---|---|---|
| Định danh | `ruleId` | Khóa ổn định xuất hiện trong derived fact và trace |
| Phân loại | `module`, `kind` | Gắn rule với mô-đun và phân biệt legal/internal/system |
| Giải thích | `title`, `reasoning`, `conclusion` | Tạo lời giải thích thân thiện |
| Căn cứ | `citation`, `provisionId`, `relevantSections` | Liên kết tới legal source catalog |
| Hiện thực | `implementations` | Danh sách tên `defrule` trong source CLIPS |

Trong phạm vi báo cáo, toàn bộ Rule ID được xác nhận đã review nội bộ và được trình bày với trạng thái `reviewed`. Điều này không đồng nghĩa với phê duyệt pháp lý độc lập.

## C.6. Biên line protocol

Sau khi CLIPS chạy, `machine-output.clp` chỉ xuất nội dung nằm giữa hai marker:

```text
@@INFERENCE-BEGIN@@
@@RESULT@@ case-id subject module predicate value derivation...
@@MISSING@@ case-id subject module predicate
@@TRACE@@ case-id subject rule-id predicate value support...
@@INFERENCE-END@@
```

Adapter TypeScript không parse pretty-print của CLIPS. Nó chỉ chấp nhận ba marker dòng trên và từ chối dòng không được hỗ trợ. Source liên quan: [`machine-output.clp`](../../knowledge-base/machine-output.clp), [`adapter.ts`](../../src/server/clips/adapter.ts) và [`parse-output.ts`](../../src/server/clips/parse-output.ts).
