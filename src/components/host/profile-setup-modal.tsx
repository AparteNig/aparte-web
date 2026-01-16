"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "@/components/general/Button";
import LoadingOverlay from "@/components/general/LoadingOverlay";
import Modal from "@/components/general/ui/modal/Modal";
import { Input } from "@/components/ui/input";
import PhoneInput from "@/components/general/form/PhoneInput";
import { useUpdateHostProfileMutation, useUploadHostAvatarMutation } from "@/hooks/use-host-profile";
import type { HostProfile } from "@/types/host";

type ProfileSetupModalProps = {
  open: boolean;
  profile?: HostProfile;
};

type ProfileSetupValues = {
  fullName: string;
  displayName: string;
  phone: string;
  bio: string;
  addressLine1: string;
  city: string;
  state: string;
  country: string;
};

export const ProfileSetupModal = ({ open, profile }: ProfileSetupModalProps) => {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarTouched, setAvatarTouched] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const identityDefaults = useMemo(
    () => ({
      fullName: profile?.fullName ?? "",
      displayName: profile?.displayName ?? "",
      phone: profile?.phone ?? "",
      bio: profile?.bio ?? "",
      addressLine1: profile?.addressLine1 ?? "",
      city: profile?.city ?? "",
      state: profile?.state ?? "",
      country: profile?.country ?? "Nigeria",
    }),
    [profile?.id, profile?.fullName, profile?.displayName, profile?.phone, profile?.bio, profile?.addressLine1, profile?.city, profile?.state, profile?.country],
  );

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileSetupValues>({
    defaultValues: identityDefaults,
  });

  useEffect(() => {
    reset(identityDefaults);
  }, [identityDefaults, reset]);

  const updateProfile = useUpdateHostProfileMutation();
  const uploadAvatar = useUploadHostAvatarMutation();

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setStatus("Saving profile details…");
    try {
      if (!avatarFile && !profile?.avatarUrl) {
        setAvatarTouched(true);
        setError("Profile photo is required.");
        setStatus(null);
        return;
      }
      await updateProfile.mutateAsync({
        section: "identity",
        data: {
          fullName: values.fullName,
          displayName: values.displayName,
          phone: values.phone,
          bio: values.bio,
        },
      });
      setStatus("Saving address…");
      await updateProfile.mutateAsync({
        section: "address",
        data: {
          addressLine1: values.addressLine1,
          city: values.city,
          state: values.state,
          country: values.country,
        },
      });
      if (!avatarFile && !profile?.avatarUrl) {
        setAvatarTouched(true);
        throw new Error("Profile photo is required.");
      }
      if (avatarFile) {
        setStatus("Uploading profile photo…");
        await uploadAvatar.mutateAsync(avatarFile);
      }
      setStatus("All set! Redirecting you to your dashboard.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
      setStatus(null);
    }
  });

  const disableSubmit =
    isSubmitting ||
    updateProfile.isPending ||
    uploadAvatar.isPending ||
    !open;

  return (
    <>
      <LoadingOverlay
        isOpen={isSubmitting || updateProfile.isPending || uploadAvatar.isPending}
        title="Completing setup…"
        message={status ?? "Applying your information."}
      />
      <Modal opened={open} onClose={() => undefined} className="max-w-2xl">
        <div className="space-y-4 text-slate-800">
          <div className="space-y-2 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-primary">Profile setup</p>
            <h2 className="text-2xl font-semibold text-slate-900">Let’s complete your landlord profile</h2>
            <p className="text-sm text-slate-500">
              We need a few details before unlocking your dashboard. This helps us auto-fill your onboarding tasks.
            </p>
          </div>
          <form className="grid gap-4 text-sm text-slate-700 md:grid-cols-2" onSubmit={onSubmit}>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">Legal full name</span>
              <Input placeholder="e.g. Farouq Seriki" {...register("fullName", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">Display / brand name</span>
              <Input placeholder="Urban Stay Lagos" {...register("displayName", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">Phone number</span>
              <Controller
                name="phone"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <PhoneInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    placeholder="801 234 5678"
                  />
                )}
              />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">Country</span>
              <Input {...register("country", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-semibold">Address line 1</span>
              <Input placeholder="1 Admiralty Way" {...register("addressLine1", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">City</span>
              <Input {...register("city", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-1">
              <span className="font-semibold">State</span>
              <Input {...register("state", { required: true })} />
            </label>
            <label className="space-y-2 md:col-span-2">
              <span className="font-semibold">About you</span>
              <textarea
                className="w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                rows={3}
                placeholder="Share your landlord story or what makes your spaces unique."
                {...register("bio")}
              />
            </label>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-slate-800">Profile photo</p>
              <p className="text-xs text-slate-500">Faces build trust. Upload a clear headshot or brand mark.</p>
              <label className="mt-2 inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 hover:border-primary">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setAvatarTouched(true);
                    }
                  }}
                />
                {avatarFile ? (
                  <span>{avatarFile.name}</span>
                ) : (
                  <span>
                    {profile?.avatarUrl ? "Replace existing photo" : "Upload photo (required)"}
                  </span>
                )}
              </label>
              {!avatarFile && !profile?.avatarUrl && avatarTouched && (
                <p className="mt-2 text-xs font-semibold text-rose-600">
                  Please upload a profile photo to continue.
                </p>
              )}
            </div>
            {error && (
              <div className="md:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div className="md:col-span-2">
              <Button
                type="primary"
                className="w-full rounded-2xl"
                buttonType="submit"
                disabled={disableSubmit}
              >
                {disableSubmit ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Saving
                  </span>
                ) : (
                  "Save & continue"
                )}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
};
