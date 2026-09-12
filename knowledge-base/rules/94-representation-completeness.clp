(defrule SYSTEM-STEP-CARE-CONFLICT
  (declare (salience 490))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (predicate step-parent-of) (value ?step-child))
  (asserted-fact (fact-id ?positive) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value established))
  (asserted-fact (fact-id ?negative) (case-id ?case-id) (subject ?edge) (predicate step-care-status) (value not-established))
  (not (derived-fact (case-id ?case-id) (subject ?step-child) (predicate step-care-assessment) (value conflict)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?step-child) (predicate step-care-assessment) (value conflict) (rule-id SYSTEM-STEP-CARE-CONFLICT) (supports ?edge ?positive ?negative))))

(defrule missing-representation-path
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate representation-path-or-qualification))))

(defrule missing-represented-child-life
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (case-id ?case-id) (subject ?represented) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?represented) (predicate heir-life-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate represented-person-life-status))))

(defrule missing-represented-child-eligibility
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (case-id ?case-id) (subject ?represented) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?represented) (predicate article-621-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate represented-person-article-621-status))))

(defrule missing-represented-grandchild-eligibility
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?original-child))
  (asserted-fact (case-id ?case-id) (subject ?original-child) (predicate biological-parent-of) (value ?represented))
  (asserted-fact (case-id ?case-id) (subject ?represented) (predicate biological-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?represented) (predicate article-621-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate represented-person-article-621-status))))

(defrule missing-representation-candidate-life
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-life-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate heir-life-status))))

(defrule missing-representation-candidate-eligibility
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate article-621-status))))

(defrule missing-representation-candidate-refusal
  (declare (salience 210))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module representation) (predicate valid-refusal))))

(defrule missing-step-care-assessment
  (declare (salience 220))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (fact-id ?edge) (case-id ?case-id) (predicate step-parent-of) (value ?step-child))
  (not (asserted-fact (case-id ?case-id) (subject ?edge) (predicate step-care-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?step-child) (module representation) (predicate step-care-status))))
