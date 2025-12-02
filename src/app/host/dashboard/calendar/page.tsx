"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { hostListingQueryKey, useHostListingsQuery } from "@/hooks/use-host-listings";
import {
  useAddBlackoutMutation,
  useDeleteBlackoutMutation,
  useListingCalendarQuery,
} from "@/hooks/use-listing-calendar";
import { cn } from "@/lib/utils";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const isDateBetween = (date: string, start: string, end: string) => {
  const target = new Date(date).getTime();
  return target >= new Date(start).getTime() && target <= new Date(end).getTime();
};

export default function HostCalendarPage() {
  const listingsQuery = useHostListingsQuery();
  const listings = listingsQuery.data ?? [];
  const queryClient = useQueryClient();
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!selectedListingId && listings.length > 0) {
      setSelectedListingId(listings[0].id);
    }
  }, [listings, selectedListingId]);

  const { data: blocks = [], isLoading } = useListingCalendarQuery(selectedListingId, month);
  const invalidateListingDetail = () => {
    if (selectedListingId) {
      queryClient.invalidateQueries({ queryKey: hostListingQueryKey(selectedListingId) });
    }
  };
  const addBlock = useAddBlackoutMutation(selectedListingId, month, {
    onSuccess: invalidateListingDetail,
  });
  const deleteBlock = useDeleteBlackoutMutation(selectedListingId, month, {
    onSuccess: invalidateListingDetail,
  });

  const selectedListing = useMemo(
    () => listings.find((listing) => listing.id === selectedListingId),
    [listings, selectedListingId],
  );
 

  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [pendingRange, setPendingRange] = useState<{
    start: string;
    end: string;
    reason?: string;
  } | null>(null);
  const [tempBlocks, setTempBlocks] = useState<
    Array<{ id: number; listingId: number; startDate: string; endDate: string; reason: string }>
  >([]);
  const [confirming, setConfirming] = useState(false);
  const [removingBlockId, setRemovingBlockId] = useState<number | null>(null);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        if (selectionStart && selectionEnd) {
          const start = new Date(selectionStart) <= new Date(selectionEnd) ? selectionStart : selectionEnd;
          const end = new Date(selectionStart) <= new Date(selectionEnd) ? selectionEnd : selectionStart;
          setPendingRange({ start, end });
        }
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isSelecting, selectionStart, selectionEnd]);

  const combinedBlocks = useMemo(
    () => [...blocks, ...tempBlocks.filter((temp) => temp.listingId === selectedListingId)],
    [blocks, tempBlocks, selectedListingId],
  );

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 1);
    const startWeekday = firstDay.getDay();
    const matrix: Array<{ date: string; currentMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDay);
      date.setDate(i - startWeekday + 1);
      matrix.push({
        date: formatDate(date),
        currentMonth: date.getMonth() === firstDay.getMonth(),
      });
    }
    return matrix;
  }, [month]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-800">Select listing</span>
            <select
              className="w-full rounded-2xl border border-slate-200 p-3"
              value={selectedListingId ?? ""}
              onChange={(event) => setSelectedListingId(Number(event.target.value))}
            >
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-800">Month</span>
            <Input
              type="month"
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          {selectedListing ? (
            <>
              <p className="font-semibold text-slate-900">{selectedListing.title}</p>
              <p>
                {selectedListing.city}, {selectedListing.country} · Guests max:{" "}
                {selectedListing.maxGuests}
              </p>
            </>
          ) : (
            <p>Select a listing to manage its calendar.</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <p className="text-sm text-slate-500">
              Drag across days to propose a blackout range. Existing blocks are highlighted in red.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2 text-sm">
              {daysInMonth.map(({ date, currentMonth }) => {
                const isBlackout = combinedBlocks.some((block) =>
                  isDateBetween(date, block.startDate, block.endDate),
                );
                const isSelected =
                  selectionStart &&
                  selectionEnd &&
                  isDateBetween(
                    date,
                    new Date(selectionStart) <= new Date(selectionEnd) ? selectionStart : selectionEnd,
                    new Date(selectionStart) <= new Date(selectionEnd) ? selectionEnd : selectionStart,
                  );
                return (
                  <div
                    key={date}
                    onMouseDown={() => {
                      setIsSelecting(true);
                      setSelectionStart(date);
                      setSelectionEnd(date);
                    }}
                    onMouseEnter={() => {
                      if (isSelecting) {
                        setSelectionEnd(date);
                      }
                    }}
                    className={cn(
                      "flex h-16 cursor-pointer flex-col items-center justify-center rounded-2xl border",
                      currentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400",
                      isBlackout && "bg-rose-100 text-rose-800 border-rose-200",
                      isSelected && "bg-primary/20 border-primary text-primary font-semibold",
                    )}
                  >
                    <span>{new Date(date).getDate()}</span>
                    {isBlackout && <span className="text-[10px]">Blocked</span>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Blackout dates</CardTitle>
            <p className="text-sm text-slate-500">
              Manage upcoming blocks. You can also use the calendar to select ranges.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            {pendingRange && (
              <form className="space-y-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="font-semibold text-primary">Confirm blackout?</p>
                <p className="text-xs text-slate-500">
                  {new Date(pendingRange.start).toLocaleDateString()} –{" "}
                  {new Date(pendingRange.end).toLocaleDateString()}
                </p>
                <label className="block space-y-2 text-sm">
                  <span className="font-semibold text-slate-800">Reason (optional)</span>
                  <Input
                    value={pendingRange.reason ?? ""}
                    onChange={(event) =>
                      setPendingRange((prev) =>
                        prev ? { ...prev, reason: event.target.value } : prev,
                      )
                    }
                    placeholder="Maintenance, personal use, etc."
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    className="rounded-2xl"
                    disabled={confirming}
                  onClick={async () => {
                    if (!selectedListingId || !pendingRange) return;
                    const tempId = -Date.now();
                    const { start, end, reason } = pendingRange;
                    setConfirming(true);
                    setTempBlocks((prev) => [
                      ...prev,
                      {
                        id: tempId,
                        listingId: selectedListingId,
                        startDate: start,
                        endDate: end,
                        reason: reason ?? "",
                      },
                    ]);
                    setPendingRange(null);
                    setSelectionStart(null);
                    setSelectionEnd(null);
                    try {
                      await addBlock.mutateAsync({
                        startDate: start,
                        endDate: end,
                        reason,
                      });
                    } finally {
                      setTempBlocks((prev) =>
                        prev.filter((block) => !(block.id === tempId && block.listingId === selectedListingId)),
                      );
                      setConfirming(false);
                    }
                  }}
                  >
                    {confirming ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Confirm
                      </span>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                  <Button
                    type="secondary"
                    className="rounded-2xl"
                    onClick={() => {
                      setPendingRange(null);
                      setSelectionStart(null);
                      setSelectionEnd(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
            {isLoading ? (
              <p>Loading calendar...</p>
            ) : combinedBlocks.length === 0 ? (
              <p>No blackout dates for this month.</p>
            ) : (
              <ul className="space-y-2">
                {combinedBlocks.map((block) => (
                  <li
                    key={block.id}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 p-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {new Date(block.startDate).toLocaleDateString()} –{" "}
                        {new Date(block.endDate).toLocaleDateString()}
                      </p>
                      {block.reason && (
                        <p className="text-xs text-slate-500">{block.reason}</p>
                      )}
                    </div>
                    <Button
                      type="secondary"
                      className="rounded-2xl"
                      disabled={removingBlockId === block.id}
                      onClick={async () => {
                        setRemovingBlockId(block.id);
                        try {
                          await deleteBlock.mutateAsync(block.id);
                        } finally {
                          setTempBlocks((prev) => prev.filter((temp) => temp.id !== block.id));
                          setRemovingBlockId(null);
                        }
                      }}
                    >
                      {removingBlockId === block.id ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Remove
                        </span>
                      ) : (
                        "Remove"
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
