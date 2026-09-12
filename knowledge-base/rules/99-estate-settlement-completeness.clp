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

(defrule missing-prenatal-status-at-distribution
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate prenatal-share-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate prenatal-status-at-distribution)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate prenatal-status-at-distribution))))

(defrule missing-prenatal-candidate-rank
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate prenatal-share-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate candidate-heir-rank))))

(defrule missing-prenatal-active-rank
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate prenatal-share-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate active-heir-rank))))

(defrule missing-division-restriction-basis
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate division-restriction-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate division-restriction-basis)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?restriction) (module estate-settlement) (predicate division-restriction-basis))))

(defrule missing-all-heirs-agreement-confirmation
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate division-restriction-basis) (value all-heirs-agreement))
  (not (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate all-heirs-agreed) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?restriction) (module estate-settlement) (predicate all-heirs-agreed))))

(defrule missing-specified-division-date
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate division-restriction-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate specified-division-date)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?restriction) (module estate-settlement) (predicate specified-division-date))))

(defrule missing-hardship-division-request
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate division-hardship-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate estate-division-requested)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate estate-division-requested))))

(defrule missing-hardship-impact-observation
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate division-hardship-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate serious-division-impact)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate serious-division-impact))))

(defrule missing-hardship-spouse-life-status
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate division-hardship-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate heir-life-status) (value alive)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate surviving-spouse-life-status))))

(defrule missing-hardship-spouse-relationship
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate division-hardship-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate spouse-at-opening) (value ?deceased)))
  (not (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?spouse)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate spouse-at-opening))))
