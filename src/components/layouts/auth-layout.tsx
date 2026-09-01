import type { ReactNode } from "react";
import Image from "next/image";

import AuthScreenLogo from "@/assets/images/png/Authscreenlogo.png";

/**
 * The split screen behind host sign-in and sign-up.
 *
 * The left half was a generic SaaS illustration — a planet graphic over a card
 * reading "Product 1" and a chart labelled "Profit $12,00.48". Wrong product,
 * wrong currency, and a malformed number, on the page where a landlord decides
 * whether to trust us with their identity documents. It is now a photograph of
 * the thing we actually sell.
 *
 * The stat that sat under it ("200+ local hosts") was untrue, so it is gone
 * rather than restated: an unverifiable number on a trust surface costs more
 * than the empty space it filled.
 */

/**
 * Swap for a real Lagos interior when the catalogue has one worth leading
 * with. Stock luxury interiors are overwhelmingly Western, which is a quieter
 * version of the mismatch this replaced.
 */
const HERO_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80";

type AuthLayoutProps = {
  containerClassName?: string;
  className?: string;
  children: ReactNode;
};

export const AuthLayout = ({
  containerClassName = "",
  className = "",
  children,
}: AuthLayoutProps) => {
  return (
    <div
      className={`flex min-h-screen w-full flex-col bg-white text-slate-900 md:flex-row ${className}`}
    >
      {/*
        Pinned to the viewport rather than min-h-screen. The form column is
        taller than the screen on smaller laptops, and a flex row sizes every
        child to the tallest one — so the panel grew past the fold, taking the
        logo out of view and dragging the photograph down into the darkest end
        of the gradient. Sticky keeps the artwork composed while the form
        scrolls beside it.
      */}
      <aside className="relative hidden h-screen w-[46vw] shrink-0 self-start overflow-hidden bg-primary md:sticky md:top-0 md:block">
        <Image
          src={HERO_IMAGE}
          alt="A furnished Aparté apartment"
          fill
          sizes="46vw"
          priority
          /*
            Biased downward. A landscape interior cropped into a tall panel
            centres on the ceiling — the least interesting third of any room
            photograph — so the crop is pulled toward the living space.
          */
          className="object-cover object-[center_72%]"
        />
        {/*
          Two overlays, not one. The flat tint keeps the brand colour present
          across the whole panel; the bottom gradient is what actually makes
          the copy legible, and a single mid-strength wash cannot do both
          without flattening the photograph.
        */}
        <div className="absolute inset-0 bg-primary/25" aria-hidden />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/5 to-black/80"
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <Image src={AuthScreenLogo} alt="Aparté" className="h-auto w-32" priority />

          <div className="max-w-sm space-y-3">
            <h1 className="text-3xl font-semibold leading-tight text-white text-balance">
              Your apartments, earning while you sleep.
            </h1>
            <p className="text-[15px] leading-relaxed text-white/75">
              Listings, bookings, guest messages and payouts — in one place, built for
              Lagos landlords.
            </p>
          </div>
        </div>
      </aside>

      {/*
        Centred, not top-aligned. The form previously started at the top of a
        full-height column, leaving several hundred pixels of white beneath it
        against a full-bleed panel — which reads as a page that failed to
        finish loading rather than as deliberate space.
      */}
      <main className="flex flex-1 items-center justify-center px-5 py-12 md:px-12">
        <div className={`w-full max-w-md ${containerClassName}`}>{children}</div>
      </main>
    </div>
  );
};
