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
]);
