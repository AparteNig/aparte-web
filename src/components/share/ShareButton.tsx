"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";

/**
 * Share control with a graceful ladder of fallbacks.
 *
 * `navigator.share` only exists on mobile browsers and requires a secure
 * context, and `navigator.clipboard` is likewise unavailable over plain HTTP.
 * Rather than presenting a button that silently does nothing on a desktop or a
 * LAN dev server, each rung falls through to the next, ending at a manual
 * select-and-copy that works everywhere.
 */
export default function ShareButton({
  url,
  title,
  text,
  className,
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleShare = async () => {
    setFailed(false);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Dismissing the sheet rejects with AbortError. That is a choice, not
        // a failure, so it must not fall through to copying the link.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-2 rounded-full border border-[#0f2f2a] px-5 py-2.5 text-sm font-semibold text-[#0f2f2a] transition hover:bg-[#0f2f2a] hover:text-[#fdfbf7]"
      >
        {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
        {copied ? "Link copied" : "Share"}
      </button>

      {/* Last resort: the URL itself, selectable. Nothing to click, nothing to
          fail — it works on desktop browsers without the Share API and on any
          insecure-context page where the clipboard is unavailable. */}
      {failed && (
        <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Link2 className="size-3.5 shrink-0 text-slate-400" />
          <input
            readOnly
            value={url}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full bg-transparent text-xs text-slate-600 outline-none"
            aria-label="Shareable link"
          />
        </div>
      )}
    </div>
  );
}
