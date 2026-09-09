; Shared fact contracts for the inheritance-law expert system.

(deftemplate analysis-request
  (slot case-id (type SYMBOL))
  (slot module (type SYMBOL)
    (allowed-symbols will-validity inheritance-type eligibility heir-rank representation compulsory-share refusal limitation)))

(deftemplate will-input
  (slot case-id (type SYMBOL))
  (slot mental-capacity (type SYMBOL) (allowed-symbols true false unknown) (default unknown))
  (slot deceived-or-threatened (type SYMBOL) (allowed-symbols true false unknown) (default unknown))
  (slot content-lawful (type SYMBOL) (allowed-symbols true false unknown) (default unknown))
  (slot form-lawful (type SYMBOL) (allowed-symbols true false unknown) (default unknown)))

(deftemplate intermediate-conclusion
  (slot case-id (type SYMBOL))
  (slot predicate (type SYMBOL))
  (slot value (type SYMBOL) (allowed-symbols true false unknown conflict))
  (slot rule-id (type SYMBOL)))

(deftemplate module-result
  (slot case-id (type SYMBOL))
  (slot module (type SYMBOL))
  (slot predicate (type SYMBOL))
  (slot value (type SYMBOL) (allowed-symbols true false unknown conflict))
  (slot rule-id (type SYMBOL))
  (slot legal-source (type STRING))
  (slot explanation (type STRING)))

(deftemplate inference-trace
  (slot case-id (type SYMBOL))
  (slot sequence (type INTEGER))
  (slot rule-id (type SYMBOL))
  (multislot supports)
  (slot conclusion (type STRING)))

(deftemplate trace-counter
  (slot case-id (type SYMBOL))
  (slot next (type INTEGER) (default 1)))

