(analysis-request (case-id case2-202-2021) (subject case2-202-2021) (module heir-rank))

; ==============================================================================
; CASE 2 - BAN AN 202/2021/DS-PT (TAND TP. HA NOI)
; TRANH CHAP CHIA THUA KE (PHUC THAM) - THUA DAT AO 238M2
; ==============================================================================

; --- NHAN THAN THIEN CHO CASE VA DI SAN ---
(asserted-fact (fact-id c2-label-case) (case-id case2-202-2021) (subject case2-202-2021) (predicate estate-portion-label) (value "Vu an 202/2021/DS-PT"))
(asserted-fact (fact-id c2-label-portion) (case-id case2-202-2021) (subject di-san-dat-ao) (predicate estate-portion-label) (value "Di san thua dat ao 238m2 Cat Dong"))
(asserted-fact (fact-id c2-label-asset) (case-id case2-202-2021) (subject dat-ao-246) (predicate estate-asset-label) (value "Thua dat ao 246 to ban do 1"))
(asserted-fact (fact-id c2-label-req) (case-id case2-202-2021) (subject req-chia-c2) (predicate limitation-request-label) (value "Yeu cau chia thua ke dat ao"))

; --- NGUOI DE LAI DI SAN VA HO SO THUA KE ---
(asserted-fact (fact-id c2-luu-label) (case-id case2-202-2021) (subject cu-luu) (predicate person-label) (value "Cu Nguyen Van Luu (chet 1996)"))
(asserted-fact (fact-id c2-luu-deceased) (case-id case2-202-2021) (subject cu-luu) (predicate deceased-person) (value true))
(asserted-fact (fact-id c2-search-complete) (case-id case2-202-2021) (subject case2-202-2021) (predicate heir-search-complete) (value true))
(asserted-fact (fact-id c2-has-will) (case-id case2-202-2021) (subject case2-202-2021) (predicate has-will) (value false))
(asserted-fact (fact-id c2-portion-exists) (case-id case2-202-2021) (subject di-san-dat-ao) (predicate estate-portion) (value true))

; --- VO NGUOI DE LAI DI SAN ---
(asserted-fact (fact-id c2-duc-label) (case-id case2-202-2021) (subject cu-duc) (predicate person-label) (value "Cu Nguyen Thi Duc (vo)"))
(asserted-fact (fact-id c2-duc-spouse) (case-id case2-202-2021) (subject cu-duc) (predicate spouse-at-opening) (value cu-luu))
(asserted-fact (fact-id c2-duc-cand) (case-id case2-202-2021) (subject cu-duc) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-duc-life) (case-id case2-202-2021) (subject cu-duc) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-duc-elig) (case-id case2-202-2021) (subject cu-duc) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-duc-rev) (case-id case2-202-2021) (subject cu-duc) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-duc-ref) (case-id case2-202-2021) (subject cu-duc) (predicate valid-refusal) (value false))

; --- CON CON SONG: ONG NGUYEN VAN LT (BI DON) ---
(asserted-fact (fact-id c2-lt-label) (case-id case2-202-2021) (subject ong-lt) (predicate person-label) (value "Ong Nguyen Van LT (con - bi don)"))
(asserted-fact (fact-id c2-lt-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ong-lt))
(asserted-fact (fact-id c2-lt-cand) (case-id case2-202-2021) (subject ong-lt) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-lt-life) (case-id case2-202-2021) (subject ong-lt) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-lt-elig) (case-id case2-202-2021) (subject ong-lt) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-lt-rev) (case-id case2-202-2021) (subject ong-lt) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-lt-ref) (case-id case2-202-2021) (subject ong-lt) (predicate valid-refusal) (value false))

; --- CON CON SONG: BA NGUYEN THI S ---
(asserted-fact (fact-id c2-bas-label) (case-id case2-202-2021) (subject ba-s) (predicate person-label) (value "Ba Nguyen Thi S (con)"))
(asserted-fact (fact-id c2-bas-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ba-s))
(asserted-fact (fact-id c2-bas-cand) (case-id case2-202-2021) (subject ba-s) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-bas-life) (case-id case2-202-2021) (subject ba-s) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-bas-elig) (case-id case2-202-2021) (subject ba-s) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-bas-rev) (case-id case2-202-2021) (subject ba-s) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-bas-ref) (case-id case2-202-2021) (subject ba-s) (predicate valid-refusal) (value false))

; --- CON CON SONG: BA NGUYEN THI D ---
(asserted-fact (fact-id c2-bad-label) (case-id case2-202-2021) (subject ba-d) (predicate person-label) (value "Ba Nguyen Thi D (con)"))
(asserted-fact (fact-id c2-bad-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ba-d))
(asserted-fact (fact-id c2-bad-cand) (case-id case2-202-2021) (subject ba-d) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-bad-life) (case-id case2-202-2021) (subject ba-d) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-bad-elig) (case-id case2-202-2021) (subject ba-d) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-bad-rev) (case-id case2-202-2021) (subject ba-d) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-bad-ref) (case-id case2-202-2021) (subject ba-d) (predicate valid-refusal) (value false))

; --- CON CON SONG: BA NGUYEN THI L (NGUYEN DON) ---
(asserted-fact (fact-id c2-bal-label) (case-id case2-202-2021) (subject ba-l) (predicate person-label) (value "Ba Nguyen Thi L (con - nguyen don)"))
(asserted-fact (fact-id c2-bal-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ba-l))
(asserted-fact (fact-id c2-bal-cand) (case-id case2-202-2021) (subject ba-l) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-bal-life) (case-id case2-202-2021) (subject ba-l) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-bal-elig) (case-id case2-202-2021) (subject ba-l) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-bal-rev) (case-id case2-202-2021) (subject ba-l) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-bal-ref) (case-id case2-202-2021) (subject ba-l) (predicate valid-refusal) (value false))

