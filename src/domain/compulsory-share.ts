import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);

export const compulsoryShareFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("compulsory-share-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("age-group"), value: z.enum(["minor", "adult"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("work-capacity-status"), value: z.enum(["capable", "incapable"]) }),
]);

export type CompulsoryShareFact = z.infer<typeof compulsoryShareFactSchema>;
