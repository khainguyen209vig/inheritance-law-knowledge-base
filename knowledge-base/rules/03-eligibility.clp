; Article 621 knowledge: determine disqualification from atomic evidence.

(defrule R-D01-intentional-offense-against-deceased
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?evidence) (case-id ?case-id) (subject ?person) (predicate convicted-intentional-offense-against-deceased) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D01)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D01) (supports ?candidate ?evidence))))

(defrule R-D01-abuse-against-deceased
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?evidence) (case-id ?case-id) (subject ?person) (predicate convicted-abuse-against-deceased) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D01)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D01) (supports ?candidate ?evidence))))

(defrule R-D02-serious-support-duty-violation
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?evidence) (case-id ?case-id) (subject ?person) (predicate serious-support-duty-violation) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D02)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D02) (supports ?candidate ?evidence))))

(defrule R-D03-offense-against-other-heir
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?offense) (case-id ?case-id) (subject ?person) (predicate convicted-offense-against-other-heir) (value true))
  (asserted-fact (fact-id ?motive) (case-id ?case-id) (subject ?person) (predicate inheritance-benefit-motive) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D03)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D03) (supports ?candidate ?offense ?motive))))

(defrule R-D04a-will-interference
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?act) (case-id ?case-id) (subject ?person) (predicate will-interference) (value deception|coercion))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D04a)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D04a) (supports ?candidate ?act))))

(defrule R-D04b-will-document-interference
  (declare (salience 500))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?act) (case-id ?case-id) (subject ?person) (predicate will-document-interference) (value forgery|alteration|destruction|concealment))
  (asserted-fact (fact-id ?intent) (case-id ?case-id) (subject ?person) (predicate improper-benefit-intent) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D04b)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id R-D04b) (supports ?candidate ?act ?intent))))

(defrule R-D05-disqualification-exception
  (declare (salience 450))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id ?reason))
  (asserted-fact (fact-id ?knowledge) (case-id ?case-id) (subject ?person) (predicate deceased-knew-disqualifying-act) (value true))
  (asserted-fact (fact-id ?designation) (case-id ?case-id) (subject ?person) (predicate named-in-will-after-knowledge) (value true))
  (asserted-fact (fact-id ?will) (case-id ?case-id) (subject ?person) (predicate eligibility-applicable-will) (value ?will-id))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualification-exception) (value true)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualification-exception) (value true) (rule-id R-D05) (supports ?reason ?knowledge ?designation ?will)))
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value exception-under-will) (rule-id R-D05) (supports ?reason ?knowledge ?designation ?will))))

(defrule ELIGIBILITY-BLOCKED
  (declare (salience 300))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?person) (predicate eligibility-review-complete) (value true))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true) (rule-id ?reason))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualification-exception) (value true)))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value excluded) (rule-id ELIGIBILITY-BLOCKED) (supports ?complete ?reason))))

(defrule ELIGIBILITY-CLEAR
  (declare (salience 300))
  (asserted-fact (fact-id ?candidate) (case-id ?case-id) (subject ?person) (predicate eligibility-candidate) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?person) (predicate eligibility-review-complete) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate disqualified) (value true)))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value not-excluded) (rule-id ELIGIBILITY-CLEAR) (supports ?candidate ?complete))))
