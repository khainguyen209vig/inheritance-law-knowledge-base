(analysis-request
  (case-id case-valid)
  (subject will-valid-01)
  (module will-validity))

(asserted-fact
  (fact-id valid-mental-state)
  (case-id case-valid)
  (subject will-valid-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id valid-undue-influence)
  (case-id case-valid)
  (subject will-valid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id valid-prohibited-content)
  (case-id case-valid)
  (subject will-valid-01)
  (predicate prohibited-content)
  (value not-detected))

(asserted-fact
  (fact-id valid-formal-defect)
  (case-id case-valid)
  (subject will-valid-01)
  (predicate formal-defect)
  (value not-detected))
