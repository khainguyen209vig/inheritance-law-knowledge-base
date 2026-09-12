(analysis-request (case-id case-compulsory) (subject case-compulsory) (module compulsory-share))
(asserted-fact (fact-id deceased) (case-id case-compulsory) (subject deceased-one) (predicate deceased-person) (value true))
(asserted-fact (fact-id graph-complete) (case-id case-compulsory) (subject case-compulsory) (predicate heir-search-complete) (value true))

; Minor child: protected and active.
(asserted-fact (fact-id minor-scope) (case-id case-compulsory) (subject minor-child) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id minor-edge) (case-id case-compulsory) (subject deceased-one) (predicate biological-parent-of) (value minor-child))
(asserted-fact (fact-id minor-age) (case-id case-compulsory) (subject minor-child) (predicate age-group) (value minor))
(asserted-fact (fact-id minor-refusal) (case-id case-compulsory) (subject minor-child) (predicate valid-refusal) (value false))
(asserted-fact (fact-id minor-eligibility) (case-id case-compulsory) (subject minor-child) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id minor-review) (case-id case-compulsory) (subject minor-child) (predicate eligibility-review-complete) (value true))

; Adult child without work capacity: protected but refused.
(asserted-fact (fact-id adult-scope) (case-id case-compulsory) (subject adult-child) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id adult-edge) (case-id case-compulsory) (subject deceased-one) (predicate adoptive-parent-of) (value adult-child))
(asserted-fact (fact-id adult-age) (case-id case-compulsory) (subject adult-child) (predicate age-group) (value adult))
(asserted-fact (fact-id adult-capacity) (case-id case-compulsory) (subject adult-child) (predicate work-capacity-status) (value incapable))
(asserted-fact (fact-id adult-refusal) (case-id case-compulsory) (subject adult-child) (predicate valid-refusal) (value true))

; Parent: protected by relationship but excluded by Article 621.
(asserted-fact (fact-id parent-scope) (case-id case-compulsory) (subject parent-one) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id parent-edge) (case-id case-compulsory) (subject parent-one) (predicate biological-parent-of) (value deceased-one))
(asserted-fact (fact-id parent-refusal) (case-id case-compulsory) (subject parent-one) (predicate valid-refusal) (value false))
(asserted-fact (fact-id parent-eligibility) (case-id case-compulsory) (subject parent-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id parent-review) (case-id case-compulsory) (subject parent-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id parent-violation) (case-id case-compulsory) (subject parent-one) (predicate serious-support-duty-violation) (value true))

; Adult capable child: reviewed and not in the protected class.
(asserted-fact (fact-id capable-scope) (case-id case-compulsory) (subject capable-child) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id capable-edge) (case-id case-compulsory) (subject deceased-one) (predicate biological-parent-of) (value capable-child))
(asserted-fact (fact-id capable-age) (case-id case-compulsory) (subject capable-child) (predicate age-group) (value adult))
(asserted-fact (fact-id capable-capacity) (case-id case-compulsory) (subject capable-child) (predicate work-capacity-status) (value capable))

; Adult child with an open work-capacity assessment remains unknown.
(asserted-fact (fact-id unknown-scope) (case-id case-compulsory) (subject unknown-child) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id unknown-edge) (case-id case-compulsory) (subject deceased-one) (predicate biological-parent-of) (value unknown-child))
(asserted-fact (fact-id unknown-age) (case-id case-compulsory) (subject unknown-child) (predicate age-group) (value adult))

; Per-person/per-portion calculations use an explicit calculation entity.
(asserted-fact (fact-id portion-one) (case-id case-compulsory) (subject portion-one) (predicate estate-portion) (value true))
(asserted-fact (fact-id minor-calculation) (case-id case-compulsory) (subject calc-minor-one) (predicate compulsory-share-calculation) (value true))
(asserted-fact (fact-id minor-calculation-person) (case-id case-compulsory) (subject calc-minor-one) (predicate calculation-person) (value minor-child))
(asserted-fact (fact-id minor-calculation-portion) (case-id case-compulsory) (subject calc-minor-one) (predicate calculation-estate-portion) (value portion-one))
(asserted-fact (fact-id minor-statutory-share) (case-id case-compulsory) (subject calc-minor-one) (predicate hypothetical-statutory-share) (value 300))
(asserted-fact (fact-id minor-testamentary-share) (case-id case-compulsory) (subject calc-minor-one) (predicate testamentary-share-received) (value 100))

; Spouse has already received more than the minimum threshold.
(asserted-fact (fact-id spouse-scope) (case-id case-compulsory) (subject spouse-one) (predicate compulsory-share-assessment-subject) (value true))
(asserted-fact (fact-id spouse-edge) (case-id case-compulsory) (subject spouse-one) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id spouse-refusal) (case-id case-compulsory) (subject spouse-one) (predicate valid-refusal) (value false))
(asserted-fact (fact-id spouse-eligibility) (case-id case-compulsory) (subject spouse-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id spouse-review) (case-id case-compulsory) (subject spouse-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id spouse-calculation) (case-id case-compulsory) (subject calc-spouse-one) (predicate compulsory-share-calculation) (value true))
(asserted-fact (fact-id spouse-calculation-person) (case-id case-compulsory) (subject calc-spouse-one) (predicate calculation-person) (value spouse-one))
(asserted-fact (fact-id spouse-calculation-portion) (case-id case-compulsory) (subject calc-spouse-one) (predicate calculation-estate-portion) (value portion-one))
(asserted-fact (fact-id spouse-statutory-share) (case-id case-compulsory) (subject calc-spouse-one) (predicate hypothetical-statutory-share) (value 300))
(asserted-fact (fact-id spouse-testamentary-share) (case-id case-compulsory) (subject calc-spouse-one) (predicate testamentary-share-received) (value 250))
