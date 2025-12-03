"use client";

import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import Button from "@/components/general/Button";
import LoadingOverlay from "@/components/general/LoadingOverlay";
import MediaGalleryModal from "@/components/general/MediaGalleryModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAttachListingPhotosMutation,
  useDeleteListingPhotoMutation,
  useHostListingQuery,
  useMoveListingToDraftMutation,
  usePublishListingMutation,
  useUpdateListingMutation,
} from "@/hooks/use-host-listings";
import { cn } from "@/lib/utils";
import { uploadListingAsset } from "@/lib/api-client";

type ListingEditFormValues = {
  title: string;
  summary: string;
  description: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  nightlyPrice: string;
  cleaningFee: string;
  serviceFee: string;
  maxGuests: string;
  bedrooms: string;
  bathrooms: string;
  amenities: string;
  houseRules: string;
  minNights: string;
  maxNights: string;
};

const emptyListingForm: ListingEditFormValues = {
  title: "",
  summary: "",
  description: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  nightlyPrice: "",
  cleaningFee: "",
  serviceFee: "",
  maxGuests: "",
  bedrooms: "",
  bathrooms: "",
  amenities: "",
  houseRules: "",
  minNights: "",
  maxNights: "",
};

const toCommaSeparated = (items: string[] = []) => items.join(", ");
const parseCommaSeparated = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
const isVideoUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return /\.(mp4|mov|m4v|webm)$/i.test(parsed.pathname);
  } catch {
    return /\.(mp4|mov|m4v|webm)(\?.*)?$/i.test(url);
  }
};

