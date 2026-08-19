/**
 * Canonical share URLs.
 *
 * One builder used by both the web pages and (mirrored in the mobile app) the
 * native share sheet, so a link pasted into WhatsApp is the same string
 * wherever it was generated. Sharing a raw `aparte://` deep link was never an
 * option: it does nothing at all for a recipient who does not have the app,
 * which is most of them.
 */

/**
 * The public origin. Falls back to the real domain rather than a placeholder —
 * a wrong origin here produces links that 404 for every recipient, which is
 * worse than a build-time failure.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://stayaparte.com"
).replace(/\/$/, "");

export type ShareKind = "listing" | "vehicle";

export const shareUrl = (kind: ShareKind, id: number | string) =>
  `${SITE_URL}/${kind}/${id}`;

/**
 * Stable URL for a preview image.
 *
 * S3 photo URLs come back presigned and therefore expire. Social platforms
 * cache the image they scrape at share time, so a presigned URL yields a
 * preview card that works for an hour and then shows a broken image forever.
 * This route re-resolves a fresh signed URL on every request, so the address
 * embedded in the card never goes stale.
 */
export const shareImageUrl = (kind: ShareKind, id: number | string) =>
  `${SITE_URL}/api/og/${kind}/${id}`;

/** Naira, no decimals — matches how prices read everywhere else. */
export const formatNaira = (amount: number | null | undefined) =>
  `₦${Number(amount ?? 0).toLocaleString("en-NG")}`;
