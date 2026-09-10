(analysis-request
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (module will-validity))

(asserted-fact
  (fact-id accessibility-condition)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate physical-limitation)
  (value true))

(asserted-fact
  (fact-id accessibility-will-type)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate will-type)
  (value written))

(asserted-fact
  (fact-id accessibility-witness-preparation)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate prepared-by-witness)
  (value true))

(asserted-fact
  (fact-id accessibility-certification)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate notarized-or-certified)
  (value true))

(asserted-fact
  (fact-id accessibility-mental-state)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id accessibility-undue-influence)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id accessibility-prohibited-content)
  (case-id case-accessibility-valid)
  (subject will-accessibility-valid-01)
  (predicate prohibited-content)
  (value not-detected))
