(analysis-request
  (case-id case-oral-revoked)
  (subject will-oral-revoked-01)
  (module will-validity))

(asserted-fact
  (fact-id oral-revoked-will-type)
  (case-id case-oral-revoked)
  (subject will-oral-revoked-01)
  (predicate will-type)
  (value oral))

(asserted-fact
  (fact-id oral-revoked-alive)
  (case-id case-oral-revoked)
  (subject will-oral-revoked-01)
  (predicate testator-alive-after-three-months)
  (value true))

(asserted-fact
  (fact-id oral-revoked-lucid)
  (case-id case-oral-revoked)
  (subject will-oral-revoked-01)
  (predicate testator-mental-state-after-three-months)
  (value lucid))
