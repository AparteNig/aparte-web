"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import type { HostProfile } from "@/types/host";
import { cn } from "@/lib/utils";

type HostHeaderBarProps = {
  profile: HostProfile | undefined;
  className?: string;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

export const HostHeaderBar = ({ profile, className }: HostHeaderBarProps) => {
  const router = useRouter();
  const greeting = useMemo(getGreeting, []);
  const displayName = profile?.displayName || profile?.fullName || "Landlord";
  /**
   * City and state only — deliberately not the street line.
   *
   * A landlord does not need their own street address in the top chrome, and
   * including it put whatever they typed on screen verbatim: one profile here
   * renders as "4,agbelura,challenge,ibadan.Nigeria, Ibadan, Oyo, Nigeria",
   * truncated mid-word. Dropping the line both reads better and makes the
   * header immune to messy address data.
   *
   * State is skipped when it repeats the city (Lagos, Lagos).
   */
  const location = [profile?.city, profile?.state, profile?.country]
    .filter(Boolean)
    .filter((part, index, parts) => parts.indexOf(part) === index)
    .join(", ");

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 bg-white shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6 sm:py-0">
        <div className="flex min-w-0 flex-col text-lg font-medium">
          <span className="text-xs font-normal text-slate-500 -mb-1">
            {greeting}
          </span>
          <span className="truncate">{displayName}</span>
        </div>
        <div className="relative flex min-w-0 flex-col sm:flex-1">
          <div className="flex flex-col items-start sm:items-center">
            <div
              className="relative flex w-full cursor-pointer items-center justify-start gap-2 sm:w-auto sm:justify-center"
              role="button"
              tabIndex={0}
            >
              <div className="flex min-w-0 flex-col items-start text-left sm:items-center sm:text-center">
                <p className="flex items-center gap-2 text-xs text-slate-500">
                  <svg
                    fill="none"
                    height="15"
                    viewBox="0 0 16 17"
                    width="15"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 7.83301L14.6667 1.83301L8.66667 14.4997L7.33333 9.16634L2 7.83301Z"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Your location
                </p>
                <p className="max-w-[16rem] truncate text-base font-normal text-slate-700 sm:max-w-80">
                  {location || "Add your address to personalize this space"}
                </p>
              </div>
              <svg
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                className="transition-transform"
              >
                <path
                  d="M5.0293 7.50049L10.0293 12.5005L15.0293 7.50049"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 sm:w-auto">
          {/* The bell that sat here opened nothing and wore a permanent
              "unread" dot. It comes back when there is an inbox behind it. */}
          <button
            type="button"
            onClick={() => router.push("/host/dashboard/profile")}
            className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100"
            aria-label="Go to profile"
          >
            <div className="relative h-full w-full">
              {profile?.avatarUrl ? (
                <Image
                  src={profile.avatarUrl}
                  alt="Landlord avatar"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-semibold text-slate-500">
                  {displayName?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};
