import { AuthCard } from "@/components/auth/auth-card";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

export default function AdminSignupPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/60 p-4">
      <AuthCard
        title="Admin Signup"
        description="Create credentials for the admin console."
        actionLabel="Create account"
        successHref="/admin/dashboard"
        cookieName={ADMIN_AUTH_COOKIE}
        redirectLabel="Already onboarded?"
        redirectHref="/admin/login"
      />
    </section>
  );
}
