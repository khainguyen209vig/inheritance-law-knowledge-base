(analysis-request (case-id case-rank-two-active) (subject case-rank-two-active) (module heir-rank))
(asserted-fact (fact-id deceased) (case-id case-rank-two-active) (subject deceased-one) (predicate deceased-person) (value true))
(asserted-fact (fact-id search-complete) (case-id case-rank-two-active) (subject case-rank-two-active) (predicate heir-search-complete) (value true))

; Rank one exists but is inactive because this person died before or at the opening time.
(asserted-fact (fact-id spouse-candidate) (case-id case-rank-two-active) (subject spouse-one) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id spouse-edge) (case-id case-rank-two-active) (subject spouse-one) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id spouse-eligibility) (case-id case-rank-two-active) (subject spouse-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id spouse-review) (case-id case-rank-two-active) (subject spouse-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id spouse-life) (case-id case-rank-two-active) (subject spouse-one) (predicate heir-life-status) (value dead-before-or-same))
(asserted-fact (fact-id spouse-refusal) (case-id case-rank-two-active) (subject spouse-one) (predicate valid-refusal) (value false))

; Two qualified people in rank two: a grandparent and a sibling.
(asserted-fact (fact-id grandparent-candidate) (case-id case-rank-two-active) (subject grandparent-one) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id grandparent-edge-one) (case-id case-rank-two-active) (subject grandparent-one) (predicate biological-parent-of) (value parent-one))
(asserted-fact (fact-id grandparent-edge-two) (case-id case-rank-two-active) (subject parent-one) (predicate biological-parent-of) (value deceased-one))
(asserted-fact (fact-id grandparent-eligibility) (case-id case-rank-two-active) (subject grandparent-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id grandparent-review) (case-id case-rank-two-active) (subject grandparent-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id grandparent-life) (case-id case-rank-two-active) (subject grandparent-one) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id grandparent-refusal) (case-id case-rank-two-active) (subject grandparent-one) (predicate valid-refusal) (value false))

(asserted-fact (fact-id sibling-candidate) (case-id case-rank-two-active) (subject sibling-one) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id sibling-edge-one) (case-id case-rank-two-active) (subject common-parent) (predicate biological-parent-of) (value sibling-one))
(asserted-fact (fact-id sibling-edge-two) (case-id case-rank-two-active) (subject common-parent) (predicate biological-parent-of) (value deceased-one))
(asserted-fact (fact-id sibling-eligibility) (case-id case-rank-two-active) (subject sibling-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id sibling-review) (case-id case-rank-two-active) (subject sibling-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id sibling-life) (case-id case-rank-two-active) (subject sibling-one) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id sibling-refusal) (case-id case-rank-two-active) (subject sibling-one) (predicate valid-refusal) (value false))

; A qualified rank-three candidate remains behind the active rank.
(asserted-fact (fact-id great-grandchild-candidate) (case-id case-rank-two-active) (subject great-grandchild-one) (predicate heir-rank-candidate) (value true))
(asserted-fact (fact-id great-grandchild-edge-one) (case-id case-rank-two-active) (subject deceased-one) (predicate biological-parent-of) (value child-path))
(asserted-fact (fact-id great-grandchild-edge-two) (case-id case-rank-two-active) (subject child-path) (predicate biological-parent-of) (value grandchild-path))
(asserted-fact (fact-id great-grandchild-edge-three) (case-id case-rank-two-active) (subject grandchild-path) (predicate biological-parent-of) (value great-grandchild-one))
(asserted-fact (fact-id great-grandchild-eligibility) (case-id case-rank-two-active) (subject great-grandchild-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id great-grandchild-review) (case-id case-rank-two-active) (subject great-grandchild-one) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id great-grandchild-life) (case-id case-rank-two-active) (subject great-grandchild-one) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id great-grandchild-refusal) (case-id case-rank-two-active) (subject great-grandchild-one) (predicate valid-refusal) (value false))
