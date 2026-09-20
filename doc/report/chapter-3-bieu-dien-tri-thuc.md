# Chương 3. Thu nhận và biểu diễn tri thức

## 3.1. Quy trình thu nhận tri thức

Quá trình xây dựng cơ sở tri thức bắt đầu từ Bộ luật Dân sự năm 2015 [1] và bản nội dung thừa kế được nhóm chuẩn hóa. Thay vì chuyển từng câu luật trực tiếp thành mã, nhóm thực hiện quy trình gồm sáu bước.

Thứ nhất, xác định câu hỏi mà hệ thống cần trả lời. Ví dụ, “di chúc có đáp ứng điều kiện cơ bản không?” và “một người thuộc hàng thừa kế nào?” là hai câu hỏi khác nhau, cần kết quả và tập dữ kiện riêng.

Thứ hai, khoanh vùng điều, khoản và điểm liên quan. Mỗi Rule ID được gắn với một `provisionId` và danh sách phân đoạn liên quan trong catalog. Catalog hiện chứa 19 điều và 68 phân đoạn văn bản.

Thứ ba, phân rã quy định thành chủ thể, điều kiện, ngoại lệ và kết luận. Các khái niệm tổng hợp được tách thành observations nguyên tử khi có thể. Ví dụ, thay vì cho phép người dùng nhập trực tiếp `valid-will=true`, hệ thống nhận trạng thái minh mẫn, tác động trái ý chí, nội dung bị cấm và yêu cầu hình thức.

Thứ tư, chuẩn hóa từ vựng và phạm vi của predicate. Mỗi fact phải gắn với `case-id` và `subject`, tránh biến một giá trị thành trạng thái toàn cục. Các giá trị được giới hạn bằng schema TypeScript và constraint trong CLIPS.

Thứ năm, tạo Rule ID, metadata và implementation. Một Rule ID biểu diễn một đơn vị lý giải; Rule ID có thể ánh xạ tới nhiều `defrule` nếu cùng một kết luận có nhiều nhánh điều kiện.

Thứ sáu, xây fixture cho trường hợp điển hình, trường hợp biên, thiếu dữ kiện và mâu thuẫn. Rule chỉ được xem là hoàn tất review nội bộ khi đặc tả, implementation, căn cứ và kiểm thử nhất quán với nhau.

## 3.2. Mô hình khái niệm miền

Trung tâm mô hình là **vụ việc** (`case`). Một vụ việc chứa nhiều người, quan hệ, sự kiện, di chúc, phần di sản, tài sản và nghĩa vụ. Mỗi đối tượng có một định danh ổn định để facts không phụ thuộc vào tên hiển thị.

```text
Case
├── Person
│   ├── trạng thái sống/chết
│   ├── tuổi và khả năng lao động
│   └── hành vi, quyền hưởng, từ chối
├── Relationship
│   ├── cha/mẹ đẻ – con
│   ├── cha/mẹ nuôi – con nuôi
│   └── vợ – chồng
├── Will
│   ├── hình thức
│   ├── điều kiện ý chí
│   └── nội dung và yêu cầu đặc biệt
├── Estate portion / Asset
├── Obligation
└── Event / Timeline
```

Quan hệ gia đình được biểu diễn bằng graph có hướng. Người dùng tạo mỗi người một lần rồi nối các cạnh quan hệ. Hàng thừa kế không được nhập trực tiếp; rules suy ra hàng từ đường quan hệ. Cách làm này giảm nguy cơ người dùng cung cấp chính kết luận mà hệ thống cần xác định.

Phần di sản (`estate-portion`) được tách khỏi toàn bộ di sản vì các phần khác nhau có thể chịu chế độ thừa kế khác nhau. Một phần được định đoạt có hiệu lực theo di chúc có thể mang giá trị `testamentary`, trong khi phần không được định đoạt mang giá trị `statutory`; hai kết quả này không tạo mâu thuẫn nếu thuộc hai subject khác nhau.

## 3.3. Hợp đồng dữ kiện

CLIPS sử dụng các `deftemplate` chung để phân biệt dữ kiện đầu vào, tri thức dẫn xuất và kết quả trình bày. Bảy template cốt lõi gồm `analysis-request`, `asserted-fact`, `derived-fact`, `rule-metadata`, `missing-requirement`, `module-result` và `inference-trace`.

