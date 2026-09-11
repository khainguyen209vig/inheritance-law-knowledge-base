import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWillValidityFacts,
  buildWillValidityQuestions,
  restoreWillValidityAnswers,
  willValidityQuestionRuleId,
} from "../src/modules/will-validity/definition";

function questionIds(answers: Record<string, string | number | boolean | undefined>): string[] {
  return buildWillValidityQuestions(answers).map((question) => question.id);
}

test("minor written wills request guardian and ordinary form observations", () => {
  const answers = { age: 16, willType: "written", physicalLimitation: false, literacy: "literate" };
  const ids = questionIds(answers);

  assert.ok(ids.includes("guardianConsent"));
  assert.ok(ids.includes("formalDefect"));
  assert.ok(!ids.includes("preparedByWitness"));
});

test("accessibility observations replace the transitional form question", () => {
  const ids = questionIds({ willType: "written", physicalLimitation: true, literacy: "literate" });

  assert.ok(ids.includes("preparedByWitness"));
  assert.ok(ids.includes("notarized"));
  assert.ok(!ids.includes("formalDefect"));
});

test("oral will questions follow the three-month branch", () => {
  const beforeAnswer = questionIds({ willType: "oral" });
  const afterAnswer = questionIds({ willType: "oral", aliveAfterThreeMonths: true });

  assert.ok(beforeAnswer.includes("witnessCount"));
  assert.ok(!beforeAnswer.includes("mentalAfterThreeMonths"));
  assert.ok(afterAnswer.includes("mentalAfterThreeMonths"));
});

test("fact mapper omits unanswered and hidden observations", () => {
  const facts = buildWillValidityFacts({
    willType: "written",
    age: 42,
    mentalState: "lucid",
    influence: undefined,
    physicalLimitation: false,
    literacy: "literate",
    preparedByWitness: true,
    formalDefect: "not-detected",
  });
  const predicates = new Set(facts.map((fact) => fact.predicate));

  assert.ok(!predicates.has("undue-influence"));
  assert.ok(!predicates.has("prepared-by-witness"));
  assert.ok(predicates.has("formal-defect"));
});

test("question citations select the exclusion rule after a negative answer", () => {
  assert.equal(willValidityQuestionRuleId("mentalState", { mentalState: "not-lucid" }), "R-B04");
  assert.equal(willValidityQuestionRuleId("guardianConsent", { guardianConsent: false }), "R-B06");
});

test("stored facts can restore the module answers", () => {
  const source = { willType: "oral", witnessCount: 2, witnessesRecorded: true };
  const restored = restoreWillValidityAnswers(buildWillValidityFacts(source));
  assert.deepEqual(restored, source);
});
