"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import {
  useCreateListingMutation,
  useHostListingsQuery,
  useMoveListingToDraftMutation,
  usePublishListingMutation,
} from "@/hooks/use-host-listings";
import type { HostListing } from "@/types/listing";
import { cn } from "@/lib/utils";

type ListingFormValues = {
  title: string;
  description: string;
  addressLine1: string;
  city: string;
  country: string;
  nightlyPrice: string;
  maxGuests: string;
  amenities: string;
  houseRules: string;
};

const initialFormValues: ListingFormValues = {
  title: "",
  description: "",
  addressLine1: "",
  city: "",
  country: "Nigeria",
  nightlyPrice: "",
  maxGuests: "1",
  amenities: "",
  houseRules: "",
};

const parseCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const statusBadge = (status: HostListing["status"]) => {
  switch (status) {
    case "published":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "pending_review":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "suspended":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
};

export default function HostListingsPage() {
  const { data: profile } = useHostProfileQuery();
  const listingsQuery = useHostListingsQuery();
  const createListing = useCreateListingMutation();
  const publishListing = usePublishListingMutation();
  const draftListing = useMoveListingToDraftMutation();

  const { register, handleSubmit, reset } = useForm<ListingFormValues>({
    defaultValues: initialFormValues,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const canPublish = Boolean(
    profile && profile.onboardingStatus !== "draft" && profile.completedSteps.length > 0,
  );

  const onSubmit = handleSubmit(async (values) => {
    try {
      setFormError(null);
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => formData.append(key, value));
      if (values.amenities) {
        formData.set("amenities", JSON.stringify(parseCommaSeparated(values.amenities)));
      }
      if (values.houseRules) {
        formData.set("houseRules", JSON.stringify(parseCommaSeparated(values.houseRules)));
      }
      attachments.forEach((file) => formData.append("listingFiles", file));
      await createListing.mutateAsync(formData);
      reset(initialFormValues);
      setAttachments([]);
      setShowCreateForm(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to create listing. Try again.",
      );
    }
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    setAttachments(files);
  };

  const listings = listingsQuery.data ?? [];

  const { publishedCount, draftCount } = useMemo(() => {
    return listings.reduce(
      (acc, listing) => {
        if (listing.status === "published") acc.publishedCount += 1;
        if (listing.status === "draft") acc.draftCount += 1;
        return acc;
      },
      { publishedCount: 0, draftCount: 0 },
    );
  }, [listings]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const filteredListings = listings.filter((listing) => {
    if (filter === "all") return true;
    return listing.status === filter;
  });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-semibold">Your listings</h3>
            <p className="text-sm text-slate-600">
              Drafts stay private until you hit publish. Publishing requires onboarding completion.
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              {["all", "draft", "published"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option as typeof filter)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    filter === option ? "bg-primary text-white" : "bg-slate-100 text-slate-700",
                  )}
                >
                  {option === "draft"
                    ? `Drafts: ${draftCount}`
                    : option === "published"
                    ? `Published: ${publishedCount}`
                    : "All"}
              </button>
            ))}
            </div>
          </div>
          <Button
            type="primary"
            className="rounded-2xl"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? "Close form" : "Create new listing"}
          </Button>
        </div>
        {showCreateForm && (
          <Card className="border-slate-200">
            <CardContent className="space-y-4 py-6">
              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}
              <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Title</span>
                  <Input
                    placeholder="Stylish loft in Lekki"
                    {...register("title", { required: true })}
                  />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-semibold text-slate-800">Description</span>
                  <textarea
                    className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    rows={4}
                    placeholder="Describe the listing..."
                    {...register("description", { required: true })}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Address line 1</span>
                  <Input
                    placeholder="1 Admiralty Way"
                    {...register("addressLine1", { required: true })}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">City</span>
                  <Input placeholder="Lagos" {...register("city", { required: true })} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Country</span>
                  <Input placeholder="Nigeria" {...register("country", { required: true })} />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Nightly price</span>
                  <Input
                    type="number"
                    min="0"
                    placeholder="40000"
                    {...register("nightlyPrice", { required: true })}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Max guests</span>
                  <Input type="number" min="1" {...register("maxGuests", { required: true })} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-semibold text-slate-800">Amenities (comma separated)</span>
                  <Input placeholder="WiFi, Generator, Pool" {...register("amenities")} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-semibold text-slate-800">House rules (comma separated)</span>
                  <Input placeholder="No smoking, Quiet hours after 10pm" {...register("houseRules")} />
                </label>
                <label className="space-y-2 text-sm md:col-span-2">
                  <span className="font-semibold text-slate-800">Photos / videos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="w-full rounded-2xl border border-dashed border-slate-300 p-3 text-sm"
                  />
                  {attachments.length > 0 && (
                    <p className="text-xs text-slate-500">{attachments.length} file(s) selected</p>
                  )}
                </label>
                <div className="md:col-span-2">
                  <Button
                    type="primary"
                    buttonType="submit"
                    disabled={createListing.isPending}
                    className="w-full rounded-2xl md:w-auto"
                  >
                    {createListing.isPending ? "Creating..." : "Save listing as draft"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
        {listingsQuery.isLoading ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
            Loading existing listings...
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 p-6 text-sm text-slate-500">
            {filter === "all"
              ? "No listings yet. Create your first listing above."
              : `No ${filter} listings yet.`}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="border-slate-200">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle>{listing.title}</CardTitle>
                    <p className="text-sm text-slate-500">
                      {listing.city}, {listing.country} · ₦{listing.nightlyPrice.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusBadge(
                      listing.status,
                    )}`}
                  >
                    {listing.status.replace("_", " ")}
                  </span>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>{listing.description}</p>
                  <p>
                    Guests: {listing.maxGuests} · Bedrooms: {listing.bedrooms} · Bathrooms:{" "}
                    {listing.bathrooms}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {listing.amenities.slice(0, 6).map((amenity) => (
                      <span key={amenity} className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                        {amenity}
                      </span>
                    ))}
                    {listing.amenities.length > 6 && (
                      <span className="text-slate-500">
                        +{listing.amenities.length - 6} more amenities
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3 pt-3">
                    <Button
                      type="primary"
                      className="rounded-2xl"
                      disabled={
                        listing.status === "published" ||
                        listing.status === "pending_review" ||
                        !canPublish ||
                        publishListing.isPending
                      }
                      onClick={() => publishListing.mutate(listing.id)}
                    >
                      Publish
                    </Button>
                    <Button
                      type="secondary"
                      className="rounded-2xl"
                      disabled={listing.status === "draft" || draftListing.isPending}
                      onClick={() => draftListing.mutate(listing.id)}
                    >
                      Move to draft
                    </Button>
                  </div>
                  {!canPublish && (
                    <p className="text-xs text-amber-700">
                      Finish onboarding in the profile tab to enable publishing.
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
