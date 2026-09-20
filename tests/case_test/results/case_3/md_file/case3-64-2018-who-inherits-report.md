# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `case3-64-2018`
- File nguồn: `case3_64_2018_DS-ST.clp`
- Knowledge base: `inheritance-kb-v21`
- Câu hỏi: Ai có thể được hưởng di sản?
- Phạm vi: Tất cả chủ thể phù hợp
- Trạng thái: **complete**

## Kết luận

- Chế độ phân chia đối với Di san quyen su dung dat 3 thua: chia theo pháp luật. _(rules: `R-A01`)_
- Việc được gọi hưởng đối với Ba Trung Ng (vo): Có. _(rules: `R-C06`)_
- Việc được gọi hưởng đối với Ong Ngo M (con): Có. _(rules: `R-C06`)_
- Việc được gọi hưởng đối với Ong Ngo M1 (con): Có. _(rules: `R-C06`)_
- Việc được gọi hưởng đối với Ba Ngo Thi B (con - nguyen don): Có. _(rules: `R-C06`)_
- Việc được gọi hưởng đối với Ong Ngo X (con - bi don): Có. _(rules: `R-C06`)_
- Việc được gọi hưởng đối với Ong Ngo Thu S (con - chet): Không. _(rules: `STATUTORY-CANDIDATE-INACTIVE`)_
- Việc được gọi hưởng đối với Ong Ngo V (con - tu choi nhan di san): Không. _(rules: `STATUTORY-CANDIDATE-INACTIVE`)_
- Hàng thừa kế đối với Ba Trung Ng (vo): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ong Ngo M (con): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ong Ngo M1 (con): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ba Ngo Thi B (con - nguyen don): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ong Ngo X (con - bi don): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ong Ngo V (con - tu choi nhan di san): hàng thứ nhất. _(rules: `R-C01`)_
- Hàng thừa kế đối với Ong Ngo Thu S (con - chet): hàng thứ nhất. _(rules: `R-C01`)_
- Quyền hưởng thế vị đối với Ong Ngo H1 (chau the vi ong S): Có. _(rules: `R-E01`)_
- Quyền hưởng thế vị đối với Ngo B (chau the vi ong S): Có. _(rules: `R-E01`)_

## Quá trình suy luận

### Điều 650. Những trường hợp thừa kế theo pháp luật

Căn cứ: **Điều 649 và Điều 650 khoản 1 điểm a Bộ luật Dân sự 2015**

1. **R-A01** — Khi hồ sơ xác nhận người chết không để lại di chúc, phần di sản đang xét được xác định thuộc phạm vi thừa kế theo pháp luật.
   - Kết luận: Phần di sản áp dụng thừa kế theo pháp luật
   - Supports: `estate-portion=true`, `has-will=false`
   - Source: `rules/02-inheritance-type.clp#R-A01-no-will`

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
5. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`
6. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`
7. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
   - Kết luận: Không phát hiện căn cứ loại trừ trong phạm vi mô-đun
   - Supports: `eligibility-candidate=true`, `eligibility-review-complete=true`
   - Source: `rules/03-eligibility.clp#ELIGIBILITY-CLEAR`
8. **ELIGIBILITY-CLEAR** — Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất.
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
5. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
6. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `VALID-REFUSAL-COMPOSED`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
7. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`
8. **REFUSAL-STATUS-NORMALIZED** — Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên; fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H.
   - Kết luận: Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
   - Supports: `valid-refusal=false`
   - Source: `rules/08-refusal-and-unclaimed.clp#NORMALIZE-INFERRED-REFUSAL-STATUS`, `rules/08-refusal-and-unclaimed.clp#NORMALIZE-LEGACY-REFUSAL-STATUS`

### Điều 651. Người thừa kế theo pháp luật

Căn cứ: **Quy tắc kết nối nội bộ giữa Điều 621 và Điều 651**

1. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
2. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
3. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
4. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
5. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
6. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
7. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
8. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
9. **STATUTORY-CANDIDATE-QUALIFIED** — Ứng viên đã có hàng, còn sống, không từ chối hợp lệ và không bị loại theo Điều 621.
   - Kết luận: Đưa ứng viên vào tập xét hàng đang hoạt động
   - Supports: `ELIGIBILITY-CLEAR`, `heir-life-status=alive`, `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-QUALIFIED`
