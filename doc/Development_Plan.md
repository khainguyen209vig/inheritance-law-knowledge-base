# Kế hoạch phát triển hệ hỗ trợ xác định yếu tố trong luật thừa kế Việt Nam

## 1. Mục tiêu

Xây dựng một hệ chuyên gia dựa trên tri thức để hỗ trợ người dùng:

- khai báo tình huống thừa kế bằng dữ liệu có cấu trúc;
- xác định các dữ kiện pháp lý còn thiếu;
- xác định hình thức thừa kế có thể áp dụng;
- xác định hàng thừa kế, người có hoặc không có quyền hưởng, thừa kế thế vị và suất thừa kế bắt buộc;
- giải thích kết luận bằng facts, quy tắc đã kích hoạt và căn cứ điều luật;
- lưu từng vụ việc riêng biệt mà không trộn dữ kiện vụ việc vào tri thức pháp luật dùng chung.

Hệ thống **không sử dụng LLM**. Tri thức được biểu diễn tường minh bằng facts, quan hệ, ontology hoặc frames và các luật suy diễn `IF–THEN`. Kết luận được tạo bởi inference engine có tính tất định và có thể truy vết.

Phiên bản đầu tiên là một **đồ án sử dụng nội bộ bởi chính nhóm phát triển**, không hướng tới phát hành công khai hoặc cung cấp dịch vụ tư vấn pháp lý. Vì chưa có người chịu trách nhiệm kiểm chứng nội dung pháp lý, toàn bộ knowledge base trong giai đoạn này phải được coi là tri thức thử nghiệm và chưa được phê duyệt.

## 2. Kiến trúc cơ sở

Kiến trúc được tham khảo từ sơ đồ sau:

![Kiến trúc hệ thống dựa trên tri thức](knowledge-based-architect.png)

Các thành phần trong sơ đồ được áp dụng vào bài toán như sau:

| Thành phần | Vai trò trong ứng dụng luật thừa kế |
|---|---|
| User | Người dân, sinh viên hoặc người nghiên cứu cần phân tích một tình huống thừa kế |
| User interface | Biểu mẫu có hướng dẫn để nhập người, quan hệ gia đình, di chúc, thời điểm, tài sản và các sự kiện liên quan |
| Inference engine | Đối sánh facts với luật, thực hiện forward chaining, xử lý ưu tiên và ngoại lệ |
| Explanation subsystem | Tạo cây suy luận, chỉ ra luật được áp dụng, căn cứ điều luật, giả định và dữ kiện còn thiếu |
| Case-specific database | Lưu facts, câu trả lời, bằng chứng và kết quả của từng vụ việc cụ thể |
| Knowledge base | Lưu ontology, frames, predicates và các luật pháp lý dùng chung đã được kiểm chứng |
| Knowledge engineer | Người phân tích văn bản pháp luật và chuyển nội dung thành biểu diễn tri thức hình thức |
| Developer's interface | Giao diện quản trị để xem, tạo, sửa, kiểm thử và phát hành phiên bản luật |
| Knowledge acquisition subsystem | Tiếp nhận luật mới, kiểm tra cấu trúc, phát hiện xung đột và đưa luật đã duyệt vào knowledge base |

### 2.1. Ranh giới dữ liệu bắt buộc

- **Knowledge base** chỉ chứa tri thức pháp lý dùng chung, chẳng hạn `R-C01`, điều kiện xác định hàng thừa kế thứ nhất và căn cứ Điều 651.
- **Case-specific database** chỉ chứa dữ kiện của vụ việc, chẳng hạn `vo_cua(ba_b, ong_a)` hoặc `chet_truoc(ong_c, ong_a)`.
- **Inference engine** không chứa nội dung luật được viết cứng trong mã nguồn. Engine chỉ đọc và thi hành luật từ knowledge base.
- **Explanation subsystem** sử dụng inference trace do engine sinh ra; không tự tạo thêm kết luận pháp lý.

