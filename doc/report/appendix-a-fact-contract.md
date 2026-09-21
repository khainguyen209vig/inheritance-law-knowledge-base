# Phụ lục A. Fact contract và từ điển predicate

## A.1. Các loại fact dùng chung

Fact contract gốc nằm tại [`knowledge-base/templates.clp`](../../knowledge-base/templates.clp). Hệ thống phân biệt rõ dữ kiện đầu vào, tri thức dẫn xuất, yêu cầu bổ sung, kết quả công khai và dấu vết giải thích.

| Template | Mục đích | Trường chính |
|---|---|---|
| `analysis-request` | Chọn case, subject và mô-đun cần projection | `case-id`, `subject`, `module` |
| `asserted-fact` | Observation nguyên tử từ người dùng, tài liệu hoặc hệ thống | `fact-id`, `case-id`, `subject`, `predicate`, `value`, `source` |
| `derived-fact` | Kết luận do domain rule sinh kèm provenance | `case-id`, `subject`, `predicate`, `value`, `rule-id`, `supports` |
| `rule-metadata` | Metadata của Rule ID được nạp vào CLIPS | `rule-id`, `module`, `legal-source`, `description`, `status` |
| `missing-requirement` | Dữ kiện còn thiếu do completeness rule tạo | `case-id`, `subject`, `module`, `predicate` |
| `module-result` | Kết quả công khai đã được projection cho câu hỏi | `case-id`, `subject`, `module`, `predicate`, `value`, `derivations` |
| `inference-trace` | Bản ghi giải thích thống nhất từ derived fact | `case-id`, `subject`, `rule-id`, `conclusion-predicate`, `conclusion-value`, `supports` |

`asserted-fact.value` và `derived-fact.value` chấp nhận `SYMBOL`, `INTEGER`, `FLOAT` hoặc `STRING`. `source` chỉ nhận `user`, `document` hoặc `system`. Kết luận pháp lý không được nhập trực tiếp bằng `asserted-fact`; chúng phải được sinh bởi rule.

## A.2. Quy ước định danh

- `case-id`, `fact-id` và các subject dạng symbol bắt đầu bằng chữ thường, sau đó chỉ dùng chữ thường, số hoặc dấu gạch ngang, tối đa 64 ký tự.
- `fact-id` duy nhất trong một hồ sơ và được dùng trong `supports`.
- `subject` xác định đối tượng của mệnh đề; cùng một case có thể có nhiều người, phần di sản, tài sản hoặc yêu cầu thời hiệu.
- Predicate được kiểm tra bằng allow-list sinh từ union schema của mười mô-đun TypeScript.
- Chuỗi nhãn, ngày và các giá trị cần giữ khoảng trắng được serializer đặt trong dấu nháy kép và escape trước khi chuyển sang CLIPS.

## A.3. Từ điển predicate theo nhóm chức năng

| Nhóm | Predicate tiêu biểu | Ý nghĩa |
|---|---|---|
| Di chúc | `will-type`, `testator-mental-state`, `undue-influence`, `formal-defect`, `witness-count` | Observation về ý chí, nội dung và hình thức di chúc |
| Loại thừa kế | `has-will`, `estate-portion`, `applicable-will`, `portion-disposed`, `disposition-status` | Xác định phần di sản chia theo di chúc hay pháp luật |
| Quyền hưởng | `eligibility-candidate`, `eligibility-review-complete`, các observation hành vi Điều 621 | Xác định căn cứ loại trừ hoặc ngoại lệ theo ý chí người chết |
| Quan hệ và hàng thừa kế | `deceased-person`, `spouse-at-opening`, `biological-parent-of`, `adoptive-parent-of`, `heir-life-status` | Biểu diễn graph gia đình và trạng thái ứng viên |
| Thế vị | `representation-candidate`, `step-parent-of`, `step-care-status` | Biểu diễn đường thế vị và quan hệ đặc biệt |
| Suất bắt buộc | `compulsory-share-assessment-subject`, `age-group`, `work-capacity-status`, các predicate tính suất | Xác định diện bảo vệ và phần còn thiếu |
| Từ chối | `refusal-made`, `refusal-intent`, `refusal-written`, `refusal-notice-recipient`, `valid-refusal` | Observation và trạng thái chuẩn hóa của việc từ chối |
| Di sản và nghĩa vụ | `estate-asset`, `asset-value-vnd`, tỷ lệ sở hữu, `estate-obligation`, `obligation-type` | Tính giá trị thuộc di sản và nghĩa vụ phải thanh toán |
| Phân chia | `testamentary-distribution-group`, `distribution-beneficiary`, các predicate thai nhi/hạn chế chia | Điều kiện chia, dành phần và trì hoãn phân chia |
| Thời hiệu | `request-type`, `asset-type`, `inheritance-opening-date`, các predicate sau thời hiệu | Chọn thời hạn và đánh giá người nhận sau khi hết thời hiệu |
| Nhãn hiển thị | `person-label`, `heir-person-label`, `estate-portion-label`, `estate-asset-label` | Tách định danh kỹ thuật khỏi nội dung trình bày |
| Completeness | Các predicate `*-search-complete`, `*-set-complete`, `*-assessment-subject` | Xác nhận phạm vi đã được rà soát, tránh suy diễn từ sự vắng mặt |

