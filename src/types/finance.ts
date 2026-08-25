import { z } from "zod";

/**
 * Currency integer cents representation (e.g. 10.50 EUR = 1050 cents)
 */
export const MoneyCentsSchema = z.number().int();
export type MoneyCents = z.infer<typeof MoneyCentsSchema>;

/**
 * Transaction Categories
 */
export const TransactionCategorySchema = z.enum([
  "HOUSING_RENT",
  "FOOD_AND_BONI",
  "UTILITIES",
  "TRANSPORT_BUS_PASS",
  "BOOKS_AND_STUDY",
  "HEALTH_AND_FITNESS",
  "LEISURE_AND_SOCIAL",
  "STUDENT_WORK_INCOME",
  "SCHOLARSHIP",
  "PARENTAL_SUPPORT",
  "MISCELLANEOUS"
]);
export type TransactionCategory = z.infer<typeof TransactionCategorySchema>;

export const TransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);
export type TransactionType = z.infer<typeof TransactionTypeSchema>;

/**
 * Transaction Entity
 */
export const TransactionSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(120),
  amountCents: z.number().int().positive(),
  type: TransactionTypeSchema,
  category: TransactionCategorySchema,
  timestamp: z.number().int().positive(),
  isMealVoucherUsed: z.boolean().default(false),
  voucherSubsidyCents: z.number().int().min(0).default(0),
  notes: z.string().max(500).optional()
});
export type Transaction = z.infer<typeof TransactionSchema>;

/**
 * Participant for bill splitting
 */
export const SplitParticipantSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  weight: z.number().positive().default(1),
  exactAmountCents: z.number().int().min(0).optional(),
  hasPaidCents: z.number().int().min(0).default(0)
});
export type SplitParticipant = z.infer<typeof SplitParticipantSchema>;

/**
 * Bill Split Calculation Result
 */
export const SplitSettlementSchema = z.object({
  fromParticipantId: z.string(),
  fromParticipantName: z.string(),
  toParticipantId: z.string(),
  toParticipantName: z.string(),
  amountCents: z.number().int().positive()
});
export type SplitSettlement = z.infer<typeof SplitSettlementSchema>;

export const BillSplitResultSchema = z.object({
  totalAmountCents: z.number().int().positive(),
  participantShares: z.record(z.string(), z.number().int()),
  settlements: z.array(SplitSettlementSchema),
  roundingRemainderCents: z.number().int()
});
export type BillSplitResult = z.infer<typeof BillSplitResultSchema>;

/**
 * Monthly Budget Target & Analytics
 */
export const MonthlyBudgetSummarySchema = z.object({
  monthYear: z.string().regex(/^\d{4}-\d{2}$/), // YYYY-MM
  totalIncomeCents: z.number().int().min(0),
  totalExpenseCents: z.number().int().min(0),
  netSavingsCents: z.number().int(),
  savingsRatePercentage: z.number(),
  mealVouchersUsedCount: z.number().int().min(0),
  totalVoucherSavingsCents: z.number().int().min(0),
  categoryBreakdownCents: z.record(TransactionCategorySchema, z.number().int())
});
export type MonthlyBudgetSummary = z.infer<typeof MonthlyBudgetSummarySchema>;
