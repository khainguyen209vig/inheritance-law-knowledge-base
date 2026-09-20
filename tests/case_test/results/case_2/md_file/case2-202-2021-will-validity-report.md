# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case2-202-2021`
- File nguồn: `case2_202_2021_DS-PT.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Di chúc có hợp pháp không?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **missing-facts**

## Kết luận

- Chưa đủ căn cứ để kết luận valid will đối với Vu an 202/2021/DS-PT. _(rules: `SYSTEM-INCOMPLETE`)_

## Quá trình suy luận

### Kiểm tra của hệ thống

Căn cứ: **Quy tắc kiểm soát nhất quán và tính đầy đủ**

1. **SYSTEM-INCOMPLETE** — Hệ thống còn ít nhất một dữ kiện bắt buộc chưa được cung cấp và chưa có kết luận hợp pháp, không hợp pháp hoặc mâu thuẫn.
   - Kết luận: Kết quả chưa xác định
   - Supports: không có trace chi tiết
   - Source: `rules/99-result-projection.clp#project-unknown-will-validity`

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

- `will-validity` · `case2-202-2021` · `will-type`: Cần bổ sung will type cho Vu an 202/2021/DS-PT.
- `will-validity` · `case2-202-2021` · `testator-mental-state`: Cần bổ sung testator mental state cho Vu an 202/2021/DS-PT.
- `will-validity` · `case2-202-2021` · `undue-influence`: Cần bổ sung undue influence cho Vu an 202/2021/DS-PT.
- `will-validity` · `case2-202-2021` · `prohibited-content`: Cần bổ sung prohibited content cho Vu an 202/2021/DS-PT.

> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.
