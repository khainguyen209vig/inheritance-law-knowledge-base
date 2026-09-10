; Control/completeness knowledge for the will-validity module.
; analysis-request appears here, never in the domain rules.

(defrule missing-will-type
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate will-type)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate will-type))))

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
  (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate will-type)
    (value written))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-form-requirements)
    (value true)))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate minor-special-requirement)
    (value failed)))
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

(defrule missing-minor-guardian-consent
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-age)
    (value ?age&:(and (>= ?age 15) (< ?age 18))))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate guardian-consent)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate guardian-consent)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate guardian-consent))))

(defrule missing-accessibility-witness-preparation
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (or
    (asserted-fact
      (case-id ?case-id)
      (subject ?will-id)
      (predicate physical-limitation)
      (value true))
    (asserted-fact
      (case-id ?case-id)
      (subject ?will-id)
      (predicate testator-literacy)
      (value illiterate)))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prepared-by-witness)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate prepared-by-witness)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate prepared-by-witness))))

(defrule missing-accessibility-certification
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (or
    (asserted-fact
      (case-id ?case-id)
      (subject ?will-id)
      (predicate physical-limitation)
      (value true))
    (asserted-fact
      (case-id ?case-id)
      (subject ?will-id)
      (predicate testator-literacy)
      (value illiterate)))
  (not (asserted-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate notarized-or-certified)))
  (not (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate notarized-or-certified)))
  =>
  (assert (missing-requirement
    (case-id ?case-id)
    (subject ?will-id)
    (module will-validity)
    (predicate notarized-or-certified))))

(defrule missing-oral-witness-count
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate will-type) (value oral))
  (not (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate witness-count)))
  (not (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witness-count)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witness-count))))

(defrule missing-oral-record
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate will-type) (value oral))
  (not (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate witnesses-recorded)))
  (not (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witnesses-recorded)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witnesses-recorded))))

(defrule missing-oral-signatures
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate will-type) (value oral))
  (not (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate witnesses-signed)))
  (not (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witnesses-signed)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate witnesses-signed))))

(defrule missing-oral-certification-period
  (declare (salience 300))
  (analysis-request (case-id ?case-id) (subject ?will-id) (module will-validity))
  (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate will-type) (value oral))
  (not (asserted-fact (case-id ?case-id) (subject ?will-id) (predicate certified-within-days)))
  (not (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate certified-within-days)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?will-id) (module will-validity) (predicate certified-within-days))))

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
