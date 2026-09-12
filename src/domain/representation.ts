import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);

export const representationFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("representation-candidate"), value: z.boolean() }),
]);

export type RepresentationFact = z.infer<typeof representationFactSchema>;
