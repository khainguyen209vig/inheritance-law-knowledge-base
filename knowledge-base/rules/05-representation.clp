; Article 652: representation is derived from graph paths and eligibility facts.

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
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value false))
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
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value false) (rule-id REPRESENTATION-CANDIDATE-INACTIVE) (supports ?refusal))))
