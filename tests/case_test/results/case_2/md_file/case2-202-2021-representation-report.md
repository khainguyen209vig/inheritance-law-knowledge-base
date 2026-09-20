# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case2-202-2021`
- File nguồn: `case2_202_2021_DS-PT.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Con hoặc cháu có được hưởng thế vị không?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **complete**

## Kết luận

- Quyền hưởng thế vị đối với Anh Nguyen Thien DC (chau the vi ong Tac): Có. _(rules: `R-E01`)_
- Quyền hưởng thế vị đối với Anh Nguyen Thanh D (chau the vi ong Tac): Có. _(rules: `R-E01`)_

## Quá trình suy luận

### Điều 621. Người không được quyền hưởng di sản

Căn cứ: **Quy tắc completeness nội bộ; không phải kết luận quyền hưởng cuối cùng**

1. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`
2. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`
3. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`

### Điều 652. Thừa kế thế vị

Căn cứ: **Quy tắc kết nối Điều 621, Điều 651 và Điều 652**

1. **REPRESENTED-CHILD-WOULD-BE-ENTITLED** — Người được thế vị là con ruột của người để lại di sản, chết trước hoặc cùng thời điểm và không bị loại theo Điều 621.
   - Kết luận: Đủ căn cứ trung gian để xét phần thế vị
   - Supports: `deceased-person=true`, `biological-parent-of=ong-sang`, `heir-life-status=dead-before-or-same`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTED-CHILD-WOULD-BE-ENTITLED`
2. **REPRESENTATION-CANDIDATE-QUALIFIED** — Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Ứng viên đủ điều kiện để đối sánh đường thế vị
   - Supports: `representation-candidate=true`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTATION-CANDIDATE-QUALIFIED`
3. **R-E01** — Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị.
   - Kết luận: Cháu được xác định là người thừa kế thế vị
   - Supports: `deceased-person=true`, `biological-parent-of=ong-tac`, `biological-parent-of=anh-dc`, `REPRESENTED-CHILD-WOULD-BE-ENTITLED`, `REPRESENTATION-CANDIDATE-QUALIFIED`
   - Source: `rules/05-representation.clp#R-E01-grandchild-represents-child`
4. **REPRESENTATION-CANDIDATE-QUALIFIED** — Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Ứng viên đủ điều kiện để đối sánh đường thế vị
   - Supports: `representation-candidate=true`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTATION-CANDIDATE-QUALIFIED`
5. **R-E01** — Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị.
   - Kết luận: Cháu được xác định là người thừa kế thế vị
   - Supports: `deceased-person=true`, `biological-parent-of=ong-tac`, `biological-parent-of=anh-d`, `REPRESENTED-CHILD-WOULD-BE-ENTITLED`, `REPRESENTATION-CANDIDATE-QUALIFIED`
   - Source: `rules/05-representation.clp#R-E01-grandchild-represents-child`

### Bước kết nối của hệ thống

Căn cứ: **Quy tắc kết nối nội bộ**

1. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
2. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`

## Facts đầu vào

| Fact ID | Subject | Predicate | Value |
|---|---|---|---|
| c2-label-case | case2-202-2021 | estate-portion-label | Vu an 202/2021/DS-PT |
| c2-label-portion | di-san-dat-ao | estate-portion-label | Di san thua dat ao 238m2 Cat Dong |
| c2-label-asset | dat-ao-246 | estate-asset-label | Thua dat ao 246 to ban do 1 |
| c2-label-req | req-chia-c2 | limitation-request-label | Yeu cau chia thua ke dat ao |
| c2-luu-label | cu-luu | person-label | Cu Nguyen Van Luu (chet 1996) |
| c2-luu-deceased | cu-luu | deceased-person | true |
| c2-search-complete | case2-202-2021 | heir-search-complete | true |
| c2-has-will | case2-202-2021 | has-will | false |
| c2-portion-exists | di-san-dat-ao | estate-portion | true |
| c2-duc-label | cu-duc | person-label | Cu Nguyen Thi Duc (vo) |
| c2-duc-spouse | cu-duc | spouse-at-opening | cu-luu |
| c2-duc-cand | cu-duc | heir-rank-candidate | true |
| c2-duc-life | cu-duc | heir-life-status | alive |
| c2-duc-elig | cu-duc | eligibility-candidate | true |
| c2-duc-rev | cu-duc | eligibility-review-complete | true |
| c2-duc-ref | cu-duc | valid-refusal | false |
| c2-lt-label | ong-lt | person-label | Ong Nguyen Van LT (con - bi don) |
| c2-lt-edge | cu-luu | biological-parent-of | ong-lt |
| c2-lt-cand | ong-lt | heir-rank-candidate | true |
| c2-lt-life | ong-lt | heir-life-status | alive |
| c2-lt-elig | ong-lt | eligibility-candidate | true |
| c2-lt-rev | ong-lt | eligibility-review-complete | true |
| c2-lt-ref | ong-lt | valid-refusal | false |
| c2-bas-label | ba-s | person-label | Ba Nguyen Thi S (con) |
| c2-bas-edge | cu-luu | biological-parent-of | ba-s |
| c2-bas-cand | ba-s | heir-rank-candidate | true |
| c2-bas-life | ba-s | heir-life-status | alive |
| c2-bas-elig | ba-s | eligibility-candidate | true |
| c2-bas-rev | ba-s | eligibility-review-complete | true |
| c2-bas-ref | ba-s | valid-refusal | false |
| c2-bad-label | ba-d | person-label | Ba Nguyen Thi D (con) |
| c2-bad-edge | cu-luu | biological-parent-of | ba-d |
| c2-bad-cand | ba-d | heir-rank-candidate | true |
| c2-bad-life | ba-d | heir-life-status | alive |
| c2-bad-elig | ba-d | eligibility-candidate | true |
| c2-bad-rev | ba-d | eligibility-review-complete | true |
| c2-bad-ref | ba-d | valid-refusal | false |
| c2-bal-label | ba-l | person-label | Ba Nguyen Thi L (con - nguyen don) |
| c2-bal-edge | cu-luu | biological-parent-of | ba-l |
| c2-bal-cand | ba-l | heir-rank-candidate | true |
| c2-bal-life | ba-l | heir-life-status | alive |
| c2-bal-elig | ba-l | eligibility-candidate | true |
| c2-bal-rev | ba-l | eligibility-review-complete | true |
| c2-bal-ref | ba-l | valid-refusal | false |
| c2-sang-label | ong-sang | person-label | Ong Nguyen Van Sang (liet sy - khong con) |
| c2-sang-edge | cu-luu | biological-parent-of | ong-sang |
| c2-sang-cand | ong-sang | heir-rank-candidate | true |
| c2-sang-life | ong-sang | heir-life-status | dead-before-or-same |
| c2-sang-elig | ong-sang | eligibility-candidate | true |
| c2-sang-rev | ong-sang | eligibility-review-complete | true |
| c2-sang-ref | ong-sang | valid-refusal | false |
| c2-tac-label | ong-tac | person-label | Ong Nguyen Van Tac (con - chet) |
| c2-tac-edge | cu-luu | biological-parent-of | ong-tac |
| c2-tac-cand | ong-tac | heir-rank-candidate | true |
| c2-tac-life | ong-tac | heir-life-status | dead-before-or-same |
| c2-tac-elig | ong-tac | eligibility-candidate | true |
| c2-tac-rev | ong-tac | eligibility-review-complete | true |
| c2-tac-ref | ong-tac | valid-refusal | false |
| c2-anhd-label | anh-d | person-label | Anh Nguyen Thanh D (chau the vi ong Tac) |
| c2-anhd-edge | ong-tac | biological-parent-of | anh-d |
| c2-anhd-rep | anh-d | representation-candidate | true |
| c2-anhd-life | anh-d | heir-life-status | alive |
| c2-anhd-elig | anh-d | eligibility-candidate | true |
| c2-anhd-rev | anh-d | eligibility-review-complete | true |
| c2-anhd-ref | anh-d | valid-refusal | false |
| c2-anhdc-label | anh-dc | person-label | Anh Nguyen Thien DC (chau the vi ong Tac) |
| c2-anhdc-edge | ong-tac | biological-parent-of | anh-dc |
| c2-anhdc-rep | anh-dc | representation-candidate | true |
| c2-anhdc-life | anh-dc | heir-life-status | alive |
| c2-anhdc-elig | anh-dc | eligibility-candidate | true |
| c2-anhdc-rev | anh-dc | eligibility-review-complete | true |
| c2-anhdc-ref | anh-dc | valid-refusal | false |
| c2-limit-req | req-chia-c2 | limitation-assessment-subject | true |
| c2-limit-type | req-chia-c2 | request-type | divide-estate |
| c2-limit-asset | req-chia-c2 | asset-type | immovable |
| c2-limit-date | req-chia-c2 | inheritance-opening-date | 1996-11-02 |
| c2-vnd-calc | case2-202-2021 | estate-vnd-calculation | true |
| c2-ast-comp | case2-202-2021 | estate-asset-set-complete | true |
| c2-obl-comp | case2-202-2021 | estate-obligation-set-complete | true |
| c2-datao-asset | dat-ao-246 | estate-asset | true |
| c2-datao-val | dat-ao-246 | asset-value-vnd | 833000000 |
| c2-datao-num | dat-ao-246 | deceased-ownership-numerator | 1 |
| c2-datao-den | dat-ao-246 | deceased-ownership-denominator | 1 |

## Dữ kiện thiếu hoặc mâu thuẫn

Không ghi nhận dữ kiện bắt buộc còn thiếu hoặc xung đột.

> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.
