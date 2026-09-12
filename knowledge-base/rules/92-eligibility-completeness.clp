(defrule missing-eligibility-review
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module eligibility))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate eligibility-review-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module eligibility) (predicate eligibility-review-complete))))

(defrule unresolved-eligibility-path
  (declare (salience 150))
  (analysis-request (case-id ?case-id) (module eligibility))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  (not (missing-requirement (case-id ?case-id) (subject ?person) (module eligibility)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module eligibility) (predicate unresolved-rule-path))))