## A.4. Danh sách predicate đầu vào được runtime chấp nhận

Danh sách dưới đây được trích từ `caseFactSchema` tại thời điểm biên soạn. Đây là allow-list đầu vào; các predicate dẫn xuất nội bộ không nhất thiết xuất hiện trong danh sách.

```text
adoptive-parent-of, age-group, all-heirs-agreed,
alternative-share-agreement, applicable-will,
article-236-qualified-possessor, asset-type, asset-value-vnd,
beneficiary-disqualified, beneficiary-kind, beneficiary-life-status,
biological-parent-of, calculation-estate-portion, calculation-person,
certified-within-days, compulsory-share-assessment-subject,
compulsory-share-calculation, convicted-abuse-against-deceased,
convicted-intentional-offense-against-deceased,
convicted-offense-against-other-heir, deceased-knew-disqualifying-act,
deceased-ownership-denominator, deceased-ownership-numerator,
deceased-person, disposition-beneficiary, disposition-set-complete,
disposition-status, disqualification-exception, distribution-beneficiary,
distribution-beneficiary-label, distribution-beneficiary-set-complete,
distribution-group-label, division-hardship-assessment-subject,
division-restriction-assessment-subject, division-restriction-basis,
divorce-decision-effective-at-opening, divorce-petition-pending-at-opening,
eligibility-applicable-will, eligibility-candidate,
eligibility-review-complete, estate-asset, estate-asset-label,
estate-asset-set-complete, estate-division-requested,
estate-managing-heir, estate-obligation, estate-obligation-set-complete,
estate-portion, estate-portion-label, estate-vnd-calculation,
formal-defect, guardian-consent, has-will, heir-life-status,
heir-person-label, heir-rank-candidate, heir-search-complete,
hypothetical-statutory-share, improper-benefit-intent,
inheritance-benefit-motive, inheritance-opening-date,
joint-property-divided, limitation-assessment-subject,
limitation-expiry-confirmed, limitation-request-label,
managing-heir-search-complete, named-in-will-after-knowledge,
notarized-or-certified, obligation-amount, obligation-amount-vnd,
obligation-label, obligation-type, person-label, physical-limitation,
portion-disposed, post-limitation-assessment-subject,
prenatal-birth-outcome, prenatal-share-assessment-subject,
prenatal-status-at-distribution, prepared-by-witness,
prior-court-deferral-expired, prohibited-content,
qualified-possessor-search-complete, refusal-assessment-subject,
refusal-before-estate-distribution, refusal-intent, refusal-made,
refusal-notice-recipient, refusal-written, remaining-estate-after-obligations,
remarried-after-opening, representation-candidate, request-type,
serious-division-impact, serious-impact-still-exists,
serious-support-duty-violation, specified-division-date,
spouse-at-opening, spouse-status-assessment-subject, step-care-status,
step-parent-of, testamentary-beneficiary-search-complete,
testamentary-distribution-group, testamentary-share-received,
testamentary-share-received-vnd, testamentary-shares-specified,
testator-age, testator-alive-after-three-months, testator-literacy,
testator-mental-state, testator-mental-state-after-three-months,
unclaimed-estate-assessment-subject, undue-influence, valid-refusal,
will-document-interference, will-interference, will-type, witness-count,
witnesses-recorded, witnesses-signed, work-capacity-status
```

Schema kiểu và miền giá trị chi tiết được định nghĩa tại [`src/domain/case.ts`](../../src/domain/case.ts) và các tệp miền mà file này hợp nhất. Quick Logic Test áp dụng thêm grammar và giới hạn tại [`doc/Quick_Logic_Test_CLP_Format.md`](../Quick_Logic_Test_CLP_Format.md).