### 2.2. Kiến trúc triển khai đã chọn cho MVP

MVP sử dụng một ứng dụng Next.js full-stack duy nhất:

```text
Next.js + TypeScript
├── App Router: giao diện người dùng
├── Route Handlers: HTTP API nội bộ
├── Application services: quản lý case và điều phối suy luận
├── CLIPS adapter: chạy CLIPS bằng Node.js child process
├── SQLite: case-specific database
└── knowledge-base/*.clp: tri thức pháp lý
```

- Các route gọi CLIPS phải sử dụng Node.js runtime, không sử dụng Edge runtime.
- Ứng dụng được self-host bằng một Node.js server hoặc Docker container có CLIPS executable và ổ đĩa bền vững cho SQLite.
- Không dùng mô hình serverless cho MVP vì CLIPS cần chạy native process và SQLite cần tệp dữ liệu bền vững.
- Không dùng Fastify trong MVP. Chỉ tách Fastify thành service riêng nếu inference trở thành workload độc lập, cần hàng đợi hoặc cần scale khác với giao diện.
- Không dùng custom Next.js server chỉ để gắn Fastify; Route Handlers đã đủ cho API nội bộ của đồ án.

### 2.3. Kiến trúc mô-đun kết quả và dependency graph

Các nhóm luật không phải những hệ chuyên gia tách biệt và cũng không hợp thành một pipeline cứng. Chúng là các mô-đun kết quả dùng chung working memory. Một mô-đun có thể tiêu thụ asserted facts của vụ việc và derived facts do mô-đun khác tạo ra.

```text
                         Shared working memory
                                  │
        ┌─────────────────────────┼────────────────────────┐
        ▼                         ▼                        ▼
 Tính hợp pháp              Loại thừa kế             Quyền hưởng
    di chúc                       │                        │
        └──────── derived facts ──┼────────────────────────┘
                                  ▼
                         Kết quả từng mô-đun
```

`src/domain/analysis-modules.ts` là registry kỹ thuật của mô-đun, định nghĩa:

- ID và result predicate chính;
- trạng thái `planned` hoặc `implemented`;
- loại interaction phù hợp như questionnaire, family tree, people table hoặc timeline;
- dependency bắt buộc hoặc có điều kiện;
- trạng thái dependency `draft` hoặc `implemented`;
- runtime adapter cho mô-đun đã triển khai.

Dependency chỉ là quan hệ điều phối và sử dụng tri thức, không phải kết luận pháp lý. Quan hệ ở trạng thái `draft` được dùng để review kiến trúc nhưng không được execution planner tự động chạy. Chỉ dependency `required + implemented` mới được đưa vào execution plan. Dependency có điều kiện phải được kích hoạt từ facts có cấu trúc sau khi rule và điều kiện kích hoạt đã được review.

UI sử dụng `ModuleWorkspace` làm shell chọn presenter theo Module ID. Không bắt buộc mọi mô-đun dùng cùng một form:

| Interaction | Mô-đun phù hợp |
|---|---|
| Questionnaire | Tính hợp pháp của di chúc, loại thừa kế |
| Family tree | Hàng thừa kế, thừa kế thế vị |
| People table | Quyền hưởng, suất bắt buộc, từ chối nhận |
| Timeline | Thời hiệu |

Các điều kiện ẩn/hiện câu hỏi là interaction rules của UI, không phải production rules pháp lý. Mọi kết luận pháp lý vẫn phải do CLIPS dẫn xuất.

## 3. Luồng xử lý chính

