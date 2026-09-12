(defrule missing-limitation-request-type
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?request) (predicate request-type)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?request) (module limitation) (predicate request-type))))

(defrule missing-division-asset-type
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?request) (predicate request-type) (value divide-estate))
  (not (asserted-fact (case-id ?case-id) (subject ?request) (predicate asset-type)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?request) (module limitation) (predicate asset-type))))

(defrule missing-inheritance-opening-date
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?request) (predicate limitation-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?request) (predicate inheritance-opening-date)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?request) (module limitation) (predicate inheritance-opening-date))))

(defrule missing-limitation-expiry-confirmation
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?asset) (module limitation) (predicate limitation-expiry-confirmed))))

(defrule missing-managing-heir-search-completeness
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate estate-managing-heir)))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate managing-heir-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?asset) (module limitation) (predicate managing-heir-search-complete))))

(defrule missing-qualified-possessor-search-completeness
  (analysis-request (case-id ?case-id) (module limitation))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate post-limitation-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate limitation-expiry-confirmed) (value true))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate managing-heir-search-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate estate-managing-heir)))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate article-236-qualified-possessor)))
  (not (asserted-fact (case-id ?case-id) (subject ?asset) (predicate qualified-possessor-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?asset) (module limitation) (predicate qualified-possessor-search-complete))))
