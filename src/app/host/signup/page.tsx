"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon, PhoneIcon, UserIcon } from "@/assets/icons";
import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { HOST_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";

type HostSignupFields = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

export default function HostSignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<HostSignupFields>({
    defaultValues: { fullName: "", email: "", phone: "", password: "" }
  });

  const onSubmit: SubmitHandler<HostSignupFields> = () => {
    setAuthCookie(HOST_AUTH_COOKIE, "host-dev-session");
    router.push("/host/dashboard");
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Create your host profile"
        subtitleStart="Kick off onboarding"
        boldText="in under 5 minutes"
        subtitleEnd="and get ready to publish listings."
      />
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <InputField
          label="Full name"
          placeholder="Chinaza Obi"
          LeftIcon={UserIcon}
          {...register("fullName", { required: "Name is required" })}
          error={errors.fullName?.message}
        />
        <InputField
          label="Email address"
          placeholder="host@aparte.com"
          LeftIcon={EmailIcon}
          {...register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />
        <InputField
          label="Phone number"
          placeholder="+234..."
          LeftIcon={PhoneIcon}
          {...register("phone", { required: "Phone is required" })}
          error={errors.phone?.message}
        />
        <InputField
          label="Create password"
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
          {isSubmitting ? "Creating account..." : "Start onboarding"}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-600">
        Already live?{" "}
        <Link href="/host/login" className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
