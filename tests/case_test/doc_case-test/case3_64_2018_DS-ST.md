# CASE 3: BẢN ÁN 64/2018/DS-ST (TAND THỊ XÃ NGÃ NĂM, SÓC TRĂNG)
## TRANH CHẤP CHIA THỪA KẾ QUYỀN SỬ DỤNG ĐẤT (CÓ NGƯỜI TỪ CHỐI NHẬN DI SẢN THEO ĐIỀU 620 BLDS)
# LINK TẢI CHI TIẾT: https://thuvienphapluat.vn/banan/ban-an/ban-an-642018dsst-ngay-01082018-ve-tranh-chap-doi-lai-tai-san-64334
---

## 1. Tóm tắt tình huống mô phỏng

- **Người để lại di sản**: Ông **Ngô T** (chết ngày 28/10/1993, mở thừa kế ngày 28/10/1993), không để lại di chúc.
- **Vợ**: Bà **Trung Ng** (còn sống tại thời điểm mở thừa kế năm 1993).
- **Di sản tranh chấp**: Gồm 3 thửa đất tại khóm M, phường M, thị xã Ngã Năm, tỉnh Sóc Trăng:
  1. Thửa **281** (diện tích 976,1m² đất LNK).
  2. Thửa **235** (diện tích 3.110,9m² đất lúa).
  3. Thửa **285** (diện tích 1.619,3m² đất LNK).
- **Tình trạng các con của ông Ngô T**:
  1. Ông **Ngô M** (con ruột, còn sống).
  2. Ông **Ngô M1** (con ruột, còn sống).
  3. Bà **Ngô Thị B** (con ruột, nguyên đơn khởi kiện, còn sống).
  4. Ông **Ngô X** (con ruột, bị đơn, còn sống).
  5. Ông **Ngô V** (con ruột, còn sống) — **Có văn bản từ chối nhận di sản thừa kế hợp pháp** theo đúng quy định tại Điều 620 Bộ luật Dân sự 2015 (không nhằm trốn tránh nghĩa vụ tài sản, gửi thông báo trước khi phân chia di sản).
  6. Ông **Ngô Thu S** (con ruột, chết trước/cùng thời điểm mở thừa kế), để lại các con gồm **Ngô B** và **Ngô H1** (cháu thừa kế thế vị theo Điều 652 BLDS).
- **Yêu cầu khởi kiện**: Yêu cầu xác định hàng thừa kế, ghi nhận việc từ chối nhận di sản của ông V, xác định quyền thế vị của các con ông S, và xác định thời hiệu phân chia quyền sử dụng đất.

---

## 2. Sơ đồ cây quan hệ gia đình & Danh mục nhân vật

```
                         Ông Ngô T (chết 1993)
                                  |
            +---------------------+---------------------+
            | (vợ)                                      | (các con)
       Bà Trung Ng                                      |
                                +---------+---------+---+-----+---------+
                                |         |         |         |         |
                              Ông M     Ông M1     Bà B      Ông X     Ông V       Ông Thu S
                             (sống)    (sống)    (nguyên    (bị đơn)  (TỪ CHỐI      (chết)
                                                  đơn)                 ĐIỀU 620)       |
                                                                                    +--+--+
                                                                                    |     |
                                                                                  Ngô B  Ông H1
                                                                                 (thế vị) (thế vị)
```

