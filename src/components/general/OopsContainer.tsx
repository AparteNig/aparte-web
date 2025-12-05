import React from "react";

interface OopsContainerProps {
  title?: string;
  subTitle?: string;
}

const OopsContainer: React.FC<OopsContainerProps> = ({ title, subTitle }) => (
  <div className="flex flex-col items-center justify-center w-full h-fit text-center">
    <div className="mb-4 flex h-[120px] w-[120px] items-center justify-center rounded-full bg-slate-100 text-4xl">
      <span role="img" aria-label="empty-state">
        😕
      </span>
    </div>
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        {subTitle && <p className="m-auto text-base text-[#696F8C]">{subTitle}</p>}
      </div>
    </div>
  </div>
);

export default OopsContainer;
