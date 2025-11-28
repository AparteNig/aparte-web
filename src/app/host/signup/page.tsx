import { AuthCard } from "@/components/auth/auth-card";
import { HOST_AUTH_COOKIE } from "@/lib/auth";

export default function HostSignupPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/60 p-4">
      <AuthCard
        title="Host Signup"
        description="Kick off onboarding and payouts."
        actionLabel="Create account"
        successHref="/host/dashboard"
        cookieName={HOST_AUTH_COOKIE}
        redirectLabel="Already live?"
        redirectHref="/host/login"
      />
    </section>
  );
}
