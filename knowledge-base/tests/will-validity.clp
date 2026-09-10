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
(load-facts "knowledge-base/fixtures/will-unresolved.clp")
(run)
(if (and
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-unresolved)
          (eq ?result:predicate valid-will)
          (eq ?result:value unknown)))
      (any-factp ((?missing missing-requirement))
        (and
          (eq ?missing:case-id case-unresolved)
          (eq ?missing:predicate unresolved-rule-path))))
  then
    (printout t "PASS will-unresolved-rule-path" crlf)
  else
    (printout t "FAIL will-unresolved-rule-path" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-minor-valid.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-minor-valid)
          (eq ?fact:predicate minor-special-requirement)
          (eq ?fact:value satisfied)
          (eq ?fact:rule-id R-B05)))
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-minor-valid)
          (eq ?result:predicate valid-will)
          (eq ?result:value true))))
  then
    (printout t "PASS will-minor-valid" crlf)
  else
    (printout t "FAIL will-minor-valid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-minor-invalid.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-minor-invalid)
          (eq ?fact:predicate minor-special-requirement)
          (eq ?fact:value failed)
          (eq ?fact:rule-id R-B06)))
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-minor-invalid)
          (eq ?result:predicate valid-will)
          (eq ?result:value false))))
  then
    (printout t "PASS will-minor-invalid" crlf)
  else
    (printout t "FAIL will-minor-invalid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-accessibility-valid.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-accessibility-valid)
          (eq ?fact:predicate accessibility-form-requirement)
          (eq ?fact:value satisfied)
          (eq ?fact:rule-id R-B07)))
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-accessibility-valid)
          (eq ?result:predicate valid-will)
          (eq ?result:value true))))
  then
    (printout t "PASS will-accessibility-valid" crlf)
  else
    (printout t "FAIL will-accessibility-valid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-oral-valid.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-oral-valid)
          (eq ?fact:predicate oral-form-requirement)
          (eq ?fact:value satisfied)
          (eq ?fact:rule-id R-B09)))
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-oral-valid)
          (eq ?result:predicate valid-will)
          (eq ?result:value true))))
  then
    (printout t "PASS will-oral-valid-boundaries" crlf)
  else
    (printout t "FAIL will-oral-valid-boundaries" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-oral-revoked.clp")
(run)
(if (and
      (any-factp ((?fact derived-fact))
        (and
          (eq ?fact:case-id case-oral-revoked)
          (eq ?fact:predicate will-effect-status)
          (eq ?fact:value automatically-revoked)
          (eq ?fact:rule-id R-B08)))
      (any-factp ((?result module-result))
        (and
          (eq ?result:case-id case-oral-revoked)
          (eq ?result:predicate will-currently-effective)
          (eq ?result:value false))))
  then
    (printout t "PASS will-oral-automatically-revoked" crlf)
  else
    (printout t "FAIL will-oral-automatically-revoked" crlf))

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
