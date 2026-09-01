"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import { useHostListingsQuery } from "@/hooks/use-host-listings";
import { useHostBookingsQuery } from "@/hooks/use-bookings";
import { HOST_ONBOARDING_STEPS } from "@/types/host";
import type { HostOnboardingStatus } from "@/types/host";

const quickActions = [
  {
    title: "Create listing",
    description: "Start the listing wizard with photos, pricing, and rules.",
    href: "/host/dashboard/listings",
  },
  {
    title: "Manage calendar",
    description: "Add blackout dates or adjust availability.",
    href: "/host/dashboard/calendar",
  },
  {
    title: "Respond to guests",
    description: "Keep response times high and delight new inquiries.",
    href: "/host/dashboard/messages",
  },
];

const listingStats = [
  {
    label: "Active listings",
    value: "—",
    helper: "Launch your first listing to see live stats.",
  },
  {
    label: "Drafts",
    value: "—",
    helper: "Save progress as you work through onboarding.",
  },
  {
    label: "Pending review",
    value: "—",
    helper: "Submit listings for compliance review.",
  },
];

export default function HostDashboardPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useHostProfileQuery();
  const { data: listingsData } = useHostListingsQuery();
  const bookingsQuery = useHostBookingsQuery();
  const completedStats = useMemo(() => {
    if (!bookingsQuery.data) {
      return { completed: 0, total: 0, revenue: 0, active: 0 };
    }
    const { bookings } = bookingsQuery.data;
    const completed = bookings.filter((booking) => booking.status === "completed");
    const total = completed.length;
    // What the host actually earns, not what the guest paid. totalAmount is the
    // gross charge — it includes Aparte's service fee and the refundable caution
    // fee, neither of which is the host's money, so summing it overstated
    // revenue badly. Damage awards released from escrow are real earnings and
    // sit outside the booking payout, so they are added here.
    const revenue = completed.reduce(
      (sum, booking) =>
        sum + (booking.hostPayoutAmount ?? 0) + (booking.caution?.awardedToHost ?? 0),
      0,
    );
    const active = bookings.filter(
      (booking) =>
        booking.status === "confirmed" ||
        booking.status === "ongoing" ||
        booking.status === "checkout_due" ||
        booking.status === "guest_departed",
    ).length;
    return { completed: total, totalBookings: bookings.length, revenue, active };
  }, [bookingsQuery.data]);


  /**
   * Replaces three hardcoded tips shown to every host forever under the
   * heading "key insights for your portfolio". Advice that never changes and
   * never refers to your account is noise dressed as insight, and it filled
   * the space where something actionable belonged.
   *
   * Declared above the loading and error returns: every hook has to run in
   * the same order on every render, and putting a useMemo after an early
   * return changes the hook count between the loading pass and the loaded
   * one. React catches it at runtime; the typechecker does not.
   */
  const attentionItems = useMemo(() => {
    const items: { label: string; detail: string; href: string }[] = [];
    if (!data) return items;

    const drafts =
      listingsData?.filter((listing) => listing.status === "draft").length ?? 0;
    if (drafts > 0) {
      items.push({
        label: `${drafts} listing${drafts === 1 ? "" : "s"} still in draft`,
        detail: "Guests cannot see a listing until it is submitted and approved.",
        href: "/host/dashboard/listings",
      });
    }
    if ((data.payoutStatus ?? "pending") !== "active" || !data.payoutBankName) {
      items.push({
        label: "Payout details incomplete",
        detail: "We cannot send your earnings until a bank account is verified.",
        href: "/host/dashboard/payouts",
      });
    }
    if (!data.supportPhone) {
      items.push({
        label: "No support phone number",
        detail: "Guests with an urgent problem have no way to reach you.",
        href: "/host/dashboard/profile#support",
      });
    }
    if (completedStats.active > 0) {
      items.push({
        label: `${completedStats.active} guest${completedStats.active === 1 ? "" : "s"} currently staying`,
        detail: "Keep an eye on messages while they are in your property.",
        href: "/host/dashboard/bookings",
      });
    }
    return items;
  }, [data, listingsData, completedStats.active]);

  if (isLoading) {
    const Block = ({ className = "" }: { className?: string }) => (
      <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />
    );
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6"
            >
              <Block className="h-4 w-32" />
              <Block className="h-3 w-44" />
              <Block className="h-9 w-20" />
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6"
            >
              <Block className="h-4 w-36" />
              {[0, 1, 2].map((r) => (
                <Block key={r} className="h-14 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        <p className="font-medium">We couldn’t load your dashboard.</p>
        <p className="text-xs">
          This is usually a connection problem. Try again, and if it keeps
          happening, contact support and we will look into it.
        </p>
        <Button
          type="primary"
          className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
          onClick={() => refetch()}
        >
          Try again
        </Button>
      </div>
    );
  }
  const formatStatus = (status: HostOnboardingStatus) => {
    if (status === "identity_pending") {
      if (
        data.incompleteSteps.length === 1 &&
        !data.completedSteps.includes("LISTING_PUBLISHED")
      ) {
        return "Publish your first listing";
      }
      return "Verification pending";
    }
    if (status === "draft") {
      const hasListing = data.completedSteps.includes("LISTING_PUBLISHED");
      const allStepsComplete = data.incompleteSteps.length === 0;
      if (!hasListing && allStepsComplete) return "Create your first listing";
      return hasListing ? "Listing draft" : "Create your first listing";
    }
    return status.replace("_", " ");
  };

  const totalSteps = HOST_ONBOARDING_STEPS.length;
  const completedSteps = data.completedSteps.length;
  const onboardingPercent = Math.round((completedSteps / totalSteps) * 100);
  const needsSetup = data.incompleteSteps.length > 0;
  const awaitingAdminApproval = data.adminApprovalStatus === "pending";
  const adminRejected = data.adminApprovalStatus === "rejected";
  const isActive = data.onboardingStatus === "active";
  const activeListingCount =
    listingsData?.filter((listing) => listing.status === "published").length ?? 0;
  const draftListingCount =
    listingsData?.filter((listing) => listing.status === "draft").length ?? 0;



  return (
    <div className="space-y-8">
      {awaitingAdminApproval && (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
          <div>
            Your profile is awaiting admin approval. Listings will remain private until a reviewer
            finishes the compliance check.
          </div>
          <p className="text-xs text-amber-800">
            You can keep editing your profile and listings in the meantime.
          </p>
        </div>
      )}
      {adminRejected && (
        <div className="flex flex-col gap-3 rounded-3xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 md:flex-row md:items-center md:justify-between">
          <div>
            Your profile needs attention before it can go live. Please review the notes in the
            profile tab and resubmit the required documents.
          </div>
          <Link href="/host/dashboard/profile" className="text-sm font-semibold text-rose-800 underline">
            Review feedback
          </Link>
        </div>
      )}
      {needsSetup && (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
          <div>
            Account setup in progress. Complete every onboarding step to unlock payouts
            and publishing.
          </div>
          <Link
            href="/host/dashboard/profile"
            className="text-sm font-semibold text-amber-900 underline"
          >
            Continue profile setup
          </Link>
        </div>
      )}

      {isActive ? (
        <>
          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Active listings</CardTitle>
                <p className="text-sm text-slate-500">
                  Currently live listings on the marketplace.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-semibold text-slate-900">
                  {activeListingCount}
                </p>
                <p className="text-xs text-slate-500">
                  Drafts waiting review: {draftListingCount}
                </p>
                <Button
                  type="secondary"
                  className="w-full rounded-2xl"
                  onClick={() => router.push("/host/dashboard/listings")}
                >
                  Manage listings
                </Button>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Bookings snapshot</CardTitle>
                <p className="text-sm text-slate-500">
                  High-level view of booking performance.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-xs uppercase text-slate-500">Revenue generated</p>
                  <p className="text-2xl font-semibold text-slate-900">
                    ₦{completedStats.revenue.toLocaleString()}
                  </p>
                  {/*
                    Bookings taken before the split-fee model carry no payout
                    figure, so a host with completed stays can legitimately see
                    zero here. Saying why beats a bare ₦0 next to a non-zero
                    booking count, which reads as the dashboard being broken.
                  */}
                  {completedStats.revenue === 0 && completedStats.completed > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Earnings tracking started after these stays completed.
                    </p>
                  )}
                </div>
                <p className="text-sm text-slate-600">
                  Completed bookings:{" "}
                  <span className="font-semibold">{completedStats.completed}</span>
                </p>
                <p className="text-sm text-slate-600">
                  Ongoing stays: <span className="font-semibold">{completedStats.active}</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Support & payout readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Payout status</p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.payoutStatus ?? "pending"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Bank: {data.payoutBankName || "—"} · Account:{" "}
                    {data.payoutAccountNumber || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Support inbox</p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.supportEmail || "Add support email"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: {data.supportPhone || "Add phone number"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <p className="text-sm text-slate-500">
                  Jump straight into the workflows you use the most.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex items-start justify-between rounded-2xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{action.title}</p>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                    <Link
                      href={action.href}
                      className="text-sm font-semibold text-primary"
                    >
                      Go
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Needs your attention</CardTitle>
                <p className="text-sm text-slate-500">
                  Things only you can action, from your account right now.
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {attentionItems.length === 0 ? (
                  <p className="text-slate-600">
                    Nothing needs your attention. Your listings are live and your
                    account is complete.
                  </p>
                ) : (
                  attentionItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => router.push(item.href)}
                      className="flex w-full items-start justify-between gap-3 rounded-xl border border-slate-200 px-3 py-2.5 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span>
                        <span className="block font-medium text-slate-900">
                          {item.label}
                        </span>
                        <span className="block text-xs text-slate-500">{item.detail}</span>
                      </span>
                      <span className="shrink-0 pt-0.5 text-xs font-semibold text-primary">
                        Go
                      </span>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </section>
        </>
      ) : (
        <>
          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Onboarding status</CardTitle>
                <p className="text-sm text-slate-500">
                  Track how close you are to publishing listings.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-3xl font-semibold text-slate-900">
                  {onboardingPercent}%
                </p>
                <p className="text-sm text-slate-600">
                  Status:{" "}
                  <span className="font-semibold">
                    {formatStatus(data.onboardingStatus)}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {totalSteps - completedSteps} steps remaining. Finish setup to unlock
                  payouts.
                </p>
                <Button
                  type="secondary"
                  className="w-full rounded-2xl"
                  onClick={() => router.push("/host/dashboard/profile")}
                >
                  View detailed checklist
                </Button>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Listings at a glance</CardTitle>
                <p className="text-sm text-slate-500">
                  Data will display once your first listing is published.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {listingStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500">{stat.helper}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Support & payout readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Payout status</p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.payoutStatus ?? "pending"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Bank: {data.payoutBankName || "—"} · Account:{" "}
                    {data.payoutAccountNumber || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">Support inbox</p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.supportEmail || "Add support email"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Phone: {data.supportPhone || "Add phone number"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
          <section className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Next steps</CardTitle>
                <p className="text-sm text-slate-500">
                  Focus on the most important tasks to unlock payouts and listing
                  approvals.
                </p>
              </CardHeader>
              <CardContent>
                {data.incompleteSteps.length === 0 ? (
                  <p className="text-sm text-emerald-700">
                    All onboarding tasks complete. Great job!
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {data.incompleteSteps.slice(0, 4).map((step) => (
                      <li
                        key={step}
                        className="rounded-2xl border border-slate-200 p-3 text-sm"
                      >
                        <p className="font-semibold">
                          {step.replaceAll("_", " ").toLowerCase()}
                        </p>
                        <p className="text-xs text-slate-500">
                          Complete this on the profile page.
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
                <p className="text-sm text-slate-500">
                  Jump straight into the workflows you use the most.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex items-start justify-between rounded-2xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{action.title}</p>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>
                    <Link
                      href={action.href}
                      className="text-sm font-semibold text-primary"
                    >
                      Go
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}
