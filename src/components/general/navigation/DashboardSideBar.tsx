import React, { useState } from "react";
import { Logo, LogOutIcon, SideBarIcon } from "@/assets/icons";
import { sideNavRoutes } from "@/utils/_variables";
import Link from "next/link";
import Button from "../Button";
import { useRouter } from "next/router";
import useUser from "@/hooks/useUser";

const DashboardSideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const { logoutUser } = useUser();

  return (
    <aside
      className={`bg-white transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-fit" : "min-w-64 2xl:min-w-80"
      } overflow-y-auto scrollbar h-screen !sticky !top-0  flex flex-col space-y-10 2xl:justify-between`}
    >
      <div className=" flex flex-col p-2 pt-0 space-y-4">
        <div className="flex justify-between items-center px-3 h-16 sticky top-0 bg-white ">
          {!isCollapsed && (
            <Link href={"/"}>
              <Logo color="black" height={40} width={80} />
            </Link>
          )}
          <span
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`cursor-pointer ${isCollapsed ? "" : "opacity-40"}`}
          >
            <SideBarIcon />
          </span>
        </div>
        <nav>
          <ul className="space-y-1">
            {sideNavRoutes.map((item, index) => (
              <li
                key={index}
                className={`cursor-pointer font-medium rounded-xl hover:bg-[rgba(245,245,247,0.3)] ${
                  item.activeIn.includes(router.pathname)
                    ? "!bg-[#F5F5F7] text-primary"
                    : ""
                }`}
              >
                <Link href={item.path} className="flex p-3 gap-3 items-center">
                  {item.Icon && (
                    <item.Icon
                      color={
                        item.activeIn.includes(router.pathname)
                          ? "#00AC35"
                          : "black"
                      }
                    />
                  )}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
            <li
              onClick={logoutUser}
              key={"logout"}
              className={`cursor-pointer font-medium rounded-xl hover:bg-[rgba(255,62,62,0.15)] hover:text-red-500 !mt-8`}
            >
              <div
                className="flex p-3 gap-3 items-center"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                <LogOutIcon color={hover ? "red " : "black"} />
                {!isCollapsed && <span>Log Out</span>}
              </div>
            </li>
          </ul>
        </nav>
      </div>
      {!isCollapsed && (
        <div className="min-h-[300px] p-3 w-full ">
          <div className=" relative w-full h-full bg-primary rounded-xl ">
            <div className="z-10 absolute -top-9 left-[50%] h-16 w-16 translate-x-[-50%] text-3xl bg-primary rounded-full border-4 border-white font-extrabold flex items-center justify-center text-white shadow-xl">
              ?
            </div>
            <div className="rounded-xl relative p-3 pt-14 overflow-hidden w-full h-full before:h-40 before:w-40 before:rounded-full before:bg-[rgba(255,255,255,0.08)] before:absolute before:-top-[80px] before:-left-[80px] | after:h-40 after:w-40 after:rounded-full after:bg-[rgba(255,255,255,0.08)] after:absolute after:-bottom-[80px] after:-right-[70px]">
              <span className="h-full flex items-center  justify-center ">
                <div className="text-center flex-col justify-between items-center flex h-full text-white">
                  <div>
                    <p className="text-xl font-semibold">Help Center</p>
                    <p className="mt-3">
                      Having Trouble in Learning. <br /> Please contact us for
                      more <br />
                      questions.
                    </p>
                  </div>
                  <Link
                    href={"https://instadelivery.org/contact"}
                    target="_blank"
                    // href={Routes.HelpCenter.path}
                  >
                    <Button className="w-full bg-white text-primary font-semibold !rounded-2xl">
                      Go To Help Center
                    </Button>
                  </Link>
                </div>
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSideBar;
