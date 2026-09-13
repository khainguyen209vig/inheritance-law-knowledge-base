import { resolveGuidedRequirement, selectNextGuidedRequirement, type GuidedCaseState, type GuidedMissingRequirement, type GuidedTopicId } from "@/domain/guided-conversation";
import type { ApiFact } from "@/modules/contracts";

export type GuidedDependencyStatus = "complete" | "ready" | "skipped" | "blocked";

export interface GuidedDependencyState {
  id: string;
  status: GuidedDependencyStatus;
}

interface PlanContext {
  caseId: string;
  topicId: GuidedTopicId;
  facts: ApiFact[];
  requirements: GuidedMissingRequirement[];
  completedModules: ReadonlySet<string>;
  activeCompulsoryHeirs: ReadonlySet<string>;
  willDependencyPending: boolean;
  inheritanceGoalComplete: boolean;
  hasStatutoryPortion: boolean;
  hasConflict: boolean;
  deceasedId?: string;
}

interface DependencyNode {
  id: string;
  topics: readonly GuidedTopicId[];
  dependsOn?: (topicId: GuidedTopicId) => readonly string[];
  evaluate: (context: PlanContext) => NodeEvaluation;
}

type NodeEvaluation =
  | { status: "complete" | "skipped" }
  | { status: "ready"; requirement: GuidedMissingRequirement }
  | { status: "complete"; halt: true };

export interface GuidedDependencyPlan {
  states: GuidedDependencyState[];
  next?: GuidedCaseState["next"];
}

const allTopics: readonly GuidedTopicId[] = ["who-inherits", "will-validity", "person-eligibility", "representation", "compulsory-share", "estate-settlement", "limitation"];
const willContextTopics: readonly GuidedTopicId[] = ["who-inherits", "person-eligibility", "representation", "compulsory-share"];
const familyGraphTopics: readonly GuidedTopicId[] = ["who-inherits", "representation", "compulsory-share"];

const nodes: readonly DependencyNode[] = [
  {
    id: "deceased",
    topics: allTopics,
    evaluate: ({ deceasedId }) => deceasedId
      ? { status: "complete" }
      : { status: "ready", requirement: { subject: "case", predicate: "guided-deceased-name" } },
  },
  {
    id: "conflict-gate",
    topics: allTopics,
    dependsOn: () => ["deceased"],
    evaluate: ({ hasConflict }) => hasConflict ? { status: "complete", halt: true } : { status: "skipped" },
  },
  {
    id: "eligibility-subject",
    topics: ["person-eligibility"],
    dependsOn: () => ["deceased", "conflict-gate"],
    evaluate: ({ facts, deceasedId }) => facts.some((fact) => fact.predicate === "eligibility-candidate" && fact.value === true && fact.subject !== deceasedId)
      ? { status: "complete" }
      : { status: "ready", requirement: { subject: "eligibility-guided-person", predicate: "guided-eligibility-person-name" } },
  },
  {
    id: "will-context",
    topics: willContextTopics,
    dependsOn: (topicId) => topicId === "person-eligibility" ? ["eligibility-subject"] : ["deceased", "conflict-gate"],
    evaluate: ({ caseId, facts }) => {
      const hasWill = facts.find((fact) => fact.subject === caseId && fact.predicate === "has-will")?.value;
      if (typeof hasWill !== "boolean") return { status: "ready", requirement: { subject: caseId, predicate: "inheritance-has-will" } };
      if (hasWill && !facts.some((fact) => fact.predicate === "will-type")) return { status: "ready", requirement: { subject: "will-guided", predicate: "will-type" } };
      return { status: "complete" };
    },
  },
  {
    id: "will-document",
    topics: ["will-validity"],
    dependsOn: () => ["deceased", "conflict-gate"],
    evaluate: ({ facts }) => facts.some((fact) => fact.predicate === "will-type")
      ? { status: "complete" }
      : { status: "ready", requirement: { subject: "will-guided", predicate: "will-type" } },
  },
  {
    id: "will-evaluation",
    topics: willContextTopics,
    dependsOn: () => ["will-context"],
    evaluate: ({ requirements, willDependencyPending }) => {
      if (!willDependencyPending) return { status: "complete" };
      const next = selectNextGuidedRequirement(requirements);
      return next ? { status: "ready", requirement: next.requirement } : { status: "complete" };
    },
  },
  {
    id: "inheritance-regime",
    topics: ["who-inherits"],
    dependsOn: () => ["will-evaluation"],
    evaluate: ({ caseId, requirements, inheritanceGoalComplete, hasStatutoryPortion }) => {
      if (!inheritanceGoalComplete) {
        const beneficiaryDependency = selectNextGuidedRequirement(requirements.filter((requirement) => isBeneficiaryDependencyRequirement(requirement.predicate)));
        return beneficiaryDependency
          ? { status: "ready", requirement: beneficiaryDependency.requirement }
          : { status: "ready", requirement: { subject: caseId, predicate: "guided-inheritance-portions" } };
      }
      return hasStatutoryPortion ? { status: "complete" } : { status: "complete", halt: true };
    },
  },
  {
    id: "family-graph",
    topics: familyGraphTopics,
    dependsOn: (topicId) => topicId === "who-inherits" ? ["inheritance-regime"] : ["will-evaluation"],
    evaluate: ({ facts, deceasedId }) => facts.some((fact) => fact.predicate === "heir-search-complete" && fact.value === true)
      ? { status: "complete" }
      : { status: "ready", requirement: { subject: deceasedId ?? "case", predicate: "relationship-at-opening" } },
  },
  {
    id: "inference-requirements",
    topics: allTopics,
    dependsOn: (topicId) => {
      if (topicId === "will-validity") return ["will-document"];
      if (topicId === "person-eligibility") return ["will-evaluation"];
      if (familyGraphTopics.includes(topicId)) return ["family-graph"];
      return ["deceased", "conflict-gate"];
    },
    evaluate: (context) => {
      const next = selectNextGuidedRequirement(context.requirements.filter((requirement) => !isEligibilityRequirement(requirement.predicate) || requirement.subject !== context.deceasedId));
      if (next) return { status: "ready", requirement: next.requirement };
      if (context.topicId === "compulsory-share" && context.completedModules.has("heir-rank") && !context.completedModules.has("compulsory-share")) {
        return { status: "ready", requirement: { subject: context.deceasedId ?? "case", predicate: "guided-compulsory-share-review" } };
      }
      if (context.topicId === "compulsory-share" && context.completedModules.has("compulsory-share") && context.activeCompulsoryHeirs.size > 0 && compulsoryCalculationsIncomplete(context.facts, context.activeCompulsoryHeirs)) {
        return { status: "ready", requirement: { subject: context.deceasedId ?? "case", predicate: "guided-compulsory-share-portions" } };
      }
      if (context.completedModules.size > 0) return { status: "complete" };
      return { status: "ready", requirement: initialRequirement(context) };
    },
  },
];

