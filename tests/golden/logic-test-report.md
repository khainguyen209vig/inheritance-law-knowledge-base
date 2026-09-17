# Báo cáo suy luận luật thừa kế

## Thông tin

- Case ID: `demo-case`
- File nguồn: `demo.clp`
- Knowledge base: `inheritance-kb-test`
- Câu hỏi: Di chúc có hợp pháp không?
- Phạm vi: `will-main`
- Trạng thái: **complete**

## Kết luận

- Di chúc của Ông A hợp pháp. _(rules: `R-B03`)_

## Quá trình suy luận

### Điều 630. Di chúc hợp pháp

Căn cứ: **Điều 630 khoản 1 điểm a**

1. **R-B01** — Người lập di chúc minh mẫn, sáng suốt.
   - Kết luận: Điều kiện về ý chí được đáp ứng.
   - Supports: `testator-mental-state=lucid`
   - Source: `rules/01-will-validity.clp#R-B01-valid-intention`

## Facts đầu vào

| Fact ID | Subject | Predicate | Value |
|---|---|---|---|
| label | will-main | person-label | Ông A |
| mental | will-main | testator-mental-state | lucid |

## Dữ kiện thiếu hoặc mâu thuẫn

Không ghi nhận dữ kiện bắt buộc còn thiếu hoặc xung đột.

> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.
