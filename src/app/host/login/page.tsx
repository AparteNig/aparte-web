import { AuthCard } from "@/components/auth/auth-card";
import { HOST_AUTH_COOKIE } from "@/lib/auth";

export default function HostLoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/60 p-4">
      <AuthCard
        title="Host Login"
        description="Manage listings, payouts, and guests."
        actionLabel="Sign in"
        successHref="/host/dashboard"
        cookieName={HOST_AUTH_COOKIE}
        redirectLabel="Need to onboard?"
        redirectHref="/host/signup"
      />
    </section>
  );
}
