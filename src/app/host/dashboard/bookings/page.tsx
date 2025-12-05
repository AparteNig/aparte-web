"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useHostBookingsQuery, useCompleteBookingMutation } from "@/hooks/use-bookings";
import { useHostListingsQuery } from "@/hooks/use-host-listings";
import { useListingCalendarQuery } from "@/hooks/use-listing-calendar";
import { cn } from "@/lib/utils";
import type { ListingCalendarBlock } from "@/types/listing";

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const isDateBetween = (date: string, start: string, end: string) => {
  const target = new Date(date).getTime();
  return target >= new Date(start).getTime() && target <= new Date(end).getTime();
};

export default function HostBookingsPage() {
  const bookingsQuery = useHostBookingsQuery();
  const completeBooking = useCompleteBookingMutation();
  const listingsQuery = useHostListingsQuery();
  const listings = listingsQuery.data ?? [];
  const bookings = bookingsQuery.data?.bookings ?? [];
  const summary = bookingsQuery.data?.summary ?? {
    activeCount: 0,
    activeAmount: 0,
    completedCount: 0,
    completedAmount: 0,
  };

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

  const { data: blocksData, isLoading: calendarLoading } = useListingCalendarQuery(
    selectedListingId,
    month,
  );
  const blocks: ListingCalendarBlock[] = Array.isArray(blocksData)
    ? (blocksData as ListingCalendarBlock[])
    : [];

  const bookingsForListing = useMemo(() => {
    if (!selectedListingId) return bookings;
    return bookings.filter((booking) => booking.listingId === selectedListingId);
  }, [bookings, selectedListingId]);

  const daysInMonth = useMemo(() => {
    const [year, monthStr] = month.split("-");
    const firstDay = new Date(Number(year), Number(monthStr) - 1, 1);
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
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Bookings overview</h2>
          <p className="text-sm text-slate-500">Track reservations across listings and manage calendars.</p>
        </div>
        <div className="grid gap-4 pt-4 md:grid-cols-4">
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Filter by listing</label>
            <select
              className="mt-2 w-full rounded-2xl border border-slate-200 p-3 text-sm"
              value={selectedListingId ?? ""}
              onChange={(event) => setSelectedListingId(Number(event.target.value))}
            >
              {listings.map((listing) => (
                <option key={listing.id} value={listing.id}>
                  {listing.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Active bookings</label>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{summary.activeCount}</p>
            <p className="text-xs text-slate-500">₦{summary.activeAmount.toLocaleString()} in pipeline</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Completed earnings</label>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              ₦{summary.completedAmount.toLocaleString()}
            </p>
            <p className="text-xs text-slate-500">{summary.completedCount} completed stays</p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-slate-500">Upcoming bookings</label>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {bookings.filter(
                (booking) =>
                  new Date(booking.startDate) >= new Date() &&
                  booking.status !== "completed",
              ).length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-slate-200 md:col-span-2">
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
            <p className="text-sm text-slate-500">
              Recent reservations across your listings. Filter using the dropdown above.
            </p>
          </CardHeader>
          <CardContent className="overflow-auto">
            {bookingsQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading bookings...</p>
            ) : bookingsForListing.length === 0 ? (
              <p className="text-sm text-slate-500">No bookings yet.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-600">
                <thead>
                  <tr className="text-xs uppercase text-slate-500">
                    <th className="pb-2">Listing</th>
                    <th className="pb-2">Guest</th>
                    <th className="pb-2">Dates</th>
                    <th className="pb-2">Nights</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookingsForListing.map((booking) => {
                    const amount = Number(booking.totalAmount ?? 0);
                    return (
                      <tr key={booking.id}>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">
                          {booking.listing?.title ?? `Listing #${booking.listingId}`}
                        </div>
                        <p className="text-xs text-slate-500">
                          {booking.listing?.city}, {booking.listing?.country}
                        </p>
                      </td>
                      <td className="py-3">
                        <div className="font-semibold text-slate-900">{booking.guestName}</div>
                        <p className="text-xs text-slate-500">{booking.guestEmail || booking.guestPhone}</p>
                      </td>
                      <td className="py-3">
                        {new Date(booking.startDate).toLocaleDateString()} –{" "}
                        {new Date(booking.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3">{booking.nights}</td>
                      <td className="py-3">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            booking.status === "confirmed"
                              ? "bg-emerald-100 text-emerald-700"
                              : booking.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {booking.status}
                        </span>
                        <p className="text-xs text-slate-500">
                          ₦{amount.toLocaleString()}
                        </p>
                      </td>
                      <td className="py-3 text-right">
                        {booking.status === "confirmed" && (
                          <button
                            type="button"
                            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                            disabled={completeBooking.isPending}
                            onClick={() => completeBooking.mutate(booking.id)}
                          >
                            Mark completed
                          </button>
                        )}
                      </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <p className="text-sm text-slate-500">Booked days include naming; other blocks are red.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="block text-xs font-semibold uppercase text-slate-500">
              Month
              <Input
                type="month"
                className="mt-1"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>
            {calendarLoading ? (
              <p className="text-sm text-slate-500">Loading calendar…</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 text-sm">
                  {daysInMonth.map(({ date, currentMonth }) => {
                    const block = blocks.find((block) => isDateBetween(date, block.startDate, block.endDate));
                    const isBooked = block?.reason?.toLowerCase().startsWith("booked");
                    return (
                      <div
                        key={date}
                        className={cn(
                          "flex h-16 flex-col items-center justify-center rounded-2xl border",
                          currentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400",
                          block && "border-rose-200 bg-rose-100 text-rose-800",
                          isBooked && "border-emerald-200 bg-emerald-100 text-emerald-800",
                        )}
                      >
                        <span>{new Date(date).getDate()}</span>
                        {isBooked && <span className="text-[10px]">Booked</span>}
                        {!isBooked && block && <span className="text-[10px]">Blocked</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
