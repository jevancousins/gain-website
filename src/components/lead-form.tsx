"use client";

import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type FieldKey = "firstName" | "email" | "phone";
type FieldErrors = Partial<Record<FieldKey, string>>;

export function LeadForm({
  source = "landing",
  className,
}: {
  source?: string;
  className?: string;
}) {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setFieldErrors({});
    setFormError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source }),
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
          setFormError(body?.error ?? "Something went wrong — please try again, or call us.");
        }
        setState("idle");
        return;
      }

      setState("success");
      form.reset();
    } catch {
      setFormError("Network issue — please try again, or call us on 01323 370022.");
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
      "w-full rounded-sm px-4 py-3.5 text-base outline-none transition-colors border bg-ink text-paper placeholder:text-paper/35",
      err
        ? "border-flame focus:border-flame ring-1 ring-flame/60"
        : "border-paper/20 focus:border-flame"
    );

  if (state === "success") {
    return (
      <div className={cn("relative border p-7 bg-ink-soft border-flame/40", className)}>
        <div className="flex gap-4 items-start">
          <CheckCircle2 className="text-flame shrink-0 mt-1" size={22} />
          <div>
            <h3 className="display-tight text-2xl text-paper">Thanks &mdash; we&rsquo;ve got it.</h3>
            <p className="mt-2 text-paper/70 leading-relaxed text-sm">
              We&rsquo;ll be in touch shortly to arrange a short phone call.
              If it sounds like a good fit, we&rsquo;ll invite you in to see
              the studio and meet your coach.
            </p>
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
          Step 01 · Arrange a call
        </p>
        <h3 className="display-tight mt-3 text-[1.7rem] md:text-[1.95rem] leading-[1.05] text-paper">
          Start with a free call.
        </h3>
        <p className="mt-3 text-sm text-paper/65 leading-relaxed">
          Leave your details and we&rsquo;ll call to learn about your goals.
          No pressure &mdash; if we&rsquo;re a fit, we&rsquo;ll invite you in
          for an in-person consultation.
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
          <label htmlFor="phone" className={labelCls}>Mobile</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            required
            autoComplete="tel"
            className={inputCls(fieldErrors.phone)}
            placeholder="+44 7700 900123"
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
          className={inputCls(fieldErrors.email)}
          placeholder="you@example.com"
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          onChange={() => clearFieldError("email")}
        />
        <FieldMessage id="email-error" msg={fieldErrors.email} />
      </div>

      <div>
        <label htmlFor="message" className={labelCls}>
          What&rsquo;s on your mind?{" "}
          <span className="text-paper/40 font-normal normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className={cn(inputCls(), "resize-none")}
          placeholder="Goals, any injuries to know about, anything else worth mentioning…"
        />
      </div>

      <label className="flex gap-3 items-start text-sm cursor-pointer text-paper/70">
        <input type="checkbox" name="newsletter" className="mt-1 h-4 w-4 accent-flame" />
        <span className="leading-snug">
          Yes, I&rsquo;m happy to receive occasional updates from Gain Strength Therapy. Unsubscribe anytime.
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
            Book a free call <ArrowRight size={15} strokeWidth={2.4} />
          </>
        )}
      </button>

      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 border border-flame/50 bg-flame/10 p-3 rounded-sm"
        >
          <AlertCircle size={16} className="text-flame shrink-0 mt-0.5" />
          <p className="text-sm text-paper leading-snug">{formError}</p>
        </div>
      )}

      <p className="text-[0.68rem] italic text-paper/45">
        Your call is free. No pressure, no obligation.
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
      className="mt-2 flex items-start gap-1.5 text-[0.78rem] text-flame leading-snug"
    >
      <AlertCircle size={13} className="mt-0.5 shrink-0" />
      <span>{msg}</span>
    </p>
  );
}
