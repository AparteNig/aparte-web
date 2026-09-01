import { COMPANY, POLICY } from "@/lib/company";
import type { LegalDoc } from "./types";

const { legalName, tradingName, emails, address, rcNumber, country } = COMPANY;

export const privacyDoc: LegalDoc = {
  title: "Privacy Policy",
  summary: `What personal data ${tradingName} collects, why we collect it, who we share it with, and the rights you have over it.`,
  effectiveDate: "16 August 2026",
  lastUpdated: "16 August 2026",
  preamble: [
    {
      type: "text",
      content: `${legalName} (${rcNumber}), of ${address}, is the data controller for personal data processed through the ${tradingName} website and mobile applications (the **Platform**). This policy explains how we handle that data under the Nigeria Data Protection Act 2023 (**NDPA**) and other applicable law.`,
    },
    {
      type: "callout",
      title: "The short version",
      content: `We collect what we need to run bookings safely — who you are, what you booked, and what you paid. We never see or store your card number. We do not sell your personal data. You can ask us for a copy of your data, or ask us to delete it, at any time.`,
    },
  ],
  sections: [
    {
      id: "what-we-collect",
      title: "What we collect",
      blocks: [
        {
          type: "table",
          head: ["Category", "What it includes", "Where it comes from"],
          rows: [
            [
              "Account data",
              "Name, email address, phone number, password (stored only as a hash), profile photo, role (Guest, Host or Admin).",
              "You, at sign-up.",
            ],
            [
              "Verification data",
              "Government-issued ID document (NIN, international passport, driver's licence or voter's card) and a selfie, from both Guests and Hosts. Address, business registration and bank account details, from Hosts.",
              "You — Guests before their first booking, Hosts during onboarding.",
            ],
            [
              "Listing and vehicle data",
              "Property address, photographs, description, pricing, availability, vehicle registration and particulars.",
              "Hosts.",
            ],
            [
              "Booking data",
              "Dates, guest counts, prices and fee breakdown, booking status, check-in codes, caution deposit records, cancellations and refunds.",
              "Generated as you use the Platform.",
            ],
            [
              "Payment data",
              "Transaction reference, amount, status, payment method type, last four digits of the card, and payout bank details for Hosts.",
              "Our payment processor. **We never receive or store full card numbers or CVVs.**",
            ],
            [
              "Communications",
              "Messages between Guests and Hosts, support conversations, and the notifications we send you.",
              "You and other users.",
            ],
            [
              "Device and usage data",
              "IP address, device model and operating system, app version, login sessions and known devices, pages and screens viewed, crash and error reports.",
              "Collected automatically.",
            ],
            [
              "Location data",
              "Approximate location from your IP address, and — on mobile, only if you grant permission — device location used to show nearby listings and to power map search.",
              "Your device.",
            ],
          ],
        },
        {
          type: "text",
          content:
            "We do not deliberately collect special-category data such as health or religious belief. Please do not include it in messages or listing descriptions.",
        },
      ],
    },
    {
      id: "why-we-use-it",
      title: "Why we use it, and our lawful basis",
      blocks: [
        {
          type: "table",
          head: ["Purpose", "Lawful basis under the NDPA"],
          rows: [
            [
              "Create and maintain your account; authenticate you; send one-time codes.",
              "Performance of a contract with you.",
            ],
            [
              "Take bookings, collect payment, calculate fees, hold and release caution deposits, pay Hosts.",
              "Performance of a contract with you.",
            ],
            [
              "Share the details a Guest and Host need to complete a booking.",
              "Performance of a contract with you.",
            ],
            [
              "Verify the identity of Guests and Hosts before a booking is made, screen for fraud, investigate misuse, and keep the Platform safe.",
              "Legitimate interest in a safe marketplace, and legal obligation.",
            ],
            [
              "Provide customer support and resolve disputes.",
              "Performance of a contract, and legitimate interest.",
            ],
            [
              "Diagnose crashes, measure how features are used, and improve the product.",
              "Legitimate interest, and consent where required for analytics cookies.",
            ],
            [
              "Send service messages about your bookings.",
              "Performance of a contract with you.",
            ],
            [
              "Send marketing about new features or offers.",
              "Consent. You can withdraw it at any time.",
            ],
            [
              "Meet accounting, tax, anti-money-laundering and other legal obligations.",
              "Legal obligation.",
            ],
          ],
        },
      ],
    },
    {
      id: "payments",
      title: "Payment information",
      blocks: [
        {
          type: "text",
          content: `Card payments are processed by **Paystack**, a licensed payment service provider. When you pay, your card details are entered directly into Paystack's secure form and transmitted to them — they do not pass through ${tradingName} servers and we do not store them.`,
        },
        {
          type: "text",
          content:
            "We receive and keep only what we need to reconcile a booking: the transaction reference, amount, currency, status, method type and the last four digits of the card. Paystack processes your card data as an independent controller under its own privacy policy.",
        },
        {
          type: "text",
          content:
            "For Hosts, we store the bank account number, bank code and verified account name needed to send payouts.",
        },
      ],
    },
    {
      id: "who-we-share-with",
      title: "Who we share it with",
      blocks: [
        {
          type: "text",
          content: "**Other users.** A booking requires both sides to know some things about each other:",
        },
        {
          type: "list",
          items: [
            "The Host sees the Guest's name, profile photo, booking details and the messages between them. They do not see the Guest's full contact details unless the Guest shares them.",
            "The Guest sees the Host's name, profile photo, listing details and, once a booking is confirmed, the address and any arrival instructions.",
            "Neither side ever sees the other's payment details, identity documents or password.",
          ],
        },
        {
          type: "text",
          content: "**Service providers.** We use a small number of processors, each bound by contract to use the data only on our instructions:",
        },
        {
          type: "table",
          head: ["Provider", "What they do", "What they process"],
          rows: [
            ["Paystack", "Payments, refunds and Host payouts", "Payment and bank data"],
            ["Amazon Web Services", "Hosting, database and file storage", "All Platform data"],
            ["Amazon SES", "Transactional email", "Email address, message content"],
            ["Our SMS delivery partner", "One-time codes and booking alerts", "Phone number, message content"],
            ["Google Maps Platform", "Maps, place search and distance calculation", "Approximate or device location"],
            ["Sentry", "Crash and error reporting", "Device data, error context, user ID"],
            ["PostHog", "Product analytics", "Usage events, device data, user ID"],
            ["Vercel", "Web application hosting", "Request and device data"],
          ],
        },
        {
          type: "text",
          content:
            "**Authorities and legal.** We disclose data where we are legally required to, or where it is necessary to establish or defend a legal claim, to prevent fraud, or to protect someone's life or safety.",
        },
        {
          type: "text",
          content:
            "**Business transfers.** If we are involved in a merger, acquisition or sale of assets, data may transfer to the successor. We will notify you before your data becomes subject to a different privacy policy.",
        },
        {
          type: "callout",
          title: "We do not sell your data",
          content:
            "We do not sell personal data, and we do not share it with third-party advertisers for their own marketing.",
        },
      ],
    },
    {
      id: "transfers",
      title: "International transfers",
      blocks: [
        {
          type: "text",
          content: `Some of our providers store or process data outside ${country}. Where that happens we rely on the transfer mechanisms permitted by the NDPA — an adequacy decision by the Nigeria Data Protection Commission, or contractual safeguards obliging the recipient to protect the data to an equivalent standard. You can ask us for details of the safeguards that apply to a particular transfer.`,
        },
      ],
    },
    {
      id: "retention",
      title: "How long we keep it",
      blocks: [
        {
          type: "list",
          items: [
            "**Account data** — for as long as your account is open, and up to 24 months after closure so we can handle disputes and repeat sign-up abuse.",
            "**Booking, payment and payout records** — at least 6 years after the booking, to meet accounting and tax obligations.",
            "**Identity verification documents** — the ID image and selfie are deleted 14 days after your check is approved. We keep only a record that the check happened: the type of document, who reviewed it and when. A submission that was not accepted is deleted 90 days after the decision, so you have time to query it. This applies to Guests and Hosts alike.",
            "**Messages** — for as long as the account is open, and for the duration of any dispute.",
            `**Caution deposit records** — kept with the booking record. The deposit itself is held only until release, ${POLICY.cautionReleaseHours} hours after the stay ends unless a claim is raised.`,
            "**Analytics and crash data** — typically 12 months.",
          ],
        },
        {
          type: "text",
          content:
            "When a retention period ends we delete the data or irreversibly anonymise it so it can no longer identify you.",
        },
      ],
    },
    {
      id: "your-rights",
      title: "Your rights",
      blocks: [
        {
          type: "text",
          content: "Under the NDPA you have the right to:",
        },
        {
          type: "list",
          items: [
            "**Access** — get a copy of the personal data we hold about you.",
            "**Rectification** — have inaccurate or incomplete data corrected.",
            "**Erasure** — ask us to delete your data, where we have no overriding legal reason to keep it.",
            "**Restriction** — ask us to pause processing while a dispute about accuracy or legitimate interest is resolved.",
            "**Portability** — receive the data you gave us in a structured, machine-readable format.",
            "**Object** — object to processing based on legitimate interest, and to direct marketing at any time.",
            "**Withdraw consent** — where processing relies on consent, withdraw it without affecting what was done beforehand.",
          ],
        },
        {
          type: "text",
          content: `To exercise any of these, email [${emails.privacy}](mailto:${emails.privacy}). We will respond within 30 days. We may ask you to verify your identity first — that check protects your data from someone impersonating you.`,
        },
        {
          type: "text",
          content:
            "If you are unhappy with our response you may complain to the **Nigeria Data Protection Commission (NDPC)**.",
        },
      ],
    },
    {
      id: "security",
      title: "How we protect it",
      blocks: [
        {
          type: "list",
          items: [
            "Data is encrypted in transit with TLS, and at rest in our database and file storage.",
            "Passwords are stored only as salted hashes. Nobody at Aparte can read your password.",
            "Access to the Platform uses short-lived access tokens with separate refresh tokens, and we track known devices and active sessions so you can end one you do not recognise.",
            "Uploaded files — identity documents, listing photographs — are stored in private storage and served only through short-lived signed links.",
            "Administrative access is role-based and limited to staff who need it, and admin actions are recorded in an audit log.",
          ],
        },
        {
          type: "text",
          content:
            "No system is perfectly secure. If a breach occurs that is likely to result in a risk to your rights, we will notify the NDPC and affected users as the NDPA requires.",
        },
      ],
    },
    {
      id: "cookies",
      title: "Cookies and similar technologies",
      blocks: [
        {
          type: "list",
          items: [
            "**Strictly necessary** — keep you signed in, remember your session, and protect against cross-site request forgery. These cannot be turned off.",
            "**Analytics** — help us understand which features are used and where people get stuck. Set only with your consent where consent is required.",
          ],
        },
        {
          type: "text",
          content:
            "You can clear or block cookies in your browser settings, but blocking strictly necessary cookies will stop you from signing in. On mobile, you can reset the advertising identifier and revoke location permission in your device settings at any time.",
        },
      ],
    },
    {
      id: "children",
      title: "Children",
      blocks: [
        {
          type: "text",
          content: `The Platform is not for anyone under ${POLICY.minimumAge}. We do not knowingly collect data from children. If you believe a child has given us personal data, contact [${emails.privacy}](mailto:${emails.privacy}) and we will delete it.`,
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to this policy",
      blocks: [
        {
          type: "text",
          content:
            "We update this policy as the Platform and the law change. The revised version is posted here with a new effective date, and where a change materially affects how we use your data we will notify you by email or in the app before it takes effect.",
        },
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      blocks: [
        {
          type: "text",
          content: "For any question about this policy or your personal data:",
        },
        {
          type: "list",
          items: [
            `Privacy and data requests — [${emails.privacy}](mailto:${emails.privacy})`,
            `General support — [${emails.support}](mailto:${emails.support})`,
            `${legalName} (${rcNumber}), ${address}`,
          ],
        },
        {
          type: "text",
          content: "See also our [Terms and Conditions](/legal/terms).",
        },
      ],
    },
  ],
};
