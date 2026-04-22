"use client";

import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("loading");
    setError(null);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      if (!res.ok) throw new Error("Request failed");
      setState("success");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const labelCls = "block text-[0.68rem] font-bold uppercase tracking-[0.22em] mb-2 text-paper/60";
  const inputCls =
    "w-full rounded-sm px-4 py-3.5 text-base outline-none transition-colors border bg-ink border-paper/20 text-paper placeholder:text-paper/35 focus:border-flame";

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
          <input id="firstName" name="firstName" required autoComplete="given-name" className={inputCls} placeholder="Jane" />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone</label>
          <input id="phone" name="phone" type="tel" required autoComplete="tel" className={inputCls} placeholder="07…" />
        </div>
      </div>

      <div>
        <label htmlFor="email" className={labelCls}>Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputCls} placeholder="you@example.com" />
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
          className={cn(inputCls, "resize-none")}
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

      {state === "error" && (
        <p className="text-sm text-flame">{error ?? "Couldn't send — please try again, or call us."}</p>
      )}

      <p className="text-[0.68rem] italic text-paper/45">
        Your call is free. No pressure, no obligation.
      </p>
    </form>
  );
}
