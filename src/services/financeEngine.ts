import {
  type BillSplitResult,
  type MonthlyBudgetSummary,
  type SplitParticipant,
  type SplitSettlement,
  type Transaction,
  type TransactionCategory,
  TransactionCategorySchema
} from "../types/finance";

/**
 * Converts decimal currency amount (e.g. 12.34 EUR) to integer cents (1234)
 */
export function eurosToCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Converts integer cents (1234) to decimal currency (12.34)
 */
export function centsToEuros(cents: number): number {
  return cents / 100;
}

/**
 * Deterministically splits a bill among participants with exact zero-remainder conservation.
 * Any indivisible remainder cents are distributed 1 cent at a time to participants in order.
 */
export function calculateDeterministicSplit(
  totalAmountCents: number,
  participants: readonly SplitParticipant[]
): BillSplitResult {
  if (participants.length === 0) {
    throw new Error("Cannot split bill among zero participants.");
  }
  if (totalAmountCents <= 0) {
    throw new Error("Total amount to split must be greater than zero.");
  }

  const participantShares: Record<string, number> = {};
  const totalWeight = participants.reduce((sum, p) => sum + p.weight, 0);

  let allocatedCents = 0;
  const rawShares: { id: string; baseCents: number; fraction: number }[] = [];

  for (const p of participants) {
    const proportional = (totalAmountCents * p.weight) / totalWeight;
    const baseCents = Math.floor(proportional);
    const fraction = proportional - baseCents;

    rawShares.push({ id: p.id, baseCents, fraction });
    allocatedCents += baseCents;
  }

  // Remainder cents to distribute
  let remainderCents = totalAmountCents - allocatedCents;

  // Sort by highest fraction first to distribute remainder fairly
  rawShares.sort((a, b) => b.fraction - a.fraction);

  for (const item of rawShares) {
    let finalShare = item.baseCents;
    if (remainderCents > 0) {
      finalShare += 1;
      remainderCents -= 1;
    }
    participantShares[item.id] = finalShare;
  }

  // Calculate settlement transactions (who owes who)
  const balances: { id: string; name: string; netCents: number }[] = participants.map((p) => {
    const share = participantShares[p.id] ?? 0;
    const paid = p.hasPaidCents;
    return {
      id: p.id,
      name: p.name,
      netCents: paid - share // positive means is owed money, negative means owes money
    };
  });

  const settlements = computeFairDebtSettlement(balances);

  return {
    totalAmountCents,
    participantShares,
    settlements,
    roundingRemainderCents: 0 // Remainder is 100% absorbed into shares
  };
}

/**
 * Minimizes peer-to-peer transaction count using greedy debt matching
 */
export function computeFairDebtSettlement(
  balances: readonly { id: string; name: string; netCents: number }[]
): SplitSettlement[] {
  const debtors = balances
    .filter((b) => b.netCents < 0)
    .map((b) => ({ ...b, owesCents: Math.abs(b.netCents) }))
    .sort((a, b) => b.owesCents - a.owesCents);

  const creditors = balances
    .filter((b) => b.netCents > 0)
    .map((b) => ({ ...b, isOwedCents: b.netCents }))
    .sort((a, b) => b.isOwedCents - a.isOwedCents);

  const settlements: SplitSettlement[] = [];

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx]!;
    const creditor = creditors[cIdx]!;

    const payment = Math.min(debtor.owesCents, creditor.isOwedCents);

    if (payment > 0) {
      settlements.push({
        fromParticipantId: debtor.id,
        fromParticipantName: debtor.name,
        toParticipantId: creditor.id,
        toParticipantName: creditor.name,
        amountCents: payment
      });

      debtor.owesCents -= payment;
      creditor.isOwedCents -= payment;
    }

    if (debtor.owesCents === 0) dIdx++;
    if (creditor.isOwedCents === 0) cIdx++;
  }

  return settlements;
}

/**
 * Computes monthly financial aggregate report from transaction list
 */
export function computeMonthlyBudgetSummary(
  monthYear: string,
  transactions: readonly Transaction[]
): MonthlyBudgetSummary {
  let totalIncomeCents = 0;
  let totalExpenseCents = 0;
  let mealVouchersUsedCount = 0;
  let totalVoucherSavingsCents = 0;

  const categoryBreakdownCents: Record<TransactionCategory, number> = {
    HOUSING_RENT: 0,
    FOOD_AND_BONI: 0,
    UTILITIES: 0,
    TRANSPORT_BUS_PASS: 0,
    BOOKS_AND_STUDY: 0,
    HEALTH_AND_FITNESS: 0,
    LEISURE_AND_SOCIAL: 0,
    STUDENT_WORK_INCOME: 0,
    SCHOLARSHIP: 0,
    PARENTAL_SUPPORT: 0,
    MISCELLANEOUS: 0
  };

  for (const t of transactions) {
    if (t.type === "INCOME") {
      totalIncomeCents += t.amountCents;
    } else {
      totalExpenseCents += t.amountCents;
      if (categoryBreakdownCents[t.category] !== undefined) {
        categoryBreakdownCents[t.category] += t.amountCents;
      }
    }

    if (t.isMealVoucherUsed) {
      mealVouchersUsedCount += 1;
      totalVoucherSavingsCents += t.voucherSubsidyCents;
    }
  }

  const netSavingsCents = totalIncomeCents - totalExpenseCents;
  const savingsRatePercentage =
    totalIncomeCents > 0 ? Number(((netSavingsCents / totalIncomeCents) * 100).toFixed(1)) : 0;

  return {
    monthYear,
    totalIncomeCents,
    totalExpenseCents,
    netSavingsCents,
    savingsRatePercentage,
    mealVouchersUsedCount,
    totalVoucherSavingsCents,
    categoryBreakdownCents
  };
}
