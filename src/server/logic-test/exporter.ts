import type { LogicTestReport } from "@/domain/logic-test";
import { getLogicTestTopicPlan } from "@/domain/logic-test";

const quotedValuePredicates = new Set([
  "estate-portion-label",
  "person-label",
  "heir-person-label",
  "obligation-label",
  "distribution-group-label",
  "distribution-beneficiary-label",
  "specified-division-date",
  "limitation-request-label",
  "inheritance-opening-date",
  "estate-asset-label",
]);

export interface LogicTestExport {
  fileName: string;
  mediaType: string;
  content: string;
}

export function exportLogicTestMarkdown(report: LogicTestReport): LogicTestExport {
  const lines = [
    "# Báo cáo suy luận luật thừa kế",
    "",
    "## Thông tin",
    "",
    `- Case ID: \`${report.input.caseId}\``,
    `- File nguồn: \`${escapeInline(report.input.fileName)}\``,
    `- Knowledge base: \`${report.knowledgeBaseVersion}\``,
    `- Câu hỏi: ${report.query.question}`,
    `- Phạm vi: ${report.query.scopeSubject ? `\`${report.query.scopeSubject}\`` : "Tất cả chủ thể phù hợp"}`,
    `- Trạng thái: **${report.status}**`,
    "",
    "## Kết luận",
    "",
    ...(report.conclusions.length
      ? report.conclusions.map((conclusion) => `- ${conclusion.statement} _(rules: ${conclusion.ruleIds.map((id) => `\`${id}\``).join(", ") || "không có"})_`)
      : ["Chưa có kết luận cuối."]),
    "",
    "## Quá trình suy luận",
    "",
  ];

  if (!report.reasoningGroups.length) lines.push("Chưa có bước suy luận để trình bày.", "");
  for (const group of report.reasoningGroups) {
    lines.push(`### ${group.title}`, "", `Căn cứ: **${group.citation}**`, "");
    for (const [index, step] of group.steps.entries()) {
      lines.push(
        `${index + 1}. **${step.ruleId}** — ${step.plainExplanation}`,
        `   - Kết luận: ${step.conclusion}`,
        `   - Supports: ${step.supports.length ? step.supports.map((support) => `\`${escapeInline(support.machineExpression)}\``).join(", ") : "không có trace chi tiết"}`,
        `   - Source: ${step.codeReferences.length ? step.codeReferences.map((reference) => `\`${reference.file}#${reference.implementation}\``).join(", ") : "không có source CLIPS riêng"}`,
      );
    }
    lines.push("");
  }

  lines.push("## Facts đầu vào", "", "| Fact ID | Subject | Predicate | Value |", "|---|---|---|---|");
  for (const fact of report.input.facts) {
    lines.push(`| ${escapeTable(fact.id)} | ${escapeTable(fact.subject)} | ${escapeTable(fact.predicate)} | ${escapeTable(String(fact.value))} |`);
  }

  lines.push("", "## Dữ kiện thiếu hoặc mâu thuẫn", "");
  if (report.missing.length) {
    for (const item of report.missing) lines.push(`- \`${item.module}\` · \`${item.subject}\` · \`${item.predicate}\`: ${item.explanation}`);
  } else if (report.status === "conflict") {
    lines.push("- Có kết luận xung đột; xem phần kết luận và quá trình suy luận ở trên.");
  } else {
    lines.push("Không ghi nhận dữ kiện bắt buộc còn thiếu hoặc xung đột.");
  }

  lines.push("", "> Báo cáo do hệ thống dựa trên tri thức tạo ra cho mục đích học tập; không phải tư vấn pháp lý.", "");
  return { fileName: exportFileName(report, "md"), mediaType: "text/markdown; charset=utf-8", content: lines.join("\n") };
}

export function exportLogicTestClp(report: LogicTestReport): LogicTestExport {
  const moduleId = getLogicTestTopicPlan(report.query.topicId).goalModules[0];
  const subject = report.query.scopeSubject ?? report.input.declaredRequest?.subject ?? report.input.caseId;
  const forms = [
    "; Quick Logic Test replay file",
    `; knowledge-base: ${singleLine(report.knowledgeBaseVersion)}`,
    `; topic: ${report.query.topicId}`,
    `; question: ${singleLine(report.query.question)}`,
    "",
    [
      "(analysis-request",
      `  (case-id ${report.input.caseId})`,
      `  (subject ${subject})`,
      `  (module ${moduleId}))`,
    ].join("\n"),
    ...report.input.facts.map((fact) => [
      "(asserted-fact",
      `  (fact-id ${fact.id})`,
      `  (case-id ${report.input.caseId})`,
      `  (subject ${fact.subject})`,
      `  (predicate ${fact.predicate})`,
      `  (value ${serializeFactValue(fact.predicate, fact.value)}))`,
    ].join("\n")),
    "",
    `; RESULT status=${report.status}`,
    ...report.conclusions.map((item) => `; RESULT module=${item.module} subject=${item.subject} ${item.predicate}=${singleLine(String(item.value))} rules=${item.ruleIds.join(",") || "none"}`),
    ...report.reasoningGroups.flatMap((group) => [
      `; TRACE-GROUP ${singleLine(group.citation)} | ${singleLine(group.title)}`,
      ...group.steps.map((step) => `; TRACE rule=${step.ruleId} | ${singleLine(step.plainExplanation)} => ${singleLine(step.conclusion)}`),
    ]),
    ...report.missing.map((item) => `; MISSING module=${item.module} subject=${item.subject} predicate=${item.predicate} | ${singleLine(item.explanation)}`),
  ];
  return { fileName: exportFileName(report, "clp"), mediaType: "text/plain; charset=utf-8", content: `${forms.join("\n\n")}\n` };
}

function exportFileName(report: LogicTestReport, extension: "md" | "clp") {
  return `${report.input.caseId}-${report.query.topicId}-report.${extension}`;
}

function serializeFactValue(predicate: string, value: string | number | boolean): string {
  if (typeof value === "string" && (quotedValuePredicates.has(predicate) || !/^[a-z0-9][a-z0-9._:+/-]*$/iu.test(value))) {
    return `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("\n", "\\n").replaceAll("\r", "\\r")}"`;
  }
  return String(value);
}

function escapeInline(value: string): string {
  return value.replaceAll("`", "\\`").replaceAll("\n", " ").replaceAll("\r", " ");
}

function escapeTable(value: string): string {
  return escapeInline(value).replaceAll("|", "\\|");
}

function singleLine(value: string): string {
  return value.replace(/[\r\n]+/gu, " ").replaceAll(";", ",").trim();
}
