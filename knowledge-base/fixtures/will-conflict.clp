(analysis-request
  (case-id case-conflict)
  (subject will-conflict-01)
  (module will-validity))

(asserted-fact
  (fact-id conflict-will-type)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate will-type)
  (value written))

; Two incompatible observations are intentional in this fixture.
(asserted-fact
  (fact-id conflict-mental-state-lucid)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id conflict-mental-state-not-lucid)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate testator-mental-state)
  (value not-lucid))

(asserted-fact
  (fact-id conflict-undue-influence)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id conflict-prohibited-content)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate prohibited-content)
  (value not-detected))

(asserted-fact
  (fact-id conflict-formal-defect)
  (case-id case-conflict)
  (subject will-conflict-01)
  (predicate formal-defect)
  (value not-detected))
