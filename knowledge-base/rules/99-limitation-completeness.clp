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
