(defrule project-valid-refusal
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value ?value&true|false) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate valid-refusal) (value ?value) (derivations ?rule))))

(defrule project-unknown-refusal
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate valid-refusal) (value unknown) (derivations))))

(defrule project-unclaimed-estate-recipient
  (declare (salience -400))
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (derived-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-recipient) (value state) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?portion) (module refusal-and-unclaimed) (predicate unclaimed-estate-recipient) (value state) (derivations ?rule))))

(defrule project-unknown-unclaimed-estate
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-recipient)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?portion) (module refusal-and-unclaimed) (predicate unclaimed-estate-recipient) (value unknown) (derivations))))
