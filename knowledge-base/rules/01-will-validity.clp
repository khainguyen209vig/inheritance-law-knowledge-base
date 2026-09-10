; Domain rules for module 1: basic validity of a will.
; These rules depend only on domain knowledge. UI/module selection and trace
; formatting are intentionally handled elsewhere.

(defrule R-B01-valid-intention
  (declare (salience 500))
  (asserted-fact
    (fact-id ?mental-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)
    (value lucid))
  (asserted-fact
    (fact-id ?influence-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)
    (value none))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)
    (supports ?mental-fact-id ?influence-fact-id))))

(defrule R-B02-valid-content-and-form
  (declare (salience 500))
  (asserted-fact
    (fact-id ?content-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate prohibited-content)
    (value not-detected))
  (asserted-fact
    (fact-id ?form-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate formal-defect)
    (value not-detected))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true)
    (rule-id R-B02)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true)
    (rule-id R-B02)
    (supports ?content-fact-id ?form-fact-id))))

(defrule R-B03-valid-will
  (declare (salience 500))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-intention)
    (value true))
  (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-content-and-form)
    (value true))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)
    (supports valid-intention=true valid-content-and-form=true))))

; The OR condition from R-B04 is represented as separate production rules.
(defrule R-B04-invalid-will-no-mental-capacity
  (declare (salience 500))
  (asserted-fact
    (fact-id ?mental-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate testator-mental-state)
    (value not-lucid))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (supports ?mental-fact-id))))

(defrule R-B04-invalid-will-undue-influence
  (declare (salience 500))
  (asserted-fact
    (fact-id ?influence-fact-id)
    (case-id ?case-id)
    (subject ?will-id)
    (predicate undue-influence)
    (value ?influence&deception|threat))
  (not (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?will-id)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (supports ?influence-fact-id))))