1. Người dùng tạo một vụ việc mới.
2. User interface thu thập facts bằng biểu mẫu có cấu trúc.
3. Dữ kiện được kiểm tra kiểu, tính đầy đủ và tính nhất quán trước khi lưu vào case-specific database.
4. Người dùng chọn mô-đun phân tích; module registry xác định presenter và các dependency đã được triển khai.
5. Hệ thống lập execution plan theo dependency graph, thêm analysis request tương ứng và kiểm tra dữ kiện đầu vào của từng mô-đun.
6. Forward chaining áp dụng các luật lên working memory dùng chung để tạo facts dẫn xuất cho đến khi agenda rỗng.
7. Mỗi lần kích hoạt luật được ghi vào inference trace, gồm facts đầu vào, Rule ID, kết luận và thời điểm.
8. Explanation subsystem biến inference trace thành cây giải thích cho người dùng.
9. Nếu thiếu dữ kiện hoặc có xung đột, hệ thống không ép kết quả `TRUE/FALSE` mà trả về `UNKNOWN` hoặc `CONFLICT` cùng nguyên nhân.

## 4. Biểu diễn tri thức

### 4.1. Các loại tri thức

- **Entity:** người, di chúc, tài sản, nghĩa vụ tài sản và vụ việc.
- **Relation:** vợ/chồng, cha/mẹ, con, con nuôi, người giám hộ, người được chỉ định trong di chúc.
- **Event:** chết, lập di chúc, từ chối nhận di sản, ly hôn, kết hôn và bản án có hiệu lực.
- **Fact:** dữ kiện nguyên thủy do người dùng cung cấp hoặc dữ kiện dẫn xuất từ luật.
- **Rule:** điều kiện, kết luận, ngoại lệ, độ ưu tiên và căn cứ pháp lý.
- **Analysis request:** fact xác định mô-đun kết quả cần chạy, chẳng hạn `phan_tich_hang_thua_ke` hoặc `phan_tich_the_vi`.

### 4.2. Giá trị logic

Không dùng Boolean hai giá trị cho toàn bộ hệ thống. Mỗi mệnh đề cần hỗ trợ ít nhất:

- `TRUE`: có đủ dữ kiện chứng minh;
- `FALSE`: có đủ dữ kiện bác bỏ;
- `UNKNOWN`: chưa có đủ dữ kiện;
- `CONFLICT`: tồn tại dữ kiện hoặc kết luận mâu thuẫn.

Việc không có fact `co_di_chuc = TRUE` không tự động đồng nghĩa với `co_di_chuc = FALSE`.

### 4.3. Cấu trúc tối thiểu của một luật

```yaml
id: R-E01
legal_source: "Điều 652 Bộ luật Dân sự 2015"
description: "Thừa kế thế vị của cháu"
conditions:
  all:
    - con_cua: [cha_me, nguoi_chet]
    - chet_truoc_hoac_cung_thoi_diem: [cha_me, nguoi_chet]
    - con_cua: [chau, cha_me]
    - con_song_tai_thoi_diem_mo_thua_ke: [chau]
conclusions:
  - thua_ke_the_vi: [chau, cha_me]
priority: 100
status: approved
```

Cấu trúc triển khai cuối cùng sử dụng CLIPS. Mỗi production rule vẫn phải giữ định danh, căn cứ, trạng thái kiểm duyệt và phiên bản.

## 5. Thiết kế các phân hệ

### 5.1. User interface

- Không nhận mô tả tự do làm nguồn facts chính.
- Tối ưu cho thành viên nhóm phát triển sử dụng và quan sát quá trình suy luận; chưa cần thiết kế onboarding cho công chúng.
- Dùng biểu mẫu theo từng bước: người để lại di sản, danh sách người liên quan, quan hệ, di chúc, tài sản, nghĩa vụ và sự kiện đặc biệt.
- Bộ câu hỏi được xác định theo mô-đun phân tích đã chọn và có thể rẽ nhánh bằng điều kiện giao diện đã khai báo trước.
- Cho phép người dùng chọn `Không biết/Chưa xác định` thay vì buộc trả lời Có hoặc Không.

### 5.2. Inference engine

