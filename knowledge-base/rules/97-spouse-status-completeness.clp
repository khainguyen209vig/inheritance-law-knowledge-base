(defrule missing-spouse-relationship-at-opening
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-at-opening) (value ?deceased)))
  (not (asserted-fact (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?survivor)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate spouse-at-opening))))

(defrule missing-joint-property-observation
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate joint-property-divided)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate joint-property-divided))))

(defrule missing-divorce-petition-observation
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate divorce-petition-pending-at-opening)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate divorce-petition-pending-at-opening))))

(defrule missing-divorce-decision-effect
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate divorce-petition-pending-at-opening) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate divorce-decision-effective-at-opening)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate divorce-decision-effective-at-opening))))

(defrule missing-remarriage-observation
  (analysis-request (case-id ?case-id) (module spouse-status))
  (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?survivor) (predicate remarried-after-opening)))
  =>
  (assert (missing-requirement (case-id ?case-id) (subject ?survivor) (module spouse-status) (predicate remarried-after-opening))))
