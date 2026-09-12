; Article 658 is represented as an ordered knowledge table. The production
; below is generic: adding an obligation does not require another if/then rule.

(deftemplate payment-priority-knowledge
  (slot knowledge-id (type SYMBOL))
  (slot obligation-type (type SYMBOL))
  (slot priority (type INTEGER) (range 1 10)))

(deffacts article-658-payment-priority-knowledge
  (payment-priority-knowledge (knowledge-id article-658-priority-1) (obligation-type funeral-expense) (priority 1))
  (payment-priority-knowledge (knowledge-id article-658-priority-2) (obligation-type unpaid-support) (priority 2))
  (payment-priority-knowledge (knowledge-id article-658-priority-3) (obligation-type estate-preservation) (priority 3))
  (payment-priority-knowledge (knowledge-id article-658-priority-4) (obligation-type dependent-allowance) (priority 4))
  (payment-priority-knowledge (knowledge-id article-658-priority-5) (obligation-type labor-compensation) (priority 5))
  (payment-priority-knowledge (knowledge-id article-658-priority-6) (obligation-type damage-compensation) (priority 6))
  (payment-priority-knowledge (knowledge-id article-658-priority-7) (obligation-type tax-and-state-dues) (priority 7))
  (payment-priority-knowledge (knowledge-id article-658-priority-8) (obligation-type other-debt) (priority 8))
  (payment-priority-knowledge (knowledge-id article-658-priority-9) (obligation-type fine) (priority 9))
  (payment-priority-knowledge (knowledge-id article-658-priority-10) (obligation-type other-expense) (priority 10)))

(defrule R-I01-assign-payment-priority
  (asserted-fact (fact-id ?entity) (case-id ?case-id) (subject ?obligation) (predicate estate-obligation) (value true))
  (asserted-fact (fact-id ?type-fact) (case-id ?case-id) (subject ?obligation) (predicate obligation-type) (value ?type))
  (payment-priority-knowledge (knowledge-id ?knowledge) (obligation-type ?type) (priority ?priority))
  (not (derived-fact (case-id ?case-id) (subject ?obligation) (predicate payment-priority)))
  =>
  (assert (derived-fact
    (case-id ?case-id)
    (subject ?obligation)
    (predicate payment-priority)
    (value ?priority)
    (rule-id R-I01)
    (supports ?entity ?type-fact ?knowledge))))

; R-I02 is scoped to a testamentary distribution group. Negative observations
; are explicit facts; absence of an agreement fact never means "no agreement".
(defrule R-I02-equal-share-default-applies
  (asserted-fact (fact-id ?group-fact) (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary-set-complete) (value true))
  (asserted-fact (fact-id ?first-fact) (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary) (value ?first))
  (asserted-fact (fact-id ?second-fact) (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary) (value ?second&~?first))
  (asserted-fact (fact-id ?shares) (case-id ?case-id) (subject ?group) (predicate testamentary-shares-specified) (value false))
  (asserted-fact (fact-id ?agreement) (case-id ?case-id) (subject ?group) (predicate alternative-share-agreement) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies) (value true) (rule-id R-I02) (supports ?group-fact ?complete ?first-fact ?second-fact ?shares ?agreement))))

(defrule R-I02-specified-shares-disable-default
  (asserted-fact (fact-id ?group-fact) (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (asserted-fact (fact-id ?shares) (case-id ?case-id) (subject ?group) (predicate testamentary-shares-specified) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies) (value false) (rule-id R-I02) (supports ?group-fact ?shares))))

(defrule R-I02-alternative-agreement-disables-default
  (asserted-fact (fact-id ?group-fact) (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (asserted-fact (fact-id ?agreement) (case-id ?case-id) (subject ?group) (predicate alternative-share-agreement) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies) (value false) (rule-id R-I02) (supports ?group-fact ?agreement))))

(defrule R-I02-single-beneficiary-not-a-sharing-case
  (asserted-fact (fact-id ?group-fact) (case-id ?case-id) (subject ?group) (predicate testamentary-distribution-group) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary-set-complete) (value true))
  (asserted-fact (fact-id ?beneficiary-fact) (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary) (value ?beneficiary))
  (not (asserted-fact (case-id ?case-id) (subject ?group) (predicate distribution-beneficiary) (value ?other&~?beneficiary)))
  (not (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?group) (predicate equal-testamentary-share-principle-applies) (value false) (rule-id R-I02) (supports ?group-fact ?complete ?beneficiary-fact))))

; R-I03 reuses the relationship-derived candidate rank and the active rank.
; The user records only the prenatal observation and later birth outcome.
(defrule R-I03a-reserve-equal-share-for-prenatal-heir
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate prenatal-share-assessment-subject) (value true))
  (asserted-fact (fact-id ?prenatal) (case-id ?case-id) (subject ?person) (predicate prenatal-status-at-distribution) (value conceived-not-born))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate candidate-heir-rank) (value ?rank) (rule-id ?candidate-rule))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value ?rank) (rule-id ?active-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share) (value true) (rule-id R-I03a) (supports ?scope ?prenatal ?candidate-rule ?active-rule))))

(defrule R-I03b-born-alive-receives-reserved-share
  (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share) (value true) (rule-id ?reserve-rule))
  (asserted-fact (fact-id ?outcome) (case-id ?case-id) (subject ?person) (predicate prenatal-birth-outcome) (value born-alive))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-vests-in-child)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-vests-in-child) (value true) (rule-id R-I03b) (supports ?reserve-rule ?outcome))))

(defrule R-I03b-died-before-birth-returns-share
  (derived-fact (case-id ?case-id) (subject ?person) (predicate reserve-equal-share) (value true) (rule-id ?reserve-rule))
  (asserted-fact (fact-id ?outcome) (case-id ?case-id) (subject ?person) (predicate prenatal-birth-outcome) (value died-before-birth))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-returns-to-other-heirs)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate reserved-share-returns-to-other-heirs) (value true) (rule-id R-I03b) (supports ?reserve-rule ?outcome))))
