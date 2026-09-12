# Knowledge base

Thư mục này chứa tri thức mà CLIPS có thể thực thi, tách biệt với mã Next.js. Các rules mới phải được chuẩn hóa theo `doc/Loc_Rulebase_v2.md`; rule chưa được duyệt chỉ được triển khai với trạng thái `draft`/`TEAM_REVIEW` và cảnh báo rõ trên UI.

## Các vertical slice hiện có

Mô-đun `will-validity` hiện triển khai R-B01–R-B09 từ `doc/Loc_Rulebase_v2.md` và sinh:

- `asserted-fact`: dữ kiện nguyên tử của vụ việc;
- `derived-fact`: tri thức mới cùng Rule ID và các facts hỗ trợ;
- `module-result`: kết quả công khai của mô-đun;
- `inference-trace`: dấu vết áp dụng luật;
- `missing-requirement`: dữ kiện bắt buộc còn thiếu;
- kết quả `unknown` hoặc `conflict` thay vì tự chọn một kết luận.

Các fixtures bao phủ trường hợp hợp lệ, không hợp lệ, chưa đủ dữ kiện, dữ kiện mâu thuẫn, người lập di chúc chưa thành niên, người bị hạn chế thể chất, di chúc miệng và domain inference không phụ thuộc vào yêu cầu từ UI. Đây là bản nháp phục vụ kỹ thuật, chưa được kiểm chứng pháp lý.

Mô-đun `inheritance-type` triển khai R-A01–R-A06 theo từng `estate-portion`. Một lần chạy có thể sinh nhiều `inheritance-regime(portion)=statutory|testamentary`; hai chế độ ở hai phần khác nhau không phải mâu thuẫn. Nhóm A nạp cùng nhóm B để dùng `valid-will` do CLIPS dẫn xuất. R-A02, R-A03, R-A04 và R-A05a vẫn mang nhãn `TEAM_REVIEW` dù đã được bật trong prototype theo yêu cầu của nhóm.

Mô-đun `eligibility` triển khai R-D01–R-D05 theo từng người dựa trên Điều 621. Hành vi, bản án, mục đích và ngoại lệ được biểu diễn bằng facts riêng; `eligibility-review-complete=true` xác nhận nhóm đã rà soát đủ các căn cứ, không phải kết luận pháp lý do hệ thống tự đoán.

Mô-đun `heir-rank` triển khai R-C01–R-C06. Ba hàng được suy ra từ các đường đi trên graph có hướng thay vì nhãn hàng do người dùng nhập. `candidate-heir-rank` được giữ riêng với `called-to-inherit`; việc chọn `active-heir-rank` chỉ diễn ra khi có `heir-search-complete=true`, đồng thời dùng kết quả Điều 621, tình trạng sống và việc từ chối. R-C02, R-C03, R-C04 và R-C06 vẫn là `TEAM_REVIEW`.

Presenter dùng mô hình `people + edges`: mỗi node người và mỗi cạnh nguyên tử đều có thể xem, sửa hoặc xóa. UI không còn lưu các lựa chọn tổng hợp như “cháu” hay “hàng 2”; các node trung gian của hồ sơ cũ được khôi phục thành người có thể chỉnh sửa. Fact preview và graph diagnostics chạy trước khi gọi CLIPS.

Mô-đun `representation` triển khai R-E01/R-E02 theo Điều 652 và R-E03a/R-E03b theo Điều 653. CLIPS suy ra `would-be-entitled-if-alive` rồi đối sánh nhánh cháu/chắt; quan hệ con nuôi được lưu thành căn cứ hai chiều và có thể đồng thời tồn tại với quan hệ cha mẹ đẻ. R-E03 không tự kết luận quyền hưởng cuối cùng. R-E01/R-E02 vẫn là `TEAM_REVIEW`; R-E04–R-E05 chưa được triển khai.

Nếu các observations đều có mặt nhưng chưa khớp đường suy luận dương hoặc exclusion rule đã được mô hình hóa, completeness layer tạo `unresolved-rule-path` và trả `UNKNOWN`. Cách xử lý này giữ open-world semantics cho đến khi team duyệt rule âm tương ứng.

## Phân lớp tri thức

