import Image from "next/image";
import React, { useState } from "react";
import Location from "../Location";
import useUser from "@/hooks/useUser";
import { Userpic } from "@/assets/images/png";
import { NotificationIcon } from "@/assets/icons";
import SkeletonLoader from "../ui/SkeletonLoader";
import Link from "next/link";
import { Routes } from "@/utils/_variables";
import Modal from "../ui/modal/Modal";
import NotificationModal from "../NotificationModal";

const NavBar = () => {
  const { userDetails, profileImage } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <nav className="bg-white h-16 px-6 grid grid-cols-3 justify-between items-center">
        <div className="font-medium text-lg flex flex-col">
          {!userDetails ? (
            <div className="space-y-2">
              <SkeletonLoader className="h-3  w-1/4 rounded-lg" />
              <SkeletonLoader className="h-4  w-1/2 rounded-lg" />
            </div>
          ) : (
            <>
              {userDetails?.fullName && (
                <span className="text-xs font-normal text-gray-500 -mb-1">
                  Wecolme
                </span>
              )}
              {userDetails?.fullName ?? "Name not found"}
            </>
          )}
        </div>

        {!userDetails ? (
          <SkeletonLoader className="h-4 rounded-lg" />
        ) : (
          <Location />
        )}

        <div className="flex items-center justify-end gap-3">
          {!userDetails ? (
            <SkeletonLoader className="h-12 w-12 rounded-full" />
          ) : (
            <>
              <span
                onClick={() => setIsModalOpen(true)}
                className="p-2 border-black/50 border-[1.5px] cursor-pointer hover:scale-105 transition duration-150 rounded-full"
              >
                <NotificationIcon />
              </span>
              <Link href={Routes.Account.path}>
                <div className="h-11 w-11 rounded-full bg-slate-100 relative overflow-hidden">
                  <Image
                    src={profileImage || Userpic}
                    alt="Company Logo"
                    fill
                    sizes="32px"
                    className=" object-cover h-11 w-11 "
                  />
                </div>
              </Link>
            </>
          )}
        </div>
      </nav>
      <Modal
        className="absolute top-20 right-4 min-h-[70vh]"
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <NotificationModal />
      </Modal>
    </>
  );
};
export default NavBar;
