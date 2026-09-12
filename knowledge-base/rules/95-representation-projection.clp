(defrule project-representation-result
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module representation))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation) (value ?value&true|false) (rule-id ?rule))
  (not (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation) (value ?value) (derivations ?rule))))

(defrule project-unknown-representation
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module representation))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate representation-candidate) (value true))
  (missing-requirement (case-id ?case-id) (subject ?person) (module representation))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate inherits-by-representation)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module representation) (predicate inherits-by-representation) (value unknown) (derivations SYSTEM-INCOMPLETE))))
