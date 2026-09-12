(analysis-request (case-id limitation-fixture) (subject limitation-fixture) (module limitation))

(asserted-fact (fact-id immovable-scope) (case-id limitation-fixture) (subject immovable-request) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id immovable-type) (case-id limitation-fixture) (subject immovable-request) (predicate request-type) (value divide-estate))
(asserted-fact (fact-id immovable-asset) (case-id limitation-fixture) (subject immovable-request) (predicate asset-type) (value immovable))
(asserted-fact (fact-id immovable-opening) (case-id limitation-fixture) (subject immovable-request) (predicate inheritance-opening-date) (value "2020-02-29"))

(asserted-fact (fact-id movable-scope) (case-id limitation-fixture) (subject movable-request) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id movable-type) (case-id limitation-fixture) (subject movable-request) (predicate request-type) (value divide-estate))
(asserted-fact (fact-id movable-asset) (case-id limitation-fixture) (subject movable-request) (predicate asset-type) (value movable))
(asserted-fact (fact-id movable-opening) (case-id limitation-fixture) (subject movable-request) (predicate inheritance-opening-date) (value "2020-01-15"))

(asserted-fact (fact-id right-scope) (case-id limitation-fixture) (subject right-request) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id right-type) (case-id limitation-fixture) (subject right-request) (predicate request-type) (value confirm-or-deny-inheritance-right))
(asserted-fact (fact-id right-opening) (case-id limitation-fixture) (subject right-request) (predicate inheritance-opening-date) (value "2020-01-15"))

(asserted-fact (fact-id obligation-scope) (case-id limitation-fixture) (subject obligation-request) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id obligation-type) (case-id limitation-fixture) (subject obligation-request) (predicate request-type) (value perform-estate-obligation))
(asserted-fact (fact-id obligation-opening) (case-id limitation-fixture) (subject obligation-request) (predicate inheritance-opening-date) (value "2020-01-15"))

(asserted-fact (fact-id unknown-scope) (case-id limitation-fixture) (subject unknown-request) (predicate limitation-assessment-subject) (value true))
(asserted-fact (fact-id unknown-type) (case-id limitation-fixture) (subject unknown-request) (predicate request-type) (value divide-estate))

(asserted-fact (fact-id managed-scope) (case-id limitation-fixture) (subject managed-asset) (predicate post-limitation-assessment-subject) (value true))
(asserted-fact (fact-id managed-expired) (case-id limitation-fixture) (subject managed-asset) (predicate limitation-expiry-confirmed) (value true))
(asserted-fact (fact-id managed-heir) (case-id limitation-fixture) (subject managed-asset) (predicate estate-managing-heir) (value heir-one))

(asserted-fact (fact-id possessed-scope) (case-id limitation-fixture) (subject possessed-asset) (predicate post-limitation-assessment-subject) (value true))
(asserted-fact (fact-id possessed-expired) (case-id limitation-fixture) (subject possessed-asset) (predicate limitation-expiry-confirmed) (value true))
(asserted-fact (fact-id possessed-heir-search) (case-id limitation-fixture) (subject possessed-asset) (predicate managing-heir-search-complete) (value true))
(asserted-fact (fact-id possessed-person) (case-id limitation-fixture) (subject possessed-asset) (predicate article-236-qualified-possessor) (value possessor-one))

(asserted-fact (fact-id state-scope) (case-id limitation-fixture) (subject state-asset) (predicate post-limitation-assessment-subject) (value true))
(asserted-fact (fact-id state-expired) (case-id limitation-fixture) (subject state-asset) (predicate limitation-expiry-confirmed) (value true))
(asserted-fact (fact-id state-heir-search) (case-id limitation-fixture) (subject state-asset) (predicate managing-heir-search-complete) (value true))
(asserted-fact (fact-id state-possessor-search) (case-id limitation-fixture) (subject state-asset) (predicate qualified-possessor-search-complete) (value true))

(asserted-fact (fact-id outcome-unknown-scope) (case-id limitation-fixture) (subject outcome-unknown-asset) (predicate post-limitation-assessment-subject) (value true))
(asserted-fact (fact-id outcome-unknown-expired) (case-id limitation-fixture) (subject outcome-unknown-asset) (predicate limitation-expiry-confirmed) (value true))
