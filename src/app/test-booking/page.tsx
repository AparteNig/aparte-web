"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/general/Button";
import LoadingOverlay from "@/components/general/LoadingOverlay";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getAuthCookie, HOST_AUTH_COOKIE } from "@/lib/auth";
import {
  checkInCustomerBooking,
  completeCustomerBooking,
  createCustomerBookingWithToken,
  guestCheckoutCustomerBooking,
  getPublicListings,
  loginUserRequest,
  markBookingCheckoutDue,
  type CreateCustomerBookingPayload,
  verifyOtpRequest,
} from "@/lib/api-client";
import { hostBookingsQueryKey, useHostBookingsQuery } from "@/hooks/use-bookings";
import { useHostListingsQuery } from "@/hooks/use-host-listings";
import { cn } from "@/lib/utils";
import type { HostBooking } from "@/types/listing";

const initialFormState = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  nights: "",
  notes: "",
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const isDateBetween = (date: string, start: string, end: string) => {
  const target = new Date(date).getTime();
  return target >= new Date(start).getTime() && target <= new Date(end).getTime();
};

const USER_TOKEN_KEY = "aparte_test_booking_user_token";
const USER_EMAIL_KEY = "aparte_test_booking_user_email";

export default function TestBookingPage() {
  const [formState, setFormState] = useState(initialFormState);
  const [lastBooking, setLastBooking] = useState<HostBooking | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [overlayState, setOverlayState] = useState<{ title: string; message: string } | null>(null);
  const [alertModal, setAlertModal] = useState<{ title: string; message: string } | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginPending, setLoginPending] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otpId, setOtpId] = useState<number | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpPreview, setOtpPreview] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [hasHostToken, setHasHostToken] = useState(false);

  const bookingsQuery = useHostBookingsQuery(hasHostToken);
  const { data: hostListings = [] } = useHostListingsQuery(hasHostToken);
  const publicListingsQuery = useQuery({
    queryKey: ["publicListings"],
    queryFn: async () => {
      const data = await getPublicListings();
      return data.listings;
    },
    enabled: !hasHostToken,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  const listings = hasHostToken ? hostListings : publicListingsQuery.data ?? [];
  const publishedListings = useMemo(
    () => listings.filter((listing) => listing.status === "published"),
    [listings],
  );

  const [selectedListingId, setSelectedListingId] = useState<number | undefined>(undefined);
  const [manualListingId, setManualListingId] = useState("");
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => {
    if (!selectedListingId && publishedListings.length > 0) {
      setSelectedListingId(publishedListings[0].id);
    }
  }, [publishedListings, selectedListingId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(USER_TOKEN_KEY);
    const storedEmail = window.localStorage.getItem(USER_EMAIL_KEY);
    if (storedToken) setUserToken(storedToken);
    if (storedEmail) setUserEmail(storedEmail);
    setHasHostToken(Boolean(getAuthCookie(HOST_AUTH_COOKIE)));
  }, []);

  const selectedListing = useMemo(
    () => publishedListings.find((listing) => listing.id === selectedListingId),
    [publishedListings, selectedListingId],
  );

  const calendarDays = useMemo(() => {
    const [year, monthString] = month.split("-");
    const firstDay = new Date(Number(year), Number(monthString) - 1, 1);
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

  const handleDateSelect = (date: string) => {
    setDateRange((prev) => {
      if (!prev.start || prev.end) {
        return { start: date, end: undefined };
      }
      if (new Date(date) < new Date(prev.start)) {
        return { start: date, end: prev.start };
      }
      return { start: prev.start, end: date };
    });
  };

  const invalidateBookings = () =>
    queryClient.invalidateQueries({ queryKey: hostBookingsQueryKey });

  const showOverlay = (title: string, message: string) => setOverlayState({ title, message });
  const hideOverlay = () => setOverlayState(null);
  const showAlert = (title: string, message: string) => setAlertModal({ title, message });

  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateCustomerBookingPayload) => {
      if (!userToken) {
        throw new Error("Log in as a user to create a test booking.");
      }
      return createCustomerBookingWithToken(payload, userToken);
    },
    onMutate: () =>
      showOverlay("Creating booking...", "Calling the demo customer booking endpoint."),
    onSuccess: ({ booking }) => {
      setFormState(initialFormState);
      setDateRange({});
      setLastBooking(booking);
      setFormError(null);
      console.info(
        `[test-booking] notifying landlord ${booking.hostId} of booking #${booking.id}`,
        booking,
      );
      invalidateBookings();
      showAlert("Booking created", `Booking #${booking.id} is now confirmed.`);
    },
    onError: (error: unknown) => {
      setLastBooking(null);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Unable to create booking. Please try again.");
        showAlert("Booking failed", "Unable to create booking. Please try again.");
      }
    },
    onSettled: hideOverlay,
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: number) => checkInCustomerBooking(bookingId),
    onMutate: () => showOverlay("Updating booking...", "Marking guest as checked in."),
    onSuccess: ({ booking }) => {
      console.info(`[test-booking] booking #${booking.id} checked in`);
      invalidateBookings();
      showAlert("Guest checked in", `Booking #${booking.id} is now marked ongoing.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to check in", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const checkoutDueMutation = useMutation({
    mutationFn: (bookingId: number) => markBookingCheckoutDue(bookingId),
    onMutate: () => showOverlay("Updating booking...", "Setting status to checkout due."),
    onSuccess: ({ booking }) => {
      console.info(`[test-booking] booking #${booking.id} marked checkout due`);
      invalidateBookings();
      showAlert("Checkout due", `Booking #${booking.id} now awaits guest checkout.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to update", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const guestCheckoutMutation = useMutation({
    mutationFn: (bookingId: number) => guestCheckoutCustomerBooking(bookingId),
    onMutate: () => showOverlay("Updating booking...", "Confirming that the guest left the property."),
    onSuccess: ({ booking }) => {
      console.info(`[test-booking] booking #${booking.id} marked guest checkout`);
      invalidateBookings();
      showAlert("Guest checked out", `Booking #${booking.id} awaits admin confirmation.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to update", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const finalizeBookingMutation = useMutation({
    mutationFn: (bookingId: number) => completeCustomerBooking(bookingId),
    onMutate: () => showOverlay("Completing booking...", "Releasing payout to landlord wallet."),
    onSuccess: ({ booking }) => {
      console.info(`[test-booking] booking #${booking.id} completed`);
      invalidateBookings();
      showAlert("Booking completed", `Booking #${booking.id} has been finalized.`);
    },
    onError: (error: unknown) =>
      showAlert("Completion failed", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const bookings = bookingsQuery.data?.bookings ?? [];

  const confirmedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "confirmed"),
    [bookings],
  );
  const ongoingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "ongoing"),
    [bookings],
  );
  const checkoutDueBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "checkout_due"),
    [bookings],
  );
  const guestDepartedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "guest_departed"),
    [bookings],
  );
  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedListingId) {
      if (!manualListingId) {
        setFormError("Select a listing or enter a listing ID to create a test booking.");
        return;
      }
    }
    if (!userToken) {
      setFormError("Log in as a user to create a test booking.");
      setLoginOpen(true);
      return;
    }
    if (!formState.guestName || !dateRange.start || !dateRange.end) {
      setFormError("Guest name and a date range are required.");
      return;
    }

    const payload: CreateCustomerBookingPayload = {
      listingId: selectedListingId ?? Number(manualListingId),
      guestName: formState.guestName,
      startDate: dateRange.start,
      endDate: dateRange.end,
    };

    if (formState.guestEmail) payload.guestEmail = formState.guestEmail;
    if (formState.guestPhone) payload.guestPhone = formState.guestPhone;
    if (formState.nights) payload.nights = Number(formState.nights);
    if (formState.notes) payload.notes = formState.notes;

    createBookingMutation.mutate(payload);
  };

  const canSubmit = Boolean(
    (selectedListingId || manualListingId) && formState.guestName && dateRange.start && dateRange.end,
  );

  const lifecycleBusy =
    checkInMutation.isPending ||
    checkoutDueMutation.isPending ||
    guestCheckoutMutation.isPending ||
    finalizeBookingMutation.isPending;

  const renderLifecycleAction = (booking: HostBooking) => {
    if (booking.status === "confirmed") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => checkInMutation.mutate(booking.id)}
        >
          {checkInMutation.isPending ? "Updating..." : "Mark guest checked in"}
        </Button>
      );
    }
    if (booking.status === "ongoing") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => checkoutDueMutation.mutate(booking.id)}
        >
          {checkoutDueMutation.isPending ? "Updating..." : "Mark checkout due"}
        </Button>
      );
    }
    if (booking.status === "checkout_due") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => guestCheckoutMutation.mutate(booking.id)}
        >
          {guestCheckoutMutation.isPending ? "Updating..." : "Guest checked out"}
        </Button>
      );
    }
    if (booking.status === "guest_departed") {
      return (
        <Button
          type="primary"
          className="rounded-2xl px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => finalizeBookingMutation.mutate(booking.id)}
        >
          {finalizeBookingMutation.isPending ? "Completing..." : "Complete booking"}
        </Button>
      );
    }
    return null;
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    if (!loginEmail || !loginPassword) {
      setLoginError("Email and password are required.");
      return;
    }
    setLoginPending(true);
    try {
      const response = await loginUserRequest({ email: loginEmail, password: loginPassword });
      if (response.requiresOtp) {
        setOtpStep(true);
        setOtpId(response.otpId);
        setOtpPreview(response.devPreview ?? null);
        setLoginPassword("");
        return;
      }
      setUserToken(response.tokens.accessToken);
      setUserEmail(loginEmail);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_TOKEN_KEY, response.tokens.accessToken);
        window.localStorage.setItem(USER_EMAIL_KEY, loginEmail);
      }
      setLoginPassword("");
      setLoginOpen(false);
      showAlert("Logged in", "User session saved for test bookings.");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Failed to log in.");
    } finally {
      setLoginPending(false);
    }
  };

  const handleOtpVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError(null);
    if (!otpId || !otpCode) {
      setLoginError("OTP code is required.");
      return;
    }
    setLoginPending(true);
    try {
      const response = await verifyOtpRequest({ otpId, code: otpCode });
      setUserToken(response.tokens.accessToken);
      if (loginEmail) setUserEmail(loginEmail);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(USER_TOKEN_KEY, response.tokens.accessToken);
        if (loginEmail) window.localStorage.setItem(USER_EMAIL_KEY, loginEmail);
      }
      setOtpCode("");
      setOtpId(null);
      setOtpStep(false);
      setOtpPreview(null);
      setLoginPassword("");
      setLoginOpen(false);
      showAlert("Logged in", "User session saved for test bookings.");
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Failed to verify OTP.");
    } finally {
      setLoginPending(false);
    }
  };

  const handleLogout = () => {
    setUserToken(null);
    setUserEmail(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(USER_TOKEN_KEY);
      window.localStorage.removeItem(USER_EMAIL_KEY);
    }
    showAlert("Logged out", "User session cleared.");
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      {overlayState && (
        <LoadingOverlay
          isOpen
          title={overlayState.title}
          message={overlayState.message}
        />
      )}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-500">Internal tooling</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-slate-900">Test booking simulator</h1>
          {userToken ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">
                Logged in as {userEmail ?? "user"}
              </span>
              <Button type="secondary" className="rounded-2xl px-4 py-2 text-sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <Button
              type="primary"
              className="rounded-2xl px-4 py-2 text-sm"
              onClick={() => setLoginOpen(true)}
            >
              Log in
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Use this page to create demo bookings, trigger lifecycle changes, and verify that the host
          dashboard updates as expected.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Create a test booking</CardTitle>
          <p className="text-sm text-slate-500">
            Calls the public `/customer/bookings` endpoint. Pick a published listing and drag across
            the calendar to set an available date range.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Listing
                {publishedListings.length > 0 ? (
                  <select
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3"
                    value={selectedListingId ?? ""}
                    onChange={(event) =>
                      setSelectedListingId(
                        event.target.value ? Number(event.target.value) : undefined,
                      )
                    }
                  >
                    {publishedListings.map((listing) => (
                      <option key={listing.id} value={listing.id}>
                        {listing.title}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    className="mt-1"
                    placeholder="Enter listing ID"
                    value={manualListingId}
                    onChange={(event) => setManualListingId(event.target.value)}
                  />
                )}
                {!hasHostToken && publishedListings.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Listings could not be loaded. Enter a listing ID manually.
                  </p>
                )}
              </label>
              <label className="text-sm font-medium text-slate-600">
                Month
                <Input
                  type="month"
                  className="mt-1"
                  value={month}
                  onChange={(event) => setMonth(event.target.value)}
                />
              </label>
            </div>
            {selectedListing && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">{selectedListing.title}</p>
                <p>
                  {selectedListing.city}, {selectedListing.country} · ₦
                  {selectedListing.nightlyPrice.toLocaleString()} per night · Guests max:{" "}
                  {selectedListing.maxGuests}
                </p>
              </div>
            )}
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Select stay dates</p>
                  <p className="text-xs text-slate-500">
                    Click a start day, then click the end day. Adjust the month if needed.
                  </p>
                </div>
                <div className="text-xs text-slate-500">
                  {dateRange.start && dateRange.end ? (
                    <>
                      {new Date(dateRange.start).toLocaleDateString()} –{" "}
                      {new Date(dateRange.end).toLocaleDateString()}
                    </>
                  ) : (
                    "No range selected"
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase text-slate-500">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2 text-sm">
                  {calendarDays.map(({ date, currentMonth }) => {
                    const isSelectedRange =
                      dateRange.start && dateRange.end && isDateBetween(date, dateRange.start, dateRange.end);
                    const isEdge = date === dateRange.start || date === dateRange.end;
                    return (
                      <button
                        type="button"
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "flex h-14 flex-col items-center justify-center rounded-2xl border transition",
                          currentMonth ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 text-slate-400",
                          isSelectedRange && "bg-primary/10 border-primary text-primary font-semibold",
                          isEdge && "bg-primary text-white border-primary",
                        )}
                      >
                        <span>{new Date(date).getDate()}</span>
                      </button>
                    );
                  })}
                </div>
                {dateRange.start && (
                  <Button
                    type="secondary"
                    className="rounded-2xl text-xs"
                    onClick={() => setDateRange({})}
                  >
                    Reset selection
                  </Button>
                )}
              </div>
            </div>
            <label className="text-sm font-medium text-slate-600">
              Guest name
              <Input
                className="mt-1"
                placeholder="Adaeze Okafor"
                value={formState.guestName}
                onChange={(event) => setFormState((prev) => ({ ...prev, guestName: event.target.value }))}
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Guest email
              <Input
                type="email"
                className="mt-1"
                placeholder="ada@example.com"
                value={formState.guestEmail}
                onChange={(event) => setFormState((prev) => ({ ...prev, guestEmail: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Guest phone
              <Input
                type="tel"
                className="mt-1"
                placeholder="+2348012345678"
                value={formState.guestPhone}
                onChange={(event) => setFormState((prev) => ({ ...prev, guestPhone: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Nights (optional override)
              <Input
                type="number"
                min={1}
                className="mt-1"
                placeholder="auto"
                value={formState.nights}
                onChange={(event) => setFormState((prev) => ({ ...prev, nights: event.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 md:col-span-2">
              Notes
              <textarea
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none"
                rows={3}
                placeholder="Internal note, e.g. VIP guest, needs early check-in"
                value={formState.notes}
                onChange={(event) => setFormState((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </label>
            {formError && (
              <p className="md:col-span-2 text-sm text-red-600">
                {formError}
              </p>
            )}
            <div className="md:col-span-2 flex flex-wrap items-center gap-3">
              <Button
                type="primary"
                className="rounded-2xl px-6"
                buttonType="submit"
                disabled={createBookingMutation.isPending || !canSubmit}
              >
                {createBookingMutation.isPending ? "Creating booking..." : "Create booking"}
              </Button>
              {!canSubmit && (
                <span className="text-sm text-slate-500">
                  Select a listing, enter a guest name, and pick a start/end date.
                </span>
              )}
              {lastBooking && (
                <span className="text-sm text-slate-500">
                  Booking #{lastBooking.id} confirmed. Check the landlord dashboard for updates.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Test complete booking</CardTitle>
          <p className="text-sm text-slate-500">
            Requires an authenticated landlord session. Use the buttons below to move bookings through
            the lifecycle and ensure earnings update.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasHostToken && (
            <p className="text-sm text-slate-500">
              Log in as a host to load bookings and lifecycle actions.
            </p>
          )}
          {bookingsQuery.isError && (
            <p className="text-sm text-red-600">
              {bookingsQuery.error instanceof Error
                ? bookingsQuery.error.message
                : "Failed to load landlord bookings. Log in as a landlord to continue."}
            </p>
          )}
          {bookingsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No landlord bookings yet.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Confirmed arrivals", data: confirmedBookings },
                { label: "Ongoing stays", data: ongoingBookings },
                { label: "Checkout due", data: checkoutDueBookings },
                { label: "Guest checked out", data: guestDepartedBookings },
                { label: "Completed", data: completedBookings },
              ].map((section) => (
                <div key={section.label} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">{section.label}</h3>
                      <p className="text-xs text-slate-500">
                        {section.label === "Completed"
                          ? "Payout already released."
                          : "Advance bookings through the lifecycle."}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500">{section.data.length} records</span>
                  </div>
                  {section.data.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">Nothing here yet.</p>
                  ) : (
                    <ul className="mt-3 space-y-3 text-sm text-slate-600">
                      {section.data.map((booking) => (
                        <li key={booking.id} className="rounded-2xl border border-slate-100 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-800">
                            <span className="font-semibold">
                              #{booking.id} · {booking.guestName}
                            </span>
                            <span className="text-xs uppercase text-slate-500">
                              {booking.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {booking.listing?.title ?? `Listing ${booking.listingId}`} —{" "}
                            {new Date(booking.startDate).toLocaleDateString()} to{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            {renderLifecycleAction(booking)}
                            <span className="self-center text-xs text-slate-500">
                              ₦{Number(booking.totalAmount ?? 0).toLocaleString()}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {alertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-slate-900">{alertModal.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{alertModal.message}</p>
            <div className="mt-4 flex justify-end">
              <Button type="primary" className="rounded-2xl px-6" onClick={() => setAlertModal(null)}>
                Got it
              </Button>
            </div>
          </div>
        </div>
      )}

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {otpStep ? "Verify OTP" : "User login"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {otpStep
                    ? "Enter the OTP sent to the user."
                    : "This token is used to create test bookings."}
                </p>
              </div>
              <button
                type="button"
                className="text-sm text-slate-400"
                onClick={() => {
                  setLoginOpen(false);
                  setOtpStep(false);
                  setOtpId(null);
                  setOtpCode("");
                  setOtpPreview(null);
                }}
              >
                Close
              </button>
            </div>
            <form
              className="mt-4 space-y-4"
              onSubmit={otpStep ? handleOtpVerify : handleLogin}
            >
              {otpStep ? (
                <label className="text-sm font-medium text-slate-600">
                  OTP code
                  <Input
                    type="text"
                    className="mt-1"
                    value={otpCode}
                    onChange={(event) => setOtpCode(event.target.value)}
                    required
                  />
                </label>
              ) : (
                <>
                  <label className="text-sm font-medium text-slate-600">
                    Email
                    <Input
                      type="email"
                      className="mt-1"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Password
                    <Input
                      type="password"
                      className="mt-1"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                  </label>
                </>
              )}
              {otpPreview && (
                <p className="text-xs text-slate-500">
                  Dev preview: {otpPreview}
                </p>
              )}
              {loginError && <p className="text-sm text-red-600">{loginError}</p>}
              <div className="flex justify-end gap-3">
                <Button
                  type="secondary"
                  className="rounded-2xl px-4 py-2 text-sm"
                  onClick={() => {
                    setLoginOpen(false);
                    setOtpStep(false);
                    setOtpId(null);
                    setOtpCode("");
                    setOtpPreview(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  className="rounded-2xl px-4 py-2 text-sm"
                  buttonType="submit"
                  disabled={loginPending}
                >
                  {loginPending
                    ? "Signing in..."
                    : otpStep
                      ? "Verify OTP"
                      : "Log in"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
