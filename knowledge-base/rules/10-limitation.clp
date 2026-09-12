; Article 623 is represented as temporal classification knowledge. CLIPS selects
; the applicable duration; calendar arithmetic remains in the temporal adapter.

(defrule R-J01-immovable-estate-division-period
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?type) (case-id ?case-id) (subject ?request) (predicate request-type) (value divide-estate))
  (asserted-fact (fact-id ?asset) (case-id ?case-id) (subject ?request) (predicate asset-type) (value immovable))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years) (value 30) (rule-id R-J01) (supports ?scope ?type ?asset))))

(defrule R-J02-movable-estate-division-period
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?type) (case-id ?case-id) (subject ?request) (predicate request-type) (value divide-estate))
  (asserted-fact (fact-id ?asset) (case-id ?case-id) (subject ?request) (predicate asset-type) (value movable))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years) (value 10) (rule-id R-J02) (supports ?scope ?type ?asset))))

(defrule R-J03-inheritance-right-period
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?type) (case-id ?case-id) (subject ?request) (predicate request-type) (value confirm-or-deny-inheritance-right))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years) (value 10) (rule-id R-J03) (supports ?scope ?type))))

(defrule R-J04-estate-obligation-period
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?type) (case-id ?case-id) (subject ?request) (predicate request-type) (value perform-estate-obligation))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?request) (predicate limitation-period-years) (value 3) (rule-id R-J04) (supports ?scope ?type))))
