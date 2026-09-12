(analysis-request (case-id case-representation) (subject case-representation) (module representation))
(asserted-fact (fact-id rep-deceased) (case-id case-representation) (subject deceased-one) (predicate deceased-person) (value true))

; Grandchild represents a deceased child.
(asserted-fact (fact-id rep-parent-edge) (case-id case-representation) (subject deceased-one) (predicate biological-parent-of) (value deceased-child))
(asserted-fact (fact-id rep-child-edge) (case-id case-representation) (subject deceased-child) (predicate biological-parent-of) (value grandchild-one))
(asserted-fact (fact-id rep-parent-life) (case-id case-representation) (subject deceased-child) (predicate heir-life-status) (value dead-before-or-same))
(asserted-fact (fact-id rep-parent-eligibility) (case-id case-representation) (subject deceased-child) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id rep-parent-review) (case-id case-representation) (subject deceased-child) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id rep-candidate) (case-id case-representation) (subject grandchild-one) (predicate representation-candidate) (value true))
(asserted-fact (fact-id rep-candidate-life) (case-id case-representation) (subject grandchild-one) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id rep-candidate-refusal) (case-id case-representation) (subject grandchild-one) (predicate valid-refusal) (value false))
(asserted-fact (fact-id rep-candidate-eligibility) (case-id case-representation) (subject grandchild-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id rep-candidate-review) (case-id case-representation) (subject grandchild-one) (predicate eligibility-review-complete) (value true))

; Great-grandchild represents a deceased grandchild in the same legal pattern.
(asserted-fact (fact-id rep-grandchild-edge) (case-id case-representation) (subject deceased-child) (predicate biological-parent-of) (value deceased-grandchild))
(asserted-fact (fact-id rep-great-grandchild-edge) (case-id case-representation) (subject deceased-grandchild) (predicate biological-parent-of) (value great-grandchild-one))
(asserted-fact (fact-id rep-grandchild-life) (case-id case-representation) (subject deceased-grandchild) (predicate heir-life-status) (value dead-before-or-same))
(asserted-fact (fact-id rep-grandchild-eligibility) (case-id case-representation) (subject deceased-grandchild) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id rep-grandchild-review) (case-id case-representation) (subject deceased-grandchild) (predicate eligibility-review-complete) (value true))
(asserted-fact (fact-id rep-great-candidate) (case-id case-representation) (subject great-grandchild-one) (predicate representation-candidate) (value true))
(asserted-fact (fact-id rep-great-life) (case-id case-representation) (subject great-grandchild-one) (predicate heir-life-status) (value alive))
(asserted-fact (fact-id rep-great-refusal) (case-id case-representation) (subject great-grandchild-one) (predicate valid-refusal) (value false))
(asserted-fact (fact-id rep-great-eligibility) (case-id case-representation) (subject great-grandchild-one) (predicate eligibility-candidate) (value true))
(asserted-fact (fact-id rep-great-review) (case-id case-representation) (subject great-grandchild-one) (predicate eligibility-review-complete) (value true))

; Explicitly inactive candidate.
(asserted-fact (fact-id rep-inactive-candidate) (case-id case-representation) (subject inactive-one) (predicate representation-candidate) (value true))
(asserted-fact (fact-id rep-inactive-life) (case-id case-representation) (subject inactive-one) (predicate heir-life-status) (value dead-before-or-same))

; Unknown candidate keeps an open-world result.
(asserted-fact (fact-id rep-unknown-candidate) (case-id case-representation) (subject unknown-one) (predicate representation-candidate) (value true))

; Article 653 keeps adoptive and biological relationship bases distinct.
(asserted-fact (fact-id rep-adoptive-edge) (case-id case-representation) (subject adoptive-parent-one) (predicate adoptive-parent-of) (value adopted-child-one))
(asserted-fact (fact-id rep-biological-edge) (case-id case-representation) (subject biological-parent-one) (predicate biological-parent-of) (value adopted-child-one))

; Article 654 assessments are attached to relation fact IDs, not inferred from absence.
(asserted-fact (fact-id rep-step-positive-edge) (case-id case-representation) (subject step-parent-positive) (predicate step-parent-of) (value step-child-positive))
(asserted-fact (fact-id rep-step-positive-care) (case-id case-representation) (subject rep-step-positive-edge) (predicate step-care-status) (value established))
(asserted-fact (fact-id rep-step-negative-edge) (case-id case-representation) (subject step-parent-negative) (predicate step-parent-of) (value step-child-negative))
(asserted-fact (fact-id rep-step-negative-care) (case-id case-representation) (subject rep-step-negative-edge) (predicate step-care-status) (value not-established))
(asserted-fact (fact-id rep-step-unknown-edge) (case-id case-representation) (subject step-parent-unknown) (predicate step-parent-of) (value step-child-unknown))
