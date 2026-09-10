(analysis-request
  (case-id case-invalid)
  (subject will-invalid-01)
  (module will-validity))

(asserted-fact
  (fact-id invalid-mental-state)
  (case-id case-invalid)
  (subject will-invalid-01)
  (predicate testator-mental-state)
  (value not-lucid))

(asserted-fact
  (fact-id invalid-undue-influence)
  (case-id case-invalid)
  (subject will-invalid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id invalid-prohibited-content)
  (case-id case-invalid)
  (subject will-invalid-01)
  (predicate prohibited-content)
  (value not-detected))

(asserted-fact
  (fact-id invalid-formal-defect)
  (case-id case-invalid)
  (subject will-invalid-01)
  (predicate formal-defect)
  (value not-detected))
