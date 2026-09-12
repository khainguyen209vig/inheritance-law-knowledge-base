import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const booleanFact = (predicate: string) => z.object({ id: symbolSchema, predicate: z.literal(predicate), value: z.boolean() });
const relationFact = (predicate: string) => z.object({ id: symbolSchema, predicate: z.literal(predicate), value: symbolSchema });

export const heirRankFactSchema = z.discriminatedUnion("predicate", [
  booleanFact("deceased-person"),
  booleanFact("heir-rank-candidate"),
  booleanFact("heir-search-complete"),
  z.object({ id: symbolSchema, predicate: z.literal("heir-life-status"), value: z.enum(["alive", "dead-before-or-same"]) }),
  relationFact("biological-parent-of"),
  relationFact("adoptive-parent-of"),
  relationFact("step-parent-of"),
  z.object({ id: symbolSchema, predicate: z.literal("step-care-status"), value: z.enum(["established", "not-established"]) }),
  relationFact("spouse-at-opening"),
  z.object({ id: symbolSchema, predicate: z.literal("heir-person-label"), value: z.string().trim().min(1).max(80) }),
]);

export type HeirRankFact = z.infer<typeof heirRankFactSchema>;
