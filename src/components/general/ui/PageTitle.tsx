import React from "react";

interface PageTitleProps {
  title: string;
  subTitle: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subTitle }) => {
  return (
    <div>
      <h2 className="text-primary text-2xl">{title}</h2>
      <p className="w-[50vw]">{subTitle}</p>
    </div>
  );
};

export default PageTitle;
