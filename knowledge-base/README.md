# Knowledge base

Thư mục này chứa tri thức mà CLIPS có thể thực thi, tách biệt với mã Next.js. Các rules mới phải được chuẩn hóa theo `doc/Loc_Rulebase_v2.md` và được team duyệt trước khi triển khai.

## Vertical slice đầu tiên

Mô-đun `will-validity` hiện triển khai các rules cơ bản R-B01–R-B04 từ `doc/Loc_Rulebase.md` và sinh:

- `asserted-fact`: dữ kiện nguyên tử của vụ việc;
- `derived-fact`: tri thức mới cùng Rule ID và các facts hỗ trợ;
- `module-result`: kết quả công khai của mô-đun;
- `inference-trace`: dấu vết áp dụng luật;
- `missing-requirement`: dữ kiện bắt buộc còn thiếu;
- kết quả `unknown` hoặc `conflict` thay vì tự chọn một kết luận.

Các fixtures bao phủ trường hợp hợp lệ, không hợp lệ, chưa đủ dữ kiện, dữ kiện mâu thuẫn và domain inference không phụ thuộc vào yêu cầu từ UI. Đây là bản nháp phục vụ kỹ thuật, chưa được kiểm chứng pháp lý.

## Phân lớp tri thức

| Lớp | Tệp | Trách nhiệm |
|---|---|---|
| Fact contracts | `templates.clp` | Định nghĩa hình dạng của dữ kiện, kết luận và provenance |
| Legal metadata | `rule-metadata.clp` | Lưu căn cứ, mô tả và trạng thái kiểm duyệt của luật |
| Domain knowledge | `rules/01-will-validity.clp` | Suy ra tri thức pháp lý chỉ từ asserted/derived facts |
| Completeness/conflict | `rules/90-will-validity-completeness.clp` | Phát hiện facts thiếu và kết luận mâu thuẫn |
| Explanation | `rules/98-explanation.clp` | Chuyển provenance của derived facts thành trace đồng nhất |
| Result projection | `rules/99-result-projection.clp` | Chọn kết quả cần trả cho mô-đun mà UI yêu cầu |

`analysis-request` không được sử dụng trong domain rules. Vì vậy tri thức vẫn được suy ra khi không có yêu cầu hiển thị từ UI; yêu cầu chỉ điều khiển projection của kết quả.

Các con số trong tên tệp thể hiện tầng ưu tiên của kiến trúc, không phải thứ tự thủ tục bắt buộc. CLIPS vẫn đối sánh toàn bộ facts và quản lý activations qua agenda.

## Rule base không phải chuỗi `if/else`

- Domain rules là các production rules độc lập; backend không gọi R-B01 rồi gọi R-B02 theo thứ tự viết cứng.
- Rules sinh `derived-fact` vào working memory; các rules khác có thể tiếp tục khớp với tri thức vừa sinh.
- Facts đầu vào sử dụng các observations như `testator-mental-state=lucid`, không nhập trực tiếp kết luận `valid-will=true`.
- Domain rules không chứa logic UI, bộ đếm trace hoặc chuỗi giải thích dành cho frontend.
- Các biểu thức `if` trong `tests/` chỉ là test assertions, không thuộc knowledge base nghiệp vụ.

### Giới hạn còn lại của vertical slice

`prohibited-content` và `formal-defect` hiện là các observations ở mức khái quát vì R-B01–R-B04 trong rule catalog chưa mô tả các tiêu chí hình thức chi tiết. Chúng không phải kết luận cuối `valid-will`, nhưng vẫn cần tiếp tục được phân rã thành facts cụ thể như loại di chúc, số người làm chứng, chữ ký, công chứng/chứng thực và thời hạn khi triển khai R-B05–R-B09.

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
clips -f2 knowledge-base/tests/will-validity.clp
```

Không đưa dữ liệu người dùng trực tiếp vào chuỗi lệnh CLIPS. Adapter TypeScript sau này phải kiểm tra schema và serialize facts bằng danh sách giá trị được phép.
