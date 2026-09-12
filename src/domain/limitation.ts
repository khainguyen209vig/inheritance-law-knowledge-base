import { z } from "zod";

const symbolSchema = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có dạng YYYY-MM-DD.");

export const limitationRequestTypes = [
  "divide-estate",
  "confirm-or-deny-inheritance-right",
  "perform-estate-obligation",
] as const;

export type LimitationRequestType = (typeof limitationRequestTypes)[number];

export const limitationRequestTypeLabels: Record<LimitationRequestType, string> = {
  "divide-estate": "Yêu cầu chia di sản",
  "confirm-or-deny-inheritance-right": "Yêu cầu xác nhận hoặc bác bỏ quyền thừa kế",
  "perform-estate-obligation": "Yêu cầu thực hiện nghĩa vụ tài sản của người chết",
};

export const limitationFactSchema = z.discriminatedUnion("predicate", [
  z.object({ id: symbolSchema, predicate: z.literal("limitation-assessment-subject"), value: z.boolean() }),
  z.object({ id: symbolSchema, predicate: z.literal("limitation-request-label"), value: z.string().trim().min(1).max(200) }),
  z.object({ id: symbolSchema, predicate: z.literal("request-type"), value: z.enum(limitationRequestTypes) }),
  z.object({ id: symbolSchema, predicate: z.literal("asset-type"), value: z.enum(["immovable", "movable"]) }),
  z.object({ id: symbolSchema, predicate: z.literal("inheritance-opening-date"), value: isoDateSchema }),
]);
