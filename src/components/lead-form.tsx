"use client";

import { useRef, useState } from "react";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, SITE } from "@/lib/utils";
import { track } from "@/lib/analytics";

type FieldKey = "firstName" | "email" | "phone";
type FieldErrors = Partial<Record<FieldKey, string>>;

// One-tap fix for UNAMBIGUOUS address typos only: a misspelled provider name,
// or the impossible ".con" TLD. We deliberately do NOT guess ambiguous
// truncations like "hotmail.co" or "yahoo.co" — for UK users those are as
// likely to mean ".co.uk" as ".com", and e.g. hotmail.co.uk is a completely
// separate inbox from hotmail.com. Genuinely undeliverable domains are caught
// server-side by the MX-record check in /api/lead, which flags them for Hallum
// rather than silently guessing a (possibly wrong) correction.
const EMAIL_DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlook.con": "outlook.com",
  "yahoo.con": "yahoo.com",
  "iclould.com": "icloud.com",
};

function suggestEmail(email: string): string | null {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return null;
  const fixed = EMAIL_DOMAIN_TYPOS[trimmed.slice(at + 1)];
  return fixed ? trimmed.slice(0, at + 1) + fixed : null;
}

export function LeadForm({
  source = "landing",
  className,
  eyebrow,
  title,
  body,
  submitLabel,
}: {
  source?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  submitLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSuggestion, setEmailSuggestion] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setFieldErrors({});
    setFormError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    // Per-ad attribution: read the ad slug from the landing-page URL (?ad=<id>)
    // at submit time so each enquiry is tagged to the exact ad version that
    // drove it. Persona is deliberately not in the URL: it is a property of the
    // ad in the Ads DB, resolved by joining on the ad slug at analysis time.
    // Read here (not via useSearchParams) to avoid a Suspense boundary on these
    // statically-rendered pages.
    const ad = new URLSearchParams(window.location.search).get("ad") ?? undefined;

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source, ad }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null) as
          | { error?: string; field?: FieldKey }
          | null;
        if (body?.field && body.error) {
          setFieldErrors({ [body.field]: body.error });
          // Focus the first field with an error so keyboard + screen-reader users
          // are taken to it immediately.
          const el = form.querySelector<HTMLInputElement>(`[name="${body.field}"]`);
          el?.focus();
        } else {
          setFormError(body?.error ?? "Something went wrong. Please try again, or call us.");
        }
        setState("idle");
        return;
      }

      setState("success");
      // Primary conversion. Fired on success (not the click) so it reflects
      // a real enquiry; PostHog already auto-captures the UTM/referrer.
      track("lead_submitted", { source });
      form.reset();
      setEmailSuggestion(null);
    } catch {
      setFormError("Network issue. Please try again, or call us on 01323 370022.");
      setState("idle");
    }
  }

  // Clear field errors as the user edits — no one likes a stale error.
  function clearFieldError(field: FieldKey) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-2 text-paper/60";
  const inputCls = (err?: string) =>
    cn(
      "w-full rounded-sm px-4 py-3.5 text-base outline-none transition-colors border bg-ink text-paper placeholder:text-paper/55",
      err
        ? "border-flame focus:border-flame ring-1 ring-flame/60"
        : "border-paper/40 focus:border-flame"
    );

  if (state === "success") {
    return (
      <div className={cn("relative border p-7 bg-ink-soft border-flame/40", className)}>
        <div className="flex gap-4 items-start">
          <CheckCircle2 className="text-flame shrink-0 mt-1" size={22} />
          <div>
            <h2 className="display-tight text-2xl text-paper">Thanks, we&rsquo;ve got it.</h2>
            <p className="mt-2 text-paper/70 leading-relaxed text-base">
              We&rsquo;ve emailed you a link to book your free consultation, by
              phone or in person. Want to book now instead? Otherwise
              we&rsquo;ll ring you within two working days.
            </p>
            <a
              href={SITE.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("booking_clicked")}
              className="mt-5 inline-flex items-center gap-2 rounded-sm bg-flame text-ink px-5 py-3 text-[0.78rem] font-bold uppercase tracking-[0.2em] hover:bg-flame-deep transition-colors"
            >
              Book a time now <ArrowRight size={15} strokeWidth={2.4} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn("relative p-6 md:p-7 border space-y-5 bg-ink-soft border-ink-line text-paper", className)}
    >
      <div>
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-flame">
          {eyebrow ?? "Step 01 · Free consultation"}
        </p>
        <h2 className="display-tight mt-3 text-[1.7rem] md:text-[1.95rem] leading-[1.05] text-paper">
          {title ?? "Start with a free consultation."}
        </h2>
        <p className="mt-3 text-base text-paper/65 leading-relaxed">
          {body ??
            "Leave your details and we'll email you a link to book your free consultation, by phone or in person. No more than 30 minutes, no pressure."}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelCls}>First name</label>
          <input
            id="firstName"
            name="firstName"
            required
            autoComplete="given-name"
            className={inputCls(fieldErrors.firstName)}
            placeholder="Jane"
            aria-invalid={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
            onChange={() => clearFieldError("firstName")}
          />
          <FieldMessage id="firstName-error" msg={fieldErrors.firstName} />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            className={inputCls(fieldErrors.phone)}
            placeholder="Mobile or landline"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
            onChange={() => clearFieldError("phone")}
          />
          <FieldMessage id="phone-error" msg={fieldErrors.phone} />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          ref={emailRef}
          className={inputCls(fieldErrors.email)}
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={() => {
            clearFieldError("email");
            setEmailSuggestion(null);
          }}
          onBlur={(e) => setEmailSuggestion(suggestEmail(e.target.value))}
        />
        <FieldMessage id="email-error" msg={fieldErrors.email} />
        {emailSuggestion && (
          <p className="mt-2 text-sm text-paper/70">
            Did you mean{" "}
            <button
              type="button"
              className="font-semibold text-flame underline underline-offset-2"
              onClick={() => {
                if (emailRef.current) emailRef.current.value = emailSuggestion;
                setEmailSuggestion(null);
              }}
            >
              {emailSuggestion}
            </button>
            ?
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          What&rsquo;s on your mind?{" "}
          <span className="text-paper/55 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className={cn(inputCls(), "resize-none")}
          placeholder="Goals, any injuries to know about, anything else worth mentioning…"
        />
      </div>

      <label className="flex gap-3 items-start text-base cursor-pointer text-paper/70">
        <input type="checkbox" name="newsletter" className="mt-1 h-4 w-4 accent-flame" />
        <span className="leading-snug">
          I&rsquo;d like to receive occasional tips, programme updates and news from Gain. You can unsubscribe at any time.
        </span>
      </label>

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full inline-flex items-center justify-center gap-3 rounded-sm bg-flame text-ink px-5 py-4 text-[0.82rem] font-bold uppercase tracking-[0.22em] hover:bg-flame-deep transition-colors disabled:opacity-70"
      >
        {state === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Sending…
          </>
        ) : (
          <>
            {submitLabel ?? "Request your free consultation"} <ArrowRight size={15} strokeWidth={2.4} />
          </>
        )}
      </button>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-flame/50 bg-flame/10 p-3 rounded-sm"
        >
          <AlertCircle size={16} className="text-flame shrink-0 mt-0.5" />
          <p className="text-base text-paper leading-snug">{formError}</p>
        </div>
      )}

      <p className="text-sm italic text-paper/55">
        Your consultation is free. No pressure, no obligation.
      </p>
    </form>
  );
}

function FieldMessage({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-2 flex items-start gap-1.5 text-sm text-flame leading-snug"
    >
      <AlertCircle size={13} className="mt-0.5 shrink-0" />
      <span>{msg}</span>
    </p>
  );
}
