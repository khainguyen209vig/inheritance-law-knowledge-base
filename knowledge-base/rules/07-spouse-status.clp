; Group G preserves the marital inheritance basis in the special situations of
; Article 655. It does not assert final entitlement or distribute the estate.

(defrule R-G01-common-property-divided-forward
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?survivor) (predicate spouse-at-opening) (value ?deceased))
  (asserted-fact (fact-id ?division) (case-id ?case-id) (subject ?survivor) (predicate joint-property-divided) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g01)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g01) (rule-id R-G01) (supports ?scope ?deceased-fact ?marriage ?division))))

(defrule R-G01-common-property-divided-reverse
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?survivor))
  (asserted-fact (fact-id ?division) (case-id ?case-id) (subject ?survivor) (predicate joint-property-divided) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g01)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g01) (rule-id R-G01) (supports ?scope ?deceased-fact ?marriage ?division))))

(defrule R-G02-pending-divorce-forward
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?survivor) (predicate spouse-at-opening) (value ?deceased))
  (asserted-fact (fact-id ?petition) (case-id ?case-id) (subject ?survivor) (predicate divorce-petition-pending-at-opening) (value true))
  (asserted-fact (fact-id ?decision) (case-id ?case-id) (subject ?survivor) (predicate divorce-decision-effective-at-opening) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g02)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g02) (rule-id R-G02) (supports ?scope ?deceased-fact ?marriage ?petition ?decision))))

(defrule R-G02-pending-divorce-reverse
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?survivor))
  (asserted-fact (fact-id ?petition) (case-id ?case-id) (subject ?survivor) (predicate divorce-petition-pending-at-opening) (value true))
  (asserted-fact (fact-id ?decision) (case-id ?case-id) (subject ?survivor) (predicate divorce-decision-effective-at-opening) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g02)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g02) (rule-id R-G02) (supports ?scope ?deceased-fact ?marriage ?petition ?decision))))

(defrule R-G03-remarried-after-opening-forward
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?survivor) (predicate spouse-at-opening) (value ?deceased))
  (asserted-fact (fact-id ?remarriage) (case-id ?case-id) (subject ?survivor) (predicate remarried-after-opening) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g03)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g03) (rule-id R-G03) (supports ?scope ?deceased-fact ?marriage ?remarriage))))

(defrule R-G03-remarried-after-opening-reverse
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?survivor) (predicate spouse-status-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?marriage) (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?survivor))
  (asserted-fact (fact-id ?remarriage) (case-id ?case-id) (subject ?survivor) (predicate remarried-after-opening) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g03)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value g03) (rule-id R-G03) (supports ?scope ?deceased-fact ?marriage ?remarriage))))

(defrule SPOUSE-STATUS-PRESERVED
  (declare (salience -10))
  (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-preservation-basis) (value ?basis) (rule-id ?legal-rule))
  (not (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-at-opening)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?survivor) (predicate spouse-status-at-opening) (value valid) (rule-id SPOUSE-STATUS-PRESERVED) (supports ?legal-rule))))