| Tên nhân vật / Thực thể | Định danh Symbol (`subject`) | Loại đối tượng | Nhãn thân thiện (`person-label` / `asset-label`) | Trạng thái / Vai trò |
|---|---|---|---|---|
| Hồ sơ vụ án | `case3-64-2018` | Case study | "Vu an 64/2018/DS-ST" | Vụ án kiểm thử |
| Khối di sản đất đai | `di-san-dat` | Estate Portion | "Di san quyen su dung dat 3 thua" | Khối di sản không di chúc |
| Thửa đất 281 | `thua-281` | Estate Asset | "Thua dat 281" | Đất LNK diện tích 976m² |
| Thửa đất 235 | `thua-235` | Estate Asset | "Thua dat 235" | Đất lúa diện tích 3.111m² |
| Thửa đất 285 | `thua-285` | Estate Asset | "Thua dat 285" | Đất LNK diện tích 1.619m² |
| Yêu cầu chia thừa kế | `req-chia-c3` | Limitation Req | "Yeu cau chia di san dat dai" | Yêu cầu chia BĐS mở 1993 |
| Ông Ngô T | `ong-t` | Person | "Ong Ngo T (chet 1993)" | Người để lại di sản (chết 1993) |
| Bà Trung Ng | `ba-ng` | Person | "Ba Trung Ng (vo)" | Vợ tại thời điểm mở thừa kế (Hàng 1) |
| Ông Ngô M | `ong-m` | Person | "Ong Ngo M (con)" | Con trai còn sống (Hàng 1) |
| Ông Ngô M1 | `ong-m1` | Person | "Ong Ngo M1 (con)" | Con trai còn sống (Hàng 1) |
| Bà Ngô Thị B | `ba-b` | Person | "Ba Ngo Thi B (con - nguyen don)" | Con gái còn sống (Hàng 1 - nguyên đơn) |
| Ông Ngô X | `ong-x` | Person | "Ong Ngo X (con - bi don)" | Con trai còn sống (Hàng 1 - bị đơn) |
| Ông Ngô V | `ong-v` | Person | "Ong Ngo V (con - tu choi nhan di san)"| Con trai từ chối thừa kế hợp lệ |
| Ông Ngô Thu S | `ong-s` | Person | "Ong Ngo Thu S (con - chet)" | Con trai đã chết (được thế vị) |
| Ngô B | `ngo-b` | Person | "Ngo B (chau the vi ong S)" | Cháu nội thừa kế thế vị |
| Ông Ngô H1 | `ong-h1` | Person | "Ong Ngo H1 (chau the vi ong S)" | Cháu nội thừa kế thế vị |

---

## 3. Bảng đầy đủ Facts kỹ thuật (Dòng, Cột, Nhãn thân thiện)

Tất cả các dòng dữ liệu tuân thủ nghiêm ngặt Zod Contract Schema (`caseFactSchema`), đảm bảo **0 lỗi (0 errors)** và **0 cảnh báo (0 warnings)** khi nạp vào chế độ kiểm thử kỹ thuật:

