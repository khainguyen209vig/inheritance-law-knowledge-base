# Phụ lục B. Danh mục Rule ID và trạng thái review

## B.1. Phạm vi catalog

Catalog được sinh từ [`knowledge-base/rule-registry.json`](../../knowledge-base/rule-registry.json), schema 1, phiên bản tri thức `inheritance-kb-v21`. Registry có 87 entries và 155 ánh xạ implementation. Theo giả định trạng thái đã chốt cho báo cáo, toàn bộ Rule ID dưới đây được trình bày là **reviewed nội bộ**; trạng thái này xác nhận nhóm đã rà soát đặc tả và hiện thực, không phải phê duyệt của chuyên gia pháp lý độc lập.

Các loại entry gồm `legal` (quy tắc/cầu nối gắn căn cứ pháp luật), `internal` (chuẩn hóa và tính toán kỹ thuật) và `system` (completeness, conflict hoặc projection). Những entry không có implementation trực tiếp có thể đóng vai trò metadata/căn cứ cho UI hoặc được hiện thực qua rule liên quan.

## B.2. Thống kê

| Mô-đun | Số entry |
|---|---:|
| A – Loại thừa kế | 9 |
| B – Tính hợp pháp di chúc | 13 |
| C – Hàng thừa kế | 10 |
| D – Quyền hưởng | 8 |
| E – Thế vị và quan hệ đặc biệt | 12 |
| F – Suất bắt buộc | 8 |
| G – Vợ chồng đặc biệt | 4 |
| H – Từ chối và không người nhận | 7 |
| I – Thanh toán và phân chia | 9 |
| J – Thời hiệu | 7 |
| **Tổng** | **87** |

## B.3. Danh mục đầy đủ

### A – Loại thừa kế

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `DISPOSITION-STATUS-NORMALIZED` | internal | Chuẩn hóa hiệu lực của định đoạt | Quy tắc kết nối nội bộ; phục vụ áp dụng Điều 650 | DISPOSITION-EFFECTIVE-PERSON, DISPOSITION-EFFECTIVE-ORGANIZATION, DISPOSITION-INEFFECTIVE-LIFE, DISPOSITION-INEFFECTIVE-DISQUALIFIED, DISPOSITION-INEFFECTIVE-REFUSAL | reviewed |
| `R-A01` | legal | Không có di chúc | Điều 649 và Điều 650 khoản 1 điểm a Bộ luật Dân sự 2015 | R-A01-no-will | reviewed |
| `R-A02` | legal | Di chúc không hợp pháp | Điều 650 khoản 1 điểm b và khoản 2 điểm b Bộ luật Dân sự 2015 | R-A02-invalid-will-portion | reviewed |
| `R-A03` | legal | Phần định đoạt có hiệu lực | Đặc tả nhóm A; đối chiếu Điều 650 Bộ luật Dân sự 2015 | R-A03-effective-testamentary-disposition | reviewed |
| `R-A04` | legal | Người thừa kế theo di chúc không còn tồn tại | Điều 650 khoản 1 điểm c và khoản 2 điểm c Bộ luật Dân sự 2015 | R-A04-beneficiary-dead, R-A04-organization-no-longer-exists | reviewed |
| `R-A05a` | legal | Người được chỉ định không có quyền hưởng | Điều 650 khoản 1 điểm d và khoản 2 điểm c Bộ luật Dân sự 2015 | R-A05a-beneficiary-disqualified | reviewed |
| `R-A05b` | legal | Người được chỉ định từ chối nhận di sản | Điều 650 khoản 1 điểm d và khoản 2 điểm c Bộ luật Dân sự 2015 | R-A05b-beneficiary-refused | reviewed |
| `R-A06` | legal | Phần di sản không được định đoạt | Điều 650 khoản 2 điểm a Bộ luật Dân sự 2015 | R-A06-undisposed-portion | reviewed |
| `SYSTEM-REGIME-CONFLICT` | system | Phát hiện hai chế độ thừa kế mâu thuẫn | Quy tắc kiểm soát nhất quán của hệ thống | detect-inheritance-regime-conflict | reviewed |

