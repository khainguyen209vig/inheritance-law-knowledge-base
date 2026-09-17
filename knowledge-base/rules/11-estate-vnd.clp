; Deterministic monetary calculation layer. All monetary values are integer VND.
; Asset valuations, ownership ratios and obligation amounts are confirmed inputs;
; this package does not appraise property or resolve ownership disputes.

(deffunction sum-derived-integer (?case-id ?predicate)
  (bind ?total 0)
  (do-for-all-facts ((?fact derived-fact))
    (and (eq ?fact:case-id ?case-id) (eq ?fact:predicate ?predicate) (integerp ?fact:value))
    (bind ?total (+ ?total ?fact:value)))
  (return ?total))

(deffunction sum-asserted-integer (?case-id ?predicate)
  (bind ?total 0)
  (do-for-all-facts ((?fact asserted-fact))
    (and (eq ?fact:case-id ?case-id) (eq ?fact:predicate ?predicate) (integerp ?fact:value))
    (bind ?total (+ ?total ?fact:value)))
  (return ?total))

(deffunction count-derived-value (?case-id ?predicate ?value)
  (bind ?total 0)
  (do-for-all-facts ((?fact derived-fact))
    (and (eq ?fact:case-id ?case-id) (eq ?fact:predicate ?predicate) (eq ?fact:value ?value))
    (bind ?total (+ ?total 1)))
  (return ?total))

(deffunction owned-value-vnd (?value ?numerator ?denominator)
  ; Rearranged to avoid multiplying a large VND value by the numerator.
  (return (+ (* (div ?value ?denominator) ?numerator)
             (div (* (mod ?value ?denominator) ?numerator) ?denominator))))

(deffunction owned-value-remainder-numerator (?value ?numerator ?denominator)
  (return (mod (* (mod ?value ?denominator) ?numerator) ?denominator)))

(defrule ESTATE-VND-ASSET-calculate-owned-value
  (declare (salience 600))
  (asserted-fact (fact-id ?asset-fact) (case-id ?case-id) (subject ?asset) (predicate estate-asset) (value true))
  (asserted-fact (fact-id ?value-fact) (case-id ?case-id) (subject ?asset) (predicate asset-value-vnd) (value ?value&:(>= ?value 0)))
  (asserted-fact (fact-id ?numerator-fact) (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-numerator) (value ?numerator&:(> ?numerator 0)))
  (asserted-fact (fact-id ?denominator-fact) (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-denominator) (value ?denominator&:(> ?denominator 0)))
  (test (<= ?numerator ?denominator))
  (not (derived-fact (case-id ?case-id) (subject ?asset) (predicate estate-owned-value-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?asset) (predicate estate-owned-value-vnd)
    (value (owned-value-vnd ?value ?numerator ?denominator))
    (rule-id ESTATE-VND-ASSET)
    (supports ?asset-fact ?value-fact ?numerator-fact ?denominator-fact))))

(defrule ESTATE-VND-ASSET-record-sub-vnd-remainder
  (declare (salience 590))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate asset-value-vnd) (value ?value))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-numerator) (value ?numerator))
  (asserted-fact (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-denominator) (value ?denominator&:(> ?denominator 0)))
  (test (<= ?numerator ?denominator))
  (test (> (owned-value-remainder-numerator ?value ?numerator ?denominator) 0))
  (not (derived-fact (case-id ?case-id) (subject ?asset) (predicate ownership-rounding-remainder-numerator)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?asset) (predicate ownership-rounding-remainder-numerator)
    (value (owned-value-remainder-numerator ?value ?numerator ?denominator))
    (rule-id ESTATE-VND-ASSET)
    (supports))))

(defrule SYSTEM-ESTATE-VND-invalid-ownership-ratio
  (declare (salience 590))
  (asserted-fact (fact-id ?numerator-fact) (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-numerator) (value ?numerator))
  (asserted-fact (fact-id ?denominator-fact) (case-id ?case-id) (subject ?asset) (predicate deceased-ownership-denominator) (value ?denominator))
  (test (> ?numerator ?denominator))
  (not (derived-fact (case-id ?case-id) (subject ?asset) (predicate ownership-ratio-invalid)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?asset) (predicate ownership-ratio-invalid) (value true) (rule-id SYSTEM-ESTATE-VND) (supports ?numerator-fact ?denominator-fact))))

(defrule ESTATE-VND-TOTALS-calculate-gross-estate
  (declare (salience 500))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?calculation) (predicate estate-vnd-calculation) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?calculation) (predicate estate-asset-set-complete) (value true))
  (asserted-fact (case-id ?case-id) (predicate estate-asset) (value true))
  (forall
    (asserted-fact (case-id ?case-id) (subject ?asset) (predicate estate-asset) (value true))
    (derived-fact (case-id ?case-id) (subject ?asset) (predicate estate-owned-value-vnd)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate gross-estate-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?calculation) (predicate gross-estate-vnd)
    (value (sum-derived-integer ?case-id estate-owned-value-vnd))
    (rule-id ESTATE-VND-TOTALS) (supports ?scope ?complete ESTATE-VND-ASSET))))