| STT | Fact ID | Case ID | Subject | Predicate | Value | Nhãn thân thiện tương ứng | Ý nghĩa pháp lý |
|---|---|---|---|---|---|---|---|
| 1 | `c3-label-case` | `case3-64-2018` | `case3-64-2018` | `estate-portion-label` | `"Vu an 64/2018/DS-ST"` | Vu an 64/2018/DS-ST | Nhãn hiển thị của vụ án |
| 2 | `c3-label-portion` | `case3-64-2018` | `di-san-dat` | `estate-portion-label` | `"Di san quyen su dung dat 3 thua"` | Di san quyen su dung dat 3 thua | Nhãn khối di sản đất đai |
| 3 | `c3-label-asset281`| `case3-64-2018` | `thua-281` | `estate-asset-label` | `"Thua dat 281"` | Thua dat 281 | Nhãn tài sản thửa 281 |
| 4 | `c3-label-asset235`| `case3-64-2018` | `thua-235` | `estate-asset-label` | `"Thua dat 235"` | Thua dat 235 | Nhãn tài sản thửa 235 |
| 5 | `c3-label-asset285`| `case3-64-2018` | `thua-285` | `estate-asset-label` | `"Thua dat 285"` | Thua dat 285 | Nhãn tài sản thửa 285 |
| 6 | `c3-label-req` | `case3-64-2018` | `req-chia-c3` | `limitation-request-label` | `"Yeu cau chia di san dat dai"` | Yeu cau chia di san dat dai | Nhãn yêu cầu thời hiệu |
| 7 | `c3-ongt-label` | `case3-64-2018` | `ong-t` | `person-label` | `"Ong Ngo T (chet 1993)"` | Ong Ngo T (chet 1993) | Nhãn người để lại di sản |
| 8 | `c3-ongt-deceased` | `case3-64-2018` | `ong-t` | `deceased-person` | `true` | Ong Ngo T (chet 1993) | Xác nhận đã chết |
| 9 | `c3-search-complete`| `case3-64-2018` | `case3-64-2018` | `heir-search-complete` | `true` | Vu an 64/2018/DS-ST | Tìm kiếm người thừa kế hoàn tất |
| 10 | `c3-has-will` | `case3-64-2018` | `case3-64-2018` | `has-will` | `false` | Vu an 64/2018/DS-ST | Không có di chúc (chia theo luật) |
| 11 | `c3-portion-exists` | `case3-64-2018` | `di-san-dat` | `estate-portion` | `true` | Di san quyen su dung dat 3 thua | Tồn tại khối di sản đất |
| 12 | `c3-bang-label` | `case3-64-2018` | `ba-ng` | `person-label` | `"Ba Trung Ng (vo)"` | Ba Trung Ng (vo) | Nhãn người vợ |
| 13 | `c3-bang-spouse` | `case3-64-2018` | `ba-ng` | `spouse-at-opening` | `ong-t` | Ba Trung Ng (vo) | Vợ hợp pháp tại thời điểm mở TK |
| 14 | `c3-bang-cand` | `case3-64-2018` | `ba-ng` | `heir-rank-candidate` | `true` | Ba Trung Ng (vo) | Ứng viên xét hàng thừa kế |
| 15 | `c3-bang-life` | `case3-64-2018` | `ba-ng` | `heir-life-status` | `alive` | Ba Trung Ng (vo) | Còn sống tại thời điểm mở TK |
| 16 | `c3-bang-elig` | `case3-64-2018` | `ba-ng` | `eligibility-candidate` | `true` | Ba Trung Ng (vo) | Rà soát tư cách Điều 621 |
| 17 | `c3-bang-rev` | `case3-64-2018` | `ba-ng` | `eligibility-review-complete`| `true` | Ba Trung Ng (vo) | Đủ tư cách thừa kế |
| 18 | `c3-bang-ref` | `case3-64-2018` | `ba-ng` | `valid-refusal` | `false` | Ba Trung Ng (vo) | Không từ chối nhận di sản |
| 19 | `c3-ongm-label` | `case3-64-2018` | `ong-m` | `person-label` | `"Ong Ngo M (con)"` | Ong Ngo M (con) | Nhãn con trai |
| 20 | `c3-ongm-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ong-m` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con trai |
| 21 | `c3-ongm-cand` | `case3-64-2018` | `ong-m` | `heir-rank-candidate` | `true` | Ong Ngo M (con) | Ứng viên xét hàng thừa kế |
| 22 | `c3-ongm-life` | `case3-64-2018` | `ong-m` | `heir-life-status` | `alive` | Ong Ngo M (con) | Còn sống |
| 23 | `c3-ongm-elig` | `case3-64-2018` | `ong-m` | `eligibility-candidate` | `true` | Ong Ngo M (con) | Rà soát tư cách Điều 621 |
| 24 | `c3-ongm-rev` | `case3-64-2018` | `ong-m` | `eligibility-review-complete`| `true` | Ong Ngo M (con) | Đủ tư cách thừa kế |
| 25 | `c3-ongm-ref` | `case3-64-2018` | `ong-m` | `valid-refusal` | `false` | Ong Ngo M (con) | Không từ chối nhận di sản |
| 26 | `c3-ongm1-label` | `case3-64-2018` | `ong-m1` | `person-label` | `"Ong Ngo M1 (con)"` | Ong Ngo M1 (con) | Nhãn con trai |
| 27 | `c3-ongm1-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ong-m1` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con trai |
| 28 | `c3-ongm1-cand` | `case3-64-2018` | `ong-m1` | `heir-rank-candidate` | `true` | Ong Ngo M1 (con) | Ứng viên xét hàng thừa kế |
| 29 | `c3-ongm1-life` | `case3-64-2018` | `ong-m1` | `heir-life-status` | `alive` | Ong Ngo M1 (con) | Còn sống |
| 30 | `c3-ongm1-elig` | `case3-64-2018` | `ong-m1` | `eligibility-candidate` | `true` | Ong Ngo M1 (con) | Rà soát tư cách Điều 621 |
| 31 | `c3-ongm1-rev` | `case3-64-2018` | `ong-m1` | `eligibility-review-complete`| `true` | Ong Ngo M1 (con) | Đủ tư cách thừa kế |
| 32 | `c3-ongm1-ref` | `case3-64-2018` | `ong-m1` | `valid-refusal` | `false` | Ong Ngo M1 (con) | Không từ chối nhận di sản |
| 33 | `c3-bab-label` | `case3-64-2018` | `ba-b` | `person-label` | `"Ba Ngo Thi B (con - nguyen don)"` | Ba Ngo Thi B (con - nguyen don) | Nhãn con gái (nguyên đơn) |
| 34 | `c3-bab-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ba-b` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con gái |
| 35 | `c3-bab-cand` | `case3-64-2018` | `ba-b` | `heir-rank-candidate` | `true` | Ba Ngo Thi B (con - nguyen don) | Ứng viên xét hàng thừa kế |
| 36 | `c3-bab-life` | `case3-64-2018` | `ba-b` | `heir-life-status` | `alive` | Ba Ngo Thi B (con - nguyen don) | Còn sống |
| 37 | `c3-bab-elig` | `case3-64-2018` | `ba-b` | `eligibility-candidate` | `true` | Ba Ngo Thi B (con - nguyen don) | Rà soát tư cách Điều 621 |
| 38 | `c3-bab-rev` | `case3-64-2018` | `ba-b` | `eligibility-review-complete`| `true` | Ba Ngo Thi B (con - nguyen don) | Đủ tư cách thừa kế |
| 39 | `c3-bab-ref` | `case3-64-2018` | `ba-b` | `valid-refusal` | `false` | Ba Ngo Thi B (con - nguyen don) | Không từ chối nhận di sản |
| 40 | `c3-ongx-label` | `case3-64-2018` | `ong-x` | `person-label` | `"Ong Ngo X (con - bi don)"` | Ong Ngo X (con - bi don) | Nhãn con trai (bị đơn) |
| 41 | `c3-ongx-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ong-x` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con trai |
| 42 | `c3-ongx-cand` | `case3-64-2018` | `ong-x` | `heir-rank-candidate` | `true` | Ong Ngo X (con - bi don) | Ứng viên xét hàng thừa kế |
| 43 | `c3-ongx-life` | `case3-64-2018` | `ong-x` | `heir-life-status` | `alive` | Ong Ngo X (con - bi don) | Còn sống |
| 44 | `c3-ongx-elig` | `case3-64-2018` | `ong-x` | `eligibility-candidate` | `true` | Ong Ngo X (con - bi don) | Rà soát tư cách Điều 621 |
| 45 | `c3-ongx-rev` | `case3-64-2018` | `ong-x` | `eligibility-review-complete`| `true` | Ong Ngo X (con - bi don) | Đủ tư cách thừa kế |
| 46 | `c3-ongx-ref` | `case3-64-2018` | `ong-x` | `valid-refusal` | `false` | Ong Ngo X (con - bi don) | Không từ chối nhận di sản |
| 47 | `c3-ongv-label` | `case3-64-2018` | `ong-v` | `person-label` | `"Ong Ngo V (con - tu choi nhan di san)"` | Ong Ngo V (tu choi) | Nhãn con trai từ chối |
| 48 | `c3-ongv-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ong-v` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con trai |
| 49 | `c3-ongv-cand` | `case3-64-2018` | `ong-v` | `heir-rank-candidate` | `true` | Ong Ngo V (tu choi) | Ứng viên xét hàng thừa kế |
| 50 | `c3-ongv-life` | `case3-64-2018` | `ong-v` | `heir-life-status` | `alive` | Ong Ngo V (tu choi) | Còn sống |
| 51 | `c3-ongv-elig` | `case3-64-2018` | `ong-v` | `eligibility-candidate` | `true` | Ong Ngo V (tu choi) | Rà soát tư cách Điều 621 |
| 52 | `c3-ongv-rev` | `case3-64-2018` | `ong-v` | `eligibility-review-complete`| `true` | Ong Ngo V (tu choi) | Đủ tư cách thừa kế |
| 53 | `c3-ongv-ref-scope` | `case3-64-2018` | `ong-v` | `refusal-assessment-subject` | `true` | Ong Ngo V (tu choi) | Đối tượng thẩm định từ chối |
| 54 | `c3-ongv-ref-made` | `case3-64-2018` | `ong-v` | `refusal-made` | `true` | Ong Ngo V (tu choi) | Đã có hành vi từ chối |
| 55 | `c3-ongv-ref-intent`| `case3-64-2018` | `ong-v` | `refusal-intent` | `ordinary` | Ong Ngo V (tu choi) | Không nhằm trốn tránh nghĩa vụ |
| 56 | `c3-ongv-ref-written`| `case3-64-2018` | `ong-v` | `refusal-written` | `true` | Ong Ngo V (tu choi) | Lập thành văn bản |
| 57 | `c3-ongv-ref-recip` | `case3-64-2018` | `ong-v` | `refusal-notice-recipient` | `other-heir` | Ong Ngo V (tu choi) | Gửi đến đồng thừa kế khác |
| 58 | `c3-ongv-ref-time` | `case3-64-2018` | `ong-v` | `refusal-before-estate-distribution` | `true` | Ong Ngo V (tu choi) | Gửi trước thời điểm chia di sản |
| 59 | `c3-ongv-ref-valid` | `case3-64-2018` | `ong-v` | `valid-refusal` | `true` | Ong Ngo V (tu choi) | **Từ chối thừa kế hợp lệ** |
| 60 | `c3-ongs-label` | `case3-64-2018` | `ong-s` | `person-label` | `"Ong Ngo Thu S (con - chet)"` | Ong Ngo Thu S (con - chet) | Nhãn con trai đã chết |
| 61 | `c3-ongs-edge` | `case3-64-2018` | `ong-t` | `biological-parent-of` | `ong-s` | Ong Ngo T (chet 1993) | Quan hệ cha ruột - con trai |
| 62 | `c3-ongs-cand` | `case3-64-2018` | `ong-s` | `heir-rank-candidate` | `true` | Ong Ngo Thu S (con - chet) | Ứng viên xét hàng thừa kế |
| 63 | `c3-ongs-life` | `case3-64-2018` | `ong-s` | `heir-life-status` | `dead-before-or-same` | Ong Ngo Thu S (con - chet) | Chết trước hoặc cùng thời điểm mở TK |
| 64 | `c3-ongs-elig` | `case3-64-2018` | `ong-s` | `eligibility-candidate` | `true` | Ong Ngo Thu S (con - chet) | Rà soát tư cách Điều 621 |
| 65 | `c3-ongs-rev` | `case3-64-2018` | `ong-s` | `eligibility-review-complete`| `true` | Ong Ngo Thu S (con - chet) | Đủ điều kiện hưởng nếu còn sống |
| 66 | `c3-ongs-ref` | `case3-64-2018` | `ong-s` | `valid-refusal` | `false` | Ong Ngo Thu S (con - chet) | Không từ chối |
| 67 | `c3-ngob-label` | `case3-64-2018` | `ngo-b` | `person-label` | `"Ngo B (chau the vi ong S)"` | Ngo B (chau the vi ong S) | Nhãn cháu nội |
| 68 | `c3-ngob-edge` | `case3-64-2018` | `ong-s` | `biological-parent-of` | `ngo-b` | Ong Ngo Thu S (con - chet) | Quan hệ cha ruột - con |
| 69 | `c3-ngob-rep` | `case3-64-2018` | `ngo-b` | `representation-candidate` | `true` | Ngo B (chau the vi ong S) | Ứng viên thừa kế thế vị |
| 70 | `c3-ngob-life` | `case3-64-2018` | `ngo-b` | `heir-life-status` | `alive` | Ngo B (chau the vi ong S) | Còn sống |
| 71 | `c3-ngob-elig` | `case3-64-2018` | `ngo-b` | `eligibility-candidate` | `true` | Ngo B (chau the vi ong S) | Rà soát tư cách Điều 621 |
| 72 | `c3-ngob-rev` | `case3-64-2018` | `ngo-b` | `eligibility-review-complete`| `true` | Ngo B (chau the vi ong S) | Đủ tư cách thừa kế |
| 73 | `c3-ngob-ref` | `case3-64-2018` | `ngo-b` | `valid-refusal` | `false` | Ngo B (chau the vi ong S) | Không từ chối |
| 74 | `c3-ongh1-label` | `case3-64-2018` | `ong-h1` | `person-label` | `"Ong Ngo H1 (chau the vi ong S)"` | Ong Ngo H1 (chau the vi) | Nhãn cháu nội |
| 75 | `c3-ongh1-edge` | `case3-64-2018` | `ong-s` | `biological-parent-of` | `ong-h1` | Ong Ngo Thu S (con - chet) | Quan hệ cha ruột - con |
| 76 | `c3-ongh1-rep` | `case3-64-2018` | `ong-h1` | `representation-candidate` | `true` | Ong Ngo H1 (chau the vi) | Ứng viên thừa kế thế vị |
| 77 | `c3-ongh1-life` | `case3-64-2018` | `ong-h1` | `heir-life-status` | `alive` | Ong Ngo H1 (chau the vi) | Còn sống |
| 78 | `c3-ongh1-elig` | `case3-64-2018` | `ong-h1` | `eligibility-candidate` | `true` | Ong Ngo H1 (chau the vi) | Rà soát tư cách Điều 621 |
| 79 | `c3-ongh1-rev` | `case3-64-2018` | `ong-h1` | `eligibility-review-complete`| `true` | Ong Ngo H1 (chau the vi) | Đủ tư cách thừa kế |
| 80 | `c3-ongh1-ref` | `case3-64-2018` | `ong-h1` | `valid-refusal` | `false` | Ong Ngo H1 (chau the vi) | Không từ chối |
| 81 | `c3-limit-req` | `case3-64-2018` | `req-chia-c3` | `limitation-assessment-subject` | `true` | Yeu cau chia di san dat dai | Đối tượng thẩm định thời hiệu |
| 82 | `c3-limit-type` | `case3-64-2018` | `req-chia-c3` | `request-type` | `divide-estate` | Yeu cau chia di san dat dai | Loại yêu cầu: Chia di sản |
| 83 | `c3-limit-asset` | `case3-64-2018` | `req-chia-c3` | `asset-type` | `immovable` | Yeu cau chia di san dat dai | Loại tài sản: Bất động sản |
| 84 | `c3-limit-date` | `case3-64-2018` | `req-chia-c3` | `inheritance-opening-date` | `"1993-10-28"` | Yeu cau chia di san dat dai | Ngày mở thừa kế: 28/10/1993 |
| 85 | `c3-vnd-calc` | `case3-64-2018` | `case3-64-2018` | `estate-vnd-calculation` | `true` | Vu an 64/2018/DS-ST | Kích hoạt tính toán giá trị VNĐ |
| 86 | `c3-ast-comp` | `case3-64-2018` | `case3-64-2018` | `estate-asset-set-complete` | `true` | Vu an 64/2018/DS-ST | Tập hợp tài sản hoàn tất |
| 87 | `c3-obl-comp` | `case3-64-2018` | `case3-64-2018` | `estate-obligation-set-complete`| `true` | Vu an 64/2018/DS-ST | Nghĩa vụ hoàn tất (0 nợ) |
| 88 | `c3-thua281-asset`| `case3-64-2018` | `thua-281` | `estate-asset` | `true` | Thua dat 281 | Tài sản thuộc di sản |
| 89 | `c3-thua281-val` | `case3-64-2018` | `thua-281` | `asset-value-vnd` | `500000000` | Thua dat 281 | Giá trị định giá: 500.000.000 VNĐ |
| 90 | `c3-thua281-num` | `case3-64-2018` | `thua-281` | `deceased-ownership-numerator`| `1` | Thua dat 281 | Tử số quyền sở hữu: 1 |
| 91 | `c3-thua281-den` | `case3-64-2018` | `thua-281` | `deceased-ownership-denominator`| `1` | Thua dat 281 | Mẫu số quyền sở hữu: 1 (toàn bộ) |