- Nạp facts theo `case_id` và luật theo `knowledge_base_version`.
- Hỗ trợ unification hoặc đối sánh biến như `quan_he(X, nguoi_chet)`.
- Hỗ trợ forward chaining để suy ra toàn bộ hệ quả.
- Có agenda và cơ chế ưu tiên khi nhiều luật cùng được kích hoạt.
- Phát hiện vòng lặp, kết luận trùng lặp và mâu thuẫn.
- Xuất inference trace bất biến để phục vụ giải thích và kiểm thử.
- Dữ kiện đầu vào còn thiếu được phát hiện bằng schema và danh sách prerequisite của từng mô-đun, không dùng backward chaining.

### 5.3. Explanation subsystem

Mỗi kết luận phải trả lời được bốn câu hỏi:

1. Hệ thống kết luận điều gì?
2. Những facts nào được sử dụng?
3. Những luật và điều luật nào đã được áp dụng?
4. Còn thiếu dữ kiện nào hoặc tồn tại ngoại lệ nào có thể thay đổi kết luận?

Hệ thống cần hỗ trợ cả giải thích “vì sao có kết luận” và “vì sao chưa thể kết luận”.

### 5.4. Case-specific database

Nhóm dữ liệu tối thiểu:

- `cases`: thông tin vụ việc và phiên bản knowledge base đã dùng;
- `persons`: các chủ thể trong vụ việc;
- `relationships`: quan hệ giữa các chủ thể và thời gian hiệu lực;
- `events`: cái chết, lập di chúc, từ chối, kết án và các sự kiện liên quan;
- `assets` và `obligations`: di sản và nghĩa vụ;
- `asserted_facts`: facts do người dùng cung cấp;
- `derived_facts`: facts do engine suy ra;
- `inference_traces`: chuỗi áp dụng luật;
- `evidence`: nguồn hoặc ghi chú chứng minh một fact.

### 5.5. Knowledge base

- Chuẩn hóa nội dung từ [Loc_Rulebase.md](Loc_Rulebase.md).
- Tách từng luật thành điều kiện, kết luận, ngoại lệ và ưu tiên.
- Gắn mỗi luật với điều, khoản, văn bản và thời gian hiệu lực.
- Quản lý trạng thái `draft`, `reviewed`, `approved`, `deprecated`.
- Phiên bản hóa để một vụ việc cũ vẫn có thể tái hiện đúng kết quả đã sinh.
- Trong giai đoạn đồ án chưa có người kiểm chứng, tất cả luật mặc định mang trạng thái `draft` và giao diện phải hiển thị rõ trạng thái này.

### 5.6. Knowledge acquisition subsystem và Developer's interface

- Tạo hoặc sửa luật bằng biểu mẫu có cấu trúc, không sửa trực tiếp dữ liệu production.
- Kiểm tra biến chưa khai báo, kết luận không thể đạt tới và luật trùng lặp.
- Chạy regression tests trước khi phát hành một phiên bản knowledge base.
- Hiển thị khác biệt giữa hai phiên bản luật.
- Chỉ luật đã được người có thẩm quyền duyệt mới được phát hành.
- Lưu lịch sử người tạo, người duyệt, lý do thay đổi và ngày hiệu lực.

## 6. Phạm vi MVP đề xuất

MVP nên trả lời câu hỏi “Ai có khả năng được hưởng di sản và dựa trên căn cứ nào?”, bao gồm:

- xác định thừa kế theo di chúc hoặc theo pháp luật;
- đánh giá các điều kiện cơ bản về tính hợp pháp của di chúc;
- xác định ba hàng thừa kế;
- xác định trường hợp không được quyền hưởng;
- xử lý thừa kế thế vị;
- xác định người thừa kế không phụ thuộc nội dung di chúc;
- nhận diện từ chối nhận di sản và thời hiệu;
- sinh cây giải thích và danh sách facts còn thiếu.

Việc định giá tài sản, giải quyết tranh chấp chứng cứ và tự động đưa ra tư vấn pháp lý cuối cùng nằm ngoài MVP.

