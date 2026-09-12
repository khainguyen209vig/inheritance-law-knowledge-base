(defrule project-limitation-period
  (analysis-request (case-id ?case-id) (module limitation))
  (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years) (value ?years) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?request) (module limitation) (predicate limitation-period-years) (value ?years) (derivations ?rule))))

(defrule project-unknown-limitation-period
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?request) (module limitation) (predicate limitation-period-years) (value unknown) (derivations))))
