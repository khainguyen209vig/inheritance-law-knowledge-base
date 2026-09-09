---
title: "Rule-base Luật Thừa kế Việt Nam"
source_file: "Loc_Rulebase.docx"
legal_basis_stated_in_source: "Bộ luật Dân sự 2015, Điều 609–662"
document_role: "Context cho hệ thống biểu diễn tri thức và suy luận"
conversion_date: "2026-09-09"
verification_status: "Chưa đối chiếu với văn bản pháp luật chính thức và các sửa đổi hiện hành"
---

# Luật Thừa Kế (Bộ luật Dân sự 2015, Điều 609–662)

> **Phạm vi sử dụng:** Tệp này chuyển hóa nội dung từ `Loc_Rulebase.docx` sang Markdown và giữ nguyên mô hình biến, luật, căn cứ điều luật cùng ví dụ trong tài liệu nguồn. Đây là rule-base phục vụ thiết kế và suy luận, không phải bản sao văn bản pháp luật chính thức. Trước khi dùng cho tư vấn hoặc quyết định thực tế, các quy tắc cần được chuyên gia pháp lý đối chiếu và phê duyệt.

## 1. Bảng Biến (Facts / Variables)

| **Ký hiệu** | **Ý nghĩa** | **Kiểu dữ liệu** |
|:--:|----|----|
| **nguoi_chet** | Người để lại di sản (đã chết) | Object |
| **nguoi_thua_ke** | Người đang xét quyền thừa kế | Object |
| **co_di_chuc** | Có di chúc hay không | Boolean |
| **di_chuc_hop_phap** | Di chúc có hợp pháp không | Boolean |
| **di_chuc_chi_dinh(X)** | Di chúc có chỉ định người X không | Boolean |
| **nguoi_lap_dc_minh_man** | Người lập di chúc minh mẫn, sáng suốt | Boolean |
| **noi_dung_dc_hop_phap** | Nội dung di chúc không vi phạm pháp luật | Boolean |
| **hinh_thuc_dc_hop_phap** | Hình thức di chúc đúng quy định | Boolean |
| **bi_lua_doi_de_doa** | Người lập di chúc bị lừa dối, đe dọa | Boolean |
| **tuoi** | Tuổi của người lập di chúc / người thừa kế | Integer |
| **con_song** | Người thừa kế còn sống tại thời điểm mở thừa kế | Boolean |
| **quan_he(X,Y)** | Quan hệ giữa X và Y (vợ, chồng, cha, mẹ, con…) | String |
| **hang_thua_ke** | Hàng thừa kế (1, 2, 3) | Integer |
| **co_nguoi_hang_truoc** | Còn người ở hàng thừa kế trước | Boolean |
| **tu_choi_nhan_di_san** | Người thừa kế từ chối nhận di sản | Boolean |
| **bi_truat_quyen** | Bị truất quyền hưởng di sản | Boolean |
| **bi_ket_an_xam_pham** | Bị kết án hành vi xâm phạm tính mạng/sức khỏe người để lại di sản | Boolean |
| **vi_pham_nghia_vu_nuoi_duong** | Vi phạm nghiêm trọng nghĩa vụ nuôi dưỡng | Boolean |
| **lua_doi_di_chuc** | Lừa dối, giả mạo, hủy di chúc | Boolean |
| **cha_me_da_chet** | Cha/mẹ (người thừa kế hàng 1) đã chết trước người để lại di sản | Boolean |
| **co_kha_nang_lao_dong** | Có khả năng lao động | Boolean |
| **quan_he_cham_soc** | Có quan hệ chăm sóc, nuôi dưỡng như cha con, mẹ con | Boolean |
| **di_san** | Tổng giá trị di sản | Float |
| **phan_di_san(X)** | Phần di sản người X được hưởng | Float |

## 2. Bảng Luật (Rules)

### NHÓM A — Xác định loại thừa kế (Theo di chúc hay Theo pháp luật)

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-A01** | Đ.649, Đ.650 | co_di_chuc = FALSE | Áp dụng thừa kế theo pháp luật |
| **R-A02** | Đ.650 | co_di_chuc = TRUE AND di_chuc_hop_phap = FALSE | Áp dụng thừa kế theo pháp luật |
| **R-A03** | Đ.650 | co_di_chuc = TRUE AND di_chuc_hop_phap = TRUE | Áp dụng thừa kế theo di chúc |
| **R-A04** | Đ.650 | co_di_chuc = TRUE AND di_chuc_hop_phap = TRUE AND tất cả người thừa kế theo di chúc con_song = FALSE | Áp dụng thừa kế theo pháp luật |
| **R-A05** | Đ.650 | co_di_chuc = TRUE AND di_chuc_hop_phap = TRUE AND tất cả người được chỉ định tu_choi_nhan_di_san = TRUE hoặc bi_truat_quyen = TRUE | Áp dụng thừa kế theo pháp luật |
| **R-A06** | Đ.650 | co_di_chuc = TRUE AND di_chuc_hop_phap = TRUE AND phần di sản không được định đoạt trong di chúc | Phần đó áp dụng thừa kế theo pháp luật |