### 6.1. Kết quả theo mô-đun

Hệ thống không thực hiện một quy trình tính toán end-to-end từ dữ kiện ban đầu đến bảng chia toàn bộ di sản. Người dùng chọn một hoặc nhiều mô-đun phân tích và nhận kết quả riêng cho từng mô-đun:

| Mô-đun | Kết quả chính |
|---|---|
| Loại thừa kế | Theo di chúc, theo pháp luật hoặc chỉ một phần theo pháp luật |
| Tính hợp pháp của di chúc | Các điều kiện đạt, không đạt hoặc chưa đủ dữ kiện |
| Hàng thừa kế | Hàng của từng người và lý do được hoặc chưa được xét |
| Quyền hưởng di sản | Người có quyền, không có quyền hoặc chưa đủ dữ kiện để kết luận |
| Thừa kế thế vị | Người được thế vị và nhánh quan hệ làm phát sinh thế vị |
| Suất bắt buộc | Xác định người thuộc diện bảo vệ; chưa tính toàn bộ giá trị phân chia cuối cùng |
| Từ chối và tài sản không có người nhận | Hiệu lực từ chối hoặc trường hợp tài sản thuộc Nhà nước |
| Thời hiệu | Loại thời hiệu và mốc thời gian áp dụng |

Các mô-đun có thể dùng lại facts và kết luận trung gian, nhưng mỗi kết quả phải có inference trace độc lập và không phụ thuộc vào việc người dùng chạy toàn bộ các mô-đun còn lại.

### 6.2. Thứ tự ưu tiên mô-đun

Các mô-đun được triển khai theo thứ tự phụ thuộc và giá trị trình diễn. Chỉ bắt đầu mô-đun tiếp theo khi mô-đun hiện tại đã có rules, API, giao diện kết quả, inference trace và tests cơ bản.

| Thứ tự | Mô-đun | Mức ưu tiên | Lý do |
|---:|---|---|---|
| 1 | Tính hợp pháp của di chúc | Must | Là đầu vào để xác định có thể áp dụng thừa kế theo di chúc hay phải chuyển sang pháp luật |
| 2 | Loại thừa kế | Must | Tạo nhánh kết luận nền tảng: theo di chúc, theo pháp luật hoặc một phần theo pháp luật |
| 3 | Quyền hưởng di sản | Must | Loại trừ hoặc khôi phục quyền hưởng trước khi xác định tập người thừa kế cuối của từng mô-đun |
| 4 | Hàng thừa kế | Must | Là ví dụ production rules rõ ràng và tạo kết quả hữu ích khi thừa kế theo pháp luật |
| 5 | Thừa kế thế vị | Must | Thể hiện suy luận quan hệ nhiều bước và khả năng sinh facts mới của forward chaining |
| 6 | Suất bắt buộc | Should | Có giá trị pháp lý cao nhưng phụ thuộc vào kết quả về quan hệ, quyền hưởng và di chúc |
| 7 | Từ chối và tài sản không có người nhận | Should | Bổ sung ngoại lệ và ảnh hưởng đến khả năng chuyển hàng hoặc tài sản thuộc Nhà nước |
| 8 | Thời hiệu | Could | Tương đối độc lập, phù hợp bổ sung khi các luồng cốt lõi đã hoàn thành |

Thứ tự trên là thứ tự phát triển, không phải thứ tự luật được kích hoạt trong agenda. Agenda vẫn được CLIPS điều khiển dựa trên facts, điều kiện luật, phase và salience.

### 6.3. Phạm vi phiên bản trình bày

Phiên bản trình bày cuối cùng áp dụng phạm vi lũy tiến:

- **Mức tối thiểu có thể trình bày:** mô-đun 1–4, cùng một tình huống hoàn chỉnh có facts, rule firing và cây giải thích.
- **Mức mục tiêu:** mô-đun 1–5, bổ sung tình huống thừa kế thế vị để thể hiện suy luận quan hệ nhiều bước.
- **Mức mở rộng:** lần lượt thêm mô-đun 6–8 nếu còn thời gian.

