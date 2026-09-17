(load "knowledge-base/templates.clp")
(load "knowledge-base/rule-metadata.clp")
(load "knowledge-base/rules/03-eligibility.clp")
(load "knowledge-base/rules/08-refusal-and-unclaimed.clp")
(load "knowledge-base/rules/04-heir-rank.clp")
(load "knowledge-base/rules/09-estate-settlement.clp")
(load "knowledge-base/rules/11-estate-vnd.clp")
(load "knowledge-base/rules/99-estate-settlement-completeness.clp")
(load "knowledge-base/rules/99-estate-settlement-projection.clp")
(load "knowledge-base/rules/98-explanation.clp")
(reset)
(load-facts "knowledge-base/fixtures/estate-vnd.clp")
(run)

(if (and
    (any-factp ((?result module-result)) (and (eq ?result:subject house-one) (eq ?result:predicate estate-owned-value-vnd) (= ?result:value 1500000000)))
    (any-factp ((?result module-result)) (and (eq ?result:subject house-one) (eq ?result:predicate ownership-rounding-remainder-numerator) (= ?result:value 1)))
    (any-factp ((?result module-result)) (and (eq ?result:subject bank-one) (eq ?result:predicate estate-owned-value-vnd) (= ?result:value 500000000))))
  then (printout t "PASS estate-vnd-owned-values" crlf) else (printout t "FAIL estate-vnd-owned-values" crlf))

(if (and
    (any-factp ((?result module-result)) (and (eq ?result:subject estate-vnd-calculation) (eq ?result:predicate gross-estate-vnd) (= ?result:value 2000000000)))
    (any-factp ((?result module-result)) (and (eq ?result:subject estate-vnd-calculation) (eq ?result:predicate total-obligations-vnd) (= ?result:value 300000000)))
    (any-factp ((?result module-result)) (and (eq ?result:subject estate-vnd-calculation) (eq ?result:predicate distributable-estate-vnd) (= ?result:value 1700000000))))
  then (printout t "PASS estate-vnd-net-estate" crlf) else (printout t "FAIL estate-vnd-net-estate" crlf))

(if (and
    (any-factp ((?result module-result)) (and (eq ?result:subject estate-vnd-calculation) (eq ?result:predicate statutory-heir-count) (= ?result:value 2)))
    (any-factp ((?result module-result)) (and (eq ?result:subject child-one) (eq ?result:predicate hypothetical-statutory-share-vnd) (= ?result:value 850000000)))
    (any-factp ((?result module-result)) (and (eq ?result:subject child-two) (eq ?result:predicate hypothetical-statutory-share-vnd) (= ?result:value 850000000)))
    (any-factp ((?result module-result)) (and (eq ?result:subject estate-vnd-calculation) (eq ?result:predicate statutory-division-remainder-vnd) (= ?result:value 0))))
  then (printout t "PASS estate-vnd-equal-statutory-share" crlf) else (printout t "FAIL estate-vnd-equal-statutory-share" crlf))

(exit)
