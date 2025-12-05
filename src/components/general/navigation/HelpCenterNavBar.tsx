import Image from "next/image";
import React from "react";
import useUser from "@/hooks/useUser";
import { Userpic } from "@/assets/images/png";
import { BackArrow, NotificationIcon } from "@/assets/icons";
import SkeletonLoader from "../ui/SkeletonLoader";
import Link from "next/link";
import { Routes } from "@/utils/_variables";

const HelpCenterNavBar = () => {
  const { userDetails, profileImage } = useUser();

  return (
    <nav className="bg-white h-16 px-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Link
          href={Routes.Dashboard.path}
          className="bg-primary cursor-pointer p-2 h-10 w-10 flex items-center justify-center rounded-xl"
        >
          <BackArrow color="white" />
        </Link>
        <p className="text-2xl font-bold">Help Centre</p>
      </div>
      <div className="flex items-center justify-end gap-3">
        {!userDetails ? (
          <SkeletonLoader className="h-12 w-12 rounded-full" />
        ) : (
          <>
            <span className="p-2 border-[rgba(245, 245, 247, 1)] border-2 rounded-full">
              <NotificationIcon />
            </span>
            <Link href={Routes.Account.path}>
              <div className="h-11 w-11 rounded-full relative overflow-hidden">
                <Image
                  src={profileImage || Userpic}
                  alt="Company Logo"
                  fill
                  sizes="32px"
                  className="bg-slate-100 object-cover"
                />
              </div>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default HelpCenterNavBar;
