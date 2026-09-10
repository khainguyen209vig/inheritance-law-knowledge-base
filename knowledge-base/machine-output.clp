; Stable, line-oriented boundary consumed by the TypeScript adapter.
; Every field before a multifield value is a CLIPS symbol from a validated
; allow-list, so the adapter does not need to parse CLIPS pretty-print output.

(deffunction emit-machine-output ()
  (printout t "@@INFERENCE-BEGIN@@" crlf)

  (do-for-all-facts ((?result module-result)) TRUE
    (printout t
      "@@RESULT@@ "
      ?result:case-id " "
      ?result:subject " "
      ?result:module " "
      ?result:predicate " "
      ?result:value " "
      (implode$ ?result:derivations)
      crlf))

  (do-for-all-facts ((?missing missing-requirement)) TRUE
    (printout t
      "@@MISSING@@ "
      ?missing:case-id " "
      ?missing:subject " "
      ?missing:module " "
      ?missing:predicate
      crlf))

  (do-for-all-facts ((?trace inference-trace)) TRUE
    (printout t
      "@@TRACE@@ "
      ?trace:case-id " "
      ?trace:subject " "
      ?trace:rule-id " "
      ?trace:conclusion-predicate " "
      ?trace:conclusion-value " "
      (implode$ ?trace:supports)
      crlf))

  (printout t "@@INFERENCE-END@@" crlf))
