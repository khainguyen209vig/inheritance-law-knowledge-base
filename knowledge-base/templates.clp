; Shared fact contracts for the inheritance-law expert system.
; Domain observations, derived knowledge, presentation results and provenance
; are deliberately represented as separate fact types.

(deftemplate analysis-request
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot module (type SYMBOL)
    (allowed-symbols will-validity inheritance-type eligibility heir-rank representation compulsory-share refusal limitation)))

; An atomic observation supplied by the case database or user interface.
; Legal conclusions must not be inserted using this template.
(deftemplate asserted-fact
  (slot fact-id (type SYMBOL))
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot predicate (type SYMBOL))
  (slot value (type SYMBOL INTEGER FLOAT STRING))
  (slot source (type SYMBOL) (allowed-symbols user document system) (default user)))

; Knowledge produced by a domain rule. This fact is both a conclusion and
; declarative provenance: rule-id and supports describe how it was derived.
(deftemplate derived-fact
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot predicate (type SYMBOL))
  (slot value (type SYMBOL INTEGER FLOAT STRING))
  (slot rule-id (type SYMBOL))
  (multislot supports))

(deftemplate rule-metadata
  (slot rule-id (type SYMBOL))
  (slot module (type SYMBOL))
  (slot legal-source (type STRING))
  (slot description (type STRING))
  (slot status (type SYMBOL) (allowed-symbols draft reviewed approved deprecated) (default draft)))

; Produced by completeness rules, not by domain rules.
(deftemplate missing-requirement
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot module (type SYMBOL))
  (slot predicate (type SYMBOL)))

; Public result selected for a requested module. Explanation text is not
; embedded here; the application joins derivations with rule metadata.
(deftemplate module-result
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot module (type SYMBOL))
  (slot predicate (type SYMBOL))
  (slot value (type SYMBOL)
    (allowed-symbols true false unknown conflict statutory testamentary excluded not-excluded exception-under-will))
  (multislot derivations))

; Generic explanation record copied from a derived fact. Sequence/order is
; reconstructed from support dependencies instead of a mutable counter.
(deftemplate inference-trace
  (slot case-id (type SYMBOL))
  (slot subject (type SYMBOL))
  (slot rule-id (type SYMBOL))
  (slot conclusion-predicate (type SYMBOL))
  (slot conclusion-value (type SYMBOL INTEGER FLOAT STRING))
  (multislot supports))
