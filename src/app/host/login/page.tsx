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
import { HOST_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";

type HostLoginFields = {
  email: string;
  password: string;
};

export default function HostLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<HostLoginFields>({ defaultValues: { email: "", password: "" } });

  const onSubmit: SubmitHandler<HostLoginFields> = () => {
    setAuthCookie(HOST_AUTH_COOKIE, "host-dev-session");
    router.push("/host/dashboard");
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Host Workspace login"
        subtitle="Log in to manage listings, guests, and payouts in minutes."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <InputField
          label="Email address"
          placeholder="host@aparte.com"
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
        Need to onboard?{" "}
        <Link href="/host/signup" className="font-semibold text-primary">
          Create host account
        </Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
