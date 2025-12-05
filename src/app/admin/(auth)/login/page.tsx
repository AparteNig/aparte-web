"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon } from "@/assets/icons";
import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { ADMIN_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";

type AdminLoginFields = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginFields>({ defaultValues: { email: "", password: "" } });

  const onSubmit: SubmitHandler<AdminLoginFields> = () => {
    setAuthCookie(ADMIN_AUTH_COOKIE, "admin-dev-session");
    router.push("/admin/dashboard");
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Welcome back, admin"
        subtitle="Stay on top of verifications, payouts, and overall platform health."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <InputField
          label="Work email"
          placeholder="you@aparte.com"
          LeftIcon={EmailIcon}
          {...register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />
        <InputField
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          LeftIcon={LockIcon}
          RightIcon={showPassword ? EyeOffIcon : EyeIcon}
          rightIconAction={() => setShowPassword((prev) => !prev)}
          {...register("password", { required: "Password is required" })}
          error={errors.password?.message}
        />
        <Button
          type="primary"
          buttonType="submit"
          className="w-full rounded-2xl text-base font-semibold"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Need an account?{" "}
        <Link href="/admin/signup" className="font-semibold text-primary">
          Create admin profile
        </Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
