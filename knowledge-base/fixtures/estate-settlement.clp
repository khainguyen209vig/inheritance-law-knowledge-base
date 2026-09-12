(analysis-request (case-id settlement-fixture) (subject settlement-fixture) (module estate-settlement))

(asserted-fact (fact-id funeral-entity) (case-id settlement-fixture) (subject funeral-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id funeral-type) (case-id settlement-fixture) (subject funeral-one) (predicate obligation-type) (value funeral-expense))

(asserted-fact (fact-id tax-entity) (case-id settlement-fixture) (subject tax-one) (predicate estate-obligation) (value true))
(asserted-fact (fact-id tax-type) (case-id settlement-fixture) (subject tax-one) (predicate obligation-type) (value tax-and-state-dues))

(asserted-fact (fact-id unknown-entity) (case-id settlement-fixture) (subject unknown-one) (predicate estate-obligation) (value true))

(asserted-fact (fact-id equal-group) (case-id settlement-fixture) (subject group-equal) (predicate testamentary-distribution-group) (value true))
(asserted-fact (fact-id equal-complete) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary-set-complete) (value true))
(asserted-fact (fact-id equal-person-one) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary) (value person-one))
(asserted-fact (fact-id equal-person-two) (case-id settlement-fixture) (subject group-equal) (predicate distribution-beneficiary) (value person-two))
(asserted-fact (fact-id equal-shares) (case-id settlement-fixture) (subject group-equal) (predicate testamentary-shares-specified) (value false))
(asserted-fact (fact-id equal-agreement) (case-id settlement-fixture) (subject group-equal) (predicate alternative-share-agreement) (value false))

(asserted-fact (fact-id specified-group) (case-id settlement-fixture) (subject group-specified) (predicate testamentary-distribution-group) (value true))
(asserted-fact (fact-id specified-shares) (case-id settlement-fixture) (subject group-specified) (predicate testamentary-shares-specified) (value true))

(asserted-fact (fact-id missing-group) (case-id settlement-fixture) (subject group-missing) (predicate testamentary-distribution-group) (value true))
