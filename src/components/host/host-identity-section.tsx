"use client";

import { useEffect, useState } from "react";

import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import {
  getHostIdentity,
  submitHostIdentity,
  uploadIdentityFile,
  type IdentitySummary,
} from "@/lib/api-client";

/**
 * Identity verification for a landlord.
 *
 * Replaces a form that asked the host to "upload via /uploads and paste the
 * returned key" — a developer note that had escaped into a live product
 * surface. This does the upload itself and shows where the check stands.
 *
 * Documents are only ever sent, never displayed back: the host knows what they
 * uploaded, and re-rendering somebody's passport in a dashboard is a screen a
 * shoulder-surfer or a screenshare can read.
 */

const ID_TYPES = [
  { value: "nin", label: "NIN (National Identification Number)", hint: "11 digits" },
  { value: "passport", label: "International passport", hint: "e.g. A12345678" },
  { value: "drivers_licence", label: "Driver's licence", hint: "9–15 characters" },
  { value: "voters_card", label: "Voter's card (PVC)", hint: "9–25 characters" },
] as const;

const STATUS_STYLES: Record<IdentitySummary["status"], string> = {
  not_started: "border-slate-200 bg-slate-50 text-slate-700",
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-800",
  rejected: "border-rose-200 bg-rose-50 text-rose-800",
};

export default function HostIdentitySection({ hostId }: { hostId: number }) {
  const [summary, setSummary] = useState<IdentitySummary | null>(null);
  const [idType, setIdType] = useState<string>("nin");
  const [idNumber, setIdNumber] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getHostIdentity()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    if (!documentFile || !selfieFile) return;
    setBusy(true);
    setError(null);
    try {
      // Upload both before submitting: a submission referencing a key that
      // failed to upload would sit in the queue as an unopenable case.
      const [document, selfie] = await Promise.all([
        uploadIdentityFile(documentFile, "host", hostId),
        uploadIdentityFile(selfieFile, "host", hostId),
      ]);
      const next = await submitHostIdentity({
        idType,
        idNumber: idNumber.trim(),
        documentKey: document.key,
        selfieKey: selfie.key,
      });
      setSummary(next);
      setDocumentFile(null);
      setSelfieFile(null);
      setIdNumber("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const status = summary?.status ?? "not_started";
  const canSubmit =
    (status === "not_started" || status === "rejected") &&
    Boolean(idNumber.trim() && documentFile && selfieFile) &&
    !busy;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Identity verification</h2>
        <p className="mt-1 text-sm text-slate-600">
          Nigerian law requires us to know who is letting property on Aparté. Your
          documents are stored privately and seen only by a reviewer.
        </p>
      </div>

      <div className={`rounded-lg border px-3 py-2 text-sm ${STATUS_STYLES[status]}`}>
        {status === "approved" && <p className="font-medium">Your identity is verified.</p>}
        {status === "pending" && (
          <p className="font-medium">
            Submitted and waiting for review. We will email you when it is decided.
          </p>
        )}
        {status === "rejected" && (
          <>
            <p className="font-medium">Your last submission was not accepted.</p>
            {summary?.rejectionReason && (
              <p className="mt-1">{summary.rejectionReason}</p>
            )}
            <p className="mt-1">Please correct that and submit again below.</p>
          </>
        )}
        {status === "not_started" && (
          <p>You have not submitted your identity documents yet.</p>
        )}
      </div>

      {(status === "not_started" || status === "rejected") && (
        <div className="space-y-4">
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold text-slate-800">Document type</span>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              value={idType}
              onChange={(e) => setIdType(e.target.value)}
            >
              {ID_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold text-slate-800">Number on the document</span>
            <Input
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              placeholder={ID_TYPES.find((t) => t.value === idType)?.hint}
            />
          </label>

          {[
            {
              label: "Photo of the document",
              help: "All four corners visible, and the number readable.",
              file: documentFile,
              set: setDocumentFile,
            },
            {
              label: "Selfie holding the document",
              help: "Your face and the document in the same photo.",
              file: selfieFile,
              set: setSelfieFile,
            },
          ].map((field) => (
            <label key={field.label} className="block space-y-1.5 text-sm">
              <span className="font-semibold text-slate-800">{field.label}</span>
              <span className="block text-xs font-normal text-slate-500">{field.help}</span>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-sm file:text-white"
                onChange={(e) => field.set(e.target.files?.[0] ?? null)}
              />
              {field.file && (
                <span className="block text-xs text-emerald-700">{field.file.name}</span>
              )}
            </label>
          ))}

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="primary" onClick={submit} disabled={!canSubmit}>
            {busy ? "Submitting…" : "Submit for verification"}
          </Button>
        </div>
      )}
    </div>
  );
}
