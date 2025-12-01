import React from "react";

const keyframesAppear = `
  @keyframes appear {
    0% { opacity: 0; transform: scale(0.5); }
    100% { opacity: 1; transform: scale(1); }
  }
`;

const PreLoader = () => {
  return (
    <div className="flex items-center justify-center w-screen h-screen fixed bg-white text-primary">
      <style>{keyframesAppear}</style>
      <div className="flex space-x-6 font-bold text-7xl">
        <div
          style={{
            animation:
              "appear 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate",
            animationDelay: "1s",
          }}
        >
          I
        </div>
        <div
          style={{
            animation:
              "appear 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate",
            animationDelay: "1.5s",
          }}
        >
          S
        </div>
        <div
          style={{
            animation:
              "appear 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate",
            animationDelay: "2s",
          }}
        >
          D
        </div>
        <div
          style={{
            animation:
              "appear 1s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate",
            animationDelay: "2.5s",
          }}
        >
          S
        </div>
      </div>
    </div>
  );
};

export default PreLoader;
