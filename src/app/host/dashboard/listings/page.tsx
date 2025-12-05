"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import Button from "@/components/general/Button";
import LoadingOverlay from "@/components/general/LoadingOverlay";
import Modal from "@/components/general/ui/modal/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHostProfileQuery } from "@/hooks/use-host-profile";
import {
  useCreateListingMutation,
  useDeleteListingMutation,
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
  const router = useRouter();
  const { data: profile } = useHostProfileQuery();
  const listingsQuery = useHostListingsQuery();
  const createListing = useCreateListingMutation();
  const publishListing = usePublishListingMutation();
  const draftListing = useMoveListingToDraftMutation();
  const deleteListing = useDeleteListingMutation();

  const { register, handleSubmit, reset } = useForm<ListingFormValues>({
    defaultValues: initialFormValues,
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [listingToDelete, setListingToDelete] = useState<{ id: number; title: string } | null>(null);
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
    if (files.length === 0) return;
    setAttachments((prev) => [...prev, ...files]);
    if (event.target) {
      event.target.value = "";
    }
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
      <LoadingOverlay
        isOpen={publishListing.isPending || draftListing.isPending}
        title={
          publishListing.isPending
            ? "Publishing listing…"
            : draftListing.isPending
            ? "Moving listing to draft…"
            : "Working…"
        }
        message="Hold on while we update your listing."
      />
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
                <div className="space-y-3 text-sm md:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">Photos / videos</span>
                    <button
                      type="button"
                      className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Add media
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="rounded-2xl border border-dashed border-slate-300 p-3 text-sm text-slate-600">
                    {attachments.length === 0 ? (
                      <p>No media selected yet. Add photos or short clips to showcase the space.</p>
                    ) : (
                      <ul className="space-y-1 text-xs text-slate-500">
                        {attachments.map((file, index) => (
                          <li key={`${file.name}-${index}`}>{file.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
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
              <Card
                key={listing.id}
                className="cursor-pointer border-slate-200 transition hover:border-primary/40"
                onClick={() => router.push(`/host/dashboard/listings/${listing.id}`)}
              >
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-col gap-1">
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
                      onClick={(event) => {
                        event.stopPropagation();
                        publishListing.mutate(listing.id);
                      }}
                    >
                      Publish
                    </Button>
                    <Button
                      type="secondary"
                      className="rounded-2xl"
                      disabled={listing.status === "draft" || draftListing.isPending}
                      onClick={(event) => {
                        event.stopPropagation();
                        draftListing.mutate(listing.id);
                      }}
                    >
                      Move to draft
                    </Button>
                    <Button
                      type="transparent"
                      className="ml-auto text-rose-600 hover:text-rose-700"
                      onClick={(event) => {
                        event.stopPropagation();
                        setListingToDelete({ id: listing.id, title: listing.title });
                      }}
                      disabled={deleteListing.isPending}
                    >
                      Delete
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
      <Modal
        opened={Boolean(listingToDelete)}
        onClose={() => {
          if (!deleteListing.isPending) {
            setListingToDelete(null);
          }
        }}
        className="max-w-lg"
      >
        <div className="space-y-4 text-slate-800">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-600">Delete listing</p>
            <h3 className="text-xl font-semibold text-slate-900">Are you sure?</h3>
            <p className="text-sm text-slate-500">
              This will permanently remove <strong>{listingToDelete?.title}</strong> including all drafts and media.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:justify-end">
            <Button
              type="secondary"
              className="w-full rounded-2xl md:w-auto"
              onClick={() => setListingToDelete(null)}
              disabled={deleteListing.isPending}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              className="w-full rounded-2xl bg-rose-600 text-white hover:bg-rose-700 md:w-auto"
              disabled={deleteListing.isPending || !listingToDelete}
              onClick={async () => {
                if (!listingToDelete) return;
                try {
                  await deleteListing.mutateAsync(listingToDelete.id);
                } finally {
                  setListingToDelete(null);
                }
              }}
            >
              {deleteListing.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting…
                </span>
              ) : (
                "Delete listing"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
