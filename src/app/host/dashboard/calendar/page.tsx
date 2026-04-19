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
import {
  useHostVehiclesQuery,
  useHostVehicleQuery,
  useAddVehicleCalendarBlockMutation,
  useDeleteVehicleCalendarBlockMutation,
} from "@/hooks/use-host-vehicles";
import { cn } from "@/lib/utils";
import type { ListingCalendarBlock } from "@/types/listing";
import type { VehicleCalendarBlock } from "@/types/vehicle";

const formatDate = (date: Date) => date.toISOString().split("T")[0];

const isDateBetween = (date: string, start: string, end: string) => {
  const target = new Date(date).getTime();
  return target >= new Date(start).getTime() && target <= new Date(end).getTime();
};

type Block = { id: number; startDate: string; endDate: string; reason: string };
type Mode = "listings" | "vehicles";

function toBlock(b: ListingCalendarBlock | VehicleCalendarBlock): Block {
  return { id: b.id, startDate: String(b.startDate), endDate: String(b.endDate), reason: b.reason ?? "" };
}

export default function HostCalendarPage() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<Mode>("listings");
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // ── Listings ─────────────────────────────────────────────────
  const listingsQuery = useHostListingsQuery();
  const listings = listingsQuery.data ?? [];
  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!selectedListingId && listings.length > 0) setSelectedListingId(listings[0].id);
  }, [listings, selectedListingId]);

  const { data: listingBlocksData, isLoading: listingCalendarLoading } = useListingCalendarQuery(
    selectedListingId,
    month,
  );
  const listingBlocks: Block[] = (
    Array.isArray(listingBlocksData) ? (listingBlocksData as ListingCalendarBlock[]) : []
  ).map(toBlock);

  const invalidateListingDetail = () => {
    if (selectedListingId)
      queryClient.invalidateQueries({ queryKey: hostListingQueryKey(selectedListingId) });
  };
  const addListingBlock = useAddBlackoutMutation(selectedListingId, month, {
    onSuccess: invalidateListingDetail,
  });
  const deleteListingBlock = useDeleteBlackoutMutation(selectedListingId, month, {
    onSuccess: invalidateListingDetail,
  });

  const selectedListing = useMemo(
    () => listings.find((l) => l.id === selectedListingId),
    [listings, selectedListingId],
  );

  // ── Vehicles ─────────────────────────────────────────────────
  const vehiclesQuery = useHostVehiclesQuery();
  const vehicles = vehiclesQuery.data ?? [];
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!selectedVehicleId && vehicles.length > 0) setSelectedVehicleId(vehicles[0].id);
  }, [vehicles, selectedVehicleId]);

  const { data: selectedVehicle } = useHostVehicleQuery(selectedVehicleId);
  const vehicleBlocks: Block[] = (selectedVehicle?.calendarBlocks ?? []).map(toBlock);

  const addVehicleBlock = useAddVehicleCalendarBlockMutation(selectedVehicleId);
  const deleteVehicleBlock = useDeleteVehicleCalendarBlockMutation(selectedVehicleId);

  const selectedVehicleInfo = useMemo(
    () => vehicles.find((v) => v.id === selectedVehicleId),
    [vehicles, selectedVehicleId],
  );

  // ── Shared state (resets on mode switch) ─────────────────────
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<string | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<string | null>(null);
  const [pendingRange, setPendingRange] = useState<{ start: string; end: string; reason?: string } | null>(null);
  const [tempBlocks, setTempBlocks] = useState<Block[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [removingBlockId, setRemovingBlockId] = useState<number | null>(null);

  const resetSelection = () => {
    setPendingRange(null);
    setSelectionStart(null);
    setSelectionEnd(null);
    setTempBlocks([]);
  };

  useEffect(() => {
    resetSelection();
  }, [mode]);

  useEffect(() => {
    const handleMouseUp = () => {
      if (isSelecting) {
        setIsSelecting(false);
        if (selectionStart && selectionEnd) {
          const [start, end] =
            new Date(selectionStart) <= new Date(selectionEnd)
              ? [selectionStart, selectionEnd]
              : [selectionEnd, selectionStart];
          setPendingRange({ start, end });
        }
      }
    };
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, [isSelecting, selectionStart, selectionEnd]);

  // ── Active data based on mode ─────────────────────────────────
  const activeBlocks = mode === "listings" ? listingBlocks : vehicleBlocks;
  const isCalendarLoading = mode === "listings" ? listingCalendarLoading : false;
  const isRentedOrBooked = (reason: string) =>
    mode === "vehicles"
      ? reason.toLowerCase().startsWith("rented")
      : reason.toLowerCase().startsWith("booked");

  const combinedBlocks = useMemo(
    () => [...activeBlocks, ...tempBlocks],
    [activeBlocks, tempBlocks],
  );

  const blackoutBlocks = useMemo(
    () => combinedBlocks.filter((b) => !isRentedOrBooked(b.reason)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [combinedBlocks, mode],
  );

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(Number(month.split("-")[0]), Number(month.split("-")[1]) - 1, 1);
    const startWeekday = firstDay.getDay();
    const matrix: Array<{ date: string; currentMonth: boolean }> = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDay);
      date.setDate(i - startWeekday + 1);
      matrix.push({ date: formatDate(date), currentMonth: date.getMonth() === firstDay.getMonth() });
    }
    return matrix;
  }, [month]);

  const handleConfirmBlock = async () => {
    if (!pendingRange) return;
    const { start, end, reason } = pendingRange;
    const tempId = -Date.now();
    setConfirming(true);
    setTempBlocks((prev) => [...prev, { id: tempId, startDate: start, endDate: end, reason: reason ?? "" }]);
    setPendingRange(null);
    setSelectionStart(null);
    setSelectionEnd(null);
    try {
      if (mode === "listings") {
        await addListingBlock.mutateAsync({ startDate: start, endDate: end, reason });
      } else {
        await addVehicleBlock.mutateAsync({ startDate: start, endDate: end, reason: reason || undefined });
      }
    } finally {
      setTempBlocks((prev) => prev.filter((b) => b.id !== tempId));
      setConfirming(false);
    }
  };

  const handleRemoveBlock = async (blockId: number) => {
    setRemovingBlockId(blockId);
    try {
      if (mode === "listings") {
        await deleteListingBlock.mutateAsync(blockId);
      } else {
        await deleteVehicleBlock.mutateAsync(blockId);
      }
    } finally {
      setTempBlocks((prev) => prev.filter((b) => b.id !== blockId));
      setRemovingBlockId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode toggle + selectors */}
      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-2">
          {(["listings", "vehicles"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                "rounded-full px-5 py-1.5 text-xs font-semibold transition",
                mode === m ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200",
              )}
            >
              {m === "listings" ? "Listings" : "Vehicles"}
            </button>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {mode === "listings" ? (
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-800">Select listing</span>
              <select
                className="w-full rounded-2xl border border-slate-200 p-3"
                value={selectedListingId ?? ""}
                onChange={(e) => setSelectedListingId(Number(e.target.value))}
              >
                {listings.map((l) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="space-y-2 text-sm">
              <span className="font-semibold text-slate-800">Select vehicle</span>
              <select
                className="w-full rounded-2xl border border-slate-200 p-3"
                value={selectedVehicleId ?? ""}
                onChange={(e) => setSelectedVehicleId(Number(e.target.value))}
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.year} {v.make} {v.model}</option>
                ))}
              </select>
            </label>
          )}
          <label className="space-y-2 text-sm">
            <span className="font-semibold text-slate-800">Month</span>
            <Input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </label>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          {mode === "listings" ? (
            selectedListing ? (
              <>
                <p className="font-semibold text-slate-900">{selectedListing.title}</p>
                <p>{selectedListing.city}, {selectedListing.country} · Guests max: {selectedListing.maxGuests}</p>
              </>
            ) : (
              <p>Select a listing to manage its calendar.</p>
            )
          ) : selectedVehicleInfo ? (
            <>
              <p className="font-semibold text-slate-900">
                {selectedVehicleInfo.year} {selectedVehicleInfo.make} {selectedVehicleInfo.model}
              </p>
              <p>
                {selectedVehicleInfo.transmission} · {selectedVehicleInfo.fuelType} ·{" "}
                {selectedVehicleInfo.seatCapacity} seats · ₦{selectedVehicleInfo.dailyPrice.toLocaleString()}/day ·{" "}
                {selectedVehicleInfo.pickupCity}, {selectedVehicleInfo.pickupCountry}
              </p>
            </>
          ) : (
            <p>Select a vehicle to manage its calendar.</p>
          )}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <p className="text-sm text-slate-500">
              Drag across days to propose a blackout range.{" "}
              {mode === "listings"
                ? "Green = booked · Red = manually blocked."
                : "Green = rented · Red = manually blocked."}
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
                const blockEntry = combinedBlocks.find((b) =>
                  isDateBetween(date, b.startDate, b.endDate),
                );
                const isTaken = blockEntry ? isRentedOrBooked(blockEntry.reason) : false;
                const hasBlock = Boolean(blockEntry);
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
                      if (isSelecting) setSelectionEnd(date);
                    }}
                    className={cn(
                      "flex h-16 cursor-pointer flex-col items-center justify-center rounded-2xl border select-none",
                      currentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400",
                      hasBlock && (isTaken
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-rose-200 bg-rose-100 text-rose-800"),
                      isSelected && "border-primary bg-primary/20 font-semibold text-primary",
                    )}
                  >
                    <span>{new Date(date).getDate()}</span>
                    {hasBlock && (
                      <span className="text-[10px]">
                        {isTaken ? (mode === "vehicles" ? "Rented" : "Booked") : "Blocked"}
                      </span>
                    )}
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
              Manage upcoming blocks. Drag on the calendar to select a range.
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
                    onChange={(e) =>
                      setPendingRange((prev) => prev ? { ...prev, reason: e.target.value } : prev)
                    }
                    placeholder="Maintenance, personal use, etc."
                  />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="primary"
                    className="rounded-2xl"
                    disabled={confirming}
                    onClick={handleConfirmBlock}
                  >
                    {confirming ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving…
                      </span>
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                  <Button type="secondary" className="rounded-2xl" onClick={resetSelection}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {isCalendarLoading ? (
              <p>Loading calendar...</p>
            ) : blackoutBlocks.length === 0 ? (
              <p>No blackout dates for this {mode === "vehicles" ? "vehicle" : "listing"} this month.</p>
            ) : (
              <ul className="space-y-2">
                {blackoutBlocks.map((block) => (
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
                      onClick={() => handleRemoveBlock(block.id)}
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