Một dữ kiện do người dùng cung cấp có dạng:

```clips
(asserted-fact
  (fact-id fact-mental-state)
  (case-id case-demo)
  (subject will-demo)
  (predicate testator-mental-state)
  (value lucid)
  (source user))
```

Các slot có ý nghĩa như sau:

| Slot | Vai trò |
|---|---|
| `fact-id` | Định danh duy nhất để rule và trace tham chiếu |
| `case-id` | Phân tách dữ kiện giữa các hồ sơ |
| `subject` | Đối tượng mà mệnh đề mô tả |
| `predicate` | Thuộc tính hoặc quan hệ được quan sát |
| `value` | Giá trị symbol, số hoặc chuỗi |
| `source` | Nguồn `user`, `document` hoặc `system` |

Một dữ kiện dẫn xuất bổ sung provenance:

```clips
(derived-fact
  (case-id case-demo)
  (subject will-demo)
  (predicate valid-intention)
  (value true)
  (rule-id R-B01)
  (supports fact-mental-state fact-undue-influence))
```

Hệ thống phân biệt bốn nhóm dữ kiện:

- **asserted facts**: observations của vụ việc;
- **derived facts**: tri thức do domain rules tạo ra;
- **knowledge facts**: bảng hoặc tri thức dùng chung, như thứ tự ưu tiên thanh toán;
- **control/projection facts**: yêu cầu phân tích và kết quả công khai.

Sự phân lớp ngăn domain rules phụ thuộc vào màn hình hiện tại. `analysis-request` không xuất hiện trong điều kiện của domain rules; nó chỉ phục vụ projection kết quả.

## 3.4. Mô hình luật và metadata

Một luật miền trong hệ thống gồm hai lớp. Lớp metadata mô tả Rule ID, mô-đun, loại luật, tiêu đề, lý do, kết luận, căn cứ, phân đoạn văn bản và các implementation. Lớp CLIPS chứa điều kiện thực thi cụ thể.

Ví dụ rút gọn của R-B01:

```clips
(defrule R-B01-valid-intention
  (asserted-fact
    (fact-id ?mental-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)
    (value lucid))
  (asserted-fact
    (fact-id ?influence-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)
    (value none))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)
    (supports ?mental-id ?influence-id))))
```

R-B01 gắn với điểm a khoản 1 Điều 630. Rule không sinh trực tiếp `valid-will=true`; nó chỉ sinh kết luận trung gian `valid-intention=true`. R-B02 đánh giá nội dung và hình thức. R-B03 chỉ kết luận di chúc hợp pháp khi cả hai nhóm điều kiện đã đạt. Việc chia nhỏ tạo ra dấu vết có ý nghĩa và cho phép hệ thống chỉ đúng điều kiện chưa đạt.

Tất cả Rule ID thuộc phạm vi báo cáo đã hoàn tất review nội bộ và được sử dụng với trạng thái thống nhất `reviewed`.

## 3.5. Tổ chức cơ sở tri thức theo mô-đun

Cơ sở tri thức được chia thành mười nhóm nghiệp vụ. Bảng sau tóm tắt vai trò và căn cứ chính.

| Nhóm | Mô-đun | Kết quả chính | Căn cứ tiêu biểu |
|---|---|---|---|
| A | Loại thừa kế | `inheritance-regime` | Điều 649–650 |
| B | Tính hợp pháp di chúc | `valid-will` | Điều 627, 629–630 |
| C | Hàng thừa kế | `candidate-heir-rank`, `called-to-inherit` | Điều 651 |
| D | Quyền hưởng | `article-621-status` | Điều 621 |
| E | Thế vị và quan hệ đặc biệt | `inherits-by-representation` | Điều 652–654 |
| F | Suất bắt buộc | `compulsory-heir`, mức phần thiếu | Điều 644 |
| G | Vợ chồng đặc biệt | `spouse-status-at-opening` | Điều 655 |
| H | Từ chối/không người nhận | `valid-refusal`, `unclaimed-estate-recipient` | Điều 620, 622 |
| I | Thanh toán và phân chia | `payment-priority` và kết quả liên quan | Điều 658–661 |
| J | Thời hiệu | `limitation-period-years`, người nhận sau thời hiệu | Điều 623 |

