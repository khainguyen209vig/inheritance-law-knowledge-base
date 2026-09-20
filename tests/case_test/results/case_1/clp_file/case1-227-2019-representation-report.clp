; Quick Logic Test replay file

; knowledge-base: inheritance-kb-v21

; topic: representation

; question: Con hoặc cháu có được hưởng thế vị không?



(analysis-request
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (module representation))

(asserted-fact
  (fact-id c1-label-case)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate estate-portion-label)
  (value "Vu an 227/2019/DS-ST"))

(asserted-fact
  (fact-id c1-label-portion)
  (case-id case1-227-2019)
  (subject di-san-nha)
  (predicate estate-portion-label)
  (value "Di san nha 384/99/16 Ly Thai To"))

(asserted-fact
  (fact-id c1-label-asset)
  (case-id case1-227-2019)
  (subject can-nha-384)
  (predicate estate-asset-label)
  (value "Can nha 384/99/16 Ly Thai To"))

(asserted-fact
  (fact-id c1-label-req)
  (case-id case1-227-2019)
  (subject req-chia-c1)
  (predicate limitation-request-label)
  (value "Yeu cau chia di san can nha"))

(asserted-fact
  (fact-id c1-ngo-label)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate person-label)
  (value "Ong Tran Van Ngo (chet 1984)"))

(asserted-fact
  (fact-id c1-ngo-deceased)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate deceased-person)
  (value true))

(asserted-fact
  (fact-id c1-search-complete)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate heir-search-complete)
  (value true))

(asserted-fact
  (fact-id c1-has-will)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate has-will)
  (value false))

(asserted-fact
  (fact-id c1-portion-exists)
  (case-id case1-227-2019)
  (subject di-san-nha)
  (predicate estate-portion)
  (value true))

(asserted-fact
  (fact-id c1-them-label)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate person-label)
  (value "Ba Pham Thi Them (vo)"))

(asserted-fact
  (fact-id c1-them-spouse)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate spouse-at-opening)
  (value ong-ngo))

(asserted-fact
  (fact-id c1-them-cand)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-them-life)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-them-elig)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-them-rev)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-them-ref)
  (case-id case1-227-2019)
  (subject ba-them)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-bak-label)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate person-label)
  (value "Ba Tran Thi K (con)"))

(asserted-fact
  (fact-id c1-bak-edge)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate biological-parent-of)
  (value ba-k))

(asserted-fact
  (fact-id c1-bak-cand)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bak-life)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-bak-elig)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bak-rev)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-bak-ref)
  (case-id case1-227-2019)
  (subject ba-k)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-bad-label)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate person-label)
  (value "Ba Tran Thi D (con)"))

(asserted-fact
  (fact-id c1-bad-edge)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate biological-parent-of)
  (value ba-d))

(asserted-fact
  (fact-id c1-bad-cand)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bad-life)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-bad-elig)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bad-rev)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-bad-ref)
  (case-id case1-227-2019)
  (subject ba-d)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-ongq-label)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate person-label)
  (value "Ong Tran Van Q (con - nguyen don)"))

(asserted-fact
  (fact-id c1-ongq-edge)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate biological-parent-of)
  (value ong-q))

(asserted-fact
  (fact-id c1-ongq-cand)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-ongq-life)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-ongq-elig)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-ongq-rev)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-ongq-ref)
  (case-id case1-227-2019)
  (subject ong-q)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-baty-label)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate person-label)
  (value "Ba Tran Thi Ty (con - chet)"))

(asserted-fact
  (fact-id c1-baty-edge)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate biological-parent-of)
  (value ba-ty))

(asserted-fact
  (fact-id c1-baty-cand)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-baty-life)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate heir-life-status)
  (value dead-before-or-same))

(asserted-fact
  (fact-id c1-baty-elig)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-baty-rev)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-baty-ref)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-bap-label)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate person-label)
  (value "Ba Hoang Thanh P (chau the vi ba Ty)"))

