import { centsToEuros } from "../services/financeEngine";

/**
 * Format integer cents into a localized Euro currency string (e.g. "12,50 €")
 */
export function formatEuroFromCents(cents: number, locale: string = "sl-SI"): string {
  const euros = centsToEuros(cents);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(euros);
}

/**
 * Formats a transaction category into a clean human-readable label
 */
export function formatCategoryLabel(category: string): string {
  return category
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
