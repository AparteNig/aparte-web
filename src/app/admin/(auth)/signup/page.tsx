"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "@/assets/icons";
import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { ADMIN_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";

type AdminSignupFields = {
  name: string;
  email: string;
  password: string;
};

export default function AdminSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminSignupFields>({ defaultValues: { name: "", email: "", password: "" } });

  const onSubmit: SubmitHandler<AdminSignupFields> = () => {
    setAuthCookie(ADMIN_AUTH_COOKIE, "admin-dev-session");
    router.push("/admin/dashboard");
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Create admin access"
        subtitleStart="Grant platform access to"
        boldText="operations leads"
        subtitleEnd="who approve and monitor activity."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <InputField
          label="Full name"
          placeholder="Adaeze Daniels"
          LeftIcon={UserIcon}
          {...register("name", { required: "Name is required" })}
          error={errors.name?.message}
        />
        <InputField
          label="Work email"
          placeholder="you@aparte.com"
          LeftIcon={EmailIcon}
          {...register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />
        <InputField
          label="Choose password"
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Already onboarded?{" "}
        <Link href="/admin/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