---

## 4. Kết quả suy luận kỹ thuật mong đợi (Expected Output)

### 4.1. Chế độ phân chia thừa kế (`inheritance-type`)
- **Kết luận**: Chế độ phân chia đối với `di-san-dat` là **chia theo pháp luật (`statutory`)** (Căn cứ: Điều 650 BLDS, do `has-will = false`).

### 4.2. Hàng thừa kế (`heir-rank`)
- **Hàng thừa kế thứ nhất (`candidate-heir-rank = rank-1`)**:
  - `ba-ng` (Vợ)
  - `ong-m` (Con)
  - `ong-m1` (Con)
  - `ba-b` (Con)
  - `ong-x` (Con)
  - `ong-v` (Con - từ chối nhận di sản)
  - `ong-s` (Con - đã chết)
- **Người được gọi hưởng trực tiếp (`called-to-inherit`)**:
  - `ba-ng` = `true`
  - `ong-m` = `true`
  - `ong-m1` = `true`
  - `ba-b` = `true`
  - `ong-x` = `true`
  - `ong-v` = **`false`** (do có `valid-refusal = true` hợp lệ theo Điều 620 BLDS)
  - `ong-s` = **`false`** (do đã chết trước/cùng thời điểm mở thừa kế)

### 4.3. Từ chối nhận di sản (`refusal-and-unclaimed`)
- Căn cứ Điều 620 Bộ luật Dân sự 2015:
  - Hành vi từ chối của ông Ngô V thỏa mãn đầy đủ các điều kiện luật định (có văn bản, gửi đến đồng thừa kế, trước thời điểm chia di sản, không nhằm trốn tránh nghĩa vụ tài sản).
  - Kết luận: **`valid-refusal = true`**. Phần di sản mà ông V từ chối được chia đều cho các đồng thừa kế khác.

### 4.4. Quyền thừa kế thế vị (`representation`)
- Căn cứ Điều 652 BLDS:
  - `ngo-b` (Ngô B) thừa kế thế vị kỷ phần của `ong-s`: **`inherits-by-representation = true`**.
  - `ong-h1` (Ngô H1) thừa kế thế vị kỷ phần của `ong-s`: **`inherits-by-representation = true`**.

### 4.5. Thời hiệu yêu cầu chia di sản (`limitation`)
- Căn cứ Điều 623 BLDS 2015:
  - Thời hiệu chia thừa kế bất động sản: **`limitation-period-years = 30 năm`**.
  - Mốc kết thúc thời hiệu tính từ ngày 28/10/1993: **`limitation-deadline = 2023-10-28`**.
  - Khởi kiện năm 2017: **Trong thời hiệu quy định của pháp luật**.
