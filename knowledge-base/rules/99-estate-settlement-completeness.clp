(defrule missing-obligation-type
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate estate-obligation) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate obligation-type)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?obligation) (module estate-settlement) (predicate obligation-type))))
