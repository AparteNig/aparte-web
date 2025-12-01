"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { EmailIcon, EyeIcon, EyeOffIcon, LockIcon } from "@/assets/icons";
import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { HOST_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";
import {
  HostLoginResponse,
  loginHostRequest,
  verifyOtpRequest,
} from "@/lib/api-client";
import { hostProfileQueryKey } from "@/hooks/use-host-profile";
import { Input } from "@/components/ui/input";

type HostLoginFields = {
  email: string;
  password: string;
};

export default function HostLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [otpId, setOtpId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostLoginFields>({ defaultValues: { email: "", password: "" } });

  const handleAuthSuccess = (payload: HostLoginResponse) => {
    if ("requiresOtp" in payload && payload.requiresOtp) {
      setOtpId(payload.otpId);
      return;
    }

    setAuthCookie(HOST_AUTH_COOKIE, payload.tokens.accessToken);
    queryClient.setQueryData(hostProfileQueryKey, payload.hostProfile);
    router.push("/host/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: loginHostRequest,
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      handleAuthSuccess(data);
    },
    onError: (mutationError: unknown) => {
      setOtpId(null);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to sign in. Try again."
      );
    },
  });

  const otpMutation = useMutation({
    mutationFn: verifyOtpRequest,
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      if (data.hostProfile) {
        queryClient.setQueryData(hostProfileQueryKey, data.hostProfile);
      }
      setAuthCookie(HOST_AUTH_COOKIE, data.tokens.accessToken);
      router.push("/host/dashboard");
    },
    onError: (mutationError: unknown) => {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Verification failed. Try again."
      );
    },
  });

  const onSubmit: SubmitHandler<HostLoginFields> = (values) => {
    setError(null);
    setOtpId(null);
    loginMutation.mutate({
      ...values,
      device: { type: "web" },
    });
  };

  const handleOtpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otpId) return;
    otpMutation.mutate({
      otpId,
      code: otpCode,
      device: { type: "web" },
    });
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Host Workspace login"
        subtitle="Log in to manage listings, guests, and payouts in minutes."
      />
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {otpId ? (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
          <p className="text-sm text-slate-600">
            Enter the 6-digit code sent to your email or phone to trust this
            device.
          </p>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Security code</span>
            <Input
              type="text"
              placeholder="123456"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value)}
            />
          </label>
          <Button
            type="primary"
            buttonType="submit"
            className="w-full rounded-2xl text-base font-semibold"
            disabled={otpMutation.isPending || otpCode.length === 0}
          >
            {otpMutation.isPending ? "Verifying..." : "Verify device"}
          </Button>
        </form>
      ) : (
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      )}
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
