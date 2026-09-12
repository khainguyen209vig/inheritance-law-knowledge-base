(analysis-request (case-id settlement-fixture) (subject settlement-fixture) (module estate-settlement))

(asserted-fact (fact-id funeral-entity) (case-id settlement-fixture) (subject funeral-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id funeral-type) (case-id settlement-fixture) (subject funeral-one) (predicate obligation-type) (value funeral-expense))

(asserted-fact (fact-id tax-entity) (case-id settlement-fixture) (subject tax-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id tax-type) (case-id settlement-fixture) (subject tax-one) (predicate obligation-type) (value tax-and-state-dues))

(asserted-fact (fact-id unknown-entity) (case-id settlement-fixture) (subject unknown-one) (predicate estate-obligation) (value true))

(asserted-fact (fact-id equal-group) (case-id settlement-fixture) (subject group-equal) (predicate testamentary-distribution-group) (value true))
(asserted-fact (fact-id equal-complete) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary-set-complete) (value true))
(asserted-fact (fact-id equal-person-one) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary) (value person-one))
(asserted-fact (fact-id equal-person-two) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary) (value person-two))
(asserted-fact (fact-id equal-shares) (case-id settlement-fixture) (subject group-equal) (predicate testamentary-shares-specified) (value false))
(asserted-fact (fact-id equal-agreement) (case-id settlement-fixture) (subject group-equal) (predicate alternative-share-agreement) (value false))

(asserted-fact (fact-id specified-group) (case-id settlement-fixture) (subject group-specified) (predicate testamentary-distribution-group) (value true))
(asserted-fact (fact-id specified-shares) (case-id settlement-fixture) (subject group-specified) (predicate testamentary-shares-specified) (value true))

(asserted-fact (fact-id missing-group) (case-id settlement-fixture) (subject group-missing) (predicate testamentary-distribution-group) (value true))

; Rank 1 is activated by one qualified living child. The prenatal persons obtain
; their candidate rank independently from the family graph.
(asserted-fact (fact-id deceased) (case-id settlement-fixture) (subject deceased-one) (predicate deceased-person) (value true))
(asserted-fact (fact-id search-complete) (case-id settlement-fixture) (subject settlement-fixture) (predicate heir-search-complete) (value true))
(asserted-fact (fact-id living-candidate) (case-id settlement-fixture) (subject living-child) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id living-edge) (case-id settlement-fixture) (subject deceased-one) (predicate biological-parent-of) (value living-child))
(asserted-fact (fact-id living-eligibility) (case-id settlement-fixture) (subject living-child) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id living-review) (case-id settlement-fixture) (subject living-child) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id living-life) (case-id settlement-fixture) (subject living-child) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id living-refusal) (case-id settlement-fixture) (subject living-child) (predicate valid-refusal) (value false))
(asserted-fact (fact-id prenatal-alive-candidate) (case-id settlement-fixture) (subject prenatal-alive) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id prenatal-alive-edge) (case-id settlement-fixture) (subject deceased-one) (predicate biological-parent-of) (value prenatal-alive))
(asserted-fact (fact-id prenatal-alive-scope) (case-id settlement-fixture) (subject prenatal-alive) (predicate prenatal-share-assessment-subject) (value true))
(asserted-fact (fact-id prenatal-alive-status) (case-id settlement-fixture) (subject prenatal-alive) (predicate prenatal-status-at-distribution) (value conceived-not-born))
(asserted-fact (fact-id prenatal-alive-outcome) (case-id settlement-fixture) (subject prenatal-alive) (predicate prenatal-birth-outcome) (value born-alive))
(asserted-fact (fact-id prenatal-deceased-candidate) (case-id settlement-fixture) (subject prenatal-deceased) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id prenatal-deceased-edge) (case-id settlement-fixture) (subject deceased-one) (predicate biological-parent-of) (value prenatal-deceased))
(asserted-fact (fact-id prenatal-deceased-scope) (case-id settlement-fixture) (subject prenatal-deceased) (predicate prenatal-share-assessment-subject) (value true))
(asserted-fact (fact-id prenatal-deceased-status) (case-id settlement-fixture) (subject prenatal-deceased) (predicate prenatal-status-at-distribution) (value conceived-not-born))
(asserted-fact (fact-id prenatal-deceased-outcome) (case-id settlement-fixture) (subject prenatal-deceased) (predicate prenatal-birth-outcome) (value died-before-birth))