### NHÓM B — Xác định tính hợp pháp của di chúc

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-B01** | Đ.630.1a | nguoi_lap_dc_minh_man = TRUE AND bi_lua_doi_de_doa = FALSE | Điều kiện ý chí hợp lệ |
| **R-B02** | Đ.630.1b | noi_dung_dc_hop_phap = TRUE AND hinh_thuc_dc_hop_phap = TRUE | Điều kiện nội dung & hình thức hợp lệ |
| **R-B03** | Đ.630 | R-B01 = TRUE AND R-B02 = TRUE | di_chuc_hop_phap = TRUE |
| **R-B04** | Đ.630.1a | nguoi_lap_dc_minh_man = FALSE OR bi_lua_doi_de_doa = TRUE | di_chuc_hop_phap = FALSE |
| **R-B05** | Đ.630.2 | tuoi >= 15 AND tuoi < 18 AND di chúc lập bằng văn bản AND được cha/mẹ/người giám hộ đồng ý | di_chuc_hop_phap = TRUE |
| **R-B06** | Đ.630.2 | tuoi >= 15 AND tuoi < 18 AND (di chúc KHÔNG lập bằng văn bản OR KHÔNG được cha/mẹ/người giám hộ đồng ý) | di_chuc_hop_phap = FALSE |
| **R-B07** | Đ.630.3 | Người bị hạn chế thể chất hoặc không biết chữ AND di chúc lập bởi người làm chứng bằng văn bản AND có công chứng/chứng thực | di_chuc_hop_phap = TRUE |
| **R-B08** | Đ.629.2 | Di chúc miệng AND sau 3 tháng người lập di chúc còn sống, minh mẫn | di_chuc_hop_phap = FALSE (di chúc miệng bị hủy bỏ) |
| **R-B09** | Đ.630.5 | Di chúc miệng AND trước mặt >= 2 người làm chứng AND người làm chứng ghi chép, ký tên AND trong 5 ngày được công chứng/chứng thực xác nhận | di_chuc_hop_phap = TRUE |

### NHÓM C — Xác định người thừa kế theo pháp luật (Hàng thừa kế)

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-C01** | Đ.651.1a | quan_he(X, nguoi_chet) thuộc {vợ, chồng, cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi, con đẻ, con nuôi} | hang_thua_ke(X) = 1 |
| **R-C02** | Đ.651.1b | quan_he(X, nguoi_chet) thuộc {ông nội, bà nội, ông ngoại, bà ngoại, anh ruột, chị ruột, em ruột, cháu ruột (người chết là ông/bà)} | hang_thua_ke(X) = 2 |
| **R-C03** | Đ.651.1c | quan_he(X, nguoi_chet) thuộc {cụ nội, cụ ngoại, bác ruột, chú ruột, cậu ruột, cô ruột, dì ruột, cháu ruột (người chết là bác/chú/cậu/cô/dì), chắt ruột (người chết là cụ)} | hang_thua_ke(X) = 3 |
| **R-C04** | Đ.651.2 | hang_thua_ke(X) = hang_thua_ke(Y) (cùng hàng) | phan_di_san(X) = phan_di_san(Y) (chia đều) |
| **R-C05** | Đ.651.3 | hang_thua_ke(X) = N AND co_nguoi_hang_truoc(N-1) = TRUE | X không được hưởng di sản |
| **R-C06** | Đ.651.3 | hang_thua_ke(X) = N AND co_nguoi_hang_truoc(N-1) = FALSE (tất cả đã chết, bị truất quyền, từ chối) | X được hưởng di sản |

### NHÓM D — Xác định người KHÔNG được quyền hưởng di sản

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-D01** | Đ.621.1a | bi_ket_an_xam_pham = TRUE (xâm phạm tính mạng, sức khỏe, ngược đãi, hành hạ người để lại di sản) | Không được hưởng di sản |
| **R-D02** | Đ.621.1b | vi_pham_nghia_vu_nuoi_duong = TRUE | Không được hưởng di sản |
| **R-D03** | Đ.621.1c | Bị kết án cố ý xâm phạm tính mạng người thừa kế khác nhằm hưởng di sản | Không được hưởng di sản |
| **R-D04** | Đ.621.1d | lua_doi_di_chuc = TRUE (lừa dối, cưỡng ép, giả mạo, sửa, hủy, che giấu di chúc) | Không được hưởng di sản |
| **R-D05** | Đ.621.2 | R-D01 OR R-D02 OR R-D03 OR R-D04 = TRUE, NHƯNG người để lại di sản đã biết và vẫn cho hưởng theo di chúc | Vẫn được hưởng di sản |