| Lớp | Tệp | Trách nhiệm |
|---|---|---|
| Fact contracts | `templates.clp` | Định nghĩa hình dạng của dữ kiện, kết luận và provenance |
| Rule registry | `rule-registry.json` | Nguồn duy nhất cho căn cứ, giải thích, implementation và trạng thái kiểm duyệt |
| Legal metadata | `rule-metadata.clp` | Dữ liệu CLIPS được sinh tự động từ rule registry |
| Domain knowledge | `rules/01-will-validity.clp` đến `rules/05-representation.clp` | Suy ra tri thức pháp lý chỉ từ asserted/derived facts |
| Completeness/conflict | `rules/90-*` đến `rules/94-*` | Phát hiện facts thiếu và kết luận mâu thuẫn |
| Explanation | `rules/98-explanation.clp` | Chuyển provenance của derived facts thành trace đồng nhất |
| Result projection | `rules/95-*` đến `rules/99-*` | Chọn kết quả cần trả cho mô-đun mà UI yêu cầu |
| Machine output | `machine-output.clp` | Xuất result, missing facts và trace bằng line protocol ổn định cho TypeScript |

`analysis-request` không được sử dụng trong domain rules. Vì vậy tri thức vẫn được suy ra khi không có yêu cầu hiển thị từ UI; yêu cầu chỉ điều khiển projection của kết quả.

Các con số trong tên tệp thể hiện tầng ưu tiên của kiến trúc, không phải thứ tự thủ tục bắt buộc. CLIPS vẫn đối sánh toàn bộ facts và quản lý activations qua agenda.

## Cập nhật metadata của rule

Sửa `rule-registry.json`, sau đó chạy:

```bash
npm run kb:generate
npm test
```

Không sửa `rule-metadata.clp` trực tiếp. Mỗi Rule ID giải thích được có thể ánh xạ tới một hoặc nhiều `defrule` qua trường `implementations`; rule hệ thống được phân biệt bằng `kind=system`, còn adapter kỹ thuật dùng `kind=internal`. Test registry kiểm tra các implementation của domain, Rule ID được phát ra, tham chiếu legal catalog và tính đồng bộ của file sinh.

## Rule base không phải chuỗi `if/else`

- Domain rules là các production rules độc lập; backend không gọi R-B01 rồi gọi R-B02 theo thứ tự viết cứng.
- Rules sinh `derived-fact` vào working memory; các rules khác có thể tiếp tục khớp với tri thức vừa sinh.
- Facts đầu vào sử dụng các observations như `testator-mental-state=lucid`, không nhập trực tiếp kết luận `valid-will=true`.
- Domain rules không chứa logic UI, bộ đếm trace hoặc chuỗi giải thích dành cho frontend.
- Các biểu thức `if` trong `tests/` chỉ là test assertions, không thuộc knowledge base nghiệp vụ.

### Giới hạn còn lại của vertical slice

`prohibited-content` vẫn là observation ở mức khái quát. Với di chúc bằng văn bản thông thường, `formal-defect=not-detected` được xử lý bởi adapter chuyển tiếp `FORM-ASSESSMENT-ACCEPTED`; adapter này phải được thay thế khi các Điều 627–636 được phân rã đầy đủ. Các trường hợp R-B05–R-B09 đã dùng facts cụ thể hơn như tuổi, sự đồng ý của người giám hộ, người làm chứng, chữ ký, công chứng/chứng thực và thời hạn.

## Cài đặt CLIPS

Trên Ubuntu/Pop!_OS:

```bash
sudo apt update
sudo apt install clips
```

Lệnh `sudo` yêu cầu thành viên dự án nhập mật khẩu máy của mình trực tiếp trong terminal.

## Chạy thử

Sau khi cài CLIPS:

```bash
clips -f2 knowledge-base/run-fixture.clp
clips -f2 knowledge-base/run-machine-fixture.clp
clips -f2 knowledge-base/tests/will-validity.clp
clips -f2 knowledge-base/tests/inheritance-type.clp
clips -f2 knowledge-base/tests/eligibility.clp
clips -f2 knowledge-base/tests/heir-rank.clp
clips -f2 knowledge-base/tests/representation.clp
```

Không đưa dữ liệu người dùng trực tiếp vào chuỗi lệnh CLIPS. Adapter TypeScript sau này phải kiểm tra schema và serialize facts bằng danh sách giá trị được phép.
