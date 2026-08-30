import {
  listLeadMarketingContacts,
  listMemberMarketingContacts,
  mergeMarketingContacts,
} from "@/lib/notion-marketing";
import { upsertResendMarketingContact } from "@/lib/resend-contacts";
import { wantsDryRun } from "@/lib/cron-dry-run";

type SyncScope = "all" | "members" | "leads";

function gate(request: Request): boolean {
  const expected = [process.env.CRON_SECRET, process.env.TEAMUP_DIAG_KEY].filter(
    (v): v is string => Boolean(v),
  );
  if (expected.length === 0) return false;

  const url = new URL(request.url);
  const headerAuth = request.headers.get("authorization") ?? "";
  const bearer = headerAuth.startsWith("Bearer ") ? headerAuth.slice(7) : "";
  const provided = url.searchParams.get("key") ?? bearer;
  return expected.includes(provided);
}

async function collectContacts(scope: SyncScope) {
  const [members, leads] = await Promise.all([
    scope === "all" || scope === "members" ? listMemberMarketingContacts() : Promise.resolve([]),
    scope === "all" || scope === "leads" ? listLeadMarketingContacts() : Promise.resolve([]),
  ]);

  return {
    members,
    leads,
    contacts: mergeMarketingContacts([...members, ...leads]),
  };
}

export async function GET(request: Request) {
  if (!gate(request)) {
    return Response.json({ error: "not found" }, { status: 404 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "RESEND_API_KEY not set" }, { status: 500 });
  }

  const url = new URL(request.url);
  const dryRun = wantsDryRun(url);
  const scopeParam = url.searchParams.get("scope") ?? "all";
  const scope: SyncScope = ["all", "members", "leads"].includes(scopeParam)
    ? (scopeParam as SyncScope)
    : "all";
  const startedAt = Date.now();

  try {
    const { members, leads, contacts } = await collectContacts(scope);
    const subscribed = contacts.filter((contact) => !contact.unsubscribed).length;

    if (dryRun) {
      return Response.json({
        ok: true,
        dryRun: true,
        durationMs: Date.now() - startedAt,
        scope,
        sourceRows: {
          members: members.length,
          leads: leads.length,
        },
        contacts: {
          total: contacts.length,
          subscribed,
          unsubscribed: contacts.length - subscribed,
        },
      });
    }

    const result = {
      total: contacts.length,
      created: 0,
      updated: 0,
      unchanged: 0,
      errors: [] as Array<{ email: string; reason: string }>,
    };

    for (const contact of contacts) {
      try {
        const status = await upsertResendMarketingContact(apiKey, contact);
        result[status] += 1;
      } catch (err) {
        result.errors.push({ email: contact.email, reason: (err as Error).message });
      }
    }

    return Response.json({
      ok: result.errors.length === 0,
      durationMs: Date.now() - startedAt,
      scope,
      sourceRows: {
        members: members.length,
        leads: leads.length,
      },
      contacts: {
        total: contacts.length,
        subscribed,
        unsubscribed: contacts.length - subscribed,
      },
      result,
    }, { status: result.errors.length === 0 ? 200 : 207 });
  } catch (err) {
    return Response.json(
      { ok: false, durationMs: Date.now() - startedAt, error: (err as Error).message },
      { status: 502 },
    );
  }
}
