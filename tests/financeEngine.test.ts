import { describe, it, expect } from "vitest";
import {
  eurosToCents,
  centsToEuros,
  calculateDeterministicSplit,
  computeMonthlyBudgetSummary
} from "../src/services/financeEngine";
import {
  type Transaction,
  type SplitParticipant,
  TransactionSchema
} from "../src/types/finance";

describe("Studentski Denar Financial Calculation Engine", () => {
  describe("Cents & Euro Conversion Precision", () => {
    it("should accurately convert decimal Euro to integer cents", () => {
      expect(eurosToCents(12.34)).toBe(1234);
      expect(eurosToCents(0.01)).toBe(1);
      expect(eurosToCents(100)).toBe(10000);
      expect(eurosToCents(0)).toBe(0);
    });

    it("should accurately convert integer cents to decimal Euro", () => {
      expect(centsToEuros(1234)).toBe(12.34);
      expect(centsToEuros(1)).toBe(0.01);
      expect(centsToEuros(10000)).toBe(100);
    });
  });

  describe("Deterministic Bill Splitting & Zero Remainder Conservation", () => {
    it("should split €10.00 (1000 cents) among 3 equal participants with sum == 1000", () => {
      const participants: SplitParticipant[] = [
        { id: "p1", name: "Ana", weight: 1, hasPaidCents: 1000 },
        { id: "p2", name: "Borut", weight: 1, hasPaidCents: 0 },
        { id: "p3", name: "Cilka", weight: 1, hasPaidCents: 0 }
      ];

      const result = calculateDeterministicSplit(1000, participants);

      const shares = Object.values(result.participantShares);
      const totalAllocated = shares.reduce((a, b) => a + b, 0);

      expect(totalAllocated).toBe(1000);
      // One gets 334, two get 333
      expect(shares).toContain(334);
      expect(shares.filter((s) => s === 333).length).toBe(2);
      expect(result.roundingRemainderCents).toBe(0);
    });

    it("should split €100.00 (10000 cents) among 7 participants with zero loss", () => {
      const participants: SplitParticipant[] = Array.from({ length: 7 }, (_, i) => ({
        id: `user-${i}`,
        name: `Student ${i}`,
        weight: 1,
        hasPaidCents: i === 0 ? 10000 : 0
      }));

      const result = calculateDeterministicSplit(10000, participants);
      const shares = Object.values(result.participantShares);
      const sum = shares.reduce((a, b) => a + b, 0);

      expect(sum).toBe(10000);
    });

    it("should handle weighted splits proportionally (e.g. 2x share)", () => {
      const participants: SplitParticipant[] = [
        { id: "p1", name: "Heavy Spender", weight: 2, hasPaidCents: 3000 },
        { id: "p2", name: "Normal Spender", weight: 1, hasPaidCents: 0 }
      ];

      const result = calculateDeterministicSplit(3000, participants);
      expect(result.participantShares["p1"]).toBe(2000);
      expect(result.participantShares["p2"]).toBe(1000);
    });

    it("should generate clean peer settlements", () => {
      const participants: SplitParticipant[] = [
        { id: "p1", name: "Ana", weight: 1, hasPaidCents: 3000 },
        { id: "p2", name: "Borut", weight: 1, hasPaidCents: 0 },
        { id: "p3", name: "Cilka", weight: 1, hasPaidCents: 0 }
      ];

      const result = calculateDeterministicSplit(3000, participants);
      expect(result.settlements.length).toBe(2);
      expect(result.settlements.some((s) => s.fromParticipantId === "p2" && s.toParticipantId === "p1" && s.amountCents === 1000)).toBe(true);
      expect(result.settlements.some((s) => s.fromParticipantId === "p3" && s.toParticipantId === "p1" && s.amountCents === 1000)).toBe(true);
    });
  });

  describe("Monthly Budget Summary & Meal Voucher Subsidies", () => {
    it("should aggregate student transactions, savings rates, and meal voucher subsidies", () => {
      const mockTransactions: Transaction[] = [
        {
          id: "00000000-0000-0000-0000-000000000001",
          title: "Student Work - Coding",
          amountCents: 80000, // 800.00 EUR
          type: "INCOME",
          category: "STUDENT_WORK_INCOME",
          timestamp: 1700000000000,
          isMealVoucherUsed: false,
          voucherSubsidyCents: 0
        },
        {
          id: "00000000-0000-0000-0000-000000000002",
          title: "Dorm Rent",
          amountCents: 20000, // 200.00 EUR
          type: "EXPENSE",
          category: "HOUSING_RENT",
          timestamp: 1700000001000,
          isMealVoucherUsed: false,
          voucherSubsidyCents: 0
        },
        {
          id: "00000000-0000-0000-0000-000000000003",
          title: "Lunch with Student Bon",
          amountCents: 380, // Co-pay 3.80 EUR
          type: "EXPENSE",
          category: "FOOD_AND_BONI",
          timestamp: 1700000002000,
          isMealVoucherUsed: true,
          voucherSubsidyCents: 402 // 4.02 EUR state subsidy
        }
      ];

      const summary = computeMonthlyBudgetSummary("2026-10", mockTransactions);

      expect(summary.totalIncomeCents).toBe(80000);
      expect(summary.totalExpenseCents).toBe(20380);
      expect(summary.netSavingsCents).toBe(59620);
      expect(summary.savingsRatePercentage).toBe(74.5);
      expect(summary.mealVouchersUsedCount).toBe(1);
      expect(summary.totalVoucherSavingsCents).toBe(402);
      expect(summary.categoryBreakdownCents.HOUSING_RENT).toBe(20000);
      expect(summary.categoryBreakdownCents.FOOD_AND_BONI).toBe(380);
    });
  });

  describe("Zod Transaction Schema Validation", () => {
    it("should validate a compliant transaction", () => {
      const valid = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Bus Pass",
        amountCents: 2500,
        type: "EXPENSE",
        category: "TRANSPORT_BUS_PASS",
        timestamp: 1700000000000,
        isMealVoucherUsed: false,
        voucherSubsidyCents: 0
      };
      expect(() => TransactionSchema.parse(valid)).not.toThrow();
    });

    it("should reject negative transaction amount", () => {
      const invalid = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: "Invalid",
        amountCents: -500,
        type: "EXPENSE",
        category: "LEISURE_AND_SOCIAL",
        timestamp: 1700000000000
      };
      expect(() => TransactionSchema.parse(invalid)).toThrow();
    });
  });
});
