(analysis-request
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (module will-validity))

(asserted-fact
  (fact-id minor-invalid-age)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate testator-age)
  (value 17))

(asserted-fact
  (fact-id minor-invalid-will-type)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate will-type)
  (value written))

(asserted-fact
  (fact-id minor-invalid-guardian-consent)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate guardian-consent)
  (value false))

(asserted-fact
  (fact-id minor-invalid-mental-state)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id minor-invalid-undue-influence)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id minor-invalid-prohibited-content)
  (case-id case-minor-invalid)
  (subject will-minor-invalid-01)
  (predicate prohibited-content)
  (value not-detected))
