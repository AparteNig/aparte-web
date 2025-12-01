import React, { useEffect, useState } from "react";
import OopsContainer from "../OopsContainer";

interface UnreadProps {
  setUnreadCount: (count: number) => void;
}

const Unread: React.FC<UnreadProps> = ({ setUnreadCount }) => {
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Replace this URL with your Unread notifications API endpoint
    const fetchUnreadNotifications = async () => {
      try {
        const response = await fetch("/api/unread-notifications");
        const data = await response.json();
        setUnreadNotifications(data.notifications || []);
        setUnreadCount(data.notifications.length);
      } catch (error) {
        // console.error("Error fetching unread notifications:", error);
      }
    };

    fetchUnreadNotifications();
  }, [setUnreadCount]);

  return (
    <div>
      {unreadNotifications.length === 0 ? (
        <OopsContainer title="No unread Notifications" />
      ) : (
        <ul>
          {unreadNotifications.map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Unread;