(asserted-fact
  (fact-id c1-bap-edge)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate biological-parent-of)
  (value ba-p))

(asserted-fact
  (fact-id c1-bap-rep)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bap-life)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-bap-elig)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bap-rev)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-bap-ref)
  (case-id case1-227-2019)
  (subject ba-p)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-bal-label)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate person-label)
  (value "Ba Tran Thi Kim L (chau the vi ba Ty)"))

(asserted-fact
  (fact-id c1-bal-edge)
  (case-id case1-227-2019)
  (subject ba-ty)
  (predicate biological-parent-of)
  (value ba-l))

(asserted-fact
  (fact-id c1-bal-rep)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bal-life)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-bal-elig)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bal-rev)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-bal-ref)
  (case-id case1-227-2019)
  (subject ba-l)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-chinh-label)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate person-label)
  (value "Ong Tran Q Chinh (con - chet)"))

(asserted-fact
  (fact-id c1-chinh-edge)
  (case-id case1-227-2019)
  (subject ong-ngo)
  (predicate biological-parent-of)
  (value ong-chinh))

(asserted-fact
  (fact-id c1-chinh-cand)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c1-chinh-life)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate heir-life-status)
  (value dead-before-or-same))

(asserted-fact
  (fact-id c1-chinh-elig)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-chinh-rev)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-chinh-ref)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-ongt2-label)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate person-label)
  (value "Tran D T2 (chau the vi ong Chinh)"))

(asserted-fact
  (fact-id c1-ongt2-edge)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate biological-parent-of)
  (value ong-t2))

(asserted-fact
  (fact-id c1-ongt2-rep)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c1-ongt2-life)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-ongt2-elig)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-ongt2-rev)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-ongt2-ref)
  (case-id case1-227-2019)
  (subject ong-t2)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-bet1-label)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate person-label)
  (value "Tran Thanh T1 (chau the vi ong Chinh)"))

(asserted-fact
  (fact-id c1-bet1-edge)
  (case-id case1-227-2019)
  (subject ong-chinh)
  (predicate biological-parent-of)
  (value be-t1))

(asserted-fact
  (fact-id c1-bet1-rep)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bet1-life)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c1-bet1-elig)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c1-bet1-rev)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c1-bet1-ref)
  (case-id case1-227-2019)
  (subject be-t1)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c1-limit-req)
  (case-id case1-227-2019)
  (subject req-chia-c1)
  (predicate limitation-assessment-subject)
  (value true))

(asserted-fact
  (fact-id c1-limit-type)
  (case-id case1-227-2019)
  (subject req-chia-c1)
  (predicate request-type)
  (value divide-estate))

(asserted-fact
  (fact-id c1-limit-asset)
  (case-id case1-227-2019)
  (subject req-chia-c1)
  (predicate asset-type)
  (value immovable))

(asserted-fact
  (fact-id c1-limit-date)
  (case-id case1-227-2019)
  (subject req-chia-c1)
  (predicate inheritance-opening-date)
  (value "1984-01-01"))

(asserted-fact
  (fact-id c1-vnd-calc)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate estate-vnd-calculation)
  (value true))

(asserted-fact
  (fact-id c1-ast-comp)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate estate-asset-set-complete)
  (value true))

(asserted-fact
  (fact-id c1-obl-comp)
  (case-id case1-227-2019)
  (subject case1-227-2019)
  (predicate estate-obligation-set-complete)
  (value true))

(asserted-fact
  (fact-id c1-house-asset)
  (case-id case1-227-2019)
  (subject can-nha-384)
  (predicate estate-asset)
  (value true))

(asserted-fact
  (fact-id c1-house-val)
  (case-id case1-227-2019)
  (subject can-nha-384)
  (predicate asset-value-vnd)
  (value 5172000000))

(asserted-fact
  (fact-id c1-house-num)
  (case-id case1-227-2019)
  (subject can-nha-384)
  (predicate deceased-ownership-numerator)
  (value 1))

(asserted-fact
  (fact-id c1-house-den)
  (case-id case1-227-2019)
  (subject can-nha-384)
  (predicate deceased-ownership-denominator)
  (value 2))



