import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import Logo from "@/assets/landing/Logo.png";
import ShareButton from "@/components/share/ShareButton";
import { cn } from "@/lib/utils";

const playfair = Playfair_Display({ subsets: ["latin"], weight: ["700"] });

export type Fact = { label: string; value: string };

/**
 * The page a shared link lands on.
 *
 * Its job is narrow: convince a stranger who tapped a link in WhatsApp that the
 * thing is real, then move them into the app. It deliberately does not attempt
 * booking — there is no guest web checkout, and a dead "Book now" would be
 * worse than an honest handoff.
 */
export default function SharePage({
  kind,
  title,
  location,
  priceLabel,
  priceUnit,
  imageUrl,
  description,
  facts,
  amenities,
  rating,
  reviewCount,
  url,
}: {
  kind: "listing" | "vehicle";
  title: string;
  location: string;
  priceLabel: string;
  priceUnit: string;
  imageUrl: string | null;
  description?: string | null;
  facts: Fact[];
  amenities?: string[] | null;
  rating?: number | null;
  reviewCount?: number | null;
  url: string;
}) {
  const noun = kind === "vehicle" ? "car" : "place";

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="Aparte home">
            <Image src={Logo} alt="Aparte" className="h-9 w-auto" priority />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-[#0f2f2a] hover:underline"
          >
            Explore Aparte
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-6 py-8 md:py-12">
        <div className="overflow-hidden rounded-3xl border border-slate-200">
          {imageUrl ? (
            // Plain <img>: the source is a redirecting proxy over presigned S3
            // URLs, which next/image cannot fingerprint for optimisation.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={title}
              className="h-64 w-full object-cover md:h-96"
            />
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-[#f7f2ea] md:h-96">
              <Image src={Logo} alt="" className="h-12 w-auto opacity-40" />
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#d09a25] uppercase">
              {kind === "vehicle" ? "Car rental" : "Stay"}
            </p>
            <h1
              className={cn(
                playfair.className,
                "mt-2 text-3xl leading-tight text-[#0f2f2a] md:text-4xl",
              )}
            >
              {title}
            </h1>
            {location && <p className="mt-2 text-slate-600">{location}</p>}
            {typeof rating === "number" && rating > 0 && (
              <p className="mt-2 text-sm text-slate-600">
                <span className="font-semibold text-[#0f2f2a]">★ {rating.toFixed(1)}</span>
                {reviewCount ? ` · ${reviewCount} review${reviewCount === 1 ? "" : "s"}` : ""}
              </p>
            )}
          </div>

          <div className="shrink-0 text-left md:text-right">
            <p className="text-2xl font-semibold text-[#0f2f2a]">{priceLabel}</p>
            <p className="text-sm text-slate-500">{priceUnit}</p>
            <ShareButton
              url={url}
              title={title}
              text={`Check out this ${noun} on Aparte`}
              className="mt-4"
            />
          </div>
        </div>

        {facts.length > 0 && (
          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 p-5 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt className="text-xs tracking-wide text-slate-500 uppercase">
                  {fact.label}
                </dt>
                <dd className="mt-1 font-semibold text-[#0f2f2a]">{fact.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {description && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#0f2f2a]">About this {noun}</h2>
            <p className="mt-2 leading-7 whitespace-pre-line text-slate-600">
              {description}
            </p>
          </section>
        )}

        {amenities && amenities.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-[#0f2f2a]">
              {kind === "vehicle" ? "Features" : "Amenities"}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {amenities.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-[#f7f2ea] px-3 py-1.5 text-sm text-[#0f2f2a]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded-3xl bg-[#0f2f2a] px-6 py-8 text-center md:px-10">
          <h2 className={cn(playfair.className, "text-2xl text-[#fdfbf7]")}>
            Book it in the Aparte app
          </h2>
          <p className="mx-auto mt-2 max-w-md text-[#fdfbf7]/80">
            {kind === "vehicle"
              ? "Reserve this car, message the owner and pick up with a code — all in the app."
              : "Reserve this place, message the host and check in with a code — all in the app."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-full bg-[#d09a25] px-7 py-3 font-semibold text-[#0f2f2a] transition hover:brightness-110"
          >
            Get the app
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Aparte. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/privacy" className="hover:text-[#0f2f2a]">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-[#0f2f2a]">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
