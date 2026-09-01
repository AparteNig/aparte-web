declare module "@paystack/inline-js" {
  export type PaystackTransactionCallback = {
    id: number;
    reference: string;
    message: string;
  };

  export type PaystackPopupCallbacks = {
    onSuccess?: (transaction: PaystackTransactionCallback) => void;
    onCancel?: () => void;
    onError?: (error: { message: string }) => void;
  };

  export default class PaystackPop {
    resumeTransaction(accessCode: string, callbacks?: PaystackPopupCallbacks): unknown;
  }
}
