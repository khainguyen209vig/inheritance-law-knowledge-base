# Phụ lục E. Schema CSDL, API contract và line protocol

## E.1. Schema SQLite

DDL gốc nằm tại [`src/server/db/schema.ts`](../../src/server/db/schema.ts). CSDL sử dụng chế độ `STRICT`, bật khóa ngoại, WAL và `busy_timeout=5000`.

| Bảng | Khóa chính | Liên kết | Dữ liệu chính |
|---|---|---|---|
| `schema_migrations` | `version` | — | Phiên bản migration và thời điểm áp dụng |
| `cases` | `id` | — | Tiêu đề, thời gian tạo/cập nhật, `facts_revision` |
| `asserted_facts` | `(case_id, fact_id)` | `cases ON DELETE CASCADE` | Subject, predicate, JSON value, source |
| `inference_runs` | `id` | `cases ON DELETE RESTRICT` | Mô-đun, subject, phiên bản KB, snapshot input, revision |
| `module_results` | `id` | `inference_runs ON DELETE CASCADE` | Subject, predicate, value và derivations JSON |
| `missing_requirements` | `id` | `inference_runs ON DELETE CASCADE` | Subject và predicate còn thiếu |
| `inference_traces` | `id` | `inference_runs ON DELETE CASCADE` | Rule ID, kết luận và supports JSON |
| `guided_sessions` | `case_id` | `cases ON DELETE CASCADE` | Chủ đề, danh sách bước hoàn tất và timestamp |

Hai index hỗ trợ truy vấn chính:

- `asserted_facts_case_subject_idx(case_id, subject)`;
- `inference_runs_case_idx(case_id, created_at DESC)`.

`input_snapshot_json` và `knowledge_base_version` giữ bằng chứng đầu vào của từng lần suy luận. `facts_revision` giúp giao diện nhận biết kết quả đã cũ sau khi facts thay đổi.

## E.2. API quản lý hồ sơ

| Method | Endpoint | Chức năng |
|---|---|---|
| `GET` | `/api/cases` | Liệt kê hồ sơ |
| `POST` | `/api/cases` | Tạo hồ sơ |
| `GET` | `/api/cases/:caseId` | Đọc hồ sơ và facts hiện hành |
| `PATCH` | `/api/cases/:caseId` | Đổi tiêu đề |
| `DELETE` | `/api/cases/:caseId` | Xóa hồ sơ sau kiểm tra |
| `PUT` | `/api/cases/:caseId/facts` | Thay tập facts và tăng revision |
| `GET` | `/api/cases/:caseId/inference-runs` | Liệt kê lịch sử suy luận |
| `GET` | `/api/cases/:caseId/inference-runs/:runId` | Đọc snapshot một lần chạy |

## E.3. API suy luận và Guided Conversation

Mỗi mô-đun có route `POST /api/cases/:caseId/inference/:moduleId`, trong đó `moduleId` là một trong mười giá trị:

```text
will-validity, inheritance-type, eligibility, heir-rank, representation,
compulsory-share, spouse-status, refusal-and-unclaimed,
estate-settlement, limitation
```

Guided Conversation sử dụng các route:

| Method | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/api/guided-sessions` | Tạo hồ sơ và phiên guided trong cùng transaction |
| `GET` | `/api/cases/:caseId/guided` | Đọc trạng thái hội thoại |
| `POST`/`PATCH` | `/api/cases/:caseId/guided/answers` | Thêm hoặc sửa câu trả lời đã chuẩn hóa |
| `POST` | `/api/cases/:caseId/guided/inference` | Chạy kế hoạch mô-đun cho chủ đề hiện tại |

Input HTTP được kiểm tra bằng Zod. ID sử dụng regex `^[a-z][a-z0-9-]{0,63}$`; tiêu đề case dài từ 1 đến 200 ký tự; một lần thay facts nhận tối đa 500 facts và từ chối Fact ID trùng.

## E.4. API Quick Logic Test

| Method | Endpoint | Input chính | Output |
|---|---|---|---|
| `POST` | `/api/logic-tests/parse` | Multipart có file `.clp` | Case study chuẩn hóa, diagnostics và thống kê |
| `POST` | `/api/logic-tests/run` | `topicId`, scope tùy chọn và case study | Báo cáo kết luận, trace, missing facts và trạng thái module |
| `POST` | `/api/logic-tests/export` | Run request và `format=md|clp` | Tệp tải về |
| `GET` | `/api/logic-tests/rules/:implementation` | Tên implementation đã kiểm tra | Mã CLIPS read-only và metadata liên quan |

Upload bị giới hạn 1 MiB và 500 facts. Parser chỉ cho phép `analysis-request` và `asserted-fact`; các form thực thi như `defrule`, `load`, `batch`, `system` hoặc `assert` bị từ chối.

## E.5. Contract kết quả suy luận

```ts
interface InferenceRun {
  id: string;
  caseId: string;
  knowledgeBaseVersion: string;
  createdAt: string;
  results: Array<{
    subject: string;
    predicate: string;
    value: ModuleResultValue;
    derivations: string[];
  }>;
  missing: Array<{ subject: string; predicate: string }>;
  traces: Array<{
    subject: string;
    ruleId: string;
    conclusionPredicate: string;
    conclusionValue: string;
    supports: string[];
  }>;
}
```

`ModuleResultValue` chấp nhận bốn trạng thái `true`, `false`, `unknown`, `conflict`, các symbol nghiệp vụ được allow-list, số dạng chuỗi và ngày ISO.

## E.6. Line protocol CLIPS–TypeScript

```text
@@INFERENCE-BEGIN@@
@@RESULT@@ <case> <subject> <module> <predicate> <value> [rule-id...]
@@MISSING@@ <case> <subject> <module> <predicate>
@@TRACE@@ <case> <subject> <rule-id> <predicate> <value> [support...]
@@INFERENCE-END@@
```

Parser yêu cầu đủ marker đầu/cuối, kiểm tra số trường bắt buộc và từ chối marker không hỗ trợ. Dữ liệu upload không được nối vào lệnh shell; adapter dùng `execFile` để chạy `clips`, tạo thư mục tạm riêng cho mỗi lần chạy, giới hạn 10 giây và buffer 2 MiB, sau đó xóa thư mục trong `finally`.
