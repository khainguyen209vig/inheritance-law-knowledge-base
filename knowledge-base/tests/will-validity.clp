(load "knowledge-base/templates.clp")
(load "knowledge-base/rule-metadata.clp")
(load "knowledge-base/rules/01-will-validity.clp")
(load "knowledge-base/rules/90-will-validity-completeness.clp")
(load "knowledge-base/rules/98-explanation.clp")
(load "knowledge-base/rules/99-result-projection.clp")

(reset)
(load-facts "knowledge-base/fixtures/will-valid.clp")
(run)
(if (any-factp ((?result module-result))
      (and
        (eq ?result:case-id case-valid)
        (eq ?result:subject will-valid-01)
        (eq ?result:predicate valid-will)
        (eq ?result:value true)))
  then
    (printout t "PASS will-valid" crlf)
  else
    (printout t "FAIL will-valid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-invalid.clp")
(run)
(if (any-factp ((?result module-result))
      (and
        (eq ?result:case-id case-invalid)
        (eq ?result:subject will-invalid-01)
        (eq ?result:predicate valid-will)
        (eq ?result:value false)))
  then
    (printout t "PASS will-invalid" crlf)
  else
    (printout t "FAIL will-invalid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-unknown.clp")
(run)
(if (and
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-unknown)
          (eq ?result:subject will-unknown-01)
          (eq ?result:predicate valid-will)
          (eq ?result:value unknown)))
      (any-factp ((?missing missing-requirement))
        (and
          (eq ?missing:case-id case-unknown)
          (eq ?missing:predicate undue-influence)))
      (any-factp ((?missing missing-requirement))
        (and
          (eq ?missing:case-id case-unknown)
          (eq ?missing:predicate formal-defect))))
  then
    (printout t "PASS will-unknown" crlf)
  else
    (printout t "FAIL will-unknown" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-conflict.clp")
(run)
(if (any-factp ((?result module-result))
      (and
        (eq ?result:case-id case-conflict)
        (eq ?result:subject will-conflict-01)
        (eq ?result:predicate valid-will)
        (eq ?result:value conflict)))
  then
    (printout t "PASS will-conflict" crlf)
  else
    (printout t "FAIL will-conflict" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-valid-domain-only.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-domain-only)
          (eq ?fact:subject will-domain-only-01)
          (eq ?fact:predicate valid-will)
          (eq ?fact:value true)))
      (not (any-factp ((?result module-result))
        (eq ?result:case-id case-domain-only))))
  then
    (printout t "PASS domain-independent-from-analysis-request" crlf)
  else
    (printout t "FAIL domain-independent-from-analysis-request" crlf))

(exit)
