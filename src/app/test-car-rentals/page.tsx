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
  createCustomerVehicleBookingWithToken,
  guestCheckoutCustomerBooking,
  getPublicVehicles,
  getHostVehicleBookings,
  loginUserRequest,
  markBookingCheckoutDue,
  type CreateCustomerVehicleBookingPayload,
  verifyOtpRequest,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { HostBooking } from "@/types/listing";
import type { HostVehicle } from "@/types/vehicle";

const initialFormState = {
  guestName: "",
  guestEmail: "",
  guestPhone: "",
  days: "",
  notes: "",
  withDriver: false,
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];
const isDateBetween = (date: string, start: string, end: string) => {
  const target = new Date(date).getTime();
  return target >= new Date(start).getTime() && target <= new Date(end).getTime();
};

const USER_TOKEN_KEY = "aparte_test_vehicle_user_token";
const USER_EMAIL_KEY = "aparte_test_vehicle_user_email";
const vehicleBookingsQueryKey = ["hostVehicleBookings"];

export default function TestCarRentalsPage() {
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
  const [manualVehicleId, setManualVehicleId] = useState("");

  const publicVehiclesQuery = useQuery({
    queryKey: ["publicVehicles"],
    queryFn: async () => {
      const data = await getPublicVehicles();
      return data.vehicles;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const hostVehicleBookingsQuery = useQuery({
    queryKey: vehicleBookingsQueryKey,
    queryFn: async () => {
      const data = await getHostVehicleBookings();
      return data.bookings;
    },
    enabled: hasHostToken,
  });

  const publishedVehicles = publicVehiclesQuery.data ?? [];

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | undefined>(undefined);
  const [month, setMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});

  useEffect(() => {
    if (!selectedVehicleId && publishedVehicles.length > 0) {
      setSelectedVehicleId(publishedVehicles[0].id);
    }
  }, [publishedVehicles, selectedVehicleId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(USER_TOKEN_KEY);
    const storedEmail = window.localStorage.getItem(USER_EMAIL_KEY);
    if (storedToken) setUserToken(storedToken);
    if (storedEmail) setUserEmail(storedEmail);
    setHasHostToken(Boolean(getAuthCookie(HOST_AUTH_COOKIE)));
  }, []);

  const selectedVehicle = useMemo(
    () => publishedVehicles.find((v) => v.id === selectedVehicleId),
    [publishedVehicles, selectedVehicleId],
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
      if (!prev.start || prev.end) return { start: date, end: undefined };
      if (new Date(date) < new Date(prev.start)) return { start: date, end: prev.start };
      return { start: prev.start, end: date };
    });
  };

  const invalidateBookings = () =>
    queryClient.invalidateQueries({ queryKey: vehicleBookingsQueryKey });

  const showOverlay = (title: string, message: string) => setOverlayState({ title, message });
  const hideOverlay = () => setOverlayState(null);
  const showAlert = (title: string, message: string) => setAlertModal({ title, message });

  const createBookingMutation = useMutation({
    mutationFn: (payload: CreateCustomerVehicleBookingPayload) => {
      if (!userToken) throw new Error("Log in as a user to create a test rental.");
      return createCustomerVehicleBookingWithToken(payload, userToken);
    },
    onMutate: () => showOverlay("Creating rental...", "Calling the vehicle booking endpoint."),
    onSuccess: ({ booking }) => {
      setFormState(initialFormState);
      setDateRange({});
      setLastBooking(booking);
      setFormError(null);
      invalidateBookings();
      showAlert("Rental created", `Booking #${booking.id} is now confirmed.`);
    },
    onError: (error: unknown) => {
      setLastBooking(null);
      setFormError(error instanceof Error ? error.message : "Unable to create rental. Please try again.");
    },
    onSettled: hideOverlay,
  });

  const checkInMutation = useMutation({
    mutationFn: (bookingId: number) => checkInCustomerBooking(bookingId),
    onMutate: () => showOverlay("Updating rental...", "Marking vehicle as picked up."),
    onSuccess: ({ booking }) => {
      invalidateBookings();
      showAlert("Vehicle picked up", `Booking #${booking.id} is now ongoing.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to update", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const returnDueMutation = useMutation({
    mutationFn: (bookingId: number) => markBookingCheckoutDue(bookingId),
    onMutate: () => showOverlay("Updating rental...", "Setting status to return due."),
    onSuccess: ({ booking }) => {
      invalidateBookings();
      showAlert("Return due", `Booking #${booking.id} now awaits vehicle return.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to update", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const vehicleReturnedMutation = useMutation({
    mutationFn: (bookingId: number) => guestCheckoutCustomerBooking(bookingId),
    onMutate: () => showOverlay("Updating rental...", "Confirming vehicle was returned."),
    onSuccess: ({ booking }) => {
      invalidateBookings();
      showAlert("Vehicle returned", `Booking #${booking.id} awaits admin confirmation.`);
    },
    onError: (error: unknown) =>
      showAlert("Failed to update", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const finalizeRentalMutation = useMutation({
    mutationFn: (bookingId: number) => completeCustomerBooking(bookingId),
    onMutate: () => showOverlay("Completing rental...", "Releasing payout to host wallet."),
    onSuccess: ({ booking }) => {
      invalidateBookings();
      showAlert("Rental completed", `Booking #${booking.id} has been finalized.`);
    },
    onError: (error: unknown) =>
      showAlert("Completion failed", error instanceof Error ? error.message : "Unknown error."),
    onSettled: hideOverlay,
  });

  const bookings = hostVehicleBookingsQuery.data ?? [];

  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === "confirmed"), [bookings]);
  const ongoingBookings = useMemo(() => bookings.filter((b) => b.status === "ongoing"), [bookings]);
  const returnDueBookings = useMemo(() => bookings.filter((b) => b.status === "checkout_due"), [bookings]);
  const returnedBookings = useMemo(() => bookings.filter((b) => b.status === "guest_departed"), [bookings]);
  const completedBookings = useMemo(() => bookings.filter((b) => b.status === "completed"), [bookings]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedVehicleId && !manualVehicleId) {
      setFormError("Select a vehicle or enter a vehicle ID.");
      return;
    }
    if (!userToken) {
      setFormError("Log in as a user to create a test rental.");
      setLoginOpen(true);
      return;
    }
    if (!formState.guestName || !dateRange.start || !dateRange.end) {
      setFormError("Renter name and a date range are required.");
      return;
    }

    const payload: CreateCustomerVehicleBookingPayload = {
      vehicleId: selectedVehicleId ?? Number(manualVehicleId),
      guestName: formState.guestName,
      startDate: dateRange.start,
      endDate: dateRange.end,
    };

    if (formState.guestEmail) payload.guestEmail = formState.guestEmail;
    if (formState.guestPhone) payload.guestPhone = formState.guestPhone;
    if (formState.days) payload.days = Number(formState.days);
    if (formState.withDriver) payload.withDriver = true;
    if (formState.notes) payload.notes = formState.notes;

    createBookingMutation.mutate(payload);
  };

  const canSubmit = Boolean(
    (selectedVehicleId || manualVehicleId) && formState.guestName && dateRange.start && dateRange.end,
  );

  const lifecycleBusy =
    checkInMutation.isPending ||
    returnDueMutation.isPending ||
    vehicleReturnedMutation.isPending ||
    finalizeRentalMutation.isPending;

  const renderLifecycleAction = (booking: HostBooking) => {
    if (booking.status === "confirmed") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => checkInMutation.mutate(booking.id)}
        >
          {checkInMutation.isPending ? "Updating..." : "Mark vehicle picked up"}
        </Button>
      );
    }
    if (booking.status === "ongoing") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => returnDueMutation.mutate(booking.id)}
        >
          {returnDueMutation.isPending ? "Updating..." : "Mark return due"}
        </Button>
      );
    }
    if (booking.status === "checkout_due") {
      return (
        <Button
          type="secondary"
          className="rounded-2xl border px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => vehicleReturnedMutation.mutate(booking.id)}
        >
          {vehicleReturnedMutation.isPending ? "Updating..." : "Mark vehicle returned"}
        </Button>
      );
    }
    if (booking.status === "guest_departed") {
      return (
        <Button
          type="primary"
          className="rounded-2xl px-4 py-2 text-sm"
          disabled={lifecycleBusy}
          onClick={() => finalizeRentalMutation.mutate(booking.id)}
        >
          {finalizeRentalMutation.isPending ? "Completing..." : "Complete rental"}
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
      showAlert("Logged in", "User session saved for test rentals.");
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
      showAlert("Logged in", "User session saved for test rentals.");
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

  const vehicleLabel = (v: HostVehicle) =>
    `${v.year} ${v.make} ${v.model} — ₦${v.dailyPrice.toLocaleString()}/day · ${v.pickupCity}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      {overlayState && (
        <LoadingOverlay isOpen title={overlayState.title} message={overlayState.message} />
      )}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-500">Internal tooling</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-slate-900">Car rental simulator</h1>
          {userToken ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">Logged in as {userEmail ?? "user"}</span>
              <Button type="secondary" className="rounded-2xl px-4 py-2 text-sm" onClick={handleLogout}>
                Log out
              </Button>
            </div>
          ) : (
            <Button type="primary" className="rounded-2xl px-4 py-2 text-sm" onClick={() => setLoginOpen(true)}>
              Log in
            </Button>
          )}
        </div>
        <p className="text-sm text-slate-600">
          Use this page to create demo vehicle rentals, advance them through the lifecycle, and
          verify that the host vehicle dashboard updates correctly.
        </p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Create a test rental</CardTitle>
          <p className="text-sm text-slate-500">
            Calls <code className="rounded bg-slate-100 px-1">/customer/vehicle-bookings</code>.
            Pick a published vehicle and drag across the calendar to set a rental period.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-600">
                Vehicle
                {publishedVehicles.length > 0 ? (
                  <select
                    className="mt-1 w-full rounded-2xl border border-slate-200 p-3"
                    value={selectedVehicleId ?? ""}
                    onChange={(e) =>
                      setSelectedVehicleId(e.target.value ? Number(e.target.value) : undefined)
                    }
                  >
                    {publishedVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {vehicleLabel(v)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    className="mt-1"
                    placeholder="Enter vehicle ID"
                    value={manualVehicleId}
                    onChange={(e) => setManualVehicleId(e.target.value)}
                  />
                )}
                {publicVehiclesQuery.isLoading && (
                  <p className="mt-1 text-xs text-slate-500">Loading vehicles...</p>
                )}
                {!publicVehiclesQuery.isLoading && publishedVehicles.length === 0 && (
                  <p className="mt-1 text-xs text-slate-500">
                    No published vehicles found. Enter a vehicle ID manually.
                  </p>
                )}
              </label>
              <label className="text-sm font-medium text-slate-600">
                Month
                <Input
                  type="month"
                  className="mt-1"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </label>
            </div>

            {selectedVehicle && (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </p>
                <p>
                  {selectedVehicle.transmission} · {selectedVehicle.fuelType} ·{" "}
                  {selectedVehicle.seatCapacity} seats · ₦{selectedVehicle.dailyPrice.toLocaleString()}/day
                </p>
                <p>
                  Caution: ₦{selectedVehicle.cautionDeposit.toLocaleString()} · Pick-up:{" "}
                  {selectedVehicle.pickupCity}, {selectedVehicle.pickupCountry}
                </p>
                {selectedVehicle.withDriverAvailable && (
                  <p className="mt-1 text-xs text-slate-500">
                    Driver available · +₦{selectedVehicle.driverDailyFee.toLocaleString()}/day
                  </p>
                )}
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Select rental dates</p>
                  <p className="text-xs text-slate-500">
                    Click a pick-up day, then click the return day.
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
                    const inRange =
                      dateRange.start && dateRange.end && isDateBetween(date, dateRange.start, dateRange.end);
                    const isEdge = date === dateRange.start || date === dateRange.end;
                    return (
                      <button
                        type="button"
                        key={date}
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "flex h-14 flex-col items-center justify-center rounded-2xl border transition",
                          currentMonth
                            ? "border-slate-200 bg-white"
                            : "border-slate-100 bg-slate-50 text-slate-400",
                          inRange && "border-primary bg-primary/10 font-semibold text-primary",
                          isEdge && "border-primary bg-primary text-white",
                        )}
                      >
                        <span>{new Date(date).getDate()}</span>
                      </button>
                    );
                  })}
                </div>
                {dateRange.start && (
                  <Button type="secondary" className="rounded-2xl text-xs" onClick={() => setDateRange({})}>
                    Reset selection
                  </Button>
                )}
              </div>
            </div>

            <label className="text-sm font-medium text-slate-600">
              Renter name
              <Input
                className="mt-1"
                placeholder="Adaeze Okafor"
                value={formState.guestName}
                onChange={(e) => setFormState((p) => ({ ...p, guestName: e.target.value }))}
                required
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Renter email
              <Input
                type="email"
                className="mt-1"
                placeholder="ada@example.com"
                value={formState.guestEmail}
                onChange={(e) => setFormState((p) => ({ ...p, guestEmail: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Renter phone
              <Input
                type="tel"
                className="mt-1"
                placeholder="+2348012345678"
                value={formState.guestPhone}
                onChange={(e) => setFormState((p) => ({ ...p, guestPhone: e.target.value }))}
              />
            </label>
            <label className="text-sm font-medium text-slate-600">
              Days (optional override)
              <Input
                type="number"
                min={1}
                className="mt-1"
                placeholder="auto"
                value={formState.days}
                onChange={(e) => setFormState((p) => ({ ...p, days: e.target.value }))}
              />
            </label>

            {selectedVehicle?.withDriverAvailable && (
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={formState.withDriver}
                  onChange={(e) => setFormState((p) => ({ ...p, withDriver: e.target.checked }))}
                />
                Include driver (+₦{selectedVehicle.driverDailyFee.toLocaleString()}/day)
              </label>
            )}

            <label className="text-sm font-medium text-slate-600">
              Notes
              <textarea
                className="mt-1 w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-primary focus:outline-none"
                rows={3}
                placeholder="e.g. Airport pick-up, early return expected"
                value={formState.notes}
                onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
              />
            </label>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="primary"
                className="rounded-2xl px-6"
                buttonType="submit"
                disabled={createBookingMutation.isPending || !canSubmit}
              >
                {createBookingMutation.isPending ? "Creating rental..." : "Create rental"}
              </Button>
              {!canSubmit && (
                <span className="text-sm text-slate-500">
                  Select a vehicle, enter a renter name, and pick a start/end date.
                </span>
              )}
              {lastBooking && (
                <span className="text-sm text-slate-500">
                  Booking #{lastBooking.id} confirmed. Check the host dashboard for updates.
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Test rental lifecycle</CardTitle>
          <p className="text-sm text-slate-500">
            Requires an authenticated host session. Advance rentals through pick-up → return → completion.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasHostToken && (
            <p className="text-sm text-slate-500">
              Log in as a host to load vehicle bookings and lifecycle actions.
            </p>
          )}
          {hostVehicleBookingsQuery.isError && (
            <p className="text-sm text-red-600">
              {hostVehicleBookingsQuery.error instanceof Error
                ? hostVehicleBookingsQuery.error.message
                : "Failed to load vehicle bookings. Log in as a host to continue."}
            </p>
          )}
          {hostVehicleBookingsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading rentals...</p>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-slate-500">No vehicle rentals yet.</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: "Confirmed pick-ups", data: confirmedBookings },
                { label: "Ongoing rentals", data: ongoingBookings },
                { label: "Return due", data: returnDueBookings },
                { label: "Vehicle returned", data: returnedBookings },
                { label: "Completed", data: completedBookings },
              ].map((section) => (
                <div key={section.label} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700">{section.label}</h3>
                      <p className="text-xs text-slate-500">
                        {section.label === "Completed"
                          ? "Payout already released."
                          : "Advance rentals through the lifecycle."}
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
                            {booking.vehicle
                              ? `${booking.vehicle.year} ${booking.vehicle.make} ${booking.vehicle.model} — ${booking.vehicle.pickupCity}`
                              : `Vehicle #${booking.vehicleId}`}
                            {" — "}
                            {new Date(booking.startDate).toLocaleDateString()} to{" "}
                            {new Date(booking.endDate).toLocaleDateString()}
                            {booking.withDriver && " · With driver"}
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
                    : "This token is used to create test rentals."}
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
            <form className="mt-4 space-y-4" onSubmit={otpStep ? handleOtpVerify : handleLogin}>
              {otpStep ? (
                <label className="text-sm font-medium text-slate-600">
                  OTP code
                  <Input
                    type="text"
                    className="mt-1"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
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
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label className="text-sm font-medium text-slate-600">
                    Password
                    <Input
                      type="password"
                      className="mt-1"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </label>
                </>
              )}
              {otpPreview && (
                <p className="text-xs text-slate-500">Dev preview: {otpPreview}</p>
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
                  {loginPending ? "Signing in..." : otpStep ? "Verify OTP" : "Log in"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
