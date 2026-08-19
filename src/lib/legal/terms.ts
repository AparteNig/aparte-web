import { COMPANY, POLICY } from "@/lib/company";
import type { LegalDoc } from "./types";

const { legalName, tradingName, emails, jurisdiction, courts, address, rcNumber } =
  COMPANY;

export const termsDoc: LegalDoc = {
  title: "Terms and Conditions",
  summary: `The agreement between you and ${tradingName} when you book a stay, rent a vehicle, or list a property on our platform.`,
  effectiveDate: "16 August 2026",
  lastUpdated: "16 August 2026",
  preamble: [
    {
      type: "text",
      content: `These Terms govern your use of the ${tradingName} website, mobile applications and related services (the **Platform**), operated by ${legalName} (${rcNumber}), a company registered in ${jurisdiction} with its registered office at ${address} ("**${tradingName}**", "we", "us").`,
    },
    {
      type: "text",
      content:
        "By creating an account, making a booking, or listing a property or vehicle, you confirm that you have read and accepted these Terms. If you do not accept them, do not use the Platform.",
    },
    {
      type: "callout",
      title: "The short version",
      content: `${tradingName} is a marketplace. We connect Guests with Hosts and handle payment, but the stay or rental itself is a contract between the Guest and the Host. We charge a service fee, we hold caution deposits in escrow, and we can remove anyone who breaks these rules.`,
    },
  ],
  sections: [
    {
      id: "definitions",
      title: "Definitions",
      blocks: [
        {
          type: "list",
          items: [
            "**Guest** — a person who books a Listing or a Vehicle through the Platform.",
            "**Host** — a person or business that offers a Listing or a Vehicle on the Platform.",
            "**Listing** — a short-term accommodation offered by a Host.",
            "**Vehicle** — a car or other vehicle offered for rental by a Host, with or without a driver.",
            "**Booking** — a confirmed reservation of a Listing or Vehicle for defined dates.",
            "**Caution Deposit** — a refundable amount collected from the Guest and held by us against damage or breach of house rules.",
            "**Booking Contract** — the agreement formed directly between the Guest and the Host when a Booking is confirmed.",
          ],
        },
      ],
    },
    {
      id: "our-role",
      title: "Our role",
      blocks: [
        {
          type: "text",
          content: `${tradingName} provides the Platform on which Hosts publish Listings and Vehicles and Guests book them. We are not a party to the Booking Contract, we do not own, manage or control any Listing or Vehicle, and we do not act as an agent for either side except in collecting and disbursing payment as described in these Terms.`,
        },
        {
          type: "text",
          content:
            "We review Listings and verify Host identity before publication, but that review is not a warranty. We do not guarantee the condition, safety, legality or accuracy of any Listing or Vehicle, and we do not guarantee that a Guest will behave as described.",
        },
      ],
    },
    {
      id: "eligibility",
      title: "Accounts and eligibility",
      blocks: [
        {
          type: "list",
          items: [
            `You must be at least ${POLICY.minimumAge} years old to hold an account.`,
            "You must give accurate registration details and keep them current.",
            "You are responsible for everything done under your account. Keep your password and one-time codes private, and tell us immediately if you suspect unauthorised access.",
            "One person, one account. We may merge or close duplicate accounts.",
            "Hosts must complete identity verification, including a government-issued ID and payout details, before a Listing or Vehicle can be published.",
            "We may refuse, suspend or close an account where verification fails, information is false, or use of the Platform breaches these Terms or the law.",
          ],
        },
      ],
    },
    {
      id: "how-bookings-work",
      title: "How a booking works",
      blocks: [
        {
          type: "text",
          content:
            "Accommodation and vehicle bookings both follow the same sequence. Payment comes first, and the Host then has a short window to accept.",
        },
        {
          type: "steps",
          items: [
            "**You pay.** The Guest pays the full amount shown at checkout. Nothing is reserved until payment succeeds.",
            `**The Host has ${POLICY.hostApprovalWindowMinutes} minutes to respond.** This window is the Host's only opportunity to decline the Booking.`,
            `**Silence means yes.** If the Host does not respond within the window, the Booking is automatically accepted on their behalf. A Guest who has paid is never left waiting indefinitely.`,
            "**The Booking is confirmed.** A six-digit check-in code is issued to the Guest, and the Booking Contract between Guest and Host takes effect.",
            "**Check-in.** The Guest gives the code to the Host at arrival or vehicle pickup. The code proves the Guest arrived, can only be used once, and starts the stay or rental.",
            "**Check-out and completion.** After the stay or rental ends, the Booking completes, the Host's payout is credited, and the Caution Deposit release clock starts.",
          ],
        },
        {
          type: "callout",
          title: "After the approval window closes",
          content:
            "Once a Booking leaves the approval stage the Host has no unilateral right to cancel it. Later cancellations are handled by our support team under section 8.",
        },
      ],
    },
    {
      id: "prices-and-fees",
      title: "Prices, fees and payment",
      blocks: [
        {
          type: "text",
          content:
            "Hosts set their own nightly or daily rate and any extras such as cleaning or a driver. We add our fees on top, and every amount is shown to the Guest before payment. All prices are in Nigerian Naira (₦) unless stated otherwise.",
        },
        {
          type: "table",
          head: ["Charge", "Who pays", "How it is calculated"],
          rows: [
            [
              "Accommodation or rental rate",
              "Guest",
              "Set by the Host — nights × nightly rate, or days × daily rate.",
            ],
            [
              "Host extras (cleaning, driver, and similar)",
              "Guest",
              "Set by the Host and passed to them in full. We take no commission on these.",
            ],
            [
              "Guest service fee",
              "Guest",
              `${POLICY.guestServiceFeePercent}% of the accommodation or rental rate only.`,
            ],
            [
              "Host commission",
              "Host",
              `${POLICY.hostCommissionPercent}% of the accommodation or rental rate only, deducted from the payout.`,
            ],
            [
              "Caution Deposit",
              "Guest",
              "Set by the Host where applicable. Refundable — see section 6. No fee or commission is charged on it.",
            ],
          ],
        },
        {
          type: "text",
          content:
            "Our fees are charged on the core time-based rate alone. We do not commission a Host's pass-through extras, and we never take a cut of a refundable deposit.",
        },
        {
          type: "text",
          content: `Payments are processed by our payment partner, Paystack. Card details are entered directly with Paystack and are never stored on ${tradingName} systems. We may change our fee percentages on notice; the fees shown at the time you book are the fees that apply to that Booking.`,
        },
      ],
    },
    {
      id: "caution-deposits",
      title: "Caution deposits",
      blocks: [
        {
          type: "text",
          content:
            "Where a Host requires a Caution Deposit, we collect it from the Guest at checkout and hold it. It belongs to neither party until the stay resolves.",
        },
        {
          type: "list",
          items: [
            `The deposit is released automatically to the Guest **${POLICY.cautionReleaseHours} hours** after the scheduled end of the stay or rental, unless a claim is raised before then.`,
            "A Host raising a claim must do so within that window and must provide evidence — photographs, receipts or a repair quote.",
            "We assess claims and may release all, part or none of the deposit to the Host. We will tell both parties the outcome and our reason.",
            "A deposit is not a cap on liability. A Guest remains responsible for loss or damage exceeding the deposit, and a Host may pursue the balance directly.",
            "We do not charge any fee or commission on a Caution Deposit.",
          ],
        },
      ],
    },
    {
      id: "guest-obligations",
      title: "Guest obligations",
      blocks: [
        {
          type: "list",
          items: [
            "Use the Listing or Vehicle only for the purpose and for the number of people stated in the Booking.",
            "Follow the Host's house rules, including rules on smoking, pets, noise and visitors.",
            "Do not sublet, re-list or commercially exploit a Listing or Vehicle.",
            "Do not hold an event or party at a Listing without the Host's written permission.",
            "Leave the Listing in the condition you found it, allowing for reasonable wear.",
            "Report damage, faults or safety issues to the Host and to us promptly.",
            "Do not exceed the stated check-out time without agreement. Overstaying may be charged at the Host's rate plus any loss caused to the next Booking.",
          ],
        },
      ],
    },
    {
      id: "host-obligations",
      title: "Host obligations",
      blocks: [
        {
          type: "list",
          items: [
            "You must have the legal right to let the property or rent out the vehicle, including any landlord, mortgage, insurance or building consent required.",
            "Your Listing must be accurate. Photographs must be of the actual property or vehicle and must be current.",
            "You must honour confirmed Bookings. Cancelling a confirmed Booking without cause may result in the Guest being refunded in full, a charge for the cost of rehousing them, and suspension of your account.",
            "The property or vehicle must be clean, safe, and in the condition advertised on arrival, with working locks, utilities and any advertised amenities.",
            "Vehicles must be roadworthy, currently registered and insured for rental use, with valid particulars available for inspection.",
            "You are responsible for your own tax obligations on income earned through the Platform, and for any permits or licences local law requires of you.",
            "You must not ask a Guest to pay outside the Platform, or to move a booking off the Platform. Doing so removes every protection either side has and is grounds for removal.",
          ],
        },
      ],
    },
    {
      id: "cancellations",
      title: "Cancellations and refunds",
      blocks: [
        {
          type: "list",
          items: [
            "**Host declines within the approval window** — the Guest is refunded in full, including all fees.",
            "**Guest cancels before check-in** — the accommodation or rental amount is refunded according to the cancellation policy shown on the Listing at the time of booking. The Caution Deposit is always refunded in full.",
            "**Guest cancels after check-in** — the nights or days already taken are not refundable. Remaining nights may be refunded at our discretion.",
            "**Host cancels a confirmed Booking** — the Guest is refunded in full and we may charge the Host for the reasonable cost of rehousing the Guest.",
            "**We cancel** — where a Listing, Vehicle or account is found to breach these Terms or the law, the Guest is refunded in full.",
          ],
        },
        {
          type: "text",
          content:
            "Approved refunds are returned to the original payment method through Paystack. The time to appear in your account depends on your bank and is outside our control — typically 5 to 10 business days.",
        },
      ],
    },
    {
      id: "vehicle-rentals",
      title: "Vehicle rentals",
      blocks: [
        {
          type: "text",
          content:
            "Vehicle bookings carry additional requirements alongside everything above.",
        },
        {
          type: "list",
          items: [
            "For a self-drive rental, the Guest must hold a valid driver's licence, present it at pickup, and be the only person who drives the Vehicle unless an additional driver is named on the Booking.",
            "The Guest is responsible for all traffic offences, fines, tolls and parking charges incurred during the rental period, and we may recover these after the rental ends.",
            "The Vehicle must not be driven under the influence of alcohol or drugs, used for racing or towing, used to carry unlawful goods, or taken outside any geographic limit stated on the Booking.",
            "Fuel, mileage limits and late-return charges are set by the Host and shown on the Listing before booking.",
            "Accidents, theft and breakdowns must be reported to the Host, to the police where required, and to us as soon as it is safe to do so.",
            "Where a driver is provided, the driver remains the Host's responsibility, and the Guest must not direct the driver to breach traffic law.",
          ],
        },
      ],
    },
    {
      id: "prohibited-conduct",
      title: "Prohibited conduct",
      blocks: [
        {
          type: "text",
          content: "You must not use the Platform to:",
        },
        {
          type: "list",
          items: [
            "break any law, or list a property or vehicle you are not entitled to offer;",
            "discriminate against anyone on the basis of ethnicity, religion, gender, disability, or any other protected characteristic;",
            "post false, misleading, obscene, defamatory or infringing content;",
            "harass, threaten or endanger another user;",
            "circumvent our payment system, or solicit payment or contact outside the Platform;",
            "create fake Bookings, fake reviews or multiple accounts to manipulate ranking or fees;",
            "scrape, reverse-engineer, overload or attempt to gain unauthorised access to the Platform;",
            "use the Platform for money laundering, terrorist financing, trafficking, or any other criminal purpose.",
          ],
        },
      ],
    },
    {
      id: "content-and-reviews",
      title: "Your content and reviews",
      blocks: [
        {
          type: "text",
          content:
            "You keep ownership of the photographs, descriptions, messages and reviews you upload. By posting them you grant us a worldwide, non-exclusive, royalty-free licence to host, store, reproduce, adapt for display, and distribute that content for the purpose of operating and promoting the Platform. That licence ends when you delete the content, except where it is embedded in another user's booking record or review.",
        },
        {
          type: "text",
          content:
            "Reviews must be truthful and based on a real Booking. We do not edit reviews to favour any party, but we will remove a review that is fraudulent, discriminatory, defamatory, or that reveals another person's private information.",
        },
      ],
    },
    {
      id: "suspension",
      title: "Suspension and termination",
      blocks: [
        {
          type: "text",
          content:
            "You may close your account at any time. Closing an account does not cancel Bookings already confirmed, and does not discharge amounts you already owe.",
        },
        {
          type: "text",
          content:
            "We may suspend or terminate your access, remove a Listing, or cancel a Booking where we reasonably believe you have breached these Terms, where verification fails, where there is a risk to another user's safety or property, or where the law requires it. Where it is lawful and safe to do so, we will tell you why and give you a route to appeal.",
        },
      ],
    },
    {
      id: "liability",
      title: "Liability",
      blocks: [
        {
          type: "text",
          content: `The Platform is provided on an "as is" basis. To the fullest extent permitted by law, ${tradingName} is not liable for the acts or omissions of any Guest or Host, for the condition, safety or legality of any Listing or Vehicle, for personal injury or property loss arising during a stay or rental, or for indirect or consequential loss.`,
        },
        {
          type: "text",
          content: `Where we are found liable despite the above, our total liability in connection with any Booking is limited to the total amount you paid or received through the Platform for that Booking.`,
        },
        {
          type: "text",
          content:
            "Nothing in these Terms excludes liability for death or personal injury caused by our negligence, for fraud, or for any liability that cannot lawfully be excluded — including your rights under Nigerian consumer protection law.",
        },
        {
          type: "text",
          content:
            "You agree to indemnify us against claims, losses and reasonable legal costs arising from your breach of these Terms, your misuse of the Platform, or your breach of any Booking Contract.",
        },
      ],
    },
    {
      id: "disputes",
      title: "Disputes and governing law",
      blocks: [
        {
          type: "steps",
          items: [
            `**Talk to the other party first.** Most issues resolve directly between Guest and Host through in-app messaging.`,
            `**Bring it to us.** If that fails, contact [${emails.support}](mailto:${emails.support}) within 30 days of the end of the Booking with the booking reference and any evidence. We will review and give a written decision.`,
            "**Formal dispute.** If our decision does not resolve it, the parties will attempt good-faith negotiation for 30 days before commencing proceedings.",
          ],
        },
        {
          type: "text",
          content: `These Terms are governed by the laws of ${jurisdiction}, and you and we submit to the exclusive jurisdiction of ${courts}.`,
        },
      ],
    },
    {
      id: "changes",
      title: "Changes to these Terms",
      blocks: [
        {
          type: "text",
          content:
            "We may update these Terms as the Platform and the law change. We will post the revised version here with a new effective date, and where a change materially affects your rights we will notify you by email or in the app before it takes effect. Continuing to use the Platform after the effective date means you accept the revised Terms. The version in force for a Booking is the version published when that Booking was made.",
        },
      ],
    },
    {
      id: "general",
      title: "General",
      blocks: [
        {
          type: "list",
          items: [
            "These Terms, together with our [Privacy Policy](/legal/privacy), are the entire agreement between you and us about the Platform.",
            "If any provision is found unenforceable, the rest remains in force.",
            "Our failure to enforce a provision is not a waiver of it.",
            "You may not transfer your rights under these Terms. We may transfer ours to a successor in connection with a merger, acquisition or reorganisation.",
            "Notices to you may be sent to the email or phone number on your account. Notices to us should go to the addresses in the next section.",
          ],
        },
      ],
    },
    {
      id: "contact",
      title: "Contact us",
      blocks: [
        {
          type: "text",
          content: `Questions about these Terms, a Booking, or a dispute:`,
        },
        {
          type: "list",
          items: [
            `Support — [${emails.support}](mailto:${emails.support})`,
            `Legal — [${emails.legal}](mailto:${emails.legal})`,
            `${legalName} (${rcNumber}), ${address}`,
          ],
        },
      ],
    },
  ],
};
