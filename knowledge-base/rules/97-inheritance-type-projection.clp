(defrule project-inheritance-regime-conflict
  (declare (salience 100))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value conflict) (rule-id ?rule-id))
  (not (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate inheritance-regime)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type)
    (predicate inheritance-regime) (value conflict) (derivations ?rule-id))))

(defrule project-conclusive-inheritance-regime
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value ?value&statutory|testamentary) (rule-id ?rule-id))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value conflict)))
  (not (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate inheritance-regime)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type)
    (predicate inheritance-regime) (value ?value) (derivations ?rule-id))))

(defrule project-unknown-inheritance-regime
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory|testamentary|conflict)))
  (not (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate inheritance-regime)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?portion) (module inheritance-type)
    (predicate inheritance-regime) (value unknown) (derivations SYSTEM-INCOMPLETE))))
