import React from "react";
import dynamic from "next/dynamic";
import { emptyList } from "@/assets/images/lottiefiles";

interface OopsContainerProps {
  title?: string;
  subTitle?: string;
  lottie?: object;
}

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const OopsContainer: React.FC<OopsContainerProps> = ({
  title,
  subTitle,
  lottie,
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-fit text-center">
      <div className="w-[120px] h-[120px]">
        <Lottie
          loop={true}
          autoplay={true}
          style={{ width: 120, height: 120 }}
          animationData={lottie || emptyList}
        />
      </div>
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="mb-2 text-xl font-semibold">{title}</h2>
          {subTitle && (
            <p className="m-auto text-base text-[#696F8C]">{subTitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OopsContainer;
