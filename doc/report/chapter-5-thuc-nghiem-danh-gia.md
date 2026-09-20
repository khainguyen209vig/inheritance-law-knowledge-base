# Chương 5. Thực nghiệm và đánh giá

## 5.1. Mục tiêu đánh giá

Đánh giá tập trung vào bốn câu hỏi nghiên cứu:

- **RQ1:** Các rules có tạo đúng kết quả mong đợi trên bộ tình huống hồi quy của nhóm không?
- **RQ2:** Hệ thống có phản ánh trường hợp thiếu dữ kiện và mâu thuẫn thay vì suy diễn quá mức không?
- **RQ3:** Kết quả có truy vết được về Rule ID và facts hỗ trợ không?
- **RQ4:** Các thành phần tích hợp có bảo toàn fact contract, snapshot và giới hạn an toàn đầu vào không?

Đánh giá hiện tại là verification nội bộ dựa trên fixture do nhóm xây dựng. Nó chưa trả lời đầy đủ câu hỏi về tính đúng đắn pháp lý ngoài tập kiểm thử hoặc khả năng sử dụng với người dùng độc lập.

## 5.2. Thiết lập thực nghiệm

Lần chạy được thực hiện ngày 20/09/2026 trong workspace của dự án bằng hai lệnh:

```bash
npm run test:kb
npm run test:app
```

`test:kb` lần lượt chạy 13 tệp kiểm thử CLIPS cho tính hợp pháp di chúc, loại thừa kế, quyền hưởng, hàng thừa kế, thế vị, suất bắt buộc, quan hệ vợ chồng, từ chối, thanh toán, tính toán giá trị di sản, thời hiệu và Quick Logic Test. `test:app` dùng Node test runner để chạy 18 tệp kiểm thử TypeScript.

Phiên bản cơ sở tri thức được registry khai báo là `inheritance-kb-v21`. Catalog tại thời điểm kiểm tra có 87 mục, 155 implementation mappings và 19 điều luật đã chuẩn hóa. Repository chứa 39 fixture CLP. Các con số này được sinh từ hiện vật dự án, không đếm thủ công trong báo cáo.

Thông tin cần bổ sung ở lần chốt bản nộp:

- mã commit hoặc tag chính thức;
- phiên bản thực tế của Node.js và CLIPS trên máy chạy;
- hệ điều hành và kiến trúc CPU;
- file log đầy đủ hoặc artifact CI;
- người xác nhận expected result của từng fixture.

## 5.3. Thiết kế bộ kiểm thử

Bộ kiểm thử cơ sở tri thức gồm nhiều dạng tình huống.

**Trường hợp dương** cung cấp đủ facts để kích hoạt đường suy luận mong đợi, chẳng hạn di chúc hợp pháp, người thuộc hàng thứ nhất hoặc cháu hưởng thế vị.

**Trường hợp loại trừ** cung cấp facts làm kết luận không áp dụng, như hành vi làm mất quyền hưởng, từ chối nhằm trốn tránh nghĩa vụ hoặc người thành niên có khả năng lao động không thuộc nhóm suất bắt buộc.

**Trường hợp thiếu dữ kiện** chủ động bỏ một hoặc nhiều observations. Kết quả mong đợi là `unknown` hoặc danh sách missing requirements, không phải kết luận phủ định.

**Trường hợp mâu thuẫn** cung cấp hai nhánh dữ kiện không tương thích để kiểm tra conflict projection.

**Trường hợp biên** kiểm tra tuổi người lập di chúc, thời hạn đối với di chúc miệng, quan hệ nuôi dưỡng, quan hệ cha/mẹ kế, tài sản và nghĩa vụ bằng VND, mốc thời hiệu và các nhánh sau khi hết thời hiệu.

Tầng ứng dụng kiểm tra module registry, repository, CLIPS adapter, family graph, guided conversation, guided session, legal knowledge, parser, exporter, runner, rule registry, source catalog, stored inference và phép tính thời gian.

## 5.4. Kết quả kiểm thử

Kết quả tổng hợp của lần chạy:

| Tầng kiểm thử | Đơn vị đo | Đạt | Không đạt |
|---|---:|---:|---:|
| Cơ sở tri thức CLIPS | Kiểm tra `PASS` | 88 | 0 |
| Ứng dụng TypeScript | Tệp test | 18 | 0 |

Node test runner báo 18 tests đạt, không có test fail, cancelled, skipped hoặc todo. Thời lượng được runner báo cho nhóm ứng dụng là khoảng 1,8 giây trong lần chạy này. Không sử dụng số đó để kết luận hiệu năng suy luận, vì nó phụ thuộc máy chạy, mức song song của test runner và chưa phải benchmark được kiểm soát.

Kết quả CLIPS theo nhóm được tóm tắt như sau:

| Nhóm | Nội dung được bao phủ tiêu biểu |
|---|---|
| Di chúc | hợp lệ, không hợp lệ, thiếu, conflict, tuổi, hạn chế thể chất, di chúc miệng |
| Loại thừa kế | không có di chúc, di chúc vô hiệu, người thụ hưởng chết/bị loại/từ chối, phần chưa định đoạt |
| Quyền hưởng | các nhánh Điều 621, ngoại lệ và open-world |
| Hàng thừa kế | ba hàng, hàng hoạt động, gọi hưởng, nguyên tắc phần bằng nhau |
| Thế vị | cháu, chắt, trạng thái người đại diện, quan hệ nuôi và quan hệ kế |
| Suất bắt buộc | nhóm được bảo vệ, loại trừ, phần thiếu và tính toán VND |
| Vợ chồng | ba nhánh Điều 655 và tình huống thiếu quyết định |
| Từ chối/không người nhận | điều kiện hợp lệ, trốn tránh nghĩa vụ, open-world và Nhà nước nhận |
| Thanh toán/phân chia | ưu tiên, phần bằng nhau, thai nhi, hạn chế chia, yêu cầu của vợ/chồng |
| Thời hiệu | các loại yêu cầu, người quản lý, người chiếm hữu và Nhà nước |
| Logic Test | complete, unknown/missing và conflict |

