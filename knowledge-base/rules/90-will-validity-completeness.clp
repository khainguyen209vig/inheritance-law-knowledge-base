; Control/completeness knowledge for the will-validity module.
; analysis-request appears here, never in the domain rules.

(defrule missing-testator-mental-state
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate testator-mental-state)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate testator-mental-state))))

(defrule missing-undue-influence
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate undue-influence)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate undue-influence))))

(defrule missing-prohibited-content-observation
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prohibited-content)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate prohibited-content)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate prohibited-content))))

(defrule missing-formal-defect-observation
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate formal-defect)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate formal-defect)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate formal-defect))))

; Explicitly represent incompatible conclusions rather than silently choosing
; one using salience.
(defrule detect-valid-will-conflict
  (declare (salience 400))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id ?true-rule))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id ?false-rule))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value conflict)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value conflict)
    (rule-id SYSTEM-CONFLICT)
    (supports ?true-rule ?false-rule))))
