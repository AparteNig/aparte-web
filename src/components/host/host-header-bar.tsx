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
  const displayName = profile?.displayName || profile?.fullName || "Host";
  const location = [
    profile?.addressLine1,
    profile?.city,
    profile?.state,
    profile?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <nav
      className={cn(
        "sticky top-0 z-30 grid h-16 grid-cols-3 items-center bg-white px-6 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col font-medium text-lg">
        <span className="text-xs font-normal text-slate-500 -mb-1">
          {greeting}
        </span>
        {displayName}
      </div>
      <div className="relative flex flex-col">
        <div className="flex flex-col items-center">
          <div
            className="relative flex cursor-pointer items-center justify-center gap-1"
            role="button"
            tabIndex={0}
          >
            <div className="flex flex-col items-center text-center">
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
              <p className="max-w-80 truncate text-base font-normal text-slate-700">
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
      <div className="flex items-center justify-end gap-3">
        <span className="cursor-pointer rounded-full border border-slate-400/50 p-2 transition duration-150 hover:scale-105">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M3.80832 12.5123V12.327C3.8355 11.7788 4.0112 11.2476 4.3173 10.7882C4.82681 10.2364 5.1756 9.56022 5.32707 8.83056C5.32707 8.26661 5.32707 7.69462 5.37632 7.13067C5.63082 4.4157 8.31531 2.53857 10.967 2.53857H11.0326C13.6843 2.53857 16.3688 4.4157 16.6315 7.13067C16.6808 7.69462 16.6315 8.26661 16.6726 8.83056C16.8261 9.56191 17.1745 10.2402 17.6823 10.7963C17.9907 11.2516 18.1667 11.7808 18.1913 12.327V12.5042C18.2096 13.2408 17.956 13.959 17.4771 14.5264C16.8443 15.1898 15.9856 15.6026 15.0635 15.6865C12.3597 15.9765 9.63172 15.9765 6.92791 15.6865C6.00689 15.599 5.14941 15.1868 4.51433 14.5264C4.04285 13.9585 3.79259 13.2446 3.80832 12.5123Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M8.93066 18.49C9.35313 19.0203 9.97352 19.3634 10.6545 19.4436C11.3355 19.5237 12.021 19.3342 12.5592 18.917C12.7248 18.7936 12.8737 18.6501 13.0026 18.49"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16.076" cy="5.077" r="3.38462" fill="#00AC35" />
          </svg>
        </span>
        <button
          type="button"
          onClick={() => router.push("/host/dashboard/profile")}
          className="relative h-11 w-11 overflow-hidden rounded-full bg-slate-100"
          aria-label="Go to profile"
        >
          <div className="h-full w-full">
            {profile?.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt="Host avatar"
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
    </nav>
  );
};
