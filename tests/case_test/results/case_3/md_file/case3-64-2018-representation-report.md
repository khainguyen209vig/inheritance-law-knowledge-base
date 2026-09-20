# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case3-64-2018`
- File nguồn: `case3_64_2018_DS-ST.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Con hoặc cháu có được hưởng thế vị không?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **complete**

## Kết luận

- Quyền hưởng thế vị đối với Ong Ngo H1 (chau the vi ong S): Có. _(rules: `R-E01`)_
- Quyền hưởng thế vị đối với Ngo B (chau the vi ong S): Có. _(rules: `R-E01`)_

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
   - Supports: `deceased-person=true`, `biological-parent-of=ong-s`, `heir-life-status=dead-before-or-same`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTED-CHILD-WOULD-BE-ENTITLED`
2. **REPRESENTATION-CANDIDATE-QUALIFIED** — Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Ứng viên đủ điều kiện để đối sánh đường thế vị
   - Supports: `representation-candidate=true`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTATION-CANDIDATE-QUALIFIED`
3. **R-E01** — Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị.
   - Kết luận: Cháu được xác định là người thừa kế thế vị
   - Supports: `deceased-person=true`, `biological-parent-of=ong-s`, `biological-parent-of=ong-h1`, `REPRESENTED-CHILD-WOULD-BE-ENTITLED`, `REPRESENTATION-CANDIDATE-QUALIFIED`
   - Source: `rules/05-representation.clp#R-E01-grandchild-represents-child`
4. **REPRESENTATION-CANDIDATE-QUALIFIED** — Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Ứng viên đủ điều kiện để đối sánh đường thế vị
   - Supports: `representation-candidate=true`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`, `ELIGIBILITY-CLEAR`
   - Source: `rules/05-representation.clp#REPRESENTATION-CANDIDATE-QUALIFIED`
