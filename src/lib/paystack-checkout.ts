"use client";

// Opens Paystack's payment popup for a transaction that was already
// initialized server-side (amounts are computed by the backend — the
// browser only ever presents the access code).
//
// @paystack/inline-js references `window` at module scope, so it must be
// imported lazily here: this module gets evaluated during SSR even inside
// "use client" files, but this function only ever runs in the browser.
export const openPaystackCheckout = async (options: {
  accessCode: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) => {
  const { default: PaystackPop } = await import("@paystack/inline-js");
  const popup = new PaystackPop();
  popup.resumeTransaction(options.accessCode, {
    onSuccess: (transaction) => options.onSuccess(transaction.reference),
    onCancel: options.onClose,
    onError: () => options.onClose(),
  });
};
