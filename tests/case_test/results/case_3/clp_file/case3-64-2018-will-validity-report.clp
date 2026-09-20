; Quick Logic Test replay file

; knowledge-base: inheritance-kb-v21

; topic: will-validity

; question: Di chúc có hợp pháp không?



(analysis-request
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (module will-validity))

(asserted-fact
  (fact-id c3-label-case)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate estate-portion-label)
  (value "Vu an 64/2018/DS-ST"))

(asserted-fact
  (fact-id c3-label-portion)
  (case-id case3-64-2018)
  (subject di-san-dat)
  (predicate estate-portion-label)
  (value "Di san quyen su dung dat 3 thua"))

(asserted-fact
  (fact-id c3-label-asset281)
  (case-id case3-64-2018)
  (subject thua-281)
  (predicate estate-asset-label)
  (value "Thua dat 281"))

(asserted-fact
  (fact-id c3-label-asset235)
  (case-id case3-64-2018)
  (subject thua-235)
  (predicate estate-asset-label)
  (value "Thua dat 235"))

(asserted-fact
  (fact-id c3-label-asset285)
  (case-id case3-64-2018)
  (subject thua-285)
  (predicate estate-asset-label)
  (value "Thua dat 285"))

(asserted-fact
  (fact-id c3-label-req)
  (case-id case3-64-2018)
  (subject req-chia-c3)
  (predicate limitation-request-label)
  (value "Yeu cau chia di san dat dai"))

(asserted-fact
  (fact-id c3-ongt-label)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate person-label)
  (value "Ong Ngo T (chet 1993)"))

(asserted-fact
  (fact-id c3-ongt-deceased)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate deceased-person)
  (value true))

(asserted-fact
  (fact-id c3-search-complete)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate heir-search-complete)
  (value true))

(asserted-fact
  (fact-id c3-has-will)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate has-will)
  (value false))

(asserted-fact
  (fact-id c3-portion-exists)
  (case-id case3-64-2018)
  (subject di-san-dat)
  (predicate estate-portion)
  (value true))

(asserted-fact
  (fact-id c3-bang-label)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate person-label)
  (value "Ba Trung Ng (vo)"))

(asserted-fact
  (fact-id c3-bang-spouse)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate spouse-at-opening)
  (value ong-t))

(asserted-fact
  (fact-id c3-bang-cand)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-bang-life)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-bang-elig)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-bang-rev)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-bang-ref)
  (case-id case3-64-2018)
  (subject ba-ng)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ongm-label)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate person-label)
  (value "Ong Ngo M (con)"))

(asserted-fact
  (fact-id c3-ongm-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ong-m))

(asserted-fact
  (fact-id c3-ongm-cand)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongm-life)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ongm-elig)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongm-rev)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongm-ref)
  (case-id case3-64-2018)
  (subject ong-m)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ongm1-label)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate person-label)
  (value "Ong Ngo M1 (con)"))

(asserted-fact
  (fact-id c3-ongm1-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ong-m1))

(asserted-fact
  (fact-id c3-ongm1-cand)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongm1-life)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ongm1-elig)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongm1-rev)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongm1-ref)
  (case-id case3-64-2018)
  (subject ong-m1)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-bab-label)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate person-label)
  (value "Ba Ngo Thi B (con - nguyen don)"))

(asserted-fact
  (fact-id c3-bab-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ba-b))

(asserted-fact
  (fact-id c3-bab-cand)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-bab-life)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-bab-elig)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-bab-rev)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-bab-ref)
  (case-id case3-64-2018)
  (subject ba-b)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ongx-label)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate person-label)
  (value "Ong Ngo X (con - bi don)"))

(asserted-fact
  (fact-id c3-ongx-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ong-x))

(asserted-fact
  (fact-id c3-ongx-cand)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongx-life)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ongx-elig)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongx-rev)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongx-ref)
  (case-id case3-64-2018)
  (subject ong-x)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ongv-label)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate person-label)
  (value "Ong Ngo V (con - tu choi nhan di san)"))

(asserted-fact
  (fact-id c3-ongv-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ong-v))

(asserted-fact
  (fact-id c3-ongv-cand)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongv-life)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ongv-elig)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongv-rev)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongv-ref-scope)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-assessment-subject)
  (value true))

(asserted-fact
  (fact-id c3-ongv-ref-made)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-made)
  (value true))

(asserted-fact
  (fact-id c3-ongv-ref-intent)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-intent)
  (value ordinary))

(asserted-fact
  (fact-id c3-ongv-ref-written)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-written)
  (value true))

(asserted-fact
  (fact-id c3-ongv-ref-recip)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-notice-recipient)
  (value other-heir))

(asserted-fact
  (fact-id c3-ongv-ref-time)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate refusal-before-estate-distribution)
  (value true))

(asserted-fact
  (fact-id c3-ongv-ref-valid)
  (case-id case3-64-2018)
  (subject ong-v)
  (predicate valid-refusal)
  (value true))

