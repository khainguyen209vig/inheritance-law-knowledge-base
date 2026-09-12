; Article 652: representation is derived from graph paths and eligibility facts.

; Article 653 creates reciprocal inheritance relationship bases. These are not
; final entitlement conclusions and remain available to downstream rules.
(defrule R-E03a-adopted-child-to-adoptive-parent-basis
  (declare (salience 460))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?parent) (predicate adoptive-parent-of) (value ?child))
  (not (derived-fact (case-id ?case-id) (subject ?child) (predicate adoption-inheritance-basis) (value ?parent)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?child) (predicate adoption-inheritance-basis) (value ?parent) (rule-id R-E03a) (supports ?edge))))

(defrule R-E03a-adoptive-parent-to-adopted-child-basis
  (declare (salience 460))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?parent) (predicate adoptive-parent-of) (value ?child))
  (not (derived-fact (case-id ?case-id) (subject ?parent) (predicate adoption-inheritance-basis) (value ?child)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?parent) (predicate adoption-inheritance-basis) (value ?child) (rule-id R-E03a) (supports ?edge))))

(defrule R-E03b-dual-parentage-basis
  (declare (salience 450))
  (asserted-fact (fact-id ?adoptive-edge) (case-id ?case-id) (subject ?adoptive-parent) (predicate adoptive-parent-of) (value ?child))
  (asserted-fact (fact-id ?biological-edge) (case-id ?case-id) (subject ?biological-parent) (predicate biological-parent-of) (value ?child))
  (test (neq ?adoptive-parent ?biological-parent))
  (not (derived-fact (case-id ?case-id) (subject ?child) (predicate dual-parentage-inheritance-basis) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?child) (predicate dual-parentage-inheritance-basis) (value true) (rule-id R-E03b) (supports ?adoptive-edge ?biological-edge))))

; Article 654 is modeled as a relationship plus an explicit assessment attached
; to that relationship fact. Absence of an assessment never means "no care".
(defrule R-E04-step-child-to-step-parent-basis
  (declare (salience 440))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?step-parent) (predicate step-parent-of) (value ?step-child))
  (asserted-fact (fact-id ?assessment) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value established))
  (not (asserted-fact (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value not-established)))
  (not (derived-fact (case-id ?case-id) (subject ?step-child) (predicate step-relationship-inheritance-basis) (value ?step-parent)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?step-child) (predicate step-relationship-inheritance-basis) (value ?step-parent) (rule-id R-E04) (supports ?edge ?assessment))))

(defrule R-E04-step-parent-to-step-child-basis
  (declare (salience 440))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?step-parent) (predicate step-parent-of) (value ?step-child))
  (asserted-fact (fact-id ?assessment) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value established))
  (not (asserted-fact (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value not-established)))
  (not (derived-fact (case-id ?case-id) (subject ?step-parent) (predicate step-relationship-inheritance-basis) (value ?step-child)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?step-parent) (predicate step-relationship-inheritance-basis) (value ?step-child) (rule-id R-E04) (supports ?edge ?assessment))))

(defrule R-E05-step-child-without-care-basis
  (declare (salience 440))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?step-parent) (predicate step-parent-of) (value ?step-child))
  (asserted-fact (fact-id ?assessment) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value not-established))
  (not (asserted-fact (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value established)))
  (not (derived-fact (case-id ?case-id) (subject ?step-child) (predicate eligible-by-step-relationship)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?step-child) (predicate eligible-by-step-relationship) (value false) (rule-id R-E05) (supports ?edge ?assessment))))

(defrule R-E05-step-parent-without-care-basis
  (declare (salience 440))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?step-parent) (predicate step-parent-of) (value ?step-child))
  (asserted-fact (fact-id ?assessment) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value not-established))
  (not (asserted-fact (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value established)))
  (not (derived-fact (case-id ?case-id) (subject ?step-parent) (predicate eligible-by-step-relationship)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?step-parent) (predicate eligible-by-step-relationship) (value false) (rule-id R-E05) (supports ?edge ?assessment))))