### NHÓM E — Thừa kế thế vị

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-E01** | Đ.652 | Con của nguoi_chet chết trước hoặc cùng thời điểm với nguoi_chet AND cháu còn sống | Cháu được hưởng phần di sản mà cha/mẹ cháu được hưởng nếu còn sống (thừa kế thế vị) |
| **R-E02** | Đ.652 | Cháu cũng chết trước/cùng thời điểm với nguoi_chet AND chắt còn sống | Chắt được hưởng phần di sản mà cha/mẹ chắt được hưởng nếu còn sống (thừa kế thế vị) |
| **R-E03** | Đ.653 | quan_he(X, nguoi_chet) = con nuôi | X được thừa kế di sản của cha nuôi/mẹ nuôi VÀ vẫn được thừa kế di sản của cha đẻ/mẹ đẻ theo Đ.651, Đ.652 |
| **R-E04** | Đ.654 | quan_he(X, nguoi_chet) = con riêng AND quan_he_cham_soc = TRUE | X được thừa kế di sản của bố dượng/mẹ kế VÀ được thừa kế thế vị (Đ.652, Đ.653) |
| **R-E05** | Đ.654 | quan_he(X, nguoi_chet) = con riêng AND quan_he_cham_soc = FALSE | X không được thừa kế di sản của bố dượng/mẹ kế |

### NHÓM F — Người thừa kế không phụ thuộc nội dung di chúc (Suất bắt buộc)

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-F01** | Đ.644.1a | quan_he(X, nguoi_chet) thuộc {con chưa thành niên, cha, mẹ, vợ, chồng} AND (không được cho hưởng theo di chúc HOẶC chỉ được hưởng \< 2/3 suất) | X được hưởng tối thiểu 2/3 suất của 1 người thừa kế theo pháp luật |
| **R-F02** | Đ.644.1b | quan_he(X, nguoi_chet) = con thành niên AND co_kha_nang_lao_dong = FALSE AND (không được cho hưởng HOẶC \< 2/3 suất) | X được hưởng tối thiểu 2/3 suất của 1 người thừa kế theo pháp luật |
| **R-F03** | Đ.644.2 | X thuộc R-F01 hoặc R-F02 NHƯNG tu_choi_nhan_di_san = TRUE | X không được hưởng suất bắt buộc |
| **R-F04** | Đ.644.2 | X thuộc R-F01 hoặc R-F02 NHƯNG thuộc diện R-D01–R-D04 (không có quyền hưởng, Đ.621.1) | X không được hưởng suất bắt buộc |

### NHÓM G — Thừa kế trong quan hệ vợ chồng đặc biệt

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-G01** | Đ.655.1 | Vợ chồng đã chia tài sản chung (hôn nhân còn tồn tại) AND một người chết | Người còn sống vẫn được thừa kế |
| **R-G02** | Đ.655.2 | Vợ chồng đang xin ly hôn AND chưa có bản án/quyết định có hiệu lực pháp luật AND một người chết | Người còn sống vẫn được thừa kế |
| **R-G03** | Đ.655.3 | X là vợ/chồng tại thời điểm nguoi_chet chết AND sau đó X đã kết hôn người khác | X vẫn được thừa kế di sản của nguoi_chet |

### NHÓM H — Từ chối nhận di sản & Tài sản không có người nhận

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-H01** | Đ.620.1 | tu_choi_nhan_di_san = TRUE AND việc từ chối không nhằm trốn tránh nghĩa vụ tài sản | Việc từ chối hợp lệ |
| **R-H02** | Đ.620.1 | tu_choi_nhan_di_san = TRUE AND việc từ chối nhằm trốn tránh nghĩa vụ tài sản | Việc từ chối không hợp lệ |
| **R-H03** | Đ.620.2 | Từ chối nhận di sản phải lập thành văn bản AND gửi đến người quản lý di sản/người thừa kế khác | Từ chối có hiệu lực |
| **R-H04** | Đ.622 | Không có người thừa kế theo di chúc AND không có người thừa kế theo pháp luật (hoặc tất cả bị truất quyền/từ chối) | Di sản thuộc về Nhà nước |

