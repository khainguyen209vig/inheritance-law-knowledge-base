import { z } from "zod";

const symbolSchema = z
  .string()
  .regex(/^[a-z][a-z0-9-]{0,63}$/, "Chỉ dùng chữ thường, số và dấu gạch ngang.");

const booleanFact = (predicate: string) =>
  z.object({
    id: symbolSchema,
    predicate: z.literal(predicate),
    value: z.boolean(),
  });

export const willFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("will-type"), value: z.enum(["written", "oral"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("testator-mental-state"), value: z.enum(["lucid", "not-lucid"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("undue-influence"), value: z.enum(["none", "deception", "threat"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("prohibited-content"), value: z.enum(["detected", "not-detected"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("formal-defect"), value: z.enum(["detected", "not-detected"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("testator-age"), value: z.number().int().min(0).max(150) }),
  booleanFact("guardian-consent"),
  booleanFact("physical-limitation"),
  z.object({ id: symbolSchema, predicate: z.literal("testator-literacy"), value: z.enum(["literate", "illiterate"]) }),
  booleanFact("prepared-by-witness"),
  booleanFact("notarized-or-certified"),
  booleanFact("testator-alive-after-three-months"),
  z.object({ id: symbolSchema, predicate: z.literal("testator-mental-state-after-three-months"), value: z.enum(["lucid", "not-lucid"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("witness-count"), value: z.number().int().min(0).max(100) }),
  booleanFact("witnesses-recorded"),
  booleanFact("witnesses-signed"),
  z.object({ id: symbolSchema, predicate: z.literal("certified-within-days"), value: z.number().int().min(0).max(36500) }),
]);

export const willValidityRequestSchema = z
  .object({
    caseId: symbolSchema,
    subject: symbolSchema,
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

export type WillValidityRequest = z.infer<typeof willValidityRequestSchema>;