### B – Tính hợp pháp di chúc

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `ARTICLE-627` | legal | Xác định hình thức của di chúc | Điều 627 Bộ luật Dân sự 2015 | — | reviewed |
| `FORM-ASSESSMENT-ACCEPTED` | internal | Chấp nhận đánh giá hình thức chuyển tiếp | Quy tắc chuyển tiếp nội bộ; liên quan Điều 627–636 | FORM-ASSESSMENT-ACCEPTED | reviewed |
| `R-B01` | legal | Đánh giá ý chí của người lập di chúc | Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015 | R-B01-valid-intention | reviewed |
| `R-B02` | legal | Đánh giá nội dung và hình thức | Điều 630 khoản 1 điểm b Bộ luật Dân sự 2015 | R-B02-valid-content-and-form | reviewed |
| `R-B03` | legal | Kết hợp các điều kiện hợp pháp | Điều 630 Bộ luật Dân sự 2015 | R-B03-valid-will | reviewed |
| `R-B04` | legal | Loại trừ do ý chí không hợp lệ | Điều 630 khoản 1 điểm a Bộ luật Dân sự 2015 | R-B04-invalid-will-no-mental-capacity, R-B04-invalid-will-undue-influence | reviewed |
| `R-B05` | legal | Điều kiện dành cho người từ 15 đến dưới 18 tuổi | Điều 630 khoản 2 Bộ luật Dân sự 2015 | R-B05-minor-special-requirement, R-B05-minor-form-requirements | reviewed |
| `R-B06` | legal | Loại trừ do không đạt điều kiện theo độ tuổi | Điều 630 khoản 2 Bộ luật Dân sự 2015 | R-B06-minor-will-not-written, R-B06-minor-without-consent, R-B06-invalid-minor-will | reviewed |
| `R-B07` | legal | Điều kiện hình thức trong trường hợp đặc biệt | Điều 630 khoản 3 Bộ luật Dân sự 2015 | R-B07-physical-limitation-form, R-B07-illiterate-testator-form, R-B07-accessibility-form-requirements | reviewed |
| `R-B08` | legal | Đánh giá hiệu lực hiện tại của di chúc miệng | Điều 629 khoản 2 Bộ luật Dân sự 2015 | R-B08-oral-will-automatically-revoked | reviewed |
| `R-B09` | legal | Đánh giá hình thức của di chúc miệng | Điều 630 khoản 5 Bộ luật Dân sự 2015 | R-B09-valid-oral-form, R-B09-oral-form-requirements | reviewed |
| `SYSTEM-CONFLICT` | system | Phát hiện kết luận mâu thuẫn | Quy tắc kiểm soát nhất quán của hệ thống | detect-valid-will-conflict | reviewed |
| `SYSTEM-INCOMPLETE` | system | Chưa đủ dữ kiện để kết luận | Quy tắc kiểm soát tính đầy đủ của hệ thống | project-unknown-will-validity, project-unknown-inheritance-regime, project-unknown-eligibility, project-unknown-called-to-inherit, project-unknown-heir-rank, project-unknown-representation, project-unknown-compulsory-candidate, project-unknown-compulsory-heir-status | reviewed |

### C – Hàng thừa kế

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `R-C01` | legal | Ứng viên thuộc hàng thừa kế thứ nhất | Điều 651 khoản 1 điểm a Bộ luật Dân sự 2015 | R-C01-spouse, R-C01-spouse-reverse, R-C01-biological-parent, R-C01-adoptive-parent, R-C01-biological-child, R-C01-adoptive-child | reviewed |
| `R-C02` | legal | Ứng viên thuộc hàng thừa kế thứ hai | Điều 651 khoản 1 điểm b Bộ luật Dân sự 2015 | R-C02-grandparent, R-C02-sibling, R-C02-grandchild | reviewed |
| `R-C03` | legal | Ứng viên thuộc hàng thừa kế thứ ba | Điều 651 khoản 1 điểm c Bộ luật Dân sự 2015 | R-C03-great-grandparent, R-C03-aunt-or-uncle, R-C03-niece-or-nephew, R-C03-great-grandchild | reviewed |
| `R-C04` | legal | Nguyên tắc hưởng phần di sản bằng nhau | Điều 651 khoản 2 Bộ luật Dân sự 2015 | R-C04-equal-share-principle, R-C04-calculate-equal-statutory-share-vnd, R-C04-record-statutory-division-remainder-vnd | reviewed |
| `R-C05` | legal | Hàng sau chưa được gọi hưởng | Điều 651 khoản 3 Bộ luật Dân sự 2015 | R-C05-prior-rank-active | reviewed |
| `R-C06` | legal | Xác định hàng được gọi hưởng | Điều 651 khoản 3 Bộ luật Dân sự 2015; kết nối Điều 621 | R-C06-active-rank-one, R-C06-active-rank-two, R-C06-active-rank-three, R-C06-call-active-rank | reviewed |
| `STATUTORY-CANDIDATE-INACTIVE` | internal | Ứng viên không hoạt động trong thừa kế theo pháp luật | Quy tắc kết nối nội bộ; liên quan Điều 620, Điều 621 và Điều 651 | STATUTORY-CANDIDATE-INACTIVE-ELIGIBILITY, STATUTORY-CANDIDATE-INACTIVE-LIFE, STATUTORY-CANDIDATE-INACTIVE-REFUSAL | reviewed |
| `STATUTORY-CANDIDATE-QUALIFIED` | internal | Ứng viên đủ điều kiện xét theo hàng | Quy tắc kết nối nội bộ giữa Điều 621 và Điều 651 | STATUTORY-CANDIDATE-QUALIFIED | reviewed |
| `STATUTORY-CANDIDATE-UNRESOLVED` | internal | Ứng viên chưa đủ dữ kiện điều kiện hưởng | Quy tắc completeness nội bộ; phục vụ áp dụng Điều 651 khoản 3 | STATUTORY-CANDIDATE-UNRESOLVED | reviewed |
| `SYSTEM-RANK-CONFLICT` | system | Phát hiện xung đột hàng thừa kế | Quy tắc kiểm soát nhất quán của hệ thống | SYSTEM-RANK-CONFLICT | reviewed |

