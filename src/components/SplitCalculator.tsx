import React, { useState } from "react";
import { type SplitParticipant, type BillSplitResult } from "../types/finance";
import { calculateDeterministicSplit, eurosToCents } from "../services/financeEngine";
import { formatEuroFromCents } from "../utils/currencyFormatters";

export const SplitCalculator: React.FC = () => {
  const [totalEuros, setTotalEuros] = useState<string>("30.00");
  const [participants] = useState<SplitParticipant[]>([
    { id: "p1", name: "Žan (Me)", weight: 1, hasPaidCents: 3000 },
    { id: "p2", name: "Luka", weight: 1, hasPaidCents: 0 },
    { id: "p3", name: "Ana", weight: 1, hasPaidCents: 0 }
  ]);

  const splitResult: BillSplitResult | null = React.useMemo(() => {
    const totalCents = eurosToCents(parseFloat(totalEuros) || 0);
    if (totalCents <= 0 || participants.length === 0) return null;
    return calculateDeterministicSplit(totalCents, participants);
  }, [totalEuros, participants]);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Deterministic Split Calculator</h2>
          <p className="text-xs text-slate-500">Zero-loss exact cent distribution engine</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="bill-total-input" className="text-xs font-semibold text-slate-500">Total Bill (€):</label>
          <input
            id="bill-total-input"
            type="number"
            step="0.01"
            value={totalEuros}
            onChange={(e) => setTotalEuros(e.target.value)}
            className="w-24 px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono font-bold"
          />
        </div>
      </div>

      {splitResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {participants.map((p) => {
              const share = splitResult.participantShares[p.id] ?? 0;
              return (
                <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{p.name}</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    {formatEuroFromCents(share)}
                  </div>
                  <div className="text-[11px] text-slate-400">Paid: {formatEuroFromCents(p.hasPaidCents)}</div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Optimal Settlements</h3>
            {splitResult.settlements.length === 0 ? (
              <p className="text-xs text-emerald-600 font-medium">All accounts are settled balanced.</p>
            ) : (
              <div className="space-y-1.5">
                {splitResult.settlements.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs p-2 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg">
                    <span>
                      <strong className="text-slate-800 dark:text-slate-200">{s.fromParticipantName}</strong> owes{" "}
                      <strong className="text-slate-800 dark:text-slate-200">{s.toParticipantName}</strong>
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {formatEuroFromCents(s.amountCents)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
