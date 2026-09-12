---
title: "Rule-base Luật thừa kế Việt Nam — Đề xuất chuẩn hóa V2"
source_document: "Loc_Rulebase.md"
legal_basis: "Bộ luật Dân sự 2015, Luật số 91/2015/QH13"
document_role: "Bản đặc tả đề xuất để team review trước khi chuyển sang CLIPS"
version: "2.0-draft"
revision_date: "2026-09-10"
verification_status: "Chưa được chuyên gia pháp lý kiểm chứng hoặc phê duyệt"
---

# Rule-base Luật thừa kế Việt Nam — V2 (bản đề xuất)

> **Mục đích:** Tài liệu này chuẩn hóa rule catalog tại `Loc_Rulebase.md` thành đặc tả tri thức phù hợp với production system và forward chaining. Đây không phải bản sao văn bản pháp luật, không phải tư vấn pháp lý và chưa được chuyên gia pháp lý phê duyệt.

Nguồn đối chiếu chính thức: [Bộ luật Dân sự số 91/2015/QH13 trên Cổng Thông tin điện tử Chính phủ](https://vanban.chinhphu.vn/?pageid=27160&docid=183188), ban hành ngày 24/11/2015 và có hiệu lực từ ngày 01/01/2017.

## 1. Quan hệ với V1

- `Loc_Rulebase.md` được giữ nguyên làm rule catalog có provenance từ DOCX.
- V2 không thay thế văn bản pháp luật và không tự tuyên bố các luật đã chính xác.
- V2 giữ các Rule ID gốc để truy vết; khi một điều kiện `OR` cần tách, dùng hậu tố `a`, `b`, ...
- Các thay đổi làm rõ phạm vi hoặc sửa loại kết luận được đánh dấu `TEAM-REVIEW`.
- Chỉ V2 sau khi team duyệt mới được dùng làm đầu vào triển khai các tệp `.clp` tiếp theo.

## 2. Những thay đổi thiết kế chính

### 2.1. Không xem Rule ID là Boolean

Không viết:

```text
R-B01 = TRUE AND R-B02 = TRUE
```

Mà dùng kết luận do luật sinh ra:

```text
valid-intention(will) = true
AND valid-content-and-form(will) = true
```

### 2.2. Facts phải gắn với chủ thể và vụ việc

Không dùng biến toàn cục như `tuoi`, `con_song` hoặc `tu_choi_nhan_di_san`. Dạng chuẩn:

```text
age(person, years)
alive-at-opening(person, case)
refusal-intent(person, case, avoid-obligation | ordinary)
```

### 2.3. Không nhập trực tiếp kết luận cần suy ra

Không yêu cầu người dùng nhập `di_chuc_hop_phap=true` hoặc `co_nguoi_hang_truoc=false`. Hệ thống nhận observations và sinh các kết luận này qua rules.

### 2.4. Không dùng closed-world assumption cho mệnh đề “không có” hoặc “tất cả”

Các kết luận như “không còn ai ở hàng trước” chỉ được sinh khi có fact completeness:

```text
heir-search-complete(case, rank) = true
beneficiary-list-complete(will) = true
```

Không tìm thấy một người trong database chưa đủ để kết luận người đó không tồn tại.

### 2.5. Tách domain knowledge khỏi control và presentation

- Domain rules chỉ nhận asserted/derived facts và sinh derived facts.
- `analysis-request` chỉ chọn `module-result`, không phải điều kiện pháp lý.
- Explanation subsystem dựng trace từ `rule-id` và `supports`.
- Các phép tính, deadline và quyết định tùy nghi được phân loại riêng, không giả dạng một kết luận Boolean đơn giản.

## 3. Quy ước trạng thái và phạm vi

### 3.1. Giá trị logic

| Giá trị | Ý nghĩa |
|---|---|
| `true` | Có facts và chuỗi luật chứng minh kết luận |
| `false` | Có facts và chuỗi luật bác bỏ kết luận |
| `unknown` | Thiếu facts bắt buộc |
| `conflict` | Có facts hoặc kết luận không tương thích |

### 3.2. Trạng thái review của rule

| Trạng thái | Ý nghĩa |
|---|---|
| `MODEL-READY` | Cách chuẩn hóa tương đối rõ; vẫn cần legal review trước sử dụng thực tế |
| `TEAM-REVIEW` | Có thay đổi phạm vi, thuật ngữ hoặc giả định cần team duyệt |
| `DEFERRED` | Ngoài phạm vi suy luận định tính của MVP hoặc cần subsystem khác |

### 3.3. Loại kết luận

| Loại | Ví dụ |
|---|---|
| `DERIVATION` | `heir-rank(person)=1` |
| `CLASSIFICATION` | `inheritance-regime(portion)=statutory` |
| `EXCLUSION` | `disqualified(person)=true` |
| `NORMATIVE` | `payment-priority(funeral-cost)=1` |
| `CALCULATION` | `equal-share-principle-applies(rank)=true` |
| `DISCRETION` | `court-deferral-may-be-requested=true` |
| `TEMPORAL` | `claim-deadline=date` |

## 4. Từ vựng tri thức đề xuất

### 4.1. Asserted facts chính

| Nhóm | Predicates tiêu biểu |
|---|---|
| Vụ việc | `deceased(case, person)`, `opening-date(case, date)`, `fact-set-complete(case, scope)` |
| Người | `age-at(person, date, years)`, `alive-at-opening(person, case)`, `work-capacity(person, capable|incapable)` |
| Quan hệ | `relationship-at-opening(person, deceased, type)`, `parent-of(parent, child, type)`, `care-relationship(person-a, person-b, parent-child-like)` |
| Di chúc | `has-will(case, true|false)`, `will-type(will, written|oral)`, `disposition(will, portion, beneficiary)` |
| Ý chí | `testator-mental-state(will, lucid|not-lucid)`, `undue-influence(will, none|deception|threat|coercion)` |
| Hình thức | `witness-count(will, n)`, `witnesses-recorded(will, true|false)`, `witnesses-signed(will, true|false)`, `certified-within-days(will, n)` |
| Sự kiện | `death-time(person, time)`, `organization-status-at-opening(org, active|ceased)`, `conviction(person, offense, intentional)` |
| Từ chối | `refusal-made(person, case)`, `refusal-written(person, case)`, `refusal-recipient(person, case, recipient-type)`, `refusal-intent(person, case, ordinary|avoid-obligation)` |
| Tài sản/yêu cầu | `estate-portion(case, portion)`, `asset-type(asset, movable|immovable)`, `request-type(request, divide-estate|confirm-right|perform-obligation)` |

### 4.2. Derived predicates chính

```text
valid-intention(will)
valid-content-and-form(will)
valid-will(will)
will-effect-status(will, effective | automatically-revoked)
inheritance-regime(case, portion, testamentary | statutory)
disqualified(person, case)
disqualification-exception(person, case)
entitled(person, case, basis)
candidate-heir-rank(person, case, rank)
active-heir-rank(case, rank)
called-to-inherit(person, case)
representation-heir(person, represented-person, case)
compulsory-heir(person, case)
valid-refusal(person, case)
missing-requirement(case, module, predicate)
```

## 5. Phụ thuộc giữa các nhóm luật

```text
Nhóm B: tính hợp pháp di chúc
        ↓
Nhóm A: chế độ thừa kế theo từng phần di sản
        ↓
Nhóm D/H: quyền hưởng và từ chối
        ↓
Nhóm C: hàng thừa kế đang được gọi
        ↓
Nhóm E/F: thế vị và suất bắt buộc

Nhóm G bổ sung facts về quan hệ vợ chồng
Nhóm I là rules chuẩn bị phân chia, không tính end-to-end trong MVP
Nhóm J là rules thời hạn/thời hiệu và hậu quả khi hết thời hiệu
```

## 6. Rule catalog chuẩn hóa

Cách đọc bảng so sánh:

- `V1 tóm tắt` cô đọng điều kiện và kết luận trong `Loc_Rulebase.md`; đây không phải trích dẫn nguyên văn luật.
- `Điều kiện/Kết luận chuẩn hóa V2` là mô hình đề xuất để triển khai bằng CLIPS.
- `Cùng V1 R-...` cho biết một rule V1 đã được tách thành nhiều production rules V2 để loại bỏ điều kiện `OR` hoặc kết luận gộp.
- `Thay đổi/điểm review` giải thích khác biệt quan trọng nhất để team quyết định chấp nhận, sửa hoặc từ chối.

### Nhóm A — Xác định chế độ thừa kế

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-A01 | Không có di chúc → thừa kế theo pháp luật | CLASSIFICATION | `has-will(case)=false` | Mọi `estate-portion` thuộc `statutory` | Gắn kết luận với `case` và từng phần di sản | MODEL-READY |
| R-A02 | Có di chúc nhưng không hợp pháp → theo pháp luật | CLASSIFICATION | `has-will=true` AND `valid-will=false` | Phần bị chi phối bởi di chúc không hợp pháp chuyển sang `statutory` | Không dùng một Boolean toàn cục cho toàn bộ di sản | TEAM-REVIEW |
| R-A03 | Có di chúc hợp pháp → theo di chúc | CLASSIFICATION | `valid-will=true` AND có `disposition(will, portion, beneficiary)` còn hiệu lực | `inheritance-regime(case, portion)=testamentary` | Chỉ áp dụng với phần được định đoạt, không mặc định toàn bộ di sản | TEAM-REVIEW |
| R-A04 | Tất cả người theo di chúc đã chết → theo pháp luật | CLASSIFICATION | Người được chỉ định cho `portion` chết trước/cùng thời điểm mở thừa kế, hoặc tổ chức được chỉ định không còn tồn tại; danh sách disposition đã đầy đủ | `inheritance-regime(case, portion)=statutory` | Tách xử lý theo từng beneficiary/portion; thêm completeness | TEAM-REVIEW |
| R-A05a | Tất cả người chỉ định từ chối hoặc bị truất quyền → theo pháp luật | CLASSIFICATION | Beneficiary của `portion` có `disqualified=true` và không có ngoại lệ | `inheritance-regime(case, portion)=statutory` | Tách nhánh `OR`; thay “bị truất quyền” bằng trạng thái không có quyền hưởng cần review thuật ngữ | TEAM-REVIEW |
| R-A05b | Cùng V1 R-A05 | CLASSIFICATION | Beneficiary của `portion` có `valid-refusal=true` | `inheritance-regime(case, portion)=statutory` | Tách nhánh `OR`, áp dụng theo phần | MODEL-READY |
| R-A06 | Phần không được định đoạt → theo pháp luật | CLASSIFICATION | Tồn tại `estate-portion` không thuộc disposition nào và `disposition-set-complete=true` | Phần đó thuộc `statutory` | Yêu cầu completeness để tránh suy luận từ dữ liệu thiếu | MODEL-READY |

### Nhóm B — Tính hợp pháp và hiệu lực của di chúc

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-B01 | Minh mẫn và không bị lừa dối/đe dọa → ý chí hợp lệ | DERIVATION | `testator-mental-state=lucid` AND `undue-influence=none` | `valid-intention(will)=true` | Dùng observations thay cho `nguoi_lap_dc_minh_man=true` tổng quát | MODEL-READY |
| R-B02 | Nội dung và hình thức hợp pháp → điều kiện nội dung/hình thức hợp lệ | DERIVATION | `prohibited-content=not-detected` AND `valid-form-requirements=true` | `valid-content-and-form(will)=true` | `valid-form-requirements` phải được suy ra từ facts hình thức, không nhập trực tiếp | TEAM-REVIEW |
| R-B03 | R-B01 và R-B02 đúng → di chúc hợp pháp | DERIVATION | `valid-intention=true` AND `valid-content-and-form=true` | `valid-will(will)=true` | Tham chiếu predicates, không tham chiếu `R-B01=true` | MODEL-READY |
| R-B04a | Không minh mẫn hoặc bị lừa dối/đe dọa → không hợp pháp | EXCLUSION | `testator-mental-state=not-lucid` | `valid-will(will)=false` | Tách điều kiện `OR` | MODEL-READY |
| R-B04b | Cùng V1 R-B04 | EXCLUSION | `undue-influence` thuộc `{deception, threat, coercion}` | `valid-will(will)=false` | Tách điều kiện `OR` | MODEL-READY |
| R-B05 | Người 15–17 tuổi, văn bản, có đồng ý → hợp pháp | DERIVATION | `15 <= age < 18`, `will-type=written`, `guardian-consent=true` | `minor-special-requirement(will)=satisfied` | Không kết luận toàn bộ di chúc hợp pháp chỉ từ điều kiện tuổi; đưa vào chuỗi B02/B03 | TEAM-REVIEW |
| R-B06a | Người 15–17 tuổi, không có văn bản hoặc đồng ý → không hợp pháp | EXCLUSION | `15 <= age < 18` AND `will-type!=written` với fact xác định | `minor-special-requirement=failed`, sau đó `valid-will=false` | Không dùng absence để hiểu là không lập bằng văn bản | MODEL-READY |
| R-B06b | Cùng V1 R-B06 | EXCLUSION | `15 <= age < 18` AND `guardian-consent=false` | `minor-special-requirement=failed`, sau đó `valid-will=false` | Tách `OR` | MODEL-READY |
| R-B07 | Hạn chế thể chất/không biết chữ, có người làm chứng và công chứng → hợp pháp | DERIVATION | Người lập bị hạn chế thể chất hoặc không biết chữ; di chúc bằng văn bản do người làm chứng lập; có công chứng/chứng thực | `accessibility-form-requirement=satisfied` | Đây là điều kiện hình thức trung gian, vẫn phải kết hợp điều kiện ý chí/nội dung | TEAM-REVIEW |
| R-B08 | Di chúc miệng; sau 3 tháng vẫn sống, minh mẫn → di chúc không hợp pháp/bị hủy | TEMPORAL | `will-type=oral`, sau 3 tháng người lập còn sống và minh mẫn | `will-effect-status=automatically-revoked` | Không đồng nhất “mặc nhiên bị hủy bỏ” với “di chúc vốn không hợp pháp” | TEAM-REVIEW |
| R-B09 | Di chúc miệng đủ người làm chứng, ghi chép, ký và xác nhận trong 5 ngày → hợp pháp | DERIVATION | `will-type=oral`, `witness-count>=2`, `witnesses-recorded=true`, `witnesses-signed=true`, `certified-within-days<=5` | `oral-form-requirement=satisfied` | Không kết luận toàn bộ `valid-will=true`; còn phụ thuộc ý chí và nội dung | TEAM-REVIEW |

**Khoảng trống cần bổ sung:** Rule catalog V1 chưa mô hình hóa đầy đủ các Điều 627–636 về từng hình thức di chúc bằng văn bản, người làm chứng, nội dung và thủ tục công chứng/chứng thực. Không nên dùng `formal-defect=not-detected` lâu dài thay cho nhóm rules này.

### Nhóm C — Người thừa kế theo pháp luật và hàng thừa kế

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-C01 | Quan hệ thuộc hàng 1 → hàng thừa kế 1 | CLASSIFICATION | `relationship-at-opening(X,deceased,type)` với type thuộc hàng 1 | `candidate-heir-rank(X,case)=1` | Kết luận là ứng viên hàng 1, chưa tự động là người được nhận | MODEL-READY |
| R-C02 | Quan hệ thuộc hàng 2 → hàng thừa kế 2 | CLASSIFICATION | Quan hệ của X thuộc danh sách hàng 2 | `candidate-heir-rank(X,case)=2` | Phân biệt loại quan hệ cháu bằng quan hệ cha/mẹ trung gian, tránh chuỗi text mơ hồ | TEAM-REVIEW |
| R-C03 | Quan hệ thuộc hàng 3 → hàng thừa kế 3 | CLASSIFICATION | Quan hệ của X thuộc danh sách hàng 3 | `candidate-heir-rank(X,case)=3` | Chuẩn hóa quan hệ bác/chú/cậu/cô/dì/chắt thành graph quan hệ | TEAM-REVIEW |
| R-C04 | Cùng hàng → chia đều | CALCULATION | Các `called-to-inherit` cùng `active-heir-rank` | `equal-share-principle-applies(case,rank)=true` | Không kết luận `phan_di_san(X)=phan_di_san(Y)` ngay; phép tính nằm ngoài MVP | TEAM-REVIEW |
| R-C05 | Có người hàng trước → X không hưởng | EXCLUSION | X ở hàng N và tồn tại người `called-to-inherit` ở hàng nhỏ hơn N | `called-to-inherit(X,case)=false` với reason `prior-rank-active` | Không dùng `co_nguoi_hang_truoc` làm input | MODEL-READY |
| R-C06 | Không còn người hàng trước → X được hưởng | DERIVATION | X là ứng viên hàng N; tất cả hàng trước đã được kiểm tra đầy đủ và không có người đủ điều kiện | `active-heir-rank(case)=N`, `called-to-inherit(X,case)=true` nếu X đủ điều kiện | Cần `heir-search-complete` và trạng thái chết/không có quyền/từ chối của từng người | TEAM-REVIEW |

Danh mục quan hệ dùng để sinh `candidate-heir-rank`:

| Hàng | Quan hệ với người chết |
|---:|---|
| 1 | Vợ/chồng; cha đẻ, mẹ đẻ; cha nuôi, mẹ nuôi; con đẻ, con nuôi |
| 2 | Ông nội, bà nội, ông ngoại, bà ngoại; anh/chị/em ruột; cháu ruột khi người chết là ông/bà |
| 3 | Cụ nội, cụ ngoại; bác/chú/cậu/cô/dì ruột; cháu ruột khi người chết là bác/chú/cậu/cô/dì; chắt ruột khi người chết là cụ |

Quan hệ cháu/chắt không nên nhập bằng một nhãn text duy nhất; engine nên suy ra từ chuỗi `parent-of` để giữ đúng hướng quan hệ.

### Nhóm D — Người không có quyền hưởng di sản

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-D01 | Bị kết án xâm phạm người để lại di sản → không được hưởng | EXCLUSION | Có bản án về hành vi cố ý xâm phạm tính mạng/sức khỏe hoặc hành vi ngược đãi, hành hạ, xâm phạm nghiêm trọng danh dự/nhân phẩm của người để lại di sản | `disqualified(X,case)=true`, reason `offense-against-deceased` | Gắn sự kiện kết án, người bị hại và tính cố ý; V1 chưa nêu phần danh dự/nhân phẩm nên cần đối chiếu | TEAM-REVIEW |
| R-D02 | Vi phạm nghiêm trọng nghĩa vụ nuôi dưỡng → không được hưởng | EXCLUSION | `serious-support-duty-violation(X,deceased)=true` | `disqualified(X,case)=true`, reason `support-duty` | Gắn nghĩa vụ với hai chủ thể | MODEL-READY |
| R-D03 | Cố ý xâm phạm người thừa kế khác để hưởng di sản → không được hưởng | EXCLUSION | X bị kết án cố ý xâm phạm tính mạng người thừa kế khác nhằm hưởng thêm di sản | `disqualified(X,case)=true`, reason `offense-against-other-heir` | Tách victim, intent và case | MODEL-READY |
| R-D04a | Can thiệp trái phép vào di chúc → không được hưởng | EXCLUSION | X lừa dối hoặc cưỡng ép người lập di chúc | `disqualified(X,case)=true`, reason `will-interference` | Tách hành vi thay vì `lua_doi_di_chuc=true` tổng hợp | MODEL-READY |
| R-D04b | Cùng V1 R-D04 | EXCLUSION | X giả mạo, sửa, hủy hoặc che giấu di chúc nhằm hưởng trái ý chí người lập | `disqualified(X,case)=true`, reason `will-document-interference` | Tách nhánh hành vi và mục đích | MODEL-READY |
| R-D05 | Thuộc diện loại trừ nhưng người chết biết và vẫn cho hưởng → vẫn hưởng | DERIVATION | `disqualified=true`, người để lại di sản biết hành vi, vẫn chỉ định X hưởng trong di chúc | `disqualification-exception(X,will)=true`; X có thể hưởng theo disposition đó | Không xóa fact `disqualified`; tạo exception có phạm vi theo di chúc | TEAM-REVIEW |

### Nhóm E — Thừa kế thế vị và quan hệ đặc biệt

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-E01 | Con chết trước/cùng lúc, cháu còn sống → cháu thế vị | DERIVATION | P là con của người chết; P chết trước/cùng thời điểm; C là con của P; C sống tại thời điểm mở thừa kế; P sẽ được hưởng nếu còn sống | `representation-heir(C,P,case)=true` | Thêm điều kiện “phần mà P được hưởng nếu còn sống” dưới dạng `would-be-entitled` | TEAM-REVIEW |
| R-E02 | Cháu cũng chết trước/cùng lúc, chắt còn sống → chắt thế vị | DERIVATION | Chuỗi quan hệ deceased → child → grandchild đã chết trước/cùng thời điểm → great-grandchild còn sống | `representation-heir(great-grandchild,represented-person,case)=true` | Biểu diễn bằng graph, không dùng `cha_me_da_chet` toàn cục | TEAM-REVIEW |
| R-E03a | Con nuôi được thừa kế cha/mẹ nuôi và cha/mẹ đẻ | DERIVATION | `parent-of(adoptive-parent,adopted-child,adoptive)` | Tạo quan hệ ứng viên thừa kế giữa con nuôi và cha/mẹ nuôi | Không kết luận quyền hưởng cuối cùng trước khi áp dụng D/H/C | MODEL-READY |
| R-E03b | Cùng V1 R-E03 | DERIVATION | Có quan hệ con nuôi hợp pháp đồng thời có quan hệ cha/mẹ đẻ | Giữ cả hai căn cứ quan hệ để xét Điều 651/652 | Tách hai quan hệ, không ghi một kết luận gộp | MODEL-READY |
| R-E04 | Con riêng có chăm sóc như cha/mẹ con → hưởng và thế vị | DERIVATION | `step-parent-of(P,C)` và `step-care-status(edge-id,established)` gắn đúng vào fact quan hệ | Tạo `step-relationship-inheritance-basis` theo hai chiều | Đã triển khai draft; không kết luận quyền hưởng cuối cùng nếu còn exclusion/refusal | TEAM-REVIEW |
| R-E05 | Không có quan hệ chăm sóc → không hưởng bố dượng/mẹ kế | EXCLUSION | `step-parent-of(P,C)` và đánh giá tường minh `step-care-status(edge-id,not-established)` | `eligible-by-step-relationship=false` theo hai chiều | Đã triển khai draft; thiếu đánh giá là UNKNOWN, chỉ phủ định căn cứ này | TEAM-REVIEW |

### Nhóm F — Người thừa kế không phụ thuộc nội dung di chúc

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-F01a | Con chưa thành niên/cha/mẹ/vợ/chồng thiếu 2/3 suất → hưởng tối thiểu 2/3 | CLASSIFICATION | X là con chưa thành niên của người chết | `compulsory-heir-candidate(X,case)=true` | Tách nhóm đối tượng | MODEL-READY |
| R-F01b | Cùng V1 R-F01 | CLASSIFICATION | X là cha, mẹ, vợ hoặc chồng của người chết tại thời điểm mở thừa kế | `compulsory-heir-candidate(X,case)=true` | Tách nhóm đối tượng | MODEL-READY |
| R-F01c | Cùng V1 R-F01 | CALCULATION | Candidate không được hưởng theo di chúc hoặc phần chỉ định nhỏ hơn 2/3 suất theo pháp luật | `minimum-share-rule-applies(X)=true`, hệ số `2/3` | Chỉ nhận diện quyền và hệ số; không tính chia end-to-end trong MVP | DEFERRED |
| R-F02 | Con thành niên không có khả năng lao động, thiếu 2/3 suất → hưởng tối thiểu | CLASSIFICATION | X là con thành niên và `work-capacity=incapable` | `compulsory-heir-candidate(X,case)=true` | `không có khả năng lao động` phải có evidence/source | TEAM-REVIEW |
| R-F03 | Thuộc diện suất bắt buộc nhưng từ chối → không hưởng | EXCLUSION | Candidate có `valid-refusal=true` | `compulsory-heir(X,case)=false`, reason `refusal` | Tham chiếu kết luận H01/H03 thay vì Rule ID | MODEL-READY |
| R-F04 | Thuộc diện suất bắt buộc nhưng không có quyền hưởng → không hưởng | EXCLUSION | Candidate có `disqualified=true` và không có exception phù hợp | `compulsory-heir(X,case)=false`, reason `disqualified` | Tham chiếu predicate D, không tham chiếu dải Rule ID | MODEL-READY |

### Nhóm G — Quan hệ vợ chồng đặc biệt

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-G01 | Đã chia tài sản chung nhưng hôn nhân còn → vẫn thừa kế | DERIVATION | Hôn nhân còn tồn tại dù đã chia tài sản chung; một bên chết | `spouse-status-at-opening(survivor)=valid` | Chỉ duy trì căn cứ quan hệ, chưa kết luận quyền hưởng cuối cùng | MODEL-READY |
| R-G02 | Đang xin ly hôn, chưa có quyết định hiệu lực → vẫn thừa kế | DERIVATION | Đang xin ly hôn nhưng chưa có bản án/quyết định có hiệu lực khi một bên chết | `spouse-status-at-opening(survivor)=valid` | Mô hình hóa hiệu lực quyết định theo thời gian | MODEL-READY |
| R-G03 | Là vợ/chồng lúc mở thừa kế, sau đó kết hôn khác → vẫn thừa kế | DERIVATION | X là vợ/chồng tại thời điểm mở thừa kế và kết hôn người khác sau đó | Quan hệ tại thời điểm mở thừa kế không bị mất | Quan hệ sau thời điểm mở thừa kế không thay đổi status đã xác lập | MODEL-READY |

### Nhóm H — Từ chối nhận di sản và tài sản không có người nhận

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-H01 | Từ chối không nhằm trốn nghĩa vụ → hợp lệ | DERIVATION | Có hành vi từ chối và `refusal-intent=ordinary` | `refusal-substantive-condition=satisfied` | Chưa đủ để kết luận từ chối có hiệu lực nếu thiếu hình thức/thời điểm | TEAM-REVIEW |
| R-H02 | Từ chối nhằm trốn nghĩa vụ → không hợp lệ | EXCLUSION | `refusal-intent=avoid-obligation` | `valid-refusal=false` | Gắn với người, case và nghĩa vụ cần tránh | MODEL-READY |
| R-H03 | Từ chối bằng văn bản, gửi đúng người → có hiệu lực | DERIVATION | Từ chối lập thành văn bản và đã gửi đến đúng chủ thể nhận | `refusal-form-condition=satisfied` | V1 chưa thể hiện đầy đủ tất cả chủ thể nhận và thời điểm; cần team đối chiếu Điều 620 | TEAM-REVIEW |
| R-H01+H03 | V1 chưa có rule hợp thành | DERIVATION | Điều kiện nội dung và hình thức đều đạt, từ chối đúng thời điểm | `valid-refusal(X,case)=true` | Thêm rule hợp thành; không coi riêng H01 hoặc H03 là đủ | TEAM-REVIEW |
| R-H04 | Không có người nhận theo di chúc/pháp luật → thuộc Nhà nước | CLASSIFICATION | Không có người hưởng theo di chúc; không có người hưởng theo pháp luật hoặc tất cả không có quyền/từ chối; quá trình xác định người hưởng đã đầy đủ | `unclaimed-estate(case)=state` | Bắt buộc có completeness; không suy luận chỉ vì database đang rỗng | MODEL-READY |

### Nhóm I — Thanh toán và phân chia di sản

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-I01 | Có nghĩa vụ/chi phí → thanh toán theo 10 mức ưu tiên | NORMATIVE | Có nghĩa vụ và chi phí liên quan tới thừa kế | Sinh `payment-priority(type,1..10)` theo thứ tự luật định | Nên lưu bảng ưu tiên như knowledge facts; không phải một Boolean | DEFERRED |
| R-I02 | Theo di chúc nhưng không rõ phần → chia đều | CALCULATION | Phân chia theo di chúc; nhiều beneficiary; di chúc không xác định phần | `equal-share-principle-applies(disposition-group)=true` | Chỉ nhận diện nguyên tắc, chưa tính giá trị trong MVP | DEFERRED |
| R-I03a | Có người đã thành thai chưa sinh → dành một phần bằng người khác | NORMATIVE | Phân chia theo pháp luật; có người đã thành thai nhưng chưa sinh, nếu sinh ra còn sống sẽ cùng hàng | `reserve-one-equal-share(unborn-person)=true` | Gắn đối tượng và hàng thừa kế | DEFERRED |
| R-I03b | V1 chưa có nhánh hậu quả sau khi sinh | NORMATIVE | Kết quả sinh sống/chết của người đã thành thai sau khi dành phần | Xác định người nhận phần đã dành theo quy định tương ứng | V1 thiếu nhánh hậu quả; cần legal review trước khi bổ sung executable rule | TEAM-REVIEW |
| R-I04 | Có yêu cầu/thỏa thuận thời hạn → chỉ chia khi hết hạn | TEMPORAL | Di chúc hoặc thỏa thuận hợp lệ xác định thời điểm chia sau | `distribution-not-before(case,date)` | Biểu diễn ràng buộc thời gian, không dùng Boolean “chưa chia” | DEFERRED |
| R-I05 | Chia ảnh hưởng nghiêm trọng đến vợ/chồng → Tòa có thể hoãn | DISCRETION | Việc chia ảnh hưởng nghiêm trọng tới đời sống vợ/chồng còn sống | `court-deferral-may-be-requested=true`; lần đầu tối đa 3 năm và có thể gia hạn một lần tối đa 3 năm | Tòa án “có thể” quyết định; engine không tự kết luận di sản đã được hoãn chia | TEAM-REVIEW |

Thứ tự thanh toán được giữ dưới dạng knowledge facts của R-I01:

| Ưu tiên | Loại nghĩa vụ/chi phí |
|---:|---|
| 1 | Chi phí hợp lý theo tập quán cho việc mai táng |
| 2 | Tiền cấp dưỡng còn thiếu |
| 3 | Chi phí bảo quản di sản |
| 4 | Tiền trợ cấp cho người sống nương nhờ |
| 5 | Tiền công lao động |
| 6 | Tiền bồi thường thiệt hại |
| 7 | Thuế và các khoản phải nộp vào ngân sách nhà nước |
| 8 | Các khoản nợ khác đối với cá nhân, pháp nhân |
| 9 | Tiền phạt |
| 10 | Các chi phí khác |

### Nhóm J — Thời hiệu thừa kế

| Rule | V1 tóm tắt | Loại | Điều kiện chuẩn hóa V2 | Kết luận chuẩn hóa V2 | Thay đổi/điểm review | Trạng thái |
|---|---|---|---|---|---|---|
| R-J01 | Bất động sản → thời hiệu chia 30 năm | TEMPORAL | `request-type=divide-estate`, `asset-type=immovable` | `limitation-period=30 years`, tính từ `opening-date` | Việc cộng ngày/năm nên do temporal helper có test boundary | DEFERRED |
| R-J02 | Động sản → thời hiệu chia 10 năm | TEMPORAL | `request-type=divide-estate`, `asset-type=movable` | `limitation-period=10 years` | Gắn với request và asset cụ thể | DEFERRED |
| R-J03 | Xác nhận/bác bỏ quyền thừa kế → 10 năm | TEMPORAL | `request-type=confirm-or-deny-inheritance-right` | `limitation-period=10 years` | Không phụ thuộc loại tài sản | MODEL-READY |
| R-J04 | Yêu cầu thực hiện nghĩa vụ tài sản → 3 năm | TEMPORAL | `request-type=perform-estate-obligation` | `limitation-period=3 years` | Gắn với yêu cầu cụ thể | MODEL-READY |
| R-J05 | Hết thời hiệu, có người thừa kế quản lý → thuộc người quản lý | CLASSIFICATION | Thời hiệu chia đã hết và người thừa kế đang quản lý di sản | `post-limitation-recipient=managing-heir` | Chỉ chạy sau khi temporal subsystem xác nhận hết thời hiệu | TEAM-REVIEW |
| R-J06 | Không có người thừa kế quản lý, có người chiếm hữu → thuộc người chiếm hữu | CLASSIFICATION | Không có người thừa kế quản lý; có người chiếm hữu đáp ứng Điều 236 | `post-limitation-recipient=qualified-possessor` | Không tự đánh giá điều kiện Điều 236 nếu chưa có rules tương ứng | TEAM-REVIEW |
| R-J07 | Không có người quản lý/chiếm hữu → thuộc Nhà nước | CLASSIFICATION | Không có người quản lý hoặc người chiếm hữu đủ điều kiện; việc xác minh đã đầy đủ | `post-limitation-recipient=state` | Thêm completeness để tránh suy luận từ absence | MODEL-READY |

## 7. Những thay đổi cần team duyệt trước tiên

### Quyết định 1 — Mức nguyên tử của facts về di chúc

Chọn một trong hai:

- **Khuyến nghị:** nhập facts cụ thể như loại di chúc, tuổi, chữ ký, số người làm chứng và chứng thực; engine tự suy ra điều kiện hình thức.
- **Tạm thời:** cho phép nhập assessment `formal-defect=not-detected`, nhưng phải đánh dấu nguồn là `document` hoặc `reviewer`, không coi là fact thô.

### Quyết định 2 — Phạm vi kết luận `valid-will`

Phân biệt:

- `valid-will`: đáp ứng điều kiện hợp pháp khi lập;
- `will-effect-status`: còn hiệu lực hay đã mặc nhiên bị hủy bỏ;
- `disposition-effective(portion)`: phần định đoạt cụ thể có thể áp dụng.

Không dùng một Boolean `di_chuc_hop_phap` để đại diện cả ba khái niệm.

### Quyết định 3 — Phạm vi của `entitled`

Không tạo một fact chung `entitled(X)=true` quá sớm. Nên giữ căn cứ:

```text
entitled(X, case, testamentary)
entitled(X, case, statutory)
entitled(X, case, representation)
entitled(X, case, compulsory-share)
```

Sau đó lớp projection mới tổng hợp kết quả cho từng mô-đun.

### Quyết định 4 — Completeness

UI phải cho nhóm xác nhận danh sách người hoặc disposition đã khai báo đầy đủ trước khi engine được phép sinh các kết luận phủ định phổ quát như “không có người thừa kế”.

### Quyết định 5 — Phần ngoài MVP

Nhóm I và phần tính deadline của Nhóm J nên được giữ trong catalog nhưng chưa triển khai cho đến khi năm mô-đun `Must` hoàn thành.

## 8. Mapping từ V2 sang CLIPS

Mỗi rule executable cần tuân theo mẫu:

```clips
(defrule R-B03-valid-will
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)
    (supports valid-intention=true valid-content-and-form=true))))
```

Checklist trước khi một rule V2 được chuyển sang `.clp`:

- [ ] Mọi biến đều gắn với `case-id` và subject phù hợp.
- [ ] Vế trái chỉ chứa domain facts hoặc derived facts cần thiết.
- [ ] Không có `analysis-request` trong domain rule.
- [ ] Không dùng Rule ID như một Boolean.
- [ ] Điều kiện `OR` đã được tách thành rules riêng.
- [ ] Mệnh đề phủ định không dựa vào absence nếu chưa có completeness.
- [ ] Kết luận có đúng phạm vi: case, person, will, asset hoặc estate portion.
- [ ] Rule metadata có căn cứ, mô tả, trạng thái `draft` và ghi chú review.
- [ ] Có test `true`, `false` hoặc non-activation, `unknown`, và `conflict` nếu có khả năng mâu thuẫn.

## 9. Trạng thái triển khai

| Phạm vi | Trạng thái |
|---|---|
| R-B01–R-B04 | Đã có vertical slice CLIPS theo kiến trúc V2 |
| R-B05–R-B09 | Đã triển khai CLIPS và regression tests; knowledge base vẫn là draft |
| R-A01–R-A06 | Đã triển khai theo từng phần di sản; các rule có nhãn `TEAM_REVIEW` chưa được phê duyệt |
| R-C01–R-C06 | Đã triển khai trên graph quan hệ, gồm phân loại ba hàng và chọn hàng hoạt động có completeness; R-C02, R-C03, R-C04, R-C06 chờ team review |
| R-D01–R-D05 | Đã triển khai theo từng người; R-D01 và R-D05 chờ team review |
| R-E01–R-E02 | Đã triển khai lát cắt thế vị trên graph; vẫn ở trạng thái `TEAM_REVIEW` |
| R-E03a–R-E03b | Đã triển khai căn cứ quan hệ con nuôi ở trạng thái `MODEL_READY`; chưa kết luận quyền hưởng cuối cùng |
| R-E04–R-E05 | Đã triển khai với đánh giá chăm sóc gắn theo cạnh; giữ `TEAM_REVIEW`, open-world và không phủ định căn cứ khác |
| Nhóm F–J | Đặc tả đề xuất để team review, chưa triển khai |
| Legal validation | Chưa thực hiện đầy đủ |

## 10. Câu hỏi dành cho buổi review team

1. Team có đồng ý tách `valid-will`, `will-effect-status` và hiệu lực của từng disposition không?
2. Team sẽ nhập facts hình thức chi tiết hay cho phép assessment tổng hợp trong giai đoạn đầu?
3. Ai hoặc nguồn nào được phép xác nhận `fact-set-complete=true`?
4. Có đồng ý coi rules tính tiền, deadline và quyết định của Tòa án là subsystem riêng ngoài MVP không?
5. Các Rule ID có giữ nguyên theo V1 và dùng hậu tố khi tách nhánh không?
6. Sau khi team duyệt mô hình, ai sẽ chịu trách nhiệm đối chiếu lần cuối với văn bản pháp luật chính thức?
