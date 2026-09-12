; First-rank classification from directed family-graph edges (Article 651.1.a).

(defrule R-C01-spouse
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate spouse-at-opening) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-biological-parent
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate biological-parent-of) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-adoptive-parent
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate adoptive-parent-of) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-biological-child
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?person))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

(defrule R-C01-adoptive-child
  (declare (salience 500))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate adoptive-parent-of) (value ?person))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id R-C01) (supports ?deceased-fact ?candidate ?relation))))

; Rank two: biological grandparent, full sibling graph path, or biological grandchild.
(defrule R-C02-grandparent
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?edge-one) (case-id ?case-id) (subject ?person) (predicate biological-parent-of) (value ?parent))
  (asserted-fact (fact-id ?edge-two) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?deceased))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2) (rule-id R-C02) (supports ?candidate ?edge-one ?edge-two))))

(defrule R-C02-sibling
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?person-edge) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?person))
  (asserted-fact (fact-id ?deceased-edge) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?deceased))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (test (neq ?person ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2) (rule-id R-C02) (supports ?candidate ?person-edge ?deceased-edge))))

(defrule R-C02-grandchild
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?edge-one) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?parent))
  (asserted-fact (fact-id ?edge-two) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 2) (rule-id R-C02) (supports ?candidate ?edge-one ?edge-two))))

; Rank three is likewise derived from biological graph paths, never a UI rank label.
(defrule R-C03-great-grandparent
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?one) (case-id ?case-id) (subject ?person) (predicate biological-parent-of) (value ?middle-one))
  (asserted-fact (fact-id ?two) (case-id ?case-id) (subject ?middle-one) (predicate biological-parent-of) (value ?middle-two))
  (asserted-fact (fact-id ?three) (case-id ?case-id) (subject ?middle-two) (predicate biological-parent-of) (value ?deceased))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3) (rule-id R-C03) (supports ?candidate ?one ?two ?three))))

(defrule R-C03-aunt-or-uncle
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?one) (case-id ?case-id) (subject ?grandparent) (predicate biological-parent-of) (value ?person))
  (asserted-fact (fact-id ?two) (case-id ?case-id) (subject ?grandparent) (predicate biological-parent-of) (value ?parent))
  (asserted-fact (fact-id ?three) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?deceased))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (test (neq ?person ?parent))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3) (rule-id R-C03) (supports ?candidate ?one ?two ?three))))

(defrule R-C03-niece-or-nephew
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?one) (case-id ?case-id) (subject ?grandparent) (predicate biological-parent-of) (value ?deceased))
  (asserted-fact (fact-id ?two) (case-id ?case-id) (subject ?grandparent) (predicate biological-parent-of) (value ?parent))
  (asserted-fact (fact-id ?three) (case-id ?case-id) (subject ?parent) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (test (neq ?deceased ?parent))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3) (rule-id R-C03) (supports ?candidate ?one ?two ?three))))

(defrule R-C03-great-grandchild
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (asserted-fact (fact-id ?one) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?middle-one))
  (asserted-fact (fact-id ?two) (case-id ?case-id) (subject ?middle-one) (predicate biological-parent-of) (value ?middle-two))
  (asserted-fact (fact-id ?three) (case-id ?case-id) (subject ?middle-two) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 3) (rule-id R-C03) (supports ?candidate ?one ?two ?three))))

(defrule STATUTORY-CANDIDATE-QUALIFIED
  (declare (salience 280))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict)))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?person) (predicate heir-life-status) (value alive))
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value ?rank) (rule-id STATUTORY-CANDIDATE-QUALIFIED) (supports ?eligibility-rule ?life ?refusal))))

(defrule STATUTORY-CANDIDATE-INACTIVE-ELIGIBILITY
  (declare (salience 280))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value excluded|exception-under-will) (rule-id ?reason))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value false) (rule-id STATUTORY-CANDIDATE-INACTIVE) (supports ?reason))))

(defrule STATUTORY-CANDIDATE-INACTIVE-LIFE
  (declare (salience 280))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?person) (predicate heir-life-status) (value dead-before-or-same))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value false) (rule-id STATUTORY-CANDIDATE-INACTIVE) (supports ?life))))

(defrule STATUTORY-CANDIDATE-INACTIVE-REFUSAL
  (declare (salience 280))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3))
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value false) (rule-id STATUTORY-CANDIDATE-INACTIVE) (supports ?refusal))))

; This explicit intermediate prevents an unknown earlier-rank candidate from
; being treated as absent when a later active rank is selected.
(defrule STATUTORY-CANDIDATE-UNRESOLVED
  (declare (salience 260))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3) (rule-id ?rank-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value ?rank)))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value false)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate unresolved-statutory-candidate) (value ?rank) (rule-id STATUTORY-CANDIDATE-UNRESOLVED) (supports ?rank-rule))))

(defrule R-C06-active-rank-one
  (declare (salience 240))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value 1) (rule-id ?qualification))
  (not (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 1) (rule-id R-C06) (supports ?complete ?qualification))))

(defrule R-C06-active-rank-two
  (declare (salience 240))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value 2) (rule-id ?qualification))
  (not (derived-fact (case-id ?case-id) (predicate qualified-statutory-candidate) (value 1)))
  (not (derived-fact (case-id ?case-id) (predicate unresolved-statutory-candidate) (value 1)))
  (not (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 2) (rule-id R-C06) (supports ?complete ?qualification))))

(defrule R-C06-active-rank-three
  (declare (salience 240))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value 3) (rule-id ?qualification))
  (not (derived-fact (case-id ?case-id) (predicate qualified-statutory-candidate) (value 1|2)))
  (not (derived-fact (case-id ?case-id) (predicate unresolved-statutory-candidate) (value 1|2)))
  (not (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value 3) (rule-id R-C06) (supports ?complete ?qualification))))

(defrule R-C06-call-active-rank
  (declare (salience 220))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value ?rank) (rule-id ?active-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-statutory-candidate) (value ?rank) (rule-id ?qualification))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value true) (rule-id R-C06) (supports ?active-rule ?qualification))))

(defrule R-C05-prior-rank-active
  (declare (salience 210))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value ?active-rank) (rule-id ?active-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank&1|2|3))
  (test (> ?rank ?active-rank))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value false) (rule-id R-C05) (supports ?active-rule))))

(defrule R-C04-equal-share-principle
  (declare (salience 190))
  (derived-fact (case-id ?case-id) (subject ?first) (predicate called-to-inherit) (value true) (rule-id ?first-rule))
  (derived-fact (case-id ?case-id) (subject ?second&~?first) (predicate called-to-inherit) (value true) (rule-id ?second-rule))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value ?rank))
  (not (derived-fact (case-id ?case-id) (subject ?case-id) (predicate equal-share-principle-applies) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?case-id) (predicate equal-share-principle-applies) (value true) (rule-id R-C04) (supports ?first-rule ?second-rule))))
