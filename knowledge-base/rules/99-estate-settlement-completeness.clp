(defrule missing-obligation-type
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate estate-obligation) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate obligation-type)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?obligation) (module estate-settlement) (predicate obligation-type))))

(defrule missing-distribution-beneficiary-completeness
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary-set-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate distribution-beneficiary-set-complete))))

(defrule missing-distribution-beneficiary
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate distribution-beneficiary))))

(defrule missing-testamentary-share-observation
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-shares-specified)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate testamentary-shares-specified))))

(defrule missing-alternative-share-agreement-observation
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?group) (predicate alternative-share-agreement)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate alternative-share-agreement))))