(asserted-fact
  (fact-id c3-ongs-label)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate person-label)
  (value "Ong Ngo Thu S (con - chet)"))

(asserted-fact
  (fact-id c3-ongs-edge)
  (case-id case3-64-2018)
  (subject ong-t)
  (predicate biological-parent-of)
  (value ong-s))

(asserted-fact
  (fact-id c3-ongs-cand)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate heir-rank-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongs-life)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate heir-life-status)
  (value dead-before-or-same))

(asserted-fact
  (fact-id c3-ongs-elig)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongs-rev)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongs-ref)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ngob-label)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate person-label)
  (value "Ngo B (chau the vi ong S)"))

(asserted-fact
  (fact-id c3-ngob-edge)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate biological-parent-of)
  (value ngo-b))

(asserted-fact
  (fact-id c3-ngob-rep)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ngob-life)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ngob-elig)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ngob-rev)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ngob-ref)
  (case-id case3-64-2018)
  (subject ngo-b)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-ongh1-label)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate person-label)
  (value "Ong Ngo H1 (chau the vi ong S)"))

(asserted-fact
  (fact-id c3-ongh1-edge)
  (case-id case3-64-2018)
  (subject ong-s)
  (predicate biological-parent-of)
  (value ong-h1))

(asserted-fact
  (fact-id c3-ongh1-rep)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate representation-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongh1-life)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate heir-life-status)
  (value alive))

(asserted-fact
  (fact-id c3-ongh1-elig)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate eligibility-candidate)
  (value true))

(asserted-fact
  (fact-id c3-ongh1-rev)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate eligibility-review-complete)
  (value true))

(asserted-fact
  (fact-id c3-ongh1-ref)
  (case-id case3-64-2018)
  (subject ong-h1)
  (predicate valid-refusal)
  (value false))

(asserted-fact
  (fact-id c3-limit-req)
  (case-id case3-64-2018)
  (subject req-chia-c3)
  (predicate limitation-assessment-subject)
  (value true))

(asserted-fact
  (fact-id c3-limit-type)
  (case-id case3-64-2018)
  (subject req-chia-c3)
  (predicate request-type)
  (value divide-estate))

(asserted-fact
  (fact-id c3-limit-asset)
  (case-id case3-64-2018)
  (subject req-chia-c3)
  (predicate asset-type)
  (value immovable))

(asserted-fact
  (fact-id c3-limit-date)
  (case-id case3-64-2018)
  (subject req-chia-c3)
  (predicate inheritance-opening-date)
  (value "1993-10-28"))

(asserted-fact
  (fact-id c3-vnd-calc)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate estate-vnd-calculation)
  (value true))

(asserted-fact
  (fact-id c3-ast-comp)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate estate-asset-set-complete)
  (value true))

(asserted-fact
  (fact-id c3-obl-comp)
  (case-id case3-64-2018)
  (subject case3-64-2018)
  (predicate estate-obligation-set-complete)
  (value true))

(asserted-fact
  (fact-id c3-thua281-asset)
  (case-id case3-64-2018)
  (subject thua-281)
  (predicate estate-asset)
  (value true))

(asserted-fact
  (fact-id c3-thua281-val)
  (case-id case3-64-2018)
  (subject thua-281)
  (predicate asset-value-vnd)
  (value 500000000))

(asserted-fact
  (fact-id c3-thua281-num)
  (case-id case3-64-2018)
  (subject thua-281)
  (predicate deceased-ownership-numerator)
  (value 1))

(asserted-fact
  (fact-id c3-thua281-den)
  (case-id case3-64-2018)
  (subject thua-281)
  (predicate deceased-ownership-denominator)
  (value 1))



; RESULT status=missing-facts

; RESULT module=will-validity subject=case3-64-2018 valid-will=unknown rules=SYSTEM-INCOMPLETE

; TRACE-GROUP Quy tắc kiểm soát nhất quán và tính đầy đủ | Kiểm tra của hệ thống

; TRACE rule=SYSTEM-INCOMPLETE | Hệ thống còn ít nhất một dữ kiện bắt buộc chưa được cung cấp và chưa có kết luận hợp pháp, không hợp pháp hoặc mâu thuẫn. => Kết quả chưa xác định

; MISSING module=will-validity subject=case3-64-2018 predicate=will-type | Cần bổ sung will type cho Vu an 64/2018/DS-ST.

; MISSING module=will-validity subject=case3-64-2018 predicate=testator-mental-state | Cần bổ sung testator mental state cho Vu an 64/2018/DS-ST.

; MISSING module=will-validity subject=case3-64-2018 predicate=undue-influence | Cần bổ sung undue influence cho Vu an 64/2018/DS-ST.

; MISSING module=will-validity subject=case3-64-2018 predicate=prohibited-content | Cần bổ sung prohibited content cho Vu an 64/2018/DS-ST.
