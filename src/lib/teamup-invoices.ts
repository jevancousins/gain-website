import { teamupGet } from "@/lib/teamup";

type Invoice = {
  id: number | string;
  status: string;
  due_date: string | null;
  created_at: string;
  is_credit_note: boolean;
  total_amount_due: { decimal: number; iso_currency_code: string };
  payer: number | string;
};

type InvoiceListPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Invoice[];
};

export type MonthlyRevenue = {
  month: string; // YYYY-MM
  paidGross: number;
  refunds: number;
  net: number;
  invoiceCount: number;
};

/**
 * Walk all paid invoices (and credit notes) and return per-month revenue
 * totals in the provider's home currency.
 */
export async function fetchMonthlyRevenue(maxPages = 20): Promise<MonthlyRevenue[]> {
  const buckets = new Map<string, { paid: number; refunds: number; count: number }>();

  // Paid invoices contribute to gross revenue.
  await walkInvoices("paid", maxPages, (inv) => {
    const month = inv.created_at.slice(0, 7); // YYYY-MM
    const amount = Number(inv.total_amount_due.decimal) || 0;
    const b = buckets.get(month) ?? { paid: 0, refunds: 0, count: 0 };
    if (inv.is_credit_note) b.refunds += amount;
    else b.paid += amount;
    b.count += 1;
    buckets.set(month, b);
  });

  // Credit notes can also be issued separately; pick those up if they aren't
  // already in the paid set.
  await walkInvoices("voided", maxPages, () => {
    // Voided invoices shouldn't contribute to revenue; ignored intentionally.
  }).catch(() => undefined);

  return Array.from(buckets.entries())
    .map(([month, b]) => ({
      month,
      paidGross: round2(b.paid),
      refunds: round2(b.refunds),
      net: round2(b.paid - b.refunds),
      invoiceCount: b.count,
    }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));
}

async function walkInvoices(
  status: string,
  maxPages: number,
  onRow: (inv: Invoice) => void,
): Promise<void> {
  let path: string | null = "/invoices";
  let pages = 0;
  while (path && pages < maxPages) {
    const page: InvoiceListPage = await teamupGet<InvoiceListPage>(
      path,
      pages === 0 ? { query: { limit: 100, status } } : {},
    );
    for (const inv of page.results) onRow(inv);
    if (!page.next) break;
    try {
      const parsed: URL = new URL(page.next);
      path = parsed.pathname.replace(/^\/api\/v2/, "") + parsed.search;
    } catch {
      break;
    }
    pages += 1;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