### D – Quyền hưởng

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `ELIGIBILITY-BLOCKED` | internal | Chiếu căn cứ loại trừ sang kết quả | Quy tắc kết nối nội bộ; dựa trên Điều 621 | ELIGIBILITY-BLOCKED | reviewed |
| `ELIGIBILITY-CLEAR` | internal | Hoàn tất rà soát căn cứ loại trừ | Quy tắc completeness nội bộ; không phải kết luận quyền hưởng cuối cùng | ELIGIBILITY-CLEAR | reviewed |
| `R-D01` | legal | Hành vi xâm phạm người để lại di sản | Điều 621 khoản 1 điểm a Bộ luật Dân sự 2015 | R-D01-intentional-offense-against-deceased, R-D01-abuse-against-deceased | reviewed |
| `R-D02` | legal | Vi phạm nghiêm trọng nghĩa vụ nuôi dưỡng | Điều 621 khoản 1 điểm b Bộ luật Dân sự 2015 | R-D02-serious-support-duty-violation | reviewed |
| `R-D03` | legal | Xâm phạm người thừa kế khác nhằm hưởng di sản | Điều 621 khoản 1 điểm c Bộ luật Dân sự 2015 | R-D03-offense-against-other-heir | reviewed |
| `R-D04a` | legal | Can thiệp trái ý chí vào việc lập di chúc | Điều 621 khoản 1 điểm d Bộ luật Dân sự 2015 | R-D04a-will-interference | reviewed |
| `R-D04b` | legal | Can thiệp vào văn bản di chúc để hưởng trái ý chí | Điều 621 khoản 1 điểm d Bộ luật Dân sự 2015 | R-D04b-will-document-interference | reviewed |
| `R-D05` | legal | Ngoại lệ do người để lại di sản biết hành vi | Điều 621 khoản 2 Bộ luật Dân sự 2015 | R-D05-disqualification-exception | reviewed |

