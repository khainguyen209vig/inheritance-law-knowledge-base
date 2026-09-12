(defrule missing-refusal-made-observation
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-made)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate refusal-made))))

(defrule missing-refusal-intent
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-intent)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate refusal-intent))))

(defrule missing-refusal-written
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-written)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate refusal-written))))

(defrule missing-refusal-recipient
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-written) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-notice-recipient)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate refusal-notice-recipient))))

(defrule missing-refusal-timing
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate refusal-before-estate-distribution)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module refusal-and-unclaimed) (predicate refusal-before-estate-distribution))))

(defrule missing-testamentary-beneficiary-search
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate testamentary-beneficiary-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module refusal-and-unclaimed) (predicate testamentary-beneficiary-search-complete))))

(defrule missing-statutory-heir-search
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module refusal-and-unclaimed) (predicate heir-search-complete))))

(defrule missing-remaining-estate-observation
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate remaining-estate-after-obligations)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?portion) (module refusal-and-unclaimed) (predicate remaining-estate-after-obligations))))