(defrule REPRESENTED-CHILD-WOULD-BE-ENTITLED
  (declare (salience 420))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?represented) (predicate heir-life-status) (value dead-before-or-same))
  (derived-fact (case-id ?case-id) (subject ?represented) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-if-alive) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-if-alive) (value true) (rule-id REPRESENTED-CHILD-WOULD-BE-ENTITLED) (supports ?deceased-fact ?edge ?life ?eligibility-rule))))

(defrule REPRESENTATION-CANDIDATE-QUALIFIED
  (declare (salience 400))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?person) (predicate heir-life-status) (value alive))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status) (value false) (rule-id ?refusal))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-representation-candidate) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-representation-candidate) (value true) (rule-id REPRESENTATION-CANDIDATE-QUALIFIED) (supports ?candidate ?life ?refusal ?eligibility-rule))))

(defrule REPRESENTED-GRANDCHILD-WOULD-BE-ENTITLED
  (declare (salience 390))
  (asserted-fact (fact-id ?child-edge) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?original-child))
  (asserted-fact (fact-id ?grandchild-edge) (case-id ?case-id) (subject ?original-child) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?represented) (predicate heir-life-status) (value dead-before-or-same))
  (derived-fact (case-id ?case-id) (subject ?original-child) (predicate would-be-entitled-if-alive) (value true) (rule-id ?original-rule))
  (derived-fact (case-id ?case-id) (subject ?represented) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-by-representation-if-alive) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-by-representation-if-alive) (value true) (rule-id REPRESENTED-GRANDCHILD-WOULD-BE-ENTITLED) (supports ?child-edge ?grandchild-edge ?life ?original-rule ?eligibility-rule))))

(defrule R-E01-grandchild-represents-child
  (declare (salience 350))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?parent-edge) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (fact-id ?child-edge) (case-id ?case-id) (subject ?represented) (predicate biological-parent-of) (value ?person))
  (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-if-alive) (value true) (rule-id ?would-be-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-representation-candidate) (value true) (rule-id ?candidate-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate represents-person) (value ?represented) (rule-id R-E01) (supports ?parent-edge ?child-edge ?would-be-rule ?candidate-rule)))
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value true) (rule-id R-E01) (supports ?deceased-fact ?parent-edge ?child-edge ?would-be-rule ?candidate-rule))))

(defrule R-E02-great-grandchild-represents-grandchild
  (declare (salience 350))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?child-edge) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?original-child))
  (asserted-fact (fact-id ?grandchild-edge) (case-id ?case-id) (subject ?original-child) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (fact-id ?great-grandchild-edge) (case-id ?case-id) (subject ?represented) (predicate biological-parent-of) (value ?person))
  (derived-fact (case-id ?case-id) (subject ?represented) (predicate would-be-entitled-by-representation-if-alive) (value true) (rule-id ?would-be-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate qualified-representation-candidate) (value true) (rule-id ?candidate-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate represents-person) (value ?represented) (rule-id R-E02) (supports ?child-edge ?grandchild-edge ?great-grandchild-edge ?would-be-rule ?candidate-rule)))
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value true) (rule-id R-E02) (supports ?deceased-fact ?child-edge ?grandchild-edge ?great-grandchild-edge ?would-be-rule ?candidate-rule))))

(defrule REPRESENTATION-CANDIDATE-INACTIVE-ELIGIBILITY
  (declare (salience 330))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value excluded|exception-under-will) (rule-id ?reason))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value false) (rule-id REPRESENTATION-CANDIDATE-INACTIVE) (supports ?reason))))

(defrule REPRESENTATION-CANDIDATE-INACTIVE-LIFE
  (declare (salience 330))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (asserted-fact (fact-id ?life) (case-id ?case-id) (subject ?person) (predicate heir-life-status) (value dead-before-or-same))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value false) (rule-id REPRESENTATION-CANDIDATE-INACTIVE) (supports ?life))))

(defrule REPRESENTATION-CANDIDATE-INACTIVE-REFUSAL
  (declare (salience 330))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status) (value true) (rule-id ?refusal))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value false) (rule-id REPRESENTATION-CANDIDATE-INACTIVE) (supports ?refusal))))
