import type { ReactNode } from "react";
import Image from "next/image";

import AuthScreenLogo from "@/assets/images/png/Authscreenlogo.png";
import { BgLine, LoginImage } from "@/assets/images/svg";
import { A1, A2, A3, A4, A5 } from "@/assets/images/png";

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
      className={`flex min-h-screen w-full flex-col bg-muted/30 text-slate-900 md:flex-row ${className}`}
    >
      <div className="relative hidden min-h-screen min-w-[45vw] max-w-[45vw] items-center justify-center bg-primary md:flex">
        <Image
          src={BgLine}
          alt="Background line"
          priority
          className="absolute left-0 top-0 h-full w-full object-cover opacity-30"
        />
        <div className="relative z-10 flex max-w-md flex-col gap-10 text-white">
          <Image src={AuthScreenLogo} alt="Aparte" className="h-34 w-44" priority />
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-semibold">Welcome to Aparte</h1>
            <p className="text-base text-white/80">
              Manage onboarding, listings, payouts, and bookings with a single operations
              console.
            </p>
            <Image
              src={LoginImage}
              alt="Dashboard preview"
              priority
              className="mx-auto h-40 w-auto"
            />
          </div>
          <div className="space-y-3">
            <h2 className="text-center text-xl font-semibold">
              Trusted by property partners
            </h2>
            <div className="flex justify-center space-x-[-10px]">
              {[A1, A2, A3, A4, A5, A3, A1].map((avatar, index) => (
                <Image
                  key={`${avatar.src}-${index}`}
                  src={avatar}
                  alt="Partner avatar"
                  height={36}
                  width={36}
                  className="h-9 w-9 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <p className="text-center text-sm text-white/80">
              Join more than{" "}
              <span className="font-semibold text-white">200+ local hosts</span> powering
              their rental workflows.
            </p>
          </div>
        </div>
      </div>
      <div className="relative flex flex-1 items-start justify-center px-4 py-10 md:px-12">
        <Image
          src={BgLine}
          alt="Background lines"
          priority
          className="absolute inset-0 -z-10 block h-full w-full object-cover opacity-10 md:hidden"
        />
        <div className={`w-full max-w-xl ${containerClassName}`}>{children}</div>
      </div>
    </div>
  );
};
