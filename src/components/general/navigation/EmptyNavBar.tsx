import Image from "next/image";
import React from "react";
import useUser from "@/hooks/useUser";
import { Userpic } from "@/assets/images/png";
import { NotificationIcon } from "@/assets/icons";
import SkeletonLoader from "../ui/SkeletonLoader";
import Link from "next/link";
import { Routes } from "@/utils/_variables";

const EmptyNavBar = () => {
  const { profileImage } = useUser();

  return (
    <nav className="bg-white h-16 px-6 flex justify-end items-center">
      <div className="flex items-center justify-end gap-3">
        {!profileImage ? (
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

export default EmptyNavBar;
