import { z } from "zod";
import { willFactSchema } from "./will-validity";

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
    facts: z.array(willFactSchema).max(100),
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

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type ReplaceCaseFactsInput = z.infer<typeof replaceCaseFactsSchema>;
