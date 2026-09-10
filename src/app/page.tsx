export default function HomePage() {
  return (
    <main>
      <p className="eyebrow">Đồ án hệ dựa trên tri thức</p>
      <h1>Hỗ trợ suy luận luật thừa kế Việt Nam</h1>
      <p className="summary">
        Phiên bản hiện tại cung cấp API đánh giá tính hợp pháp của di chúc bằng
        production rules và forward chaining trong CLIPS.
      </p>

      <section aria-labelledby="current-status">
        <h2 id="current-status">Trạng thái</h2>
        <dl>
          <div>
            <dt>Inference engine</dt>
            <dd>CLIPS 6.x</dd>
          </div>
          <div>
            <dt>Rule scope</dt>
            <dd>R-B01–R-B09</dd>
          </div>
          <div>
            <dt>API</dt>
            <dd>POST /api/inference/will-validity</dd>
          </div>
        </dl>
      </section>

      <aside>
        Knowledge base đang ở trạng thái bản nháp, chưa được kiểm chứng pháp lý.
        Kết quả không phải tư vấn pháp lý.
      </aside>
    </main>
  );
}
