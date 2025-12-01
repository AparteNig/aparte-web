"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import { useHostListingsQuery } from "@/hooks/use-host-listings";
import { HOST_ONBOARDING_STEPS } from "@/types/host";

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

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
        Loading your host overview...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4 rounded-3xl border border-red-200 bg-red-50 p-8 text-sm text-red-700">
        <p>We couldn’t load your host data.</p>
        <p className="text-xs">
          {error instanceof Error ? error.message : "Unexpected error"}
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

  const totalSteps = HOST_ONBOARDING_STEPS.length;
  const completedSteps = data.completedSteps.length;
  const onboardingPercent = Math.round((completedSteps / totalSteps) * 100);
  const needsSetup = data.incompleteSteps.length > 0;
  const isActive = data.onboardingStatus === "active";
  const activeListingCount =
    listingsData?.filter((listing) => listing.status === "published").length ?? 0;
  const draftListingCount =
    listingsData?.filter((listing) => listing.status === "draft").length ?? 0;

  return (
    <div className="space-y-8">
      {needsSetup && (
        <div className="flex flex-col gap-3 rounded-3xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 md:flex-row md:items-center md:justify-between">
          <div>
            Account setup in progress. Complete every onboarding step to unlock
            payouts and publishing.
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
                  <p className="text-xs uppercase text-slate-500">
                    Revenue generated
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    ₦0
                  </p>
                </div>
                <p className="text-sm text-slate-600">
                  Completed bookings: <span className="font-semibold">0</span>
                </p>
                <p className="text-sm text-slate-600">
                  Ongoing stays: <span className="font-semibold">0</span>
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Support & payout readiness</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Payout status
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.payoutStatus ?? "pending"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Bank: {data.payoutBankName || "—"} · Account:{" "}
                    {data.payoutAccountNumber || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Support inbox
                  </p>
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
                      <p className="font-semibold text-slate-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {action.description}
                      </p>
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
                <CardTitle>Performance notes</CardTitle>
                <p className="text-sm text-slate-500">
                  Key insights and reminders for your portfolio.
                </p>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <p>
                  Keep response time under 1 hour to boost booking conversions.
                </p>
                <p>Schedule post-stay cleaning reminders every Friday.</p>
                <p>
                  Offer weekly discounts to improve mid-week occupancy.
                </p>
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
                    {data.onboardingStatus.replace("_", " ")}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {totalSteps - completedSteps} steps remaining. Finish setup to
                  unlock payouts.
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
                    <p className="text-2xl font-semibold text-slate-900">
                      {stat.value}
                    </p>
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
                  <p className="text-xs uppercase text-slate-500">
                    Payout status
                  </p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.payoutStatus ?? "pending"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Bank: {data.payoutBankName || "—"} · Account:{" "}
                    {data.payoutAccountNumber || "—"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase text-slate-500">
                    Support inbox
                  </p>
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
                  Focus on the most important tasks to unlock payouts and
                  listing approvals.
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
                      <p className="font-semibold text-slate-900">
                        {action.title}
                      </p>
                      <p className="text-sm text-slate-500">
                        {action.description}
                      </p>
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
