import { getLogicTestTopicPlan, logicTestRunRequestSchema, type LogicTestReport, type LogicTestRunRequest } from "@/domain/logic-test";
import { inferAnalysisModule } from "@/server/clips/adapter";
import { buildLogicTestReport } from "./report";

export class LogicTestScopeNotFoundError extends Error {}

export async function runLogicTest(input: LogicTestRunRequest): Promise<LogicTestReport> {
  const request = logicTestRunRequestSchema.parse(input);
  if (request.scopeSubject && !request.caseStudy.facts.some((fact) => fact.subject === request.scopeSubject)) {
    throw new LogicTestScopeNotFoundError(request.scopeSubject);
  }
  const plan = getLogicTestTopicPlan(request.topicId);
  const outputs = await Promise.all(plan.goalModules.map(async (module) => ({
    module,
    output: await inferAnalysisModule({
      caseId: request.caseStudy.caseId,
      subject: module === "will-validity" ? willSubject(request) : request.caseStudy.caseId,
      facts: request.caseStudy.facts,
    }, module),
  })));
  return buildLogicTestReport(request, outputs);
}

function willSubject(request: LogicTestRunRequest): string {
  return request.scopeSubject
    ?? request.caseStudy.declaredRequest?.subject
    ?? request.caseStudy.facts.find((fact) => fact.predicate === "will-type")?.subject
    ?? request.caseStudy.caseId;
}
