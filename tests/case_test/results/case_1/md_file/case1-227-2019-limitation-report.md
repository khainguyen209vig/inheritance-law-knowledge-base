# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case1-227-2019`
- File nguồn: `case1_227_2019_DS-ST.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Còn thời hiệu yêu cầu về thừa kế không?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **complete**

## Kết luận

- Thời hiệu áp dụng đối với Yeu cau chia di san can nha: 30. _(rules: `R-J01`)_
- Ngày kết thúc thời hiệu đối với Yeu cau chia di san can nha: 2014-01-01. _(rules: `R-J01`)_

## Quá trình suy luận

### Điều 623. Thời hiệu thừa kế

Căn cứ: **Điều 623 khoản 1 Bộ luật Dân sự 2015**

1. **R-J01** — Yêu cầu đang xét là yêu cầu chia một di sản bất động sản, nên CLIPS chọn thời hạn ba mươi năm kể từ thời điểm mở thừa kế. Temporal helper chỉ cộng số năm vào ngày mở thừa kế.
   - Kết luận: Thời hiệu yêu cầu chia di sản là ba mươi năm
   - Supports: `limitation-assessment-subject=true`, `request-type=divide-estate`, `asset-type=immovable`
   - Source: `rules/10-limitation.clp#R-J01-immovable-estate-division-period`

## Facts đầu vào

