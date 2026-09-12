import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const booleanFact = (predicate: string) => z.object({ id: symbolSchema, predicate: z.literal(predicate), value: z.boolean() });

export const eligibilityFactSchema = z.discriminatedUnion("predicate", [
  booleanFact("eligibility-candidate"),
  booleanFact("eligibility-review-complete"),
  z.object({ id: symbolSchema, predicate: z.literal("person-label"), value: z.string().trim().min(1).max(80) }),
  booleanFact("convicted-intentional-offense-against-deceased"),
  booleanFact("convicted-abuse-against-deceased"),
  booleanFact("serious-support-duty-violation"),
  booleanFact("convicted-offense-against-other-heir"),
  booleanFact("inheritance-benefit-motive"),
  z.object({ id: symbolSchema, predicate: z.literal("will-interference"), value: z.enum(["deception", "coercion"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("will-document-interference"), value: z.enum(["forgery", "alteration", "destruction", "concealment"]) }),
  booleanFact("improper-benefit-intent"),
  booleanFact("deceased-knew-disqualifying-act"),
  booleanFact("named-in-will-after-knowledge"),
  z.object({ id: symbolSchema, predicate: z.literal("eligibility-applicable-will"), value: symbolSchema }),
]);

export type EligibilityFact = z.infer<typeof eligibilityFactSchema>;