### E – Thế vị và quan hệ đặc biệt

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `R-E01` | legal | Cháu thừa kế thế vị cho cha hoặc mẹ | Điều 652 Bộ luật Dân sự 2015 | R-E01-grandchild-represents-child | reviewed |
| `R-E02` | legal | Chắt thừa kế thế vị cho cha hoặc mẹ | Điều 652 Bộ luật Dân sự 2015 | R-E02-great-grandchild-represents-grandchild | reviewed |
| `R-E03a` | legal | Quan hệ thừa kế giữa con nuôi và cha mẹ nuôi | Điều 653 Bộ luật Dân sự 2015 | R-E03a-adopted-child-to-adoptive-parent-basis, R-E03a-adoptive-parent-to-adopted-child-basis | reviewed |
| `R-E03b` | legal | Giữ đồng thời căn cứ cha mẹ nuôi và cha mẹ đẻ | Điều 653 Bộ luật Dân sự 2015; đối chiếu Điều 651–652 | R-E03b-dual-parentage-basis | reviewed |
| `R-E04` | legal | Căn cứ thừa kế giữa con riêng và bố dượng, mẹ kế khi có chăm sóc | Điều 654 Bộ luật Dân sự 2015 | R-E04-step-child-to-step-parent-basis, R-E04-step-parent-to-step-child-basis | reviewed |
| `R-E05` | legal | Không phát sinh căn cứ Điều 654 khi đã xác nhận không có chăm sóc | Suy luận loại trừ cần team review từ Điều 654 Bộ luật Dân sự 2015 | R-E05-step-child-without-care-basis, R-E05-step-parent-without-care-basis | reviewed |
| `REPRESENTATION-CANDIDATE-INACTIVE` | internal | Ứng viên không đủ điều kiện hưởng thế vị | Quy tắc kết nối nội bộ; liên quan Điều 620–621 và Điều 652 | REPRESENTATION-CANDIDATE-INACTIVE-ELIGIBILITY, REPRESENTATION-CANDIDATE-INACTIVE-LIFE, REPRESENTATION-CANDIDATE-INACTIVE-REFUSAL | reviewed |
| `REPRESENTATION-CANDIDATE-QUALIFIED` | internal | Ứng viên thế vị đủ điều kiện cá nhân | Quy tắc kết nối nội bộ; liên quan Điều 620–621 và Điều 652 | REPRESENTATION-CANDIDATE-QUALIFIED | reviewed |
| `REPRESENTED-CHILD-WOULD-BE-ENTITLED` | internal | Xác định người con sẽ được hưởng nếu còn sống | Quy tắc kết nối Điều 621, Điều 651 và Điều 652 | REPRESENTED-CHILD-WOULD-BE-ENTITLED | reviewed |
| `REPRESENTED-GRANDCHILD-WOULD-BE-ENTITLED` | internal | Xác định người cháu sẽ được hưởng thế vị nếu còn sống | Quy tắc kết nối Điều 621 và Điều 652 | REPRESENTED-GRANDCHILD-WOULD-BE-ENTITLED | reviewed |
| `SYSTEM-IMPLY-STEP-RELATIONSHIP` | internal | Suy ra quan hệ bố mẹ kế từ các quan hệ gốc | Quy tắc biểu diễn quan hệ của hệ thống | SYSTEM-IMPLY-STEP-PARENT-FROM-FIRST-SPOUSE, SYSTEM-IMPLY-STEP-PARENT-FROM-SECOND-SPOUSE | reviewed |
| `SYSTEM-STEP-CARE-CONFLICT` | system | Phát hiện đánh giá chăm sóc mâu thuẫn | Quy tắc kiểm soát nhất quán của hệ thống | SYSTEM-STEP-CARE-CONFLICT | reviewed |

### F – Suất bắt buộc

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `COMPULSORY-CANDIDATE-NOT-IN-PROTECTED-CLASS` | system | Không thuộc nhóm đối tượng được bảo vệ | Quy tắc completeness phục vụ Điều 644 | COMPULSORY-CANDIDATE-NOT-IN-PROTECTED-CLASS | reviewed |
| `COMPULSORY-HEIR-ACTIVE` | internal | Ứng viên suất bắt buộc còn hoạt động | Quy tắc kết nối nội bộ Điều 620, Điều 621 và Điều 644 | COMPULSORY-HEIR-ACTIVE | reviewed |
| `R-F01a` | legal | Con chưa thành niên thuộc nhóm được bảo vệ | Điều 644 khoản 1 điểm a Bộ luật Dân sự 2015 | R-F01a-minor-biological-child, R-F01a-minor-adopted-child | reviewed |
| `R-F01b` | legal | Cha, mẹ, vợ hoặc chồng thuộc nhóm được bảo vệ | Điều 644 khoản 1 điểm a Bộ luật Dân sự 2015 | R-F01b-parent, R-F01b-spouse-forward, R-F01b-spouse-reverse | reviewed |
| `R-F01c` | legal | Đối chiếu phần được chỉ định với ngưỡng hai phần ba | Điều 644 khoản 1 Bộ luật Dân sự 2015 | R-F01c-calculate-minimum-threshold, R-F01c-shortfall-applies, R-F01c-threshold-already-met, R-F01c-calculate-minimum-threshold-vnd, R-F01c-calculate-shortfall-vnd | reviewed |
| `R-F02` | legal | Con thành niên không có khả năng lao động thuộc nhóm được bảo vệ | Điều 644 khoản 1 điểm b Bộ luật Dân sự 2015 | R-F02-adult-biological-child-without-work-capacity, R-F02-adult-adopted-child-without-work-capacity | reviewed |
| `R-F03` | legal | Loại khỏi suất bắt buộc do từ chối hợp lệ | Điều 644 khoản 2; Điều 620 Bộ luật Dân sự 2015 | R-F03-valid-refusal-excludes-compulsory-share | reviewed |
| `R-F04` | legal | Loại khỏi suất bắt buộc do không có quyền hưởng | Điều 644 khoản 2; Điều 621 khoản 1 Bộ luật Dân sự 2015 | R-F04-disqualification-excludes-compulsory-share | reviewed |

