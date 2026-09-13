import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const booleanFact = (predicate: string) => z.object({
  id: symbolSchema,
  predicate: z.literal(predicate),
  value: z.boolean(),
});
const symbolFact = (predicate: string) => z.object({
  id: symbolSchema,
  predicate: z.literal(predicate),
  value: symbolSchema,
});

export const inheritanceTypeFactSchema = z.discriminatedUnion("predicate", [
  booleanFact("has-will"),
  booleanFact("estate-portion"),
  z.object({ id: symbolSchema, predicate: z.literal("estate-portion-label"), value: z.string().trim().min(1).max(80) }),
  symbolFact("applicable-will"),
  booleanFact("portion-disposed"),
  symbolFact("disposition-beneficiary"),
  z.object({ id: symbolSchema, predicate: z.literal("disposition-status"), value: z.enum(["effective", "ineffective-beneficiary"]) }),
  booleanFact("disposition-set-complete"),
  z.object({ id: symbolSchema, predicate: z.literal("beneficiary-kind"), value: z.enum(["person", "organization"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("beneficiary-life-status"), value: z.enum(["alive", "dead-before-or-same", "organization-exists", "organization-no-longer-exists"]) }),
  booleanFact("beneficiary-disqualified"),
  booleanFact("disqualification-exception"),
  booleanFact("valid-refusal"),
]);

export type InheritanceTypeFact = z.infer<typeof inheritanceTypeFactSchema>;
