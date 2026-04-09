'use client';

import { useParams, useRouter } from 'next/navigation';
import { useRef, useState, useMemo } from 'react';
import { useHostVehicleQuery, useAddVehiclePhotosMutation, useDeleteVehiclePhotoMutation } from '@/hooks/use-host-vehicles';
import { uploadVehicleAsset } from '@/lib/api-client';
import Button from '@/components/general/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MediaGalleryModal, { type MediaItem } from '@/components/general/MediaGalleryModal';

const isVideoUrl = (url: string) => /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);

export default function VehiclePhotosPage() {
  const params = useParams<{ vehicleId: string }>();
  const router = useRouter();
  const vehicleId = Number(params.vehicleId);
  const { data: vehicle, isLoading } = useHostVehicleQuery(vehicleId);
  const addPhotos = useAddVehiclePhotosMutation(vehicleId);
  const deletePhoto = useDeleteVehiclePhotoMutation(vehicleId);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const mediaItems = useMemo<MediaItem[]>(
    () =>
      (vehicle?.photos ?? []).map((p) => ({
        id: p.id,
        url: p.url,
        caption: p.caption,
        type: isVideoUrl(p.url) ? 'video' : 'image',
      })),
    [vehicle?.photos]
  );

  const openGallery = (index: number) => {
    setActiveIndex(index);
    setGalleryOpen(true);
  };

  const handleFiles = async (files: FileList) => {
    setUploadError(null);
    try {
      const uploads = await Promise.all(
        Array.from(files).map(async (file, i) => {
          const { key } = await uploadVehicleAsset(vehicleId, file);
          return { key, sortOrder: (vehicle?.photos.length ?? 0) + i };
        })
      );
      await addPhotos.mutateAsync(uploads);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    }
  };

  if (isLoading) return <div className="p-6 text-sm text-slate-500">Loading...</div>;
  if (!vehicle) return <div className="p-6 text-sm text-slate-500">Vehicle not found.</div>;

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={() => router.push(`/host/dashboard/vehicles/${vehicleId}`)}
          className="mb-2 text-xs text-slate-500 hover:text-slate-700">← Back to vehicle</button>
        <h3 className="text-2xl font-semibold">Photos & videos</h3>
        <p className="text-sm text-slate-600">{vehicle.year} {vehicle.make} {vehicle.model}</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Media ({vehicle.photos.length})</CardTitle>
            <Button type="primary" className="rounded-2xl" onClick={() => fileInputRef.current?.click()}
              disabled={addPhotos.isPending}>
              {addPhotos.isPending ? 'Uploading...' : 'Add photos / videos'}
            </Button>
          </div>
          <p className="text-xs text-slate-500">Images are compressed automatically. Videos up to 100 MB.</p>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => { if (e.target.files?.length) handleFiles(e.target.files); e.target.value = ''; }}
          />

          {uploadError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{uploadError}</div>
          )}

          {vehicle.photos.length === 0 ? (
            <div
              className="cursor-pointer rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 hover:border-primary/50 hover:bg-slate-50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              No media yet. Click to add photos or videos of your vehicle.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {vehicle.photos.map((p, index) => {
                const isVid = isVideoUrl(p.url);
                return (
                  <div key={p.id} className="group relative">
                    {isVid ? (
                      <div
                        className="relative h-28 w-full cursor-pointer rounded-xl bg-slate-900 overflow-hidden"
                        onClick={() => openGallery(index)}
                      >
                        <video src={p.url} className="h-full w-full object-cover opacity-70" muted />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="rounded-full bg-white/80 p-2 text-lg leading-none">▶</span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={p.url}
                        alt={p.caption || 'Vehicle photo'}
                        className="h-28 w-full cursor-pointer rounded-xl object-cover"
                        onClick={() => openGallery(index)}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => deletePhoto.mutate(p.id)}
                      disabled={deletePhoto.isPending}
                      className="absolute right-1 top-1 hidden rounded-full bg-white/90 px-2 py-0.5 text-xs text-rose-600 shadow group-hover:block"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MediaGalleryModal
        open={galleryOpen}
        items={mediaItems}
        activeIndex={activeIndex}
        onClose={() => setGalleryOpen(false)}
        onPrev={() => setActiveIndex((i) => (i - 1 + mediaItems.length) % mediaItems.length)}
        onNext={() => setActiveIndex((i) => (i + 1) % mediaItems.length)}
        onSelect={(i) => setActiveIndex(i)}
      />
    </div>
  );
}