Các mô-đun không hoàn toàn độc lập. `inheritance-type` có thể dùng kết luận `valid-will`; `heir-rank` sử dụng trạng thái quyền hưởng và từ chối; `representation` dùng graph gia đình và kết quả về người được thế vị; `compulsory-share` cần quyền hưởng và quan hệ. Dependency được khai báo trong module registry, trong khi mỗi package CLIPS nạp tập rules cần thiết vào cùng working memory.

Tổ chức tệp gồm bốn tầng:

1. domain rules tạo dữ kiện nghiệp vụ;
2. completeness/conflict rules phát hiện thiếu hoặc mâu thuẫn;
3. explanation rule tạo trace;
4. projection rules chọn kết quả cần trả.

Tên tệp có tiền tố số để thể hiện lớp tổ chức và ưu tiên tải, không biến toàn bộ hệ thống thành một thủ tục tuần tự.

## 3.6. Biểu diễn thiếu dữ kiện và mâu thuẫn

Giả sử người dùng yêu cầu đánh giá một di chúc bằng văn bản nhưng chỉ cung cấp loại di chúc. Completeness rules nhận thấy thiếu `testator-mental-state`, `undue-influence`, quan sát về nội dung và đánh giá hình thức. Kết quả mô-đun là `unknown`, đi kèm các `missing-requirement`. Giao diện có thể dùng danh sách này để đặt câu hỏi tiếp theo.

Nếu người dùng cung cấp đủ dữ kiện cho nhánh hợp lệ, rules R-B01, R-B02 và R-B03 lần lượt tạo kết luận trung gian và kết luận cuối. Nếu một tập dữ kiện khác đồng thời kích hoạt rule làm di chúc không hợp pháp, conflict rule nhận ra cả `valid-will=true` và `valid-will=false`; projection trả `conflict`.

Cơ chế trên tốt hơn việc dừng ở lỗi validation. Validation chỉ xác định dữ liệu có đúng kiểu và domain không; completeness xác định dữ liệu có đủ cho một câu hỏi pháp lý không. Một hồ sơ hợp lệ về cú pháp vẫn có thể chưa đủ thông tin để kết luận.

## 3.7. Dấu vết suy luận và liên kết căn cứ

Provenance được hình thành ngay khi domain rule tạo `derived-fact`. Rule `record-inference-trace` chuyển provenance này thành `inference-trace` với các trường subject, Rule ID, predicate kết luận, giá trị và supports. Ứng dụng kết hợp trace với registry và legal source catalog để trình bày tên luật, lý do và phần điều luật liên quan.

Chuỗi giải thích có cấu trúc:

```text
asserted facts
  └── R-B01 → valid-intention=true
  └── R-B02 → valid-content-and-form=true
          └── R-B03 → valid-will=true
```

Rule source catalog còn lưu ánh xạ từ Rule ID đến implementation và mã CLIPS nguồn. Chế độ kỹ thuật của Quick Logic Test có thể mở implementation ở trạng thái chỉ đọc. Điều này phục vụ kiểm tra và học tập nhưng không thay thế lời giải thích ngôn ngữ tự nhiên dành cho người dùng phổ thông.

## 3.8. Ví dụ suy luận xuyên suốt

Xét di chúc `will-demo` có bốn facts:

```text
testator-mental-state = lucid
undue-influence = none
prohibited-content = not-detected
formal-defect = not-detected
```

Fact về loại di chúc bằng văn bản kích hoạt quy tắc chuyển tiếp đánh giá hình thức, tạo `valid-form-requirements=true`. R-B01 dùng hai facts đầu để tạo `valid-intention=true`. R-B02 kết hợp việc không phát hiện nội dung bị cấm với yêu cầu hình thức đã đạt, tạo `valid-content-and-form=true`. Cuối cùng, R-B03 kết hợp hai kết luận trung gian và tạo `valid-will=true`.

Nếu bỏ fact `undue-influence=none`, R-B01 không được kích hoạt. Completeness layer tạo yêu cầu `undue-influence`, R-B03 cũng không có đủ tiền đề, và hệ thống trả `unknown`. Điểm quan trọng là hệ thống không suy ra `undue-influence=none` chỉ vì không có dữ kiện ngược lại. Ví dụ này thể hiện đồng thời luật sản xuất, suy diễn tiến, provenance và cách xử lý tri thức chưa đầy đủ.
