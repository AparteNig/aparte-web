"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/general/Button";
import InputField from "@/components/general/form/InputField";
import Modal from "@/components/general/ui/modal/Modal";
import { useAdminProfileQuery, useInviteAdminMutation } from "@/hooks/admin/use-admin-data";

type InviteAdminForm = {
  email: string;
  fullName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  isSuperAdmin: boolean;
};

const defaults: InviteAdminForm = {
  email: "",
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  isSuperAdmin: false,
};

export default function AddAdminPage() {
  const profileQuery = useAdminProfileQuery(true);
  const inviteAdmin = useInviteAdminMutation();
  const [successInfo, setSuccessInfo] = useState<{
    email: string;
    expiresAt: string;
    token?: string;
    devEmailPreview?: { to: string; subject: string; body: string };
  } | null>(null);
  const [showTokenModal, setShowTokenModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminForm>({ defaultValues: defaults });

  const onSubmit = (values: InviteAdminForm) => {
    setSuccessInfo(null);
    inviteAdmin.mutate(values, {
      onSuccess: (data) => {
        setSuccessInfo(data);
        setShowTokenModal(Boolean(data.token || data.devEmailPreview));
        reset(defaults);
      },
    });
  };

  if (profileQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading admin permissions…</p>;
  }

  if (!profileQuery.data?.isSuperAdmin) {
    return (
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Invite admin</h2>
        <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Only super administrator accounts can invite new admins. Please reach out to a super admin if you need
          access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Invite a new admin</h2>
        <p className="text-sm text-slate-500">
          Send an email invite so teammates can set a password and join the workspace.
        </p>
      </div>
      {successInfo && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">Invite sent to {successInfo.email}.</p>
          <p>Token expires {new Date(successInfo.expiresAt).toLocaleString()}.</p>
          {successInfo.token && (
            <button
              type="button"
              className="text-sm font-semibold text-primary underline"
              onClick={() => setShowTokenModal(true)}
            >
              View activation token
            </button>
          )}
        </div>
      )}
      {inviteAdmin.isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {(inviteAdmin.error as Error)?.message ?? "Failed to send invite."}
        </div>
      )}
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Work email"
          placeholder="admin@aparte.com"
          {...register("email", { required: "Email is required" })}
          error={errors.email?.message}
        />
        <InputField label="Full name" placeholder="Jane Admin" {...register("fullName")} />
        <InputField label="Phone" placeholder="+234…" {...register("phone")} />
        <InputField label="Address line 1" placeholder="123 Admin Way" {...register("addressLine1")} />
        <InputField label="Address line 2" placeholder="Suite 5" {...register("addressLine2")} />
        <InputField label="City" placeholder="Lagos" {...register("city")} />
        <InputField label="State" placeholder="Lagos" {...register("state")} />
        <InputField label="Country" placeholder="Nigeria" {...register("country")} />
        <label className="col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
            {...register("isSuperAdmin")}
          />
          <span>Grant super admin access (full platform control)</span>
        </label>
        <Button
          type="primary"
          className="col-span-2 rounded-2xl"
          buttonType="submit"
          disabled={inviteAdmin.isPending}
        >
          {inviteAdmin.isPending ? "Sending invite…" : "Send invite"}
        </Button>
      </form>
      <p className="text-xs text-slate-500">
        Invited admins receive an email containing their activation token. Share the token securely if email
        delivery isn’t configured in your environment.
      </p>
      <Modal opened={Boolean(showTokenModal && successInfo)} onClose={() => setShowTokenModal(false)}>
        <div className="space-y-3 text-slate-800">
          <h3 className="text-xl font-semibold">Invite preview</h3>
          <p className="text-sm text-slate-500">
            Copy the activation token or share the preview email content with the invited admin.
          </p>
          {successInfo?.token && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Activation token</p>
              <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-lg tracking-wide">
                {successInfo.token}
              </div>
            </div>
          )}
          {successInfo?.devEmailPreview?.body && (
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Email body</p>
              <pre className="mt-2 max-h-64 overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs whitespace-pre-wrap">
                {successInfo.devEmailPreview.body}
              </pre>
            </div>
          )}
          <Button
            type="primary"
            className="w-full rounded-2xl"
            onClick={async () => {
              const textToCopy = successInfo?.token || successInfo?.devEmailPreview?.body;
              if (!textToCopy) {
                setShowTokenModal(false);
                return;
              }
              try {
                await navigator.clipboard.writeText(textToCopy);
              } catch {
                // ignore clipboard failure
              }
              setShowTokenModal(false);
            }}
          >
            Copy & close
          </Button>
          <button
            type="button"
            className="w-full rounded-2xl border border-slate-200 py-2 text-sm font-semibold text-slate-600"
            onClick={() => setShowTokenModal(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