Không đánh đổi chất lượng của inference trace và kiểm thử các mô-đun `Must` để tăng số lượng mô-đun. Mỗi mô-đun hoàn thành phải chạy độc lập và có ít nhất:

- một trường hợp kích hoạt luật;
- một trường hợp không kích hoạt;
- một trường hợp thiếu dữ kiện trả về `UNKNOWN`;
- một kết quả truy ngược được tới facts và Rule ID.

Do MVP chỉ được nhóm phát triển sử dụng nội bộ, chưa ưu tiên các hạng mục đăng ký công khai, phân quyền nhiều tổ chức, chịu tải lớn, thanh toán, SEO hoặc triển khai đa vùng. Cần ưu tiên khả năng quan sát facts, luật và inference trace để phục vụ trình bày đồ án.

## 7. Kế hoạch triển khai

### Trạng thái triển khai hiện tại

- Đã tạo `doc/Loc_Rulebase_v2.md` để chuẩn hóa toàn bộ rule catalog và làm tài liệu team review.
- Đã tạo fact contracts dùng chung trong `knowledge-base/templates.clp`.
- Đã triển khai vertical slice mô-đun tính hợp pháp của di chúc với R-B01–R-B09.
- Đã tách asserted facts, derived knowledge, legal metadata, completeness/conflict, explanation và result projection.
- Domain rules không còn phụ thuộc vào `analysis-request`; yêu cầu từ UI chỉ chọn kết quả trình bày.
- Đã loại bỏ trace counter khỏi luật pháp lý và thay bằng provenance/dependency trace.
- Đã chạy đạt mười một test, gồm các luồng cơ bản, người từ đủ 15 đến dưới 18 tuổi, người bị hạn chế thể chất, di chúc miệng, mốc 5 ngày, mặc nhiên hủy bỏ, đường luật chưa được mô hình hóa, `UNKNOWN`, `CONFLICT` và domain inference độc lập với UI.
- Đã chuẩn hóa line protocol CLIPS, xây CLIPS adapter TypeScript, khởi tạo Next.js và cung cấp `POST /api/inference/will-validity`.
- Đã tích hợp SQLite, migration khởi tạo, repository và API cho case, asserted facts và inference runs.
- Mỗi inference run lưu snapshot input, phiên bản knowledge base, module results, missing requirements và inference traces; sửa facts hiện tại không thay đổi lịch sử.
- Đã triển khai reasoning workspace responsive bằng Tailwind CSS và shadcn/ui: question cards thích ứng, working memory, bốn trạng thái kết quả, missing facts và inference trace.
- Explanation UI trình bày luồng dữ kiện → rule → kết luận bằng tiếng Việt; mỗi rule liên kết đúng điều, khoản, điểm và dialog toàn văn lấy từ legal catalog đã trích xuất từ `doc/Luat_ThuaKe.doc`.
- Đã bổ sung legal catalog JSON cùng ID ổn định ở cấp điều/khoản/điểm; script `law:extract` tái tạo catalog từ file `.doc` và lưu fingerprint SHA-256 của nguồn.
- Đã hợp nhất metadata CLIPS và giải thích UI vào `rule-registry.json`; `rule-metadata.clp` được sinh tự động bằng `kb:generate`.
- Test bảo đảm mọi R-B01–R-B09 có mô tả, mọi domain `defrule` thuộc đúng một Rule ID, các ID phát ra không thiếu/mồ côi và không có tham chiếu tới section không tồn tại.
- Đã tạo module registry và dependency graph có kiểm soát trạng thái; `will-validity` là mô-đun thực thi đầu tiên, các dependency dự kiến không tham gia runtime khi chưa review.
- Đã thêm `ModuleWorkspace` để chọn presenter theo mô-đun, cho phép family tree, people table hoặc timeline thay vì ép mọi bài toán vào form hiện tại.
- Đã tách question flow, fact mapper và presentation labels của `will-validity` khỏi workspace; interaction rules được kiểm thử riêng và không nằm trong CLIPS rule base.
- Đã tách dialog căn cứ pháp lý thành component explanation dùng chung và thêm trang `/modules` để lựa chọn mục tiêu phân tích.
- Đã bổ sung `/cases`, trang chi tiết hồ sơ và trang inference snapshot; người dùng có thể mở lại facts hiện tại, chạy mô-đun và tra cứu lịch sử bất biến.
- Repository và API hỗ trợ danh sách case/run theo contract tổng quát `module + predicate + value`, không khóa trang lịch sử vào một kết luận `valid-will` duy nhất.
- Đã kiểm thử integration qua native CLIPS process, smoke-test toàn bộ route HTTP và kiểm tra trực quan giao diện desktop/mobile.

