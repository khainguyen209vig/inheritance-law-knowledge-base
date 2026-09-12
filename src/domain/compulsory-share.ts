import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);

export const compulsoryShareFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("compulsory-share-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("age-group"), value: z.enum(["minor", "adult"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("work-capacity-status"), value: z.enum(["capable", "incapable"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("compulsory-share-calculation"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("calculation-person"), value: symbolSchema }),
  z.object({ id: symbolSchema, predicate: z.literal("calculation-estate-portion"), value: symbolSchema }),
  z.object({ id: symbolSchema, predicate: z.literal("hypothetical-statutory-share"), value: z.number().positive().finite() }),
  z.object({ id: symbolSchema, predicate: z.literal("testamentary-share-received"), value: z.number().nonnegative().finite() }),
]);

export type CompulsoryShareFact = z.infer<typeof compulsoryShareFactSchema>;
