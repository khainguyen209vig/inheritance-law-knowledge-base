; Usage: clips -f2 knowledge-base/run-fixture.clp
(load "knowledge-base/templates.clp")
(load "knowledge-base/rules/01-will-validity.clp")
(reset)
(load-facts "knowledge-base/fixtures/will-valid.clp")
(run)
(facts)
(exit)