### Giai đoạn 1 — Phân tích và kiểm chứng tri thức

- Chốt phạm vi câu hỏi mà MVP phải trả lời.
- Ghi nhận rule-base hiện tại là bản nháp chưa được kiểm chứng.
- Đối chiếu sơ bộ với văn bản pháp luật chính thức trong khả năng của nhóm; việc phê duyệt chuyên môn được để lại cho giai đoạn sau.
- Lập glossary và danh mục predicates.
- Xác định ngoại lệ, quan hệ ưu tiên và phụ thuộc giữa các luật.

**Đầu ra:** rule catalog bản nháp có nguồn tham chiếu, glossary và bộ tình huống thử nghiệm của nhóm.

### Giai đoạn 2 — Mô hình miền và định dạng knowledge base

- Thiết kế ontology hoặc frames cho người, quan hệ, sự kiện, di chúc và tài sản.
- Định nghĩa schema của fact, rule, analysis request và kết quả mô-đun.
- Chuyển nhóm luật A–J sang định dạng máy thực thi.
- Xây bộ kiểm tra cú pháp và tham chiếu Rule ID.

**Đầu ra:** knowledge base phiên bản đầu tiên và schema hợp lệ.

### Giai đoạn 3 — Inference engine

- Dùng CLIPS làm inference engine với working memory, pattern matching và agenda có sẵn.
- Xây CLIPS adapter bằng TypeScript để nạp rules, assert facts, chạy agenda và đọc kết quả.
- Chỉ dùng forward chaining của CLIPS; không mô phỏng backward chaining.
- Cài logic bốn giá trị, ưu tiên và phát hiện xung đột.
- Sinh inference trace cho mọi fact dẫn xuất.

**Đầu ra:** engine chạy được bằng command line và có unit tests.

### Giai đoạn 4 — Case-specific database

- Thiết kế database cho vụ việc, facts và trace.
- Bảo đảm cách ly dữ liệu giữa các vụ việc.
- Gắn kết quả với đúng phiên bản knowledge base.

**Đầu ra:** persistence layer và API quản lý vụ việc.

### Giai đoạn 5 — User interface và explanation subsystem

- Xây wizard thu thập dữ kiện.
- Cho phép chọn mô-đun phân tích và nạp bộ câu hỏi tương ứng.
- Trình bày kết luận, cây suy luận và dữ kiện còn thiếu.
- Cho phép sửa một fact và chạy lại suy luận.

**Đầu ra:** MVP sử dụng được từ đầu đến cuối.

### Giai đoạn 6 — Developer's interface và thu nhận tri thức

- Xây màn hình quản lý predicates, luật và phiên bản.
- Thêm workflow tạo, duyệt và phát hành luật.
- Chạy tự động bộ regression tests khi knowledge base thay đổi.

**Đầu ra:** công cụ để kỹ sư tri thức duy trì hệ thống mà không sửa inference engine.

### Giai đoạn 7 — Thẩm định

