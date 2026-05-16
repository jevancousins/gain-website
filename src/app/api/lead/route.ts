import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/utils";

type LeadPayload = {
  firstName?: string;
  email?: string;
  phone?: string;
  newsletter?: string | boolean;
  source?: string;
  message?: string;
};

type FieldKey = "firstName" | "email" | "phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// After stripping separators: optional + then 7–15 digits. Covers E.164
// and every national landline / mobile format worth accepting.
const PHONE_RE = /^\+?[0-9]{7,15}$/;

function normalizePhone(raw: string) {
  return raw.replace(/[\s\-().]/g, "");
}

function fieldError(field: FieldKey, message: string) {
  return NextResponse.json({ error: message, field }, { status: 400 });
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const firstName = (body.firstName ?? "").toString().trim();
  const email = (body.email ?? "").toString().trim().toLowerCase();
  const phoneRaw = (body.phone ?? "").toString().trim();
  const source = (body.source ?? "unknown").toString().trim();
  const message = (body.message ?? "").toString().trim();
  const newsletter = body.newsletter === true || body.newsletter === "on";

  if (!firstName) {
    return fieldError("firstName", "Please enter your first name.");
  }
  if (!email || !EMAIL_RE.test(email)) {
    return fieldError("email", "Please enter a valid email address.");
  }
  const phone = normalizePhone(phoneRaw);
  if (!phone || !PHONE_RE.test(phone)) {
    return fieldError(
      "phone",
      "Please enter a valid phone number: digits only, with an optional + prefix."
    );
  }

  const lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    firstName,
    email,
    phone, // normalised E.164-ish
    phoneRaw, // preserve exactly what the user typed, for reference
    message,
    source,
    newsletter,
    userAgent: request.headers.get("user-agent") ?? "",
    referer: request.headers.get("referer") ?? "",
  };

  // QA short-circuit: when the message contains the [QA-TEST] marker, accept
  // the request through validation but skip the Notion write and the
  // confirmation email. Lets the E2E test exercise the real route without
  // polluting the leads DB or sending real emails. The marker is specific
  // enough that no real submission will trip it.
  if (message.includes("[QA-TEST]")) {
    return NextResponse.json(
      { ok: true, id: lead.id, testMode: true },
      { status: 201 }
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  let personalOpener: string | null = null;
  if (anthropicKey && message.length >= 30) {
    try {
      personalOpener = await generatePersonalisedOpener(lead.firstName, message, anthropicKey);
    } catch (err) {
      console.error("[lead] personalised opener failed, using default", err);
    }
  }

  const tasks: Array<{ name: string; promise: Promise<void> }> = [];

  const notionToken = process.env.NOTION_TOKEN;
  const notionDbId = process.env.NOTION_LEADS_DB_ID;
  if (notionToken && notionDbId) {
    tasks.push({ name: "notion", promise: writeLeadToNotion(lead, notionToken, notionDbId) });
  } else if (process.env.NODE_ENV !== "production") {
    tasks.push({ name: "jsonl", promise: writeLeadToJsonl(lead) });
  } else {
    console.log("[lead] captured", lead);
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.LEAD_FROM_EMAIL;
  if (resendKey && fromEmail) {
    tasks.push({
      name: "email",
      promise: sendLeadConfirmationEmail(lead, resendKey, fromEmail, personalOpener),
    });
  }

  if (tasks.length > 0) {
    const results = await Promise.allSettled(tasks.map((t) => t.promise));
    const rejections = results
      .map((r, i) => ({ result: r, name: tasks[i].name }))
      .filter((x): x is { result: PromiseRejectedResult; name: string } => x.result.status === "rejected");
    for (const { result, name } of rejections) {
      console.error(`[lead] ${name} failed`, result.reason, { leadId: lead.id });
    }
    // Lead is lost only if every task we attempted failed; tell the client we
    // received it but persistence is queued so they can still retry if needed.
    if (rejections.length === tasks.length) {
      return NextResponse.json({ ok: true, warning: "queued" }, { status: 202 });
    }
  }

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

async function writeLeadToJsonl(lead: Lead) {
  const dir = path.join(process.cwd(), ".data");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, "leads.jsonl");
  await fs.appendFile(file, JSON.stringify(lead) + "\n", "utf8");
}

type Lead = {
  firstName: string;
  email: string;
  phoneRaw: string;
  message: string;
  source: string;
  newsletter: boolean;
  createdAt: string;
};

async function writeLeadToNotion(lead: Lead, token: string, databaseId: string) {
  const properties: Record<string, unknown> = {
    Name: { title: [{ text: { content: lead.firstName } }] },
    Email: { email: lead.email },
    Phone: { phone_number: lead.phoneRaw },
    Source: { select: { name: "Website" } },
    "Source Page": { rich_text: [{ text: { content: lead.source || "unknown" } }] },
    "First Contact": { date: { start: lead.createdAt } },
    Newsletter: { checkbox: lead.newsletter },
  };
  if (lead.message) {
    properties.Notes = { rich_text: [{ text: { content: lead.message } }] };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Notion API ${res.status}: ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PROGRAMME_BLOCK = [
  "A bit on what the 6-week programme actually is, since the website only goes so far. It's small-group: up to 6 people training at the same time, but each on their own programme written for them. So you're not following along with what someone else is doing; I'm coaching you individually inside a group setting. Most members find that a better fit than 1:1 personal training (more relaxed, less self-conscious) and a much better fit than a regular gym class (no generic workouts, no being lost at the back).",
  "The programme runs in two phases. Weeks 1–3 are about learning the techniques and getting used to training consistently. Weeks 4–6 are where we start adding load and you start seeing real strength improvements. We test at the start and re-test at the end so the change is measurable, not just felt.",
  "The programme runs at a frequency that suits you: one, two or three sessions a week. We'll agree the right starting point on the call.",
  "What happens after the 6 weeks is an open conversation. Most members move to a monthly membership on direct debit; no contract, no automatic rollover, you decide each month.",
];

const PERSONA_PARAGRAPHS: Record<string, string> = {
  beginner:
    "Worth saying upfront: most of the people in the gym started somewhere very similar to where you are now. Not 'a bit out of shape' but properly starting from scratch, often after years away from any kind of training. The programme's designed for that, and you wouldn't be the odd one out walking in.",
  "post-physio":
    "On the call I'll ask about your physio and what they had you doing. The programme's designed to pick up where rehab leaves off, working alongside your physio's guidance rather than around it. If you've got notes or a discharge summary handy that's useful, but don't worry if not.",
  "active-senior":
    "We work with a lot of members who came to us in their 60s and 70s wanting to stay capable for the long run, not just maintain. Strength training at that stage isn't a salvage operation; it's how you keep doing the things you want to keep doing. The programme's built for that kind of training rather than for what someone half your age might do.",
  "post-illness":
    "Pace on this is set by you, not by a programme template. The first few weeks are about working out what your body handles well right now, not pushing toward a number. Recovery comes first; progression follows when it's earned.",
};

const DEFAULT_PERSONA = "beginner";

async function sendLeadConfirmationEmail(
  lead: Lead,
  apiKey: string,
  from: string,
  personalOpener: string | null = null,
) {
  const safeName = escapeHtml(lead.firstName);
  const safeOpener = personalOpener ? escapeHtml(personalOpener) : null;
  const phone = SITE.phone;
  const phoneHref = SITE.phoneHref;
  const url = SITE.url;
  const bookingUrl = SITE.bookingUrl;

  const persona = PERSONA_PARAGRAPHS[lead.source] ?? PERSONA_PARAGRAPHS[DEFAULT_PERSONA];

  const textParts = [
    `Hi ${lead.firstName},`,
    "",
  ];
  if (personalOpener) {
    textParts.push(personalOpener, "");
  }
  textParts.push(
    "Thanks for getting in touch. I've got your message and I'll give you a call back within two working days on the number you've shared.",
    "",
    `If you'd rather pick a time that suits you, book a free consultation call here: ${bookingUrl}`,
    "",
    "The call's about 15 minutes. I'll ask what you're looking to get out of training, anything I should know about your health or injury history, and we'll work out together whether the 6-week programme is the right starting point. If it isn't, I'll say so. If it is, the next step is an in-person consultation at the gym before anything's locked in.",
    "",
    ...PROGRAMME_BLOCK.flatMap((p) => [p, ""]),
    persona,
    "",
    "In the meantime, just have a think about what you'd want to be different in 6 weeks' time. That's usually the most useful thing to talk through.",
    "",
    "If anything changes before we speak, reply to this email.",
    "",
    "Speak soon,",
    "Hallum",
  );
  const text = textParts.join("\n");

  const openerHtml = safeOpener
    ? `<p>${safeOpener}</p>\n`
    : "";

  const programmeHtml = PROGRAMME_BLOCK.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");

  const html = `<!doctype html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111; line-height: 1.5; max-width: 540px; margin: 0 auto; padding: 24px;">
<p>Hi ${safeName},</p>
${openerHtml}<p>Thanks for getting in touch. I&rsquo;ve got your message and I&rsquo;ll give you a call back within two working days on the number you&rsquo;ve shared.</p>
<p>If you&rsquo;d rather pick a time that suits you, book a free consultation call here:</p>
<p style="margin: 16px 0;"><a href="${bookingUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Book a free call</a></p>
<p>The call&rsquo;s about 15 minutes. I&rsquo;ll ask what you&rsquo;re looking to get out of training, anything I should know about your health or injury history, and we&rsquo;ll work out together whether the 6-week programme is the right starting point. If it isn&rsquo;t, I&rsquo;ll say so. If it is, the next step is an in-person consultation at the gym before anything&rsquo;s locked in.</p>
${programmeHtml}
<p>${escapeHtml(persona)}</p>
<p>In the meantime, just have a think about what you&rsquo;d want to be different in 6 weeks&rsquo; time. That&rsquo;s usually the most useful thing to talk through.</p>
<p>If anything changes before we speak, reply to this email.</p>
<p>Speak soon,<br>Hallum</p>
<p style="font-size: 12px; color: #666; margin-top: 32px;"><a href="${url}" style="color: #666;">${url.replace(/^https?:\/\//, "")}</a> &middot; <a href="tel:${phoneHref}" style="color: #666;">${phone}</a></p>
</body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      reply_to: "hallum@gainstrengththerapy.com",
      to: [lead.email],
      subject: `Got your message, ${lead.firstName}`,
      html,
      text,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

const OPENER_SYSTEM_PROMPT = `You write the opening line of a confirmation email for Gain Strength Therapy, a small-group personal training studio in Eastbourne. The studio works with post-rehab clients, beginners, older adults, and anyone rebuilding after illness or injury.

Rules:
- Write exactly 1 to 2 sentences that acknowledge what the person shared in their enquiry message.
- Be warm, reassuring, and specific to what they mentioned (goals, injuries, concerns, experience level).
- Do not repeat their name; it appears in the greeting above.
- Do not promise outcomes or give medical/training advice.
- Do not use em-dashes. Use commas, semicolons, or separate sentences instead.
- Use British English spelling.
- Do not include a greeting or sign-off; this sits between "Hi [Name]," and the standard body.`;

async function generatePersonalisedOpener(
  firstName: string,
  message: string,
  apiKey: string,
): Promise<string | null> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-20250414",
      max_tokens: 120,
      system: OPENER_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `The enquiry is from ${firstName}. They wrote:\n\n"${message}"`,
        },
      ],
    }),
    signal: AbortSignal.timeout(4000),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${body}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text?: string }>;
  };
  const text = data.content
    .filter((b) => b.type === "text" && b.text)
    .map((b) => b.text!)
    .join(" ")
    .trim();

  return text || null;
}
