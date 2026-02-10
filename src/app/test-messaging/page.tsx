"use client";

import { FormEvent, useEffect, useState } from "react";

import Button from "@/components/general/Button";
import { Input } from "@/components/ui/input";
import ChatPanel from "@/components/messaging/chat-panel";
import { loginUserRequest, verifyOtpRequest } from "@/lib/api-client";

const USER_TOKEN_KEY = "aparte_test_booking_user_token";
const USER_EMAIL_KEY = "aparte_test_booking_user_email";

export default function TestMessagingPage() {
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedToken = window.localStorage.getItem(USER_TOKEN_KEY);
    const storedEmail = window.localStorage.getItem(USER_EMAIL_KEY);
    if (storedToken) setUserToken(storedToken);
    if (storedEmail) setUserEmail(storedEmail);
  }, []);

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
      setLoginOpen(false);
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
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-500">Internal tooling</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold text-slate-900">Test messaging</h1>
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
          Use this page to open a booking conversation and send messages as the user.
        </p>
      </div>

      <ChatPanel token={userToken} title="User messaging workspace" />

      {loginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {otpStep ? "Verify OTP" : "User login"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {otpStep ? "Enter the OTP sent to the user." : "Sign in to send messages."}
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
