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

(defrule project-post-limitation-recipient
  (analysis-request (case-id ?case-id) (module limitation))
  (derived-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-recipient) (value ?recipient) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?asset) (module limitation) (predicate post-limitation-recipient) (value ?recipient) (derivations ?rule))))

(defrule project-unknown-post-limitation-recipient
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-recipient)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?asset) (module limitation) (predicate post-limitation-recipient) (value unknown) (derivations))))
