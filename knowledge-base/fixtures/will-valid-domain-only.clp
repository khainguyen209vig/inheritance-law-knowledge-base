; Same domain observations as will-valid.clp, intentionally without an
; analysis-request. Domain knowledge must still be derived.

(asserted-fact
  (fact-id domain-only-will-type)
  (case-id case-domain-only)
  (subject will-domain-only-01)
  (predicate will-type)
  (value written))

(asserted-fact
  (fact-id domain-only-mental-state)
  (case-id case-domain-only)
  (subject will-domain-only-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id domain-only-undue-influence)
  (case-id case-domain-only)
  (subject will-domain-only-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id domain-only-prohibited-content)
  (case-id case-domain-only)
  (subject will-domain-only-01)
  (predicate prohibited-content)
  (value not-detected))

(asserted-fact
  (fact-id domain-only-formal-defect)
  (case-id case-domain-only)
  (subject will-domain-only-01)
  (predicate formal-defect)
  (value not-detected))