export function buildGuidedDependencyPlan(input: Omit<PlanContext, "deceasedId">): GuidedDependencyPlan {
  const context: PlanContext = {
    ...input,
    deceasedId: input.facts.find((fact) => fact.predicate === "deceased-person" && fact.value === true)?.subject,
  };
  const activeNodes = nodes.filter((node) => node.topics.includes(context.topicId));
  const states: GuidedDependencyState[] = [];

  for (const node of activeNodes) {
    const dependencies = node.dependsOn?.(context.topicId) ?? [];
    if (dependencies.some((dependencyId) => !states.some((state) => state.id === dependencyId && (state.status === "complete" || state.status === "skipped")))) {
      states.push({ id: node.id, status: "blocked" });
      continue;
    }
    const evaluation = node.evaluate(context);
    states.push({ id: node.id, status: evaluation.status });
    if ("halt" in evaluation) {
      appendRemainingStates(states, activeNodes, "skipped");
      return { states };
    }
    if (evaluation.status === "ready") {
      appendRemainingStates(states, activeNodes, "blocked");
      return { states, next: planned(evaluation.requirement) };
    }
  }
  return { states };
}

function appendRemainingStates(states: GuidedDependencyState[], activeNodes: readonly DependencyNode[], status: "blocked" | "skipped"): void {
  for (const node of activeNodes.slice(states.length)) states.push({ id: node.id, status });
}

function initialRequirement(context: PlanContext): GuidedMissingRequirement {
  const subject = context.deceasedId ?? "case";
  const initialByTopic: Record<GuidedTopicId, GuidedMissingRequirement> = {
    "who-inherits": { subject, predicate: "guided-inheritance-portions" },
    "will-validity": { subject: "will-guided", predicate: "will-type" },
    "person-eligibility": { subject: "eligibility-guided-person", predicate: "guided-eligibility-person-name" },
    representation: { subject, predicate: "relationship-at-opening" },
    "compulsory-share": { subject, predicate: "relationship-at-opening" },
    "estate-settlement": { subject, predicate: "guided-estate-settlement" },
    limitation: { subject, predicate: "inheritance-opening-date" },
  };
  return initialByTopic[context.topicId];
}

function compulsoryCalculationsIncomplete(facts: readonly ApiFact[], activePeople: ReadonlySet<string>): boolean {
  const portions = facts.flatMap((fact) => fact.predicate === "estate-portion" && fact.value === true && fact.subject ? [fact.subject] : []);
  if (portions.length === 0) return true;
  const calculations = facts.flatMap((fact) => fact.predicate === "compulsory-share-calculation" && fact.value === true && fact.subject ? [fact.subject] : []);
  return [...activePeople].some((personId) => portions.some((portionId) => !calculations.some((calculationId) =>
    facts.some((fact) => fact.subject === calculationId && fact.predicate === "calculation-person" && fact.value === personId)
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "calculation-estate-portion" && fact.value === portionId)
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "hypothetical-statutory-share")
    && facts.some((fact) => fact.subject === calculationId && fact.predicate === "testamentary-share-received"))));
}

function isEligibilityRequirement(predicate: string): boolean {
  return predicate === "article-621-status" || predicate === "eligibility-review-complete";
}

function isBeneficiaryDependencyRequirement(predicate: string): boolean {
  return isEligibilityRequirement(predicate) || predicate === "valid-refusal" || predicate === "refusal-made" || predicate === "refusal-intent"
    || predicate === "refusal-written" || predicate === "refusal-notice-recipient" || predicate === "refusal-before-estate-distribution";
}

function planned(requirement: GuidedMissingRequirement): NonNullable<GuidedCaseState["next"]> {
  return { requirement, resolution: resolveGuidedRequirement(requirement) };
}