### G – Vợ chồng đặc biệt

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `R-G01` | legal | Chia tài sản chung không làm mất quyền thừa kế của vợ chồng | Điều 655 khoản 1 Bộ luật Dân sự 2015 | R-G01-common-property-divided-forward, R-G01-common-property-divided-reverse | reviewed |
| `R-G02` | legal | Đang xin ly hôn nhưng quyết định chưa có hiệu lực | Điều 655 khoản 2 Bộ luật Dân sự 2015 | R-G02-pending-divorce-forward, R-G02-pending-divorce-reverse | reviewed |
| `R-G03` | legal | Kết hôn sau thời điểm mở thừa kế không làm mất quyền đã phát sinh | Điều 655 khoản 3 Bộ luật Dân sự 2015 | R-G03-remarried-after-opening-forward, R-G03-remarried-after-opening-reverse | reviewed |
| `SPOUSE-STATUS-PRESERVED` | internal | Hợp nhất căn cứ bảo toàn trạng thái vợ chồng | Quy tắc kết nối nội bộ Điều 655 | SPOUSE-STATUS-PRESERVED | reviewed |

### H – Từ chối và không người nhận

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `NO-REFUSAL-MADE` | internal | Không có hành vi từ chối | Quy tắc trạng thái nội bộ | NO-REFUSAL-MADE | reviewed |
| `R-H01` | legal | Điều kiện nội dung của việc từ chối | Điều 620 khoản 1 Bộ luật Dân sự 2015 | R-H01-substantive-condition-satisfied | reviewed |
| `R-H02` | legal | Từ chối nhằm trốn tránh nghĩa vụ tài sản | Điều 620 khoản 1 Bộ luật Dân sự 2015 | R-H02-avoid-obligation-invalid | reviewed |
| `R-H03` | legal | Hình thức và chủ thể nhận thông báo từ chối | Điều 620 khoản 2 Bộ luật Dân sự 2015 | R-H03-form-condition-estate-manager, R-H03-form-condition-other-heir, R-H03-form-condition-distribution-assignee | reviewed |
| `R-H04` | legal | Phần di sản không có người nhận thuộc về Nhà nước | Điều 622 Bộ luật Dân sự 2015 | R-H04-unclaimed-estate-belongs-to-state | reviewed |
| `REFUSAL-STATUS-NORMALIZED` | internal | Chuẩn hóa trạng thái từ chối dùng chung | Quy tắc tương thích và kết nối nội bộ | NORMALIZE-INFERRED-REFUSAL-STATUS, NORMALIZE-LEGACY-REFUSAL-STATUS | reviewed |
| `VALID-REFUSAL-COMPOSED` | internal | Hợp thành hiệu lực của việc từ chối | Quy tắc kết nối nội bộ các khoản 1–3 Điều 620 | VALID-REFUSAL-COMPOSED | reviewed |

