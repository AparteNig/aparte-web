"use client";

import PaystackPop from "@paystack/inline-js";

// Opens Paystack's payment popup for a transaction that was already
// initialized server-side (amounts are computed by the backend — the
// browser only ever presents the access code).
export const openPaystackCheckout = (options: {
  accessCode: string;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}) => {
  const popup = new PaystackPop();
  popup.resumeTransaction(options.accessCode, {
    onSuccess: (transaction) => options.onSuccess(transaction.reference),
    onCancel: options.onClose,
    onError: () => options.onClose(),
  });
};
