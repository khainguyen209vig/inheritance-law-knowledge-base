(defrule project-valid-spouse-status
  (analysis-request (case-id ?case-id) (module spouse-status))
  (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-at-opening) (value valid) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate spouse-status-at-opening) (value valid) (derivations ?rule))))

(defrule project-unknown-spouse-status
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-at-opening)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate spouse-status-at-opening) (value unknown) (derivations))))
