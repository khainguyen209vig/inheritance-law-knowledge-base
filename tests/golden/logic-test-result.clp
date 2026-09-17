; Quick Logic Test replay file

; knowledge-base: inheritance-kb-test

; topic: will-validity

; question: Di chúc có hợp pháp không?



(analysis-request
  (case-id demo-case)
  (subject will-main)
  (module will-validity))

(asserted-fact
  (fact-id label)
  (case-id demo-case)
  (subject will-main)
  (predicate person-label)
  (value "Ông A"))

(asserted-fact
  (fact-id mental)
  (case-id demo-case)
  (subject will-main)
  (predicate testator-mental-state)
  (value lucid))



; RESULT status=complete

; RESULT module=will-validity subject=will-main valid-will=true rules=R-B03

; TRACE-GROUP Điều 630 khoản 1 điểm a | Điều 630. Di chúc hợp pháp

; TRACE rule=R-B01 | Người lập di chúc minh mẫn, sáng suốt. => Điều kiện về ý chí được đáp ứng.