## 5.5. Đánh giá RQ1: kết quả trên bộ tình huống

Toàn bộ 88 kiểm tra CLIPS đạt expected result của nhóm. Kết quả cho thấy các rule hiện thực tạo đúng kết luận đã đặc tả đối với tập fixture được xây dựng. Độ bao phủ không chỉ gồm đường thành công mà còn có nhánh phủ định, ngoại lệ và tình huống biên.

Tuy nhiên, “88/88 đạt” không được diễn giải thành độ chính xác 100% trên các vụ việc thực tế. Expected result và rules phần lớn do cùng nhóm xây dựng, do đó tồn tại nguy cơ cùng một giả định sai được lặp lại ở cả implementation và test. Kết quả này chứng minh tính nhất quán nội bộ, chưa chứng minh tính đầy đủ hay diễn giải pháp lý duy nhất.

## 5.6. Đánh giá RQ2: thiếu dữ kiện và mâu thuẫn

Bộ test chứa các fixture riêng cho `unknown`, `missing-facts`, `unresolved-rule-path` và `conflict`. Các trường hợp `will-unknown`, `inheritance-unknown`, `eligibility-unknown`, `heir-rank-unknown`, `representation-unknown`, `compulsory-open-world`, `refusal-open-world`, `estate-settlement-open-world`, `limitation-open-world` và `logic-test-unknown-missing` đều đạt.

Fixture `will-conflict` và `logic-test-conflict` xác nhận projection không che giấu hai kết luận không tương thích. Kết quả hỗ trợ nhận định rằng kiến trúc completeness/conflict tách biệt có hiệu quả trong phạm vi các predicate đã mô hình hóa.

## 5.7. Đánh giá RQ3: khả năng truy vết

Các test `heir-rank-trace`, `representation-traces`, `adoption-traces`, `step-traces` và `compulsory-traces` kiểm tra sự tồn tại của dấu vết phù hợp. Tầng ứng dụng còn kiểm tra rule registry và rule source catalog để bảo đảm Rule ID ánh xạ tới metadata, legal source và implementation.

Về cấu trúc, 86 trong 87 registry entries được khai báo có CLIPS metadata; mục còn lại là entry định tuyến hình thức Điều 627, không có implementation riêng. Điều này cho thấy phần lớn kết luận thực thi có đường nối từ Rule ID tới mô tả và source. Đánh giá chất lượng ngôn ngữ của lời giải thích vẫn cần người dùng thực tế, chưa thể suy ra chỉ từ test cấu trúc.

## 5.8. Đánh giá RQ4: tích hợp và an toàn đầu vào

Mười tám test ứng dụng xác nhận các ranh giới chính:

- module registry và dependency plan hoạt động nhất quán;
- facts được lưu, thay thế và snapshot đúng revision;
- adapter parse được machine output từ CLIPS;
- graph gia đình chuyển thành facts đúng contract;
- guided session chọn và lưu bước phù hợp;
- legal catalog và rule source catalog có tham chiếu hợp lệ;
- parser từ chối cấu trúc không hỗ trợ và chuẩn hóa dữ liệu hợp lệ;
- exporter tạo artifact có thể so sánh với golden file;
- phép cộng năm lịch phục vụ thời hiệu xử lý các trường hợp được kiểm thử.

Kết quả không phải một kiểm toán bảo mật đầy đủ. Parser allowlist giảm bề mặt tấn công từ upload nhưng hệ thống vẫn cần threat modeling, dependency scanning và kiểm thử triển khai nếu được đưa ra môi trường công khai.

## 5.9. Hạn chế và đe dọa tính hợp lệ

Thứ nhất, bộ kiểm thử được xây dựng cùng quá trình phát triển rule base. Thiếu một tập tình huống độc lập do chuyên gia bên ngoài gán nhãn.

Thứ hai, toàn bộ rules được coi là đã review nội bộ nhưng chưa có chuyên gia pháp lý thẩm định độc lập. Do đó kết quả không đủ cơ sở để sử dụng cho quyết định pháp lý thực tế.

Thứ ba, số lượng fixture không phản ánh trực tiếp độ bao phủ của mọi tổ hợp facts. Không gian kết hợp của người, quan hệ, thời điểm và ngoại lệ lớn hơn nhiều so với tập hiện có.

Thứ tư, một số observations còn ở mức tổng hợp, ví dụ “không phát hiện nội dung bị cấm”. Giá trị này giả định đã có một bước đánh giá bên ngoài mà hệ thống chưa phân rã hoàn toàn.

Thứ năm, chưa có kết quả usability test độc lập trong chương này. Tài liệu kịch bản đã tồn tại nhưng không được trình bày như bằng chứng thực nghiệm khi chưa có người tham gia và dữ liệu quan sát.

Thứ sáu, chưa có benchmark hiệu năng chính thức. Các giới hạn 10 giây và 2 MiB là hàng rào vận hành của adapter, không phải cam kết về thời gian phản hồi.

Từ các giới hạn trên, kết luận phù hợp của Chương 5 là: phiên bản hiện tại đạt kiểm thử hồi quy nội bộ và thể hiện đúng cơ chế thiếu/mâu thuẫn/truy vết trên tập tình huống đã thiết kế; chưa thể khái quát thành độ chính xác pháp lý ngoài tập kiểm thử.

