(analysis-request (case-id case-07) (subject case-07) (module estate-settlement))

; Nguoi de lai di san
(asserted-fact (fact-id f-deceased-person) (case-id case-07) (subject deceased-b) (predicate deceased-person) (value true))
(asserted-fact (fact-id f-deceased-label) (case-id case-07) (subject deceased-b) (predicate heir-person-label) (value "Ong Tran Van B (Nguoi de lai di san)"))

; Trang thai vu viec
(asserted-fact (fact-id f-search-complete) (case-id case-07) (subject case-07) (predicate heir-search-complete) (value true))
(asserted-fact (fact-id f-case-label) (case-id case-07) (subject case-07) (predicate estate-asset-label) (value "Vu viec so 7 - Gia dinh phuc tap"))

; --- NGHIA VU TAI SAN ---
(asserted-fact (fact-id f-funeral) (case-id case-07) (subject debt-funeral-b) (predicate estate-obligation) (value true))
(asserted-fact (fact-id f-funeral-type) (case-id case-07) (subject debt-funeral-b) (predicate obligation-type) (value funeral-expense))
(asserted-fact (fact-id f-funeral-label) (case-id case-07) (subject debt-funeral-b) (predicate obligation-label) (value "Chi phi mai tang cho B"))

; --- NGUOI THUA KE (8 nguoi) ---

; 1. Vo
(asserted-fact (fact-id f-wife-cand) (case-id case-07) (subject person-wife) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-wife-label) (case-id case-07) (subject person-wife) (predicate heir-person-label) (value "Ba C (Vo cua B)"))
(asserted-fact (fact-id f-wife-spouse) (case-id case-07) (subject person-wife) (predicate spouse-at-opening) (value deceased-b))
(asserted-fact (fact-id f-wife-life) (case-id case-07) (subject person-wife) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-wife-refusal) (case-id case-07) (subject person-wife) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-wife-el-cand) (case-id case-07) (subject person-wife) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-wife-el-rev) (case-id case-07) (subject person-wife) (predicate eligibility-review-complete) (value true))

; 2. Con trai 1 (Con ruot, con song)
(asserted-fact (fact-id f-son1-cand) (case-id case-07) (subject person-son1) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-son1-label) (case-id case-07) (subject person-son1) (predicate heir-person-label) (value "Anh D (Con trai truong)"))
(asserted-fact (fact-id f-son1-child) (case-id case-07) (subject person-son1) (predicate biological-child-of) (value deceased-b))
(asserted-fact (fact-id f-son1-life) (case-id case-07) (subject person-son1) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-son1-refusal) (case-id case-07) (subject person-son1) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-son1-el-cand) (case-id case-07) (subject person-son1) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-son1-el-rev) (case-id case-07) (subject person-son1) (predicate eligibility-review-complete) (value true))

; 3. Con trai 2 (Da chet truoc B)
(asserted-fact (fact-id f-son2-cand) (case-id case-07) (subject person-son2) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-son2-label) (case-id case-07) (subject person-son2) (predicate heir-person-label) (value "Anh E (Con trai thu - chet truoc B)"))
(asserted-fact (fact-id f-son2-child) (case-id case-07) (subject person-son2) (predicate biological-child-of) (value deceased-b))
(asserted-fact (fact-id f-son2-life) (case-id case-07) (subject person-son2) (predicate heir-life-status) (value dead-before-or-same-time))

; 4. Chau noi 1 (Con cua anh E, the vi)
(asserted-fact (fact-id f-gson1-cand) (case-id case-07) (subject person-gson1) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-gson1-label) (case-id case-07) (subject person-gson1) (predicate heir-person-label) (value "Chau F (Con cua E, nhan the vi)"))
(asserted-fact (fact-id f-gson1-child) (case-id case-07) (subject person-gson1) (predicate biological-child-of) (value person-son2))
(asserted-fact (fact-id f-gson1-life) (case-id case-07) (subject person-gson1) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-gson1-refusal) (case-id case-07) (subject person-gson1) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-gson1-el-cand) (case-id case-07) (subject person-gson1) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-gson1-el-rev) (case-id case-07) (subject person-gson1) (predicate eligibility-review-complete) (value true))

; 5. Chau noi 2 (Con cua anh E, the vi)
(asserted-fact (fact-id f-gson2-cand) (case-id case-07) (subject person-gson2) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-gson2-label) (case-id case-07) (subject person-gson2) (predicate heir-person-label) (value "Chau G (Con cua E, nhan the vi)"))
(asserted-fact (fact-id f-gson2-child) (case-id case-07) (subject person-gson2) (predicate biological-child-of) (value person-son2))
(asserted-fact (fact-id f-gson2-life) (case-id case-07) (subject person-gson2) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-gson2-refusal) (case-id case-07) (subject person-gson2) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-gson2-el-cand) (case-id case-07) (subject person-gson2) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-gson2-el-rev) (case-id case-07) (subject person-gson2) (predicate eligibility-review-complete) (value true))

; 6. Con gai 1
(asserted-fact (fact-id f-dau1-cand) (case-id case-07) (subject person-dau1) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-dau1-label) (case-id case-07) (subject person-dau1) (predicate heir-person-label) (value "Chi H (Con gai)"))
(asserted-fact (fact-id f-dau1-child) (case-id case-07) (subject person-dau1) (predicate biological-child-of) (value deceased-b))
(asserted-fact (fact-id f-dau1-life) (case-id case-07) (subject person-dau1) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-dau1-refusal) (case-id case-07) (subject person-dau1) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-dau1-el-cand) (case-id case-07) (subject person-dau1) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-dau1-el-rev) (case-id case-07) (subject person-dau1) (predicate eligibility-review-complete) (value true))

; 7. Con gai 2 (Tu choi nhan di san)
(asserted-fact (fact-id f-dau2-cand) (case-id case-07) (subject person-dau2) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-dau2-label) (case-id case-07) (subject person-dau2) (predicate heir-person-label) (value "Chi I (Con gai - Tu choi)"))
(asserted-fact (fact-id f-dau2-child) (case-id case-07) (subject person-dau2) (predicate biological-child-of) (value deceased-b))
(asserted-fact (fact-id f-dau2-life) (case-id case-07) (subject person-dau2) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-dau2-refusal) (case-id case-07) (subject person-dau2) (predicate valid-refusal) (value true))
(asserted-fact (fact-id f-dau2-el-cand) (case-id case-07) (subject person-dau2) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-dau2-el-rev) (case-id case-07) (subject person-dau2) (predicate eligibility-review-complete) (value true))

; 8. Con nuoi
(asserted-fact (fact-id f-adopted-cand) (case-id case-07) (subject person-adopted) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-adopted-label) (case-id case-07) (subject person-adopted) (predicate heir-person-label) (value "Anh K (Con nuoi)"))
(asserted-fact (fact-id f-adopted-child) (case-id case-07) (subject person-adopted) (predicate adopted-child-of) (value deceased-b))
(asserted-fact (fact-id f-adopted-life) (case-id case-07) (subject person-adopted) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-adopted-refusal) (case-id case-07) (subject person-adopted) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-adopted-el-cand) (case-id case-07) (subject person-adopted) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-adopted-el-rev) (case-id case-07) (subject person-adopted) (predicate eligibility-review-complete) (value true))
