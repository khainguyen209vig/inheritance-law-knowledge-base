(analysis-request (case-id case-02) (subject case-02) (module estate-settlement))

; --- NGUOI DE LAI DI SAN ---
(asserted-fact (fact-id f-dec) (case-id case-02) (subject deceased-m) (predicate deceased-person) (value true))
(asserted-fact (fact-id f-dec-lbl) (case-id case-02) (subject deceased-m) (predicate heir-person-label) (value "Ong Le Van M (Nguoi de lai di san)"))

; --- TRANG THAI VU VIEC ---
(asserted-fact (fact-id f-search) (case-id case-02) (subject case-02) (predicate heir-search-complete) (value true))
(asserted-fact (fact-id f-case-lbl) (case-id case-02) (subject case-02) (predicate estate-asset-label) (value "Vu viec so 2 - Tranh chap tai san da dang, co nguoi bi truat quyen"))

; --- NGHIA VU TAI SAN ---
(asserted-fact (fact-id f-debt1) (case-id case-02) (subject debt-tax) (predicate estate-obligation) (value true))
(asserted-fact (fact-id f-debt1-type) (case-id case-02) (subject debt-tax) (predicate obligation-type) (value tax-and-state-dues))
(asserted-fact (fact-id f-debt1-lbl) (case-id case-02) (subject debt-tax) (predicate obligation-label) (value "No thue dat chua dong"))

(asserted-fact (fact-id f-debt2) (case-id case-02) (subject debt-personal) (predicate estate-obligation) (value true))
(asserted-fact (fact-id f-debt2-type) (case-id case-02) (subject debt-personal) (predicate obligation-type) (value other-debt))
(asserted-fact (fact-id f-debt2-lbl) (case-id case-02) (subject debt-personal) (predicate obligation-label) (value "Khoan vay ca nhan - Muon ban be lam an"))

; --- NGUOI THUA KE ---
; 1. Vợ (Bà N)
(asserted-fact (fact-id f-wife-cand) (case-id case-02) (subject person-wife-n) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-wife-lbl) (case-id case-02) (subject person-wife-n) (predicate heir-person-label) (value "Ba N (Vo cua M)"))
(asserted-fact (fact-id f-wife-sp) (case-id case-02) (subject person-wife-n) (predicate spouse-at-opening) (value deceased-m))
(asserted-fact (fact-id f-wife-life) (case-id case-02) (subject person-wife-n) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-wife-ref) (case-id case-02) (subject person-wife-n) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-wife-el) (case-id case-02) (subject person-wife-n) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-wife-el-rev) (case-id case-02) (subject person-wife-n) (predicate eligibility-review-complete) (value true))

; 2. Con trai 1 (Anh O)
(asserted-fact (fact-id f-son-o-cand) (case-id case-02) (subject person-son-o) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-son-o-lbl) (case-id case-02) (subject person-son-o) (predicate heir-person-label) (value "Anh O (Con trai truong)"))
(asserted-fact (fact-id f-son-o-ch) (case-id case-02) (subject person-son-o) (predicate biological-child-of) (value deceased-m))
(asserted-fact (fact-id f-son-o-life) (case-id case-02) (subject person-son-o) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-son-o-ref) (case-id case-02) (subject person-son-o) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-son-o-el) (case-id case-02) (subject person-son-o) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-son-o-el-rev) (case-id case-02) (subject person-son-o) (predicate eligibility-review-complete) (value true))

; 3. Con gái 2 (Chị P - Bị truất quyền thừa kế)
(asserted-fact (fact-id f-dau-p-cand) (case-id case-02) (subject person-dau-p) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-dau-p-lbl) (case-id case-02) (subject person-dau-p) (predicate heir-person-label) (value "Chi P (Con gai - Bi truat quyen)"))
(asserted-fact (fact-id f-dau-p-ch) (case-id case-02) (subject person-dau-p) (predicate biological-child-of) (value deceased-m))
(asserted-fact (fact-id f-dau-p-life) (case-id case-02) (subject person-dau-p) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-dau-p-ref) (case-id case-02) (subject person-dau-p) (predicate valid-refusal) (value false)) 
(asserted-fact (fact-id f-dau-p-unworthy) (case-id case-02) (subject person-dau-p) (predicate unworthy-heir) (value true))
(asserted-fact (fact-id f-dau-p-el) (case-id case-02) (subject person-dau-p) (predicate eligibility-candidate) (value false)) 
(asserted-fact (fact-id f-dau-p-el-rev) (case-id case-02) (subject person-dau-p) (predicate eligibility-review-complete) (value true))

; 4. Con trai 3 (Anh Q)
(asserted-fact (fact-id f-son-q-cand) (case-id case-02) (subject person-son-q) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-son-q-lbl) (case-id case-02) (subject person-son-q) (predicate heir-person-label) (value "Anh Q (Con trai ut)"))
(asserted-fact (fact-id f-son-q-ch) (case-id case-02) (subject person-son-q) (predicate biological-child-of) (value deceased-m))
(asserted-fact (fact-id f-son-q-life) (case-id case-02) (subject person-son-q) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id f-son-q-ref) (case-id case-02) (subject person-son-q) (predicate valid-refusal) (value false))
(asserted-fact (fact-id f-son-q-el) (case-id case-02) (subject person-son-q) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id f-son-q-el-rev) (case-id case-02) (subject person-son-q) (predicate eligibility-review-complete) (value true))

; 5 & 6. Bố mẹ của M (đã chết)
(asserted-fact (fact-id f-father-cand) (case-id case-02) (subject person-father-x) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-father-lbl) (case-id case-02) (subject person-father-x) (predicate heir-person-label) (value "Ong X (Cha cua M - Da chet)"))
(asserted-fact (fact-id f-father-ch) (case-id case-02) (subject deceased-m) (predicate biological-child-of) (value person-father-x))
(asserted-fact (fact-id f-father-life) (case-id case-02) (subject person-father-x) (predicate heir-life-status) (value dead-before-or-same-time))

(asserted-fact (fact-id f-mother-cand) (case-id case-02) (subject person-mother-y) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id f-mother-lbl) (case-id case-02) (subject person-mother-y) (predicate heir-person-label) (value "Ba Y (Me cua M - Da chet)"))
(asserted-fact (fact-id f-mother-ch) (case-id case-02) (subject deceased-m) (predicate biological-child-of) (value person-mother-y))
(asserted-fact (fact-id f-mother-life) (case-id case-02) (subject person-mother-y) (predicate heir-life-status) (value dead-before-or-same-time))