### I – Thanh toán và phân chia

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `ESTATE-VND-ASSET` | internal | Quy đổi phần sở hữu đã xác nhận sang VNĐ | Quy tắc tính toán nội bộ; không thực hiện định giá hoặc xác định tranh chấp sở hữu | ESTATE-VND-ASSET-calculate-owned-value, ESTATE-VND-ASSET-record-sub-vnd-remainder | reviewed |
| `ESTATE-VND-TOTALS` | internal | Tổng hợp khối di sản bằng VNĐ | Quy tắc tính toán nội bộ; kết nối thứ tự nghĩa vụ tại Điều 658 | ESTATE-VND-TOTALS-calculate-gross-estate, ESTATE-VND-TOTALS-no-obligations, ESTATE-VND-TOTALS-calculate-obligations, ESTATE-VND-TOTALS-calculate-net-estate, ESTATE-VND-TOTALS-count-statutory-heirs | reviewed |
| `R-I01` | legal | Xác định thứ tự ưu tiên thanh toán | Điều 658 Bộ luật Dân sự 2015 | R-I01-assign-payment-priority | reviewed |
| `R-I02` | legal | Nguyên tắc chia đều khi di chúc không xác định rõ phần | Điều 659 khoản 1 Bộ luật Dân sự 2015 | R-I02-equal-share-default-applies, R-I02-specified-shares-disable-default, R-I02-alternative-agreement-disables-default, R-I02-single-beneficiary-not-a-sharing-case | reviewed |
| `R-I03a` | legal | Dành suất cho người đã thành thai nhưng chưa sinh | Điều 660 khoản 1 Bộ luật Dân sự 2015 | R-I03a-reserve-equal-share-for-prenatal-heir | reviewed |
| `R-I03b` | legal | Xử lý suất đã dành sau kết quả sinh | Điều 660 khoản 1 Bộ luật Dân sự 2015 | R-I03b-born-alive-receives-reserved-share, R-I03b-died-before-birth-returns-share | reviewed |
| `R-I04` | legal | Chỉ phân chia sau thời hạn đã được xác định | Điều 661 Bộ luật Dân sự 2015 | R-I04-will-restricts-division-until-date, R-I04-all-heirs-agreement-restricts-division-until-date | reviewed |
| `R-I05` | legal | Quyền yêu cầu Tòa án hoãn phân chia | Điều 661 Bộ luật Dân sự 2015 | R-I05-surviving-spouse-may-request-deferral, R-I05-surviving-spouse-may-request-one-extension | reviewed |
| `SYSTEM-ESTATE-VND` | system | Kiểm tra nhất quán phép tính VNĐ | Quy tắc kiểm soát nhất quán của hệ thống | SYSTEM-ESTATE-VND-invalid-ownership-ratio, SYSTEM-ESTATE-VND-obligations-exceed-estate | reviewed |

### J – Thời hiệu

| Rule ID | Loại | Tiêu đề/mô tả | Căn cứ | Implementation | Trạng thái báo cáo |
|---|---|---|---|---|---|
| `R-J01` | legal | Thời hiệu yêu cầu chia di sản là bất động sản | Điều 623 khoản 1 Bộ luật Dân sự 2015 | R-J01-immovable-estate-division-period | reviewed |
| `R-J02` | legal | Thời hiệu yêu cầu chia di sản là động sản | Điều 623 khoản 1 Bộ luật Dân sự 2015 | R-J02-movable-estate-division-period | reviewed |
| `R-J03` | legal | Thời hiệu yêu cầu xác nhận hoặc bác bỏ quyền thừa kế | Điều 623 khoản 2 Bộ luật Dân sự 2015 | R-J03-inheritance-right-period | reviewed |
| `R-J04` | legal | Thời hiệu yêu cầu thực hiện nghĩa vụ tài sản | Điều 623 khoản 3 Bộ luật Dân sự 2015 | R-J04-estate-obligation-period | reviewed |
| `R-J05` | legal | Di sản thuộc người thừa kế đang quản lý sau thời hiệu | Điều 623 khoản 1 Bộ luật Dân sự 2015 | R-J05-managing-heir-receives-after-limitation | reviewed |
| `R-J06` | legal | Di sản thuộc người chiếm hữu đủ điều kiện Điều 236 | Điều 623 khoản 1 điểm a Bộ luật Dân sự 2015 | R-J06-qualified-possessor-receives-after-limitation | reviewed |
| `R-J07` | legal | Di sản thuộc Nhà nước khi không có người quản lý hoặc chiếm hữu đủ điều kiện | Điều 623 khoản 1 điểm b Bộ luật Dân sự 2015 | R-J07-state-receives-after-complete-search | reviewed |

## B.4. Kiểm soát đồng bộ

Khi Rule ID, căn cứ hoặc implementation thay đổi, nhóm phải sửa registry nguồn, chạy `npm run kb:generate`, `npm run kb:sources`, `npm run kb:sources:check` và `npm test`. Không sửa `rule-metadata.clp` hoặc source catalog sinh tự động như nguồn chính. Trước khi xuất bản bản cuối, trường trạng thái persisted trong registry cần được đồng bộ với quyết định `reviewed` của báo cáo để tránh hai nguồn biểu đạt khác nhau.

