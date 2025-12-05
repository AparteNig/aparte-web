import React, { ReactNode } from "react";

interface WalletCardProps {
  className?: string;
  aFloatClassName?: string;
  children: ReactNode;
}

const WalletCard: React.FC<WalletCardProps> = ({
  children,
  className,
  aFloatClassName,
}) => {
  return (
    <div
      className={`relative text-white ${className} w-full bg-primary h-[150px] overflow-hidden rounded-2xl p-5 `}
    >
      {children}
      <div className="pointer-events-none absolute w-[200px]  h-[200px] rounded-full bg-white bg-opacity-10 top-[-1rem] left-[-7rem]"></div>
      <div
        className={`pointer-events-none ${aFloatClassName} absolute w-[200px] h-[200px] rounded-full bg-white bg-opacity-10 top-[-8rem] right-[-8rem]`}
      ></div>
    </div>
  );
};

export default WalletCard;
