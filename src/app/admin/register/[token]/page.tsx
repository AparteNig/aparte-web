"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import PageFooter from "@/components/general/PageFooter";
import { AuthLayout } from "@/components/layouts/auth-layout";
import { AuthHeader } from "@/components/pages/auth/auth-header";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon, LockIcon, UserIcon } from "@/assets/icons";
import { ADMIN_AUTH_COOKIE, setAuthCookie } from "@/lib/auth";
import { activateAdminAccount, getAdminInviteDetails, verifyOtpRequest } from "@/lib/api-client";

export default function AdminInviteRegisterPage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const [showPassword, setShowPassword] = useState(false);
  const [otpId, setOtpId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [devPreview, setDevPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inviteQuery = useQuery({
    queryKey: ["adminInvite", token],
    queryFn: () => getAdminInviteDetails(token),
    enabled: Boolean(token),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<{ fullName?: string; password: string; confirmPassword: string }>({
    defaultValues: { fullName: "", password: "", confirmPassword: "" },
  });

  const activateMutation = useMutation({
    mutationFn: activateAdminAccount,
    onSuccess: (data) => {
      setError(null);
      if (data.requiresOtp) {
        setOtpId(data.otpId);
        setDevPreview(data.devPreview ?? null);
      }
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to activate admin");
    },
  });

  const otpMutation = useMutation({
    mutationFn: verifyOtpRequest,
    onSuccess: (data) => {
      setError(null);
      setOtpCode("");
      if (data.tokens?.accessToken) {
        setAuthCookie(ADMIN_AUTH_COOKIE, data.tokens.accessToken);
        router.push("/admin/dashboard");
      } else {
        router.push("/admin/login");
      }
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "OTP verification failed");
    },
  });

  const onSubmit = handleSubmit(({ fullName, password, confirmPassword }) => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    activateMutation.mutate({ token, password, fullName: fullName?.trim() ? fullName : undefined });
  });

  const handleOtpSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!otpId) return;
    otpMutation.mutate({ otpId, code: otpCode, device: { type: "web" } });
  };

  const inviteData = inviteQuery.data;
  const passwordValue = watch("password");

  return (
    <AuthLayout containerClassName="flex flex-col gap-8">
      <AuthHeader
        title="Activate your admin access"
        subtitle="Set your password, confirm the invite, and start managing supply."
      />
      {inviteQuery.isLoading ? (
        <p className="text-sm text-slate-500">Validating invite token…</p>
      ) : inviteQuery.isError || !inviteData ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Invite link is invalid or expired. Please request a new invite from the Aparte team.
        </div>
      ) : otpId ? (
        <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
          <p className="text-sm text-slate-600">
            Enter the 6-digit code sent to {inviteData.email}. This verifies your device and completes activation.
          </p>
          <label className="space-y-2 text-sm text-slate-700">
            <span className="font-medium">Security code</span>
            <Input type="text" placeholder="123456" value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
          </label>
          {devPreview && <p className="text-xs text-primary">Dev preview: {devPreview}</p>}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}
          <Button
            type="primary"
            buttonType="submit"
            className="w-full rounded-2xl text-base font-semibold"
            disabled={otpMutation.isPending || otpCode.length === 0}
          >
            {otpMutation.isPending ? "Verifying…" : "Verify device"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>
          )}
          <InputField label="Work email" value={inviteData.email} disabled LeftIcon={UserIcon} readOnly />
          <InputField
            label="Full name"
            placeholder="Jane Admin"
            defaultValue={inviteData.fullName}
            LeftIcon={UserIcon}
            {...register("fullName")}
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
          <InputField
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            LeftIcon={LockIcon}
            {...register("confirmPassword", {
              required: "Confirm your password",
              validate: (value) => value === passwordValue || "Passwords do not match",
            })}
            error={errors.confirmPassword?.message}
          />
          <Button
            type="primary"
            buttonType="submit"
            className="w-full rounded-2xl text-base font-semibold"
            disabled={activateMutation.isPending}
          >
            {activateMutation.isPending ? "Activating…" : "Activate access"}
          </Button>
          <p className="text-xs text-slate-500">
            Token expires {new Date(inviteData.expiresAt).toLocaleString()}. If this time has passed, request a new invite.
          </p>
        </form>
      )}
      <p className="text-center text-sm text-slate-600">
        Already activated? <Link href="/admin/login" className="font-semibold text-primary">Sign in</Link>
      </p>
      <PageFooter />
    </AuthLayout>
  );
}