export default function HostListingDetailPage() {
  const router = useRouter();
  const params = useParams<{ listingId: string }>();
  const listingId = params?.listingId ? Number(params.listingId) : undefined;

  const { data: listing, isLoading } = useHostListingQuery(listingId);
  const updateListing = useUpdateListingMutation(listingId);
  const publishListing = usePublishListingMutation();
  const draftListing = useMoveListingToDraftMutation();
  const attachPhotos = useAttachListingPhotosMutation(listingId);
  const deletePhotoMutation = useDeleteListingPhotoMutation(listingId);
  const [showEditForm, setShowEditForm] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [pendingPhotoRemovals, setPendingPhotoRemovals] = useState<number[]>([]);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting },
  } = useForm<ListingEditFormValues>({ defaultValues: emptyListingForm });

  const overlayTitle = publishListing.isPending
    ? "Publishing listing…"
    : draftListing.isPending
    ? "Moving listing to draft…"
    : "Updating listing…";

  const overlayActive =
    isSubmitting ||
    updateListing.isPending ||
    deletePhotoMutation.isPending ||
    attachPhotos.isPending ||
    publishListing.isPending ||
    draftListing.isPending;

  const mediaItems = useMemo(
    () =>
      (listing?.photos ?? [])
        .map((photo) => ({
          id: photo.id,
          url: photo.url,
          caption: photo.caption,
          type: isVideoUrl(photo.url) ? "video" : "image",
        }))
        .sort((a, b) => (a.type === "video" && b.type !== "video" ? -1 : a.type === b.type ? 0 : 1)),
    [listing?.photos],
  );
  const previewItems = useMemo(
    () => mediaItems.map((item, index) => ({ item, index })).slice(0, Math.min(mediaItems.length, 5)),
    [mediaItems],
  );
  const extraMediaCount = mediaItems.length - previewItems.length;
  const openGalleryAt = (index: number) => {
    setActiveMediaIndex(index);
    setIsGalleryOpen(true);
  };
  const closeGallery = () => setIsGalleryOpen(false);
  const goPrevMedia = () => {
    setActiveMediaIndex((prev) => {
      if (mediaItems.length === 0) return prev;
      return (prev - 1 + mediaItems.length) % mediaItems.length;
    });
  };
  const goNextMedia = () => {
    setActiveMediaIndex((prev) => {
      if (mediaItems.length === 0) return prev;
      return (prev + 1) % mediaItems.length;
    });
  };
  const selectMediaIndex = (index: number) => {
    setActiveMediaIndex(index);
  };

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        summary: listing.summary ?? "",
        description: listing.description,
        addressLine1: listing.addressLine1,
        addressLine2: listing.addressLine2 ?? "",
        city: listing.city,
        state: listing.state ?? "",
        country: listing.country,
        postalCode: listing.postalCode ?? "",
        nightlyPrice: String(listing.nightlyPrice ?? ""),
        cleaningFee: String(listing.cleaningFee ?? ""),
        serviceFee: String(listing.serviceFee ?? ""),
        maxGuests: String(listing.maxGuests ?? ""),
        bedrooms: String(listing.bedrooms ?? ""),
        bathrooms: String(listing.bathrooms ?? ""),
        amenities: toCommaSeparated(listing.amenities ?? []),
        houseRules: toCommaSeparated(listing.houseRules ?? []),
        minNights: String(listing.minNights ?? ""),
        maxNights: listing.maxNights ? String(listing.maxNights) : "",
      });
    }
  }, [listing, reset]);

  useEffect(() => {
    if (!showEditForm) {
      setPendingPhotoRemovals([]);
      setMediaError(null);
    }
  }, [showEditForm]);

  const onSubmit = handleSubmit(async (values) => {
    if (!listingId) return;
    setStatusMessage(null);
    setErrorMessage(null);
    setMediaError(null);
    try {
      await updateListing.mutateAsync({
        title: values.title,
        summary: values.summary,
        description: values.description,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        state: values.state,
        country: values.country,
        postalCode: values.postalCode,
        nightlyPrice: Number(values.nightlyPrice),
        cleaningFee: Number(values.cleaningFee),
        serviceFee: Number(values.serviceFee),
        maxGuests: Number(values.maxGuests),
        bedrooms: Number(values.bedrooms),
        bathrooms: Number(values.bathrooms),
        amenities: parseCommaSeparated(values.amenities),
        houseRules: parseCommaSeparated(values.houseRules),
        minNights: Number(values.minNights),
        maxNights: values.maxNights ? Number(values.maxNights) : null,
      });
      if (pendingPhotoRemovals.length > 0) {
        await Promise.all(pendingPhotoRemovals.map((photoId) => deletePhotoMutation.mutateAsync(photoId)));
        setPendingPhotoRemovals([]);
      }
      setStatusMessage("Listing updated successfully.");
      setShowEditForm(false);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to update listing.");
    }
  });

  const currencyFormatter = useMemo(() => {
    const currency = listing?.currency ?? "NGN";
    return new Intl.NumberFormat("en-NG", { style: "currency", currency });
  }, [listing?.currency]);

  const handleTogglePhotoRemoval = (photoId: number) => {
    setMediaError(null);
    setPendingPhotoRemovals((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId],
    );
  };

  const handleMediaSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!listingId) return;
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;
    setMediaError(null);
    setUploadingMedia(true);
    try {
      const uploads = [];
      for (const [index, file] of files.entries()) {
        const upload = await uploadListingAsset(listingId, file);
        uploads.push({ key: upload.key, sortOrder: (listing?.photos.length ?? 0) + index });
      }
      await attachPhotos.mutateAsync(uploads);
    } catch (error) {
      setMediaError(error instanceof Error ? error.message : "Failed to upload media.");
    } finally {
      setUploadingMedia(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const renderMediaTile = (
    entry: { item: { id: number; url: string; caption?: string; type: "image" | "video" }; index: number },
    options?: { className?: string; emphasize?: boolean; showSeeMore?: boolean },
  ) => (
    <div
      key={entry.item.id}
      onClick={() => openGalleryAt(entry.index)}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-100 bg-slate-100",
        options?.className,
        options?.emphasize ? "md:rounded-3xl" : "",
      )}
    >
      {entry.item.type === "video" ? (
        <video
          src={entry.item.url}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          muted
          playsInline
          loop
        />
      ) : (
        <Image
          src={entry.item.url}
          alt={entry.item.caption || "Listing media"}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-300 group-hover:scale-[1.02]"
        />
      )}
      {entry.item.type === "video" && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          Video
        </span>
      )}
      {showEditForm && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleTogglePhotoRemoval(entry.item.id);
          }}
          className={cn(
            "absolute right-3 top-3 rounded-full px-3 py-1 text-sm text-white transition",
            pendingPhotoRemovals.includes(entry.item.id)
              ? "bg-rose-600 hover:bg-rose-700"
              : "bg-black/60 hover:bg-black/80",
          )}
        >
          {pendingPhotoRemovals.includes(entry.item.id) ? "Undo" : "×"}
        </button>
      )}
      {pendingPhotoRemovals.includes(entry.item.id) && (
        <div className="pointer-events-none absolute inset-0 bg-rose-600/10 backdrop-blur-[1px]" />
      )}
      {options?.showSeeMore && extraMediaCount > 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
          <span className="text-lg font-semibold">See all media</span>
          <span className="text-sm text-white/80">+{extraMediaCount} more</span>
        </div>
      )}
    </div>
  );

  const renderMediaGrid = () => {
    if (previewItems.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
          No media uploaded yet. Use the editor below to add images or videos.
        </div>
      );
    }
    if (previewItems.length === 1) {
      return (
        <div className="grid gap-3">
          {renderMediaTile(previewItems[0], { className: "aspect-[16/10] md:h-[420px]", emphasize: true })}
        </div>
      );
    }
    if (previewItems.length === 2) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {previewItems.map((entry) => renderMediaTile(entry, { className: "aspect-[4/3]" }))}
        </div>
      );
    }
    if (previewItems.length === 3) {
      return (
        <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {renderMediaTile(previewItems[0], {
            className: "aspect-[4/3] md:h-full md:min-h-[320px]",
            emphasize: true,
          })}
          <div className="grid gap-3">
            {previewItems.slice(1).map((entry) => renderMediaTile(entry, { className: "aspect-[4/3]" }))}
          </div>
        </div>
      );
    }
    if (previewItems.length === 4) {
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {previewItems.map((entry) => renderMediaTile(entry, { className: "aspect-[4/3]" }))}
        </div>
      );
    }
    return (
      <div className="grid gap-3 md:grid-cols-4 md:grid-rows-2">
        {renderMediaTile(previewItems[0], {
          className: "aspect-[4/3] md:col-span-2 md:row-span-2",
          emphasize: true,
        })}
        {previewItems.slice(1, 4).map((entry) => renderMediaTile(entry, { className: "aspect-[4/3]" }))}
        {renderMediaTile(previewItems[4], {
          className: "aspect-[4/3]",
          showSeeMore: extraMediaCount > 0,
        })}
      </div>
    );
  };

  if (!listingId || Number.isNaN(listingId)) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Invalid listing reference.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <LoadingOverlay
        isOpen={overlayActive}
        title={overlayTitle}
        message="Hold on while we save your latest changes."
      />
      <MediaGalleryModal
        open={isGalleryOpen && mediaItems.length > 0}
        items={mediaItems}
        activeIndex={activeMediaIndex}
        onClose={closeGallery}
        onPrev={goPrevMedia}
        onNext={goNextMedia}
        onSelect={selectMediaIndex}
      />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Button type="secondary" className="rounded-2xl" onClick={() => router.back()}>
          ← Back to listings
        </Button>
        <div className="flex flex-wrap gap-3">
          {listing &&
            (listing.status !== "published" || isDirty) && (
              <Button
                type="primary"
                className="rounded-2xl"
                disabled={!listing || publishListing.isPending}
                onClick={() => listing && publishListing.mutate(listing.id)}
              >
                Publish
              </Button>
            )}
          {listing &&
            (listing.status !== "draft" || isDirty) && (
              <Button
                type="secondary"
                className="rounded-2xl"
                disabled={!listing || draftListing.isPending}
                onClick={() => listing && draftListing.mutate(listing.id)}
              >
                Move to draft
              </Button>
            )}
          <Button
            type="secondary"
            className="rounded-2xl"
            onClick={() => setShowEditForm((prev) => !prev)}
          >
            {showEditForm ? "Close editor" : "Edit listing"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center text-sm text-slate-600">
            Loading listing details...
          </CardContent>
        </Card>
      ) : !listing ? (
        <Card className="border-slate-200">
          <CardContent className="py-10 text-center text-sm text-slate-600">
            Listing not found.
          </CardContent>
        </Card>
      ) : (
        <>
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <span
                  className={cn(
                    "w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize",
                    listing.status === "published"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : listing.status === "draft"
                      ? "border-slate-200 bg-slate-50 text-slate-600"
                      : listing.status === "pending_review"
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-rose-200 bg-rose-50 text-rose-700",
                  )}
                >
                  {listing.status.replace("_", " ")}
                </span>
                <h1 className="text-3xl font-semibold text-slate-900">{listing.title}</h1>
                <p className="text-sm text-slate-600">
                  {listing.addressLine1}, {listing.city}, {listing.country}
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {currencyFormatter.format(listing.nightlyPrice)}{" "}
                  <span className="text-sm font-normal text-slate-500">per night</span>
                </p>
              </div>
              {renderMediaGrid()}
              {showEditForm && (
                <div className="flex flex-col gap-2 text-sm">
                  {mediaError && (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{mediaError}</div>
                  )}
                  <button
                    type="button"
                    className="w-fit text-primary underline-offset-4 transition hover:underline disabled:opacity-50"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingMedia || attachPhotos.isPending}
                  >
                    {uploadingMedia || attachPhotos.isPending ? "Uploading media..." : "Add image / video +"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="hidden"
                    onChange={handleMediaSelection}
                  />
                  <p className="text-xs text-slate-500">Supported: JPG, PNG, MP4 up to 10MB per file.</p>
                </div>
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-slate-200 md:col-span-2">
              <CardHeader>
                <CardTitle>About this listing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-700">
                {listing.summary && <p className="font-semibold text-slate-900">{listing.summary}</p>}
                <p className="leading-relaxed text-slate-600">{listing.description}</p>
                <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Guests</p>
                    <p className="text-lg font-semibold text-slate-900">{listing.maxGuests}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Bedrooms</p>
                    <p className="text-lg font-semibold text-slate-900">{listing.bedrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Bathrooms</p>
                    <p className="text-lg font-semibold text-slate-900">{listing.bathrooms}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Minimum nights</p>
                    <p className="text-lg font-semibold text-slate-900">{listing.minNights}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Pricing breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                <div className="flex items-center justify-between">
                  <span>Nightly rate</span>
                  <span className="font-semibold text-slate-900">
                    {currencyFormatter.format(listing.nightlyPrice)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cleaning fee</span>
                  <span className="font-semibold text-slate-900">
                    {currencyFormatter.format(listing.cleaningFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Service fee</span>
                  <span className="font-semibold text-slate-900">
                    {currencyFormatter.format(listing.serviceFee)}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Update fees anytime to reflect operational costs. Guests will see the total before booking.
                </p>
              </CardContent>
        </Card>
      </section>

          <section className="grid gap-4 md:grid-cols-2">
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.amenities.length === 0 ? (
                  <p className="text-sm text-slate-500">No amenities added yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {listing.amenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>House rules</CardTitle>
              </CardHeader>
              <CardContent>
                {listing.houseRules.length === 0 ? (
                  <p className="text-sm text-slate-500">No rules set yet.</p>
                ) : (
                  <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {listing.houseRules.map((rule) => (
                      <li key={rule}>{rule}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>

          {listing.calendarBlocks && listing.calendarBlocks.length > 0 && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Upcoming blackout ranges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                {listing.calendarBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-700"
                  >
                    <p className="font-semibold text-slate-900">
                      {new Date(block.startDate).toLocaleDateString()} –{" "}
                      {new Date(block.endDate).toLocaleDateString()}
                    </p>
                    {block.reason && <p className="text-xs text-slate-500">{block.reason}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {showEditForm && (
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle>Edit listing</CardTitle>
                <p className="text-sm text-slate-500">
                  Update textual information. For photo or media changes use the upload actions inside the listing
                  workflow (coming soon).
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusMessage && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                    {statusMessage}
                  </div>
                )}
                {errorMessage && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                    {errorMessage}
                  </div>
                )}
                <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Title</span>
                    <Input {...register("title", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Summary</span>
                    <Input {...register("summary")} placeholder="Short headline for cards" />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-slate-800">Description</span>
                    <textarea
                      className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      rows={4}
                      {...register("description", { required: true })}
                    />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Address line 1</span>
                    <Input {...register("addressLine1", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Address line 2</span>
                    <Input {...register("addressLine2")} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">City</span>
                    <Input {...register("city", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">State</span>
                    <Input {...register("state")} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Country</span>
                    <Input {...register("country", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Postal code</span>
                    <Input {...register("postalCode")} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Nightly price</span>
                    <Input type="number" min="0" {...register("nightlyPrice", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Cleaning fee</span>
                    <Input type="number" min="0" {...register("cleaningFee", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Service fee</span>
                    <Input type="number" min="0" {...register("serviceFee", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Max guests</span>
                    <Input type="number" min="1" {...register("maxGuests", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Bedrooms</span>
                    <Input type="number" min="0" {...register("bedrooms", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Bathrooms</span>
                    <Input type="number" min="0" {...register("bathrooms", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-slate-800">Amenities (comma separated)</span>
                    <Input {...register("amenities")} />
                  </label>
                  <label className="space-y-2 text-sm md:col-span-2">
                    <span className="font-semibold text-slate-800">House rules (comma separated)</span>
                    <Input {...register("houseRules")} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Minimum nights</span>
                    <Input type="number" min="1" {...register("minNights", { required: true })} />
                  </label>
                  <label className="space-y-2 text-sm">
                    <span className="font-semibold text-slate-800">Maximum nights</span>
                    <Input type="number" min="1" {...register("maxNights")} />
                  </label>
                  <div className="md:col-span-2">
                    <Button
                      type="primary"
                      className="w-full rounded-2xl md:w-auto"
                      buttonType="submit"
                      disabled={
                        isSubmitting ||
                        updateListing.isPending ||
                        deletePhotoMutation.isPending ||
                        (!isDirty && pendingPhotoRemovals.length === 0)
                      }
                    >
                      <span className="flex items-center justify-center gap-2">
                        {(isSubmitting || updateListing.isPending || deletePhotoMutation.isPending) && (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        <span>Save changes</span>
                      </span>
                    </Button>
                  </div>
                  {pendingPhotoRemovals.length > 0 && (
                    <p className="md:col-span-2 text-xs text-rose-600">
                      {pendingPhotoRemovals.length} photo{pendingPhotoRemovals.length > 1 ? "s" : ""} will be removed on
                      save.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
