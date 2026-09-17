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
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status) (value true) (rule-id ?refusal))
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
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-status) (value false) (rule-id ?refusal))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate article-621-status) (value not-excluded) (rule-id ?eligibility-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true) (rule-id COMPULSORY-HEIR-ACTIVE) (supports ?candidate-rule ?refusal ?eligibility-rule))))

; R-F01c consumes an explicit per-person/per-portion calculation context. It
; computes the Article 644 threshold and shortfall, but does not determine the
; hypothetical statutory share or distribute the estate end-to-end.
(defrule R-F01c-calculate-minimum-threshold
  (declare (salience 320))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true) (rule-id ?active-rule))
  (asserted-fact (fact-id ?calculation) (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-calculation) (value true))
  (asserted-fact (fact-id ?person-link) (case-id ?case-id) (subject ?calculation-id) (predicate calculation-person) (value ?person))
  (asserted-fact (fact-id ?portion-link) (case-id ?case-id) (subject ?calculation-id) (predicate calculation-estate-portion) (value ?portion))
  (asserted-fact (fact-id ?statutory-share) (case-id ?case-id) (subject ?calculation-id) (predicate hypothetical-statutory-share) (value ?amount&:(> ?amount 0)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-compulsory-share)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-compulsory-share) (value (* ?amount (/ 2.0 3.0))) (rule-id R-F01c) (supports ?active-rule ?calculation ?person-link ?portion-link ?statutory-share))))

(defrule R-F01c-shortfall-applies
  (declare (salience 300))
  (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-compulsory-share) (value ?minimum) (rule-id ?minimum-rule))
  (asserted-fact (fact-id ?received) (case-id ?case-id) (subject ?calculation-id) (predicate testamentary-share-received) (value ?amount&:(< ?amount ?minimum)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-share-rule-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-share-rule-applies) (value true) (rule-id R-F01c) (supports ?minimum-rule ?received)))
  (assert (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-shortfall) (value (- ?minimum ?amount)) (rule-id R-F01c) (supports ?minimum-rule ?received))))

(defrule R-F01c-threshold-already-met
  (declare (salience 300))
  (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-compulsory-share) (value ?minimum) (rule-id ?minimum-rule))
  (asserted-fact (fact-id ?received) (case-id ?case-id) (subject ?calculation-id) (predicate testamentary-share-received) (value ?amount&:(>= ?amount ?minimum)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-share-rule-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate minimum-share-rule-applies) (value false) (rule-id R-F01c) (supports ?minimum-rule ?received)))
  (assert (derived-fact (case-id ?case-id) (subject ?calculation-id) (predicate compulsory-share-shortfall) (value 0) (rule-id R-F01c) (supports ?minimum-rule ?received))))

; Integer-VND variant. The statutory share is derived from the estate VND
; calculation and active statutory-heir set; only the testamentary amount is
; supplied as a confirmed observation for the protected person.
(defrule R-F01c-calculate-minimum-threshold-vnd
  (declare (salience 155))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-heir) (value true) (rule-id ?active-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate hypothetical-statutory-share-vnd) (value ?statutory) (rule-id ?statutory-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate minimum-compulsory-share-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?person) (predicate minimum-compulsory-share-vnd)
    (value (div (* ?statutory 2) 3)) (rule-id R-F01c)
    (supports ?active-rule ?statutory-rule)))
  (assert (derived-fact
    (case-id ?case-id) (subject ?person) (predicate minimum-compulsory-share-rounding-remainder-numerator)
    (value (mod (* ?statutory 2) 3)) (rule-id R-F01c)
    (supports ?active-rule ?statutory-rule))))

(defrule R-F01c-calculate-shortfall-vnd
  (declare (salience 145))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate minimum-compulsory-share-vnd) (value ?minimum) (rule-id ?minimum-rule))
  (asserted-fact (fact-id ?received-fact) (case-id ?case-id) (subject ?person) (predicate testamentary-share-received-vnd) (value ?received))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate compulsory-share-shortfall-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?person) (predicate compulsory-share-shortfall-vnd)
    (value (max 0 (- ?minimum ?received))) (rule-id R-F01c)
    (supports ?minimum-rule ?received-fact)))
  (assert (derived-fact
    (case-id ?case-id) (subject ?person) (predicate minimum-share-rule-applies-vnd)
    (value (if (< ?received ?minimum) then true else false)) (rule-id R-F01c)
    (supports ?minimum-rule ?received-fact))))