- Kiểm thử từng luật độc lập.
- Kiểm thử chuỗi luật và các ngoại lệ.
- Trước mắt, so sánh kết quả với các tình huống và kết quả kỳ vọng do nhóm thống nhất.
- Để dành việc thẩm định bởi chuyên gia pháp lý cho giai đoạn sau đồ án.
- Đánh giá độ đầy đủ của giải thích và khả năng tái lập kết quả.

**Đầu ra:** báo cáo kiểm thử nội bộ, danh sách giới hạn và phiên bản MVP phục vụ trình bày đồ án.

## 8. Chiến lược kiểm thử

- **Rule test:** mỗi luật có ít nhất một trường hợp kích hoạt và một trường hợp không kích hoạt.
- **Boundary test:** tuổi 15, 18; mốc 3 tháng, 5 ngày; thời hiệu 3, 10 và 30 năm.
- **Exception test:** người không có quyền hưởng nhưng vẫn được người lập di chúc biết và cho hưởng.
- **Conflict test:** hai nguồn dữ kiện khai báo quan hệ hoặc thời điểm trái nhau.
- **Unknown test:** thiếu dữ kiện quan trọng phải trả về `UNKNOWN`, không được tự suy đoán.
- **Regression test:** thay đổi một luật không được làm sai các tình huống đã được duyệt.
- **Explanation test:** mọi kết luận dẫn xuất phải truy ngược được tới facts ban đầu và căn cứ luật.

## 9. Tiêu chí hoàn thành MVP

- Knowledge base độc lập với mã nguồn inference engine.
- Không có LLM trong quá trình nhập liệu, suy luận hoặc giải thích.
- Hệ thống xử lý được toàn bộ bộ tình huống chuẩn đã thống nhất.
- Mọi kết luận đều có Rule ID, căn cứ pháp lý và inference trace.
- Hệ thống phân biệt được `FALSE`, `UNKNOWN` và `CONFLICT`.
- Có thể chạy lại một vụ việc với đúng phiên bản knowledge base ban đầu.
- Thêm hoặc sửa luật không yêu cầu thay đổi mã nguồn của inference engine.
- Mọi màn hình kết quả đều cho biết knowledge base chưa được chuyên gia pháp lý kiểm chứng.

## 10. Các quyết định của dự án

### 10.1. Đã chốt

- Hệ thống không sử dụng LLM.
- Người dùng đầu tiên là các thành viên của chính nhóm phát triển.
- Sản phẩm là đồ án và chỉ được sử dụng nội bộ trong giai đoạn đầu, không phát hành rộng rãi.
- Hiện chưa có người chịu trách nhiệm kiểm chứng và phê duyệt nội dung pháp lý.
- Việc thẩm định pháp lý chính thức sẽ được thảo luận ở giai đoạn sau.
- Công nghệ biểu diễn và suy luận chính là CLIPS.
- Ngôn ngữ ứng dụng là TypeScript.
- Frontend và backend của MVP dùng chung một ứng dụng Next.js; backend sử dụng Route Handlers trên Node.js runtime.
- Case-specific database sử dụng SQLite.
- CLIPS được tích hợp qua một adapter gọi native process.
- Fastify không được sử dụng trong MVP và chỉ được xem xét khi cần tách inference service.
- Ứng dụng được self-host thay vì triển khai theo mô hình serverless.
- Inference engine chỉ sử dụng forward chaining.
- Kết quả được chia theo các mô-đun phân tích độc lập; MVP không tính toán phân chia di sản end-to-end.
- Mô-đun được triển khai theo thứ tự ưu tiên tại mục 6.2; hoàn thành mô-đun hiện tại trước khi mở rộng mô-đun tiếp theo.
- Phiên bản trình bày tối thiểu gồm mô-đun 1–4, mục tiêu gồm mô-đun 1–5 và chỉ thêm mô-đun 6–8 khi còn thời gian.
