# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case1-227-2019`
- File nguồn: `case1_227_2019_DS-ST.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Di sản và nghĩa vụ được thanh toán hoặc chia thế nào?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **complete**

## Kết luận

- Phần dư chưa phân bổ (VNĐ) đối với Vu an 227/2019/DS-ST: 0. _(rules: `R-C04`)_
- Suất pháp luật giả định (VNĐ) đối với Ong Tran Van Q (con - nguyen don): 646500000. _(rules: `R-C04`)_
- Suất pháp luật giả định (VNĐ) đối với Ba Tran Thi D (con): 646500000. _(rules: `R-C04`)_
- Suất pháp luật giả định (VNĐ) đối với Ba Tran Thi K (con): 646500000. _(rules: `R-C04`)_
- Suất pháp luật giả định (VNĐ) đối với Ba Pham Thi Them (vo): 646500000. _(rules: `R-C04`)_
- Số người trong hàng được gọi hưởng đối với Vu an 227/2019/DS-ST: 4. _(rules: `ESTATE-VND-TOTALS`)_
- Di sản có thể phân chia (VNĐ) đối với Vu an 227/2019/DS-ST: 2586000000. _(rules: `ESTATE-VND-TOTALS`)_
- Tổng nghĩa vụ (VNĐ) đối với Vu an 227/2019/DS-ST: 0. _(rules: `ESTATE-VND-TOTALS`)_
- Tổng di sản gộp (VNĐ) đối với Vu an 227/2019/DS-ST: 2586000000. _(rules: `ESTATE-VND-TOTALS`)_
- Giá trị thuộc di sản (VNĐ) đối với Can nha 384/99/16 Ly Thai To: 2586000000. _(rules: `ESTATE-VND-ASSET`)_

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
4. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`

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
3. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
4. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
5. **ESTATE-VND-ASSET** — Từ giá trị định giá bằng VNĐ và tỷ lệ sở hữu đã được xác nhận, hệ thống tính phần giá trị thuộc di sản bằng phép chia số nguyên. Phần nhỏ hơn một VNĐ được ghi riêng và không tự phân bổ.
   - Kết luận: Xác định giá trị bằng VNĐ thuộc khối di sản
   - Supports: `estate-asset=true`, `asset-value-vnd=5172000000`, `deceased-ownership-numerator=1`, `deceased-ownership-denominator=2`
   - Source: `rules/11-estate-vnd.clp#ESTATE-VND-ASSET-calculate-owned-value`, `rules/11-estate-vnd.clp#ESTATE-VND-ASSET-record-sub-vnd-remainder`

### Điều 651. Người thừa kế theo pháp luật

Căn cứ: **Quy tắc kết nối nội bộ giữa Điều 621 và Điều 651**

1. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
2. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `heir-search-complete=true`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
3. **R-C04** — Khi có từ hai người trở lên cùng được gọi hưởng ở hàng đang hoạt động, hệ thống ghi nhận nguyên tắc cùng hàng hưởng phần bằng nhau. Nếu lát cắt VNĐ có di sản ròng và tập người hưởng đầy đủ, hệ thống tính suất bằng phép chia nguyên và công bố phần dư.
   - Kết luận: Áp dụng nguyên tắc cùng hàng hưởng phần bằng nhau và tùy chọn tính suất VNĐ
   - Supports: `R-C06`, `R-C06`
   - Source: `rules/04-heir-rank.clp#R-C04-equal-share-principle`, `rules/11-estate-vnd.clp#R-C04-calculate-equal-statutory-share-vnd`, `rules/11-estate-vnd.clp#R-C04-record-statutory-division-remainder-vnd`
4. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
5. **R-C04** — Khi có từ hai người trở lên cùng được gọi hưởng ở hàng đang hoạt động, hệ thống ghi nhận nguyên tắc cùng hàng hưởng phần bằng nhau. Nếu lát cắt VNĐ có di sản ròng và tập người hưởng đầy đủ, hệ thống tính suất bằng phép chia nguyên và công bố phần dư.
   - Kết luận: Áp dụng nguyên tắc cùng hàng hưởng phần bằng nhau và tùy chọn tính suất VNĐ
   - Supports: `ESTATE-VND-TOTALS`, `ESTATE-VND-TOTALS`, `R-C06`
   - Source: `rules/04-heir-rank.clp#R-C04-equal-share-principle`, `rules/11-estate-vnd.clp#R-C04-calculate-equal-statutory-share-vnd`, `rules/11-estate-vnd.clp#R-C04-record-statutory-division-remainder-vnd`
6. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
7. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
8. **R-C04** — Khi có từ hai người trở lên cùng được gọi hưởng ở hàng đang hoạt động, hệ thống ghi nhận nguyên tắc cùng hàng hưởng phần bằng nhau. Nếu lát cắt VNĐ có di sản ròng và tập người hưởng đầy đủ, hệ thống tính suất bằng phép chia nguyên và công bố phần dư.
   - Kết luận: Áp dụng nguyên tắc cùng hàng hưởng phần bằng nhau và tùy chọn tính suất VNĐ
   - Supports: `ESTATE-VND-TOTALS`, `ESTATE-VND-TOTALS`, `R-C06`
   - Source: `rules/04-heir-rank.clp#R-C04-equal-share-principle`, `rules/11-estate-vnd.clp#R-C04-calculate-equal-statutory-share-vnd`, `rules/11-estate-vnd.clp#R-C04-record-statutory-division-remainder-vnd`
9. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
10. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
11. **R-C04** — Khi có từ hai người trở lên cùng được gọi hưởng ở hàng đang hoạt động, hệ thống ghi nhận nguyên tắc cùng hàng hưởng phần bằng nhau. Nếu lát cắt VNĐ có di sản ròng và tập người hưởng đầy đủ, hệ thống tính suất bằng phép chia nguyên và công bố phần dư.
   - Kết luận: Áp dụng nguyên tắc cùng hàng hưởng phần bằng nhau và tùy chọn tính suất VNĐ
   - Supports: `ESTATE-VND-TOTALS`, `ESTATE-VND-TOTALS`, `R-C06`
   - Source: `rules/04-heir-rank.clp#R-C04-equal-share-principle`, `rules/11-estate-vnd.clp#R-C04-calculate-equal-statutory-share-vnd`, `rules/11-estate-vnd.clp#R-C04-record-statutory-division-remainder-vnd`
12. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
13. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
14. **R-C04** — Khi có từ hai người trở lên cùng được gọi hưởng ở hàng đang hoạt động, hệ thống ghi nhận nguyên tắc cùng hàng hưởng phần bằng nhau. Nếu lát cắt VNĐ có di sản ròng và tập người hưởng đầy đủ, hệ thống tính suất bằng phép chia nguyên và công bố phần dư.
   - Kết luận: Áp dụng nguyên tắc cùng hàng hưởng phần bằng nhau và tùy chọn tính suất VNĐ
   - Supports: `ESTATE-VND-TOTALS`, `ESTATE-VND-TOTALS`, `R-C06`
   - Source: `rules/04-heir-rank.clp#R-C04-equal-share-principle`, `rules/11-estate-vnd.clp#R-C04-calculate-equal-statutory-share-vnd`, `rules/11-estate-vnd.clp#R-C04-record-statutory-division-remainder-vnd`

### Điều 658. Thứ tự ưu tiên thanh toán

Căn cứ: **Quy tắc tính toán nội bộ; kết nối thứ tự nghĩa vụ tại Điều 658**

1. **ESTATE-VND-TOTALS** — Sau khi tập tài sản và nghĩa vụ được xác nhận đầy đủ, hệ thống cộng phần giá trị thuộc di sản, cộng nghĩa vụ và lấy phần chênh lệch không âm làm di sản có thể phân chia.
   - Kết luận: Xác định tổng di sản, tổng nghĩa vụ và di sản ròng bằng VNĐ
   - Supports: `ESTATE-VND-TOTALS`, `ESTATE-VND-TOTALS`
   - Source: `rules/11-estate-vnd.clp#ESTATE-VND-TOTALS-calculate-gross-estate`, `rules/11-estate-vnd.clp#ESTATE-VND-TOTALS-no-obligations`, `rules/11-estate-vnd.clp#ESTATE-VND-TOTALS-calculate-obligations`, `rules/11-estate-vnd.clp#ESTATE-VND-TOTALS-calculate-net-estate`, `rules/11-estate-vnd.clp#ESTATE-VND-TOTALS-count-statutory-heirs`

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
