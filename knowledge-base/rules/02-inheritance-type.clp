; Domain rules for module 2: classify each atomic estate portion.
; An estate portion is the smallest share evaluated as a unit. If a disposition
; has multiple beneficiaries, model one atomic portion for each beneficiary.

(defrule R-A01-no-will
  (declare (salience 500))
  (asserted-fact (fact-id ?portion-fact) (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (asserted-fact (fact-id ?will-fact) (case-id ?case-id) (subject ?case-id) (predicate has-will) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A01)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A01) (supports ?portion-fact ?will-fact))))

(defrule R-A02-invalid-will-portion
  (declare (salience 500))
  (asserted-fact (fact-id ?portion-fact) (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (asserted-fact (fact-id ?will-fact) (case-id ?case-id) (subject ?case-id) (predicate has-will) (value true))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value false) (rule-id ?validity-rule))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A02)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A02) (supports ?portion-fact ?will-fact ?applicable-fact ?validity-rule))))

(defrule R-A03-effective-testamentary-disposition
  (declare (salience 500))
  (asserted-fact (fact-id ?portion-fact) (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true) (rule-id ?validity-rule))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (asserted-fact (fact-id ?status-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value effective))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value testamentary) (rule-id R-A03)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value testamentary)
    (rule-id R-A03) (supports ?portion-fact ?applicable-fact ?validity-rule ?beneficiary-fact ?status-fact))))

; R-A04 is split because a beneficiary can be an unavailable person or an
; organization that no longer exists. Completeness is asserted explicitly.
(defrule R-A04-beneficiary-dead
  (declare (salience 500))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true) (rule-id ?validity-rule))
  (asserted-fact (fact-id ?complete-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (fact-id ?status-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (asserted-fact (fact-id ?life-fact) (case-id ?case-id) (subject ?beneficiary) (predicate beneficiary-life-status) (value dead-before-or-same))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A04)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A04) (supports ?applicable-fact ?validity-rule ?complete-fact ?status-fact ?beneficiary-fact ?life-fact))))

(defrule R-A04-organization-no-longer-exists
  (declare (salience 500))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true) (rule-id ?validity-rule))
  (asserted-fact (fact-id ?complete-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (fact-id ?status-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (asserted-fact (fact-id ?life-fact) (case-id ?case-id) (subject ?beneficiary) (predicate beneficiary-life-status) (value organization-no-longer-exists))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A04)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A04) (supports ?applicable-fact ?validity-rule ?complete-fact ?status-fact ?beneficiary-fact ?life-fact))))

(defrule R-A05a-beneficiary-disqualified
  (declare (salience 500))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true) (rule-id ?validity-rule))
  (asserted-fact (fact-id ?complete-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (fact-id ?status-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (asserted-fact (fact-id ?disqualified-fact) (case-id ?case-id) (subject ?beneficiary) (predicate beneficiary-disqualified) (value true))
  (asserted-fact (fact-id ?exception-fact) (case-id ?case-id) (subject ?beneficiary) (predicate disqualification-exception) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A05a)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A05a) (supports ?applicable-fact ?validity-rule ?complete-fact ?status-fact ?beneficiary-fact ?disqualified-fact ?exception-fact))))

(defrule R-A05b-beneficiary-refused
  (declare (salience 500))
  (asserted-fact (fact-id ?applicable-fact) (case-id ?case-id) (subject ?portion) (predicate applicable-will) (value ?will-id))
  (derived-fact (case-id ?case-id) (subject ?will-id) (predicate valid-will) (value true) (rule-id ?validity-rule))
  (asserted-fact (fact-id ?complete-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (fact-id ?status-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value ineffective-beneficiary))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-beneficiary) (value ?beneficiary))
  (derived-fact (case-id ?case-id) (subject ?beneficiary) (predicate refusal-status) (value true) (rule-id ?refusal-fact))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A05b)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A05b) (supports ?applicable-fact ?validity-rule ?complete-fact ?status-fact ?beneficiary-fact ?refusal-fact))))

(defrule R-A06-undisposed-portion
  (declare (salience 500))
  (asserted-fact (fact-id ?portion-fact) (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (asserted-fact (fact-id ?will-fact) (case-id ?case-id) (subject ?case-id) (predicate has-will) (value true))
  (asserted-fact (fact-id ?complete-fact) (case-id ?case-id) (subject ?portion) (predicate disposition-set-complete) (value true))
  (asserted-fact (fact-id ?disposed-fact) (case-id ?case-id) (subject ?portion) (predicate portion-disposed) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory) (rule-id R-A06)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?portion) (predicate inheritance-regime) (value statutory)
    (rule-id R-A06) (supports ?portion-fact ?will-fact ?complete-fact ?disposed-fact))))
