(load "knowledge-base/templates.clp")
(load "knowledge-base/rules/01-will-validity.clp")

(reset)
(load-facts "knowledge-base/fixtures/will-valid.clp")
(run)
(if (any-factp ((?result module-result))
      (and
        (eq ?result:case-id case-valid)
        (eq ?result:predicate valid-will)
        (eq ?result:value true)
        (eq ?result:rule-id R-B03)))
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
        (eq ?result:predicate valid-will)
        (eq ?result:value false)
        (eq ?result:rule-id R-B04)))
  then
    (printout t "PASS will-invalid" crlf)
  else
    (printout t "FAIL will-invalid" crlf))

(reset)
(load-facts "knowledge-base/fixtures/will-unknown.clp")
(run)
(if (any-factp ((?result module-result))
      (and
        (eq ?result:case-id case-unknown)
        (eq ?result:predicate valid-will)
        (eq ?result:value unknown)
        (eq ?result:rule-id SYSTEM-INCOMPLETE)))
  then
    (printout t "PASS will-unknown" crlf)
  else
    (printout t "FAIL will-unknown" crlf))

(exit)

