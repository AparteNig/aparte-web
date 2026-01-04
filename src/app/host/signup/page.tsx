"use client";

import Link from "next/link";
import { useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon } from "@/assets/icons";
import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PhoneInput from "@/components/general/form/PhoneInput";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { registerHost } from "@/lib/api-client";

type HostSignupFields = {
  email: string;
  phone: string;
  password: string;
};

export default function HostSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"form" | "success">("form");
  const [error, setError] = useState<string | null>(null);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<HostSignupFields>({
    defaultValues: { email: "", phone: "", password: "" },
  });

  const signupMutation = useMutation({
    mutationFn: (payload: HostSignupFields) =>
      registerHost({
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
      }),
    onSuccess: (_data, variables) => {
      setError(null);
      setRegisteredEmail(variables.email);
      setStatus("success");
    },
    onError: (mutationError: unknown) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not create account. Try again."
      );
    },
  });

  const onSubmit: SubmitHandler<HostSignupFields> = (values) => {
    setError(null);
    signupMutation.mutate(values);
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Create your landlord profile"
        subtitleStart="Kick off onboarding"
        boldText="in under 5 minutes"
        subtitleEnd="and get ready to publish listings."
      />
      {status === "success" ? (
        <div className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-800">
          <p className="text-base font-semibold">
            You’re registered! 🎉
          </p>
          <p>
            We sent a confirmation message to <strong>{registeredEmail}</strong>
            . Sign in to continue your onboarding checklist and add your first
            listing.
          </p>
          <Button
            type="primary"
            className="w-full rounded-2xl text-base font-semibold"
            onClick={() => (window.location.href = "/host/login")}
          >
            Proceed to login
          </Button>
        </div>
      ) : (
        <>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          <p className="text-sm text-slate-600">
            Start with your contact details. You can complete identity,
            verification, and payout steps from your dashboard afterwards.
          </p>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <InputField
              label="Email address"
              placeholder="landlord@aparte.com"
              LeftIcon={EmailIcon}
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />
            <Controller
              name="phone"
              control={control}
              rules={{ required: "Phone is required" }}
              render={({ field }) => (
                <PhoneInput
                  label="Phone number"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  error={errors.phone?.message}
                  placeholder="801 234 5678"
                />
              )}
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
              disabled={signupMutation.isPending}
            >
              {signupMutation.isPending ? "Creating account..." : "Start onboarding"}
            </Button>
          </form>
        </>
      )}
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
