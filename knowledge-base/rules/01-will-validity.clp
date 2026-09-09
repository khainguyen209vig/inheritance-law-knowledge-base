; Module 1: basic validity of a will.
; Initial vertical slice implements R-B01 through R-B04 from Loc_Rulebase.md.

(defrule initialize-will-validity-trace
  (declare (salience 1000))
  (analysis-request (case-id ?case-id) (module will-validity))
  (not (trace-counter (case-id ?case-id)))
  =>
  (assert (trace-counter (case-id ?case-id) (next 1))))

(defrule R-B01-valid-intention
  (declare (salience 100))
  (analysis-request (case-id ?case-id) (module will-validity))
  (will-input
    (case-id ?case-id)
    (mental-capacity true)
    (deceived-or-threatened false))
  (not (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-intention)
    (value true)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-intention)
    (value true)
    (rule-id R-B01)))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id R-B01)
    (supports mental-capacity=true deceived-or-threatened=false)
    (conclusion "Điều kiện về ý chí hợp lệ")))
  (modify ?counter (next (+ ?sequence 1))))

(defrule R-B02-valid-content-and-form
  (declare (salience 100))
  (analysis-request (case-id ?case-id) (module will-validity))
  (will-input
    (case-id ?case-id)
    (content-lawful true)
    (form-lawful true))
  (not (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-content-and-form)
    (value true)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-content-and-form)
    (value true)
    (rule-id R-B02)))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id R-B02)
    (supports content-lawful=true form-lawful=true)
    (conclusion "Điều kiện về nội dung và hình thức hợp lệ")))
  (modify ?counter (next (+ ?sequence 1))))

(defrule R-B03-valid-will
  (declare (salience 90))
  (analysis-request (case-id ?case-id) (module will-validity))
  (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-intention)
    (value true))
  (intermediate-conclusion
    (case-id ?case-id)
    (predicate valid-content-and-form)
    (value true))
  (not (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)
    (value true)
    (rule-id R-B03)
    (legal-source "Điều 630 Bộ luật Dân sự 2015")
    (explanation "Có đủ điều kiện cơ bản về ý chí, nội dung và hình thức theo rule-base hiện tại.")))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id R-B03)
    (supports valid-intention=true valid-content-and-form=true)
    (conclusion "Di chúc hợp pháp")))
  (modify ?counter (next (+ ?sequence 1))))

(defrule R-B04-invalid-will-no-mental-capacity
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module will-validity))
  (will-input (case-id ?case-id) (mental-capacity false))
  (not (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (legal-source "Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015")
    (explanation "Người lập di chúc không minh mẫn, sáng suốt.")))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id R-B04)
    (supports mental-capacity=false)
    (conclusion "Di chúc không hợp pháp")))
  (modify ?counter (next (+ ?sequence 1))))

(defrule R-B04-invalid-will-deceived-or-threatened
  (declare (salience 200))
  (analysis-request (case-id ?case-id) (module will-validity))
  (will-input (case-id ?case-id) (deceived-or-threatened true))
  (not (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)
    (value false)
    (rule-id R-B04)
    (legal-source "Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015")
    (explanation "Người lập di chúc bị lừa dối hoặc đe dọa.")))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id R-B04)
    (supports deceived-or-threatened=true)
    (conclusion "Di chúc không hợp pháp")))
  (modify ?counter (next (+ ?sequence 1))))

(defrule will-validity-unknown
  (declare (salience -1000))
  (analysis-request (case-id ?case-id) (module will-validity))
  (not (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)))
  ?counter <- (trace-counter (case-id ?case-id) (next ?sequence))
  =>
  (assert (module-result
    (case-id ?case-id)
    (module will-validity)
    (predicate valid-will)
    (value unknown)
    (rule-id SYSTEM-INCOMPLETE)
    (legal-source "")
    (explanation "Chưa đủ dữ kiện để kết luận tính hợp pháp của di chúc.")))
  (assert (inference-trace
    (case-id ?case-id)
    (sequence ?sequence)
    (rule-id SYSTEM-INCOMPLETE)
    (supports missing-required-facts)
    (conclusion "Chưa đủ dữ kiện để kết luận")))
  (modify ?counter (next (+ ?sequence 1))))

