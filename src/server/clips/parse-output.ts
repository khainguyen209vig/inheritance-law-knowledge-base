import type { InferenceOutput, ModuleResultValue } from "./types";

const BEGIN = "@@INFERENCE-BEGIN@@";
const END = "@@INFERENCE-END@@";

export function parseClipsOutput(stdout: string): InferenceOutput {
  const lines = stdout.split(/\r?\n/).map((line) => line.trim());
  const begin = lines.indexOf(BEGIN);
  const end = lines.indexOf(END, begin + 1);

  if (begin < 0 || end < 0) {
    throw new Error("CLIPS không trả về khối kết quả hợp lệ.");
  }

  const output: InferenceOutput = { results: [], missing: [], traces: [] };

  for (const line of lines.slice(begin + 1, end)) {
    const fields = line.split(/\s+/);
    const marker = fields.shift();

    if (marker === "@@RESULT@@") {
      const [caseId, subject, module, predicate, value, ...derivations] = fields;
      if (!caseId || !subject || !module || !predicate || !isModuleResultValue(value)) {
        throw new Error(`Dòng RESULT không hợp lệ: ${line}`);
      }
      output.results.push({ caseId, subject, module, predicate, value, derivations });
    } else if (marker === "@@MISSING@@") {
      const [caseId, subject, module, predicate] = fields;
      if (!caseId || !subject || !module || !predicate) {
        throw new Error(`Dòng MISSING không hợp lệ: ${line}`);
      }
      output.missing.push({ caseId, subject, module, predicate });
    } else if (marker === "@@TRACE@@") {
      const [caseId, subject, ruleId, conclusionPredicate, conclusionValue, ...supports] = fields;
      if (!caseId || !subject || !ruleId || !conclusionPredicate || !conclusionValue) {
        throw new Error(`Dòng TRACE không hợp lệ: ${line}`);
      }
      output.traces.push({ caseId, subject, ruleId, conclusionPredicate, conclusionValue, supports });
    } else if (line.length > 0) {
      throw new Error(`Marker output không được hỗ trợ: ${line}`);
    }
  }

  return output;
}

function isModuleResultValue(value: string | undefined): value is ModuleResultValue {
  if (value && /^-?\d+(?:\.\d+)?$/u.test(value)) return true;
  if (value && /^\d{4}-\d{2}-\d{2}$/u.test(value)) return true;
  return value === "true" || value === "false" || value === "unknown" || value === "conflict"
    || value === "statutory" || value === "testamentary"
    || value === "excluded" || value === "not-excluded" || value === "exception-under-will"
    || value === "rank-1" || value === "rank-2" || value === "rank-3" || value === "valid" || value === "state"
    || value === "managing-heir" || value === "qualified-possessor";
}
