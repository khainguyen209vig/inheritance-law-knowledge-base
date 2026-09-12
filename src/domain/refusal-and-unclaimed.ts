import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const booleanFact = (predicate: string) => z.object({ id: symbolSchema, predicate: z.literal(predicate), value: z.boolean() });

export const refusalAndUnclaimedFactSchema = z.discriminatedUnion("predicate", [
  booleanFact("refusal-assessment-subject"),
  booleanFact("refusal-made"),
  z.object({ id: symbolSchema, predicate: z.literal("refusal-intent"), value: z.enum(["ordinary", "avoid-obligation"]) }),
  booleanFact("refusal-written"),
  z.object({ id: symbolSchema, predicate: z.literal("refusal-notice-recipient"), value: z.enum(["estate-manager", "other-heir", "distribution-assignee", "none"]) }),
  booleanFact("refusal-before-estate-distribution"),
  booleanFact("unclaimed-estate-assessment-subject"),
  booleanFact("testamentary-beneficiary-search-complete"),
  booleanFact("remaining-estate-after-obligations"),
]);

export type RefusalAndUnclaimedFact = z.infer<typeof refusalAndUnclaimedFactSchema>;
