(analysis-request
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (module will-validity))

(asserted-fact
  (fact-id minor-valid-age)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate testator-age)
  (value 17))

(asserted-fact
  (fact-id minor-valid-will-type)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate will-type)
  (value written))

(asserted-fact
  (fact-id minor-valid-guardian-consent)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate guardian-consent)
  (value true))

(asserted-fact
  (fact-id minor-valid-mental-state)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id minor-valid-undue-influence)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id minor-valid-prohibited-content)
  (case-id case-minor-valid)
  (subject will-minor-valid-01)
  (predicate prohibited-content)
  (value not-detected))
