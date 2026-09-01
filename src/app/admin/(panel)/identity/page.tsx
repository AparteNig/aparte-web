"use client";

import { useState } from "react";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useIdentityVerificationsQuery,
  useReviewIdentityMutation,
} from "@/hooks/admin/use-admin-data";
import { getIdentityDocuments, type IdentityVerificationRow } from "@/lib/api-client";

const ID_LABELS: Record<IdentityVerificationRow["idType"], string> = {
  nin: "NIN",
  passport: "International passport",
  drivers_licence: "Driver's licence",
  voters_card: "Voter's card",
};

const waitingFor = (iso: string | null) => {
  if (!iso) return "—";
  const hours = Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours >= 24) return `${Math.floor(hours / 24)}d waiting`;
  if (hours >= 1) return `${hours}h waiting`;
  return "just now";
};

type Documents = {
  documentUrl: string;
  selfieUrl: string;
  expiresInSeconds: number;
  idNumber: string;
};

function VerificationCard({ row }: { row: IdentityVerificationRow }) {
  const review = useReviewIdentityMutation();
  const [documents, setDocuments] = useState<Documents | null>(null);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  /**
   * Documents are fetched on demand rather than with the queue. Each call mints
   * two 60-second links to someone's identity papers and is written to the
   * audit log, so it should happen when a reviewer actually opens a case.
   */
  const loadDocuments = async () => {
    setError(null);
    setLoadingDocs(true);
    try {
      setDocuments(await getIdentityDocuments(row.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the documents.");
    } finally {
      setLoadingDocs(false);
    }
  };

  const decide = async (decision: "approved" | "rejected") => {
    setError(null);
    try {
      await review.mutateAsync({
        verificationId: row.id,
        decision,
        rejectionReason: decision === "rejected" ? reason.trim() : undefined,
      });
      setRejecting(false);
      setReason("");
      setDocuments(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed, please retry.");
    }
  };

  const busy = review.isPending;

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="text-base">
            {row.subjectName || row.subjectEmail || `${row.subjectType} #${row.subjectId}`}
          </CardTitle>
          <p className="mt-1 text-xs text-slate-500">
            {row.subjectEmail} · {row.subjectType === "host" ? "Landlord" : "Guest"} #
            {row.subjectId}
          </p>
        </div>
        <span className="whitespace-nowrap rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
          {waitingFor(row.submittedAt)}
        </span>
      </CardHeader>

      <CardContent className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Document
            </dt>
            <dd className="mt-0.5 text-slate-800">{ID_LABELS[row.idType] ?? row.idType}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Number given
            </dt>
            <dd className="mt-0.5 font-mono text-slate-800">{row.idNumber}</dd>
          </div>
        </dl>

        {!documents ? (
          <Button type="secondary" onClick={loadDocuments} disabled={loadingDocs}>
            {loadingDocs ? "Opening…" : "View documents"}
          </Button>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "ID document", url: documents.documentUrl },
                { label: "Selfie", url: documents.selfieUrl },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.label}
                    className="h-40 w-full bg-white object-contain"
                  />
                  <span className="block border-t border-slate-200 px-2 py-1 text-xs text-slate-600">
                    {item.label} — open full size
                  </span>
                </a>
              ))}
            </div>
            <p className="text-xs text-slate-500">
              These links expire in {documents.expiresInSeconds} seconds. Opening them is
              recorded in the audit log.
            </p>
          </div>
        )}

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {rejecting ? (
          <div className="space-y-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">
                What does this person need to fix?
              </span>
              <Input
                className="mt-1"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. The photo is too blurry to read the number"
              />
            </label>
            {/* Shown to the applicant verbatim: a rejection with no explanation
                just produces an identical resubmission. */}
            <p className="text-xs text-slate-500">
              They will see this message, so write it for them.
            </p>
            <div className="flex gap-2">
              <Button
                type="secondary"
                onClick={() => decide("rejected")}
                disabled={busy || !reason.trim()}
              >
                {busy ? "Sending…" : "Send rejection"}
              </Button>
              <Button type="transparent" onClick={() => setRejecting(false)} disabled={busy}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="primary" onClick={() => decide("approved")} disabled={busy || !documents}>
              {busy ? "Working…" : "Approve"}
            </Button>
            <Button type="secondary" onClick={() => setRejecting(true)} disabled={busy}>
              Reject
            </Button>
            {!documents && (
              // Approving without looking is the one mistake this queue can
              // make that nobody catches later.
              <span className="self-center text-xs text-slate-500">
                Open the documents before deciding.
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminIdentityPage() {
  const { data, isLoading, isError } = useIdentityVerificationsQuery();
  const rows = data?.verifications ?? [];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Identity verification</h1>
        <p className="mt-1 text-sm text-slate-600">
          Guests cannot book and landlords cannot be approved until their identity is
          verified. Oldest first.
        </p>
      </header>

      {isLoading && <p className="text-sm text-slate-500">Loading the queue…</p>}
      {isError && (
        <p className="text-sm text-rose-600">Could not load the queue. Refresh to retry.</p>
      )}

      {!isLoading && !isError && rows.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-slate-600">Nothing waiting for review.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((row) => (
          <VerificationCard key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
}
