# Quick Logic Test — định dạng CLP đầu vào

## 1. Phạm vi grammar

File phải là UTF-8, có đuôi `.clp`, không quá 1 MiB và chứa tối đa 500 facts. Parser chỉ chấp nhận comment bắt đầu bằng `;`, một `analysis-request` tùy chọn và các `asserted-fact`.

Grammar mô tả:

```ebnf
document          = trivia, [ analysis_request ], { asserted_fact, trivia } ;
analysis_request  = "(", "analysis-request", request_slots, ")" ;
asserted_fact     = "(", "asserted-fact", fact_slots, ")" ;
request_slots     = case_id_slot, subject_slot, module_slot ;
fact_slots        = fact_id_slot, case_id_slot, subject_slot,
                    predicate_slot, value_slot, [ source_slot ] ;
case_id_slot      = "(", "case-id", symbol, ")" ;
subject_slot      = "(", "subject", symbol, ")" ;
module_slot       = "(", "module", symbol, ")" ;
fact_id_slot      = "(", "fact-id", symbol, ")" ;
predicate_slot    = "(", "predicate", symbol, ")" ;
value_slot        = "(", "value", scalar, ")" ;
source_slot       = "(", "source", ("user" | "document" | "system"), ")" ;
scalar            = symbol | string | integer | float ;
symbol            = lower, { lower | digit | "-" } ;
string            = '"', { escaped_char | non_quote_char }, '"' ;
trivia            = { whitespace | ";", { non_newline }, newline } ;
```

Thứ tự slot không mang ý nghĩa và parser không được phụ thuộc vào thứ tự trong EBNF. Mỗi slot chỉ xuất hiện một lần; mọi slot bắt buộc phải có giá trị.

## 2. Quy tắc chuẩn hóa

- Tất cả `asserted-fact` phải có cùng một `case-id`.
- Nếu có `analysis-request`, `case-id` của request phải trùng với facts.
- `module` trong request được lưu để preview nhưng không quyết định package sẽ chạy.
- Câu hỏi được chọn trên UI là nguồn duy nhất quyết định goal package.
- `fact-id` phải duy nhất trong toàn file.
- `subject`, `fact-id` và `case-id` dùng contract symbol hiện tại: chữ thường ở đầu, sau đó là chữ thường, số hoặc `-`, tối đa 64 ký tự.
- `predicate` và `value` phải vượt qua schema/allow-list của ít nhất một module.
- Parser tạo AST rồi serialize lại; nguyên văn upload không bao giờ được đưa cho CLIPS.

## 3. Top-level forms bị cấm

Mọi form ngoài hai loại được cho phép đều tạo lỗi `UNSUPPORTED_TOP_LEVEL_FORM`, bao gồm nhưng không giới hạn:

```clips
(defrule ...)
(deffunction ...)
(load ...)
(load-facts ...)
(batch ...)
(system ...)
(assert ...)
```

Khi có lỗi, toàn bộ file không được chạy. Hệ thống không âm thầm bỏ đoạn bị cấm rồi chạy phần còn lại.

## 4. Diagnostics contract

Mỗi diagnostic có `code`, `severity`, `message`, `location { line, column, offset }` và `endLocation` tùy chọn. Dòng và cột bắt đầu từ 1; offset bắt đầu từ 0.

| Code | Mức mặc định | Ý nghĩa |
|---|---|---|
| `INVALID_UTF8` | error | File không giải mã được bằng UTF-8 nghiêm ngặt |
| `FILE_TOO_LARGE` | error | File vượt quá 1 MiB |
| `TOO_MANY_FACTS` | error | Có hơn 500 asserted facts |
| `UNEXPECTED_TOKEN` | error | Token không hợp lệ tại vị trí hiện tại |
| `UNTERMINATED_STRING` | error | Chuỗi không có dấu đóng |
| `UNTERMINATED_FORM` | error | S-expression không có dấu đóng |
| `UNSUPPORTED_TOP_LEVEL_FORM` | error | Có form ngoài allow-list |
| `INVALID_SLOT` | error | Slot không thuộc template tương ứng |
| `MISSING_SLOT` | error | Thiếu slot bắt buộc |
| `DUPLICATE_SLOT` | error | Một slot xuất hiện nhiều lần trong cùng form |
| `INVALID_SLOT_VALUE` | error | Giá trị không đúng kiểu hoặc domain |
| `DUPLICATE_FACT_ID` | error | Hai facts dùng cùng ID |
| `INCONSISTENT_CASE_ID` | error | File chứa nhiều case ID |
| `UNSUPPORTED_PREDICATE` | error | Predicate không có trong contract module |
| `MISSING_LABEL` | warning | Subject không có label thân thiện; vẫn được phép chạy |

## 5. File mẫu của release

- `knowledge-base/fixtures/logic-test/complete.clp`
- `knowledge-base/fixtures/logic-test/unknown-missing.clp`
- `knowledge-base/fixtures/logic-test/conflict.clp`

Ba file cùng dùng câu hỏi “Di chúc có hợp pháp không?” để vertical slice đầu tiên kiểm chứng lần lượt kết luận xác định, thiếu dữ kiện và dữ kiện mâu thuẫn.
