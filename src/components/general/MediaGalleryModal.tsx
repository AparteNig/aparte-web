"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

export type MediaItem = {
  id: number;
  url: string;
  caption?: string;
  type: "image" | "video";
};

type MediaGalleryModalProps = {
  open: boolean;
  items: MediaItem[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

const MediaGalleryModal = ({ open, items, activeIndex, onClose, onPrev, onNext, onSelect }: MediaGalleryModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowLeft") {
        onPrev();
      } else if (event.key === "ArrowRight") {
        onNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;

  const media = items[activeIndex];

  return createPortal(
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
      <div className="flex items-center justify-between px-6 py-4 text-white">
        <p className="text-sm uppercase tracking-widest">Media Gallery</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/30 px-3 py-1 text-sm font-medium text-white hover:bg-white/10"
        >
          Close
        </button>
      </div>
      <div className="relative flex flex-1 items-center justify-center px-4 py-6 text-white">
        <button
          type="button"
          aria-label="Previous"
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-xl font-semibold hover:bg-white/30"
        >
          ‹
        </button>
        <div className="flex max-h-[80vh] max-w-5xl flex-1 items-center justify-center">
          {media?.type === "video" ? (
            <video
              src={media.url}
              className="max-h-[80vh] w-full rounded-3xl border border-white/20 object-contain"
              controls
              autoPlay
            />
          ) : (
            <img
              src={media?.url}
              alt={media?.caption ?? "Listing media"}
              className="max-h-[80vh] w-full rounded-3xl border border-white/20 object-contain"
            />
          )}
        </div>
        <button
          type="button"
          aria-label="Next"
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 text-xl font-semibold hover:bg-white/30"
        >
          ›
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 px-6 pb-6">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(index)}
            className={`h-16 w-16 overflow-hidden rounded-lg border ${
              index === activeIndex ? "border-white" : "border-white/30"
            }`}
          >
            {item.type === "video" ? (
              <video src={item.url} className="h-full w-full object-cover" muted />
            ) : (
              <img src={item.url} alt={item.caption ?? "Listing media thumbnail"} className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>
    </div>,
    document.body,
  );
};

export default MediaGalleryModal;
