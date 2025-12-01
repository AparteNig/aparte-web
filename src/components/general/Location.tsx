import React, { memo, useState, useCallback } from "react";
import { ChevronDownIcon, NavigationIcon } from "@/assets/icons";
import { useLocation } from "@/hooks/useLocation";

const LocationComponent: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { address, error, isLoading } = useLocation();

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const showDropdown = address !== "Address not found" && isOpen;

  const LocationDisplay = memo(() => (
    <div className="flex items-center justify-center flex-col">
      <p className="text-xs flex items-center gap-2 text-gray-500">
        <NavigationIcon />
        Your Location
      </p>
      <p className="text-base text-center font-normal max-w-80 truncate">
        {error || address}
      </p>
    </div>
  ));

  LocationDisplay.displayName = "LocationDisplay";

  if (isLoading) {
    return (
      <div className="relative flex flex-col">
        <div className="flex flex-col items-center">
          <div className="relative flex items-center justify-center gap-1">
            <LocationDisplay />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      <div className="flex flex-col items-center">
        <div
          className="relative flex items-center justify-center gap-1 cursor-pointer"
          onClick={toggleDropdown}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              toggleDropdown();
            }
          }}
        >
          <LocationDisplay />
          {address !== "Address not found" && (
            <ChevronDownIcon
              className={`transition-transform ${
                showDropdown ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {showDropdown && (
          <div className="absolute top-10 left-[50%] translate-x-[-50%] w-fit text-nowrap z-30 text-center p-2 bg-white border rounded shadow-md">
            {address}
          </div>
        )}
      </div>
    </div>
  );
};

LocationComponent.displayName = "Location";

export default memo(LocationComponent);
