; Group H separates the validity of each person's refusal from the closed-world
; assessment of each estate portion that may remain without a recipient.

(defrule R-H01-substantive-condition-satisfied
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate refusal-assessment-subject) (value true))
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (fact-id ?intent) (case-id ?case-id) (subject ?person) (predicate refusal-intent) (value ordinary))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-substantive-condition)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-substantive-condition) (value satisfied) (rule-id R-H01) (supports ?scope ?made ?intent))))

(defrule R-H02-avoid-obligation-invalid
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate refusal-assessment-subject) (value true))
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (fact-id ?intent) (case-id ?case-id) (subject ?person) (predicate refusal-intent) (value avoid-obligation))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value false) (rule-id R-H02) (supports ?scope ?made ?intent))))

(defrule R-H03-form-condition-estate-manager
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (fact-id ?written) (case-id ?case-id) (subject ?person) (predicate refusal-written) (value true))
  (asserted-fact (fact-id ?recipient) (case-id ?case-id) (subject ?person) (predicate refusal-notice-recipient) (value estate-manager))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition) (value satisfied) (rule-id R-H03) (supports ?made ?written ?recipient))))

(defrule R-H03-form-condition-other-heir
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (fact-id ?written) (case-id ?case-id) (subject ?person) (predicate refusal-written) (value true))
  (asserted-fact (fact-id ?recipient) (case-id ?case-id) (subject ?person) (predicate refusal-notice-recipient) (value other-heir))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition) (value satisfied) (rule-id R-H03) (supports ?made ?written ?recipient))))

(defrule R-H03-form-condition-distribution-assignee
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value true))
  (asserted-fact (fact-id ?written) (case-id ?case-id) (subject ?person) (predicate refusal-written) (value true))
  (asserted-fact (fact-id ?recipient) (case-id ?case-id) (subject ?person) (predicate refusal-notice-recipient) (value distribution-assignee))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition) (value satisfied) (rule-id R-H03) (supports ?made ?written ?recipient))))

(defrule VALID-REFUSAL-COMPOSED
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-substantive-condition) (value satisfied) (rule-id ?substantive-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate refusal-form-condition) (value satisfied) (rule-id ?form-rule))
  (asserted-fact (fact-id ?timing) (case-id ?case-id) (subject ?person) (predicate refusal-before-estate-distribution) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value true) (rule-id VALID-REFUSAL-COMPOSED) (supports ?substantive-rule ?form-rule ?timing))))

(defrule NO-REFUSAL-MADE
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?person) (predicate refusal-assessment-subject) (value true))
  (asserted-fact (fact-id ?made) (case-id ?case-id) (subject ?person) (predicate refusal-made) (value false))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?person) (predicate valid-refusal) (value false) (rule-id NO-REFUSAL-MADE) (supports ?scope ?made))))

(defrule R-H04-unclaimed-estate-belongs-to-state
  (declare (salience -200))
  (analysis-request (case-id ?case-id) (module refusal-and-unclaimed))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-assessment-subject) (value true))
  (asserted-fact (fact-id ?estate) (case-id ?case-id) (subject ?portion) (predicate estate-portion) (value true))
  (asserted-fact (fact-id ?testamentary-complete) (case-id ?case-id) (subject ?portion) (predicate testamentary-beneficiary-search-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (subject ?portion) (predicate disposition-status) (value effective)))
  (asserted-fact (fact-id ?statutory-complete) (case-id ?case-id) (subject ?case-id) (predicate heir-search-complete) (value true))
  (not (derived-fact (case-id ?case-id) (predicate called-to-inherit) (value true)))
  (asserted-fact (fact-id ?remaining) (case-id ?case-id) (subject ?portion) (predicate remaining-estate-after-obligations) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-recipient)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?portion) (predicate unclaimed-estate-recipient) (value state) (rule-id R-H04) (supports ?scope ?estate ?testamentary-complete ?statutory-complete ?remaining))))
