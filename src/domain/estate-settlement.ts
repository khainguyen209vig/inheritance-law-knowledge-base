import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);

export const obligationTypes = [
  "funeral-expense",
  "unpaid-support",
  "estate-preservation",
  "dependent-allowance",
  "labor-compensation",
  "damage-compensation",
  "tax-and-state-dues",
  "other-debt",
  "fine",
  "other-expense",
] as const;

export type ObligationType = (typeof obligationTypes)[number];

export const obligationTypeLabels: Record<ObligationType, string> = {
  "funeral-expense": "Chi phí mai táng hợp lý theo tập quán",
  "unpaid-support": "Tiền cấp dưỡng còn thiếu",
  "estate-preservation": "Chi phí bảo quản di sản",
  "dependent-allowance": "Tiền trợ cấp cho người sống nương nhờ",
  "labor-compensation": "Tiền công lao động",
  "damage-compensation": "Tiền bồi thường thiệt hại",
  "tax-and-state-dues": "Thuế và khoản phải nộp ngân sách",
  "other-debt": "Khoản nợ khác với cá nhân, pháp nhân",
  fine: "Tiền phạt",
  "other-expense": "Chi phí khác",
};

export const estateSettlementFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("estate-obligation"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("obligation-type"), value: z.enum(obligationTypes) }),
  z.object({ id: symbolSchema, predicate: z.literal("obligation-label"), value: z.string().trim().min(1).max(200) }),
  z.object({ id: symbolSchema, predicate: z.literal("obligation-amount"), value: z.number().nonnegative() }),
  z.object({ id: symbolSchema, predicate: z.literal("testamentary-distribution-group"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("distribution-group-label"), value: z.string().trim().min(1).max(200) }),
  z.object({ id: symbolSchema, predicate: z.literal("distribution-beneficiary"), value: symbolSchema }),
  z.object({ id: symbolSchema, predicate: z.literal("distribution-beneficiary-label"), value: z.string().trim().min(1).max(200) }),
  z.object({ id: symbolSchema, predicate: z.literal("distribution-beneficiary-set-complete"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("testamentary-shares-specified"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("alternative-share-agreement"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("prenatal-share-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("prenatal-status-at-distribution"), value: z.enum(["conceived-not-born"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("prenatal-birth-outcome"), value: z.enum(["born-alive", "died-before-birth"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("division-restriction-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("division-restriction-basis"), value: z.enum(["will-instruction", "all-heirs-agreement"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("all-heirs-agreed"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("specified-division-date"), value: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }),
  z.object({ id: symbolSchema, predicate: z.literal("division-hardship-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("estate-division-requested"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("serious-division-impact"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("prior-court-deferral-expired"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("serious-impact-still-exists"), value: z.boolean() }),
]);
