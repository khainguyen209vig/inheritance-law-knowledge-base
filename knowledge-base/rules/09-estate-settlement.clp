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
