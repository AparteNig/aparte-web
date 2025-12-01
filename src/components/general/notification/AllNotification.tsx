import React, { useEffect, useState } from "react";
import OopsContainer from "../OopsContainer";
import { PackageIcon } from "@/assets/icons";

interface AllNotificationProps {
  setAllNotificationCount: (count: number) => void;
}

const AllNotification: React.FC<AllNotificationProps> = ({
  setAllNotificationCount,
}) => {
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Replace this URL with your All notifications API endpoint
    const fetchAllNotifications = async () => {
      try {
        // Mock response data
        const response = {
          notifications: [
            {
              id: 1,
              message: "Driver just arrived blenco",
              detail: "Driver arrived for order #289379",
              time: "Just Now",
              seen: true,
            },
            {
              id: 2,
              message: "Driver just arrived blenco",
              detail: "Driver arrived for order #289379",
              time: "04:34pm",
              seen: true,
            },
            {
              id: 3,
              message: "Driver just arrived blenco",
              detail: "Driver arrived for order #289379",
              time: "04:34pm",
              seen: false,
            },
          ],
        };

        // Set notifications directly from the mock response data
        const data = response; // No need to call `response.json()` for mock data
        setAllNotifications(data.notifications || []);
        setAllNotificationCount(data.notifications.length);
      } catch {
        // console.error("Error fetching all notifications:", error);
      }
    };

    fetchAllNotifications();
  }, [setAllNotificationCount]);

  return (
    <div>
      {allNotifications.length === 0 ? (
        <OopsContainer title="No notifications" />
      ) : (
        <ul className="space-y-4">
          {allNotifications.map((notification) => (
            <li
              key={notification.id}
              className={`bg-[rgba(245,245,245,0.4)]  p-2 gap-4 flex ${
                !notification.seen ? "items-center" : "items-end"
              } `}
            >
              <div className="h-12 w-12 rounded-full bg-[rgba(83,177,117,0.2)] flex items-center justify-center">
                <PackageIcon />
              </div>
              <div>
                <h2 className="font-bold">{notification.message}</h2>
                <p>{notification.detail}</p>
              </div>

              <div className={`flex flex-col h-full items-center gap-3`}>
                {!notification.seen && (
                  <span className="h-2 w-2 bg-primary rounded-full block"></span>
                )}
                <p>04:34pm</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllNotification;
