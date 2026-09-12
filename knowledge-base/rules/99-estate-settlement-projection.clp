(defrule project-payment-priority
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?obligation) (predicate payment-priority) (value ?priority) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?obligation) (module estate-settlement) (predicate payment-priority) (value ?priority) (derivations ?rule))))

(defrule project-unknown-payment-priority
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate estate-obligation) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?obligation) (predicate payment-priority)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?obligation) (module estate-settlement) (predicate payment-priority) (value unknown) (derivations))))

(defrule project-equal-testamentary-share-principle
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies) (value ?value&true|false) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate equal-testamentary-share-principle-applies) (value ?value) (derivations ?rule))))

(defrule project-unknown-equal-testamentary-share-principle
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?group) (module estate-settlement) (predicate equal-testamentary-share-principle-applies) (value unknown) (derivations))))

(defrule project-prenatal-share-reservation
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share) (value true) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate reserve-equal-share) (value true) (derivations ?rule))))

(defrule project-prenatal-born-alive-outcome
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-vests-in-child) (value true) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate reserved-share-vests-in-child) (value true) (derivations ?rule))))

(defrule project-prenatal-death-outcome
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-returns-to-other-heirs) (value true) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate reserved-share-returns-to-other-heirs) (value true) (derivations ?rule))))

(defrule project-unknown-prenatal-share-reservation
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate prenatal-share-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?person) (module estate-settlement) (predicate reserve-equal-share) (value unknown) (derivations))))

(defrule project-distribution-not-before-date
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?restriction) (predicate distribution-not-before) (value ?date) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?restriction) (module estate-settlement) (predicate distribution-not-before) (value ?date) (derivations ?rule))))

(defrule project-unknown-division-restriction
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?restriction) (predicate division-restriction-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?restriction) (predicate distribution-not-before)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?restriction) (module estate-settlement) (predicate distribution-not-before) (value unknown) (derivations))))

(defrule project-hardship-results
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (derived-fact (case-id ?case-id) (subject ?spouse) (predicate ?predicate&court-deferral-may-be-requested|initial-deferral-maximum-years|court-extension-may-be-requested|extension-maximum-years|extension-maximum-count) (value ?value) (rule-id ?rule))
  =>
  (assert (module-result (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate ?predicate) (value ?value) (derivations ?rule))))

(defrule project-unknown-hardship-assessment
  (declare (salience -500))
  (analysis-request (case-id ?case-id) (module estate-settlement))
  (asserted-fact (case-id ?case-id) (subject ?spouse) (predicate division-hardship-assessment-subject) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?spouse) (predicate court-deferral-may-be-requested)))
  =>
  (assert (module-result (case-id ?case-id) (subject ?spouse) (module estate-settlement) (predicate court-deferral-may-be-requested) (value unknown) (derivations))))
