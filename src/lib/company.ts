/**
 * Single source of truth for the identity details that appear in public legal
 * copy. They live here rather than inline in the documents because the same
 * entity name and addresses must agree across Terms, Privacy, store listings
 * and any contract we send out — and because they are the parts a lawyer will
 * want to change without touching page markup.
 *
 * ⚠️ CONFIRM BEFORE LAUNCH — the marked values are placeholders. A published
 * legal page states them as fact, so they must be verified against the CAC
 * registration before these pages go live.
 */
export const COMPANY = {
  /** ⚠️ CONFIRM — registered entity name on the CAC certificate. */
  legalName: "Aparte Technologies Limited",
  tradingName: "Aparte",
  /** ⚠️ CONFIRM — CAC registration number. */
  rcNumber: "RC 0000000",
  /** ⚠️ CONFIRM — registered office address. */
  address: "Lagos, Nigeria",
  country: "Nigeria",
  jurisdiction: "the Federal Republic of Nigeria",
  courts: "the courts of Lagos State, Nigeria",
  site: "stayaparte.com",
  emails: {
    support: "support@stayaparte.com",
    privacy: "privacy@stayaparte.com",
    legal: "legal@stayaparte.com",
  },
} as const;

/**
 * Product rules quoted in the legal copy. These mirror the backend defaults in
 * `aparte-backend/src/config/env.ts` and `modules/payments/pricing.ts`. If a
 * default changes there, it changes here too — publishing a fee percentage we
 * do not actually charge is a consumer-protection problem, not a typo.
 */
export const POLICY = {
  guestServiceFeePercent: 8,
  hostCommissionPercent: 7,
  cautionReleaseHours: 72,
  hostApprovalWindowMinutes: 15,
  minimumAge: 18,
} as const;