; RESULT status=complete

; RESULT module=representation subject=ba-l inherits-by-representation=true rules=R-E01

; RESULT module=representation subject=ba-p inherits-by-representation=true rules=R-E01

; RESULT module=representation subject=be-t1 inherits-by-representation=true rules=R-E01

; RESULT module=representation subject=ong-t2 inherits-by-representation=true rules=R-E01

; TRACE-GROUP Quy tắc completeness nội bộ, không phải kết luận quyền hưởng cuối cùng | Điều 621. Người không được quyền hưởng di sản

; TRACE rule=ELIGIBILITY-CLEAR | Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất. => Không phát hiện căn cứ loại trừ trong phạm vi mô-đun

; TRACE rule=ELIGIBILITY-CLEAR | Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất. => Không phát hiện căn cứ loại trừ trong phạm vi mô-đun

; TRACE rule=ELIGIBILITY-CLEAR | Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất. => Không phát hiện căn cứ loại trừ trong phạm vi mô-đun

; TRACE rule=ELIGIBILITY-CLEAR | Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất. => Không phát hiện căn cứ loại trừ trong phạm vi mô-đun

; TRACE rule=ELIGIBILITY-CLEAR | Marker completeness cho biết các nhóm căn cứ Điều 621 đã được kiểm tra và không có căn cứ loại trừ nào được dẫn xuất. => Không phát hiện căn cứ loại trừ trong phạm vi mô-đun

; TRACE-GROUP Quy tắc kết nối Điều 621, Điều 651 và Điều 652 | Điều 652. Thừa kế thế vị

; TRACE rule=REPRESENTED-CHILD-WOULD-BE-ENTITLED | Người được thế vị là con ruột của người để lại di sản, chết trước hoặc cùng thời điểm và không bị loại theo Điều 621. => Đủ căn cứ trung gian để xét phần thế vị

; TRACE rule=REPRESENTATION-CANDIDATE-QUALIFIED | Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621. => Ứng viên đủ điều kiện để đối sánh đường thế vị

; TRACE rule=R-E01 | Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị. => Cháu được xác định là người thừa kế thế vị

; TRACE rule=REPRESENTATION-CANDIDATE-QUALIFIED | Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621. => Ứng viên đủ điều kiện để đối sánh đường thế vị

; TRACE rule=R-E01 | Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị. => Cháu được xác định là người thừa kế thế vị

; TRACE rule=REPRESENTATION-CANDIDATE-QUALIFIED | Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621. => Ứng viên đủ điều kiện để đối sánh đường thế vị

; TRACE rule=R-E01 | Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị. => Cháu được xác định là người thừa kế thế vị

; TRACE rule=REPRESENTATION-CANDIDATE-QUALIFIED | Ứng viên còn sống, không từ chối hợp lệ và không bị loại theo Điều 621. => Ứng viên đủ điều kiện để đối sánh đường thế vị

; TRACE rule=R-E01 | Graph thể hiện người con của người để lại di sản đã chết trước hoặc cùng thời điểm, còn người con của họ đủ điều kiện hưởng phần thế vị. => Cháu được xác định là người thừa kế thế vị

; TRACE-GROUP Quy tắc kết nối nội bộ | Bước kết nối của hệ thống

; TRACE rule=REFUSAL-STATUS-NORMALIZED | Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên, fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H. => Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F

; TRACE rule=REFUSAL-STATUS-NORMALIZED | Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên, fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H. => Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F

; TRACE rule=REFUSAL-STATUS-NORMALIZED | Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên, fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H. => Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F

; TRACE rule=REFUSAL-STATUS-NORMALIZED | Các mô-đun hạ nguồn dùng một predicate trung gian. Kết quả suy luận từ facts chi tiết nhóm H được ưu tiên, fact `valid-refusal` của hồ sơ cũ chỉ được chuyển tiếp khi chưa có assessment nhóm H. => Tạo trạng thái từ chối chuẩn hóa cho A/C/E/F
