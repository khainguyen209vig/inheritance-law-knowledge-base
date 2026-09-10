(analysis-request
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (module will-validity))

(asserted-fact
  (fact-id unresolved-will-type)
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (predicate will-type)
  (value written))

(asserted-fact
  (fact-id unresolved-mental-state)
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id unresolved-undue-influence)
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id unresolved-prohibited-content)
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (predicate prohibited-content)
  (value detected))

(asserted-fact
  (fact-id unresolved-formal-defect)
  (case-id case-unresolved)
  (subject will-unresolved-01)
  (predicate formal-defect)
  (value detected))
