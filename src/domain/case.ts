import { z } from "zod";
import { inheritanceTypeFactSchema } from "./inheritance-type";
import { eligibilityFactSchema } from "./eligibility";
import { heirRankFactSchema } from "./heir-rank";
import { representationFactSchema } from "./representation";
import { compulsoryShareFactSchema } from "./compulsory-share";
import { spouseStatusFactSchema } from "./spouse-status";
import { refusalAndUnclaimedFactSchema } from "./refusal-and-unclaimed";
import { estateSettlementFactSchema } from "./estate-settlement";
import { limitationFactSchema } from "./limitation";
import { willFactSchema } from "./will-validity";

export const caseFactSchema = z.union([willFactSchema, inheritanceTypeFactSchema, eligibilityFactSchema, heirRankFactSchema, representationFactSchema, compulsoryShareFactSchema, spouseStatusFactSchema, refusalAndUnclaimedFactSchema, estateSettlementFactSchema, limitationFactSchema]);

/** Predicate allow-list derived from the runtime fact contract rather than duplicated in HTTP routes or parsers. */
export const caseFactPredicates = collectPredicateConstants(z.toJSONSchema(caseFactSchema));

function collectPredicateConstants(schema: unknown): ReadonlySet<string> {
  const predicates = new Set<string>();
  const visit = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    const properties = record.properties;
    if (properties && typeof properties === "object") {
      const predicate = (properties as Record<string, unknown>).predicate;
      if (predicate && typeof predicate === "object") {
        const value = (predicate as Record<string, unknown>).const;
        if (typeof value === "string") predicates.add(value);
      }
    }
    for (const value of Object.values(record)) {
      if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") visit(value);
    }
  };
  visit(schema);
  return predicates;
}

export const caseIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,63}$/, "Chỉ dùng chữ thường, số và dấu gạch ngang.");

export const createCaseSchema = z.object({
  id: caseIdSchema.optional(),
  title: z.string().trim().min(1).max(200),
});

export const updateCaseSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const replaceCaseFactsSchema = z
  .object({
    subject: caseIdSchema,
    facts: z.array(z.intersection(caseFactSchema, z.object({ subject: caseIdSchema.optional() }))).max(500),
  })
  .superRefine(({ facts }, context) => {
    const ids = new Set<string>();
    for (const [index, fact] of facts.entries()) {
      if (ids.has(fact.id)) {
        context.addIssue({
          code: "custom",
          message: `Fact ID bị trùng: ${fact.id}`,
          path: ["facts", index, "id"],
        });
      }
      ids.add(fact.id);
    }
  });

export const runWillValiditySchema = z.object({
  subject: caseIdSchema,
});

export const runInheritanceTypeSchema = z.object({}).strict();
export const runEligibilitySchema = z.object({}).strict();
export const runHeirRankSchema = z.object({}).strict();
export const runRepresentationSchema = z.object({}).strict();
export const runCompulsoryShareSchema = z.object({}).strict();
export const runSpouseStatusSchema = z.object({}).strict();
export const runRefusalAndUnclaimedSchema = z.object({}).strict();
export const runEstateSettlementSchema = z.object({}).strict();
export const runLimitationSchema = z.object({}).strict();

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ReplaceCaseFactsInput = z.infer<typeof replaceCaseFactsSchema>;
