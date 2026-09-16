; Quick Logic Test fixture
; topic: will-validity
; expected-status: conflict
(analysis-request (case-id logic-test-conflict) (subject will-main) (module will-validity))

(asserted-fact (fact-id will-type) (case-id logic-test-conflict) (subject will-main) (predicate will-type) (value written))
(asserted-fact (fact-id mental-lucid) (case-id logic-test-conflict) (subject will-main) (predicate testator-mental-state) (value lucid))
(asserted-fact (fact-id mental-not-lucid) (case-id logic-test-conflict) (subject will-main) (predicate testator-mental-state) (value not-lucid))
(asserted-fact (fact-id influence) (case-id logic-test-conflict) (subject will-main) (predicate undue-influence) (value none))
(asserted-fact (fact-id content) (case-id logic-test-conflict) (subject will-main) (predicate prohibited-content) (value not-detected))
(asserted-fact (fact-id form) (case-id logic-test-conflict) (subject will-main) (predicate formal-defect) (value not-detected))
