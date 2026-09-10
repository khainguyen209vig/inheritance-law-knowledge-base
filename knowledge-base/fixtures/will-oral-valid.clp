(analysis-request
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (module will-validity))

(asserted-fact
  (fact-id oral-valid-will-type)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate will-type)
  (value oral))

(asserted-fact
  (fact-id oral-valid-witness-count)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate witness-count)
  (value 2))

(asserted-fact
  (fact-id oral-valid-record)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate witnesses-recorded)
  (value true))

(asserted-fact
  (fact-id oral-valid-signatures)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate witnesses-signed)
  (value true))

(asserted-fact
  (fact-id oral-valid-certification-period)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate certified-within-days)
  (value 5))

(asserted-fact
  (fact-id oral-valid-mental-state)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate testator-mental-state)
  (value lucid))

(asserted-fact
  (fact-id oral-valid-undue-influence)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate undue-influence)
  (value none))

(asserted-fact
  (fact-id oral-valid-prohibited-content)
  (case-id case-oral-valid)
  (subject will-oral-valid-01)
  (predicate prohibited-content)
  (value not-detected))
