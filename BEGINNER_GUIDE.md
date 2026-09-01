# 🎓 Študentski Denar — Beginner's Learning Guide

## What This Project Does
**studentski-denar** is a student financial management, exact-split calculation engine, and meal voucher tracking platform built with TypeScript, integer-cent precision mathematics, and Zod validation.

---

## 🗺️ Architecture Map

```
FINANCIAL DOMAIN & DATA MODELS
  │  (src/types/finance.ts - Transactions, Ingestion Schemas, Split Participants)
  ▼
INTEGER-CENT CALCULATION ENGINE
  │  ├── Cents / Euros Precision Converter (src/services/financeEngine.ts)
  │  ├── Zero-Loss Deterministic Split Calculator
  │  └── Monthly Budget & Expense Category Aggregator
  ▼
UI COMPONENTS & FINANCIAL CALCULATORS
  │  ├── SplitCalculator (src/components/SplitCalculator.tsx)
  │  ├── BudgetSummaryCard (src/components/BudgetSummaryCard.tsx)
  │  └── useFinance (src/hooks/useFinance.ts)
  ▼
UNIT TEST & INVARIANT SUITE
     (tests/financeEngine.test.ts - Vitest Mathematical Precision & Zero-Loss Split Invariants)
```

---

## 🎯 Core Files to Study First (Recommended Learning Order)

1. [`src/services/financeEngine.ts`](file:///C:/Users/tinif/repos/studentski-denar/src/services/financeEngine.ts)
   - **Why study first**: Teaches integer arithmetic to prevent floating-point rounding errors in currency and bill-splitting algorithms.
2. [`src/types/finance.ts`](file:///C:/Users/tinif/repos/studentski-denar/src/types/finance.ts)
   - **Why study next**: Shows how Zod defines strict transaction and budget categories with positive integer cent bounds.
3. [`tests/financeEngine.test.ts`](file:///C:/Users/tinif/repos/studentski-denar/tests/financeEngine.test.ts)
   - **Why study third**: Demonstrates comprehensive test coverage for zero-loss financial split engines.

---

## 🛠️ How to Run & Verify

```bash
npm test
npm run typecheck
npm run build
```
