import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, SkipBack, SkipForward } from "lucide-react";

type ReferralRecord = {
  referrerName: string;
  referralCount: number;
  refereeNames: string[];
  registrationDates: Array<string | null>;
  states: string[];
};

const mockReferrals: ReferralRecord[] = [
  {
    referrerName: "Ada Kay",
    referralCount: 3,
    refereeNames: ["Matt Shaw", "Kelly Hart", "Bola Tin"],
    registrationDates: ["2024-09-12", "2024-10-05", "2024-11-20"],
    states: ["Lagos", "Abuja", "Rivers"],
  },
  {
    referrerName: "Victor N.",
    referralCount: 1,
    refereeNames: ["Jenny Class"],
    registrationDates: ["2024-12-03"],
    states: ["Enugu"],
  },
  {
    referrerName: "No Referrals Yet",
    referralCount: 0,
    refereeNames: ["N/A"],
    registrationDates: [null],
    states: ["N/A"],
  },
];

const rowsPerPage = 10;

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not available";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  const day = date.getDate();
  const suffix = getDaySuffix(day);
  return `${day}${suffix} ${date.toLocaleString("en-US", {
    month: "long",
  })} ${date.getFullYear()}`;
};

const getDaySuffix = (day: number) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const ReferralTable: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const currentData = useMemo(() => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return mockReferrals.slice(indexOfFirstRow, indexOfLastRow);
  }, [currentPage]);

  const totalPages = Math.ceil(mockReferrals.length / rowsPerPage) || 1;

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const toggleRowExpand = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="overflow-x-auto">
      <div className="md:hidden">
        {currentData.map((referral, index) => {
          const isExpanded = expandedRows[index] || false;
          return (
            <div key={index} className="mb-4 bg-white border rounded-lg shadow-sm">
              <div
                className="flex items-center justify-between p-3 border-b cursor-pointer"
                onClick={() => toggleRowExpand(index)}
              >
                <div className="font-medium">{referral.referrerName}</div>
                <div className="flex items-center">
                  <span className="px-2 py-1 mr-2 text-sm text-green-800 bg-green-100 rounded-full">
                    {referral.referralCount} referrals
                  </span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
              {isExpanded && (
                <div className="p-3">
                  {referral.refereeNames.map((name, idx) => (
                    <div key={idx} className="pb-3 mb-3 border-b border-gray-100 last:border-0">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="font-medium">Referee:</div>
                        <div>{name}</div>
                        <div className="font-medium">Date Registered:</div>
                        <div>{formatDate(referral.registrationDates[idx])}</div>
                        <div className="font-medium">State:</div>
                        <div>{referral.states[idx]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden md:block">
        <table className="w-full border-t border-b border-collapse border-gray-300">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="p-2 border-b">Referrer&apos;s Name</th>
              <th className="p-2 border-b">Number of Referrals</th>
              <th className="p-2 border-b">Referee&apos;s Name</th>
              <th className="p-2 border-b">Date of Registration</th>
              <th className="p-2 border-b">State of Residence</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((referral, index) => (
              <tr key={index} className="border-b">
                <td className="p-2">{referral.referrerName}</td>
                <td className="p-2">{referral.referralCount}</td>
                <td className="p-2">
                  {referral.refereeNames.map((name, idx) => (
                    <div key={idx}>{name}</div>
                  ))}
                </td>
                <td className="p-2">
                  {referral.registrationDates.map((date, idx) => (
                    <div key={idx}>{formatDate(date)}</div>
                  ))}
                </td>
                <td className="p-2">
                  {referral.states.map((state, idx) => (
                    <div key={idx}>{state}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center mt-4 space-x-4">
        <button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="p-2 text-xl border border-green-400 rounded-full disabled:opacity-50"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <span>
          Page {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className="p-2 text-xl border border-green-400 rounded-full disabled:opacity-50"
        >
          <SkipForward className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ReferralTable;
