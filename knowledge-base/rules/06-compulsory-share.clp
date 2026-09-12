; Article 644 classification slice. Candidate classification, exclusion and
; final 2/3 calculation are deliberately separate layers.

(defrule R-F01a-minor-biological-child
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?person))
  (asserted-fact (fact-id ?age) (case-id ?case-id) (subject ?person) (predicate age-group) (value minor))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F01a) (supports ?scope ?deceased-fact ?relation ?age))))

(defrule R-F01a-minor-adopted-child
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate adoptive-parent-of) (value ?person))
  (asserted-fact (fact-id ?age) (case-id ?case-id) (subject ?person) (predicate age-group) (value minor))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F01a) (supports ?scope ?deceased-fact ?relation ?age))))

(defrule R-F01b-parent
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate biological-parent-of|adoptive-parent-of) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F01b) (supports ?scope ?deceased-fact ?relation))))

(defrule R-F01b-spouse-forward
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?person) (predicate spouse-at-opening) (value ?deceased))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F01b) (supports ?scope ?deceased-fact ?relation))))

(defrule R-F01b-spouse-reverse
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate spouse-at-opening) (value ?person))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F01b) (supports ?scope ?deceased-fact ?relation))))

(defrule R-F02-adult-biological-child-without-work-capacity
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate biological-parent-of) (value ?person))
  (asserted-fact (fact-id ?age) (case-id ?case-id) (subject ?person) (predicate age-group) (value adult))
  (asserted-fact (fact-id ?capacity) (case-id ?case-id) (subject ?person) (predicate work-capacity-status) (value incapable))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F02) (supports ?scope ?deceased-fact ?relation ?age ?capacity))))

(defrule R-F02-adult-adopted-child-without-work-capacity
  (declare (salience 440))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate compulsory-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?deceased-fact) (case-id ?case-id) (subject ?deceased) (predicate deceased-person) (value true))
  (asserted-fact (fact-id ?relation) (case-id ?case-id) (subject ?deceased) (predicate adoptive-parent-of) (value ?person))
  (asserted-fact (fact-id ?age) (case-id ?case-id) (subject ?person) (predicate age-group) (value adult))
  (asserted-fact (fact-id ?capacity) (case-id ?case-id) (subject ?person) (predicate work-capacity-status) (value incapable))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id R-F02) (supports ?scope ?deceased-fact ?relation ?age ?capacity))))

(defrule R-F03-valid-refusal-excludes-compulsory-share
  (declare (salience 400))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id ?candidate-rule))
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value false) (rule-id R-F03) (supports ?candidate-rule ?refusal))))

(defrule R-F04-disqualification-excludes-compulsory-share
  (declare (salience 400))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id ?candidate-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value false) (rule-id R-F04) (supports ?candidate-rule ?eligibility-rule))))

(defrule COMPULSORY-HEIR-ACTIVE
  (declare (salience 360))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir-candidate) (value true) (rule-id ?candidate-rule))
  (asserted-fact (fact-id ?refusal) (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value false))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true) (rule-id COMPULSORY-HEIR-ACTIVE) (supports ?candidate-rule ?refusal ?eligibility-rule))))
