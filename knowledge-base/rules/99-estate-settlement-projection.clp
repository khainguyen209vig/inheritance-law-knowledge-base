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
