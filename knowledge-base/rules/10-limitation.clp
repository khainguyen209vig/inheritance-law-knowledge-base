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

(defrule R-J05-managing-heir-receives-after-limitation
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?expired) (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed) (value true))
  (asserted-fact (fact-id ?manager) (case-id ?case-id) (subject ?asset) (predicate estate-managing-heir) (value ?person))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-recipient) (value managing-heir) (rule-id R-J05) (supports ?scope ?expired ?manager))))

(defrule R-J06-qualified-possessor-receives-after-limitation
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?expired) (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed) (value true))
  (asserted-fact (fact-id ?heir-search) (case-id ?case-id) (subject ?asset) (predicate managing-heir-search-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate estate-managing-heir)))
  (asserted-fact (fact-id ?possessor) (case-id ?case-id) (subject ?asset) (predicate article-236-qualified-possessor) (value ?person))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-recipient) (value qualified-possessor) (rule-id R-J06) (supports ?scope ?expired ?heir-search ?possessor))))

(defrule R-J07-state-receives-after-complete-search
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (asserted-fact (fact-id ?expired) (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed) (value true))
  (asserted-fact (fact-id ?heir-search) (case-id ?case-id) (subject ?asset) (predicate managing-heir-search-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate estate-managing-heir)))
  (asserted-fact (fact-id ?possessor-search) (case-id ?case-id) (subject ?asset) (predicate qualified-possessor-search-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate article-236-qualified-possessor)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-recipient) (value state) (rule-id R-J07) (supports ?scope ?expired ?heir-search ?possessor-search))))
