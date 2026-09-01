"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import PageFooter from "@/components/general/PageFooter";
import { requestPasswordReset, resetPassword } from "@/lib/api-client";

/**
 * Password recovery for landlords.
 *
 * The backend has had /auth/password/forgot and /auth/password/reset all
 * along, but nothing on the web called them and no route existed — so a
 * landlord who forgot their password was locked out with no way back in.
 *
 * Two steps on one page rather than two routes: the code is short-lived, and
 * sending someone to a fresh URL invites them to lose it by navigating away.
 */

type Step = "request" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState<string>("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = await requestPasswordReset(email.trim().toLowerCase());
      // The handle is issued whether or not the address is registered, so
      // advancing here reveals nothing.
      setHandle(result.handle);
      setStep("reset");
    } catch {
      setError("We couldn't start the reset. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitReset = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPassword({ handle, code: code.trim(), password });
      setDone(true);
      setTimeout(() => router.push("/host/login"), 2000);
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : "That code is not valid or has expired.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <AuthLayout containerClassName="flex flex-col gap-8">
        <AuthHeader
          title="Password updated"
          subtitle="Taking you to sign in…"
        />
        <PageFooter />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title={step === "request" ? "Reset your password" : "Check your email"}
        subtitle={
          step === "request"
            ? "Enter your email address. If it is registered, we'll send a reset code to it."
            : `If ${email} is registered, a reset code has been sent to it. Enter the code below with your new password.`
        }
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={submitEmail} className="flex flex-col gap-5">
          <InputField
            label="Email address"
            placeholder="landlord@aparte.com"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          <Button
            type="primary"
            buttonType="submit"
            className="w-full rounded-2xl text-base font-semibold"
            disabled={busy || email.trim().length === 0}
          >
            {busy ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="flex flex-col gap-5">
          <InputField
            label="Six-digit code"
            placeholder="123456"
            inputMode="numeric"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
            required
          />
          <InputField
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <InputField
            label="Confirm new password"
            type="password"
            placeholder="Type it again"
            value={confirm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
            required
          />
          <Button
            type="primary"
            buttonType="submit"
            className="w-full rounded-2xl text-base font-semibold"
            disabled={busy || !code.trim() || !password || !handle}
          >
            {busy ? "Updating…" : "Update password"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("request");
              setError(null);
              setCode("");
            }}
            className="text-sm text-slate-600 underline-offset-2 hover:underline"
          >
            Use a different email address
          </button>
        </form>
      )}

      <p className="text-center text-sm text-slate-600">
        Remembered it?{" "}
        <Link href="/host/login" className="font-semibold text-primary">
          Back to sign in
        </Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
