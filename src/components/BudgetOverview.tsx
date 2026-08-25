import React from "react";
import { type MonthlyBudgetSummary } from "../types/finance";
import { formatEuroFromCents, formatCategoryLabel } from "../utils/currencyFormatters";

export interface BudgetOverviewProps {
  summary: MonthlyBudgetSummary;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({ summary }) => {
  const isPositive = summary.netSavingsCents >= 0;

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Monthly Financial Health</h2>
          <p className="text-xs text-slate-500 font-mono">Period: {summary.monthYear}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold ${isPositive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
          Savings Rate: {summary.savingsRatePercentage}%
        </div>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-medium">Total Income</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatEuroFromCents(summary.totalIncomeCents)}
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="text-xs text-slate-500 font-medium">Total Expenses</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatEuroFromCents(summary.totalExpenseCents)}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Meal Voucher Savings</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatEuroFromCents(summary.totalVoucherSavingsCents)}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">{summary.mealVouchersUsedCount} meals subsidized</div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="pt-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Expenses by Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(summary.categoryBreakdownCents).map(([cat, cents]) => {
            if (cents === 0) return null;
            return (
              <div key={cat} className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 truncate">{formatCategoryLabel(cat)}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white ml-2">
                  {formatEuroFromCents(cents)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
