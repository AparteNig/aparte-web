import React, { useEffect, useRef, useState } from "react";
import Button from "./Button";
import { TickIcon } from "@/assets/icons";
import Unread from "./notification/Unread";
import AllNotification from "./notification/AllNotification";
import { showToast } from "./ui/CustomToast";

const tabs = ["Unread", "All Notification"] as const;
type TabType = (typeof tabs)[number];

interface TabProps {
  label: TabType;
  isActive: boolean;
  onClick: () => void;
  itemAmout: number;
}

const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  ({ label, isActive, onClick, itemAmout }, ref) => (
    <button
      ref={ref}
      className={`py-2 px-4 text-sm font-medium ${
        isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
      } flex items-center gap-3`}
      onClick={onClick}
    >
      {label}
      {itemAmout !== 0 && (
        <span className="size-3 flex items-center justify-center p-4 rounded-full bg-primary text-white">
          {itemAmout}
        </span>
      )}
    </button>
  )
);
Tab.displayName = "Tab";

interface SliderProps {
  style: React.CSSProperties;
}

const Slider: React.FC<SliderProps> = ({ style }) => (
  <div
    className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
    style={style}
  />
);

const NotificationModal = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});
  const [unreadCount, setUnreadCount] = useState(0);
  const [allNotificationCount, setAllNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]); // Store all notifications

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setSliderStyle({
        left: `${currentTab.offsetLeft}px`,
        width: `${currentTab.offsetWidth}px`,
      });
    }
  }, [activeTab]);

  // Mark all unread notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      // Send a request to your API to mark all as read
      await fetch("your-api-endpoint", { method: "POST" });

      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        isRead: true,
      }));

      setNotifications(updatedNotifications);
      setUnreadCount(0);
      setAllNotificationCount(updatedNotifications.length);
    } catch {
      showToast.error("Error marking all as read:");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-xl font-semibold">Today</p>
        <Button
          type="transparent"
          className="text-primary hover:bg-slate-100 flex items-center"
          onClick={handleMarkAllAsRead} // Attach the mark all as read handler
        >
          <TickIcon />
          Mark all as read
        </Button>
      </div>
      <div className="relative border-b border-gray-200">
        <nav className="flex -mb-px">
          {tabs.map((tab, index) => (
            <Tab
              key={tab}
              label={tab}
              itemAmout={index === 0 ? unreadCount : allNotificationCount}
              isActive={activeTab === index}
              onClick={() => setActiveTab(index)}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
            />
          ))}
        </nav>
        <Slider style={sliderStyle} />
      </div>
      <div className="mt-2">
        {activeTab === 0 ? (
          <Unread
            setUnreadCount={(count) => {
              setUnreadCount(count);
              setAllNotificationCount(count + allNotificationCount);
            }}
          />
        ) : (
          <AllNotification setAllNotificationCount={setAllNotificationCount} />
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
