(defrule missing-heir-relationship
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate relationship-at-opening))))
