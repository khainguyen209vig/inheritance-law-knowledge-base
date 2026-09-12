(defrule project-conclusive-eligibility
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module eligibility))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value ?value&excluded|not-excluded|exception-under-will) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module eligibility) (predicate article-621-status)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module eligibility) (predicate article-621-status) (value ?value) (derivations ?rule))))

(defrule project-unknown-eligibility
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module eligibility))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module eligibility))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  (not (module-result (case-id ?case-id) (subject ?person) (module eligibility) (predicate article-621-status)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module eligibility) (predicate article-621-status) (value unknown) (derivations SYSTEM-INCOMPLETE))))
