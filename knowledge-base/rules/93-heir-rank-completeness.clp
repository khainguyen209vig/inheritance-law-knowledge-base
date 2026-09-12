(defrule SYSTEM-RANK-CONFLICT
  (declare (salience 450))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?first&1|2|3) (rule-id ?first-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?second&1|2|3) (rule-id ?second-rule))
  (test (neq ?first ?second))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value conflict) (rule-id SYSTEM-RANK-CONFLICT) (supports ?first-rule ?second-rule))))

(defrule missing-heir-relationship
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-rank-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate relationship-at-opening))))

(defrule missing-heir-eligibility-status
  (declare (salience 180))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1|2|3))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate article-621-status))))

(defrule missing-heir-life-status
  (declare (salience 180))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1|2|3))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate heir-life-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate heir-life-status))))

(defrule missing-heir-refusal-status
  (declare (salience 180))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1|2|3))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate valid-refusal))))

(defrule missing-heir-search-completeness
  (declare (salience 180))
  (analysis-request (case-id ?case-id) (module heir-rank))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value 1|2|3))
  (not (asserted-fact (case-id ?case-id) (predicate heir-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module heir-rank) (predicate heir-search-complete))))
