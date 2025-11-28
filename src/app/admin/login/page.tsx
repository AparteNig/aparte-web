import { AuthCard } from "@/components/auth/auth-card";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";

export default function AdminLoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-muted/60 p-4">
      <AuthCard
        title="Admin Login"
        description="Access the operations dashboard."
        actionLabel="Sign in"
        successHref="/admin/dashboard"
        cookieName={ADMIN_AUTH_COOKIE}
        redirectLabel="Need an account?"
        redirectHref="/admin/signup"
      />
    </section>
  );
}