5. **R-E01** — Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị.
   - Kết luận: Cháu được xác định là người thừa kế thế vị
   - Supports: `deceased-person=true`, `biological-parent-of=ong-s`, `biological-parent-of=ngo-b`, `REPRESENTED-CHILD-WOULD-BE-ENTITLED`, `REPRESENTATION-CANDIDATE-QUALIFIED`
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
| c3-label-case | case3-64-2018 | estate-portion-label | Vu an 64/2018/DS-ST |
| c3-label-portion | di-san-dat | estate-portion-label | Di san quyen su dung dat 3 thua |
| c3-label-asset281 | thua-281 | estate-asset-label | Thua dat 281 |
| c3-label-asset235 | thua-235 | estate-asset-label | Thua dat 235 |
| c3-label-asset285 | thua-285 | estate-asset-label | Thua dat 285 |
| c3-label-req | req-chia-c3 | limitation-request-label | Yeu cau chia di san dat dai |
| c3-ongt-label | ong-t | person-label | Ong Ngo T (chet 1993) |
| c3-ongt-deceased | ong-t | deceased-person | true |
| c3-search-complete | case3-64-2018 | heir-search-complete | true |
| c3-has-will | case3-64-2018 | has-will | false |
| c3-portion-exists | di-san-dat | estate-portion | true |
| c3-bang-label | ba-ng | person-label | Ba Trung Ng (vo) |
| c3-bang-spouse | ba-ng | spouse-at-opening | ong-t |
| c3-bang-cand | ba-ng | heir-rank-candidate | true |
| c3-bang-life | ba-ng | heir-life-status | alive |
| c3-bang-elig | ba-ng | eligibility-candidate | true |
| c3-bang-rev | ba-ng | eligibility-review-complete | true |
| c3-bang-ref | ba-ng | valid-refusal | false |
| c3-ongm-label | ong-m | person-label | Ong Ngo M (con) |
| c3-ongm-edge | ong-t | biological-parent-of | ong-m |
| c3-ongm-cand | ong-m | heir-rank-candidate | true |
| c3-ongm-life | ong-m | heir-life-status | alive |
| c3-ongm-elig | ong-m | eligibility-candidate | true |
| c3-ongm-rev | ong-m | eligibility-review-complete | true |
| c3-ongm-ref | ong-m | valid-refusal | false |
| c3-ongm1-label | ong-m1 | person-label | Ong Ngo M1 (con) |
| c3-ongm1-edge | ong-t | biological-parent-of | ong-m1 |
| c3-ongm1-cand | ong-m1 | heir-rank-candidate | true |
| c3-ongm1-life | ong-m1 | heir-life-status | alive |
| c3-ongm1-elig | ong-m1 | eligibility-candidate | true |
| c3-ongm1-rev | ong-m1 | eligibility-review-complete | true |
| c3-ongm1-ref | ong-m1 | valid-refusal | false |
| c3-bab-label | ba-b | person-label | Ba Ngo Thi B (con - nguyen don) |
| c3-bab-edge | ong-t | biological-parent-of | ba-b |
| c3-bab-cand | ba-b | heir-rank-candidate | true |
| c3-bab-life | ba-b | heir-life-status | alive |
| c3-bab-elig | ba-b | eligibility-candidate | true |
| c3-bab-rev | ba-b | eligibility-review-complete | true |
| c3-bab-ref | ba-b | valid-refusal | false |
| c3-ongx-label | ong-x | person-label | Ong Ngo X (con - bi don) |
| c3-ongx-edge | ong-t | biological-parent-of | ong-x |
| c3-ongx-cand | ong-x | heir-rank-candidate | true |
| c3-ongx-life | ong-x | heir-life-status | alive |
| c3-ongx-elig | ong-x | eligibility-candidate | true |
| c3-ongx-rev | ong-x | eligibility-review-complete | true |
| c3-ongx-ref | ong-x | valid-refusal | false |
| c3-ongv-label | ong-v | person-label | Ong Ngo V (con - tu choi nhan di san) |
| c3-ongv-edge | ong-t | biological-parent-of | ong-v |
| c3-ongv-cand | ong-v | heir-rank-candidate | true |
| c3-ongv-life | ong-v | heir-life-status | alive |
| c3-ongv-elig | ong-v | eligibility-candidate | true |
| c3-ongv-rev | ong-v | eligibility-review-complete | true |
| c3-ongv-ref-scope | ong-v | refusal-assessment-subject | true |
| c3-ongv-ref-made | ong-v | refusal-made | true |
| c3-ongv-ref-intent | ong-v | refusal-intent | ordinary |
| c3-ongv-ref-written | ong-v | refusal-written | true |
| c3-ongv-ref-recip | ong-v | refusal-notice-recipient | other-heir |
| c3-ongv-ref-time | ong-v | refusal-before-estate-distribution | true |
| c3-ongv-ref-valid | ong-v | valid-refusal | true |
| c3-ongs-label | ong-s | person-label | Ong Ngo Thu S (con - chet) |
| c3-ongs-edge | ong-t | biological-parent-of | ong-s |
| c3-ongs-cand | ong-s | heir-rank-candidate | true |
| c3-ongs-life | ong-s | heir-life-status | dead-before-or-same |
| c3-ongs-elig | ong-s | eligibility-candidate | true |
| c3-ongs-rev | ong-s | eligibility-review-complete | true |
| c3-ongs-ref | ong-s | valid-refusal | false |
| c3-ngob-label | ngo-b | person-label | Ngo B (chau the vi ong S) |
| c3-ngob-edge | ong-s | biological-parent-of | ngo-b |
| c3-ngob-rep | ngo-b | representation-candidate | true |
| c3-ngob-life | ngo-b | heir-life-status | alive |
| c3-ngob-elig | ngo-b | eligibility-candidate | true |
| c3-ngob-rev | ngo-b | eligibility-review-complete | true |
| c3-ngob-ref | ngo-b | valid-refusal | false |
| c3-ongh1-label | ong-h1 | person-label | Ong Ngo H1 (chau the vi ong S) |
| c3-ongh1-edge | ong-s | biological-parent-of | ong-h1 |
| c3-ongh1-rep | ong-h1 | representation-candidate | true |
| c3-ongh1-life | ong-h1 | heir-life-status | alive |
| c3-ongh1-elig | ong-h1 | eligibility-candidate | true |
| c3-ongh1-rev | ong-h1 | eligibility-review-complete | true |
| c3-ongh1-ref | ong-h1 | valid-refusal | false |
| c3-limit-req | req-chia-c3 | limitation-assessment-subject | true |
| c3-limit-type | req-chia-c3 | request-type | divide-estate |
| c3-limit-asset | req-chia-c3 | asset-type | immovable |
| c3-limit-date | req-chia-c3 | inheritance-opening-date | 1993-10-28 |
| c3-vnd-calc | case3-64-2018 | estate-vnd-calculation | true |
| c3-ast-comp | case3-64-2018 | estate-asset-set-complete | true |
| c3-obl-comp | case3-64-2018 | estate-obligation-set-complete | true |
| c3-thua281-asset | thua-281 | estate-asset | true |
| c3-thua281-val | thua-281 | asset-value-vnd | 500000000 |
| c3-thua281-num | thua-281 | deceased-ownership-numerator | 1 |
| c3-thua281-den | thua-281 | deceased-ownership-denominator | 1 |

## Dữ kiện thiếu hoặc mâu thuẫn

Không ghi nhận dữ kiện bắt buộc còn thiếu hoặc xung đột.

> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.