| Fact ID | Subject | Predicate | Value |
|---|---|---|---|
| c1-label-case | case1-227-2019 | estate-portion-label | Vu an 227/2019/DS-ST |
| c1-label-portion | di-san-nha | estate-portion-label | Di san nha 384/99/16 Ly Thai To |
| c1-label-asset | can-nha-384 | estate-asset-label | Can nha 384/99/16 Ly Thai To |
| c1-label-req | req-chia-c1 | limitation-request-label | Yeu cau chia di san can nha |
| c1-ngo-label | ong-ngo | person-label | Ong Tran Van Ngo (chet 1984) |
| c1-ngo-deceased | ong-ngo | deceased-person | true |
| c1-search-complete | case1-227-2019 | heir-search-complete | true |
| c1-has-will | case1-227-2019 | has-will | false |
| c1-portion-exists | di-san-nha | estate-portion | true |
| c1-them-label | ba-them | person-label | Ba Pham Thi Them (vo) |
| c1-them-spouse | ba-them | spouse-at-opening | ong-ngo |
| c1-them-cand | ba-them | heir-rank-candidate | true |
| c1-them-life | ba-them | heir-life-status | alive |
| c1-them-elig | ba-them | eligibility-candidate | true |
| c1-them-rev | ba-them | eligibility-review-complete | true |
| c1-them-ref | ba-them | valid-refusal | false |
| c1-bak-label | ba-k | person-label | Ba Tran Thi K (con) |
| c1-bak-edge | ong-ngo | biological-parent-of | ba-k |
| c1-bak-cand | ba-k | heir-rank-candidate | true |
| c1-bak-life | ba-k | heir-life-status | alive |
| c1-bak-elig | ba-k | eligibility-candidate | true |
| c1-bak-rev | ba-k | eligibility-review-complete | true |
| c1-bak-ref | ba-k | valid-refusal | false |
| c1-bad-label | ba-d | person-label | Ba Tran Thi D (con) |
| c1-bad-edge | ong-ngo | biological-parent-of | ba-d |
| c1-bad-cand | ba-d | heir-rank-candidate | true |
| c1-bad-life | ba-d | heir-life-status | alive |
| c1-bad-elig | ba-d | eligibility-candidate | true |
| c1-bad-rev | ba-d | eligibility-review-complete | true |
| c1-bad-ref | ba-d | valid-refusal | false |
| c1-ongq-label | ong-q | person-label | Ong Tran Van Q (con - nguyen don) |
| c1-ongq-edge | ong-ngo | biological-parent-of | ong-q |
| c1-ongq-cand | ong-q | heir-rank-candidate | true |
| c1-ongq-life | ong-q | heir-life-status | alive |
| c1-ongq-elig | ong-q | eligibility-candidate | true |
| c1-ongq-rev | ong-q | eligibility-review-complete | true |
| c1-ongq-ref | ong-q | valid-refusal | false |
| c1-baty-label | ba-ty | person-label | Ba Tran Thi Ty (con - chet) |
| c1-baty-edge | ong-ngo | biological-parent-of | ba-ty |
| c1-baty-cand | ba-ty | heir-rank-candidate | true |
| c1-baty-life | ba-ty | heir-life-status | dead-before-or-same |
| c1-baty-elig | ba-ty | eligibility-candidate | true |
| c1-baty-rev | ba-ty | eligibility-review-complete | true |
| c1-baty-ref | ba-ty | valid-refusal | false |
| c1-bap-label | ba-p | person-label | Ba Hoang Thanh P (chau the vi ba Ty) |
| c1-bap-edge | ba-ty | biological-parent-of | ba-p |
| c1-bap-rep | ba-p | representation-candidate | true |
| c1-bap-life | ba-p | heir-life-status | alive |
| c1-bap-elig | ba-p | eligibility-candidate | true |
| c1-bap-rev | ba-p | eligibility-review-complete | true |
| c1-bap-ref | ba-p | valid-refusal | false |
| c1-bal-label | ba-l | person-label | Ba Tran Thi Kim L (chau the vi ba Ty) |
| c1-bal-edge | ba-ty | biological-parent-of | ba-l |
| c1-bal-rep | ba-l | representation-candidate | true |
| c1-bal-life | ba-l | heir-life-status | alive |
| c1-bal-elig | ba-l | eligibility-candidate | true |
| c1-bal-rev | ba-l | eligibility-review-complete | true |
| c1-bal-ref | ba-l | valid-refusal | false |
| c1-chinh-label | ong-chinh | person-label | Ong Tran Q Chinh (con - chet) |
| c1-chinh-edge | ong-ngo | biological-parent-of | ong-chinh |
| c1-chinh-cand | ong-chinh | heir-rank-candidate | true |
| c1-chinh-life | ong-chinh | heir-life-status | dead-before-or-same |
| c1-chinh-elig | ong-chinh | eligibility-candidate | true |
| c1-chinh-rev | ong-chinh | eligibility-review-complete | true |
| c1-chinh-ref | ong-chinh | valid-refusal | false |
| c1-ongt2-label | ong-t2 | person-label | Tran D T2 (chau the vi ong Chinh) |
| c1-ongt2-edge | ong-chinh | biological-parent-of | ong-t2 |
| c1-ongt2-rep | ong-t2 | representation-candidate | true |
| c1-ongt2-life | ong-t2 | heir-life-status | alive |
| c1-ongt2-elig | ong-t2 | eligibility-candidate | true |
| c1-ongt2-rev | ong-t2 | eligibility-review-complete | true |
| c1-ongt2-ref | ong-t2 | valid-refusal | false |
| c1-bet1-label | be-t1 | person-label | Tran Thanh T1 (chau the vi ong Chinh) |
| c1-bet1-edge | ong-chinh | biological-parent-of | be-t1 |
| c1-bet1-rep | be-t1 | representation-candidate | true |
| c1-bet1-life | be-t1 | heir-life-status | alive |
| c1-bet1-elig | be-t1 | eligibility-candidate | true |
| c1-bet1-rev | be-t1 | eligibility-review-complete | true |
| c1-bet1-ref | be-t1 | valid-refusal | false |
| c1-limit-req | req-chia-c1 | limitation-assessment-subject | true |
| c1-limit-type | req-chia-c1 | request-type | divide-estate |
| c1-limit-asset | req-chia-c1 | asset-type | immovable |
| c1-limit-date | req-chia-c1 | inheritance-opening-date | 1984-01-01 |
| c1-vnd-calc | case1-227-2019 | estate-vnd-calculation | true |
| c1-ast-comp | case1-227-2019 | estate-asset-set-complete | true |
| c1-obl-comp | case1-227-2019 | estate-obligation-set-complete | true |
| c1-house-asset | can-nha-384 | estate-asset | true |
| c1-house-val | can-nha-384 | asset-value-vnd | 5172000000 |
| c1-house-num | can-nha-384 | deceased-ownership-numerator | 1 |
| c1-house-den | can-nha-384 | deceased-ownership-denominator | 2 |

## Dữ kiện thiếu hoặc mâu thuẫn

Không ghi nhận dữ kiện bắt buộc còn thiếu hoặc xung đột.

> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.
