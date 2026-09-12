(analysis-request (case-id settlement-fixture) (subject settlement-fixture) (module estate-settlement))

(asserted-fact (fact-id funeral-entity) (case-id settlement-fixture) (subject funeral-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id funeral-type) (case-id settlement-fixture) (subject funeral-one) (predicate obligation-type) (value funeral-expense))

(asserted-fact (fact-id tax-entity) (case-id settlement-fixture) (subject tax-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id tax-type) (case-id settlement-fixture) (subject tax-one) (predicate obligation-type) (value tax-and-state-dues))

(asserted-fact (fact-id unknown-entity) (case-id settlement-fixture) (subject unknown-one) (predicate estate-obligation) (value true))