; --- CON CHET: ONG NGUYEN VAN SANG (LIET SY, KHONG CO CON) ---
(asserted-fact (fact-id c2-sang-label) (case-id case2-202-2021) (subject ong-sang) (predicate person-label) (value "Ong Nguyen Van Sang (liet sy - khong con)"))
(asserted-fact (fact-id c2-sang-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ong-sang))
(asserted-fact (fact-id c2-sang-cand) (case-id case2-202-2021) (subject ong-sang) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-sang-life) (case-id case2-202-2021) (subject ong-sang) (predicate heir-life-status) (value dead-before-or-same))
(asserted-fact (fact-id c2-sang-elig) (case-id case2-202-2021) (subject ong-sang) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-sang-rev) (case-id case2-202-2021) (subject ong-sang) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-sang-ref) (case-id case2-202-2021) (subject ong-sang) (predicate valid-refusal) (value false))

; --- CON CHET: ONG NGUYEN VAN TAC ---
(asserted-fact (fact-id c2-tac-label) (case-id case2-202-2021) (subject ong-tac) (predicate person-label) (value "Ong Nguyen Van Tac (con - chet)"))
(asserted-fact (fact-id c2-tac-edge) (case-id case2-202-2021) (subject cu-luu) (predicate biological-parent-of) (value ong-tac))
(asserted-fact (fact-id c2-tac-cand) (case-id case2-202-2021) (subject ong-tac) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id c2-tac-life) (case-id case2-202-2021) (subject ong-tac) (predicate heir-life-status) (value dead-before-or-same))
(asserted-fact (fact-id c2-tac-elig) (case-id case2-202-2021) (subject ong-tac) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-tac-rev) (case-id case2-202-2021) (subject ong-tac) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-tac-ref) (case-id case2-202-2021) (subject ong-tac) (predicate valid-refusal) (value false))

; --- CHAU THE VI ONG TAC: ANH NGUYEN THANH D ---
(asserted-fact (fact-id c2-anhd-label) (case-id case2-202-2021) (subject anh-d) (predicate person-label) (value "Anh Nguyen Thanh D (chau the vi ong Tac)"))
(asserted-fact (fact-id c2-anhd-edge) (case-id case2-202-2021) (subject ong-tac) (predicate biological-parent-of) (value anh-d))
(asserted-fact (fact-id c2-anhd-rep) (case-id case2-202-2021) (subject anh-d) (predicate representation-candidate) (value true))
(asserted-fact (fact-id c2-anhd-life) (case-id case2-202-2021) (subject anh-d) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-anhd-elig) (case-id case2-202-2021) (subject anh-d) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-anhd-rev) (case-id case2-202-2021) (subject anh-d) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-anhd-ref) (case-id case2-202-2021) (subject anh-d) (predicate valid-refusal) (value false))

; --- CHAU THE VI ONG TAC: ANH NGUYEN THIEN DC ---
(asserted-fact (fact-id c2-anhdc-label) (case-id case2-202-2021) (subject anh-dc) (predicate person-label) (value "Anh Nguyen Thien DC (chau the vi ong Tac)"))
(asserted-fact (fact-id c2-anhdc-edge) (case-id case2-202-2021) (subject ong-tac) (predicate biological-parent-of) (value anh-dc))
(asserted-fact (fact-id c2-anhdc-rep) (case-id case2-202-2021) (subject anh-dc) (predicate representation-candidate) (value true))
(asserted-fact (fact-id c2-anhdc-life) (case-id case2-202-2021) (subject anh-dc) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id c2-anhdc-elig) (case-id case2-202-2021) (subject anh-dc) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id c2-anhdc-rev) (case-id case2-202-2021) (subject anh-dc) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id c2-anhdc-ref) (case-id case2-202-2021) (subject anh-dc) (predicate valid-refusal) (value false))

; --- THOI HIEU THUA KE (LIMITATION) ---
(asserted-fact (fact-id c2-limit-req) (case-id case2-202-2021) (subject req-chia-c2) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id c2-limit-type) (case-id case2-202-2021) (subject req-chia-c2) (predicate request-type) (value divide-estate))
(asserted-fact (fact-id c2-limit-asset) (case-id case2-202-2021) (subject req-chia-c2) (predicate asset-type) (value immovable))
(asserted-fact (fact-id c2-limit-date) (case-id case2-202-2021) (subject req-chia-c2) (predicate inheritance-opening-date) (value "1996-11-02"))

; --- THANH LY DI SAN (ESTATE SETTLEMENT) ---
(asserted-fact (fact-id c2-vnd-calc) (case-id case2-202-2021) (subject case2-202-2021) (predicate estate-vnd-calculation) (value true))
(asserted-fact (fact-id c2-ast-comp) (case-id case2-202-2021) (subject case2-202-2021) (predicate estate-asset-set-complete) (value true))
(asserted-fact (fact-id c2-obl-comp) (case-id case2-202-2021) (subject case2-202-2021) (predicate estate-obligation-set-complete) (value true))
(asserted-fact (fact-id c2-datao-asset) (case-id case2-202-2021) (subject dat-ao-246) (predicate estate-asset) (value true))
(asserted-fact (fact-id c2-datao-val) (case-id case2-202-2021) (subject dat-ao-246) (predicate asset-value-vnd) (value 833000000))
(asserted-fact (fact-id c2-datao-num) (case-id case2-202-2021) (subject dat-ao-246) (predicate deceased-ownership-numerator) (value 1))
(asserted-fact (fact-id c2-datao-den) (case-id case2-202-2021) (subject dat-ao-246) (predicate deceased-ownership-denominator) (value 1))