### NHÓM I — Thanh toán & Phân chia di sản

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-I01** | Đ.658 | Có nghĩa vụ tài sản và chi phí liên quan đến thừa kế | Thanh toán theo thứ tự ưu tiên: 1) Mai táng → 2) Cấp dưỡng → 3) Bảo quản di sản → 4) Trợ cấp → 5) Tiền công → 6) Bồi thường → 7) Thuế → 8) Nợ → 9) Phạt → 10) Chi phí khác |
| **R-I02** | Đ.659.1 | Thừa kế theo di chúc AND di chúc không xác định rõ phần từng người | Di sản chia đều cho những người được chỉ định |
| **R-I03** | Đ.660.1 | Phân chia theo pháp luật AND có người thừa kế cùng hàng đã thành thai nhưng chưa sinh | Phải dành lại 1 phần bằng phần người thừa kế khác |
| **R-I04** | Đ.661 | Người lập di chúc hoặc tất cả người thừa kế thỏa thuận chỉ chia di sản sau thời hạn nhất định | Di sản chỉ được chia khi hết thời hạn |
| **R-I05** | Đ.661 | Chia di sản ảnh hưởng nghiêm trọng đến đời sống vợ/chồng còn sống | Tòa án có thể hoãn chia tối đa 3 năm (gia hạn thêm tối đa 3 năm) |

### NHÓM J — Thời hiệu thừa kế

| **Rule ID** | **Điều luật** | **IF (Điều kiện)** | **THEN (Kết luận)** |
|:--:|----|----|----|
| **R-J01** | Đ.623.1 | Di sản là bất động sản | Thời hiệu yêu cầu chia: 30 năm kể từ thời điểm mở thừa kế |
| **R-J02** | Đ.623.1 | Di sản là động sản | Thời hiệu yêu cầu chia: 10 năm kể từ thời điểm mở thừa kế |
| **R-J03** | Đ.623.2 | Yêu cầu xác nhận/bác bỏ quyền thừa kế | Thời hiệu: 10 năm kể từ thời điểm mở thừa kế |
| **R-J04** | Đ.623.3 | Yêu cầu thực hiện nghĩa vụ tài sản | Thời hiệu: 3 năm kể từ thời điểm mở thừa kế |
| **R-J05** | Đ.623.1 | Hết thời hiệu AND có người thừa kế đang quản lý di sản | Di sản thuộc về người đang quản lý |
| **R-J06** | Đ.623.1 | Hết thời hiệu AND không có người thừa kế đang quản lý AND có người chiếm hữu (Đ.236) | Di sản thuộc người chiếm hữu |
| **R-J07** | Đ.623.1 | Hết thời hiệu AND không có người quản lý AND không có người chiếm hữu | Di sản thuộc Nhà nước |

## 3. Ví dụ Suy luận (Forward Chaining)

### Tình huống 1:

*Ông A chết, không để lại di chúc. Ông A có vợ (B), 2 con đẻ (C, D). Con C đã chết trước ông A, C có 1 con là E.*

| **Bước** | **Rule áp dụng** | **Fact mới** |
|:--:|----|----|
| **1** | R-A01: co_di_chuc = FALSE | Thừa kế theo pháp luật |
| **2** | R-C01: B là vợ, C là con đẻ, D là con đẻ | hang_thua_ke(B) = 1, hang_thua_ke(C) = 1, hang_thua_ke(D) = 1 |
| **3** | R-E01: C chết trước A, cháu E còn sống | E được thừa kế thế vị, hưởng phần của C |
| **4** | R-C04: Cùng hàng 1, chia đều | Suất = Di sản / 3 (B=1/3, C=1/3, D=1/3) |
| **5** | Kết hợp R-E01 | B hưởng 1/3, D hưởng 1/3, E hưởng 1/3 (phần thế vị của C) |

### Tình huống 2:

*Bà X chết, có di chúc để lại toàn bộ tài sản cho tổ chức từ thiện. X có chồng (Y, 70 tuổi) và con (Z, 10 tuổi).*

| **Bước** | **Rule áp dụng** | **Fact mới** |
|:--:|----|----|
| **1** | R-A03: co_di_chuc = TRUE, di_chuc_hop_phap = TRUE | Thừa kế theo di chúc |
| **2** | R-F01: Y là chồng, Z là con chưa thành niên → thuộc diện suất bắt buộc (Đ.644) | Y và Z được hưởng tối thiểu 2/3 suất |
| **3** | Tính suất: Nếu chia theo pháp luật, hàng 1 có Y, Z → mỗi suất = Di sản / 2 | Suất bắt buộc mỗi người = 2/3 x (Di sản / 2) = Di sản / 3 |
| **4** | Kết luận | Y hưởng >= 1/3, Z hưởng >= 1/3, tổ chức từ thiện hưởng <= 1/3 |

**Ghi chú:** Bảng rule-base này được xây dựng dựa trên Bộ luật Dân sự 2015 (Phần thứ Tư — Thừa kế, Điều 609–662).
