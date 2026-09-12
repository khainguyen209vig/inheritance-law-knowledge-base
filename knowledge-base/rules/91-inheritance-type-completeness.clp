; Completeness and conflict knowledge for inheritance-type.

(defrule missing-inheritance-has-will
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?case-id) (predicate has-will)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate has-will))))

(defrule missing-applicable-will
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?case-id) (predicate has-will) (value true))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate applicable-will)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate applicable-will))))

(defrule missing-valid-will-conclusion
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (not (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true|false|conflict)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate valid-will))))

(defrule missing-portion-disposition-observation
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate portion-disposed)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate portion-disposed))))

(defrule missing-disposition-details
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate portion-disposed) (value true))
  (or
    (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary)))
    (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-status))))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate disposition-details))))

(defrule missing-disposition-completeness
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate disposition-set-complete))))

(defrule missing-beneficiary-outcome
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (not (asserted-fact (case-id ?case-id) (subject ?beneficiary) (predicate beneficiary-life-status) (value dead-before-or-same|organization-no-longer-exists)))
  (not (derived-fact (case-id ?case-id) (subject ?beneficiary) (predicate refusal-status) (value true)))
  (not (and
    (asserted-fact (case-id ?case-id) (subject ?beneficiary) (predicate beneficiary-disqualified) (value true))
    (asserted-fact (case-id ?case-id) (subject ?beneficiary) (predicate disqualification-exception) (value false))))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate beneficiary-outcome))))

(defrule detect-inheritance-regime-conflict
  (declare (salience 400))
  (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id ?statutory-rule))
  (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value testamentary) (rule-id ?testamentary-rule))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value conflict)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value conflict)
    (rule-id SYSTEM-REGIME-CONFLICT) (supports ?statutory-rule ?testamentary-rule))))

(defrule unresolved-inheritance-type-path
  (declare (salience 250))
  (analysis-request (case-id ?case-id) (module inheritance-type))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime)))
  (not (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module inheritance-type) (predicate unresolved-rule-path))))
