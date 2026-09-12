import { z } from "zod";
import { inheritanceTypeFactSchema } from "./inheritance-type";
import { eligibilityFactSchema } from "./eligibility";
import { heirRankFactSchema } from "./heir-rank";
import { representationFactSchema } from "./representation";
import { compulsoryShareFactSchema } from "./compulsory-share";
import { spouseStatusFactSchema } from "./spouse-status";
import { refusalAndUnclaimedFactSchema } from "./refusal-and-unclaimed";
import { willFactSchema } from "./will-validity";

export const caseFactSchema = z.union([willFactSchema, inheritanceTypeFactSchema, eligibilityFactSchema, heirRankFactSchema, representationFactSchema, compulsoryShareFactSchema, spouseStatusFactSchema, refusalAndUnclaimedFactSchema]);

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

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ReplaceCaseFactsInput = z.infer<typeof replaceCaseFactsSchema>;
