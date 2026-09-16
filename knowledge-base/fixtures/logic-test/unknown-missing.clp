; Quick Logic Test fixture
; topic: will-validity
; expected-status: missing-facts
(analysis-request (case-id logic-test-unknown) (subject will-main) (module will-validity))

(asserted-fact (fact-id will-type) (case-id logic-test-unknown) (subject will-main) (predicate will-type) (value written))
(asserted-fact (fact-id mental-state) (case-id logic-test-unknown) (subject will-main) (predicate testator-mental-state) (value lucid))
(asserted-fact (fact-id content) (case-id logic-test-unknown) (subject will-main) (predicate prohibited-content) (value not-detected))
