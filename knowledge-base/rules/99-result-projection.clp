; Presentation rules select a public result for the requested module. They do
; not derive legal knowledge.

(defrule project-conflicting-will-validity
  (declare (salience 100))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value conflict)
    (rule-id ?rule-id))
  (not (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)))
  =>
  (assert (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)
    (value conflict)
    (derivations ?rule-id))))

(defrule project-conclusive-will-validity
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value ?value&true|false)
    (rule-id ?rule-id))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value conflict)))
  (not (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)))
  =>
  (assert (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)
    (value ?value)
    (derivations ?rule-id))))

(defrule project-unknown-will-validity
  (declare (salience -100))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true|false|conflict)))
  (not (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)))
  =>
  (assert (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate valid-will)
    (value unknown)
    (derivations SYSTEM-INCOMPLETE))))

(defrule project-will-current-effect
  (declare (salience 50))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-currently-effective)
    (value ?value&true|false)
    (rule-id ?rule-id))
  (not (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate will-currently-effective)))
  =>
  (assert (module-result
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate will-currently-effective)
    (value ?value)
    (derivations ?rule-id))))
