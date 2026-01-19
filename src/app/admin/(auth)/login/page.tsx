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
import { ADMIN_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";
import {
  AdminLoginResponse,
  loginAdminRequest,
  verifyOtpRequest,
} from "@/lib/api-client";
import { Input } from "@/components/ui/input";

type AdminLoginFields = {
  email: string;
  password: string;
};

export default function AdminLoginPage() {
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
  } = useForm<AdminLoginFields>({ defaultValues: { email: "", password: "" } });

  const handleAuthSuccess = (payload: AdminLoginResponse) => {
    if ("requiresOtp" in payload && payload.requiresOtp) {
      setOtpId(payload.otpId);
      if (payload.devPreview) {
        setDevPreview(payload.devPreview);
        const match = payload.devPreview.match(/(\d{6})/);
        if (match) {
          setOtpCode(match[1]);
        }
      }
      return;
    }

    setAuthCookie(ADMIN_AUTH_COOKIE, payload.tokens.accessToken);
    queryClient.clear();
    router.push("/admin/dashboard");
  };

  const loginMutation = useMutation({
    mutationFn: loginAdminRequest,
    onMutate: () => {
      setError(null);
      setOtpId(null);
      setDevPreview(null);
    },
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      handleAuthSuccess(data);
    },
    onError: (mutationError: unknown) => {
      setOtpId(null);
      setDevPreview(null);
      setError(
        mutationError instanceof Error ? mutationError.message : "Failed to sign in. Try again.",
      );
    },
  });

  const otpMutation = useMutation({
    mutationFn: verifyOtpRequest,
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      setDevPreview(null);
      if (data.adminProfile) {
        setAuthCookie(ADMIN_AUTH_COOKIE, data.tokens.accessToken);
        queryClient.clear();
        router.push("/admin/dashboard");
      } else {
        setError("Unexpected response. Please try logging in again.");
      }
    },
    onError: (mutationError: unknown) => {
      setError(
        mutationError instanceof Error ? mutationError.message : "Verification failed. Try again.",
      );
    },
  });

  const onSubmit: SubmitHandler<AdminLoginFields> = (values) => {
    setError(null);
    setOtpId(null);
    setDevPreview(null);
    loginMutation.mutate({ ...values, device: { type: "web" } });
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
      // ignore copy issues in dev
    } finally {
      dismissDevPreview();
    }
  };

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Welcome back, admin"
        subtitle="Stay on top of verifications, payouts, and overall platform health."
      />
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {otpId ? (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
          <p className="text-sm text-slate-600">
            Enter the 6-digit code sent to your email to trust this device.
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
          {devPreview && (
            <button
              type="button"
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
              onClick={handleCopyDevPreview}
            >
              Copy dev OTP ({devPreview})
            </button>
          )}
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
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      )}
      <PageFooter />
    </AuthLayout>
  );
}
