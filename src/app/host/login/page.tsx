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
  const [devPreview, setDevPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HostLoginFields>({ defaultValues: { email: "", password: "" } });

  const handleAuthSuccess = (payload: HostLoginResponse) => {
    if ("requiresOtp" in payload && payload.requiresOtp) {
      setOtpId(payload.otpId);
      if (payload.devPreview) {
        setDevPreview(payload.devPreview);
        const match = payload.devPreview.match(/(\d{6})/);
        if (match) {
          setOtpCode(match[1]);
        }
      } else {
        setDevPreview(null);
      }
      return;
    }

    setDevPreview(null);
    setAuthCookie(HOST_AUTH_COOKIE, payload.tokens.accessToken);
    queryClient.setQueryData(hostProfileQueryKey, payload.hostProfile);
    router.push("/host/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: loginHostRequest,
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      setDevPreview(null);
      handleAuthSuccess(data);
    },
    onError: (mutationError: unknown) => {
      setOtpId(null);
      setDevPreview(null);
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
      setDevPreview(null);
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
    setDevPreview(null);
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

  const dismissDevPreview = () => setDevPreview(null);
  const handleCopyDevPreview = async () => {
    if (!devPreview) return dismissDevPreview();
    const codeToCopy = otpCode || devPreview;
    try {
      if (navigator?.clipboard) {
        await navigator.clipboard.writeText(codeToCopy);
      }
    } catch {
      // ignore clipboard errors in dev
    } finally {
      dismissDevPreview();
    }
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Landlord Workspace login"
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
            placeholder="landlord@aparte.com"
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
          Create landlord account
        </Link>
      </p>
      <PageFooter />
      {devPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 text-center shadow-2xl">
            <p className="text-xs font-semibold uppercase text-primary">Development mode</p>
            <h3 className="text-xl font-semibold text-slate-900">OTP preview</h3>
            <p className="text-sm text-slate-600">
              Production logins send codes via email or SMS. This preview is only for local testing.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-lg tracking-[0.4em] text-slate-900">
              {otpCode || devPreview}
            </div>
            <p className="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-500">
              {devPreview}
            </p>
            <Button
              type="primary"
              className="w-full rounded-2xl text-base font-semibold"
              onClick={handleCopyDevPreview}
            >
              Copy code & continue
            </Button>
            <button
              type="button"
              className="text-sm font-semibold text-slate-500 underline"
              onClick={dismissDevPreview}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
