'use client';

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success">("idle");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    setStatus("success");
    setEmail("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
        <div className="text-lg font-semibold text-slate-900">Aparte</div>
        <Button asChild variant="secondary">
          <Link href="/host/login">Host dashboard</Link>
        </Button>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="max-w-2xl space-y-8 text-center">
          <p className="text-sm uppercase tracking-widest text-primary">
            Early access waitlist
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">
            Join 12,000+ homeowners and guests building the easiest stay marketplace in
            Nigeria.
          </h1>
          <p className="text-base text-slate-500">
            Be the first to onboard listings, accept bookings, and access automated payouts,
            messaging, and concierge services built for the local market.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-lg sm:flex-row sm:items-center"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-primary"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" className="rounded-2xl px-6">
              Join waitlist
            </Button>
          </form>
          {status === "success" && (
            <p className="text-sm text-emerald-600">
              Thanks for joining! We&apos;ll keep you posted as soon as access opens up.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
