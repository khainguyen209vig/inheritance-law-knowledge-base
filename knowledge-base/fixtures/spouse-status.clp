(analysis-request (case-id case-spouse) (subject case-spouse) (module spouse-status))
(asserted-fact (fact-id deceased) (case-id case-spouse) (subject deceased-one) (predicate deceased-person) (value true))

; G01, forward relation.
(asserted-fact (fact-id g01-scope) (case-id case-spouse) (subject spouse-g01) (predicate spouse-status-assessment-subject) (value true))
(asserted-fact (fact-id g01-marriage) (case-id case-spouse) (subject spouse-g01) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id g01-property) (case-id case-spouse) (subject spouse-g01) (predicate joint-property-divided) (value true))
(asserted-fact (fact-id g01-divorce) (case-id case-spouse) (subject spouse-g01) (predicate divorce-petition-pending-at-opening) (value false))
(asserted-fact (fact-id g01-remarriage) (case-id case-spouse) (subject spouse-g01) (predicate remarried-after-opening) (value false))

; G02, reverse relation.
(asserted-fact (fact-id g02-scope) (case-id case-spouse) (subject spouse-g02) (predicate spouse-status-assessment-subject) (value true))
(asserted-fact (fact-id g02-marriage) (case-id case-spouse) (subject deceased-one) (predicate spouse-at-opening) (value spouse-g02))
(asserted-fact (fact-id g02-property) (case-id case-spouse) (subject spouse-g02) (predicate joint-property-divided) (value false))
(asserted-fact (fact-id g02-divorce) (case-id case-spouse) (subject spouse-g02) (predicate divorce-petition-pending-at-opening) (value true))
(asserted-fact (fact-id g02-decision) (case-id case-spouse) (subject spouse-g02) (predicate divorce-decision-effective-at-opening) (value false))
(asserted-fact (fact-id g02-remarriage) (case-id case-spouse) (subject spouse-g02) (predicate remarried-after-opening) (value false))

; G03.
(asserted-fact (fact-id g03-scope) (case-id case-spouse) (subject spouse-g03) (predicate spouse-status-assessment-subject) (value true))
(asserted-fact (fact-id g03-marriage) (case-id case-spouse) (subject spouse-g03) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id g03-property) (case-id case-spouse) (subject spouse-g03) (predicate joint-property-divided) (value false))
(asserted-fact (fact-id g03-divorce) (case-id case-spouse) (subject spouse-g03) (predicate divorce-petition-pending-at-opening) (value false))
(asserted-fact (fact-id g03-remarriage) (case-id case-spouse) (subject spouse-g03) (predicate remarried-after-opening) (value true))

; No special circumstance: UNKNOWN is not an adverse marital conclusion.
(asserted-fact (fact-id none-scope) (case-id case-spouse) (subject spouse-none) (predicate spouse-status-assessment-subject) (value true))
(asserted-fact (fact-id none-marriage) (case-id case-spouse) (subject spouse-none) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id none-property) (case-id case-spouse) (subject spouse-none) (predicate joint-property-divided) (value false))
(asserted-fact (fact-id none-divorce) (case-id case-spouse) (subject spouse-none) (predicate divorce-petition-pending-at-opening) (value false))
(asserted-fact (fact-id none-remarriage) (case-id case-spouse) (subject spouse-none) (predicate remarried-after-opening) (value false))

; Pending divorce requires an explicit decision-effect observation.
(asserted-fact (fact-id missing-scope) (case-id case-spouse) (subject spouse-missing) (predicate spouse-status-assessment-subject) (value true))
(asserted-fact (fact-id missing-marriage) (case-id case-spouse) (subject spouse-missing) (predicate spouse-at-opening) (value deceased-one))
(asserted-fact (fact-id missing-property) (case-id case-spouse) (subject spouse-missing) (predicate joint-property-divided) (value false))
(asserted-fact (fact-id missing-divorce) (case-id case-spouse) (subject spouse-missing) (predicate divorce-petition-pending-at-opening) (value true))
(asserted-fact (fact-id missing-remarriage) (case-id case-spouse) (subject spouse-missing) (predicate remarried-after-opening) (value false))
