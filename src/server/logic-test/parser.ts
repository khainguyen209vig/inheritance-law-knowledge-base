import { caseFactPredicates, caseFactSchema } from "@/domain/case";
import {
  logicTestLimits,
  type LogicTestDiagnostic,
  type LogicTestParseResult,
  type LogicTestParseSummary,
  type LogicTestSourceLocation,
  type NormalizedLogicTestCaseStudy,
  type NormalizedLogicTestFact,
} from "@/domain/logic-test";

type TokenKind = "left-paren" | "right-paren" | "atom" | "string" | "eof";
interface Token {
  kind: TokenKind;
  lexeme: string;
  value: string;
  location: LogicTestSourceLocation;
  endLocation: LogicTestSourceLocation;
}

interface ParsedSlot {
  value: string | number | boolean;
  token: Token;
}

interface ParsedForm {
  kind: "analysis-request" | "asserted-fact";
  location: LogicTestSourceLocation;
  slots: Map<string, ParsedSlot>;
}

interface ParseOptions {
  fileName: string;
  sizeBytes?: number;
}

const symbolPattern = /^[a-z][a-z0-9-]{0,63}$/u;
const integerPattern = /^-?(?:0|[1-9]\d*)$/u;
const floatPattern = /^-?(?:0|[1-9]\d*)\.\d+(?:[eE][+-]?\d+)?$/u;
const requestSlots = new Set(["case-id", "subject", "module"]);
const factSlots = new Set(["fact-id", "case-id", "subject", "predicate", "value", "source"]);
const labelPredicates = new Set(["person-label", "heir-person-label", "estate-portion-label", "obligation-label", "distribution-group-label", "distribution-beneficiary-label", "limitation-request-label", "estate-asset-label"]);

export function parseLogicTestClpBytes(bytes: Uint8Array, options: Omit<ParseOptions, "sizeBytes">): LogicTestParseResult {
  const origin = location(1, 1, 0);
  if (bytes.byteLength > logicTestLimits.maxFileBytes) {
    return { diagnostics: [diagnostic("FILE_TOO_LARGE", `File vượt quá ${logicTestLimits.maxFileBytes} bytes.`, origin)] };
  }
  try {
    const source = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return parseLogicTestClpSource(source, { ...options, sizeBytes: bytes.byteLength });
  } catch {
    return { diagnostics: [diagnostic("INVALID_UTF8", "File không phải UTF-8 hợp lệ.", origin)] };
  }
}

export function parseLogicTestClpSource(source: string, options: ParseOptions): LogicTestParseResult {
  const sizeBytes = options.sizeBytes ?? new TextEncoder().encode(source).byteLength;
  const origin = location(1, 1, 0);
  const diagnostics: LogicTestDiagnostic[] = [];
  if (!options.fileName.toLowerCase().endsWith(".clp") || options.fileName.length > 255) {
    diagnostics.push(diagnostic("INVALID_FILE_NAME", "File phải có tên không quá 255 ký tự và phần mở rộng .clp.", origin));
  }
  if (sizeBytes > logicTestLimits.maxFileBytes) {
    diagnostics.push(diagnostic("FILE_TOO_LARGE", `File vượt quá ${logicTestLimits.maxFileBytes} bytes.`, origin));
    return { diagnostics };
  }

  const tokenized = tokenize(source);
  diagnostics.push(...tokenized.diagnostics);
  const formParser = new RestrictedFormParser(tokenized.tokens, diagnostics);
  const forms = formParser.parse();
  const requestForms = forms.filter((form) => form.kind === "analysis-request");
  const factForms = forms.filter((form) => form.kind === "asserted-fact");

  if (requestForms.length > 1) {
    for (const form of requestForms.slice(1)) diagnostics.push(diagnostic("DUPLICATE_ANALYSIS_REQUEST", "File chỉ được có một analysis-request.", form.location));
  }
  if (factForms.length === 0) diagnostics.push(diagnostic("NO_ASSERTED_FACT", "File phải có ít nhất một asserted-fact.", origin));
  if (factForms.length > logicTestLimits.maxFacts) {
    diagnostics.push(diagnostic("TOO_MANY_FACTS", `File có ${factForms.length} facts, vượt giới hạn ${logicTestLimits.maxFacts}.`, factForms[logicTestLimits.maxFacts].location));
  }

  const request = requestForms[0] ? validateRequest(requestForms[0], diagnostics) : undefined;
  const facts = factForms.slice(0, logicTestLimits.maxFacts).flatMap((form) => {
    const fact = validateFact(form, diagnostics);
    return fact ? [fact] : [];
  });
  validateIdentityConsistency(factForms, requestForms[0], diagnostics);
  validateDuplicateFactIds(factForms, diagnostics);
  addMissingLabelWarnings(facts, diagnostics);

  const summary = facts.length ? buildSummary(facts) : undefined;
  if (diagnostics.some((item) => item.severity === "error")) return { diagnostics, summary };

  const firstCaseId = stringSlot(factForms[0], "case-id");
  if (!firstCaseId) return { diagnostics, summary };
  const caseStudy: NormalizedLogicTestCaseStudy = {
    fileName: options.fileName,
    sizeBytes,
    caseId: firstCaseId,
    ...(request ? { declaredRequest: request } : {}),
    facts,
  };
  return { caseStudy, diagnostics, summary };
}

