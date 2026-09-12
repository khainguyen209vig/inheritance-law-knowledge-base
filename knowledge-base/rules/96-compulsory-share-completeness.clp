(defrule missing-compulsory-family-graph-completeness
  (declare (salience 230))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate family-graph-completeness))))

(defrule missing-compulsory-child-age
  (declare (salience 230))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of|adoptive-parent-of) (value ?person))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate age-group)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate age-group))))

(defrule missing-adult-child-work-capacity
  (declare (salience 230))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of|adoptive-parent-of) (value ?person))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate age-group) (value adult))
  (not (asserted-fact (case-id ?case-id) (subject ?person) (predicate work-capacity-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate work-capacity-status))))

(defrule missing-compulsory-candidate-refusal
  (declare (salience 220))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate valid-refusal))))

(defrule missing-compulsory-candidate-eligibility
  (declare (salience 220))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share) (predicate article-621-status))))

(defrule COMPULSORY-CANDIDATE-NOT-IN-PROTECTED-CLASS
  (declare (salience 100))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true))
  (not (missing-requirement (case-id ?case-id) (subject ?person) (module compulsory-share)))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value false) (rule-id COMPULSORY-CANDIDATE-NOT-IN-PROTECTED-CLASS) (supports family-graph-complete))))

(defrule missing-compulsory-calculation-person
  (declare (salience 240))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-calculation) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate calculation-person)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?calculation-id) (module compulsory-share) (predicate calculation-person))))

(defrule missing-compulsory-calculation-portion
  (declare (salience 240))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-calculation) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate calculation-estate-portion)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?calculation-id) (module compulsory-share) (predicate calculation-estate-portion))))

(defrule missing-hypothetical-statutory-share
  (declare (salience 220))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-calculation) (value true))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate calculation-person) (value ?person))
  (not (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate hypothetical-statutory-share)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?calculation-id) (module compulsory-share) (predicate hypothetical-statutory-share))))

(defrule missing-testamentary-share-received
  (declare (salience 220))
  (analysis-request (case-id ?case-id) (module compulsory-share))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-calculation) (value true))
  (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate calculation-person) (value ?person))
  (not (asserted-fact (case-id ?case-id) (subject ?calculation-id) (predicate testamentary-share-received)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?calculation-id) (module compulsory-share) (predicate testamentary-share-received))))
