(defrule project-first-heir-rank
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value rank-1) (derivations ?rule))))

(defrule project-unknown-heir-rank
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank))
  (not (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module heir-rank) (predicate candidate-heir-rank) (value unknown) (derivations SYSTEM-INCOMPLETE))))
