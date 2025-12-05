import { CopyIcon } from "@/assets/icons";
import React from "react";
import { showToast } from "./CustomToast";

interface TicketInfoProps {
  messages: any;
  chatDetails: any;
}

const TicketInfo: React.FC<TicketInfoProps> = ({ messages, chatDetails }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(
      `ISDS Logistics Ticket ID: ${chatDetails.ticketId}`
    );
    showToast.success(`Ticket ID copied!`);
  };

  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full py-6 text-center text-gray-700">
      <p className="">
        {messages.length === 0
          ? "You've successfully opened a new support ticket with"
          : "Your support request with"}{" "}
        <span className="font-semibold text-primary">ISDS Admin</span> is{" "}
        <span className="lowercase"> {chatDetails?.status}</span>.
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm  text-gray-400">
          Ticket ID:{" "}
          <span className="font-semibold">{chatDetails.ticketId}</span>
        </span>
        <button
          onClick={handleCopy}
          aria-label="Copy Ticket ID"
          className="p-1 transition-colors duration-200 rounded hover:bg-gray-200 active:scale-95"
        >
          <CopyIcon className="w-5 h-5" color="#9ca3af" />
        </button>
      </div>
    </div>
  );
};

export default TicketInfo;
