(analysis-request (case-id case-refusal-h) (subject case-refusal-h) (module refusal-and-unclaimed))
(asserted-fact (fact-id deceased) (case-id case-refusal-h) (subject deceased-one) (predicate deceased-person) (value true))
(asserted-fact (fact-id heir-search) (case-id case-refusal-h) (subject case-refusal-h) (predicate heir-search-complete) (value true))

; Valid refusal requires content, written notice, a lawful recipient and timing.
(asserted-fact (fact-id valid-scope) (case-id case-refusal-h) (subject person-valid) (predicate refusal-assessment-subject) (value true))
(asserted-fact (fact-id valid-made) (case-id case-refusal-h) (subject person-valid) (predicate refusal-made) (value true))
(asserted-fact (fact-id valid-intent) (case-id case-refusal-h) (subject person-valid) (predicate refusal-intent) (value ordinary))
(asserted-fact (fact-id valid-written) (case-id case-refusal-h) (subject person-valid) (predicate refusal-written) (value true))
(asserted-fact (fact-id valid-recipient) (case-id case-refusal-h) (subject person-valid) (predicate refusal-notice-recipient) (value estate-manager))
(asserted-fact (fact-id valid-timing) (case-id case-refusal-h) (subject person-valid) (predicate refusal-before-estate-distribution) (value true))

; Avoiding an obligation is explicitly invalid.
(asserted-fact (fact-id avoid-scope) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-assessment-subject) (value true))
(asserted-fact (fact-id avoid-made) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-made) (value true))
(asserted-fact (fact-id avoid-intent) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-intent) (value avoid-obligation))
(asserted-fact (fact-id avoid-written) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-written) (value true))
(asserted-fact (fact-id avoid-recipient) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-notice-recipient) (value other-heir))
(asserted-fact (fact-id avoid-timing) (case-id case-refusal-h) (subject person-avoid) (predicate refusal-before-estate-distribution) (value true))

; Missing recipient stays unknown.
(asserted-fact (fact-id missing-scope) (case-id case-refusal-h) (subject person-missing) (predicate refusal-assessment-subject) (value true))
(asserted-fact (fact-id missing-made) (case-id case-refusal-h) (subject person-missing) (predicate refusal-made) (value true))
(asserted-fact (fact-id missing-intent) (case-id case-refusal-h) (subject person-missing) (predicate refusal-intent) (value ordinary))
(asserted-fact (fact-id missing-written) (case-id case-refusal-h) (subject person-missing) (predicate refusal-written) (value true))
(asserted-fact (fact-id missing-timing) (case-id case-refusal-h) (subject person-missing) (predicate refusal-before-estate-distribution) (value true))

; Closed-world recipient search for one estate portion.
(asserted-fact (fact-id portion-state) (case-id case-refusal-h) (subject portion-state) (predicate estate-portion) (value true))
(asserted-fact (fact-id portion-state-scope) (case-id case-refusal-h) (subject portion-state) (predicate unclaimed-estate-assessment-subject) (value true))
(asserted-fact (fact-id portion-state-testamentary) (case-id case-refusal-h) (subject portion-state) (predicate testamentary-beneficiary-search-complete) (value true))
(asserted-fact (fact-id portion-state-remaining) (case-id case-refusal-h) (subject portion-state) (predicate remaining-estate-after-obligations) (value true))

; An effective testamentary disposition blocks R-H04.
(asserted-fact (fact-id portion-claimed) (case-id case-refusal-h) (subject portion-claimed) (predicate estate-portion) (value true))
(asserted-fact (fact-id portion-claimed-scope) (case-id case-refusal-h) (subject portion-claimed) (predicate unclaimed-estate-assessment-subject) (value true))
(asserted-fact (fact-id portion-claimed-testamentary) (case-id case-refusal-h) (subject portion-claimed) (predicate testamentary-beneficiary-search-complete) (value true))
(asserted-fact (fact-id portion-claimed-status) (case-id case-refusal-h) (subject portion-claimed) (predicate disposition-status) (value effective))
(asserted-fact (fact-id portion-claimed-remaining) (case-id case-refusal-h) (subject portion-claimed) (predicate remaining-estate-after-obligations) (value true))
