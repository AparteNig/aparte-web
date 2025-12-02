"use client";

import { useEffect, useState } from "react";

type ResponsiveGateProps = {
  minWidth?: number;
  children: React.ReactNode;
};

export const ResponsiveGate = ({ minWidth = 1024, children }: ResponsiveGateProps) => {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);

  useEffect(() => {
    const checkWidth = () => {
      if (typeof window === "undefined") return;
      setIsSupported(window.innerWidth >= minWidth);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, [minWidth]);

  if (isSupported === null) {
    return null;
  }

  if (!isSupported) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center text-slate-700">
        <div className="max-w-md space-y-3">
          <p className="text-2xl font-semibold text-slate-900">Screen too small</p>
          <p className="text-sm">
            The host dashboard is optimized for larger displays. Please switch to a tablet or
            desktop device to continue.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