function tokenize(source: string): { tokens: Token[]; diagnostics: LogicTestDiagnostic[] } {
  const tokens: Token[] = [];
  const diagnostics: LogicTestDiagnostic[] = [];
  let offset = 0;
  let line = 1;
  let column = 1;
  const here = () => location(line, column, offset);
  const advance = () => {
    const character = source[offset++];
    if (character === "\n") { line += 1; column = 1; } else column += 1;
    return character;
  };

  while (offset < source.length) {
    const character = source[offset];
    if (/\s/u.test(character)) { advance(); continue; }
    if (character === ";") { while (offset < source.length && source[offset] !== "\n") advance(); continue; }
    const start = here();
    if (character === "(" || character === ")") {
      advance();
      tokens.push({ kind: character === "(" ? "left-paren" : "right-paren", lexeme: character, value: character, location: start, endLocation: here() });
      continue;
    }
    if (character === '"') {
      advance();
      let value = "";
      let closed = false;
      while (offset < source.length) {
        const current = advance();
        if (current === '"') { closed = true; break; }
        if (current === "\\") {
          if (offset >= source.length) break;
          const escaped = advance();
          value += escaped === "n" ? "\n" : escaped === "r" ? "\r" : escaped === "t" ? "\t" : escaped;
        } else value += current;
      }
      if (!closed) diagnostics.push(diagnostic("UNTERMINATED_STRING", "Chuỗi không có dấu nháy kép đóng.", start, here()));
      else tokens.push({ kind: "string", lexeme: source.slice(start.offset, offset), value, location: start, endLocation: here() });
      continue;
    }
    let value = "";
    while (offset < source.length && !/[\s();"]/u.test(source[offset])) value += advance();
    if (!value) {
      diagnostics.push(diagnostic("UNEXPECTED_TOKEN", `Ký tự không được hỗ trợ: ${source[offset]}`, start));
      advance();
    } else tokens.push({ kind: "atom", lexeme: value, value, location: start, endLocation: here() });
  }
  const end = here();
  tokens.push({ kind: "eof", lexeme: "", value: "", location: end, endLocation: end });
  return { tokens, diagnostics };
}

class RestrictedFormParser {
  private index = 0;
  constructor(private readonly tokens: Token[], private readonly diagnostics: LogicTestDiagnostic[]) {}

  parse(): ParsedForm[] {
    const forms: ParsedForm[] = [];
    while (this.current().kind !== "eof") {
      if (this.current().kind !== "left-paren") {
        this.diagnostics.push(diagnostic("UNEXPECTED_TOKEN", "Chỉ chấp nhận S-expression ở top level.", this.current().location, this.current().endLocation));
        this.index += 1;
        continue;
      }
      const start = this.consume();
      const name = this.current();
      if (name.kind !== "atom") {
        this.diagnostics.push(diagnostic("UNEXPECTED_TOKEN", "Thiếu tên top-level form.", name.location, name.endLocation));
        this.skipOpenForm();
        continue;
      }
      this.consume();
      if (name.value !== "analysis-request" && name.value !== "asserted-fact") {
        this.diagnostics.push(diagnostic("UNSUPPORTED_TOP_LEVEL_FORM", `Không hỗ trợ top-level form ${name.value}.`, name.location, name.endLocation));
        this.skipOpenForm();
        continue;
      }
      forms.push(this.parseSupportedForm(name.value, start.location));
    }
    return forms;
  }

  private parseSupportedForm(kind: ParsedForm["kind"], formLocation: LogicTestSourceLocation): ParsedForm {
    const slots = new Map<string, ParsedSlot>();
    const allowed = kind === "analysis-request" ? requestSlots : factSlots;
    while (this.current().kind !== "right-paren" && this.current().kind !== "eof") {
      if (this.current().kind !== "left-paren") {
        this.diagnostics.push(diagnostic("UNEXPECTED_TOKEN", "Slot phải là một S-expression.", this.current().location, this.current().endLocation));
        this.index += 1;
        continue;
      }
      this.consume();
      const name = this.current();
      if (name.kind !== "atom") {
        this.diagnostics.push(diagnostic("INVALID_SLOT", "Thiếu tên slot.", name.location, name.endLocation));
        this.skipOpenForm();
        continue;
      }
      this.consume();
      const value = this.current();
      if (!allowed.has(name.value)) this.diagnostics.push(diagnostic("INVALID_SLOT", `Slot ${name.value} không thuộc ${kind}.`, name.location, name.endLocation));
      if (slots.has(name.value)) this.diagnostics.push(diagnostic("DUPLICATE_SLOT", `Slot ${name.value} bị lặp.`, name.location, name.endLocation));
      if (value.kind !== "atom" && value.kind !== "string") {
        this.diagnostics.push(diagnostic("INVALID_SLOT_VALUE", `Slot ${name.value} phải có đúng một scalar value.`, value.location, value.endLocation));
        this.skipOpenForm();
        continue;
      }
      this.consume();
      if (!slots.has(name.value)) slots.set(name.value, { value: scalarValue(value), token: value });
      if (this.current().kind !== "right-paren") {
        this.diagnostics.push(diagnostic("INVALID_SLOT_VALUE", `Slot ${name.value} chỉ được có một value.`, this.current().location, this.current().endLocation));
        this.skipOpenForm();
      } else this.consume();
    }
    if (this.current().kind === "right-paren") this.consume();
    else this.diagnostics.push(diagnostic("UNTERMINATED_FORM", `${kind} không có dấu ngoặc đóng.`, formLocation));

    const required = kind === "analysis-request" ? requestSlots : new Set([...factSlots].filter((slot) => slot !== "source"));
    for (const name of required) if (!slots.has(name)) this.diagnostics.push(diagnostic("MISSING_SLOT", `${kind} thiếu slot ${name}.`, formLocation));
    return { kind, location: formLocation, slots };
  }

  private skipOpenForm() {
    let depth = 1;
    while (depth > 0 && this.current().kind !== "eof") {
      const token = this.consume();
      if (token.kind === "left-paren") depth += 1;
      else if (token.kind === "right-paren") depth -= 1;
    }
  }

  private current() { return this.tokens[this.index]; }
  private consume() { return this.tokens[this.index++]; }
}

function validateRequest(form: ParsedForm, diagnostics: LogicTestDiagnostic[]): { subject: string; module: string } | undefined {
  const caseId = validateSymbolSlot(form, "case-id", diagnostics);
  const subject = validateSymbolSlot(form, "subject", diagnostics);
  const module = validateSymbolSlot(form, "module", diagnostics);
  return caseId && subject && module ? { subject, module } : undefined;
}

function validateFact(form: ParsedForm, diagnostics: LogicTestDiagnostic[]): NormalizedLogicTestFact | undefined {
  const id = validateSymbolSlot(form, "fact-id", diagnostics);
  const caseId = validateSymbolSlot(form, "case-id", diagnostics);
  const subject = validateSymbolSlot(form, "subject", diagnostics);
  const predicate = validateSymbolSlot(form, "predicate", diagnostics);
  const valueSlot = form.slots.get("value");
  const source = form.slots.get("source");
  if (source && !["user", "document", "system"].includes(String(source.value))) diagnostics.push(diagnostic("INVALID_SLOT_VALUE", "source phải là user, document hoặc system.", source.token.location, source.token.endLocation));
  if (!id || !caseId || !subject || !predicate || !valueSlot) return undefined;
  if (!caseFactPredicates.has(predicate)) {
    diagnostics.push(diagnostic("UNSUPPORTED_PREDICATE", `Predicate ${predicate} không thuộc contract module.`, form.slots.get("predicate")!.token.location, form.slots.get("predicate")!.token.endLocation));
    return undefined;
  }
  const parsed = caseFactSchema.safeParse({ id, predicate, value: valueSlot.value });
  if (!parsed.success) {
    diagnostics.push(diagnostic("INVALID_SLOT_VALUE", `Giá trị của ${predicate} không đúng domain hoặc kiểu dữ liệu.`, valueSlot.token.location, valueSlot.token.endLocation));
    return undefined;
  }
  return { ...parsed.data, subject };
}

function validateSymbolSlot(form: ParsedForm, name: string, diagnostics: LogicTestDiagnostic[]): string | undefined {
  const slot = form.slots.get(name);
  if (!slot) return undefined;
  if (typeof slot.value !== "string" || !symbolPattern.test(slot.value)) {
    diagnostics.push(diagnostic("INVALID_SLOT_VALUE", `${name} phải là symbol chữ thường hợp lệ.`, slot.token.location, slot.token.endLocation));
    return undefined;
  }
  return slot.value;
}

function validateIdentityConsistency(forms: ParsedForm[], requestForm: ParsedForm | undefined, diagnostics: LogicTestDiagnostic[]) {
  const caseSlots = forms.flatMap((form) => form.slots.get("case-id") ? [{ form, slot: form.slots.get("case-id")! }] : []);
  const first = caseSlots[0]?.slot.value;
  for (const { slot } of caseSlots.slice(1)) if (slot.value !== first) diagnostics.push(diagnostic("INCONSISTENT_CASE_ID", `Case ID ${String(slot.value)} không khớp ${String(first)}.`, slot.token.location, slot.token.endLocation));
  const requestCase = requestForm?.slots.get("case-id");
  if (requestCase && first && requestCase.value !== first) {
    diagnostics.push(diagnostic("INCONSISTENT_CASE_ID", `Case ID ${String(requestCase.value)} trong analysis-request không khớp ${String(first)}.`, requestCase.token.location, requestCase.token.endLocation));
  }
}

function validateDuplicateFactIds(forms: ParsedForm[], diagnostics: LogicTestDiagnostic[]) {
  const seen = new Set<string>();
  for (const form of forms) {
    const slot = form.slots.get("fact-id");
    if (!slot || typeof slot.value !== "string") continue;
    if (seen.has(slot.value)) diagnostics.push(diagnostic("DUPLICATE_FACT_ID", `Fact ID bị trùng: ${slot.value}.`, slot.token.location, slot.token.endLocation));
    seen.add(slot.value);
  }
}

function addMissingLabelWarnings(facts: NormalizedLogicTestFact[], diagnostics: LogicTestDiagnostic[]) {
  const labeled = new Set(facts.filter((fact) => labelPredicates.has(fact.predicate)).map((fact) => fact.subject));
  const subjects = new Set(facts.map((fact) => fact.subject));
  for (const subject of subjects) if (!labeled.has(subject)) diagnostics.push(diagnostic("MISSING_LABEL", `Subject ${subject} chưa có nhãn thân thiện.`, location(1, 1, 0), undefined, "warning"));
}

function buildSummary(facts: NormalizedLogicTestFact[]): LogicTestParseSummary {
  const labels = new Map(facts.filter((fact) => labelPredicates.has(fact.predicate) && typeof fact.value === "string").map((fact) => [fact.subject, String(fact.value)]));
  const counts = new Map<string, number>();
  for (const fact of facts) counts.set(fact.subject, (counts.get(fact.subject) ?? 0) + 1);
  return {
    factCount: facts.length,
    subjectCount: counts.size,
    subjects: [...counts].map(([id, factCount]) => ({ id, ...(labels.has(id) ? { label: labels.get(id) } : {}), factCount })),
  };
}

function stringSlot(form: ParsedForm | undefined, name: string): string | undefined {
  const value = form?.slots.get(name)?.value;
  return typeof value === "string" ? value : undefined;
}

function scalarValue(token: Token): string | number | boolean {
  if (token.kind === "string") return token.value;
  if (token.value === "true") return true;
  if (token.value === "false") return false;
  if (integerPattern.test(token.value) || floatPattern.test(token.value)) return Number(token.value);
  return token.value;
}

function location(line: number, column: number, offset: number): LogicTestSourceLocation { return { line, column, offset }; }

function diagnostic(code: LogicTestDiagnostic["code"], message: string, start: LogicTestSourceLocation, end?: LogicTestSourceLocation, severity: LogicTestDiagnostic["severity"] = "error"): LogicTestDiagnostic {
  return { code, severity, message, location: start, ...(end ? { endLocation: end } : {}) };
}
