import { teamupGet } from "@/lib/teamup";

export type TeamupCustomer = {
  id: number;
  email: string | null;
  first_name: string;
  last_name: string;
  status: string | null;
  is_lead: boolean;
  lead_source: string | null;
  created_at: string;
};

type CustomerListPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: TeamupCustomer[];
};

export async function listAllCustomers(): Promise<TeamupCustomer[]> {
  const out: TeamupCustomer[] = [];
  let path: string | null = "/customers";
  const pageSize = 100;

  while (path) {
    const page: CustomerListPage = await teamupGet<CustomerListPage>(
      path,
      path === "/customers" ? { query: { limit: pageSize } } : {},
    );
    out.push(...page.results);
    if (!page.next) break;
    // `next` is a full URL; convert to path relative to the API base.
    try {
      const parsed: URL = new URL(page.next);
      path = parsed.pathname.replace(/^\/api\/v2/, "") + parsed.search;
    } catch {
      break;
    }
  }

  return out;
}
