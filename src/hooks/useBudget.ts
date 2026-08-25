import { useState, useCallback, useMemo } from "react";
import { type Transaction } from "../types/finance";
import { computeMonthlyBudgetSummary } from "../services/financeEngine";

export function useBudget(initialTransactions: Transaction[] = []) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = useCallback((transaction: Transaction) => {
    setTransactions((prev) => [transaction, ...prev]);
  }, []);

  const removeTransaction = useCallback((transactionId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== transactionId));
  }, []);

  const currentMonthYear = useMemo(() => {
    const d = new Date();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    return `${d.getFullYear()}-${month}`;
  }, []);

  const summary = useMemo(() => {
    return computeMonthlyBudgetSummary(currentMonthYear, transactions);
  }, [currentMonthYear, transactions]);

  return {
    transactions,
    summary,
    addTransaction,
    removeTransaction
  };
}
