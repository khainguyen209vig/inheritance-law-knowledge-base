import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const booleanFact = (predicate: string) => z.object({ id: symbolSchema, predicate: z.literal(predicate), value: z.boolean() });

export const spouseStatusFactSchema = z.discriminatedUnion("predicate", [
  booleanFact("spouse-status-assessment-subject"),
  booleanFact("joint-property-divided"),
  booleanFact("divorce-petition-pending-at-opening"),
  booleanFact("divorce-decision-effective-at-opening"),
  booleanFact("remarried-after-opening"),
]);

export type SpouseStatusFact = z.infer<typeof spouseStatusFactSchema>;
