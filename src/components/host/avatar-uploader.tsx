 "use client";

import { useRef, useState } from "react";
import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HostProfile } from "@/types/host";
import { useUploadHostAvatarMutation } from "@/hooks/use-host-profile";

type HostAvatarUploaderProps = {
  profile: HostProfile;
};

export const HostAvatarUploader = ({ profile }: HostAvatarUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const { mutateAsync, isPending } = useUploadHostAvatarMutation();

  const handleSelectFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setError(null);
      await mutateAsync(file);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to upload avatar",
      );
    } finally {
      event.target.value = "";
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle>Profile photo</CardTitle>
        <p className="text-sm text-slate-500">
          This is shown to guests across all listings and communications.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Host avatar"
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-slate-300 bg-slate-50 text-2xl font-semibold text-slate-500">
              {profile.displayName?.[0]?.toUpperCase() ??
                profile.email[0]?.toUpperCase()}
            </div>
          )}
          <div className="space-y-2 text-sm text-slate-600">
            <p>Use a clear headshot or logo so guests can recognize you.</p>
            <p className="text-xs text-slate-500">
              JPG or PNG, up to 5 MB. Square images look best.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:ml-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {profile.avatarUrl && (
            <Button
              type="secondary"
              className="rounded-2xl"
              onClick={handleSelectFile}
              disabled={isPending}
            >
              Replace photo
            </Button>
          )}
          {!profile.avatarUrl && (
            <Button
              type="primary"
              onClick={handleSelectFile}
              disabled={isPending}
              className="rounded-2xl"
            >
              {isPending ? "Uploading..." : "Upload photo"}
            </Button>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </CardContent>
    </Card>
  );
};