(defrule ESTATE-VND-TOTALS-no-obligations
  (declare (salience 500))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?calculation) (predicate estate-vnd-calculation) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?calculation) (predicate estate-obligation-set-complete) (value true))
  (not (asserted-fact (case-id ?case-id) (predicate estate-obligation) (value true)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd) (value 0) (rule-id ESTATE-VND-TOTALS) (supports ?scope ?complete))))

(defrule ESTATE-VND-TOTALS-calculate-obligations
  (declare (salience 500))
  (asserted-fact (fact-id ?scope) (case-id ?case-id) (subject ?calculation) (predicate estate-vnd-calculation) (value true))
  (asserted-fact (fact-id ?complete) (case-id ?case-id) (subject ?calculation) (predicate estate-obligation-set-complete) (value true))
  (asserted-fact (case-id ?case-id) (predicate estate-obligation) (value true))
  (forall
    (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate estate-obligation) (value true))
    (asserted-fact (case-id ?case-id) (subject ?obligation) (predicate obligation-amount-vnd)))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd)
    (value (sum-asserted-integer ?case-id obligation-amount-vnd))
    (rule-id ESTATE-VND-TOTALS) (supports ?scope ?complete))))

(defrule ESTATE-VND-TOTALS-calculate-net-estate
  (declare (salience 400))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate gross-estate-vnd) (value ?gross) (rule-id ?gross-rule))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd) (value ?obligations) (rule-id ?obligation-rule))
  (test (>= ?gross ?obligations))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd)
    (value (- ?gross ?obligations)) (rule-id ESTATE-VND-TOTALS)
    (supports ?gross-rule ?obligation-rule))))

(defrule SYSTEM-ESTATE-VND-obligations-exceed-estate
  (declare (salience 400))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate gross-estate-vnd) (value ?gross) (rule-id ?gross-rule))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate total-obligations-vnd) (value ?obligations) (rule-id ?obligation-rule))
  (test (> ?obligations ?gross))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd)))
  =>
  (assert (derived-fact (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd) (value 0) (rule-id SYSTEM-ESTATE-VND) (supports ?gross-rule ?obligation-rule)))
  (assert (derived-fact (case-id ?case-id) (subject ?calculation) (predicate uncovered-obligations-vnd) (value (- ?obligations ?gross)) (rule-id SYSTEM-ESTATE-VND) (supports ?gross-rule ?obligation-rule))))

(defrule ESTATE-VND-TOTALS-count-statutory-heirs
  (declare (salience 170))
  (asserted-fact (case-id ?case-id) (subject ?calculation) (predicate estate-vnd-calculation) (value true))
  (derived-fact (case-id ?case-id) (subject ?case-id) (predicate active-heir-rank) (value ?rank) (rule-id ?active-rule))
  (derived-fact (case-id ?case-id) (predicate called-to-inherit) (value true))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate statutory-heir-count)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?calculation) (predicate statutory-heir-count)
    (value (count-derived-value ?case-id called-to-inherit true))
    (rule-id ESTATE-VND-TOTALS) (supports ?active-rule))))

(defrule R-C04-calculate-equal-statutory-share-vnd
  (declare (salience 160))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd) (value ?net) (rule-id ?net-rule))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate statutory-heir-count) (value ?count&:(> ?count 0)) (rule-id ?count-rule))
  (derived-fact (case-id ?case-id) (subject ?person) (predicate called-to-inherit) (value true) (rule-id ?called-rule))
  (not (derived-fact (case-id ?case-id) (subject ?person) (predicate hypothetical-statutory-share-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?person) (predicate hypothetical-statutory-share-vnd)
    (value (div ?net ?count)) (rule-id R-C04)
    (supports ?net-rule ?count-rule ?called-rule))))

(defrule R-C04-record-statutory-division-remainder-vnd
  (declare (salience 160))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate distributable-estate-vnd) (value ?net) (rule-id ?net-rule))
  (derived-fact (case-id ?case-id) (subject ?calculation) (predicate statutory-heir-count) (value ?count&:(> ?count 0)) (rule-id ?count-rule))
  (not (derived-fact (case-id ?case-id) (subject ?calculation) (predicate statutory-division-remainder-vnd)))
  =>
  (assert (derived-fact
    (case-id ?case-id) (subject ?calculation) (predicate statutory-division-remainder-vnd)
    (value (mod ?net ?count)) (rule-id R-C04)
    (supports ?net-rule ?count-rule))))
