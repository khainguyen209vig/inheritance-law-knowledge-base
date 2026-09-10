; Explanation subsystem: derive a uniform trace record for every conclusion.

(defrule record-inference-trace
  (declare (salience 200))
  (derived-fact
    (case-id ?case-id)
    (subject ?subject)
    (predicate ?predicate)
    (value ?value)
    (rule-id ?rule-id)
    (supports $?supports))
  (not (inference-trace
    (case-id ?case-id)
    (subject ?subject)
    (rule-id ?rule-id)
    (conclusion-predicate ?predicate)
    (conclusion-value ?value)))
  =>
  (assert (inference-trace
    (case-id ?case-id)
    (subject ?subject)
    (rule-id ?rule-id)
    (conclusion-predicate ?predicate)
    (conclusion-value ?value)
    (supports $?supports))))