10. **R-C06** — Chỉ sau khi danh sách ứng viên được xác nhận đầy đủ, hệ thống chọn hàng thấp nhất còn người sống, không từ chối hợp lệ và không bị loại khỏi thừa kế theo pháp luật.
   - Kết luận: Người đủ điều kiện trong hàng đang hoạt động được gọi hưởng
   - Supports: `R-C06`, `STATUTORY-CANDIDATE-QUALIFIED`
   - Source: `rules/04-heir-rank.clp#R-C06-active-rank-one`, `rules/04-heir-rank.clp#R-C06-active-rank-two`, `rules/04-heir-rank.clp#R-C06-active-rank-three`, `rules/04-heir-rank.clp#R-C06-call-active-rank`
11. **STATUTORY-CANDIDATE-INACTIVE** — Ứng viên đã chết trước hoặc cùng thời điểm, từ chối hợp lệ, hoặc bị Điều 621 loại khỏi thừa kế theo pháp luật. Ngoại lệ được hưởng theo di chúc không làm người đó đủ điều kiện hưởng theo pháp luật.
   - Kết luận: Ứng viên không được gọi hưởng theo pháp luật
   - Supports: `heir-life-status=dead-before-or-same`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-ELIGIBILITY`, `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-LIFE`, `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-REFUSAL`
12. **STATUTORY-CANDIDATE-INACTIVE** — Ứng viên đã chết trước hoặc cùng thời điểm, từ chối hợp lệ, hoặc bị Điều 621 loại khỏi thừa kế theo pháp luật. Ngoại lệ được hưởng theo di chúc không làm người đó đủ điều kiện hưởng theo pháp luật.
   - Kết luận: Ứng viên không được gọi hưởng theo pháp luật
   - Supports: `REFUSAL-STATUS-NORMALIZED`
   - Source: `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-ELIGIBILITY`, `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-LIFE`, `rules/04-heir-rank.clp#STATUTORY-CANDIDATE-INACTIVE-REFUSAL`
13. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `spouse-at-opening=ong-t`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
14. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ong-m`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
15. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ong-m1`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
16. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ba-b`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
17. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ong-x`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
18. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ong-v`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`
19. **R-C01** — Quan hệ vợ/chồng tại thời điểm mở thừa kế, cha mẹ đẻ hoặc nuôi, và con đẻ hoặc nuôi đặt người đang xét vào nhóm ứng viên hàng thứ nhất. Kết luận này chưa tự động có nghĩa người đó được gọi hưởng.
   - Kết luận: Ứng viên thuộc hàng thừa kế thứ nhất
   - Supports: `deceased-person=true`, `heir-rank-candidate=true`, `biological-parent-of=ong-s`
   - Source: `rules/04-heir-rank.clp#R-C01-spouse`, `rules/04-heir-rank.clp#R-C01-spouse-reverse`, `rules/04-heir-rank.clp#R-C01-biological-parent`, `rules/04-heir-rank.clp#R-C01-adoptive-parent`, `rules/04-heir-rank.clp#R-C01-biological-child`, `rules/04-heir-rank.clp#R-C01-adoptive-child`

### Điều 620. Từ chối nhận di sản

Căn cứ: **Điều 620 khoản 1 Bộ luật Dân sự 2015**

1. **R-H01** — Người đang xét đã thể hiện việc từ chối và mục đích không nhằm trốn tránh thực hiện nghĩa vụ tài sản đối với người khác.
   - Kết luận: Điều kiện nội dung của việc từ chối đã đạt
   - Supports: `refusal-assessment-subject=true`, `refusal-made=true`, `refusal-intent=ordinary`
   - Source: `rules/08-refusal-and-unclaimed.clp#R-H01-substantive-condition-satisfied`
2. **R-H03** — Việc từ chối được lập thành văn bản và gửi đến người quản lý di sản, người thừa kế khác hoặc người được giao nhiệm vụ phân chia di sản.
   - Kết luận: Điều kiện hình thức và thông báo đã đạt
   - Supports: `refusal-made=true`, `refusal-written=true`, `refusal-notice-recipient=other-heir`
   - Source: `rules/08-refusal-and-unclaimed.clp#R-H03-form-condition-estate-manager`, `rules/08-refusal-and-unclaimed.clp#R-H03-form-condition-other-heir`, `rules/08-refusal-and-unclaimed.clp#R-H03-form-condition-distribution-assignee`
3. **VALID-REFUSAL-COMPOSED** — Điều kiện nội dung, hình thức/thông báo và thời điểm trước khi phân chia di sản đều đã đạt.
   - Kết luận: Việc từ chối hợp lệ
   - Supports: `R-H01`, `R-H03`, `refusal-before-estate-distribution=true`
   - Source: `rules/08-refusal-and-unclaimed.clp#VALID-REFUSAL-COMPOSED`

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
